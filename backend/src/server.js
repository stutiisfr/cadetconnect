const express = require('express');
const http = require('http');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');
const { WebSocketServer } = require('ws');
const { initSeedData } = require('./services/seedData');
const { initNeonAuthTables } = require('./db/dbInit');
const { migrateDataToNeon } = require('./db/dataMigrator');
const { JWT_SECRET } = require('./middleware/auth');
const { getNeonSql } = require('./db/neonDb');

const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');
const feedRoutes = require('./routes/feedRoutes');
const communityRoutes = require('./routes/communityRoutes');
const knowledgeRoutes = require('./routes/knowledgeRoutes');
const videoRoutes = require('./routes/videoRoutes');
const storyRoutes = require('./routes/storyRoutes');
const eventRoutes = require('./routes/eventRoutes');
const mentorshipRoutes = require('./routes/mentorshipRoutes');
const meetingRoutes = require('./routes/meetingRoutes');
const messageRoutes = require('./routes/messageRoutes');
const networkRoutes = require('./routes/networkRoutes');
const opportunityRoutes = require('./routes/opportunityRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const adminRoutes = require('./routes/adminRoutes');
const aiRoutes = require('./routes/aiRoutes');
const eligibilityRoutes = require('./routes/eligibilityRoutes');

const app = express();
const PORT = process.env.PORT || 5000;
const serverStartTime = Date.now();

// ───────────────────────────────────────────────────────────────
// Security & Headers Middleware
// ───────────────────────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));

const ALLOWED_ORIGINS = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',')
  : ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3000'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, true);
    }
  },
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate Limiters
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, error: 'Too many auth requests. Please try again later.' }
});

const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 10,
  message: { success: false, error: 'Too many OTP requests. Please wait 10 minutes.' }
});

app.use('/uploads', express.static(path.join(__dirname, '../data/uploads')));

// ───────────────────────────────────────────────────────────────
// Register API Routes
// ───────────────────────────────────────────────────────────────
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/send-otp', otpLimiter);
app.use('/api/auth/verify-otp', authLimiter);
app.use('/api/auth/register', authLimiter);

app.use('/api/auth', authRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/feed', feedRoutes);
app.use('/api/communities', communityRoutes);
app.use('/api/knowledge', knowledgeRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/stories', storyRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/mentorship', mentorshipRoutes);
app.use('/api/meetings', meetingRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/network', networkRoutes);
app.use('/api/opportunities', opportunityRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/eligibility', eligibilityRoutes);

// ───────────────────────────────────────────────────────────────
// Production Observability Health Check Endpoint
// ───────────────────────────────────────────────────────────────
app.get('/health', async (req, res) => {
  const sql = getNeonSql();
  let dbStatus = 'OFFLINE';
  if (sql) {
    try {
      await sql`SELECT 1`;
      dbStatus = 'NEON_POSTGRESQL_ONLINE';
    } catch (err) {
      dbStatus = 'NEON_ERROR: ' + err.message;
    }
  }

  res.json({
    status: 'ONLINE',
    platform: 'CadetConnect — Professional NCC & Defence Community Ecosystem',
    database: dbStatus,
    activeWebSocketClients: connectedClients.size,
    uptimeSeconds: Math.floor((Date.now() - serverStartTime) / 1000),
    timestamp: new Date().toISOString()
  });
});

app.get('/api/health', (req, res) => res.redirect('/health'));

// 404 Catch-All & Global Error Handler
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    error: `API endpoint not found: ${req.method} ${req.originalUrl}`
  });
});

app.use((err, req, res, _next) => {
  console.error('[UNHANDLED SERVER ERROR]', err.stack || err.message);
  res.status(err.status || 500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' ? 'Internal server error.' : err.message
  });
});

// ───────────────────────────────────────────────────────────────
// Authenticated WebSocket Gateway Infrastructure
// ───────────────────────────────────────────────────────────────
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const connectedClients = new Map(); // ws -> { userId, authenticatedAt }

function broadcastWebSocketEvent(eventData, recipientUserId = null) {
  const payload = JSON.stringify(eventData);
  connectedClients.forEach((meta, client) => {
    if (client.readyState === 1) { // 1 = OPEN
      // If targeted recipient specified, send only to matching client
      if (recipientUserId && meta.userId !== recipientUserId) return;
      client.send(payload);
    }
  });
}

app.set('broadcastWebSocketEvent', broadcastWebSocketEvent);

wss.on('connection', (ws, req) => {
  let userId = null;
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const token = url.searchParams.get('token');
    if (token) {
      const decoded = jwt.verify(token, JWT_SECRET);
      userId = decoded.id;
    }
  } catch (err) {
    // Unauthenticated client connection
  }

  connectedClients.set(ws, {
    userId,
    authenticatedAt: userId ? new Date().toISOString() : null
  });

  // Broadcast presence event if authenticated
  if (userId) {
    broadcastWebSocketEvent({
      type: 'USER_ONLINE',
      userId,
      timestamp: new Date().toISOString()
    });
  }

  ws.send(JSON.stringify({
    type: 'SYSTEM_STATUS',
    status: 'REALTIME_ACTIVE',
    authenticated: !!userId,
    timestamp: new Date().toISOString(),
    message: 'Connected to CadetConnect Real-Time Gateway'
  }));

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message.toString());
      if (userId && ['CHAT_MESSAGE', 'TYPING_START', 'TYPING_STOP', 'MESSAGE_READ', 'POST_REACTION', 'NOTIFICATION_READ'].includes(data.type)) {
        broadcastWebSocketEvent({ ...data, senderId: userId });
      }
    } catch (err) {
      console.error('WebSocket Message Error:', err.message);
    }
  });

  ws.on('close', () => {
    if (userId) {
      broadcastWebSocketEvent({
        type: 'USER_OFFLINE',
        userId,
        timestamp: new Date().toISOString()
      });
    }
    connectedClients.delete(ws);
  });

  ws.on('error', (err) => {
    console.error('WebSocket Client Error:', err.message);
    connectedClients.delete(ws);
  });
});

// Periodic Gazette Live Ticker Pulse (Every 15 Seconds)
const gazetteBulletins = [
  { id: 'gz-1', title: 'UPSC CDS II 2026: Application Portal Active — Last Date: 04 June 2026', authority: 'UPSC', urgency: 'HIGH' },
  { id: 'gz-2', title: 'SSC CGL 2026: 17,727 Official Vacancies Confirmed across Central Ministries', authority: 'SSC', urgency: 'MEDIUM' },
  { id: 'gz-3', title: 'Indian Army NCC 57th Course: Direct SSB Interview Selection Shortlist Out', authority: 'Indian Army', urgency: 'CRITICAL' },
  { id: 'gz-4', title: 'IAF AFCAT 01/2027: Air Force Flying & Technical Ground Duty Entry Announced', authority: 'Indian Air Force', urgency: 'HIGH' }
];
let gazetteIdx = 0;

setInterval(() => {
  const activeBulletin = gazetteBulletins[gazetteIdx % gazetteBulletins.length];
  gazetteIdx++;
  broadcastWebSocketEvent({
    type: 'GAZETTE_LIVE_TICKER',
    bulletin: activeBulletin,
    timestamp: new Date().toISOString(),
    activeCadetsOnline: connectedClients.size || 1
  });
}, 15000);

// ───────────────────────────────────────────────────────────────
// Boot Sequence: Seed Data -> Neon Schema Migration -> Data Migrator -> Listen
// ───────────────────────────────────────────────────────────────
initSeedData()
  .then(() => initNeonAuthTables())
  .then(() => migrateDataToNeon())
  .then(() => {
    server.listen(PORT, () => {
      console.log(`====================================================`);
      console.log(` CadetConnect Backend running on http://localhost:${PORT}`);
      console.log(` Real-time WebSocket Server active on ws://localhost:${PORT}`);
      console.log(` Database: Neon PostgreSQL Ready | Health Endpoint: GET /health`);
      console.log(`====================================================`);
    });
  })
  .catch(err => {
    console.error('Boot sequence failed:', err);
  });

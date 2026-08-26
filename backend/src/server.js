const express = require('express');
const http = require('http');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');
const { WebSocketServer } = require('ws');
const { initSeedData } = require('./services/seedData');
const { JWT_SECRET } = require('./middleware/auth');

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

// ───────────────────────────────────────────────────────────────
// Security Middleware
// ───────────────────────────────────────────────────────────────

// Helmet sets secure HTTP headers
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP for API-only server
  crossOriginEmbedderPolicy: false
}));

// CORS — restrict to known origins in production
const ALLOWED_ORIGINS = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',')
  : ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3000'];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, server-to-server, curl)
    if (!origin || ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, true); // In dev mode allow all; tighten for production
    }
  },
  credentials: true
}));

// Body parser with size limit to prevent payload attacks
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Rate limiting for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // 50 requests per window per IP
  message: { success: false, error: 'Too many requests. Please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false
});

// Stricter rate limit for OTP endpoints
const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 10, // 10 OTP requests per window per IP
  message: { success: false, error: 'Too many OTP requests. Please wait before trying again.' },
  standardHeaders: true,
  legacyHeaders: false
});

// Serve static uploaded media files if any
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

// Health Check
app.get('/', (req, res) => {
  res.json({
    status: 'ONLINE',
    platform: 'CadetConnect - NCC & Defence Community Platform',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    platform: 'CadetConnect - NCC & Defence Community Platform',
    timestamp: new Date().toISOString()
  });
});

// ───────────────────────────────────────────────────────────────
// 404 Catch-All & Global Error Handler
// ───────────────────────────────────────────────────────────────
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    error: `API endpoint not found: ${req.method} ${req.originalUrl}`
  });
});

app.use((err, req, res, _next) => {
  console.error('[UNHANDLED ERROR]', err.stack || err.message);
  res.status(err.status || 500).json({
    success: false,
    error: process.env.NODE_ENV === 'production'
      ? 'Internal server error.'
      : err.message || 'Internal server error.'
  });
});

// ───────────────────────────────────────────────────────────────
// Create HTTP Server & WebSocket Server
// ───────────────────────────────────────────────────────────────
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const connectedClients = new Map(); // ws -> { userId, authenticatedAt }

function broadcastWebSocketEvent(eventData) {
  const payload = JSON.stringify(eventData);
  connectedClients.forEach((meta, client) => {
    if (client.readyState === 1) { // 1 = OPEN
      client.send(payload);
    }
  });
}

app.set('broadcastWebSocketEvent', broadcastWebSocketEvent);

wss.on('connection', (ws, req) => {
  // Authenticate WebSocket connection via query param token
  let userId = null;
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const token = url.searchParams.get('token');
    if (token) {
      const decoded = jwt.verify(token, JWT_SECRET);
      userId = decoded.id;
    }
  } catch (err) {
    // Invalid token — allow connection but mark as unauthenticated
  }

  connectedClients.set(ws, {
    userId,
    authenticatedAt: userId ? new Date().toISOString() : null
  });
  
  // Send welcome real-time status message to newly connected client
  ws.send(JSON.stringify({
    type: 'SYSTEM_STATUS',
    status: 'REALTIME_ACTIVE',
    authenticated: !!userId,
    timestamp: new Date().toISOString(),
    message: 'Connected to CadetConnect Real-Time Eligibility & Gazette WebSocket Gateway'
  }));

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message.toString());
      // Only broadcast allowed event types from authenticated clients
      if (userId && ['CHAT_MESSAGE', 'TYPING_INDICATOR', 'ELIGIBILITY_PROFILE_UPDATE', 'EXAM_CHECK_REQUEST'].includes(data.type)) {
        broadcastWebSocketEvent({ ...data, senderId: userId });
      }
    } catch (err) {
      console.error('WebSocket Message Error:', err.message);
    }
  });

  ws.on('close', () => {
    connectedClients.delete(ws);
  });

  ws.on('error', (err) => {
    console.error('WebSocket Client Error:', err.message);
    connectedClients.delete(ws);
  });
});

// Periodic Real-time Gazette Ticker & Countdown Pulse (Every 12 Seconds)
const gazetteBulletins = [
  { id: 'gz-1', title: 'UPSC CDS II 2026: Application Portal Active — Last Date: 04 June 2026', authority: 'UPSC', urgency: 'HIGH' },
  { id: 'gz-2', title: 'SSC CGL 2026: 17,727 Official Vacancies Confirmed across Central Ministries', authority: 'SSC', urgency: 'MEDIUM' },
  { id: 'gz-3', title: 'Indian Army NCC 57th Course: Direct SSB Interview Selection Shortlist Out', authority: 'Indian Army', urgency: 'CRITICAL' },
  { id: 'gz-4', title: 'IAF AFCAT 01/2027: Air Force Flying & Technical Ground Duty Entry Announced', authority: 'Indian Air Force', urgency: 'HIGH' },
  { id: 'gz-5', title: 'IBPS PO XIV: Preliminary Admit Cards Available for 11 Participating Banks', authority: 'IBPS', urgency: 'MEDIUM' }
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
}, 12000);

// ───────────────────────────────────────────────────────────────
// Boot Database & Start Server
// ───────────────────────────────────────────────────────────────
initSeedData().then(() => {
  server.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(` CadetConnect Backend running on http://localhost:${PORT}`);
    console.log(` Real-time WebSocket Server active on ws://localhost:${PORT}`);
    console.log(` Security: Helmet ON | Rate Limiting ON | Body Limit 1MB`);
    console.log(`====================================================`);
  });
}).catch(err => {
  console.error('Failed to initialize seed data:', err);
});

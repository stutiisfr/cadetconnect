const express = require('express');
const http = require('http');
const cors = require('cors');
const path = require('path');
const { WebSocketServer } = require('ws');
const { initSeedData } = require('./services/seedData');

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

const app = express();
const PORT = process.env.PORT || 5000;

// Express Middleware
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploaded media files if any
app.use('/uploads', express.static(path.join(__dirname, '../data/uploads')));

// Register API Routes
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

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    platform: 'CadetConnect - NCC & Defence Community Platform',
    timestamp: new Date().toISOString()
  });
});

// Create HTTP Server & WebSocket Server
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const connectedClients = new Set();

wss.on('connection', (ws) => {
  connectedClients.add(ws);

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message.toString());
      // Broadcast chat messages to all connected WebSocket clients
      if (data.type === 'CHAT_MESSAGE' || data.type === 'TYPING_INDICATOR') {
        connectedClients.forEach((client) => {
          if (client !== ws && client.readyState === 1) {
            client.send(JSON.stringify(data));
          }
        });
      }
    } catch (err) {
      console.error('WebSocket Error:', err.message);
    }
  });

  ws.on('close', () => {
    connectedClients.delete(ws);
  });
});

// Boot Database & Start Server
initSeedData().then(() => {
  server.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(` CadetConnect Backend running on http://localhost:${PORT}`);
    console.log(` Real-time WebSocket Server active on ws://localhost:${PORT}`);
    console.log(`====================================================`);
  });
}).catch(err => {
  console.error('Failed to initialize seed data:', err);
});

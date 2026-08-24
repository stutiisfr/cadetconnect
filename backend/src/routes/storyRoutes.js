const express = require('express');
const db = require('../db/database');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// Get Active 24h Stories
router.get('/', (req, res) => {
  const now = new Date().toISOString();
  // Filter out expired stories
  const stories = db.find('stories', s => s.expiresAt > now);
  return res.json({ success: true, count: stories.length, stories });
});

// Post 24h Story
router.post('/create', verifyToken, (req, res) => {
  const { mediaUrl, caption } = req.body;
  if (!mediaUrl) {
    return res.status(400).json({ success: false, error: 'Media URL required for story.' });
  }

  const user = db.findOne('users', u => u.id === req.user.id);
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  const story = db.insert('stories', {
    authorId: user.id,
    authorName: user.name,
    authorAvatar: user.avatar,
    mediaUrl,
    caption: caption || '',
    createdAt: now.toISOString(),
    expiresAt: expiresAt.toISOString()
  });

  return res.status(201).json({ success: true, story });
});

module.exports = router;

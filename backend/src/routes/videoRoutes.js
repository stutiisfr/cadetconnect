const express = require('express');
const db = require('../db/database');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// List Videos
router.get('/', (req, res) => {
  const { category, search } = req.query;
  let videos = db.find('videos');

  if (category && category !== 'All') {
    videos = videos.filter(v => v.category === category);
  }
  if (search) {
    const q = search.toLowerCase();
    videos = videos.filter(v => v.title.toLowerCase().includes(q) || v.description.toLowerCase().includes(q));
  }

  return res.json({ success: true, count: videos.length, videos });
});

// Upload Video
router.post('/upload', verifyToken, (req, res) => {
  const { title, category, videoUrl, thumbnailUrl, description, duration } = req.body;
  if (!title || !category || !videoUrl) {
    return res.status(400).json({ success: false, error: 'Title, category, and video URL are required.' });
  }

  const user = db.findOne('users', u => u.id === req.user.id);
  const video = db.insert('videos', {
    title,
    category,
    videoUrl,
    thumbnailUrl: thumbnailUrl || 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=800&auto=format&fit=crop&q=80',
    authorId: user.id,
    authorName: user.name,
    duration: duration || '03:30',
    viewsCount: 1,
    likesCount: 0,
    description: description || ''
  });

  return res.status(201).json({ success: true, video });
});

module.exports = router;

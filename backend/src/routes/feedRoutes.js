const express = require('express');
const db = require('../db/database');
const { verifyToken, getOptionalUser } = require('../middleware/auth');

const router = express.Router();

// 1. Get Home Feed with Category & Search Filter (public read)
router.get('/', (req, res) => {
  const { category, search } = req.query;
  let posts = db.find('posts');

  if (category && category !== 'For You' && category !== 'All') {
    posts = posts.filter(p => p.category === category);
  }

  if (search) {
    const q = search.toLowerCase();
    posts = posts.filter(p => 
      p.content.toLowerCase().includes(q) ||
      p.authorName.toLowerCase().includes(q) ||
      (p.tags && p.tags.some(t => t.toLowerCase().includes(q)))
    );
  }

  return res.json({
    success: true,
    count: posts.length,
    posts
  });
});

// 2. Create Feed Post — REQUIRES AUTHENTICATION
router.post('/create', verifyToken, (req, res) => {
  const { content, category, mediaUrl, tags } = req.body;
  if (!content || !content.trim()) {
    return res.status(400).json({ success: false, error: 'Post content cannot be empty.' });
  }

  const user = db.findOne('users', u => u.id === req.user.id);
  if (!user) {
    return res.status(401).json({ success: false, error: 'User not found.' });
  }

  const post = db.insert('posts', {
    authorId: user.id,
    authorName: user.name,
    authorRole: user.verificationBadge || user.role,
    authorAvatar: user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    category: category || 'NCC',
    content: content.trim(),
    mediaUrl: mediaUrl || null,
    appreciationsCount: 0,
    commentsCount: 0,
    repostsCount: 0,
    savedCount: 0,
    tags: Array.isArray(tags) ? tags : ['CadetConnect', (category || 'Defence').replace(/\s+/g, '')],
    createdAt: new Date().toISOString()
  });

  // Real-Time WebSocket Broadcast to all connected clients
  const broadcastFn = req.app.get('broadcastWebSocketEvent');
  if (broadcastFn) {
    broadcastFn({
      type: 'NEW_FEED_POST',
      post,
      timestamp: new Date().toISOString()
    });
  }

  return res.status(201).json({
    success: true,
    message: 'Post created & broadcast in real time across CadetConnect ecosystem.',
    post
  });
});

// 3. "Appreciate" Post — REQUIRES AUTHENTICATION
router.post('/:id/appreciate', verifyToken, (req, res) => {
  const postId = req.params.id;
  const post = db.findOne('posts', p => p.id === postId);
  if (!post) return res.status(404).json({ success: false, error: 'Post not found.' });

  const updatedCount = (post.appreciationsCount || 0) + 1;
  db.update('posts', p => p.id === postId, { appreciationsCount: updatedCount });

  const actorName = req.user.name || req.user.username || 'A Defence Aspirant';

  // Real-Time WebSocket Event
  const broadcastFn = req.app.get('broadcastWebSocketEvent');
  if (broadcastFn) {
    broadcastFn({
      type: 'POST_APPRECIATED',
      postId,
      appreciationsCount: updatedCount,
      actorName,
      timestamp: new Date().toISOString()
    });
  }

  return res.json({
    success: true,
    appreciationsCount: updatedCount
  });
});

// 4. Add Comment — REQUIRES AUTHENTICATION
router.post('/:id/comment', verifyToken, (req, res) => {
  const postId = req.params.id;
  const { text } = req.body;
  if (!text || !text.trim()) return res.status(400).json({ success: false, error: 'Comment text required.' });

  const user = db.findOne('users', u => u.id === req.user.id);

  const comment = db.insert('comments', {
    postId,
    authorId: req.user.id,
    authorName: user ? user.name : req.user.username,
    authorAvatar: user ? user.avatar : '',
    text: text.trim(),
    createdAt: new Date().toISOString()
  });

  const post = db.findOne('posts', p => p.id === postId);
  let updatedCommentsCount = 0;
  if (post) {
    updatedCommentsCount = (post.commentsCount || 0) + 1;
    db.update('posts', p => p.id === postId, { commentsCount: updatedCommentsCount });
  }

  // Real-Time WebSocket Event Broadcast
  const broadcastFn = req.app.get('broadcastWebSocketEvent');
  if (broadcastFn) {
    broadcastFn({
      type: 'NEW_POST_COMMENT',
      postId,
      comment,
      commentsCount: updatedCommentsCount,
      timestamp: new Date().toISOString()
    });
  }

  return res.status(201).json({
    success: true,
    comment,
    commentsCount: updatedCommentsCount
  });
});

// 5. Get Comments for Post (public read)
router.get('/:id/comments', (req, res) => {
  const comments = db.find('comments', c => c.postId === req.params.id);
  return res.json({ success: true, comments });
});

// 6. Save Post — REQUIRES AUTHENTICATION
router.post('/:id/save', verifyToken, (req, res) => {
  const postId = req.params.id;
  db.insert('saved_items', {
    userId: req.user.id,
    targetType: 'POST',
    targetId: postId
  });
  return res.json({ success: true, message: 'Post saved to your bookmarks.' });
});

module.exports = router;

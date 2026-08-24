const express = require('express');
const db = require('../db/database');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// Get Home Feed with Category Filter
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

// Create Feed Post
router.post('/create', verifyToken, (req, res) => {
  const { content, category, mediaUrl, tags } = req.body;
  if (!content) {
    return res.status(400).json({ success: false, error: 'Post content cannot be empty.' });
  }

  const user = db.findOne('users', u => u.id === req.user.id);
  const post = db.insert('posts', {
    authorId: user.id,
    authorName: user.name,
    authorRole: user.verificationBadge || user.role,
    authorAvatar: user.avatar,
    category: category || 'NCC',
    content,
    mediaUrl: mediaUrl || null,
    appreciationsCount: 0,
    commentsCount: 0,
    repostsCount: 0,
    savedCount: 0,
    tags: Array.isArray(tags) ? tags : []
  });

  return res.status(201).json({
    success: true,
    message: 'Post created successfully.',
    post
  });
});

// "Appreciate" Post (Custom defence terminology for Like)
router.post('/:id/appreciate', verifyToken, (req, res) => {
  const postId = req.params.id;
  const post = db.findOne('posts', p => p.id === postId);
  if (!post) return res.status(404).json({ success: false, error: 'Post not found.' });

  const updatedCount = (post.appreciationsCount || 0) + 1;
  db.update('posts', p => p.id === postId, { appreciationsCount: updatedCount });

  // Add notification to post author if not self
  if (post.authorId !== req.user.id) {
    const actor = db.findOne('users', u => u.id === req.user.id);
    db.insert('notifications', {
      userId: post.authorId,
      actorName: actor ? actor.name : 'A member',
      actorAvatar: actor ? actor.avatar : '',
      type: 'POST_APPRECIATION',
      message: `${actor ? actor.name : 'Someone'} appreciated your post in ${post.category}.`,
      isRead: false
    });
  }

  return res.json({
    success: true,
    appreciationsCount: updatedCount
  });
});

// Add Comment
router.post('/:id/comment', verifyToken, (req, res) => {
  const postId = req.params.id;
  const { text } = req.body;
  if (!text) return res.status(400).json({ success: false, error: 'Comment text required.' });

  const user = db.findOne('users', u => u.id === req.user.id);
  const comment = db.insert('comments', {
    postId,
    authorId: user.id,
    authorName: user.name,
    authorAvatar: user.avatar,
    text
  });

  const post = db.findOne('posts', p => p.id === postId);
  if (post) {
    db.update('posts', p => p.id === postId, { commentsCount: (post.commentsCount || 0) + 1 });
  }

  return res.status(201).json({
    success: true,
    comment
  });
});

// Get Comments for Post
router.get('/:id/comments', (req, res) => {
  const comments = db.find('comments', c => c.postId === req.params.id);
  return res.json({ success: true, comments });
});

// Save Post
router.post('/:id/save', verifyToken, (req, res) => {
  const postId = req.params.id;
  db.insert('saved_items', {
    userId: req.user.id,
    targetType: 'POST',
    targetId: postId
  });
  return res.json({ success: true, message: 'Post saved to your personal dashboard.' });
});

// Report Post
router.post('/:id/report', verifyToken, (req, res) => {
  const { reason } = req.body;
  db.insert('reports', {
    reporterId: req.user.id,
    targetType: 'POST',
    targetId: req.params.id,
    reason: reason || 'Inappropriate or unverified content',
    status: 'PENDING'
  });
  return res.json({ success: true, message: 'Report submitted for admin review.' });
});

module.exports = router;

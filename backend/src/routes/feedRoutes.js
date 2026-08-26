const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const db = require('../db/database');
const pgRepository = require('../db/pgRepository');
const { verifyToken, getOptionalUser } = require('../middleware/auth');

const router = express.Router();

// Configure multer storage for post attachment uploads
const uploadDir = path.join(__dirname, '../../data/uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `media_${Date.now()}_${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('application/pdf') || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image, PDF, and video files are allowed.'));
    }
  }
});

// File Upload Endpoint for Post Attachments & Media
router.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, error: 'No file uploaded.' });
  }
  // Construct relative / uploads path
  const fileUrl = `/uploads/${req.file.filename}`;
  return res.json({
    success: true,
    fileUrl,
    filename: req.file.filename,
    originalName: req.file.originalname,
    mimetype: req.file.mimetype,
    size: req.file.size
  });
});

// 1. Get Home Feed with Category, Search Filter & Pagination (public read)
router.get('/', async (req, res) => {
  const { category, search, limit = 20, offset = 0 } = req.query;
  try {
    const posts = await pgRepository.getPosts({
      category,
      search,
      limit: parseInt(limit) || 20,
      offset: parseInt(offset) || 0
    });

    return res.json({
      success: true,
      count: posts.length,
      posts
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// 2. Create Feed Post — REQUIRES AUTHENTICATION
router.post('/create', verifyToken, async (req, res) => {
  const { content, category, mediaUrl, tags } = req.body;
  if (!content || !content.trim()) {
    return res.status(400).json({ success: false, error: 'Post content cannot be empty.' });
  }

  try {
    const post = await pgRepository.createPost(req.user.id, {
      content: content.trim(),
      category: category || 'NCC',
      mediaUrl: mediaUrl || null,
      tags
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
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
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

// 7. Delete Post — Author or Admin
router.delete('/:id', verifyToken, async (req, res) => {
  const postId = req.params.id;
  const isAdmin = req.user.role === 'ADMIN' || req.user.role === 'SUPER_ADMIN';

  try {
    const success = await pgRepository.deletePost(postId, req.user.id, isAdmin);
    
    // Broadcast real-time deletion
    const broadcastFn = req.app.get('broadcastWebSocketEvent');
    if (broadcastFn) {
      broadcastFn({
        type: 'POST_DELETED',
        postId,
        timestamp: new Date().toISOString()
      });
    }

    return res.json({ success: true, message: 'Post deleted successfully.' });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// 8. Edit / Update Post Content — Author
router.put('/:id', verifyToken, async (req, res) => {
  const postId = req.params.id;
  const { content, category } = req.body;
  if (!content || !content.trim()) {
    return res.status(400).json({ success: false, error: 'Post content cannot be empty.' });
  }

  try {
    const sql = require('../db/neonDb').getNeonSql();
    if (sql) {
      await sql`
        UPDATE posts SET content = ${content.trim()}, category = COALESCE(${category || null}, category), updated_at = NOW()
        WHERE id = ${postId} AND (author_id = ${req.user.id} OR ${req.user.role === 'ADMIN'})
      `;
    }
    db.update('posts', p => p.id === postId, { content: content.trim(), ...(category && { category }) });

    return res.json({ success: true, message: 'Post updated successfully.' });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;

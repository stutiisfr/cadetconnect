const express = require('express');
const db = require('../db/database');
const { verifyToken } = require('../middleware/auth');
const { getNeonSql } = require('../db/neonDb');

const router = express.Router();

// Get Active 24h Stories
router.get('/', async (req, res) => {
  const sql = getNeonSql();
  const nowStr = new Date().toISOString();

  if (sql) {
    try {
      // Create stories table in PG if not exists
      await sql`
        CREATE TABLE IF NOT EXISTS stories (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          author_id UUID REFERENCES users(id) ON DELETE CASCADE,
          author_name VARCHAR(255) NOT NULL,
          author_avatar TEXT,
          media_url TEXT NOT NULL,
          caption TEXT,
          created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
          expires_at TIMESTAMPTZ NOT NULL
        );
      `;
      const rows = await sql`
        SELECT * FROM stories WHERE expires_at > NOW() ORDER BY created_at DESC
      `;
      if (rows.length > 0) {
        return res.json({
          success: true,
          count: rows.length,
          stories: rows.map(r => ({
            id: r.id,
            authorId: r.author_id,
            authorName: r.author_name,
            authorAvatar: r.author_avatar,
            mediaUrl: r.media_url,
            caption: r.caption,
            createdAt: r.created_at,
            expiresAt: r.expires_at
          }))
        });
      }
    } catch (err) {
      console.error('[STORIES PG ERROR]', err.message);
    }
  }

  // Fallback to memory / seed stories
  let stories = db.find('stories', s => new Date(s.expiresAt || Date.now() + 86400000) > new Date());
  
  if (stories.length === 0) {
    const expires = new Date(Date.now() + 24 * 3600 * 1000).toISOString();
    const s1 = db.insert('stories', {
      authorId: 'usr-cadet-rahul',
      authorName: 'Rahul Das (SUO)',
      authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
      mediaUrl: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=800&auto=format&fit=crop&q=80',
      caption: '🪖 Republic Day Camp 2026 Drill Practice at Garrison Ground!',
      createdAt: new Date().toISOString(),
      expiresAt: expires
    });

    const s2 = db.insert('stories', {
      authorId: 'usr-mentor-vikram',
      authorName: 'Col. Vikram Rathore',
      authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
      mediaUrl: 'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=800&auto=format&fit=crop&q=80',
      caption: '🎖️ SSB Stage II GTO Obstacle Course Guidance Session Today 5 PM.',
      createdAt: new Date().toISOString(),
      expiresAt: expires
    });
    stories = [s1, s2];
  }

  return res.json({ success: true, count: stories.length, stories });
});

// Post 24h Story
router.post('/create', verifyToken, async (req, res) => {
  const { mediaUrl, caption } = req.body;
  if (!mediaUrl) {
    return res.status(400).json({ success: false, error: 'Media URL required for story.' });
  }

  const user = db.findOne('users', u => u.id === req.user.id);
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const sql = getNeonSql();

  let storyObj = null;

  if (sql) {
    try {
      const rows = await sql`
        INSERT INTO stories (
          author_id, author_name, author_avatar, media_url, caption, expires_at
        ) VALUES (
          ${req.user.id}, ${user ? user.name : req.user.username}, 
          ${user ? user.avatar : ''}, ${mediaUrl}, ${caption || ''}, ${expiresAt.toISOString()}
        ) RETURNING *
      `;
      storyObj = {
        id: rows[0].id,
        authorId: rows[0].author_id,
        authorName: rows[0].author_name,
        authorAvatar: rows[0].author_avatar,
        mediaUrl: rows[0].media_url,
        caption: rows[0].caption,
        createdAt: rows[0].created_at,
        expiresAt: rows[0].expires_at
      };
    } catch (err) {
      console.error('[STORY CREATE PG ERROR]', err.message);
    }
  }

  if (!storyObj) {
    storyObj = db.insert('stories', {
      authorId: req.user.id,
      authorName: user ? user.name : req.user.username,
      authorAvatar: user ? user.avatar : '',
      mediaUrl,
      caption: caption || '',
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString()
    });
  }

  // Real-time WebSocket Event Broadcast
  const broadcastFn = req.app.get('broadcastWebSocketEvent');
  if (broadcastFn) {
    broadcastFn({
      type: 'NEW_STORY',
      story: storyObj,
      timestamp: new Date().toISOString()
    });
  }

  return res.status(201).json({ success: true, story: storyObj });
});

// Delete Story — Author
router.delete('/:id', verifyToken, async (req, res) => {
  const storyId = req.params.id;
  const sql = getNeonSql();

  if (sql) {
    try {
      await sql`DELETE FROM stories WHERE id = ${storyId} AND author_id = ${req.user.id}`;
    } catch (err) {
      console.error(err);
    }
  }
  db.delete('stories', s => s.id === storyId && s.authorId === req.user.id);

  return res.json({ success: true, message: 'Story deleted.' });
});

module.exports = router;

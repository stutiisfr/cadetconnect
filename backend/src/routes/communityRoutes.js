const express = require('express');
const db = require('../db/database');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// List Communities
router.get('/', (req, res) => {
  const { category, search } = req.query;
  let communities = db.find('communities');

  if (category && category !== 'All') {
    communities = communities.filter(c => c.category === category);
  }
  if (search) {
    const q = search.toLowerCase();
    communities = communities.filter(c => c.name.toLowerCase().includes(q) || c.description.toLowerCase().includes(q));
  }

  return res.json({ success: true, count: communities.length, communities });
});

// Community Detail
router.get('/:id', (req, res) => {
  const comm = db.findOne('communities', c => c.id === req.params.id);
  if (!comm) return res.status(404).json({ success: false, error: 'Community not found.' });

  const members = db.find('community_members', m => m.communityId === comm.id);
  const posts = db.find('posts', p => p.category === comm.name || p.communityId === comm.id);

  return res.json({
    success: true,
    community: comm,
    membersCount: members.length || comm.membersCount,
    posts
  });
});

// Join Community
router.post('/:id/join', verifyToken, (req, res) => {
  const commId = req.params.id;
  const existing = db.findOne('community_members', m => m.communityId === commId && m.userId === req.user.id);
  if (existing) return res.json({ success: true, message: 'Already a member.' });

  db.insert('community_members', {
    communityId: commId,
    userId: req.user.id,
    role: 'MEMBER',
    joinedAt: new Date().toISOString()
  });

  const comm = db.findOne('communities', c => c.id === commId);
  if (comm) {
    db.update('communities', c => c.id === commId, { membersCount: (comm.membersCount || 0) + 1 });
  }

  return res.json({ success: true, message: 'Successfully joined community.' });
});

// Create Community
router.post('/create', verifyToken, (req, res) => {
  const { name, category, description, banner, avatar, isPrivate, rules } = req.body;
  if (!name || !description) {
    return res.status(400).json({ success: false, error: 'Name and description required.' });
  }

  const comm = db.insert('communities', {
    name,
    category: category || 'NCC',
    description,
    banner: banner || 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=1000&auto=format&fit=crop&q=80',
    avatar: avatar || 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=300&auto=format&fit=crop&q=80',
    membersCount: 1,
    creatorId: req.user.id,
    isPrivate: !!isPrivate,
    rules: rules || 'Follow community decorum and defence community standards.'
  });

  db.insert('community_members', {
    communityId: comm.id,
    userId: req.user.id,
    role: 'ADMIN',
    joinedAt: new Date().toISOString()
  });

  return res.status(201).json({ success: true, community: comm });
});

module.exports = router;

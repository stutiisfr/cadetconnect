const express = require('express');
const db = require('../db/database');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// Discover Verified Mentors ("Guidance from Experience")
router.get('/', (req, res) => {
  const { expertise, search } = req.query;
  let mentors = db.find('users', u => u.role === 'MENTOR' || u.role === 'VETERAN');

  const mentorList = mentors.map(m => {
    const prof = db.findOne('mentor_profiles', p => p.userId === m.id) || {};
    const { password: _, ...pub } = m;
    return { ...pub, profile: prof };
  });

  let filtered = mentorList;
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(m => m.name.toLowerCase().includes(q) || m.bio.toLowerCase().includes(q));
  }

  return res.json({ success: true, count: filtered.length, mentors: filtered });
});

// Get Mentor Detail
router.get('/:id', (req, res) => {
  const user = db.findOne('users', u => u.id === req.params.id);
  if (!user) return res.status(404).json({ success: false, error: 'Mentor not found.' });

  const prof = db.findOne('mentor_profiles', p => p.userId === user.id);
  const { password: _, ...pub } = user;

  return res.json({
    success: true,
    mentor: {
      ...pub,
      profile: prof
    }
  });
});

// Request Mentorship Session
router.post('/:id/request', verifyToken, (req, res) => {
  const mentorId = req.params.id;
  const { topic, preferredDate, preferredTime, notes } = req.body;

  if (!topic || !preferredDate) {
    return res.status(400).json({ success: false, error: 'Topic and preferred date are required.' });
  }

  const mentor = db.findOne('users', u => u.id === mentorId);
  if (!mentor) return res.status(404).json({ success: false, error: 'Mentor not found.' });

  const cadet = db.findOne('users', u => u.id === req.user.id);

  const request = db.insert('mentorship_requests', {
    mentorId,
    mentorName: mentor.name,
    cadetId: req.user.id,
    cadetName: cadet ? cadet.name : 'Cadet/Aspirant',
    cadetAvatar: cadet ? cadet.avatar : '',
    topic,
    preferredDate,
    preferredTime: preferredTime || '17:00 IST',
    notes: notes || '',
    status: 'PENDING'
  });

  // Notify Mentor
  db.insert('notifications', {
    userId: mentorId,
    actorName: cadet ? cadet.name : 'Cadet/Aspirant',
    actorAvatar: cadet ? cadet.avatar : '',
    type: 'MENTORSHIP_REQUEST',
    message: `${cadet ? cadet.name : 'A cadet'} requested a mentorship session regarding "${topic}".`,
    isRead: false
  });

  return res.status(201).json({
    success: true,
    message: 'Mentorship request submitted. The mentor will review and schedule your session.',
    request
  });
});

module.exports = router;

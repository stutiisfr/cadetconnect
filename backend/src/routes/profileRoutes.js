const express = require('express');
const db = require('../db/database');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// Get Public Profile by Username or ID
router.get('/:username', (req, res) => {
  const param = req.params.username;
  const user = db.findOne('users', u => u.username === param || u.id === param);
  if (!user) {
    return res.status(404).json({ success: false, error: 'Profile not found.' });
  }

  const { password: _, ...publicUser } = user;

  let cadetDetails = null;
  let aspirantDetails = null;
  let mentorDetails = null;

  if (user.role === 'CADET') {
    const cp = db.findOne('cadet_profiles', p => p.userId === user.id);
    if (cp) {
      // PRIVACY RULE: Strip out private regimental number!
      const { regimentalNumber, ...cpPublic } = cp;
      cadetDetails = cpPublic;
    }
  } else if (user.role === 'ASPIRANT') {
    aspirantDetails = db.findOne('aspirant_profiles', p => p.userId === user.id);
  } else if (user.role === 'MENTOR') {
    mentorDetails = db.findOne('mentor_profiles', p => p.userId === user.id);
  }

  // Visual NCC Journey & Achievements
  const achievements = db.find('achievements', a => a.userId === user.id);
  const posts = db.find('posts', p => p.authorId === user.id);
  const notes = db.find('notes', n => n.authorId === user.id);

  return res.json({
    success: true,
    profile: {
      ...publicUser,
      cadetDetails,
      aspirantDetails,
      mentorDetails,
      achievements,
      posts,
      notes
    }
  });
});

// Update Profile
router.put('/me/update', verifyToken, (req, res) => {
  const { name, bio, location, avatar, phone, college, course } = req.body;
  
  db.update('users', u => u.id === req.user.id, {
    ...(name && { name }),
    ...(bio && { bio }),
    ...(location && { location }),
    ...(avatar && { avatar }),
    ...(phone && { phone }),
    ...(college && { college }),
    ...(course && { course })
  });

  const updatedUser = db.findOne('users', u => u.id === req.user.id);
  const { password: _, ...publicUser } = updatedUser;

  return res.json({
    success: true,
    message: 'Profile updated successfully.',
    user: publicUser
  });
});

// Add NCC Journey Milestone (Visual Timeline)
router.post('/me/journey', verifyToken, (req, res) => {
  const { year, title, detail, category } = req.body;
  if (!year || !title) {
    return res.status(400).json({ success: false, error: 'Year and title are required.' });
  }

  const newItem = db.insert('achievements', {
    userId: req.user.id,
    year,
    title,
    detail: detail || '',
    category: category || 'Camp'
  });

  return res.status(201).json({
    success: true,
    message: 'Journey milestone added to visual timeline.',
    item: newItem
  });
});

// Digital Identity Card Data
router.get('/me/card-data', verifyToken, (req, res) => {
  const user = db.findOne('users', u => u.id === req.user.id);
  if (!user) return res.status(404).json({ success: false, error: 'User not found.' });

  let rankOrTarget = 'Defence Community Member';
  let unitOrDept = user.college || 'CadetConnect Network';

  if (user.role === 'CADET') {
    const cp = db.findOne('cadet_profiles', p => p.userId === user.id);
    if (cp) {
      rankOrTarget = cp.rank || 'Cadet';
      unitOrDept = `${cp.unit || 'NCC Unit'} (${cp.directorate || 'Directorate'})`;
    }
  } else if (user.role === 'ASPIRANT') {
    const ap = db.findOne('aspirant_profiles', p => p.userId === user.id);
    if (ap) {
      rankOrTarget = `Aspirant (${(ap.targetExams || []).join(', ')})`;
      unitOrDept = ap.preferredService || 'Defence Forces';
    }
  } else if (user.role === 'MENTOR') {
    rankOrTarget = 'Defence Mentor';
  }

  return res.json({
    success: true,
    cardData: {
      name: user.name,
      username: user.username,
      role: user.role,
      verificationBadge: user.verificationBadge,
      avatar: user.avatar,
      rankOrTarget,
      unitOrDept,
      college: user.college,
      publicProfileUrl: `http://localhost:5173/profile/${user.username}`,
      qrPayload: `CADETCONNECT:${user.username}:${user.role}`
    }
  });
});

module.exports = router;

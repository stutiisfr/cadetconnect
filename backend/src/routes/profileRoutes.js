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
      const { regimentalNumber, ...cpPublic } = cp;
      cadetDetails = cpPublic;
    }
  } else if (user.role === 'ASPIRANT') {
    aspirantDetails = db.findOne('aspirant_profiles', p => p.userId === user.id);
  } else if (user.role === 'MENTOR') {
    mentorDetails = db.findOne('mentor_profiles', p => p.userId === user.id);
  }

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

// Update Comprehensive Personal & Role Details
router.put('/me/update', verifyToken, (req, res) => {
  const { 
    name, bio, location, avatar, phone, gender, dob, college, course, year,
    directorate, group, unit, battalion, wing, rank, certificateStatus, regimentalNumber,
    targetExams, preferredService, prepLevel, skills, interests
  } = req.body;

  // 1. Update Core User Details
  db.update('users', u => u.id === req.user.id, {
    ...(name && { name }),
    ...(bio && { bio }),
    ...(location && { location }),
    ...(avatar && { avatar }),
    ...(phone && { phone }),
    ...(gender && { gender }),
    ...(dob && { dob }),
    ...(college && { college }),
    ...(course && { course }),
    ...(year && { year })
  });

  const user = db.findOne('users', u => u.id === req.user.id);

  // 2. Update Role Specific Profile
  if (user.role === 'CADET') {
    let cp = db.findOne('cadet_profiles', p => p.userId === user.id);
    const updateData = {
      ...(directorate && { directorate }),
      ...(group && { group }),
      ...(unit && { unit }),
      ...(battalion && { battalion }),
      ...(wing && { wing }),
      ...(rank && { rank }),
      ...(certificateStatus && { certificateStatus }),
      ...(regimentalNumber && { regimentalNumber }),
      ...(Array.isArray(skills) && { skills }),
      ...(Array.isArray(interests) && { interests })
    };

    if (cp) {
      db.update('cadet_profiles', p => p.userId === user.id, updateData);
    } else {
      db.insert('cadet_profiles', { userId: user.id, ...updateData });
    }
  } else if (user.role === 'ASPIRANT') {
    let ap = db.findOne('aspirant_profiles', p => p.userId === user.id);
    const updateData = {
      ...(Array.isArray(targetExams) && { targetExams }),
      ...(preferredService && { preferredService }),
      ...(prepLevel && { prepLevel }),
      ...(Array.isArray(skills) && { skills }),
      ...(Array.isArray(interests) && { interests })
    };

    if (ap) {
      db.update('aspirant_profiles', p => p.userId === user.id, updateData);
    } else {
      db.insert('aspirant_profiles', { userId: user.id, ...updateData });
    }
  }

  // Real-Time WebSocket Notification of Profile Update
  const broadcastFn = req.app.get('broadcastWebSocketEvent');
  if (broadcastFn) {
    broadcastFn({
      type: 'PROFILE_UPDATED',
      userId: user.id,
      name: user.name,
      timestamp: new Date().toISOString()
    });
  }

  const updatedUser = db.findOne('users', u => u.id === req.user.id);
  const { password: _, ...publicUser } = updatedUser;

  return res.json({
    success: true,
    message: 'Personal details & profile updated successfully in real time.',
    user: publicUser
  });
});

// Add NCC Journey Milestone
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

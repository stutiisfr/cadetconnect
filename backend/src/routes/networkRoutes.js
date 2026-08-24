const express = require('express');
const db = require('../db/database');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// Get Network Connections & Suggestions
router.get('/suggestions', verifyToken, (req, res) => {
  const userId = req.user.id;
  const user = db.findOne('users', u => u.id === userId);
  const allUsers = db.find('users', u => u.id !== userId);

  let cadetProf = null;
  let aspirantProf = null;

  if (user && user.role === 'CADET') {
    cadetProf = db.findOne('cadet_profiles', p => p.userId === userId);
  } else if (user && user.role === 'ASPIRANT') {
    aspirantProf = db.findOne('aspirant_profiles', p => p.userId === userId);
  }

  // Filter recommendations based on matching Directorate, Unit, or Target Exam
  const suggestions = allUsers.map(u => {
    let reason = 'Member of Defence Community';
    if (user && user.role === 'CADET' && u.role === 'CADET') {
      const otherCp = db.findOne('cadet_profiles', p => p.userId === u.id);
      if (cadetProf && otherCp) {
        if (otherCp.directorate === cadetProf.directorate) {
          reason = `Cadet from your Directorate (${cadetProf.directorate})`;
        } else if (otherCp.unit === cadetProf.unit) {
          reason = `Cadet from your Unit (${cadetProf.unit})`;
        }
      }
    } else if (user && user.role === 'ASPIRANT' && u.role === 'ASPIRANT') {
      const otherAp = db.findOne('aspirant_profiles', p => p.userId === u.id);
      if (aspirantProf && otherAp) {
        reason = `Aspirant preparing for ${aspirantProf.preferredService || 'Defence Entries'}`;
      }
    } else if (u.role === 'MENTOR') {
      reason = 'Verified Defence Mentor';
    }

    const { password: _, ...pub } = u;
    return { ...pub, recommendationReason: reason };
  });

  return res.json({ success: true, count: suggestions.length, suggestions });
});

// Send Connection Request
router.post('/connect/:targetId', verifyToken, (req, res) => {
  const targetId = req.params.targetId;
  const existing = db.findOne('connections', c => 
    (c.requesterId === req.user.id && c.receiverId === targetId) ||
    (c.requesterId === targetId && c.receiverId === req.user.id)
  );

  if (existing) {
    return res.json({ success: true, message: 'Connection request already exists or connected.' });
  }

  db.insert('connections', {
    requesterId: req.user.id,
    receiverId: targetId,
    status: 'ACCEPTED' // Auto-accept for demo efficiency
  });

  const actor = db.findOne('users', u => u.id === req.user.id);
  db.insert('notifications', {
    userId: targetId,
    actorName: actor ? actor.name : 'A member',
    actorAvatar: actor ? actor.avatar : '',
    type: 'CONNECTION_ACCEPTED',
    message: `${actor ? actor.name : 'Someone'} connected with you on CadetConnect.`,
    isRead: false
  });

  return res.json({ success: true, message: 'Connected successfully.' });
});

module.exports = router;

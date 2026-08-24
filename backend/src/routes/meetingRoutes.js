const express = require('express');
const db = require('../db/database');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// Get User's Scheduled Meetings
router.get('/', verifyToken, (req, res) => {
  const meetings = db.find('meetings', m => m.mentorId === req.user.id || m.cadetId === req.user.id);
  const requests = db.find('mentorship_requests', r => r.mentorId === req.user.id || r.cadetId === req.user.id);

  return res.json({
    success: true,
    meetings,
    requests
  });
});

// Accept Request & Create Meeting (Mentor Action)
router.post('/requests/:id/accept', verifyToken, (req, res) => {
  const reqId = req.params.id;
  const mentorshipReq = db.findOne('mentorship_requests', r => r.id === reqId);
  if (!mentorshipReq) return res.status(404).json({ success: false, error: 'Request not found.' });

  db.update('mentorship_requests', r => r.id === reqId, { status: 'ACCEPTED' });

  const meeting = db.insert('meetings', {
    requestId: reqId,
    mentorId: mentorshipReq.mentorId,
    mentorName: mentorshipReq.mentorName,
    cadetId: mentorshipReq.cadetId,
    cadetName: mentorshipReq.cadetName,
    topic: mentorshipReq.topic,
    scheduledDate: mentorshipReq.preferredDate,
    scheduledTime: mentorshipReq.preferredTime,
    durationMinutes: 45,
    meetingType: 'Platform Video Room',
    joinUrl: `http://localhost:5173/meetings/room-${reqId}`,
    status: 'SCHEDULED'
  });

  // Notify Cadet
  db.insert('notifications', {
    userId: mentorshipReq.cadetId,
    actorName: mentorshipReq.mentorName,
    type: 'MEETING_ACCEPTED',
    message: `Your mentorship session "${mentorshipReq.topic}" has been confirmed for ${mentorshipReq.preferredDate} at ${mentorshipReq.preferredTime}.`,
    isRead: false
  });

  return res.json({ success: true, message: 'Mentorship request accepted and meeting scheduled.', meeting });
});

module.exports = router;

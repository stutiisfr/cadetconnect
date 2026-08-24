const express = require('express');
const db = require('../db/database');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// Get User Notifications
router.get('/', verifyToken, (req, res) => {
  const notifications = db.find('notifications', n => n.userId === req.user.id);
  return res.json({ success: true, notifications });
});

// Mark Notification as Read
router.post('/:id/read', verifyToken, (req, res) => {
  db.update('notifications', n => n.id === req.params.id && n.userId === req.user.id, { isRead: true });
  return res.json({ success: true });
});

module.exports = router;

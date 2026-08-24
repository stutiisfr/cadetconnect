const express = require('express');
const db = require('../db/database');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// Get Active Conversations for User
router.get('/conversations', verifyToken, (req, res) => {
  const userId = req.user.id;
  const conversations = db.find('conversations', c => c.participantIds && c.participantIds.includes(userId));
  
  // If no conversation exists yet, build from user connections or seed messages
  return res.json({ success: true, conversations });
});

// Get Messages in Conversation
router.get('/conversations/:id/messages', verifyToken, (req, res) => {
  const convId = req.params.id;
  const messages = db.find('messages', m => m.conversationId === convId);
  return res.json({ success: true, messages });
});

// Send Direct Message
router.post('/send', verifyToken, (req, res) => {
  const { recipientId, conversationId, text, mediaUrl } = req.body;
  if (!text && !mediaUrl) {
    return res.status(400).json({ success: false, error: 'Message content cannot be empty.' });
  }

  let convId = conversationId;
  const senderId = req.user.id;

  if (!convId && recipientId) {
    // Find or create conversation
    let conv = db.findOne('conversations', c => 
      c.participantIds && c.participantIds.includes(senderId) && c.participantIds.includes(recipientId)
    );
    if (!conv) {
      const recipient = db.findOne('users', u => u.id === recipientId);
      conv = db.insert('conversations', {
        participantIds: [senderId, recipientId],
        participantNames: [req.user.username, recipient ? recipient.name : 'User'],
        lastMessage: text || 'Media attachment',
        lastUpdated: new Date().toISOString()
      });
    }
    convId = conv.id;
  }

  const sender = db.findOne('users', u => u.id === senderId);

  const message = db.insert('messages', {
    conversationId: convId,
    senderId,
    senderName: sender ? sender.name : 'User',
    senderAvatar: sender ? sender.avatar : '',
    text: text || '',
    mediaUrl: mediaUrl || null,
    sentAt: new Date().toISOString(),
    isRead: false
  });

  // Update conversation last message
  db.update('conversations', c => c.id === convId, {
    lastMessage: text || 'Sent media',
    lastUpdated: new Date().toISOString()
  });

  return res.status(201).json({ success: true, message });
});

module.exports = router;

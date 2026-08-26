const express = require('express');
const db = require('../db/database');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// Get Active Conversations for User
router.get('/conversations', verifyToken, (req, res) => {
  const userId = req.user.id;
  let conversations = db.find('conversations', c => c.participantIds && c.participantIds.includes(userId));
  
  // If no conversation exists yet for this user, seed initial starter conversations with Rahul Das / Col. Vikram
  if (conversations.length === 0) {
    const rahulUser = db.findOne('users', u => u.username === 'rahul_das_suo') || { id: 'usr-cadet-rahul', name: 'Rahul Das (SUO)', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80' };
    const mentorUser = db.findOne('users', u => u.username === 'col_vikram_rathore') || { id: 'usr-mentor-vikram', name: 'Col. Vikram Rathore (Retd.)', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80' };

    const c1 = db.insert('conversations', {
      participantIds: [userId, rahulUser.id],
      participantNames: [req.user.name, rahulUser.name],
      participantAvatars: [req.user.avatar || '', rahulUser.avatar],
      participantRoles: [req.user.role, 'SUO 4 (O) Bn NCC'],
      lastMessage: 'Jai Hind! Welcome to CadetConnect. Let me know if you need any guidance on CDS or NCC C-Cert exams!',
      lastUpdated: new Date().toISOString()
    });

    db.insert('messages', {
      conversationId: c1.id,
      senderId: rahulUser.id,
      senderName: rahulUser.name,
      senderAvatar: rahulUser.avatar,
      text: 'Jai Hind! Welcome to CadetConnect. Let me know if you need any guidance on CDS or NCC C-Cert exams!',
      sentAt: new Date().toISOString(),
      isRead: false
    });

    const c2 = db.insert('conversations', {
      participantIds: [userId, mentorUser.id],
      participantNames: [req.user.name, mentorUser.name],
      participantAvatars: [req.user.avatar || '', mentorUser.avatar],
      participantRoles: [req.user.role, 'Ex-SSB Interviewing Officer'],
      lastMessage: 'Greetings! Preparing for Stage II SSB or AFSB Interview? Feel free to message your queries.',
      lastUpdated: new Date(Date.now() - 3600000).toISOString()
    });

    db.insert('messages', {
      conversationId: c2.id,
      senderId: mentorUser.id,
      senderName: mentorUser.name,
      senderAvatar: mentorUser.avatar,
      text: 'Greetings! Preparing for Stage II SSB or AFSB Interview? Feel free to message your queries.',
      sentAt: new Date(Date.now() - 3600000).toISOString(),
      isRead: false
    });

    conversations = [c1, c2];
  }

  return res.json({ success: true, conversations });
});

// Get Messages in Conversation
router.get('/conversations/:id/messages', verifyToken, (req, res) => {
  const convId = req.params.id;
  const messages = db.find('messages', m => m.conversationId === convId);
  return res.json({ success: true, messages });
});

// Send Direct Message (LinkedIn-style Instant Chat)
router.post('/send', verifyToken, (req, res) => {
  const { recipientId, conversationId, text, mediaUrl } = req.body;
  if (!text && !mediaUrl) {
    return res.status(400).json({ success: false, error: 'Message content cannot be empty.' });
  }

  let convId = conversationId;
  const senderId = req.user.id;

  if (!convId && recipientId) {
    let conv = db.findOne('conversations', c => 
      c.participantIds && c.participantIds.includes(senderId) && c.participantIds.includes(recipientId)
    );
    if (!conv) {
      const recipient = db.findOne('users', u => u.id === recipientId);
      conv = db.insert('conversations', {
        participantIds: [senderId, recipientId],
        participantNames: [req.user.name, recipient ? recipient.name : 'User'],
        participantAvatars: [req.user.avatar || '', recipient ? recipient.avatar : ''],
        participantRoles: [req.user.role, recipient ? recipient.role : 'Member'],
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

  db.update('conversations', c => c.id === convId, {
    lastMessage: text || 'Sent media',
    lastUpdated: new Date().toISOString()
  });

  // Real-time WebSocket Broadcast Event
  const broadcastFn = req.app.get('broadcastWebSocketEvent');
  if (broadcastFn) {
    broadcastFn({
      type: 'CHAT_MESSAGE',
      conversationId: convId,
      message,
      senderId
    });
  }

  return res.status(201).json({ success: true, message });
});

module.exports = router;

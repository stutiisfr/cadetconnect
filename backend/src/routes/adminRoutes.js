const express = require('express');
const db = require('../db/database');
const { verifyToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Supported resource collections for moderation
const ALLOWED_COLLECTIONS = [
  'posts', 'comments', 'notes', 'videos', 
  'events', 'communities', 'stories', 'users', 'reports'
];

// Admin Verification Queue & Platform Overview Stats
router.get('/dashboard', verifyToken, requireRole('ADMIN', 'SUPER_ADMIN'), (req, res) => {
  const users = db.find('users');
  const cadetProfiles = db.find('cadet_profiles');
  const aspirantProfiles = db.find('aspirant_profiles');
  const verifications = db.find('verification_requests');
  const posts = db.find('posts');
  const reports = db.find('reports');
  const meetings = db.find('meetings');
  const communities = db.find('communities');
  const notes = db.find('notes');
  const videos = db.find('videos');
  const events = db.find('events');

  const verifiedCadetsCount = users.filter(u => u.role === 'CADET' && u.isVerified).length;
  const totalAspirantsCount = users.filter(u => u.role === 'ASPIRANT').length;
  const totalMentorsCount = users.filter(u => u.role === 'MENTOR' || u.role === 'VETERAN').length;

  return res.json({
    success: true,
    stats: {
      totalUsers: users.length,
      verifiedCadets: verifiedCadetsCount,
      totalAspirants: totalAspirantsCount,
      totalMentors: totalMentorsCount,
      totalPosts: posts.length,
      totalCommunities: communities.length,
      totalNotes: notes.length,
      totalVideos: videos.length,
      totalEvents: events.length,
      totalMeetings: meetings.length,
      pendingVerifications: verifications.filter(v => v.status === 'PENDING').length,
      pendingReports: reports.filter(r => r.status === 'PENDING').length
    },
    verificationQueue: verifications,
    reportsQueue: reports,
    recentResources: {
      posts: posts.slice(0, 10),
      notes: notes.slice(0, 10),
      videos: videos.slice(0, 10),
      events: events.slice(0, 10)
    }
  });
});

// Action Verification Request (Approve / Reject)
router.post('/verification/:id/action', verifyToken, requireRole('ADMIN', 'SUPER_ADMIN'), (req, res) => {
  const { action, notes } = req.body; // 'APPROVE' or 'REJECT'
  const verId = req.params.id;

  const verReq = db.findOne('verification_requests', v => v.id === verId);
  if (!verReq) return res.status(404).json({ success: false, error: 'Verification request not found.' });

  const newStatus = action === 'APPROVE' ? 'APPROVED' : 'REJECTED';
  db.update('verification_requests', v => v.id === verId, { status: newStatus, notes: notes || '' });

  if (action === 'APPROVE') {
    db.update('users', u => u.id === verReq.userId, {
      isVerified: true,
      verificationBadge: verReq.userRole === 'CADET' ? 'Verified Cadet' : 'Verified Member'
    });

    db.insert('notifications', {
      userId: verReq.userId,
      actorName: 'Admin Desk',
      type: 'VERIFICATION_SUCCESS',
      message: 'Congratulations! Your CadetConnect Regimental Verification has been approved.',
      isRead: false
    });
  }

  return res.json({ success: true, message: `Verification request ${newStatus.toLowerCase()}.` });
});

// Universal Resource Deletion Endpoint for Admins (Posts, Notes, Videos, Events, Communities, Comments, Stories)
router.delete('/resources/:type/:id', verifyToken, requireRole('ADMIN', 'SUPER_ADMIN'), (req, res) => {
  const { type, id } = req.params;
  const collectionName = type.toLowerCase();

  if (!ALLOWED_COLLECTIONS.includes(collectionName)) {
    return res.status(400).json({ success: false, error: `Invalid resource type '${type}'.` });
  }

  const existing = db.findOne(collectionName, item => item.id === id);
  if (!existing) {
    return res.status(404).json({ success: false, error: `Resource of type '${type}' with ID '${id}' not found.` });
  }

  const deletedCount = db.delete(collectionName, item => item.id === id);

  // If reports exist for this target, mark them as RESOLVED
  db.update('reports', r => r.targetId === id, { status: 'RESOLVED', resolvedBy: req.user.username });

  // Log admin moderation action
  console.log(`[ADMIN MODERATION] User '${req.user.username}' deleted ${type} ID '${id}'`);

  return res.json({
    success: true,
    message: `Resource '${type}' (ID: ${id}) deleted successfully by Admin.`,
    deletedCount
  });
});

// Backward-compatible Admin Delete Post
router.delete('/posts/:id', verifyToken, requireRole('ADMIN', 'SUPER_ADMIN'), (req, res) => {
  const postId = req.params.id;
  db.delete('posts', p => p.id === postId);
  db.update('reports', r => r.targetId === postId, { status: 'RESOLVED', resolvedBy: req.user.username });
  return res.json({ success: true, message: 'Post moderated and deleted by Admin.' });
});

// Report Bad Resource Endpoint (Accessible to any logged in user)
router.post('/report', verifyToken, (req, res) => {
  const { targetType, targetId, reason, detail } = req.body;
  if (!targetType || !targetId) {
    return res.status(400).json({ success: false, error: 'Target type and target ID are required.' });
  }

  const report = db.insert('reports', {
    reporterId: req.user.id,
    reporterName: req.user.username || 'User',
    targetType,
    targetId,
    reason: reason || 'Inappropriate content',
    detail: detail || '',
    status: 'PENDING',
    createdAt: new Date().toISOString()
  });

  return res.status(201).json({
    success: true,
    message: 'Report submitted to Admin Desk for review. Thank you for maintaining community standards.',
    report
  });
});

module.exports = router;

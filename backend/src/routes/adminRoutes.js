const express = require('express');
const db = require('../db/database');
const { verifyToken, requireRole } = require('../middleware/auth');

const router = express.Router();

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
      totalMeetings: meetings.length,
      pendingVerifications: verifications.filter(v => v.status === 'PENDING').length,
      pendingReports: reports.filter(r => r.status === 'PENDING').length
    },
    verificationQueue: verifications,
    reportsQueue: reports
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

// Admin Delete / Moderate Post
router.delete('/posts/:id', verifyToken, requireRole('ADMIN', 'SUPER_ADMIN'), (req, res) => {
  const postId = req.params.id;
  db.delete('posts', p => p.id === postId);
  db.update('reports', r => r.targetId === postId, { status: 'RESOLVED' });
  return res.json({ success: true, message: 'Post moderated and removed.' });
});

module.exports = router;

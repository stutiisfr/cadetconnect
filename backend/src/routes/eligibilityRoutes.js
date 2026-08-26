const express = require('express');
const db = require('../db/database');
const { EXAMS_DATA } = require('../data/examsData');
const { evaluateExamEligibility } = require('../services/eligibilityEngine');
const { getOptionalUser } = require('../middleware/auth');

const router = express.Router();

// Centralized helper — uses the same JWT secret as auth middleware
function getOptionalUserId(req) {
  const user = getOptionalUser(req);
  return user ? user.id : null;
}

// 1. Get All Examinations with Search & Filtering
router.get('/exams', (req, res) => {
  const { category, search, qualification, status } = req.query;
  let exams = [...EXAMS_DATA];

  if (category && category !== 'All') {
    exams = exams.filter(e => e.category.toLowerCase().includes(category.toLowerCase()));
  }

  if (qualification && qualification !== 'All') {
    exams = exams.filter(e => {
      const minLevel = e.eligibilityCriteria.education.minLevel.toLowerCase();
      return minLevel.includes(qualification.toLowerCase()) || qualification.toLowerCase().includes(minLevel);
    });
  }

  if (status && status !== 'All') {
    exams = exams.filter(e => e.notificationStatus.toLowerCase().includes(status.toLowerCase()));
  }

  if (search) {
    const q = search.toLowerCase();
    exams = exams.filter(e =>
      e.title.toLowerCase().includes(q) ||
      e.shortName.toLowerCase().includes(q) ||
      e.category.toLowerCase().includes(q) ||
      e.conductingBody.toLowerCase().includes(q) ||
      e.description.toLowerCase().includes(q)
    );
  }

  return res.json({
    success: true,
    count: exams.length,
    exams
  });
});

// 2. Get Single Examination Details
router.get('/exams/:id', (req, res) => {
  const examId = req.params.id;
  const exam = EXAMS_DATA.find(e => e.id === examId);

  if (!exam) {
    return res.status(404).json({ success: false, error: 'Examination not found.' });
  }

  return res.json({
    success: true,
    exam
  });
});

// 3. Evaluate Single Exam Eligibility
router.post('/check', (req, res) => {
  const { examId, candidateProfile } = req.body;

  if (!examId) {
    return res.status(400).json({ success: false, error: 'Exam ID is required.' });
  }

  const exam = EXAMS_DATA.find(e => e.id === examId);
  if (!exam) {
    return res.status(404).json({ success: false, error: 'Specified examination criteria not found.' });
  }

  // If candidateProfile is empty, attempt to resolve from logged-in user profile
  let profile = candidateProfile || {};
  const userId = getOptionalUserId(req);

  if (userId && (!profile.dob || !profile.education)) {
    const savedProfile = db.findOne('candidate_academic_profiles', p => p.userId === userId);
    const user = db.findOne('users', u => u.id === userId);
    if (savedProfile || user) {
      profile = {
        ...user,
        ...savedProfile,
        ...profile
      };
    }
  }

  const evaluation = evaluateExamEligibility(profile, exam);

  return res.json({
    success: true,
    evaluation
  });
});

// 4. "Find Exams I'm Eligible For" - Auto Compare Engine
router.post('/find-matched-exams', (req, res) => {
  let profile = req.body.candidateProfile || {};
  const userId = getOptionalUserId(req);

  if (userId) {
    const savedProfile = db.findOne('candidate_academic_profiles', p => p.userId === userId);
    const user = db.findOne('users', u => u.id === userId);
    if (savedProfile || user) {
      profile = {
        dob: user?.dob,
        gender: user?.gender,
        ...savedProfile,
        ...profile
      };
    }
  }

  const eligibleExams = [];
  const conditionallyEligibleExams = [];
  const ineligibleExams = [];

  EXAMS_DATA.forEach(exam => {
    const evalResult = evaluateExamEligibility(profile, exam);
    if (evalResult.status === 'ELIGIBLE') {
      eligibleExams.push(evalResult);
    } else if (evalResult.status === 'CONDITIONALLY_ELIGIBLE') {
      conditionallyEligibleExams.push(evalResult);
    } else {
      ineligibleExams.push(evalResult);
    }
  });

  return res.json({
    success: true,
    totalExamsChecked: EXAMS_DATA.length,
    counts: {
      eligible: eligibleExams.length,
      conditionallyEligible: conditionallyEligibleExams.length,
      ineligible: ineligibleExams.length
    },
    eligibleExams,
    conditionallyEligibleExams,
    ineligibleExams
  });
});

// 5. Get Saved Candidate Academic Profile
router.get('/my-profile', (req, res) => {
  const userId = getOptionalUserId(req);
  if (!userId) {
    return res.json({ success: true, profile: null });
  }

  const user = db.findOne('users', u => u.id === userId);
  const academicProfile = db.findOne('candidate_academic_profiles', p => p.userId === userId);

  return res.json({
    success: true,
    profile: {
      userId,
      name: user?.name || '',
      email: user?.email || '',
      dob: user?.dob || academicProfile?.dob || '2004-05-14',
      gender: user?.gender || academicProfile?.gender || 'Male',
      nationality: academicProfile?.nationality || 'Citizen of India',
      category: academicProfile?.category || 'General',
      stateDomicile: academicProfile?.stateDomicile || 'Odisha',
      maritalStatus: academicProfile?.maritalStatus || 'Unmarried',
      isExServiceman: academicProfile?.isExServiceman || false,
      isPwd: academicProfile?.isPwd || false,
      heightCm: academicProfile?.heightCm || 172,
      chestCm: academicProfile?.chestCm || 82,
      eyesight: academicProfile?.eyesight || '6/6',
      nccCertificate: academicProfile?.nccCertificate || 'B',
      nccGrade: academicProfile?.nccGrade || 'A',
      drivingLicense: academicProfile?.drivingLicense || false,
      education: academicProfile?.education || {
        highestLevel: 'Graduation',
        status: 'Completed',
        matriculation10th: { board: 'CBSE', passingYear: 2020, percentage: 88.4, subjects: 'Science, Maths, Social, English, Odia' },
        higherSecondary12th: { board: 'CHSE Odisha', passingYear: 2022, percentage: 84.0, stream12th: 'Science (PCM)', pcmPercentage: 86.0, subjects: 'Physics, Chemistry, Maths, Biology, English' },
        diploma: { applicable: false, course: '', institution: '', passingYear: '', percentage: '' },
        graduation: { degreeName: 'B.Sc Physics (Hons)', specialization: 'Physics & Applied Mathematics', university: 'Ravenshaw University', passingYear: 2025, percentage: 78.5, status: 'Completed' },
        postGraduation: { applicable: false, degreeName: '', specialization: '', university: '', passingYear: '', percentage: '' }
      }
    }
  });
});

// 6. Save or Update Candidate Academic Profile
router.post('/my-profile', (req, res) => {
  const userId = getOptionalUserId(req) || 'guest-candidate-user';
  const profileData = req.body;

  const existing = db.findOne('candidate_academic_profiles', p => p.userId === userId);
  if (existing) {
    db.update('candidate_academic_profiles', p => p.userId === userId, {
      ...profileData,
      updatedAt: new Date().toISOString()
    });
  } else {
    db.insert('candidate_academic_profiles', {
      userId,
      ...profileData,
      createdAt: new Date().toISOString()
    });
  }

  // If user is logged in, also sync basic details with user record
  if (userId !== 'guest-candidate-user') {
    db.update('users', u => u.id === userId, {
      ...(profileData.dob && { dob: profileData.dob }),
      ...(profileData.gender && { gender: profileData.gender })
    });
  }

  // Real-time WebSocket Broadcast notification for Profile Sync
  const broadcastFn = req.app.get('broadcastWebSocketEvent');
  if (broadcastFn) {
    broadcastFn({
      type: 'ELIGIBILITY_PROFILE_UPDATE',
      userId,
      timestamp: new Date().toISOString(),
      message: 'Candidate Academic Profile updated in real-time!'
    });
  }

  return res.json({
    success: true,
    message: 'Candidate Academic Profile updated successfully.',
    profile: profileData
  });
});

// 7. Official Notifications Feed
router.get('/notifications', (req, res) => {
  const notifications = [
    {
      id: 'notif-101',
      title: 'UPSC CDS II 2026 Official Gazette Notification Released',
      conductingBody: 'UPSC',
      officialWebsite: 'https://upsc.gov.in',
      source: 'UPSC Gazette (upsc.gov.in)',
      date: '2026-08-20',
      category: 'Defence Exams',
      summary: 'Applications open for 459 vacancies in IMA Dehradun, INA Ezhimala, AFA Hyderabad and OTA Chennai. Last date to apply: 04 June 2026.'
    },
    {
      id: 'notif-102',
      title: 'SSC CGL 2026 Exam Schedule & Vacancy Count Updated',
      conductingBody: 'SSC',
      officialWebsite: 'https://ssc.gov.in',
      source: 'SSC Official Portal (ssc.gov.in)',
      date: '2026-08-18',
      category: 'SSC Exams',
      summary: 'Staff Selection Commission announces 17,727 vacancies for Assistant Section Officer, Income Tax Inspector, and Central Excise Inspector posts.'
    },
    {
      id: 'notif-103',
      title: 'Indian Army NCC 57th Special Entry Scheme Online Application Active',
      conductingBody: 'Indian Army',
      officialWebsite: 'https://joinindianarmy.nic.in',
      source: 'Join Indian Army Rtg Directorate',
      date: '2026-08-15',
      category: 'Defence Exams',
      summary: 'Direct SSB Interview entry for NCC C Certificate holders with min B grade. 55 Seats available for male and female cadets.'
    },
    {
      id: 'notif-104',
      title: 'IBPS PO XIV Preliminary Examination Call Letter Download Active',
      conductingBody: 'IBPS',
      officialWebsite: 'https://ibps.in',
      source: 'IBPS Official Portal (ibps.in)',
      date: '2026-08-10',
      category: 'Banking & Financial',
      summary: 'Download online preliminary exam admit card for 4,455 Probationary Officer vacancies in 11 participating public sector banks.'
    },
    {
      id: 'notif-105',
      title: 'RRB NTPC CEN 05/2026 Under Graduate & Graduate Posts CBT 1 Date Announced',
      conductingBody: 'Ministry of Railways',
      officialWebsite: 'https://rrbcdg.gov.in',
      source: 'RRB Chandigarh / Railway Recruitment Board',
      date: '2026-08-08',
      category: 'Railway Exams',
      summary: 'CBT 1 screening test scheduled across 150+ cities for Station Master, Goods Guard, and Commercial Apprentice recruitment.'
    }
  ];

  return res.json({
    success: true,
    count: notifications.length,
    notifications
  });
});

// 8. Bookmark / Save Exam
router.post('/save-exam', (req, res) => {
  const userId = getOptionalUserId(req) || 'guest-user';
  const { examId } = req.body;

  if (!examId) {
    return res.status(400).json({ success: false, error: 'Exam ID is required.' });
  }

  const existing = db.findOne('saved_items', item => item.userId === userId && item.examId === examId);

  if (existing) {
    db.delete('saved_items', item => item.id === existing.id);
    return res.json({ success: true, saved: false, message: 'Exam removed from saved list.' });
  } else {
    db.insert('saved_items', {
      userId,
      examId,
      type: 'EXAM',
      savedAt: new Date().toISOString()
    });
    return res.json({ success: true, saved: true, message: 'Exam saved to your bookmarks!' });
  }
});

// 9. Get Saved Exams
router.get('/saved-exams', (req, res) => {
  const userId = getOptionalUserId(req) || 'guest-user';
  const savedRecords = db.find('saved_items', item => item.userId === userId && item.type === 'EXAM');
  const savedExamIds = savedRecords.map(r => r.examId);
  const savedExams = EXAMS_DATA.filter(e => savedExamIds.includes(e.id));

  return res.json({
    success: true,
    count: savedExams.length,
    savedExams
  });
});

module.exports = router;

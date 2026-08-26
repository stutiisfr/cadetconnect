const express = require('express');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const db = require('../db/database');
const { generateToken, verifyToken, JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

// ───────────────────────────────────────────────────────────────
// In-memory OTP store (phone -> { otp, expiresAt })
// ───────────────────────────────────────────────────────────────
const otpStore = new Map();

// Clean up expired OTPs every 5 minutes to prevent memory leak
setInterval(() => {
  const now = Date.now();
  for (const [phone, entry] of otpStore.entries()) {
    if (now > entry.expiresAt) {
      otpStore.delete(phone);
    }
  }
}, 5 * 60 * 1000);

// ───────────────────────────────────────────────────────────────
// GET /me — Validate current token & return user (CRITICAL)
// ───────────────────────────────────────────────────────────────
router.get('/me', verifyToken, (req, res) => {
  const user = db.findOne('users', u => u.id === req.user.id);
  if (!user) {
    return res.status(404).json({ success: false, error: 'User not found.' });
  }

  const { password: _, ...userWithoutPassword } = user;

  let roleProfile = null;
  if (user.role === 'CADET') {
    const cp = db.findOne('cadet_profiles', p => p.userId === user.id);
    if (cp) {
      const { regimentalNumber, ...cpPublic } = cp;
      roleProfile = cpPublic;
    }
  } else if (user.role === 'ASPIRANT') {
    roleProfile = db.findOne('aspirant_profiles', p => p.userId === user.id);
  } else if (user.role === 'MENTOR') {
    roleProfile = db.findOne('mentor_profiles', p => p.userId === user.id);
  }

  return res.json({
    success: true,
    user: userWithoutPassword,
    roleProfile
  });
});

// ───────────────────────────────────────────────────────────────
// POST /login — Email & Password
// ───────────────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required.' });
    }

    const user = db.findOne('users', u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid credentials.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid credentials.' });
    }

    const token = generateToken(user);
    const { password: _, ...userWithoutPassword } = user;

    // Fetch role-specific details
    let roleProfile = null;
    if (user.role === 'CADET') {
      const cp = db.findOne('cadet_profiles', p => p.userId === user.id);
      if (cp) {
        // Exclude regimental number for client return unless requested for private settings
        const { regimentalNumber, ...cpPublic } = cp;
        roleProfile = cpPublic;
      }
    } else if (user.role === 'ASPIRANT') {
      roleProfile = db.findOne('aspirant_profiles', p => p.userId === user.id);
    } else if (user.role === 'MENTOR') {
      roleProfile = db.findOne('mentor_profiles', p => p.userId === user.id);
    }

    return res.json({
      success: true,
      token,
      user: userWithoutPassword,
      roleProfile
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ───────────────────────────────────────────────────────────────
// POST /register/cadet — NCC Cadet Registration (REGIMENTAL NUMBER MANDATORY)
// ───────────────────────────────────────────────────────────────
router.post('/register/cadet', async (req, res) => {
  try {
    const {
      name, email, password, phone, dob, gender, location, bio, avatar,
      college, course, branch, year,
      directorate, group, unit, battalion, wing,
      regimentalNumber, rank, enrollmentYear, certificateStatus, achievements, skills, interests
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: 'Name, email, and password are required.' });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters.' });
    }

    // MANDATORY REQUIREMENT FOR NCC CADET
    if (!regimentalNumber || regimentalNumber.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Regimental Number is strictly required for NCC Cadet registration.'
      });
    }

    const existing = db.findOne('users', u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return res.status(400).json({ success: false, error: 'User with this email already exists.' });
    }

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);
    const username = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '_') + '_' + Math.floor(Math.random() * 1000);

    const user = db.insert('users', {
      email: email.toLowerCase(),
      password: passwordHash,
      name,
      username,
      role: 'CADET',
      isVerified: false,
      verificationBadge: 'Cadet (Verification Pending)',
      avatar: avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
      location: location || 'India',
      bio: bio || 'NCC Cadet dedicated to service and leadership.',
      phone,
      gender,
      dob,
      college,
      course,
      year
    });

    db.insert('cadet_profiles', {
      userId: user.id,
      directorate: directorate || 'General Directorate',
      group: group || 'General Group',
      unit: unit || 'General Unit',
      battalion: battalion || 'General Battalion',
      wing: wing || 'Army Wing',
      regimentalNumber: regimentalNumber.trim(), // STORED PRIVATELY
      rank: rank || 'Cadet',
      enrollmentYear: enrollmentYear || new Date().getFullYear().toString(),
      certificateStatus: certificateStatus || 'None',
      skills: Array.isArray(skills) ? skills : [],
      interests: Array.isArray(interests) ? interests : []
    });

    // Create automatic verification request for admin review
    db.insert('verification_requests', {
      userId: user.id,
      userName: user.name,
      userRole: 'CADET',
      regimentalNumber: regimentalNumber.trim(),
      institution: college || 'Institution',
      status: 'PENDING',
      submittedAt: new Date().toISOString()
    });

    const token = generateToken(user);
    const { password: _, ...userWithoutPassword } = user;

    return res.status(201).json({
      success: true,
      message: 'NCC Cadet registered successfully. Regimental verification queued.',
      token,
      user: userWithoutPassword
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ───────────────────────────────────────────────────────────────
// POST /register/aspirant — Defence Aspirant Registration
// ───────────────────────────────────────────────────────────────
router.post('/register/aspirant', async (req, res) => {
  try {
    const {
      name, email, password, phone, dob, gender, location, bio, avatar,
      college, degree, graduationYear,
      targetExams, targetEntry, preferredService, prepLevel, skills, interests
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: 'Name, email, and password are required.' });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters.' });
    }

    const existing = db.findOne('users', u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return res.status(400).json({ success: false, error: 'User with this email already exists.' });
    }

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);
    const username = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '_') + '_' + Math.floor(Math.random() * 1000);

    const user = db.insert('users', {
      email: email.toLowerCase(),
      password: passwordHash,
      name,
      username,
      role: 'ASPIRANT',
      isVerified: true,
      verificationBadge: 'Verified Aspirant',
      avatar: avatar || 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80',
      location: location || 'India',
      bio: bio || 'Defence Aspirant preparing for officer entries.',
      phone,
      gender,
      dob,
      college,
      degree,
      graduationYear
    });

    db.insert('aspirant_profiles', {
      userId: user.id,
      targetExams: Array.isArray(targetExams) ? targetExams : ['CDS', 'NDA'],
      targetEntry: targetEntry || 'CDS / AFCAT',
      preferredService: preferredService || 'Indian Army',
      prepLevel: prepLevel || 'Intermediate',
      skills: Array.isArray(skills) ? skills : [],
      interests: Array.isArray(interests) ? interests : []
    });

    const token = generateToken(user);
    const { password: _, ...userWithoutPassword } = user;

    return res.status(201).json({
      success: true,
      message: 'Defence Aspirant registered successfully.',
      token,
      user: userWithoutPassword
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ───────────────────────────────────────────────────────────────
// POST /google — Google Sign-In / Registration
// ───────────────────────────────────────────────────────────────
router.post('/google', async (req, res) => {
  try {
    const { email, name, avatar, googleId } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, error: 'Google email is required.' });
    }

    let user = db.findOne('users', u => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      // Create new user automatically from Google Profile as Defence Aspirant by default
      const username = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '_') + '_' + Math.floor(Math.random() * 1000);
      const salt = await bcrypt.genSalt(12);
      const randomPassword = await bcrypt.hash(uuidv4(), salt);

      user = db.insert('users', {
        email: email.toLowerCase(),
        password: randomPassword,
        name: name || email.split('@')[0],
        username,
        role: 'ASPIRANT',
        isVerified: true,
        verificationBadge: 'Verified Aspirant',
        avatar: avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
        location: 'India',
        bio: 'Defence Aspirant connected via Google.',
        googleId: googleId || 'google-' + uuidv4(),
        googleConnected: true,
        phone: '',
        gender: 'Not Specified',
        dob: '',
        college: 'University',
        course: '',
        year: ''
      });

      db.insert('aspirant_profiles', {
        userId: user.id,
        targetExams: ['CDS', 'NDA', 'AFCAT'],
        targetEntry: 'CDS / AFCAT',
        preferredService: 'Indian Armed Forces',
        prepLevel: 'Beginner',
        skills: ['General Knowledge', 'Current Affairs'],
        interests: ['Defence Leadership', 'SSB Prep']
      });
    } else {
      // Update Google connection status — use filter function, not string ID
      db.update('users', u => u.id === user.id, { googleConnected: true, googleId: googleId || user.googleId || 'google-' + uuidv4() });
      user = db.findOne('users', u => u.id === user.id);
    }

    const token = generateToken(user);
    const { password: _, ...userWithoutPassword } = user;

    let roleProfile = null;
    if (user.role === 'CADET') {
      const cp = db.findOne('cadet_profiles', p => p.userId === user.id);
      if (cp) {
        const { regimentalNumber, ...cpPublic } = cp;
        roleProfile = cpPublic;
      }
    } else if (user.role === 'ASPIRANT') {
      roleProfile = db.findOne('aspirant_profiles', p => p.userId === user.id);
    } else if (user.role === 'MENTOR') {
      roleProfile = db.findOne('mentor_profiles', p => p.userId === user.id);
    }

    return res.json({
      success: true,
      message: 'Logged in with Google successfully',
      token,
      user: userWithoutPassword,
      roleProfile
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ───────────────────────────────────────────────────────────────
// POST /send-otp — Send Mobile OTP
// ───────────────────────────────────────────────────────────────
router.post('/send-otp', async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone || phone.trim().length < 10) {
      return res.status(400).json({ success: false, error: 'Valid 10-digit mobile number is required.' });
    }

    const cleanPhone = phone.trim().replace(/[^0-9+]/g, '');
    
    // Generate realistic 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    otpStore.set(cleanPhone, { otp, expiresAt });

    console.log(`[AUTH OTP SERVICE] OTP for mobile ${cleanPhone}: ${otp}`);

    // In production, integrate an SMS gateway (Twilio, MSG91, etc.)
    // For development, the OTP is logged to the server console.
    const response = {
      success: true,
      message: `OTP sent successfully to ${cleanPhone}.`
    };

    // Only expose demo OTP in development mode
    if (process.env.NODE_ENV !== 'production') {
      response.demoOtp = otp;
    }

    return res.json(response);
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ───────────────────────────────────────────────────────────────
// POST /verify-otp — Verify Mobile OTP & Login/Register
// ───────────────────────────────────────────────────────────────
router.post('/verify-otp', async (req, res) => {
  try {
    const { phone, otp, name, role } = req.body;
    if (!phone || !otp) {
      return res.status(400).json({ success: false, error: 'Mobile number and OTP are required.' });
    }

    const cleanPhone = phone.trim().replace(/[^0-9+]/g, '');
    const stored = otpStore.get(cleanPhone);

    // Validate OTP — NO backdoor, strict match only
    const isValid = stored && stored.otp === otp && Date.now() <= stored.expiresAt;

    if (!isValid) {
      return res.status(400).json({ success: false, error: 'Invalid or expired OTP. Please enter the correct code.' });
    }

    // Clean up OTP after successful verification
    otpStore.delete(cleanPhone);

    // Look for user with this phone or normalized phone
    let user = db.findOne('users', u => u.phone && (u.phone.replace(/[^0-9]/g, '') === cleanPhone.replace(/[^0-9]/g, '')));

    if (!user) {
      // Auto register user with phone
      const selectedRole = role === 'CADET' ? 'CADET' : 'ASPIRANT';
      const userEmail = `cadet_${cleanPhone.slice(-6)}@cadetconnect.org`;
      const salt = await bcrypt.genSalt(12);
      const randomPassword = await bcrypt.hash(uuidv4(), salt);
      const username = `cadet_${cleanPhone.slice(-6)}_${Math.floor(Math.random() * 1000)}`;

      user = db.insert('users', {
        email: userEmail,
        password: randomPassword,
        name: name || `Cadet (${cleanPhone.slice(-4)})`,
        username,
        role: selectedRole,
        isVerified: true,
        verificationBadge: selectedRole === 'CADET' ? 'Verified Cadet' : 'Verified Aspirant',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
        location: 'India',
        bio: 'Defence community member authenticated via mobile OTP.',
        phone: cleanPhone,
        phoneVerified: true,
        gender: 'Not Specified',
        dob: '',
        college: 'College / Institute',
        course: '',
        year: ''
      });

      if (selectedRole === 'CADET') {
        db.insert('cadet_profiles', {
          userId: user.id,
          directorate: 'National Directorate',
          group: 'Central Group',
          unit: 'NCC Unit',
          battalion: '1st Bn',
          wing: 'Army Wing (SD)',
          regimentalNumber: `NCC/${cleanPhone.slice(-6)}`,
          rank: 'Cadet',
          enrollmentYear: new Date().getFullYear().toString(),
          certificateStatus: 'A Certificate',
          skills: ['Drill', 'Physical Fitness'],
          interests: ['Defence Leadership']
        });
      } else {
        db.insert('aspirant_profiles', {
          userId: user.id,
          targetExams: ['CDS', 'NDA'],
          targetEntry: 'CDS',
          preferredService: 'Indian Army',
          prepLevel: 'Intermediate',
          skills: ['General Awareness'],
          interests: ['SSB Preparation']
        });
      }
    } else {
      // Use filter function, not string ID
      db.update('users', u => u.id === user.id, { phoneVerified: true });
      user = db.findOne('users', u => u.id === user.id);
    }

    const token = generateToken(user);
    const { password: _, ...userWithoutPassword } = user;

    let roleProfile = null;
    if (user.role === 'CADET') {
      const cp = db.findOne('cadet_profiles', p => p.userId === user.id);
      if (cp) {
        const { regimentalNumber, ...cpPublic } = cp;
        roleProfile = cpPublic;
      }
    } else if (user.role === 'ASPIRANT') {
      roleProfile = db.findOne('aspirant_profiles', p => p.userId === user.id);
    } else if (user.role === 'MENTOR') {
      roleProfile = db.findOne('mentor_profiles', p => p.userId === user.id);
    }

    return res.json({
      success: true,
      message: 'Mobile number authenticated successfully.',
      token,
      user: userWithoutPassword,
      roleProfile
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ───────────────────────────────────────────────────────────────
// POST /connect/google — Link Google Account
// ───────────────────────────────────────────────────────────────
router.post('/connect/google', verifyToken, async (req, res) => {
  try {
    const { googleId, email } = req.body;
    db.update('users', u => u.id === req.user.id, {
      googleConnected: true,
      googleId: googleId || 'google-' + uuidv4(),
      googleEmail: email || req.user.email
    });
    const updated = db.findOne('users', u => u.id === req.user.id);
    const { password: _, ...userWithoutPassword } = updated;
    return res.json({ success: true, message: 'Google account linked successfully.', user: userWithoutPassword });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ───────────────────────────────────────────────────────────────
// POST /connect/phone — Link Phone Number with OTP
// ───────────────────────────────────────────────────────────────
router.post('/connect/phone', verifyToken, async (req, res) => {
  try {
    const { phone, otp } = req.body;
    if (!phone || !otp) {
      return res.status(400).json({ success: false, error: 'Phone and OTP are required.' });
    }
    const cleanPhone = phone.trim().replace(/[^0-9+]/g, '');
    const stored = otpStore.get(cleanPhone);
    // Strict OTP validation — no backdoor
    const isValid = stored && stored.otp === otp && Date.now() <= stored.expiresAt;
    if (!isValid) {
      return res.status(400).json({ success: false, error: 'Invalid or expired OTP code.' });
    }
    otpStore.delete(cleanPhone);
    db.update('users', u => u.id === req.user.id, {
      phone: cleanPhone,
      phoneVerified: true
    });
    const updated = db.findOne('users', u => u.id === req.user.id);
    const { password: _, ...userWithoutPassword } = updated;
    return res.json({ success: true, message: 'Phone number verified and linked.', user: userWithoutPassword });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;

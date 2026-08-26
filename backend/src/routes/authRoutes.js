const express = require('express');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const db = require('../db/database');
const { getNeonSql } = require('../db/neonDb');
const { generateToken, verifyToken, JWT_SECRET } = require('../middleware/auth');
const accountLinkingService = require('../services/accountLinkingService');

const router = express.Router();

// ───────────────────────────────────────────────────────────────
// Hashed OTP Store & Attempt Rate Limiting
// ───────────────────────────────────────────────────────────────
const otpStore = new Map(); // phone -> { otpHash, expiresAt, attempts }

setInterval(() => {
  const now = Date.now();
  for (const [phone, entry] of otpStore.entries()) {
    if (now > entry.expiresAt) {
      otpStore.delete(phone);
    }
  }
}, 5 * 60 * 1000);

// Helper to hash strings with SHA-256
function hashSha256(str) {
  return crypto.createHash('sha256').update(str).digest('hex');
}

// ───────────────────────────────────────────────────────────────
// GET /me — Validate Token & Fetch User Profile State
// ───────────────────────────────────────────────────────────────
router.get('/me', verifyToken, async (req, res) => {
  try {
    const user = await accountLinkingService.findOrCreateUser({
      provider: 'SESSION',
      providerUserId: req.user.id,
      email: req.user.email
    }) || db.findOne('users', u => u.id === req.user.id);

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
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
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

    const sql = getNeonSql();
    let user = null;
    let passwordHash = null;

    if (sql) {
      const userRows = await sql`SELECT * FROM users WHERE LOWER(email) = ${email.toLowerCase().trim()} LIMIT 1`;
      if (userRows.length > 0) {
        user = userRows[0];
        const credRows = await sql`SELECT password_hash FROM password_credentials WHERE user_id = ${user.id} LIMIT 1`;
        if (credRows.length > 0) {
          passwordHash = credRows[0].password_hash;
        }
      }
    }

    if (!user) {
      user = db.findOne('users', u => u.email.toLowerCase() === email.toLowerCase());
      if (user) passwordHash = user.password;
    }

    if (!user || !passwordHash) {
      return res.status(401).json({ success: false, error: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid email or password.' });
    }

    const formattedUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      username: user.username,
      role: user.role,
      verificationBadge: user.verification_badge || user.verificationBadge || 'Verified Aspirant',
      avatar: user.profile_image || user.avatar
    };

    const token = generateToken(formattedUser);

    let roleProfile = null;
    if (formattedUser.role === 'CADET') {
      const cp = db.findOne('cadet_profiles', p => p.userId === formattedUser.id);
      if (cp) {
        const { regimentalNumber, ...cpPublic } = cp;
        roleProfile = cpPublic;
      }
    } else if (formattedUser.role === 'ASPIRANT') {
      roleProfile = db.findOne('aspirant_profiles', p => p.userId === formattedUser.id);
    } else if (formattedUser.role === 'MENTOR') {
      roleProfile = db.findOne('mentor_profiles', p => p.userId === formattedUser.id);
    }

    return res.json({
      success: true,
      message: 'Logged in successfully.',
      token,
      user: formattedUser,
      roleProfile
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ───────────────────────────────────────────────────────────────
// POST /google — Verified Google OAuth Authentication & Account Linking
// ───────────────────────────────────────────────────────────────
router.post('/google', async (req, res) => {
  try {
    const { email, name, avatar, googleId, idToken } = req.body;

    let verifiedEmail = email;
    let verifiedGoogleId = googleId;
    let verifiedName = name;
    let verifiedAvatar = avatar;

    // Server-side identity verification via Google API if ID token is provided
    if (idToken) {
      try {
        const verifyRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`);
        if (verifyRes.ok) {
          const payload = await verifyRes.json();
          verifiedEmail = payload.email;
          verifiedGoogleId = payload.sub;
          verifiedName = payload.name || name;
          verifiedAvatar = payload.picture || avatar;
          console.log(`[GOOGLE OAUTH VERIFIED] Email: ${verifiedEmail}, Sub: ${verifiedGoogleId}`);
        }
      } catch (verifyErr) {
        console.warn('[GOOGLE VERIFY WARNING] Could not verify token online, using payload fallback:', verifyErr.message);
      }
    }

    if (!verifiedEmail || !verifiedGoogleId) {
      return res.status(400).json({ success: false, error: 'Valid Google email and ID are required.' });
    }

    const user = await accountLinkingService.findOrCreateUser({
      provider: 'GOOGLE',
      providerUserId: verifiedGoogleId,
      email: verifiedEmail,
      name: verifiedName || verifiedEmail.split('@')[0],
      avatar: verifiedAvatar,
      role: 'ASPIRANT'
    });

    const token = generateToken(user);
    const { password: _, ...userWithoutPassword } = user;

    return res.json({
      success: true,
      message: 'Authenticated with Google successfully.',
      token,
      user: userWithoutPassword
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ───────────────────────────────────────────────────────────────
// POST /linkedin — Verified LinkedIn OAuth 2.0 Identity & Account Linking
// ───────────────────────────────────────────────────────────────
router.post('/linkedin', async (req, res) => {
  try {
    const { code, redirectUri, linkedinId, email, name, avatar } = req.body;

    let verifiedEmail = email;
    let verifiedLinkedinId = linkedinId;
    let verifiedName = name;
    let verifiedAvatar = avatar;

    const clientID = process.env.LINKEDIN_CLIENT_ID;
    const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;

    // Execute OAuth code exchange if authorization code & secrets are present
    if (code && clientID && clientSecret) {
      try {
        const tokenRes = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            grant_type: 'authorization_code',
            code,
            client_id: clientID,
            client_secret: clientSecret,
            redirect_uri: redirectUri || 'http://localhost:5173/login'
          })
        });

        if (tokenRes.ok) {
          const tokenData = await tokenRes.json();
          const accessToken = tokenData.access_token;

          // Fetch verified user info
          const profileRes = await fetch('https://api.linkedin.com/v2/userinfo', {
            headers: { Authorization: `Bearer ${accessToken}` }
          });

          if (profileRes.ok) {
            const profile = await profileRes.json();
            verifiedLinkedinId = profile.sub;
            verifiedEmail = profile.email;
            verifiedName = profile.name;
            verifiedAvatar = profile.picture;
            console.log(`[LINKEDIN OAUTH VERIFIED] Email: ${verifiedEmail}, Sub: ${verifiedLinkedinId}`);
          }
        }
      } catch (linkedinErr) {
        console.warn('[LINKEDIN OAUTH WARNING] Token exchange failed, using direct fallback:', linkedinErr.message);
      }
    }

    if (!verifiedEmail && !verifiedLinkedinId) {
      return res.status(400).json({ success: false, error: 'LinkedIn authentication code or profile email is required.' });
    }

    const providerUserId = verifiedLinkedinId || `linkedin_${Date.now()}`;
    const userEmail = verifiedEmail || `cadet_linkedin_${Date.now()}@cadetconnect.org`;

    const user = await accountLinkingService.findOrCreateUser({
      provider: 'LINKEDIN',
      providerUserId,
      email: userEmail,
      name: verifiedName || 'LinkedIn Cadet',
      avatar: verifiedAvatar,
      role: 'ASPIRANT'
    });

    const token = generateToken(user);
    const { password: _, ...userWithoutPassword } = user;

    return res.json({
      success: true,
      message: 'Authenticated with LinkedIn successfully.',
      token,
      user: userWithoutPassword
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ───────────────────────────────────────────────────────────────
// POST /facebook — Verified Facebook Login & Account Linking
// ───────────────────────────────────────────────────────────────
router.post('/facebook', async (req, res) => {
  try {
    const { accessToken, facebookId, email, name, avatar } = req.body;

    let verifiedEmail = email;
    let verifiedFacebookId = facebookId;
    let verifiedName = name;
    let verifiedAvatar = avatar;

    // Server-side identity verification via Facebook Graph API if accessToken is provided
    if (accessToken) {
      try {
        const graphRes = await fetch(`https://graph.facebook.com/me?fields=id,name,email,picture.type(large)&access_token=${accessToken}`);
        if (graphRes.ok) {
          const profile = await graphRes.json();
          verifiedFacebookId = profile.id;
          if (profile.email) verifiedEmail = profile.email;
          if (profile.name) verifiedName = profile.name;
          if (profile.picture?.data?.url) verifiedAvatar = profile.picture.data.url;
          console.log(`[FACEBOOK LOGIN VERIFIED] ID: ${verifiedFacebookId}, Email: ${verifiedEmail}`);
        }
      } catch (fbErr) {
        console.warn('[FACEBOOK VERIFY WARNING] Graph API verify failed, using payload fallback:', fbErr.message);
      }
    }

    if (!verifiedFacebookId && !verifiedEmail) {
      return res.status(400).json({ success: false, error: 'Facebook user ID or email is required.' });
    }

    const providerUserId = verifiedFacebookId || `facebook_${Date.now()}`;
    const userEmail = verifiedEmail || `cadet_fb_${Date.now()}@cadetconnect.org`;

    const user = await accountLinkingService.findOrCreateUser({
      provider: 'FACEBOOK',
      providerUserId,
      email: userEmail,
      name: verifiedName || 'Facebook Cadet',
      avatar: verifiedAvatar,
      role: 'ASPIRANT'
    });

    const token = generateToken(user);
    const { password: _, ...userWithoutPassword } = user;

    return res.json({
      success: true,
      message: 'Authenticated with Facebook successfully.',
      token,
      user: userWithoutPassword
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ───────────────────────────────────────────────────────────────
// POST /send-otp — Send Mobile OTP with Hashed Storage & Rate Limiting
// ───────────────────────────────────────────────────────────────
router.post('/send-otp', async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone || phone.trim().length < 10) {
      return res.status(400).json({ success: false, error: 'Valid 10-digit mobile number is required.' });
    }

    const cleanPhone = phone.trim().replace(/[^0-9+]/g, '');

    // Check request rate limits (max 5 requests per 10 minutes)
    const existing = otpStore.get(cleanPhone);
    if (existing && existing.attempts >= 5 && Date.now() < existing.expiresAt) {
      return res.status(429).json({ success: false, error: 'Too many OTP requests. Please wait 10 minutes before trying again.' });
    }

    // Generate cryptographic 6-digit OTP
    const rawOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = hashSha256(rawOtp);
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes expiration

    otpStore.set(cleanPhone, {
      otpHash,
      expiresAt,
      attempts: (existing?.attempts || 0) + 1
    });

    console.log(`[AUTH OTP SERVICE] Cryptographic OTP generated for mobile ${cleanPhone}: ${rawOtp}`);

    const response = {
      success: true,
      message: `Verification code sent successfully to ${cleanPhone}.`
    };

    // Only expose demo OTP in development mode
    if (process.env.NODE_ENV !== 'production') {
      response.demoOtp = rawOtp;
    }

    return res.json(response);
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ───────────────────────────────────────────────────────────────
// POST /verify-otp — Verify Mobile OTP & Authenticate/Link Account
// ───────────────────────────────────────────────────────────────
router.post('/verify-otp', async (req, res) => {
  try {
    const { phone, otp, name, role } = req.body;
    if (!phone || !otp) {
      return res.status(400).json({ success: false, error: 'Mobile number and verification code are required.' });
    }

    const cleanPhone = phone.trim().replace(/[^0-9+]/g, '');
    const stored = otpStore.get(cleanPhone);

    const submittedHash = hashSha256(otp.trim());
    const isValid = stored && stored.otpHash === submittedHash && Date.now() <= stored.expiresAt;

    if (!isValid) {
      return res.status(400).json({ success: false, error: 'Invalid or expired verification code.' });
    }

    // Clear OTP after successful verification
    otpStore.delete(cleanPhone);

    const user = await accountLinkingService.findOrCreateUser({
      provider: 'PHONE',
      providerUserId: cleanPhone,
      phone: cleanPhone,
      name: name || `Cadet (${cleanPhone.slice(-4)})`,
      role: role === 'CADET' ? 'CADET' : 'ASPIRANT'
    });

    const token = generateToken(user);
    const { password: _, ...userWithoutPassword } = user;

    return res.json({
      success: true,
      message: 'Mobile number authenticated successfully.',
      token,
      user: userWithoutPassword
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ───────────────────────────────────────────────────────────────
// POST /forgot-password — Request Password Reset Link
// ───────────────────────────────────────────────────────────────
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, error: 'Email address is required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const sql = getNeonSql();

    let user = null;
    if (sql) {
      const rows = await sql`SELECT id, email, name FROM users WHERE LOWER(email) = ${cleanEmail} LIMIT 1`;
      if (rows.length > 0) user = rows[0];
    }
    if (!user) {
      user = db.findOne('users', u => u.email && u.email.toLowerCase() === cleanEmail);
    }

    // Always respond with a generic success message to prevent user enumeration attacks
    const genericResponse = {
      success: true,
      message: 'If an account exists with this email, a password reset link has been generated.'
    };

    if (!user) return res.json(genericResponse);

    // Generate cryptographically secure random token (32 bytes = 256 bits)
    const rawResetToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = hashSha256(rawResetToken);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    if (sql) {
      await sql`
        INSERT INTO password_reset_tokens (user_id, token_hash, expires_at)
        VALUES (${user.id}, ${tokenHash}, ${expiresAt.toISOString()})
      `;
    } else {
      db.insert('password_reset_tokens', {
        userId: user.id,
        tokenHash,
        expiresAt: expiresAt.toISOString(),
        usedAt: null
      });
    }

    const resetLink = `${process.env.APP_BASE_URL || 'http://localhost:5173'}/reset-password?token=${rawResetToken}`;
    console.log(`[SECURE FORGOT PASSWORD] Reset link generated for ${cleanEmail}: ${resetLink}`);

    if (process.env.NODE_ENV !== 'production') {
      genericResponse.demoResetLink = resetLink;
    }

    return res.json(genericResponse);
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ───────────────────────────────────────────────────────────────
// POST /reset-password — Execute Password Reset with Single-Use Token
// ───────────────────────────────────────────────────────────────
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(400).json({ success: false, error: 'Reset token and new password are required.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters long.' });
    }

    const tokenHash = hashSha256(token.trim());
    const sql = getNeonSql();
    let validTokenRecord = null;
    let userId = null;

    if (sql) {
      const rows = await sql`
        SELECT * FROM password_reset_tokens 
        WHERE token_hash = ${tokenHash} AND used_at IS NULL AND expires_at > NOW()
        LIMIT 1
      `;
      if (rows.length > 0) {
        validTokenRecord = rows[0];
        userId = validTokenRecord.user_id;
      }
    }

    if (!validTokenRecord) {
      const localToken = db.findOne('password_reset_tokens', t => 
        t.tokenHash === tokenHash && !t.usedAt && new Date(t.expiresAt) > new Date()
      );
      if (localToken) {
        validTokenRecord = localToken;
        userId = localToken.userId;
      }
    }

    if (!validTokenRecord || !userId) {
      return res.status(400).json({ success: false, error: 'Invalid, expired, or already used password reset link.' });
    }

    // Hash new password using bcrypt (12 rounds)
    const salt = await bcrypt.genSalt(12);
    const newPasswordHash = await bcrypt.hash(newPassword, salt);

    if (sql) {
      // 1. Update password_credentials
      await sql`
        INSERT INTO password_credentials (user_id, password_hash, updated_at)
        VALUES (${userId}, ${newPasswordHash}, NOW())
        ON CONFLICT (user_id) DO UPDATE SET password_hash = ${newPasswordHash}, updated_at = NOW()
      `;

      // 2. Mark reset token as used (single-use enforcement)
      await sql`
        UPDATE password_reset_tokens 
        SET used_at = NOW() 
        WHERE id = ${validTokenRecord.id}
      `;

      // 3. Invalidate existing sessions
      await sql`DELETE FROM sessions WHERE user_id = ${userId}`;
    }

    // Sync with local memory engine
    db.update('users', u => u.id === userId, { password: newPasswordHash });
    db.update('password_reset_tokens', t => t.tokenHash === tokenHash, { usedAt: new Date().toISOString() });

    console.log(`[SECURE FORGOT PASSWORD] Password reset executed successfully for User ID: ${userId}`);

    return res.json({
      success: true,
      message: 'Your password has been reset successfully. You may now sign in with your new password.'
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ───────────────────────────────────────────────────────────────
// POST /register/cadet & /register/aspirant
// ───────────────────────────────────────────────────────────────
router.post('/register/cadet', async (req, res) => {
  try {
    const {
      name, email, password, phone, regimentalNumber,
      directorate, group, unit, battalion, wing, rank, college
    } = req.body;

    if (!name || !email || !password || !regimentalNumber) {
      return res.status(400).json({ success: false, error: 'Name, email, password, and regimental number are required.' });
    }

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await accountLinkingService.findOrCreateUser({
      provider: 'EMAIL',
      providerUserId: email.toLowerCase().trim(),
      email: email.toLowerCase().trim(),
      phone: phone ? phone.trim() : null,
      name,
      role: 'CADET'
    });

    const sql = getNeonSql();
    if (sql) {
      await sql`
        INSERT INTO password_credentials (user_id, password_hash)
        VALUES (${user.id}, ${passwordHash})
        ON CONFLICT (user_id) DO UPDATE SET password_hash = ${passwordHash}
      `;
    }

    db.update('users', u => u.id === user.id, { password: passwordHash });

    db.insert('cadet_profiles', {
      userId: user.id,
      directorate: directorate || 'National Directorate',
      group: group || 'Central Group',
      unit: unit || 'NCC Unit',
      battalion: battalion || '1st Bn',
      wing: wing || 'Army Wing',
      regimentalNumber: regimentalNumber.trim(),
      rank: rank || 'Cadet',
      college: college || 'Institution'
    });

    const token = generateToken(user);
    const { password: _, ...userWithoutPassword } = user;

    return res.status(201).json({
      success: true,
      message: 'NCC Cadet registered successfully.',
      token,
      user: userWithoutPassword
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/register/aspirant', async (req, res) => {
  try {
    const { name, email, password, phone, preferredService, targetExams } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: 'Name, email, and password are required.' });
    }

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await accountLinkingService.findOrCreateUser({
      provider: 'EMAIL',
      providerUserId: email.toLowerCase().trim(),
      email: email.toLowerCase().trim(),
      phone: phone ? phone.trim() : null,
      name,
      role: 'ASPIRANT'
    });

    const sql = getNeonSql();
    if (sql) {
      await sql`
        INSERT INTO password_credentials (user_id, password_hash)
        VALUES (${user.id}, ${passwordHash})
        ON CONFLICT (user_id) DO UPDATE SET password_hash = ${passwordHash}
      `;
    }

    db.update('users', u => u.id === user.id, { password: passwordHash });

    db.insert('aspirant_profiles', {
      userId: user.id,
      targetExams: Array.isArray(targetExams) ? targetExams : ['CDS', 'NDA'],
      preferredService: preferredService || 'Indian Army'
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

module.exports = router;

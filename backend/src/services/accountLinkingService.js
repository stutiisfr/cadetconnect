const { v4: uuidv4 } = require('uuid');
const db = require('../db/database');
const { getNeonSql } = require('../db/neonDb');

class AccountLinkingService {
  /**
   * Safe multi-provider identity resolution and account linking.
   * Prevents duplicate user accounts when the same person signs in with different authentication methods.
   */
  async findOrCreateUser({ provider, providerUserId, email, phone, name, avatar, role = 'ASPIRANT' }) {
    const sql = getNeonSql();
    const cleanEmail = email ? email.toLowerCase().trim() : null;
    const cleanPhone = phone ? phone.replace(/[^0-9+]/g, '') : null;

    // ─────────────────────────────────────────────────────────────
    // 1. NEON POSTGRESQL MULTI-PROVIDER IDENTITY RESOLUTION
    // ─────────────────────────────────────────────────────────────
    if (sql) {
      try {
        // Step A: Check if provider identity is already linked to a user account
        const existingAuth = await sql`
          SELECT user_id FROM auth_accounts 
          WHERE provider = ${provider} AND provider_user_id = ${providerUserId}
          LIMIT 1
        `;

        if (existingAuth.length > 0) {
          const userId = existingAuth[0].user_id;
          const userRows = await sql`SELECT * FROM users WHERE id = ${userId} LIMIT 1`;
          if (userRows.length > 0) {
            console.log(`[AUTH LINKING] Found existing linked account for provider ${provider} (User ID: ${userId})`);
            return this._formatUserRecord(userRows[0]);
          }
        }

        // Step B: Search for existing user account by verified Email or Phone
        let matchedUser = null;
        if (cleanEmail) {
          const emailMatch = await sql`SELECT * FROM users WHERE LOWER(email) = ${cleanEmail} LIMIT 1`;
          if (emailMatch.length > 0) matchedUser = emailMatch[0];
        }

        if (!matchedUser && cleanPhone) {
          const phoneMatch = await sql`SELECT * FROM users WHERE phone = ${cleanPhone} LIMIT 1`;
          if (phoneMatch.length > 0) matchedUser = phoneMatch[0];
        }

        // Step C: Link provider identity to existing user account if matched
        if (matchedUser) {
          console.log(`[AUTH LINKING] Safely linking new provider ${provider} to existing CadetConnect user (ID: ${matchedUser.id})`);
          
          await sql`
            INSERT INTO auth_accounts (user_id, provider, provider_user_id)
            VALUES (${matchedUser.id}, ${provider}, ${providerUserId})
            ON CONFLICT (provider, provider_user_id) DO NOTHING
          `;

          // Update verification flags if signed in via trusted OAuth
          if (['GOOGLE', 'LINKEDIN', 'FACEBOOK'].includes(provider) && cleanEmail) {
            await sql`UPDATE users SET email_verified = TRUE, updated_at = NOW() WHERE id = ${matchedUser.id}`;
          } else if (provider === 'PHONE' && cleanPhone) {
            await sql`UPDATE users SET phone_verified = TRUE, updated_at = NOW() WHERE id = ${matchedUser.id}`;
          }

          const updatedRows = await sql`SELECT * FROM users WHERE id = ${matchedUser.id} LIMIT 1`;
          return this._formatUserRecord(updatedRows[0] || matchedUser);
        }

        // Step D: Create brand new user account and link initial provider
        console.log(`[AUTH LINKING] Creating new user account for provider ${provider} (${cleanEmail || cleanPhone})`);
        const username = (cleanEmail ? cleanEmail.split('@')[0] : `cadet_${provider.toLowerCase()}`)
          .toLowerCase()
          .replace(/[^a-z0-9]/g, '_') + '_' + Math.floor(1000 + Math.random() * 9000);

        const newUsers = await sql`
          INSERT INTO users (
            email, phone, name, username, role, profile_image, 
            email_verified, phone_verified, verification_badge
          ) VALUES (
            ${cleanEmail}, ${cleanPhone}, ${name || 'Cadet User'}, ${username}, ${role}::user_role, ${avatar || ''},
            ${['GOOGLE', 'LINKEDIN', 'FACEBOOK'].includes(provider)}, ${provider === 'PHONE'}, 
            ${role === 'CADET' ? 'Verified Cadet' : 'Verified Aspirant'}
          ) RETURNING *
        `;

        const newUser = newUsers[0];

        await sql`
          INSERT INTO auth_accounts (user_id, provider, provider_user_id)
          VALUES (${newUser.id}, ${provider}, ${providerUserId})
        `;

        // Sync with local memory database engine as well for legacy fallback endpoints
        db.insert('users', {
          id: newUser.id,
          email: cleanEmail || '',
          name: newUser.name,
          username: newUser.username,
          role: newUser.role,
          isVerified: true,
          verificationBadge: newUser.verification_badge,
          avatar: newUser.profile_image,
          phone: cleanPhone || ''
        });

        return this._formatUserRecord(newUser);
      } catch (err) {
        console.error('[AUTH LINKING ERROR] SQL resolution failed, falling back to local store:', err.message);
      }
    }

    // ─────────────────────────────────────────────────────────────
    // 2. LOCAL ENGINE FALLBACK RESOLUTION
    // ─────────────────────────────────────────────────────────────
    let localUser = null;
    if (cleanEmail) {
      localUser = db.findOne('users', u => u.email && u.email.toLowerCase() === cleanEmail);
    }
    if (!localUser && cleanPhone) {
      localUser = db.findOne('users', u => u.phone && u.phone.replace(/[^0-9]/g, '') === cleanPhone.replace(/[^0-9]/g, ''));
    }

    if (localUser) {
      db.update('users', u => u.id === localUser.id, {
        ...(cleanEmail && { emailVerified: true }),
        ...(cleanPhone && { phoneVerified: true })
      });
      return db.findOne('users', u => u.id === localUser.id);
    }

    const username = (cleanEmail ? cleanEmail.split('@')[0] : `cadet_${provider.toLowerCase()}`)
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '_') + '_' + Math.floor(1000 + Math.random() * 9000);

    const newUser = db.insert('users', {
      email: cleanEmail || `cadet_${Date.now()}@cadetconnect.org`,
      password: uuidv4(),
      name: name || 'Cadet Member',
      username,
      role,
      isVerified: true,
      verificationBadge: role === 'CADET' ? 'Verified Cadet' : 'Verified Aspirant',
      avatar: avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
      location: 'India',
      phone: cleanPhone || ''
    });

    return newUser;
  }

  _formatUserRecord(row) {
    if (!row) return null;
    return {
      id: row.id,
      email: row.email,
      phone: row.phone,
      name: row.name,
      username: row.username,
      role: row.role,
      isVerified: row.status === 'ACTIVE',
      verificationBadge: row.verification_badge || 'Verified Aspirant',
      avatar: row.profile_image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
      location: 'India',
      emailVerified: row.email_verified,
      phoneVerified: row.phone_verified,
      createdAt: row.created_at
    };
  }
}

const accountLinkingService = new AccountLinkingService();
module.exports = accountLinkingService;

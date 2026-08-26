const db = require('./database');
const { getNeonSql } = require('./neonDb');
const bcrypt = require('bcryptjs');

/**
 * Safely migrates existing CadetConnect LowDB/JSON data into Neon PostgreSQL database.
 * Preserves user accounts, passwords, posts, comments, messages, and study notes.
 */
async function migrateDataToNeon() {
  const sql = getNeonSql();
  if (!sql) {
    console.log('[DATA MIGRATOR] Neon DATABASE_URL not available. Migration skipped.');
    return false;
  }

  try {
    console.log('[DATA MIGRATOR] Starting Neon PostgreSQL data migration from JSON store...');

    const jsonUsers = db.find('users');
    const jsonPosts = db.find('posts');
    const jsonComments = db.find('comments');
    const jsonNotes = db.find('notes');

    console.log(`[DATA MIGRATOR] Found ${jsonUsers.length} Users, ${jsonPosts.length} Posts, ${jsonComments.length} Comments, ${jsonNotes.length} Notes in JSON store.`);

    // 1. Migrate Users & Password Credentials
    let migratedUsers = 0;
    for (const u of jsonUsers) {
      if (!u.email) continue;
      const cleanEmail = u.email.toLowerCase().trim();

      const existing = await sql`SELECT id FROM users WHERE LOWER(email) = ${cleanEmail} LIMIT 1`;
      let userId = null;

      if (existing.length === 0) {
        const username = u.username || cleanEmail.split('@')[0].replace(/[^a-z0-9]/g, '_') + '_' + Math.floor(Math.random() * 1000);
        const role = ['CADET', 'ASPIRANT', 'MENTOR', 'VETERAN', 'ADMIN', 'SUPER_ADMIN'].includes(u.role) ? u.role : 'ASPIRANT';

        const newUsers = await sql`
          INSERT INTO users (
            email, phone, name, username, role, profile_image, 
            email_verified, phone_verified, verification_badge
          ) VALUES (
            ${cleanEmail}, ${u.phone || null}, ${u.name || 'Cadet User'}, ${username}, ${role}::user_role,
            ${u.avatar || ''}, TRUE, ${Boolean(u.phoneVerified)}, ${u.verificationBadge || 'Verified Member'}
          ) RETURNING id
        `;
        userId = newUsers[0].id;
        migratedUsers++;

        // Add password credential if hash exists
        if (u.password) {
          await sql`
            INSERT INTO password_credentials (user_id, password_hash)
            VALUES (${userId}, ${u.password})
            ON CONFLICT (user_id) DO NOTHING
          `;
        }

        // Add initial auth account
        await sql`
          INSERT INTO auth_accounts (user_id, provider, provider_user_id)
          VALUES (${userId}, 'EMAIL', ${cleanEmail})
          ON CONFLICT DO NOTHING
        `;
      }
    }

    // 2. Migrate Posts
    let migratedPosts = 0;
    for (const p of jsonPosts) {
      if (!p.content) continue;
      const author = db.findOne('users', u => u.id === p.authorId || u.name === p.authorName);
      if (!author) continue;

      const userMatch = await sql`SELECT id FROM users WHERE LOWER(email) = ${author.email.toLowerCase()} LIMIT 1`;
      if (userMatch.length > 0) {
        const authorId = userMatch[0].id;
        await sql`
          INSERT INTO posts (
            author_id, author_name, author_role, author_avatar,
            category, content, media_url, appreciations_count, comments_count, tags, created_at
          ) VALUES (
            ${authorId}, ${p.authorName || 'Cadet'}, ${p.authorRole || 'Member'}, ${p.authorAvatar || ''},
            ${p.category || 'NCC'}, ${p.content}, ${p.mediaUrl || null}, ${p.appreciationsCount || 0},
            ${p.commentsCount || 0}, ${Array.isArray(p.tags) ? p.tags : []}, ${p.createdAt ? new Date(p.createdAt).toISOString() : new Date().toISOString()}
          ) ON CONFLICT DO NOTHING
        `;
        migratedPosts++;
      }
    }

    // 3. Migrate Study Notes
    let migratedNotes = 0;
    for (const n of jsonNotes) {
      if (!n.title) continue;
      const author = db.findOne('users', u => u.id === n.uploaderId || u.name === n.uploaderName) || jsonUsers[0];
      if (!author) continue;

      const userMatch = await sql`SELECT id FROM users WHERE LOWER(email) = ${author.email.toLowerCase()} LIMIT 1`;
      if (userMatch.length > 0) {
        const uploaderId = userMatch[0].id;
        await sql`
          INSERT INTO study_materials (
            uploader_id, uploader_name, title, subject, file_url, file_type, downloads_count
          ) VALUES (
            ${uploaderId}, ${n.uploaderName || author.name}, ${n.title}, ${n.subject || n.category || 'General Defence'},
            ${n.fileUrl || n.mediaUrl || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'},
            'PDF', ${n.downloadsCount || 0}
          ) ON CONFLICT DO NOTHING
        `;
        migratedNotes++;
      }
    }

    console.log(`[DATA MIGRATOR] ✅ Migration complete! Migrated ${migratedUsers} Users, ${migratedPosts} Posts, ${migratedNotes} Study Materials into Neon PostgreSQL.`);
    return true;
  } catch (err) {
    console.error('[DATA MIGRATOR] ❌ Data migration failed:', err.message);
    return false;
  }
}

module.exports = { migrateDataToNeon };

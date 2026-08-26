const { getNeonSql } = require('./neonDb');
const db = require('./database');

/**
 * Production Data Access Repository for CadetConnect.
 * Executes queries against Neon PostgreSQL when DATABASE_URL is configured,
 * with transparent fallback to local DB engine for offline development.
 */
class PgRepository {
  // ─────────────────────────────────────────────────────────────
  // USERS & PROFILES
  // ─────────────────────────────────────────────────────────────
  async findUserById(id) {
    const sql = getNeonSql();
    if (sql) {
      try {
        const rows = await sql`SELECT * FROM users WHERE id = ${id} LIMIT 1`;
        if (rows.length > 0) return this._formatUser(rows[0]);
      } catch (err) {
        console.error('[PG REPO] findUserById error:', err.message);
      }
    }
    return db.findOne('users', u => u.id === id);
  }

  async findUserByUsername(username) {
    const sql = getNeonSql();
    if (sql) {
      try {
        const rows = await sql`SELECT * FROM users WHERE LOWER(username) = ${username.toLowerCase().trim()} LIMIT 1`;
        if (rows.length > 0) return this._formatUser(rows[0]);
      } catch (err) {
        console.error('[PG REPO] findUserByUsername error:', err.message);
      }
    }
    return db.findOne('users', u => u.username && u.username.toLowerCase() === username.toLowerCase());
  }

  async updateUserProfile(userId, updateFields) {
    const sql = getNeonSql();
    if (sql) {
      try {
        await sql`
          UPDATE users SET 
            name = COALESCE(${updateFields.name || null}, name),
            headline = COALESCE(${updateFields.headline || null}, headline),
            bio = COALESCE(${updateFields.bio || null}, bio),
            location = COALESCE(${updateFields.location || null}, location),
            profile_image = COALESCE(${updateFields.avatar || updateFields.profile_image || null}, profile_image),
            cover_image = COALESCE(${updateFields.cover_image || null}, cover_image),
            updated_at = NOW()
          WHERE id = ${userId}
        `;
        return this.findUserById(userId);
      } catch (err) {
        console.error('[PG REPO] updateUserProfile error:', err.message);
      }
    }
    db.update('users', u => u.id === userId, updateFields);
    return db.findOne('users', u => u.id === userId);
  }

  // ─────────────────────────────────────────────────────────────
  // EDUCATION & EXPERIENCE
  // ─────────────────────────────────────────────────────────────
  async getEducationRecords(userId) {
    const sql = getNeonSql();
    if (sql) {
      try {
        const rows = await sql`SELECT * FROM education_records WHERE user_id = ${userId} ORDER BY start_year DESC NULLS LAST`;
        return rows;
      } catch (err) {
        console.error('[PG REPO] getEducationRecords error:', err.message);
      }
    }
    return db.find('education', e => e.userId === userId);
  }

  async addEducationRecord(userId, data) {
    const sql = getNeonSql();
    if (sql) {
      try {
        const rows = await sql`
          INSERT INTO education_records (
            user_id, institution, degree, field_of_study, start_year, end_year, is_current, grade, description
          ) VALUES (
            ${userId}, ${data.institution}, ${data.degree || ''}, ${data.fieldOfStudy || ''},
            ${data.startYear || null}, ${data.endYear || null}, ${Boolean(data.isCurrent)},
            ${data.grade || ''}, ${data.description || ''}
          ) RETURNING *
        `;
        return rows[0];
      } catch (err) {
        console.error('[PG REPO] addEducationRecord error:', err.message);
      }
    }
    return db.insert('education', { userId, ...data });
  }

  async deleteEducationRecord(id, userId) {
    const sql = getNeonSql();
    if (sql) {
      try {
        await sql`DELETE FROM education_records WHERE id = ${id} AND user_id = ${userId}`;
        return true;
      } catch (err) {
        console.error('[PG REPO] deleteEducationRecord error:', err.message);
      }
    }
    return db.delete('education', e => e.id === id && e.userId === userId);
  }

  async getExperienceRecords(userId) {
    const sql = getNeonSql();
    if (sql) {
      try {
        const rows = await sql`SELECT * FROM experience_records WHERE user_id = ${userId} ORDER BY created_at DESC`;
        return rows;
      } catch (err) {
        console.error('[PG REPO] getExperienceRecords error:', err.message);
      }
    }
    return db.find('experience', e => e.userId === userId);
  }

  async addExperienceRecord(userId, data) {
    const sql = getNeonSql();
    if (sql) {
      try {
        const rows = await sql`
          INSERT INTO experience_records (
            user_id, organization, role, start_date, end_date, is_current, description
          ) VALUES (
            ${userId}, ${data.organization}, ${data.role}, ${data.startDate || ''},
            ${data.endDate || ''}, ${Boolean(data.isCurrent)}, ${data.description || ''}
          ) RETURNING *
        `;
        return rows[0];
      } catch (err) {
        console.error('[PG REPO] addExperienceRecord error:', err.message);
      }
    }
    return db.insert('experience', { userId, ...data });
  }

  async deleteExperienceRecord(id, userId) {
    const sql = getNeonSql();
    if (sql) {
      try {
        await sql`DELETE FROM experience_records WHERE id = ${id} AND user_id = ${userId}`;
        return true;
      } catch (err) {
        console.error('[PG REPO] deleteExperienceRecord error:', err.message);
      }
    }
    return db.delete('experience', e => e.id === id && e.userId === userId);
  }

  // ─────────────────────────────────────────────────────────────
  // FEED POSTS & COMMENTS
  // ─────────────────────────────────────────────────────────────
  async getPosts({ category, search, limit = 20, offset = 0 }) {
    const sql = getNeonSql();
    if (sql) {
      try {
        let rows = [];
        if (category && category !== 'For You' && category !== 'All') {
          rows = await sql`
            SELECT * FROM posts 
            WHERE category = ${category}
            ORDER BY created_at DESC 
            LIMIT ${limit} OFFSET ${offset}
          `;
        } else if (search) {
          const q = `%${search.toLowerCase()}%`;
          rows = await sql`
            SELECT * FROM posts 
            WHERE LOWER(content) LIKE ${q} OR LOWER(author_name) LIKE ${q}
            ORDER BY created_at DESC 
            LIMIT ${limit} OFFSET ${offset}
          `;
        } else {
          rows = await sql`
            SELECT * FROM posts 
            ORDER BY created_at DESC 
            LIMIT ${limit} OFFSET ${offset}
          `;
        }
        return rows.map(r => this._formatPost(r));
      } catch (err) {
        console.error('[PG REPO] getPosts error:', err.message);
      }
    }

    let posts = db.find('posts');
    if (category && category !== 'For You' && category !== 'All') {
      posts = posts.filter(p => p.category === category);
    }
    if (search) {
      const q = search.toLowerCase();
      posts = posts.filter(p => p.content.toLowerCase().includes(q) || p.authorName.toLowerCase().includes(q));
    }
    return posts.slice(offset, offset + limit);
  }

  async createPost(userId, postData) {
    const sql = getNeonSql();
    const user = await this.findUserById(userId);
    if (!user) throw new Error('User not found.');

    if (sql) {
      try {
        const rows = await sql`
          INSERT INTO posts (
            author_id, author_name, author_role, author_avatar,
            category, content, media_url, tags
          ) VALUES (
            ${userId}, ${user.name}, ${user.verificationBadge || user.role}, ${user.avatar || ''},
            ${postData.category || 'NCC'}, ${postData.content}, ${postData.mediaUrl || null},
            ${Array.isArray(postData.tags) ? postData.tags : ['CadetConnect']}
          ) RETURNING *
        `;
        return this._formatPost(rows[0]);
      } catch (err) {
        console.error('[PG REPO] createPost error:', err.message);
      }
    }

    const post = db.insert('posts', {
      authorId: userId,
      authorName: user.name,
      authorRole: user.verificationBadge || user.role,
      authorAvatar: user.avatar,
      category: postData.category || 'NCC',
      content: postData.content,
      mediaUrl: postData.mediaUrl || null,
      appreciationsCount: 0,
      commentsCount: 0,
      tags: Array.isArray(postData.tags) ? postData.tags : ['CadetConnect'],
      createdAt: new Date().toISOString()
    });
    return post;
  }

  async appreciatePost(postId, userId) {
    const sql = getNeonSql();
    if (sql) {
      try {
        await sql`
          INSERT INTO post_reactions (post_id, user_id, reaction_type)
          VALUES (${postId}, ${userId}, 'SALUTE')
          ON CONFLICT (post_id, user_id) DO NOTHING
        `;
        await sql`
          UPDATE posts SET appreciations_count = appreciations_count + 1 WHERE id = ${postId}
        `;
        const updated = await sql`SELECT appreciations_count FROM posts WHERE id = ${postId} LIMIT 1`;
        return updated[0]?.appreciations_count || 1;
      } catch (err) {
        console.error('[PG REPO] appreciatePost error:', err.message);
      }
    }
    const post = db.findOne('posts', p => p.id === postId);
    const count = (post?.appreciationsCount || 0) + 1;
    db.update('posts', p => p.id === postId, { appreciationsCount: count });
    return count;
  }

  async deletePost(postId, userId, isAdmin = false) {
    const sql = getNeonSql();
    if (sql) {
      try {
        if (isAdmin) {
          await sql`DELETE FROM posts WHERE id = ${postId}`;
        } else {
          await sql`DELETE FROM posts WHERE id = ${postId} AND author_id = ${userId}`;
        }
        return true;
      } catch (err) {
        console.error('[PG REPO] deletePost error:', err.message);
      }
    }
    return db.delete('posts', p => p.id === postId);
  }

  // ─────────────────────────────────────────────────────────────
  // MESSAGES
  // ─────────────────────────────────────────────────────────────
  async getMessages(userA, userB) {
    const sql = getNeonSql();
    if (sql) {
      try {
        const rows = await sql`
          SELECT * FROM messages 
          WHERE (sender_id = ${userA} AND recipient_id = ${userB}) 
             OR (sender_id = ${userB} AND recipient_id = ${userA})
          ORDER BY sent_at ASC
        `;
        return rows.map(m => ({
          id: m.id,
          senderId: m.sender_id,
          recipientId: m.recipient_id,
          text: m.text,
          mediaUrl: m.media_url,
          isRead: m.is_read,
          sentAt: m.sent_at
        }));
      } catch (err) {
        console.error('[PG REPO] getMessages error:', err.message);
      }
    }
    return db.find('messages', m => (m.senderId === userA && m.recipientId === userB) || (m.senderId === userB && m.recipientId === userA));
  }

  async sendMessage(senderId, recipientId, text, mediaUrl = null) {
    const sql = getNeonSql();
    if (sql) {
      try {
        const rows = await sql`
          INSERT INTO messages (sender_id, recipient_id, text, media_url)
          VALUES (${senderId}, ${recipientId}, ${text}, ${mediaUrl})
          RETURNING *
        `;
        return {
          id: rows[0].id,
          senderId: rows[0].sender_id,
          recipientId: rows[0].recipient_id,
          text: rows[0].text,
          mediaUrl: rows[0].media_url,
          sentAt: rows[0].sent_at
        };
      } catch (err) {
        console.error('[PG REPO] sendMessage error:', err.message);
      }
    }
    return db.insert('messages', { senderId, recipientId, text, mediaUrl, sentAt: new Date().toISOString() });
  }

  // Helper Formatter Methods
  _formatUser(row) {
    if (!row) return null;
    return {
      id: row.id,
      email: row.email,
      phone: row.phone,
      name: row.name,
      username: row.username,
      role: row.role,
      profile_image: row.profile_image,
      avatar: row.profile_image,
      cover_image: row.cover_image,
      headline: row.headline || `${row.role} at CadetConnect`,
      bio: row.bio || '',
      location: row.location || 'India',
      verificationBadge: row.verification_badge || 'Verified Member',
      isVerified: row.status === 'ACTIVE',
      createdAt: row.created_at
    };
  }

  _formatPost(row) {
    if (!row) return null;
    return {
      id: row.id,
      authorId: row.author_id,
      authorName: row.author_name,
      authorRole: row.author_role,
      authorAvatar: row.author_avatar,
      category: row.category,
      content: row.content,
      mediaUrl: row.media_url,
      appreciationsCount: row.appreciations_count || 0,
      commentsCount: row.comments_count || 0,
      sharesCount: row.shares_count || 0,
      tags: row.tags || [],
      createdAt: row.created_at
    };
  }
}

const pgRepository = new PgRepository();
module.exports = pgRepository;

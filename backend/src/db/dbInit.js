const { getNeonSql } = require('./neonDb');

/**
 * Initializes Neon PostgreSQL database schema for CadetConnect.
 * Creates relational tables for Users, Auth Accounts, Education, Experience, NCC Records,
 * Posts, Reactions, Comments, Saved Posts, Connections, Follows, Conversations, Messages,
 * Notifications, Study Materials, Reports, and Audit Logs.
 */
async function initNeonAuthTables() {
  const sql = getNeonSql();
  if (!sql) {
    console.log('[NEON DB INIT] Neon DATABASE_URL not configured or invalid, skipping SQL schema migration.');
    return false;
  }

  try {
    console.log('[NEON DB INIT] Running complete PostgreSQL schema migrations...');

    // 1. Create Enums
    await sql`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
          CREATE TYPE user_role AS ENUM ('CADET', 'ASPIRANT', 'MENTOR', 'VETERAN', 'ADMIN', 'SUPER_ADMIN');
        END IF;
      END $$;
    `;

    await sql`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_status') THEN
          CREATE TYPE user_status AS ENUM ('ACTIVE', 'SUSPENDED', 'PENDING_VERIFICATION');
        END IF;
      END $$;
    `;

    await sql`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'reaction_type') THEN
          CREATE TYPE reaction_type AS ENUM ('SALUTE', 'HELPFUL', 'INSIGHTFUL', 'CELEBRATE');
        END IF;
      END $$;
    `;

    await sql`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'connection_status') THEN
          CREATE TYPE connection_status AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');
        END IF;
      END $$;
    `;

    // 2. Users Table
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE,
        phone VARCHAR(50) UNIQUE,
        name VARCHAR(255) NOT NULL,
        username VARCHAR(255) UNIQUE NOT NULL,
        role user_role DEFAULT 'ASPIRANT',
        profile_image TEXT,
        cover_image TEXT,
        headline TEXT,
        bio TEXT,
        location VARCHAR(255) DEFAULT 'India',
        status user_status DEFAULT 'ACTIVE',
        verification_badge VARCHAR(100) DEFAULT 'Aspirant',
        email_verified BOOLEAN DEFAULT FALSE,
        phone_verified BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // 3. Auth Accounts
    await sql`
      CREATE TABLE IF NOT EXISTS auth_accounts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        provider VARCHAR(50) NOT NULL,
        provider_user_id VARCHAR(255) NOT NULL,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT unique_provider_user UNIQUE(provider, provider_user_id)
      );
    `;

    // 4. Sessions
    await sql`
      CREATE TABLE IF NOT EXISTS sessions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        session_token VARCHAR(512) UNIQUE NOT NULL,
        ip_address VARCHAR(45),
        user_agent TEXT,
        expires_at TIMESTAMPTZ NOT NULL,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // 5. Password Credentials
    await sql`
      CREATE TABLE IF NOT EXISTS password_credentials (
        user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        password_hash TEXT NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // 6. Password Reset Tokens
    await sql`
      CREATE TABLE IF NOT EXISTS password_reset_tokens (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token_hash VARCHAR(255) NOT NULL,
        expires_at TIMESTAMPTZ NOT NULL,
        used_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // 7. Education Records
    await sql`
      CREATE TABLE IF NOT EXISTS education_records (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        institution VARCHAR(255) NOT NULL,
        degree VARCHAR(255),
        field_of_study VARCHAR(255),
        start_year INT,
        end_year INT,
        is_current BOOLEAN DEFAULT FALSE,
        grade VARCHAR(50),
        description TEXT,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // 8. Experience Records
    await sql`
      CREATE TABLE IF NOT EXISTS experience_records (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        organization VARCHAR(255) NOT NULL,
        role VARCHAR(255) NOT NULL,
        start_date VARCHAR(50),
        end_date VARCHAR(50),
        is_current BOOLEAN DEFAULT FALSE,
        description TEXT,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // 9. NCC Records Vault
    await sql`
      CREATE TABLE IF NOT EXISTS ncc_records (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        wing VARCHAR(100) DEFAULT 'Army Wing',
        rank VARCHAR(100) DEFAULT 'Cadet',
        unit VARCHAR(255) DEFAULT 'General Unit',
        battalion VARCHAR(255) DEFAULT 'General Battalion',
        directorate VARCHAR(255) DEFAULT 'General Directorate',
        regimental_number_encrypted TEXT,
        camps TEXT[] DEFAULT '{}',
        certificates TEXT[] DEFAULT '{}',
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // 10. Posts
    await sql`
      CREATE TABLE IF NOT EXISTS posts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        author_name VARCHAR(255) NOT NULL,
        author_role VARCHAR(255) DEFAULT 'Cadet',
        author_avatar TEXT,
        category VARCHAR(100) DEFAULT 'NCC',
        content TEXT NOT NULL,
        media_url TEXT,
        media_type VARCHAR(50) DEFAULT 'IMAGE',
        appreciations_count INT DEFAULT 0,
        comments_count INT DEFAULT 0,
        shares_count INT DEFAULT 0,
        tags TEXT[] DEFAULT '{}',
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // 11. Post Reactions (Multitype: SALUTE, HELPFUL, INSIGHTFUL, CELEBRATE)
    await sql`
      CREATE TABLE IF NOT EXISTS post_reactions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        reaction_type reaction_type DEFAULT 'SALUTE',
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT unique_user_post_reaction UNIQUE(post_id, user_id)
      );
    `;

    // 12. Comments
    await sql`
      CREATE TABLE IF NOT EXISTS comments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
        author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        author_name VARCHAR(255) NOT NULL,
        author_avatar TEXT,
        text TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // 13. Saved Posts
    await sql`
      CREATE TABLE IF NOT EXISTS saved_posts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT unique_user_saved_post UNIQUE(user_id, post_id)
      );
    `;

    // 14. Connections Graph
    await sql`
      CREATE TABLE IF NOT EXISTS connections (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        requester_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        recipient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        status connection_status DEFAULT 'PENDING',
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT unique_connection UNIQUE(requester_id, recipient_id)
      );
    `;

    // 15. Follows Graph
    await sql`
      CREATE TABLE IF NOT EXISTS follows (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        follower_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        following_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT unique_follow UNIQUE(follower_id, following_id)
      );
    `;

    // 16. Conversations & Messages
    await sql`
      CREATE TABLE IF NOT EXISTS conversations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        participant_a UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        participant_b UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        last_message TEXT,
        last_updated TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT unique_participants UNIQUE(participant_a, participant_b)
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS messages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
        sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        recipient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        text TEXT NOT NULL,
        media_url TEXT,
        is_read BOOLEAN DEFAULT FALSE,
        sent_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // 17. Notifications
    await sql`
      CREATE TABLE IF NOT EXISTS notifications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        actor_id UUID REFERENCES users(id) ON DELETE SET NULL,
        actor_name VARCHAR(255),
        type VARCHAR(100) NOT NULL,
        message TEXT NOT NULL,
        target_link VARCHAR(255),
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // 18. Study Materials
    await sql`
      CREATE TABLE IF NOT EXISTS study_materials (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        uploader_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        uploader_name VARCHAR(255) NOT NULL,
        title VARCHAR(255) NOT NULL,
        subject VARCHAR(255) NOT NULL,
        file_url TEXT NOT NULL,
        file_type VARCHAR(50) DEFAULT 'PDF',
        file_size INT DEFAULT 0,
        downloads_count INT DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // 19. Reports & Audit Logs
    await sql`
      CREATE TABLE IF NOT EXISTS reports (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        reporter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        reporter_name VARCHAR(255),
        target_type VARCHAR(100) NOT NULL,
        target_id VARCHAR(255) NOT NULL,
        reason TEXT NOT NULL,
        status VARCHAR(50) DEFAULT 'PENDING',
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        admin_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        action VARCHAR(100) NOT NULL,
        target_resource VARCHAR(100) NOT NULL,
        target_id VARCHAR(255) NOT NULL,
        details TEXT,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_posts_author ON posts(author_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_posts_category_created ON posts(category, created_at DESC);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id, sent_at ASC);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, is_read);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_connections_status ON connections(recipient_id, status);`;

    console.log('[NEON DB INIT] ✅ Complete relational schema & indexes initialized successfully!');
    return true;
  } catch (err) {
    console.error('[NEON DB INIT] ❌ Schema initialization failed:', err.message);
    return false;
  }
}

module.exports = { initNeonAuthTables };

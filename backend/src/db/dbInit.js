const { getNeonSql } = require('./neonDb');

/**
 * Initializes Neon PostgreSQL database schema for CadetConnect Multi-Provider Authentication.
 * Creates users, auth_accounts, sessions, password_credentials, and password_reset_tokens tables.
 */
async function initNeonAuthTables() {
  const sql = getNeonSql();
  if (!sql) {
    console.log('[NEON DB INIT] Neon DATABASE_URL not configured or invalid, skipping SQL schema migration.');
    return false;
  }

  try {
    console.log('[NEON DB INIT] Running PostgreSQL authentication schema migrations...');

    // 1. Create Enums if not existing
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

    // 2. Create Users Table
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE,
        phone VARCHAR(50) UNIQUE,
        name VARCHAR(255) NOT NULL,
        username VARCHAR(255) UNIQUE NOT NULL,
        role user_role DEFAULT 'ASPIRANT',
        profile_image TEXT,
        email_verified BOOLEAN DEFAULT FALSE,
        phone_verified BOOLEAN DEFAULT FALSE,
        status user_status DEFAULT 'ACTIVE',
        verification_badge VARCHAR(100) DEFAULT 'Aspirant',
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // 3. Create Auth Accounts Table (Multi-Provider Account Linking)
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

    // 4. Create Sessions Table
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

    // 5. Create Password Credentials Table
    await sql`
      CREATE TABLE IF NOT EXISTS password_credentials (
        user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        password_hash TEXT NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // 6. Create Password Reset Tokens Table
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

    // 7. Create Indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_auth_accounts_user ON auth_accounts(user_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(session_token);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_password_reset_hash ON password_reset_tokens(token_hash);`;

    console.log('[NEON DB INIT] ✅ PostgreSQL authentication tables & indexes created successfully!');
    return true;
  } catch (err) {
    console.error('[NEON DB INIT] ❌ Error initializing authentication tables:', err.message);
    return false;
  }
}

module.exports = { initNeonAuthTables };

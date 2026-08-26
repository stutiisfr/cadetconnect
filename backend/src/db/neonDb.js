const { neon } = require('@neondatabase/serverless');

/**
 * Neon PostgreSQL Serverless Client Wrapper for CadetConnect.
 * Seamlessly executes SQL queries against Neon PostgreSQL when DATABASE_URL is configured.
 */
function getNeonSql() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl || (!dbUrl.startsWith('postgres://') && !dbUrl.startsWith('postgresql://'))) {
    return null;
  }
  try {
    const sql = neon(dbUrl);
    return sql;
  } catch (err) {
    console.warn('[NEON POSTGRESQL] Could not initialize Neon SQL driver:', err.message);
    return null;
  }
}

module.exports = { getNeonSql };

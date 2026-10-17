const mysql = require('mysql2/promise');
require('dotenv').config();

/**
 * Parse a connection URL into discrete options so the API can be configured
 * either with individual DB_* variables or with a single DATABASE_URL
 * (what most managed MySQL providers hand out).
 *
 * Supports:  mysql://user:pass@host:port/dbname
 *          :  mysql2://user:pass@host:port/dbname
 */
function fromUrl(url) {
  try {
    const u = new URL(url);
    return {
      host: u.hostname,
      port: u.port ? Number(u.port) : 3306,
      user: decodeURIComponent(u.username || ''),
      password: decodeURIComponent(u.password || ''),
      database: decodeURIComponent((u.pathname || '/').replace(/^\//, '')) || undefined,
    };
  } catch {
    /* An unparseable URL should not crash the process; individual DB_* wins. */
    return {};
  }
}

const urlOpts = process.env.DATABASE_URL ? fromUrl(process.env.DATABASE_URL) : {};

const host = process.env.DB_HOST || urlOpts.host || 'localhost';

/* Local development (XAMPP/Docker on this machine) never uses TLS. */
const isLocal = /^(localhost|127\.0\.0\.1|::1)$/i.test(host);

/* TLS is the norm for managed MySQL (Aiven, PlanetScale, Railway…).
   Default: on for remote hosts, off locally. Override with DB_SSL=true/false. */
const ssl = process.env.DB_SSL
  ? String(process.env.DB_SSL).toLowerCase() !== 'false'
  : !isLocal;

const pool = mysql.createPool({
  host,
  port: Number(process.env.DB_PORT) || urlOpts.port || 3306,
  user: process.env.DB_USER || urlOpts.user || 'root',
  password: process.env.DB_PASSWORD || urlOpts.password || '',
  database: process.env.DB_NAME || urlOpts.database || 'ooha_gifts',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4',
  timezone: '+00:00',
  /* Long-lived connections: hosts such as Render recycle idle sockets, so keep
     them alive and fail fast-and-loudly instead of hanging the API. */
  connectTimeout: 15000,
  enableKeepAlive: true,
  ssl,
});

/** Run a query using the pool. */
async function query(sql, params = []) {
  const [rows] = await pool.query(sql, params);
  return rows;
}

/** Run one query and return the first row (or null). */
async function one(sql, params = []) {
  const rows = await query(sql, params);
  return rows.length ? rows[0] : null;
}

/** Begin a transaction and return a dedicated connection. */
async function begin() {
  const conn = await pool.getConnection();
  await conn.beginTransaction();
  return conn;
}

async function commit(conn) {
  await conn.commit();
  conn.release();
}

async function rollback(conn) {
  try {
    await conn.rollback();
  } finally {
    conn.release();
  }
}

module.exports = { pool, query, one, begin, commit, rollback, fromUrl };

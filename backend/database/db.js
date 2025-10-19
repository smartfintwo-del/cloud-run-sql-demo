
const { Pool } = require('pg');
const path = require('path');

const {
  DB_USER,
  DB_PASSWORD,
  DB_NAME,
  CLOUD_SQL_CONNECTION_NAME,
  DB_HOST,
  DB_PORT = 5432
} = process.env;

delete process.env.PGHOST;
delete process.env.PGPORT;
delete process.env.DATABASE_URL;

const useTcp = !!DB_HOST;
const socketDir = "/cloudsql";
const resolvedHost = useTcp ? DB_HOST : (CLOUD_SQL_CONNECTION_NAME ? path.posix.join(socketDir, CLOUD_SQL_CONNECTION_NAME) : null);

if (!useTcp && !resolvedHost) {
  throw new Error("CLOUD_SQL_CONNECTION_NAME is required when not using DB_HOST");
}

const poolConfig = useTcp ? {
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  host: resolvedHost,
  port: Number(DB_PORT) || 5432,
  ssl: false,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
} : {
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  host: resolvedHost,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
};

const pool = new Pool(poolConfig);

async function query(text, params) { return pool.query(text, params); }
async function testConnection() {
  try { const r = await query("SELECT NOW() as now"); console.log("[DB] OK", r.rows[0].now); return true; }
  catch(e){ console.error("[DB] FAIL", e.message); return false; }
}

module.exports = { pool, query, testConnection };

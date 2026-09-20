import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const APP_ROOT = path.resolve(__dirname, '../..');

function readEnv() {
  const envPath = path.join(APP_ROOT, '.env');
  const env = {};
  if (fs.existsSync(envPath)) {
    for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
      const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
      if (m) env[m[1]] = m[2].replace(/^"(.*)"$/, '$1');
    }
  }
  return env;
}

const env = readEnv();
const connection = env.DB_CONNECTION || 'sqlite';

let driver;

if (connection === 'sqlite') {
  const Database = (await import('better-sqlite3')).default;
  const dbPath = env.DB_DATABASE
    ? path.isAbsolute(env.DB_DATABASE)
      ? env.DB_DATABASE
      : path.join(APP_ROOT, env.DB_DATABASE)
    : path.join(APP_ROOT, 'database/database.sqlite');
  const db = new Database(dbPath);

  driver = {
    type: 'sqlite',
    async query(sql, params = []) {
      const stmt = db.prepare(sql);
      if (/^\s*select/i.test(sql)) {
        return stmt.all(...params);
      }
      const info = stmt.run(...params);
      return { changes: info.changes, lastInsertRowid: info.lastInsertRowid };
    },
    async listTables() {
      return db
        .prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
        .all()
        .map((r) => r.name);
    },
    async describeTable(table) {
      return db.prepare(`PRAGMA table_info(${db.name ? table : table})`).all();
    },
  };
} else if (connection === 'mysql') {
  const mysql = (await import('mysql2/promise')).default;
  const pool = mysql.createPool({
    host: env.DB_HOST || '127.0.0.1',
    port: Number(env.DB_PORT || 3306),
    user: env.DB_USERNAME,
    password: env.DB_PASSWORD,
    database: env.DB_DATABASE,
  });

  driver = {
    type: 'mysql',
    async query(sql, params = []) {
      const [rows] = await pool.query(sql, params);
      return rows;
    },
    async listTables() {
      const [rows] = await pool.query('SHOW TABLES');
      return rows.map((r) => Object.values(r)[0]);
    },
    async describeTable(table) {
      const [rows] = await pool.query(`DESCRIBE \`${table}\``);
      return rows;
    },
  };
} else {
  throw new Error(`Unsupported DB_CONNECTION: ${connection}`);
}

export default driver;
export { APP_ROOT };

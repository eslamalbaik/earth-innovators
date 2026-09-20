// Named vps.js, NOT ssh.js — cmd.exe searches the current directory before PATH
// and PATHEXT includes .JS, so a file named ssh.js silently shadows the real ssh
// command for anyone who cd's into this directory.
import { Client } from 'ssh2'
import { readFileSync } from 'node:fs'
import mysql from 'mysql2/promise'

const APP_DIR = process.env.EARTH_APP_DIR || '/var/www/earth-innovators'

function sshConfig() {
  const host = process.env.EARTH_SSH_HOST
  const username = process.env.EARTH_SSH_USER
  if (!host || !username) {
    throw new Error('EARTH_SSH_HOST and EARTH_SSH_USER must be set. See env.example.')
  }

  const cfg = {
    host,
    username,
    port: Number(process.env.EARTH_SSH_PORT || 22),
    // Without keepalive an idle connection behind NAT drops, and the first call
    // after a quiet period fails for no visible reason.
    keepaliveInterval: 20_000,
    readyTimeout: 20_000,
  }

  if (process.env.EARTH_SSH_KEY) {
    // Node does not expand "~" — this must be an absolute path.
    cfg.privateKey = readFileSync(process.env.EARTH_SSH_KEY)
    if (process.env.EARTH_SSH_PASSPHRASE) cfg.passphrase = process.env.EARTH_SSH_PASSPHRASE
  } else if (process.env.EARTH_SSH_PASSWORD) {
    cfg.password = process.env.EARTH_SSH_PASSWORD
  } else {
    throw new Error('Set EARTH_SSH_KEY (absolute path) or EARTH_SSH_PASSWORD.')
  }

  return cfg
}

let conn = null
let pending = null

/** One reused connection; reconnects automatically after a drop. */
export function connect() {
  if (conn) return Promise.resolve(conn)
  if (pending) return pending

  pending = new Promise((resolve, reject) => {
    const client = new Client()
    client
      .on('ready', () => { conn = client; pending = null; resolve(client) })
      .on('error', err => { conn = null; pending = null; reject(err) })
      .on('close', () => { conn = null })
      .connect(sshConfig())
  })

  return pending
}

export async function exec(command, { timeoutMs = 120_000 } = {}) {
  const client = await connect()

  return new Promise((resolve, reject) => {
    client.exec(command, (err, stream) => {
      if (err) return reject(err)

      let stdout = ''
      let stderr = ''
      // A command that waits for interactive input (sudo asking for a password)
      // would otherwise hang this server forever.
      const timer = setTimeout(() => {
        stream.close()
        reject(new Error(`Command timed out after ${timeoutMs}ms: ${command}`))
      }, timeoutMs)

      stream
        .on('close', (code, signal) => {
          clearTimeout(timer)
          resolve({ code: code ?? null, signal: signal ?? null, stdout, stderr })
        })
        .on('data', d => { stdout += d })
        .stderr.on('data', d => { stderr += d })
    })
  })
}

async function sftp() {
  const client = await connect()
  return new Promise((resolve, reject) =>
    client.sftp((err, s) => (err ? reject(err) : resolve(s))),
  )
}

export async function readFile(path) {
  const s = await sftp()
  return new Promise((resolve, reject) =>
    s.readFile(path, 'utf8', (err, data) => (err ? reject(err) : resolve(data))),
  )
}

export async function writeFile(path, content) {
  const s = await sftp()
  return new Promise((resolve, reject) =>
    s.writeFile(path, content, 'utf8', err => (err ? reject(err) : resolve())),
  )
}

export async function stat(path) {
  const s = await sftp()
  return new Promise(resolve => s.stat(path, (err, attrs) => resolve(err ? null : attrs)))
}

export async function listDir(path) {
  const s = await sftp()
  return new Promise((resolve, reject) =>
    s.readdir(path, (err, list) => (err ? reject(err) : resolve(list))),
  )
}

// ─── Database over the SSH tunnel ──────────────────────────────────────
// A well-configured database binds to 127.0.0.1, so connecting directly from
// the local machine is impossible. forwardOut opens a channel inside the SSH
// session already established above; handing that stream to the driver gives
// structured rows and real placeholders without opening any new port.

let cachedCreds = null

/**
 * Laravel keeps its credentials in APP_DIR/.env, which is the format parsed
 * below. Reading them from the server at runtime means there is no second copy
 * of the production password on the laptop, and nothing to update when it is
 * rotated.
 */
async function credentials() {
  if (cachedCreds) return cachedCreds

  const env = await readFile(`${APP_DIR}/.env`)
  const pick = key => {
    const m = env.match(new RegExp(`^${key}=(.*)$`, 'm'))
    return m ? m[1].trim().replace(/^["'](.*)["']$/, '$1') : undefined
  }

  cachedCreds = {
    database: pick('DB_DATABASE'),
    user: pick('DB_USERNAME'),
    password: pick('DB_PASSWORD'),
    host: pick('DB_HOST') || '127.0.0.1',
    port: Number(pick('DB_PORT') || 3306),
  }

  if (!cachedCreds.database || !cachedCreds.user) {
    cachedCreds = null
    throw new Error(`Could not parse database credentials from ${APP_DIR}/.env`)
  }

  return cachedCreds
}

async function dbConnection() {
  const client = await connect()
  const creds = await credentials()

  const stream = await new Promise((resolve, reject) =>
    client.forwardOut('127.0.0.1', 0, creds.host, creds.port, (err, s) =>
      err ? reject(err) : resolve(s),
    ),
  )

  return mysql.createConnection({
    user: creds.user,
    password: creds.password,
    database: creds.database,
    stream,
    // multipleStatements stays false (the default) so a value bound to a
    // placeholder cannot smuggle in a second, stacked statement.
    dateStrings: true,
  })
}

/** Runs one statement and always closes — no tunnel left dangling on error. */
export async function query(sql, params = []) {
  const db = await dbConnection()
  try {
    const [rows, fields] = await db.query(sql, params)
    return { rows, fields }
  } finally {
    await db.end().catch(() => {})
  }
}

export function appDir() {
  return APP_DIR
}

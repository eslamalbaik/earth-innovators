#!/usr/bin/env node
// Connectivity check outside MCP. stdio failures are silent inside Claude Code —
// it reports "server failed" with no detail — so this is far faster to debug from.
import * as vps from './vps.js'

const ok = s => console.log(`  \x1b[32m✔\x1b[0m ${s}`)
const bad = s => console.log(`  \x1b[31m✘\x1b[0m ${s}`)

let failed = false

async function step(label, fn) {
  try {
    ok(`${label}: ${await fn()}`)
  } catch (e) {
    bad(`${label}: ${e.message}`)
    failed = true
  }
}

console.log('\nearth-ops connectivity check\n')

for (const key of ['EARTH_SSH_HOST', 'EARTH_SSH_USER']) {
  if (process.env[key]) ok(`${key} = ${process.env[key]}`)
  else { bad(`${key} is not set`); failed = true }
}
if (process.env.EARTH_SSH_KEY) ok(`EARTH_SSH_KEY = ${process.env.EARTH_SSH_KEY}`)
else if (process.env.EARTH_SSH_PASSWORD) ok('EARTH_SSH_PASSWORD is set')
else { bad('neither EARTH_SSH_KEY nor EARTH_SSH_PASSWORD is set'); failed = true }

if (!failed) {
  await step('SSH login', async () => {
    const r = await vps.exec('whoami && hostname')
    return r.stdout.trim().replace(/\n/g, ' @ ')
  })
}

// Every check opens its own connection, so continuing past an auth failure
// retries it once per check — five failed attempts per run is exactly what
// trips fail2ban and MaxAuthTries. Stop at the first failure.
if (failed) {
  console.log('\n  \x1b[33m!\x1b[0m Stopping here — further checks would retry the failed')
  console.log('    authentication and risk a fail2ban lockout on your IP.\n')
  process.exit(1)
}

{
  await step('app directory', async () => {
    const r = await vps.exec(`test -d ${vps.appDir()} && echo present`)
    if (r.code !== 0) throw new Error(`${vps.appDir()} not found (set EARTH_APP_DIR)`)
    return vps.appDir()
  })

  await step('sudo without password', async () => {
    const r = await vps.exec('sudo -n true 2>&1', { timeoutMs: 10_000 })
    return r.code === 0 ? 'available' : 'NOT available — sudo commands will hang'
  })

  await step('database via SSH tunnel', async () => {
    const { rows } = await vps.query('SELECT DATABASE() AS db, VERSION() AS version')
    return `${rows[0].db} (${rows[0].version})`
  })
}

console.log(failed ? '\nSome checks failed.\n' : '\nAll checks passed.\n')
process.exit(failed ? 1 : 0)

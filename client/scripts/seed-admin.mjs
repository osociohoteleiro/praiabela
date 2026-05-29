#!/usr/bin/env node
// Seeds (or resets) the admin user in D1.
// Reads ADMIN_EMAIL and ADMIN_PASSWORD from env (or defaults).
// Usage: node scripts/seed-admin.mjs [--local|--remote]

import { execSync } from 'node:child_process'
import { writeFileSync, unlinkSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import bcrypt from 'bcryptjs'

const target = process.argv.includes('--remote') ? '--remote' : '--local'

const email = process.env.ADMIN_EMAIL || 'admin@praiabela.com'
const password = process.env.ADMIN_PASSWORD
if (!password) {
  console.error('ERROR: set ADMIN_PASSWORD env var before running this script.')
  process.exit(1)
}

const hash = bcrypt.hashSync(password, 10)
const sql = `
INSERT INTO admins (email, password, name) VALUES ('${email.replace(/'/g, "''")}', '${hash}', 'Administrador')
ON CONFLICT(email) DO UPDATE SET password = excluded.password;
`.trim()

const tmpPath = join(tmpdir(), `seed-admin-${Date.now()}.sql`)
writeFileSync(tmpPath, sql)

try {
  execSync(
    `echo y | npx wrangler d1 execute praiabela-db ${target} --file="${tmpPath}"`,
    { stdio: 'inherit', shell: true }
  )
  console.log(`\n✅ Admin "${email}" set (target: ${target}).`)
} finally {
  unlinkSync(tmpPath)
}

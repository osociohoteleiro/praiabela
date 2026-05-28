// Idempotent D1 schema. Applied lazily once per worker isolate via ensureSchema().
// Keep in sync with ../../schema.sql (the standalone file is still used for
// initial bootstrap and local dev: `npm run db:migrate:local`).
//
// IMPORTANT: every statement must use IF NOT EXISTS so re-runs are no-ops.

const STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS promotions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    discount INTEGER NOT NULL,
    valid_until TEXT,
    image_url TEXT,
    is_active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS packages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    price REAL NOT NULL DEFAULT 0,
    inclusions TEXT NOT NULL,
    image_urls TEXT,
    is_featured INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1,
    start_date TEXT,
    end_date TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS site_info (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    about_text TEXT,
    contact_email TEXT,
    contact_phone TEXT,
    contact_address TEXT,
    check_in_time TEXT DEFAULT '14:00',
    check_out_time TEXT DEFAULT '12:00',
    facebook_url TEXT,
    instagram_url TEXT,
    whatsapp_number TEXT,
    hero_video_url TEXT,
    logo_url TEXT,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS media (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL CHECK (type IN ('image', 'video')),
    category TEXT,
    url TEXT NOT NULL,
    s3_key TEXT NOT NULL,
    filename TEXT NOT NULL,
    size INTEGER,
    uploaded_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS rooms (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    capacity INTEGER NOT NULL DEFAULT 2,
    size TEXT,
    price REAL NOT NULL DEFAULT 0,
    amenities TEXT,
    image_urls TEXT,
    is_active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS gallery (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    url TEXT NOT NULL,
    caption TEXT,
    display_order INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS experiences (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    image_url TEXT NOT NULL,
    display_order INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    excerpt TEXT,
    content TEXT NOT NULL,
    cover_image TEXT NOT NULL,
    category TEXT,
    published_at TEXT DEFAULT CURRENT_TIMESTAMP,
    is_active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug)`,
  `CREATE INDEX IF NOT EXISTS idx_posts_active_pub ON posts(is_active, published_at DESC)`,
]

// Module-level cache: one apply per isolate, retried only if the previous
// attempt rejected (so a transient failure doesn't permanently break the worker).
let schemaPromise = null

export function ensureSchema(env) {
  if (!env?.DB) return Promise.resolve()
  if (!schemaPromise) {
    schemaPromise = applySchema(env).catch((err) => {
      schemaPromise = null
      throw err
    })
  }
  return schemaPromise
}

async function applySchema(env) {
  const batch = STATEMENTS.map((sql) => env.DB.prepare(sql))
  await env.DB.batch(batch)
}

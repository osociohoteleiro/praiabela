-- D1 (SQLite) schema for Pousada Praia Bela
-- Port of server/src/config/database.js Postgres schema
--
-- In production this schema is also applied automatically on the first request
-- to /api/* by functions/_lib/schema.js (called from functions/api/_middleware.js).
-- Keep this file and _lib/schema.js in sync when adding/altering tables.
-- This .sql file is still used for `npm run db:migrate:local` and one-shot
-- remote bootstrap via `npm run db:migrate:remote`.

CREATE TABLE IF NOT EXISTS admins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS promotions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  discount INTEGER NOT NULL,
  valid_until TEXT,
  image_url TEXT,
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- price = 0 acts as a "Sob consulta" sentinel (no NOT NULL relax needed in SQLite)
CREATE TABLE IF NOT EXISTS packages (
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
);

CREATE TABLE IF NOT EXISTS site_info (
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
);

CREATE TABLE IF NOT EXISTS media (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL CHECK (type IN ('image', 'video')),
  category TEXT,
  url TEXT NOT NULL,
  s3_key TEXT NOT NULL,
  filename TEXT NOT NULL,
  size INTEGER,
  uploaded_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS rooms (
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
);

CREATE TABLE IF NOT EXISTS gallery (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  url TEXT NOT NULL,
  caption TEXT,
  display_order INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS experiences (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS posts (
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
);

CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug);
CREATE INDEX IF NOT EXISTS idx_posts_active_pub ON posts(is_active, published_at DESC);

-- Seed default site_info (id=1) if it doesn't exist
INSERT OR IGNORE INTO site_info (
  id, about_text, contact_email, contact_phone, contact_address,
  check_in_time, check_out_time, whatsapp_number
) VALUES (
  1,
  'A Pousada Praia Bela é o lugar perfeito para suas férias em Ilhéus, Bahia. Localizada à beira-mar, oferecemos conforto, tranquilidade e uma vista paradisíaca do oceano.',
  'contato@praiabela.com',
  '(73) 3234-5678',
  'Av. Beira Mar, 1234 - Ilhéus/BA',
  '14:00',
  '12:00',
  '5573987654321'
);

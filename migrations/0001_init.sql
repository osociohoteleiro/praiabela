-- Esquema inicial da Praia Bela (base site-loft) — Cloudflare D1 / SQLite
--
-- Este D1 (praiabela-db) foi originalmente populado pelo esquema antigo da
-- Pousada Praia Bela (Pages Functions). Como o novo esquema (site-loft) tem
-- colunas incompatíveis em rooms/gallery, removemos as tabelas antigas e as
-- novas antes de recriar. Os dados são reinseridos por migrations/seed.sql.
-- IMPORTANTE: faça backup antes (npm run db:backup:remote).

-- Tabelas do esquema antigo da Praia Bela (descontinuadas)
DROP TABLE IF EXISTS posts;
DROP TABLE IF EXISTS experiences;
DROP TABLE IF EXISTS packages;
DROP TABLE IF EXISTS promotions;
DROP TABLE IF EXISTS media;
DROP TABLE IF EXISTS admins;
DROP TABLE IF EXISTS site_info;

-- Tabelas do novo esquema (drop para reexecução idempotente)
DROP TABLE IF EXISTS settings;
DROP TABLE IF EXISTS rooms;
DROP TABLE IF EXISTS highlights;
DROP TABLE IF EXISTS amenities;
DROP TABLE IF EXISTS testimonials;
DROP TABLE IF EXISTS gallery;

-- Configurações singulares do site (armazenadas como JSON em value)
CREATE TABLE IF NOT EXISTS settings (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL DEFAULT '{}'
);

-- Acomodações (quartos / suítes)
CREATE TABLE IF NOT EXISTS rooms (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  title       TEXT NOT NULL,
  subtitle    TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  image_url   TEXT NOT NULL DEFAULT '',
  amenities   TEXT NOT NULL DEFAULT '[]', -- JSON array de strings
  sort_order  INTEGER NOT NULL DEFAULT 0
);

-- Tiles de destaque ("Sua Casa no Paraíso")
CREATE TABLE IF NOT EXISTS highlights (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  title      TEXT NOT NULL,
  image_url  TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0
);

-- Comodidades ("Tudo para seu conforto")
CREATE TABLE IF NOT EXISTS amenities (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  icon       TEXT NOT NULL DEFAULT 'check',
  label      TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);

-- Depoimentos de hóspedes
CREATE TABLE IF NOT EXISTS testimonials (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  title      TEXT NOT NULL,
  quote      TEXT NOT NULL,
  author     TEXT NOT NULL DEFAULT '',
  rating     INTEGER NOT NULL DEFAULT 5,
  sort_order INTEGER NOT NULL DEFAULT 0
);

-- Galeria (estilo Instagram)
CREATE TABLE IF NOT EXISTS gallery (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  image_url  TEXT NOT NULL,
  caption    TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0
);

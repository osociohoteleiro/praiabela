-- Recursos adicionais da Praia Bela: experiências, promoções, pacotes e blog/posts.
-- Seguem o mesmo padrão de CRUD genérico do site-loft (ordenação por sort_order).
-- Conteúdo é populado por migrations/seed.sql.

-- Experiências (ex.: Spa do Cacau, mini fazenda de cacau)
CREATE TABLE IF NOT EXISTS experiences (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  title       TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  image_url   TEXT NOT NULL DEFAULT '',
  sort_order  INTEGER NOT NULL DEFAULT 0
);

-- Promoções (faixa de desconto com validade)
CREATE TABLE IF NOT EXISTS promotions (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  title       TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  discount    INTEGER NOT NULL DEFAULT 0,
  valid_until TEXT NOT NULL DEFAULT '',
  image_url   TEXT NOT NULL DEFAULT '',
  sort_order  INTEGER NOT NULL DEFAULT 0
);

-- Pacotes (preço + lista de inclusões em JSON)
CREATE TABLE IF NOT EXISTS packages (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  title       TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  price       REAL NOT NULL DEFAULT 0,
  inclusions  TEXT NOT NULL DEFAULT '[]', -- JSON array de strings
  image_url   TEXT NOT NULL DEFAULT '',
  featured    INTEGER NOT NULL DEFAULT 0,
  sort_order  INTEGER NOT NULL DEFAULT 0
);

-- Blog / posts
CREATE TABLE IF NOT EXISTS posts (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  title        TEXT NOT NULL,
  slug         TEXT NOT NULL DEFAULT '',
  excerpt      TEXT NOT NULL DEFAULT '',
  content      TEXT NOT NULL DEFAULT '',
  cover_image  TEXT NOT NULL DEFAULT '',
  category     TEXT NOT NULL DEFAULT '',
  published_at TEXT NOT NULL DEFAULT '',
  sort_order   INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug);

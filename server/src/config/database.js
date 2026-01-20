import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Ensure database directory exists
const dataDir = join(__dirname, '../../database');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Use existing SQLite database
const dbPath = join(dataDir, 'praiabela.db');
const db = new Database(dbPath);

// Enable foreign keys and WAL mode for better performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

console.log('✅ Conectado ao SQLite:', dbPath);

export const initDatabase = () => {
  try {
    // Create tables
    db.exec(`
      CREATE TABLE IF NOT EXISTS admins (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    db.exec(`
      CREATE TABLE IF NOT EXISTS promotions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        discount INTEGER NOT NULL,
        valid_until TEXT,
        image_url TEXT,
        is_active INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    db.exec(`
      CREATE TABLE IF NOT EXISTS packages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        price REAL NOT NULL,
        inclusions TEXT NOT NULL,
        image_urls TEXT,
        is_featured INTEGER DEFAULT 0,
        is_active INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    db.exec(`
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
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    db.exec(`
      CREATE TABLE IF NOT EXISTS media (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT NOT NULL CHECK(type IN ('image', 'video')),
        category TEXT,
        url TEXT NOT NULL,
        s3_key TEXT NOT NULL,
        filename TEXT NOT NULL,
        size INTEGER,
        uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    db.exec(`
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
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    db.exec(`
      CREATE TABLE IF NOT EXISTS gallery (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        url TEXT NOT NULL,
        caption TEXT,
        display_order INTEGER DEFAULT 0,
        is_active INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('✅ Tabelas criadas');

    // Create default admin user if not exists
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@praiabela.com';
    const existingAdmin = db.prepare('SELECT id FROM admins WHERE email = ?').get(adminEmail);

    if (!existingAdmin) {
      const hashedPassword = bcrypt.hashSync(process.env.ADMIN_PASSWORD || 'admin123', 10);
      db.prepare('INSERT INTO admins (email, password, name) VALUES (?, ?, ?)').run(
        adminEmail,
        hashedPassword,
        'Administrador'
      );
      console.log('✅ Admin padrão criado');
    }

    // Create default site_info if not exists
    const existingSiteInfo = db.prepare('SELECT id FROM site_info WHERE id = 1').get();

    if (!existingSiteInfo) {
      db.prepare(`
        INSERT INTO site_info (
          id, about_text, contact_email, contact_phone, contact_address,
          check_in_time, check_out_time, whatsapp_number
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        1,
        'A Pousada Praia Bela é o lugar perfeito para suas férias em Ilhéus, Bahia. Localizada à beira-mar, oferecemos conforto, tranquilidade e uma vista paradisíaca do oceano.',
        'contato@praiabela.com',
        '(73) 3234-5678',
        'Av. Beira Mar, 1234 - Ilhéus/BA',
        '14:00',
        '12:00',
        '5573987654321'
      );
      console.log('✅ Informações do site criadas');
    }

    // Create some sample promotions
    const promoCount = db.prepare('SELECT COUNT(*) as count FROM promotions').get();
    if (promoCount.count === 0) {
      db.prepare(
        'INSERT INTO promotions (title, description, discount, valid_until, is_active) VALUES (?, ?, ?, ?, ?)'
      ).run('Promoção de Verão', 'Aproveite nossos preços especiais para o verão! Reserve agora e ganhe até 30% de desconto.', 30, '2025-03-31', 1);

      db.prepare(
        'INSERT INTO promotions (title, description, discount, valid_until, is_active) VALUES (?, ?, ?, ?, ?)'
      ).run('Fim de Semana Romântico', 'Pacote especial para casais! Inclui jantar à luz de velas na praia.', 20, '2025-12-31', 1);

      console.log('✅ Promoções de exemplo criadas');
    }

    // Create sample packages
    const packageCount = db.prepare('SELECT COUNT(*) as count FROM packages').get();
    if (packageCount.count === 0) {
      db.prepare(
        'INSERT INTO packages (name, description, price, inclusions, is_featured, is_active) VALUES (?, ?, ?, ?, ?, ?)'
      ).run('Pacote Lua de Mel', 'Experiência romântica completa para recém-casados', 2500.00, '["5 diárias", "Café da manhã", "Jantar romântico", "Decoração especial", "Massagem relaxante"]', 1, 1);

      db.prepare(
        'INSERT INTO packages (name, description, price, inclusions, is_featured, is_active) VALUES (?, ?, ?, ?, ?, ?)'
      ).run('Pacote Família', 'Diversão garantida para toda a família', 3200.00, '["7 diárias", "Café da manhã", "Atividades para crianças", "Passeio de barco", "Transfer incluído"]', 1, 1);

      db.prepare(
        'INSERT INTO packages (name, description, price, inclusions, is_featured, is_active) VALUES (?, ?, ?, ?, ?, ?)'
      ).run('Pacote Relax', 'Descanse e renove suas energias', 1800.00, '["3 diárias", "Café da manhã", "Spa completo", "Yoga na praia", "Jantar especial"]', 0, 1);

      console.log('✅ Pacotes de exemplo criados');
    }

    console.log('✅ Database inicializado com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao inicializar database:', error);
    throw error;
  }
};

export default db;

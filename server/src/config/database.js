import pg from 'pg';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

console.log('✅ Conectado ao PostgreSQL');

// Helper para queries
const db = {
  query: (text, params) => pool.query(text, params),

  // Compatibilidade com sintaxe anterior
  prepare: (text) => ({
    run: async (...params) => {
      await pool.query(text.replace(/\?/g, (_, i) => `$${params.indexOf(_) + 1}`), params);
    },
    get: async (...params) => {
      const result = await pool.query(convertPlaceholders(text), params);
      return result.rows[0];
    },
    all: async (...params) => {
      const result = await pool.query(convertPlaceholders(text), params);
      return result.rows;
    }
  })
};

// Converte ? para $1, $2, etc
function convertPlaceholders(sql) {
  let i = 0;
  return sql.replace(/\?/g, () => `$${++i}`);
}

export const initDatabase = async () => {
  try {
    // Create tables
    await pool.query(`
      CREATE TABLE IF NOT EXISTS admins (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS promotions (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        discount INTEGER NOT NULL,
        valid_until VARCHAR(50),
        image_url TEXT,
        is_active INTEGER DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS packages (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        inclusions TEXT NOT NULL,
        image_urls TEXT,
        is_featured INTEGER DEFAULT 0,
        is_active INTEGER DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS site_info (
        id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
        about_text TEXT,
        contact_email VARCHAR(255),
        contact_phone VARCHAR(50),
        contact_address TEXT,
        check_in_time VARCHAR(10) DEFAULT '14:00',
        check_out_time VARCHAR(10) DEFAULT '12:00',
        facebook_url TEXT,
        instagram_url TEXT,
        whatsapp_number VARCHAR(50),
        hero_video_url TEXT,
        logo_url TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS media (
        id SERIAL PRIMARY KEY,
        type VARCHAR(20) NOT NULL CHECK(type IN ('image', 'video')),
        category VARCHAR(50),
        url TEXT NOT NULL,
        s3_key TEXT NOT NULL,
        filename VARCHAR(255) NOT NULL,
        size INTEGER,
        uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS rooms (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        capacity INTEGER NOT NULL DEFAULT 2,
        size VARCHAR(50),
        price DECIMAL(10,2) NOT NULL DEFAULT 0,
        amenities TEXT,
        image_urls TEXT,
        is_active INTEGER DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS gallery (
        id SERIAL PRIMARY KEY,
        url TEXT NOT NULL,
        caption VARCHAR(255),
        display_order INTEGER DEFAULT 0,
        is_active INTEGER DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS experiences (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        image_url TEXT NOT NULL,
        display_order INTEGER DEFAULT 0,
        is_active INTEGER DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('✅ Tabelas criadas');

    // Create default admin user if not exists
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@praiabela.com';
    const existingAdmin = await pool.query('SELECT id FROM admins WHERE email = $1', [adminEmail]);

    if (existingAdmin.rows.length === 0) {
      const hashedPassword = bcrypt.hashSync(process.env.ADMIN_PASSWORD || 'admin123', 10);
      await pool.query(
        'INSERT INTO admins (email, password, name) VALUES ($1, $2, $3)',
        [adminEmail, hashedPassword, 'Administrador']
      );
      console.log('✅ Admin padrão criado');
    }

    // Create default site_info if not exists
    const existingSiteInfo = await pool.query('SELECT id FROM site_info WHERE id = 1');

    if (existingSiteInfo.rows.length === 0) {
      await pool.query(`
        INSERT INTO site_info (
          id, about_text, contact_email, contact_phone, contact_address,
          check_in_time, check_out_time, whatsapp_number
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `, [
        1,
        'A Pousada Praia Bela é o lugar perfeito para suas férias em Ilhéus, Bahia. Localizada à beira-mar, oferecemos conforto, tranquilidade e uma vista paradisíaca do oceano.',
        'contato@praiabela.com',
        '(73) 3234-5678',
        'Av. Beira Mar, 1234 - Ilhéus/BA',
        '14:00',
        '12:00',
        '5573987654321'
      ]);
      console.log('✅ Informações do site criadas');
    }

    console.log('✅ Database inicializado com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao inicializar database:', error);
    throw error;
  }
};

export { pool };
export default db;

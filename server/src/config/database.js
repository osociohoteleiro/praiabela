import pkg from 'pg';
const { Pool } = pkg;
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

// Create PostgreSQL connection pool
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'praiabela',
  password: process.env.DB_PASSWORD || 'praiabela123',
  database: process.env.DB_NAME || 'praiabela_db',
});

// Test connection
pool.on('connect', () => {
  console.log('✅ Conectado ao PostgreSQL');
});

pool.on('error', (err) => {
  console.error('❌ Erro no PostgreSQL:', err);
});

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
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS promotions (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        discount INTEGER NOT NULL,
        valid_until VARCHAR(50),
        image_url TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS packages (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        inclusions TEXT NOT NULL,
        image_urls TEXT,
        is_featured BOOLEAN DEFAULT false,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS site_info (
        id INTEGER PRIMARY KEY CHECK (id = 1),
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
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS media (
        id SERIAL PRIMARY KEY,
        type VARCHAR(10) NOT NULL CHECK(type IN ('image', 'video')),
        category VARCHAR(100),
        url TEXT NOT NULL,
        s3_key TEXT NOT NULL,
        filename TEXT NOT NULL,
        size INTEGER,
        uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS rooms (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        capacity INTEGER NOT NULL DEFAULT 2,
        size VARCHAR(50),
        price DECIMAL(10, 2) NOT NULL,
        amenities TEXT,
        image_urls TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS gallery (
        id SERIAL PRIMARY KEY,
        url TEXT NOT NULL,
        caption TEXT,
        display_order INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('✅ Tabelas criadas');

    // Create default admin user if not exists
    const adminResult = await pool.query(
      'SELECT id FROM admins WHERE email = $1',
      [process.env.ADMIN_EMAIL || 'admin@praiabela.com']
    );

    if (adminResult.rows.length === 0) {
      const hashedPassword = bcrypt.hashSync(process.env.ADMIN_PASSWORD || 'admin123', 10);
      await pool.query(
        'INSERT INTO admins (email, password, name) VALUES ($1, $2, $3)',
        [
          process.env.ADMIN_EMAIL || 'admin@praiabela.com',
          hashedPassword,
          'Administrador'
        ]
      );
      console.log('✅ Admin padrão criado');
    }

    // Create default site_info if not exists
    const siteInfoResult = await pool.query('SELECT id FROM site_info WHERE id = 1');

    if (siteInfoResult.rows.length === 0) {
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

    // Create some sample promotions
    const promoResult = await pool.query('SELECT COUNT(*) as count FROM promotions');
    if (parseInt(promoResult.rows[0].count) === 0) {
      await pool.query(
        `INSERT INTO promotions (title, description, discount, valid_until, is_active) VALUES ($1, $2, $3, $4, $5)`,
        ['Promoção de Verão', 'Aproveite nossos preços especiais para o verão! Reserve agora e ganhe até 30% de desconto.', 30, '2025-03-31', true]
      );
      await pool.query(
        `INSERT INTO promotions (title, description, discount, valid_until, is_active) VALUES ($1, $2, $3, $4, $5)`,
        ['Fim de Semana Romântico', 'Pacote especial para casais! Inclui jantar à luz de velas na praia.', 20, '2025-12-31', true]
      );
      console.log('✅ Promoções de exemplo criadas');
    }

    // Create sample packages
    const packageResult = await pool.query('SELECT COUNT(*) as count FROM packages');
    if (parseInt(packageResult.rows[0].count) === 0) {
      await pool.query(
        `INSERT INTO packages (name, description, price, inclusions, is_featured, is_active) VALUES ($1, $2, $3, $4, $5, $6)`,
        ['Pacote Lua de Mel', 'Experiência romântica completa para recém-casados', 2500.00, '["5 diárias", "Café da manhã", "Jantar romântico", "Decoração especial", "Massagem relaxante"]', true, true]
      );
      await pool.query(
        `INSERT INTO packages (name, description, price, inclusions, is_featured, is_active) VALUES ($1, $2, $3, $4, $5, $6)`,
        ['Pacote Família', 'Diversão garantida para toda a família', 3200.00, '["7 diárias", "Café da manhã", "Atividades para crianças", "Passeio de barco", "Transfer incluído"]', true, true]
      );
      await pool.query(
        `INSERT INTO packages (name, description, price, inclusions, is_featured, is_active) VALUES ($1, $2, $3, $4, $5, $6)`,
        ['Pacote Relax', 'Descanse e renove suas energias', 1800.00, '["3 diárias", "Café da manhã", "Spa completo", "Yoga na praia", "Jantar especial"]', false, true]
      );
      console.log('✅ Pacotes de exemplo criados');
    }

    console.log('✅ Database inicializado com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao inicializar database:', error);
    throw error;
  }
};

// Helper to prepare statement (simulates better-sqlite3 API)
const dbPrepare = (sql) => {
  return {
    get: async (...params) => {
      const result = await pool.query(sql, params);
      return result.rows[0] || null;
    },
    all: async (...params) => {
      const result = await pool.query(sql, params);
      return result.rows;
    },
    run: async (...params) => {
      const result = await pool.query(sql, params);
      return {
        changes: result.rowCount,
        lastInsertRowid: result.rows[0]?.id || null
      };
    }
  };
};

// Export compatible db object
const dbCompat = {
  prepare: dbPrepare,
  exec: async (sql) => {
    await pool.query(sql);
  },
  query: pool.query.bind(pool)
};

export { pool };
export default dbCompat;

import initSqlJs from 'sql.js'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import fs from 'fs'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const dbPath = process.env.DB_PATH || join(__dirname, '../../database/praiabela.db')

// Ensure database directory exists
const dbDir = dirname(dbPath)
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true })
}

let db = null
let SQL = null

export const initDatabase = async () => {
  // Initialize SQL.js
  SQL = await initSqlJs()

  // Try to load existing database
  try {
    if (fs.existsSync(dbPath)) {
      const buffer = fs.readFileSync(dbPath)
      db = new SQL.Database(buffer)
      console.log('✅ Database carregada')
    } else {
      db = new SQL.Database()
      console.log('✅ Database criada')
    }
  } catch (err) {
    db = new SQL.Database()
  }

  // Create tables
  db.run(`
    CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

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
    );

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
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS media (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL CHECK(type IN ('image', 'video')),
      category TEXT,
      url TEXT NOT NULL,
      s3_key TEXT NOT NULL,
      filename TEXT NOT NULL,
      size INTEGER,
      uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `)

  // Create default admin user if not exists
  const adminExists = dbGet('SELECT id FROM admins WHERE email = ?', [process.env.ADMIN_EMAIL || 'admin@praiabela.com'])

  if (!adminExists) {
    const hashedPassword = bcrypt.hashSync(process.env.ADMIN_PASSWORD || 'admin123', 10)
    dbRun('INSERT INTO admins (email, password, name) VALUES (?, ?, ?)', [
      process.env.ADMIN_EMAIL || 'admin@praiabela.com',
      hashedPassword,
      'Administrador'
    ])
    console.log('✅ Admin padrão criado')
  }

  // Create default site_info if not exists
  const siteInfoExists = dbGet('SELECT id FROM site_info WHERE id = 1')

  if (!siteInfoExists) {
    dbRun(`
      INSERT INTO site_info (
        id, about_text, contact_email, contact_phone, contact_address,
        check_in_time, check_out_time, whatsapp_number
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      1,
      'A Pousada Praia Bela é o lugar perfeito para suas férias em Ilhéus, Bahia. Localizada à beira-mar, oferecemos conforto, tranquilidade e uma vista paradisíaca do oceano.',
      'contato@praiabela.com',
      '(73) 3234-5678',
      'Av. Beira Mar, 1234 - Ilhéus/BA',
      '14:00',
      '12:00',
      '5573987654321'
    ])
    console.log('✅ Informações do site criadas')
  }

  // Create some sample promotions
  const promoCount = dbAll('SELECT * FROM promotions')
  if (promoCount.length === 0) {
    dbRun(`INSERT INTO promotions (title, description, discount, valid_until, is_active) VALUES (?, ?, ?, ?, ?)`,
      ['Promoção de Verão', 'Aproveite nossos preços especiais para o verão! Reserve agora e ganhe até 30% de desconto.', 30, '2025-03-31', 1])
    dbRun(`INSERT INTO promotions (title, description, discount, valid_until, is_active) VALUES (?, ?, ?, ?, ?)`,
      ['Fim de Semana Romântico', 'Pacote especial para casais! Inclui jantar à luz de velas na praia.', 20, '2025-12-31', 1])
    console.log('✅ Promoções de exemplo criadas')
  }

  // Create sample packages
  const packageCount = dbAll('SELECT * FROM packages')
  if (packageCount.length === 0) {
    dbRun(`INSERT INTO packages (name, description, price, inclusions, is_featured, is_active) VALUES (?, ?, ?, ?, ?, ?)`,
      ['Pacote Lua de Mel', 'Experiência romântica completa para recém-casados', 2500.00, '["5 diárias", "Café da manhã", "Jantar romântico", "Decoração especial", "Massagem relaxante"]', 1, 1])
    dbRun(`INSERT INTO packages (name, description, price, inclusions, is_featured, is_active) VALUES (?, ?, ?, ?, ?, ?)`,
      ['Pacote Família', 'Diversão garantida para toda a família', 3200.00, '["7 diárias", "Café da manhã", "Atividades para crianças", "Passeio de barco", "Transfer incluído"]', 1, 1])
    dbRun(`INSERT INTO packages (name, description, price, inclusions, is_featured, is_active) VALUES (?, ?, ?, ?, ?, ?)`,
      ['Pacote Relax', 'Descanse e renove suas energias', 1800.00, '["3 diárias", "Café da manhã", "Spa completo", "Yoga na praia", "Jantar especial"]', 0, 1])
    console.log('✅ Pacotes de exemplo criados')
  }

  saveDatabase()
  console.log('✅ Database inicializado com sucesso!')
}

// Helper function to save database
export const saveDatabase = () => {
  if (db) {
    const data = db.export()
    const buffer = Buffer.from(data)
    fs.writeFileSync(dbPath, buffer)
  }
}

// Helper to prepare statement (simulates better-sqlite3 API)
const dbPrepare = (sql) => {
  return {
    get: (...params) => dbGet(sql, params),
    all: (...params) => dbAll(sql, params),
    run: (...params) => dbRun(sql, params)
  }
}

// Helper functions for CRUD operations (compatible with better-sqlite3 API)
const dbGet = (sql, params = []) => {
  try {
    const result = db.exec(sql, params)
    if (result.length > 0 && result[0].values.length > 0) {
      const columns = result[0].columns
      const row = result[0].values[0]
      const obj = {}
      columns.forEach((col, idx) => {
        obj[col] = row[idx]
      })
      return obj
    }
    return null
  } catch (error) {
    console.error('Get error:', error)
    return null
  }
}

const dbAll = (sql, params = []) => {
  try {
    const result = db.exec(sql, params)
    if (result.length > 0) {
      const columns = result[0].columns
      return result[0].values.map(row => {
        const obj = {}
        columns.forEach((col, idx) => {
          obj[col] = row[idx]
        })
        return obj
      })
    }
    return []
  } catch (error) {
    console.error('All error:', error)
    return []
  }
}

const dbRun = (sql, params = []) => {
  try {
    db.run(sql, params)
    saveDatabase()
    const lastId = db.exec('SELECT last_insert_rowid() as id')
    return {
      changes: 1,
      lastInsertRowid: lastId.length > 0 ? lastId[0].values[0][0] : null
    }
  } catch (error) {
    console.error('Run error:', error)
    throw error
  }
}

// Export compatible db object
const dbCompat = {
  prepare: dbPrepare,
  exec: (sql) => {
    db.run(sql)
    saveDatabase()
  }
}

export default dbCompat

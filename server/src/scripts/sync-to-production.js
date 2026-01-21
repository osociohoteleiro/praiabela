import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configurações
const PRODUCTION_API_URL = process.env.PRODUCTION_API_URL || 'https://api.praiabela.com.br';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@praiabela.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

// Database path
const dbPath = join(__dirname, '../../database/praiabela.db');

if (!fs.existsSync(dbPath)) {
  console.error('❌ Banco de dados local não encontrado:', dbPath);
  process.exit(1);
}

const db = new Database(dbPath, { readonly: true });

async function syncToProduction() {
  console.log('🔄 Iniciando sincronização para produção...\n');
  console.log('📍 API de produção:', PRODUCTION_API_URL);

  // 1. Exportar dados do banco local
  console.log('\n📦 Exportando dados do banco local...');
  const tables = ['site_info', 'rooms', 'gallery', 'packages', 'promotions', 'experiences', 'media'];
  const data = {};

  for (const table of tables) {
    data[table] = db.prepare(`SELECT * FROM ${table}`).all();
    console.log(`   - ${table}: ${data[table].length} registros`);
  }

  // 2. Fazer login na API de produção
  console.log('\n🔐 Fazendo login na API de produção...');
  let token;
  try {
    const loginResponse = await fetch(`${PRODUCTION_API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD })
    });

    if (!loginResponse.ok) {
      const error = await loginResponse.text();
      throw new Error(`Falha no login: ${error}`);
    }

    const loginData = await loginResponse.json();
    token = loginData.token;
    console.log('   ✅ Login realizado com sucesso!');
  } catch (error) {
    console.error('   ❌ Erro no login:', error.message);
    console.log('\n💡 Verifique:');
    console.log('   - PRODUCTION_API_URL está correto');
    console.log('   - ADMIN_EMAIL e ADMIN_PASSWORD estão corretos');
    console.log('   - A API de produção está online');
    process.exit(1);
  }

  // 3. Enviar dados para a API de produção
  console.log('\n📤 Enviando dados para produção...');
  try {
    const importResponse = await fetch(`${PRODUCTION_API_URL}/api/sync/import`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ data })
    });

    if (!importResponse.ok) {
      const error = await importResponse.text();
      throw new Error(`Falha na importação: ${error}`);
    }

    const result = await importResponse.json();
    console.log('   ✅ Importação concluída!');
    console.log('\n📊 Resultado:');
    for (const [table, info] of Object.entries(result.results)) {
      if (info.success) {
        console.log(`   ✅ ${table}: ${info.count} registros importados`);
      } else {
        console.log(`   ❌ ${table}: ${info.error}`);
      }
    }
  } catch (error) {
    console.error('   ❌ Erro na importação:', error.message);
    process.exit(1);
  }

  console.log('\n🎉 Sincronização concluída com sucesso!');
  db.close();
}

syncToProduction().catch(console.error);

import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Database path
const dbPath = join(__dirname, '../../database/praiabela.db');

if (!fs.existsSync(dbPath)) {
  console.error('❌ Banco de dados não encontrado:', dbPath);
  process.exit(1);
}

const db = new Database(dbPath, { readonly: true });

console.log('📦 Exportando dados do banco de dados local...\n');

const escapeString = (str) => {
  if (str === null || str === undefined) return 'NULL';
  return `'${String(str).replace(/'/g, "''")}'`;
};

const tables = [
  'site_info',
  'rooms',
  'gallery',
  'packages',
  'promotions',
  'experiences',
  'media'
];

let sqlOutput = `-- Exportação de dados do banco local para produção
-- Gerado em: ${new Date().toISOString()}
-- Execute este SQL no banco de produção para inserir os dados

`;

for (const table of tables) {
  const rows = db.prepare(`SELECT * FROM ${table}`).all();

  if (rows.length === 0) {
    sqlOutput += `-- Tabela ${table}: sem dados\n\n`;
    continue;
  }

  sqlOutput += `-- ========================================\n`;
  sqlOutput += `-- Tabela: ${table} (${rows.length} registros)\n`;
  sqlOutput += `-- ========================================\n`;

  // Delete existing data first (except admins)
  if (table !== 'admins') {
    sqlOutput += `DELETE FROM ${table};\n`;
  }

  const columns = Object.keys(rows[0]);

  for (const row of rows) {
    const values = columns.map(col => {
      const val = row[col];
      if (val === null || val === undefined) return 'NULL';
      if (typeof val === 'number') return val;
      return escapeString(val);
    });

    sqlOutput += `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${values.join(', ')});\n`;
  }

  sqlOutput += '\n';
}

// Save to file
const outputPath = join(__dirname, '../../data-export.sql');
fs.writeFileSync(outputPath, sqlOutput);

console.log('✅ Dados exportados para:', outputPath);
console.log('\n📋 Resumo:');
for (const table of tables) {
  const count = db.prepare(`SELECT COUNT(*) as count FROM ${table}`).get();
  console.log(`   - ${table}: ${count.count} registros`);
}

console.log('\n📌 Para aplicar no banco de produção:');
console.log('   1. Copie o arquivo data-export.sql para o servidor');
console.log('   2. Execute: sqlite3 /caminho/do/banco.db < data-export.sql');
console.log('   Ou copie o conteúdo e execute via ferramenta de admin');

db.close();

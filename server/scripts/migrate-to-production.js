/**
 * Script para migrar dados do banco local para produção via API
 */

import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PRODUCTION_API = 'https://osh-ia-praia-bela-api.d32pnk.easypanel.host/api';
const ADMIN_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJhZG1pbkBwcmFpYWJlbGEuY29tIiwiaWF0IjoxNzY4OTU0OTc1LCJleHAiOjE3Njk1NTk3NzV9.FpCKldY3Pk4VccINK31kMd8vUpjHCXLId3JOo0wDFtc';

const dbPath = join(__dirname, '../database/praiabela.db');
const db = new Database(dbPath);

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function migrate() {
  const headers = {
    'Content-Type': 'application/json; charset=utf-8',
    'Authorization': `Bearer ${ADMIN_TOKEN}`
  };

  console.log('🚀 Iniciando migração para produção...\n');

  // Migrar Rooms
  console.log('📦 Migrando quartos...');
  const rooms = db.prepare('SELECT * FROM rooms WHERE is_active = 1').all();
  for (const room of rooms) {
    try {
      const response = await fetch(`${PRODUCTION_API}/rooms`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          name: room.name,
          description: room.description,
          capacity: room.capacity,
          size: room.size,
          price: room.price,
          amenities: JSON.parse(room.amenities || '[]'),
          image_urls: JSON.parse(room.image_urls || '[]'),
          is_active: 1
        })
      });
      if (response.ok) {
        console.log(`  ✅ ${room.name}`);
      } else {
        const err = await response.text();
        console.log(`  ❌ ${room.name}: ${err}`);
      }
    } catch (e) {
      console.log(`  ❌ ${room.name}: ${e.message}`);
    }
    await sleep(200); // Delay entre requisições
  }

  // Migrar Gallery
  console.log('\n🖼️  Migrando galeria...');
  const gallery = db.prepare('SELECT * FROM gallery WHERE is_active = 1 ORDER BY display_order').all();
  for (const item of gallery) {
    try {
      const response = await fetch(`${PRODUCTION_API}/gallery`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          url: item.url,
          caption: item.caption,
          display_order: item.display_order,
          is_active: 1
        })
      });
      if (response.ok) {
        console.log(`  ✅ ${item.caption}`);
      } else {
        const err = await response.text();
        console.log(`  ❌ ${item.caption}: ${err}`);
      }
    } catch (e) {
      console.log(`  ❌ ${item.caption}: ${e.message}`);
    }
    await sleep(200);
  }

  // Migrar Packages
  console.log('\n📋 Migrando pacotes...');
  const packages = db.prepare('SELECT * FROM packages WHERE is_active = 1').all();
  for (const pkg of packages) {
    try {
      const response = await fetch(`${PRODUCTION_API}/packages`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          name: pkg.name,
          description: pkg.description,
          price: pkg.price,
          inclusions: JSON.parse(pkg.inclusions || '[]'),
          image_urls: JSON.parse(pkg.image_urls || '[]'),
          is_featured: pkg.is_featured === 1 ? 1 : 0,
          is_active: 1
        })
      });
      if (response.ok) {
        console.log(`  ✅ ${pkg.name}`);
      } else {
        const err = await response.text();
        console.log(`  ❌ ${pkg.name}: ${err}`);
      }
    } catch (e) {
      console.log(`  ❌ ${pkg.name}: ${e.message}`);
    }
    await sleep(200);
  }

  // Migrar Promotions
  console.log('\n🏷️  Migrando promoções...');
  const promotions = db.prepare('SELECT * FROM promotions WHERE is_active = 1').all();
  for (const promo of promotions) {
    try {
      const response = await fetch(`${PRODUCTION_API}/promotions`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          title: promo.title,
          description: promo.description,
          discount: promo.discount,
          valid_until: promo.valid_until,
          image_url: promo.image_url,
          is_active: 1
        })
      });
      if (response.ok) {
        console.log(`  ✅ ${promo.title}`);
      } else {
        const err = await response.text();
        console.log(`  ❌ ${promo.title}: ${err}`);
      }
    } catch (e) {
      console.log(`  ❌ ${promo.title}: ${e.message}`);
    }
    await sleep(200);
  }

  console.log('\n✅ Migração concluída!');
  db.close();
}

migrate().catch(console.error);

import express from 'express';
import db from '../config/database.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Endpoint para importar dados do banco local para produção
// Requer autenticação de admin
router.post('/import', authMiddleware, (req, res) => {
  try {
    const { data } = req.body;

    if (!data) {
      return res.status(400).json({ error: 'Dados não fornecidos' });
    }

    const results = {};

    // Importar cada tabela
    const tables = ['site_info', 'rooms', 'gallery', 'packages', 'promotions', 'experiences', 'media'];

    for (const table of tables) {
      if (data[table] && Array.isArray(data[table])) {
        try {
          // Deletar dados existentes (exceto admins)
          db.prepare(`DELETE FROM ${table}`).run();

          if (data[table].length > 0) {
            const columns = Object.keys(data[table][0]);
            const placeholders = columns.map(() => '?').join(', ');
            const insertStmt = db.prepare(
              `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders})`
            );

            for (const row of data[table]) {
              const values = columns.map(col => row[col]);
              insertStmt.run(...values);
            }
          }

          results[table] = { success: true, count: data[table].length };
        } catch (tableError) {
          results[table] = { success: false, error: tableError.message };
        }
      }
    }

    res.json({
      message: 'Importação concluída',
      results
    });
  } catch (error) {
    console.error('Erro na importação:', error);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint para exportar dados (GET)
router.get('/export', authMiddleware, (req, res) => {
  try {
    const tables = ['site_info', 'rooms', 'gallery', 'packages', 'promotions', 'experiences', 'media'];
    const data = {};

    for (const table of tables) {
      data[table] = db.prepare(`SELECT * FROM ${table}`).all();
    }

    res.json({ data });
  } catch (error) {
    console.error('Erro na exportação:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;

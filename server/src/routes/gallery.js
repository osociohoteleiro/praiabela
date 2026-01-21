import express from 'express'
import { pool } from '../config/database.js'
import { authMiddleware } from '../middleware/auth.js'

const router = express.Router()

// Get all gallery images (public - only active)
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM gallery WHERE is_active = 1 ORDER BY display_order ASC, created_at DESC')
    res.json(result.rows)
  } catch (error) {
    console.error('Get gallery error:', error)
    res.status(500).json({ message: 'Erro ao buscar galeria' })
  }
})

// Get all gallery images (admin - including inactive)
router.get('/admin/all', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM gallery ORDER BY display_order ASC, created_at DESC')
    res.json(result.rows)
  } catch (error) {
    console.error('Get all gallery error:', error)
    res.status(500).json({ message: 'Erro ao buscar galeria' })
  }
})

// Add image to gallery (admin only)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { url, caption, display_order, is_active } = req.body

    if (!url) {
      return res.status(400).json({ message: 'URL da imagem é obrigatória' })
    }

    const result = await pool.query(`
      INSERT INTO gallery (url, caption, display_order, is_active)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [
      url,
      caption || '',
      display_order || 0,
      is_active !== undefined ? is_active : 1
    ])

    res.status(201).json(result.rows[0])
  } catch (error) {
    console.error('Create gallery image error:', error)
    res.status(500).json({ message: 'Erro ao adicionar imagem' })
  }
})

// Update gallery image (admin only)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { url, caption, display_order, is_active } = req.body

    const exists = await pool.query('SELECT id FROM gallery WHERE id = $1', [req.params.id])
    if (exists.rows.length === 0) {
      return res.status(404).json({ message: 'Imagem não encontrada' })
    }

    const result = await pool.query(`
      UPDATE gallery
      SET url = $1, caption = $2, display_order = $3, is_active = $4
      WHERE id = $5
      RETURNING *
    `, [
      url,
      caption || '',
      display_order || 0,
      is_active !== undefined ? is_active : 1,
      req.params.id
    ])

    res.json(result.rows[0])
  } catch (error) {
    console.error('Update gallery image error:', error)
    res.status(500).json({ message: 'Erro ao atualizar imagem' })
  }
})

// Delete gallery image (admin only)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const exists = await pool.query('SELECT id FROM gallery WHERE id = $1', [req.params.id])
    if (exists.rows.length === 0) {
      return res.status(404).json({ message: 'Imagem não encontrada' })
    }

    await pool.query('DELETE FROM gallery WHERE id = $1', [req.params.id])
    res.json({ message: 'Imagem removida com sucesso' })
  } catch (error) {
    console.error('Delete gallery image error:', error)
    res.status(500).json({ message: 'Erro ao remover imagem' })
  }
})

// Reorder gallery images (admin only)
router.put('/reorder/batch', authMiddleware, async (req, res) => {
  try {
    const { items } = req.body

    if (!Array.isArray(items)) {
      return res.status(400).json({ message: 'Items deve ser um array' })
    }

    for (let i = 0; i < items.length; i++) {
      await pool.query('UPDATE gallery SET display_order = $1 WHERE id = $2', [i, items[i].id])
    }

    res.json({ message: 'Ordem atualizada com sucesso' })
  } catch (error) {
    console.error('Reorder gallery error:', error)
    res.status(500).json({ message: 'Erro ao reordenar galeria' })
  }
})

export default router

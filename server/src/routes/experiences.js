import express from 'express'
import { pool } from '../config/database.js'
import { authMiddleware } from '../middleware/auth.js'

const router = express.Router()

// Get all experiences (public - only active)
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM experiences WHERE is_active = 1 ORDER BY display_order ASC, created_at DESC')
    res.json(result.rows)
  } catch (error) {
    console.error('Get experiences error:', error)
    res.status(500).json({ message: 'Erro ao buscar experiências' })
  }
})

// Get all experiences (admin - including inactive)
router.get('/admin/all', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM experiences ORDER BY display_order ASC, created_at DESC')
    res.json(result.rows)
  } catch (error) {
    console.error('Get all experiences error:', error)
    res.status(500).json({ message: 'Erro ao buscar experiências' })
  }
})

// Get single experience
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM experiences WHERE id = $1', [req.params.id])
    const experience = result.rows[0]

    if (!experience) {
      return res.status(404).json({ message: 'Experiência não encontrada' })
    }

    res.json(experience)
  } catch (error) {
    console.error('Get experience error:', error)
    res.status(500).json({ message: 'Erro ao buscar experiência' })
  }
})

// Create experience (admin only)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, description, image_url, display_order, is_active } = req.body

    if (!title || !description || !image_url) {
      return res.status(400).json({ message: 'Título, descrição e imagem são obrigatórios' })
    }

    const result = await pool.query(`
      INSERT INTO experiences (title, description, image_url, display_order, is_active)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [
      title,
      description,
      image_url,
      display_order || 0,
      is_active !== undefined ? is_active : 1
    ])

    res.status(201).json(result.rows[0])
  } catch (error) {
    console.error('Create experience error:', error)
    res.status(500).json({ message: 'Erro ao criar experiência' })
  }
})

// Update experience (admin only)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { title, description, image_url, display_order, is_active } = req.body

    const exists = await pool.query('SELECT id FROM experiences WHERE id = $1', [req.params.id])
    if (exists.rows.length === 0) {
      return res.status(404).json({ message: 'Experiência não encontrada' })
    }

    const result = await pool.query(`
      UPDATE experiences
      SET title = $1, description = $2, image_url = $3, display_order = $4, is_active = $5, updated_at = CURRENT_TIMESTAMP
      WHERE id = $6
      RETURNING *
    `, [
      title,
      description,
      image_url,
      display_order || 0,
      is_active !== undefined ? is_active : 1,
      req.params.id
    ])

    res.json(result.rows[0])
  } catch (error) {
    console.error('Update experience error:', error)
    res.status(500).json({ message: 'Erro ao atualizar experiência' })
  }
})

// Delete experience (admin only)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const exists = await pool.query('SELECT id FROM experiences WHERE id = $1', [req.params.id])
    if (exists.rows.length === 0) {
      return res.status(404).json({ message: 'Experiência não encontrada' })
    }

    await pool.query('DELETE FROM experiences WHERE id = $1', [req.params.id])
    res.json({ message: 'Experiência removida com sucesso' })
  } catch (error) {
    console.error('Delete experience error:', error)
    res.status(500).json({ message: 'Erro ao remover experiência' })
  }
})

// Reorder experiences (admin only)
router.put('/reorder/batch', authMiddleware, async (req, res) => {
  try {
    const { items } = req.body

    if (!Array.isArray(items)) {
      return res.status(400).json({ message: 'Items deve ser um array' })
    }

    for (let i = 0; i < items.length; i++) {
      await pool.query('UPDATE experiences SET display_order = $1 WHERE id = $2', [i, items[i].id])
    }

    res.json({ message: 'Ordem atualizada com sucesso' })
  } catch (error) {
    console.error('Reorder experiences error:', error)
    res.status(500).json({ message: 'Erro ao reordenar experiências' })
  }
})

export default router

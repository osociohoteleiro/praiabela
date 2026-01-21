import express from 'express'
import { pool } from '../config/database.js'
import { authMiddleware } from '../middleware/auth.js'

const router = express.Router()

// Get all promotions (public - only active)
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM promotions WHERE is_active = 1 ORDER BY created_at DESC')
    res.json(result.rows)
  } catch (error) {
    console.error('Get promotions error:', error)
    res.status(500).json({ message: 'Erro ao buscar promoções' })
  }
})

// Get all promotions for admin (including inactive)
router.get('/admin', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM promotions ORDER BY created_at DESC')
    res.json(result.rows)
  } catch (error) {
    console.error('Get promotions admin error:', error)
    res.status(500).json({ message: 'Erro ao buscar promoções' })
  }
})

// Get single promotion (public)
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM promotions WHERE id = $1', [req.params.id])
    const promotion = result.rows[0]

    if (!promotion) {
      return res.status(404).json({ message: 'Promoção não encontrada' })
    }

    res.json(promotion)
  } catch (error) {
    console.error('Get promotion error:', error)
    res.status(500).json({ message: 'Erro ao buscar promoção' })
  }
})

// Create promotion (admin only)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, description, discount, valid_until, image_url, is_active } = req.body

    if (!title || !description || !discount) {
      return res.status(400).json({ message: 'Campos obrigatórios faltando' })
    }

    const result = await pool.query(`
      INSERT INTO promotions (title, description, discount, valid_until, image_url, is_active)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [title, description, discount, valid_until || null, image_url || null, is_active !== undefined ? is_active : 1])

    res.status(201).json(result.rows[0])
  } catch (error) {
    console.error('Create promotion error:', error)
    res.status(500).json({ message: 'Erro ao criar promoção' })
  }
})

// Update promotion (admin only)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { title, description, discount, valid_until, image_url, is_active } = req.body

    const exists = await pool.query('SELECT id FROM promotions WHERE id = $1', [req.params.id])

    if (exists.rows.length === 0) {
      return res.status(404).json({ message: 'Promoção não encontrada' })
    }

    const result = await pool.query(`
      UPDATE promotions
      SET title = $1, description = $2, discount = $3, valid_until = $4, image_url = $5, is_active = $6, updated_at = CURRENT_TIMESTAMP
      WHERE id = $7
      RETURNING *
    `, [title, description, discount, valid_until || null, image_url || null, is_active !== undefined ? is_active : 1, req.params.id])

    res.json(result.rows[0])
  } catch (error) {
    console.error('Update promotion error:', error)
    res.status(500).json({ message: 'Erro ao atualizar promoção' })
  }
})

// Delete promotion (admin only)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const exists = await pool.query('SELECT id FROM promotions WHERE id = $1', [req.params.id])

    if (exists.rows.length === 0) {
      return res.status(404).json({ message: 'Promoção não encontrada' })
    }

    await pool.query('DELETE FROM promotions WHERE id = $1', [req.params.id])

    res.json({ message: 'Promoção deletada com sucesso' })
  } catch (error) {
    console.error('Delete promotion error:', error)
    res.status(500).json({ message: 'Erro ao deletar promoção' })
  }
})

export default router

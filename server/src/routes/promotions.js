import express from 'express'
import db from '../config/database.js'
import { authMiddleware } from '../middleware/auth.js'

const router = express.Router()

// Get all promotions (public)
router.get('/', async (req, res) => {
  try {
    const promotions = await db.prepare('SELECT * FROM promotions WHERE is_active = 1 ORDER BY created_at DESC').all()
    res.json(promotions)
  } catch (error) {
    console.error('Get promotions error:', error)
    res.status(500).json({ message: 'Erro ao buscar promoções' })
  }
})

// Get single promotion (public)
router.get('/:id', async (req, res) => {
  try {
    const promotion = await db.prepare('SELECT * FROM promotions WHERE id = $1').get(req.params.id)

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

    const result = await db.prepare(`
      INSERT INTO promotions (title, description, discount, valid_until, image_url, is_active)
      VALUES ($1, $2, $3, $4, $5, $6)
    `).run(title, description, discount, valid_until || null, image_url || null, is_active !== undefined ? is_active : 1)

    const newPromotion = await db.prepare('SELECT * FROM promotions WHERE id = $1').get(result.lastInsertRowid)

    res.status(201).json(newPromotion)
  } catch (error) {
    console.error('Create promotion error:', error)
    res.status(500).json({ message: 'Erro ao criar promoção' })
  }
})

// Update promotion (admin only)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { title, description, discount, valid_until, image_url, is_active } = req.body

    const exists = await db.prepare('SELECT id FROM promotions WHERE id = $1').get(req.params.id)

    if (!exists) {
      return res.status(404).json({ message: 'Promoção não encontrada' })
    }

    await db.prepare(`
      UPDATE promotions
      SET title = $1, description = $2, discount = $3, valid_until = $4, image_url = $5, is_active = $6, updated_at = CURRENT_TIMESTAMP
      WHERE id = $7
    `).run(title, description, discount, valid_until || null, image_url || null, is_active !== undefined ? is_active : 1, req.params.id)

    const updated = await db.prepare('SELECT * FROM promotions WHERE id = $1').get(req.params.id)

    res.json(updated)
  } catch (error) {
    console.error('Update promotion error:', error)
    res.status(500).json({ message: 'Erro ao atualizar promoção' })
  }
})

// Delete promotion (admin only)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const exists = await db.prepare('SELECT id FROM promotions WHERE id = $1').get(req.params.id)

    if (!exists) {
      return res.status(404).json({ message: 'Promoção não encontrada' })
    }

    await db.prepare('DELETE FROM promotions WHERE id = $1').run(req.params.id)

    res.json({ message: 'Promoção deletada com sucesso' })
  } catch (error) {
    console.error('Delete promotion error:', error)
    res.status(500).json({ message: 'Erro ao deletar promoção' })
  }
})

export default router

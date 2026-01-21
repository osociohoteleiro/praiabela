import express from 'express'
import db from '../config/database.js'
import { authMiddleware } from '../middleware/auth.js'

const router = express.Router()

// Get all experiences (public - only active)
router.get('/', (req, res) => {
  try {
    const experiences = db.prepare('SELECT * FROM experiences WHERE is_active = 1 ORDER BY display_order ASC, created_at DESC').all()
    res.json(experiences)
  } catch (error) {
    console.error('Get experiences error:', error)
    res.status(500).json({ message: 'Erro ao buscar experiências' })
  }
})

// Get all experiences (admin - including inactive)
router.get('/admin/all', authMiddleware, (req, res) => {
  try {
    const experiences = db.prepare('SELECT * FROM experiences ORDER BY display_order ASC, created_at DESC').all()
    res.json(experiences)
  } catch (error) {
    console.error('Get all experiences error:', error)
    res.status(500).json({ message: 'Erro ao buscar experiências' })
  }
})

// Get single experience
router.get('/:id', (req, res) => {
  try {
    const experience = db.prepare('SELECT * FROM experiences WHERE id = ?').get(req.params.id)
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
router.post('/', authMiddleware, (req, res) => {
  try {
    const { title, description, image_url, display_order, is_active } = req.body

    if (!title || !description || !image_url) {
      return res.status(400).json({ message: 'Título, descrição e imagem são obrigatórios' })
    }

    const result = db.prepare(`
      INSERT INTO experiences (title, description, image_url, display_order, is_active)
      VALUES (?, ?, ?, ?, ?)
    `).run(
      title,
      description,
      image_url,
      display_order || 0,
      is_active !== undefined ? is_active : 1
    )

    const newExperience = db.prepare('SELECT * FROM experiences WHERE id = ?').get(result.lastInsertRowid)
    res.status(201).json(newExperience)
  } catch (error) {
    console.error('Create experience error:', error)
    res.status(500).json({ message: 'Erro ao criar experiência' })
  }
})

// Update experience (admin only)
router.put('/:id', authMiddleware, (req, res) => {
  try {
    const { title, description, image_url, display_order, is_active } = req.body

    const exists = db.prepare('SELECT id FROM experiences WHERE id = ?').get(req.params.id)
    if (!exists) {
      return res.status(404).json({ message: 'Experiência não encontrada' })
    }

    db.prepare(`
      UPDATE experiences
      SET title = ?, description = ?, image_url = ?, display_order = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      title,
      description,
      image_url,
      display_order || 0,
      is_active !== undefined ? is_active : 1,
      req.params.id
    )

    const updated = db.prepare('SELECT * FROM experiences WHERE id = ?').get(req.params.id)
    res.json(updated)
  } catch (error) {
    console.error('Update experience error:', error)
    res.status(500).json({ message: 'Erro ao atualizar experiência' })
  }
})

// Delete experience (admin only)
router.delete('/:id', authMiddleware, (req, res) => {
  try {
    const exists = db.prepare('SELECT id FROM experiences WHERE id = ?').get(req.params.id)
    if (!exists) {
      return res.status(404).json({ message: 'Experiência não encontrada' })
    }

    db.prepare('DELETE FROM experiences WHERE id = ?').run(req.params.id)
    res.json({ message: 'Experiência removida com sucesso' })
  } catch (error) {
    console.error('Delete experience error:', error)
    res.status(500).json({ message: 'Erro ao remover experiência' })
  }
})

// Reorder experiences (admin only)
router.put('/reorder/batch', authMiddleware, (req, res) => {
  try {
    const { items } = req.body

    if (!Array.isArray(items)) {
      return res.status(400).json({ message: 'Items deve ser um array' })
    }

    items.forEach((item, index) => {
      db.prepare('UPDATE experiences SET display_order = ? WHERE id = ?').run(index, item.id)
    })

    res.json({ message: 'Ordem atualizada com sucesso' })
  } catch (error) {
    console.error('Reorder experiences error:', error)
    res.status(500).json({ message: 'Erro ao reordenar experiências' })
  }
})

export default router

import express from 'express'
import db from '../config/database.js'
import { authMiddleware } from '../middleware/auth.js'

const router = express.Router()

// Get all gallery images (public - only active)
router.get('/', (req, res) => {
  try {
    const images = db.prepare('SELECT * FROM gallery WHERE is_active = 1 ORDER BY display_order ASC, created_at DESC').all()
    res.json(images)
  } catch (error) {
    console.error('Get gallery error:', error)
    res.status(500).json({ message: 'Erro ao buscar galeria' })
  }
})

// Get all gallery images (admin - including inactive)
router.get('/admin/all', authMiddleware, (req, res) => {
  try {
    const images = db.prepare('SELECT * FROM gallery ORDER BY display_order ASC, created_at DESC').all()
    res.json(images)
  } catch (error) {
    console.error('Get all gallery error:', error)
    res.status(500).json({ message: 'Erro ao buscar galeria' })
  }
})

// Add image to gallery (admin only)
router.post('/', authMiddleware, (req, res) => {
  try {
    const { url, caption, display_order, is_active } = req.body

    if (!url) {
      return res.status(400).json({ message: 'URL da imagem é obrigatória' })
    }

    const result = db.prepare(`
      INSERT INTO gallery (url, caption, display_order, is_active)
      VALUES (?, ?, ?, ?)
    `).run(
      url,
      caption || '',
      display_order || 0,
      is_active !== undefined ? is_active : 1
    )

    const newImage = db.prepare('SELECT * FROM gallery WHERE id = ?').get(result.lastInsertRowid)
    res.status(201).json(newImage)
  } catch (error) {
    console.error('Create gallery image error:', error)
    res.status(500).json({ message: 'Erro ao adicionar imagem' })
  }
})

// Update gallery image (admin only)
router.put('/:id', authMiddleware, (req, res) => {
  try {
    const { url, caption, display_order, is_active } = req.body

    const exists = db.prepare('SELECT id FROM gallery WHERE id = ?').get(req.params.id)
    if (!exists) {
      return res.status(404).json({ message: 'Imagem não encontrada' })
    }

    db.prepare(`
      UPDATE gallery
      SET url = ?, caption = ?, display_order = ?, is_active = ?
      WHERE id = ?
    `).run(
      url,
      caption || '',
      display_order || 0,
      is_active !== undefined ? is_active : 1,
      req.params.id
    )

    const updated = db.prepare('SELECT * FROM gallery WHERE id = ?').get(req.params.id)
    res.json(updated)
  } catch (error) {
    console.error('Update gallery image error:', error)
    res.status(500).json({ message: 'Erro ao atualizar imagem' })
  }
})

// Delete gallery image (admin only)
router.delete('/:id', authMiddleware, (req, res) => {
  try {
    const exists = db.prepare('SELECT id FROM gallery WHERE id = ?').get(req.params.id)
    if (!exists) {
      return res.status(404).json({ message: 'Imagem não encontrada' })
    }

    db.prepare('DELETE FROM gallery WHERE id = ?').run(req.params.id)
    res.json({ message: 'Imagem removida com sucesso' })
  } catch (error) {
    console.error('Delete gallery image error:', error)
    res.status(500).json({ message: 'Erro ao remover imagem' })
  }
})

// Reorder gallery images (admin only)
router.put('/reorder/batch', authMiddleware, (req, res) => {
  try {
    const { items } = req.body

    if (!Array.isArray(items)) {
      return res.status(400).json({ message: 'Items deve ser um array' })
    }

    items.forEach((item, index) => {
      db.prepare('UPDATE gallery SET display_order = ? WHERE id = ?').run(index, item.id)
    })

    res.json({ message: 'Ordem atualizada com sucesso' })
  } catch (error) {
    console.error('Reorder gallery error:', error)
    res.status(500).json({ message: 'Erro ao reordenar galeria' })
  }
})

export default router

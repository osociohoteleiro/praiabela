import express from 'express'
import db from '../config/database.js'
import { authMiddleware } from '../middleware/auth.js'

const router = express.Router()

// Get all rooms (public)
router.get('/', (req, res) => {
  try {
    const rooms = db.prepare('SELECT * FROM rooms WHERE is_active = 1 ORDER BY created_at DESC').all()

    // Parse JSON fields
    const parsedRooms = rooms.map(room => ({
      ...room,
      amenities: JSON.parse(room.amenities || '[]'),
      image_urls: JSON.parse(room.image_urls || '[]'),
    }))

    res.json(parsedRooms)
  } catch (error) {
    console.error('Get rooms error:', error)
    res.status(500).json({ message: 'Erro ao buscar quartos' })
  }
})

// Get all rooms for admin (including inactive)
router.get('/admin/all', authMiddleware, (req, res) => {
  try {
    const rooms = db.prepare('SELECT * FROM rooms ORDER BY created_at DESC').all()

    // Parse JSON fields
    const parsedRooms = rooms.map(room => ({
      ...room,
      amenities: JSON.parse(room.amenities || '[]'),
      image_urls: JSON.parse(room.image_urls || '[]'),
    }))

    res.json(parsedRooms)
  } catch (error) {
    console.error('Get all rooms error:', error)
    res.status(500).json({ message: 'Erro ao buscar quartos' })
  }
})

// Get single room (public)
router.get('/:id', (req, res) => {
  try {
    const room = db.prepare('SELECT * FROM rooms WHERE id = ?').get(req.params.id)

    if (!room) {
      return res.status(404).json({ message: 'Quarto não encontrado' })
    }

    const parsed = {
      ...room,
      amenities: JSON.parse(room.amenities || '[]'),
      image_urls: JSON.parse(room.image_urls || '[]'),
    }

    res.json(parsed)
  } catch (error) {
    console.error('Get room error:', error)
    res.status(500).json({ message: 'Erro ao buscar quarto' })
  }
})

// Create room (admin only)
router.post('/', authMiddleware, (req, res) => {
  try {
    const { name, description, capacity, size, amenities, image_urls, is_active } = req.body

    if (!name || !description) {
      return res.status(400).json({ message: 'Campos obrigatórios faltando' })
    }

    const result = db.prepare(`
      INSERT INTO rooms (name, description, capacity, size, amenities, image_urls, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      name,
      description,
      capacity || 2,
      size || '',
      JSON.stringify(amenities || []),
      JSON.stringify(image_urls || []),
      is_active !== undefined ? is_active : 1
    )

    const newRoom = db.prepare('SELECT * FROM rooms WHERE id = ?').get(result.lastInsertRowid)

    const parsed = {
      ...newRoom,
      amenities: JSON.parse(newRoom.amenities || '[]'),
      image_urls: JSON.parse(newRoom.image_urls || '[]'),
    }

    res.status(201).json(parsed)
  } catch (error) {
    console.error('Create room error:', error)
    res.status(500).json({ message: 'Erro ao criar quarto' })
  }
})

// Update room (admin only)
router.put('/:id', authMiddleware, (req, res) => {
  try {
    const { name, description, capacity, size, amenities, image_urls, is_active } = req.body

    const exists = db.prepare('SELECT id FROM rooms WHERE id = ?').get(req.params.id)

    if (!exists) {
      return res.status(404).json({ message: 'Quarto não encontrado' })
    }

    db.prepare(`
      UPDATE rooms
      SET name = ?, description = ?, capacity = ?, size = ?, amenities = ?, image_urls = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      name,
      description,
      capacity || 2,
      size || '',
      JSON.stringify(amenities || []),
      JSON.stringify(image_urls || []),
      is_active !== undefined ? is_active : 1,
      req.params.id
    )

    const updated = db.prepare('SELECT * FROM rooms WHERE id = ?').get(req.params.id)

    const parsed = {
      ...updated,
      amenities: JSON.parse(updated.amenities || '[]'),
      image_urls: JSON.parse(updated.image_urls || '[]'),
    }

    res.json(parsed)
  } catch (error) {
    console.error('Update room error:', error)
    res.status(500).json({ message: 'Erro ao atualizar quarto' })
  }
})

// Delete room (admin only)
router.delete('/:id', authMiddleware, (req, res) => {
  try {
    const exists = db.prepare('SELECT id FROM rooms WHERE id = ?').get(req.params.id)

    if (!exists) {
      return res.status(404).json({ message: 'Quarto não encontrado' })
    }

    db.prepare('DELETE FROM rooms WHERE id = ?').run(req.params.id)

    res.json({ message: 'Quarto deletado com sucesso' })
  } catch (error) {
    console.error('Delete room error:', error)
    res.status(500).json({ message: 'Erro ao deletar quarto' })
  }
})

export default router

import express from 'express'
import { pool } from '../config/database.js'
import { authMiddleware } from '../middleware/auth.js'

const router = express.Router()

// Get all rooms (public)
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM rooms WHERE is_active = 1 ORDER BY created_at DESC')

    // Parse JSON fields
    const parsedRooms = result.rows.map(room => ({
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
router.get('/admin/all', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM rooms ORDER BY created_at DESC')

    // Parse JSON fields
    const parsedRooms = result.rows.map(room => ({
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
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM rooms WHERE id = $1', [req.params.id])
    const room = result.rows[0]

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
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, description, capacity, size, price, amenities, image_urls, is_active } = req.body

    if (!name || !description) {
      return res.status(400).json({ message: 'Campos obrigatórios faltando' })
    }

    const result = await pool.query(`
      INSERT INTO rooms (name, description, capacity, size, price, amenities, image_urls, is_active)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [
      name,
      description,
      capacity || 2,
      size || '',
      price || 0,
      JSON.stringify(amenities || []),
      JSON.stringify(image_urls || []),
      is_active !== undefined ? is_active : 1
    ])

    const newRoom = result.rows[0]
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
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { name, description, capacity, size, price, amenities, image_urls, is_active } = req.body

    const exists = await pool.query('SELECT id FROM rooms WHERE id = $1', [req.params.id])

    if (exists.rows.length === 0) {
      return res.status(404).json({ message: 'Quarto não encontrado' })
    }

    const result = await pool.query(`
      UPDATE rooms
      SET name = $1, description = $2, capacity = $3, size = $4, price = $5, amenities = $6, image_urls = $7, is_active = $8, updated_at = CURRENT_TIMESTAMP
      WHERE id = $9
      RETURNING *
    `, [
      name,
      description,
      capacity || 2,
      size || '',
      price || 0,
      JSON.stringify(amenities || []),
      JSON.stringify(image_urls || []),
      is_active !== undefined ? is_active : 1,
      req.params.id
    ])

    const updated = result.rows[0]
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
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const exists = await pool.query('SELECT id FROM rooms WHERE id = $1', [req.params.id])

    if (exists.rows.length === 0) {
      return res.status(404).json({ message: 'Quarto não encontrado' })
    }

    await pool.query('DELETE FROM rooms WHERE id = $1', [req.params.id])

    res.json({ message: 'Quarto deletado com sucesso' })
  } catch (error) {
    console.error('Delete room error:', error)
    res.status(500).json({ message: 'Erro ao deletar quarto' })
  }
})

export default router

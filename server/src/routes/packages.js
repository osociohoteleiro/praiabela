import express from 'express'
import { pool } from '../config/database.js'
import { authMiddleware } from '../middleware/auth.js'

const router = express.Router()

// Get all packages (public - only active)
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM packages WHERE is_active = 1 ORDER BY is_featured DESC, created_at DESC')

    // Parse JSON fields
    const parsedPackages = result.rows.map(pkg => ({
      ...pkg,
      inclusions: JSON.parse(pkg.inclusions || '[]'),
      image_urls: JSON.parse(pkg.image_urls || '[]'),
    }))

    res.json(parsedPackages)
  } catch (error) {
    console.error('Get packages error:', error)
    res.status(500).json({ message: 'Erro ao buscar pacotes' })
  }
})

// Get all packages for admin (including inactive)
router.get('/admin', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM packages ORDER BY is_featured DESC, created_at DESC')

    // Parse JSON fields
    const parsedPackages = result.rows.map(pkg => ({
      ...pkg,
      inclusions: JSON.parse(pkg.inclusions || '[]'),
      image_urls: JSON.parse(pkg.image_urls || '[]'),
    }))

    res.json(parsedPackages)
  } catch (error) {
    console.error('Get packages admin error:', error)
    res.status(500).json({ message: 'Erro ao buscar pacotes' })
  }
})

// Get single package (public)
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM packages WHERE id = $1', [req.params.id])
    const pkg = result.rows[0]

    if (!pkg) {
      return res.status(404).json({ message: 'Pacote não encontrado' })
    }

    const parsed = {
      ...pkg,
      inclusions: JSON.parse(pkg.inclusions || '[]'),
      image_urls: JSON.parse(pkg.image_urls || '[]'),
    }

    res.json(parsed)
  } catch (error) {
    console.error('Get package error:', error)
    res.status(500).json({ message: 'Erro ao buscar pacote' })
  }
})

// Create package (admin only)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, description, price, inclusions, image_urls, is_featured, is_active } = req.body

    if (!name || !description || !price || !inclusions) {
      return res.status(400).json({ message: 'Campos obrigatórios faltando' })
    }

    const result = await pool.query(`
      INSERT INTO packages (name, description, price, inclusions, image_urls, is_featured, is_active)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [
      name,
      description,
      price,
      JSON.stringify(inclusions),
      JSON.stringify(image_urls || []),
      is_featured || 0,
      is_active !== undefined ? is_active : 1
    ])

    const newPackage = result.rows[0]
    const parsed = {
      ...newPackage,
      inclusions: JSON.parse(newPackage.inclusions),
      image_urls: JSON.parse(newPackage.image_urls || '[]'),
    }

    res.status(201).json(parsed)
  } catch (error) {
    console.error('Create package error:', error)
    res.status(500).json({ message: 'Erro ao criar pacote' })
  }
})

// Update package (admin only)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { name, description, price, inclusions, image_urls, is_featured, is_active } = req.body

    const exists = await pool.query('SELECT id FROM packages WHERE id = $1', [req.params.id])

    if (exists.rows.length === 0) {
      return res.status(404).json({ message: 'Pacote não encontrado' })
    }

    const result = await pool.query(`
      UPDATE packages
      SET name = $1, description = $2, price = $3, inclusions = $4, image_urls = $5, is_featured = $6, is_active = $7, updated_at = CURRENT_TIMESTAMP
      WHERE id = $8
      RETURNING *
    `, [
      name,
      description,
      price,
      JSON.stringify(inclusions),
      JSON.stringify(image_urls || []),
      is_featured || 0,
      is_active !== undefined ? is_active : 1,
      req.params.id
    ])

    const updated = result.rows[0]
    const parsed = {
      ...updated,
      inclusions: JSON.parse(updated.inclusions),
      image_urls: JSON.parse(updated.image_urls || '[]'),
    }

    res.json(parsed)
  } catch (error) {
    console.error('Update package error:', error)
    res.status(500).json({ message: 'Erro ao atualizar pacote' })
  }
})

// Delete package (admin only)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const exists = await pool.query('SELECT id FROM packages WHERE id = $1', [req.params.id])

    if (exists.rows.length === 0) {
      return res.status(404).json({ message: 'Pacote não encontrado' })
    }

    await pool.query('DELETE FROM packages WHERE id = $1', [req.params.id])

    res.json({ message: 'Pacote deletado com sucesso' })
  } catch (error) {
    console.error('Delete package error:', error)
    res.status(500).json({ message: 'Erro ao deletar pacote' })
  }
})

export default router

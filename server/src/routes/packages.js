import express from 'express'
import db from '../config/database.js'
import { authMiddleware } from '../middleware/auth.js'

const router = express.Router()

// Get all packages (public - only active)
router.get('/', (req, res) => {
  try {
    const packages = db.prepare('SELECT * FROM packages WHERE is_active = 1 ORDER BY is_featured DESC, created_at DESC').all()

    // Parse JSON fields
    const parsedPackages = packages.map(pkg => ({
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
router.get('/admin', authMiddleware, (req, res) => {
  try {
    const packages = db.prepare('SELECT * FROM packages ORDER BY is_featured DESC, created_at DESC').all()

    // Parse JSON fields
    const parsedPackages = packages.map(pkg => ({
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
router.get('/:id', (req, res) => {
  try {
    const pkg = db.prepare('SELECT * FROM packages WHERE id = ?').get(req.params.id)

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
router.post('/', authMiddleware, (req, res) => {
  try {
    const { name, description, price, inclusions, image_urls, is_featured, is_active } = req.body

    if (!name || !description || !price || !inclusions) {
      return res.status(400).json({ message: 'Campos obrigatórios faltando' })
    }

    const result = db.prepare(`
      INSERT INTO packages (name, description, price, inclusions, image_urls, is_featured, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      name,
      description,
      price,
      JSON.stringify(inclusions),
      JSON.stringify(image_urls || []),
      is_featured || 0,
      is_active !== undefined ? is_active : 1
    )

    const newPackage = db.prepare('SELECT * FROM packages WHERE id = ?').get(result.lastInsertRowid)

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
router.put('/:id', authMiddleware, (req, res) => {
  try {
    const { name, description, price, inclusions, image_urls, is_featured, is_active } = req.body

    const exists = db.prepare('SELECT id FROM packages WHERE id = ?').get(req.params.id)

    if (!exists) {
      return res.status(404).json({ message: 'Pacote não encontrado' })
    }

    db.prepare(`
      UPDATE packages
      SET name = ?, description = ?, price = ?, inclusions = ?, image_urls = ?, is_featured = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      name,
      description,
      price,
      JSON.stringify(inclusions),
      JSON.stringify(image_urls || []),
      is_featured || 0,
      is_active !== undefined ? is_active : 1,
      req.params.id
    )

    const updated = db.prepare('SELECT * FROM packages WHERE id = ?').get(req.params.id)

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
router.delete('/:id', authMiddleware, (req, res) => {
  try {
    const exists = db.prepare('SELECT id FROM packages WHERE id = ?').get(req.params.id)

    if (!exists) {
      return res.status(404).json({ message: 'Pacote não encontrado' })
    }

    db.prepare('DELETE FROM packages WHERE id = ?').run(req.params.id)

    res.json({ message: 'Pacote deletado com sucesso' })
  } catch (error) {
    console.error('Delete package error:', error)
    res.status(500).json({ message: 'Erro ao deletar pacote' })
  }
})

export default router

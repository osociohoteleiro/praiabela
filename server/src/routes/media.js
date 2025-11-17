import express from 'express'
import db from '../config/database.js'
import { authMiddleware } from '../middleware/auth.js'

const router = express.Router()

// Get all media (admin only)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { type, category } = req.query

    let query = 'SELECT * FROM media'
    const params = []

    if (type || category) {
      query += ' WHERE'
      let paramIndex = 1
      if (type) {
        query += ` type = $${paramIndex}`
        params.push(type)
        paramIndex++
      }
      if (category) {
        if (type) query += ' AND'
        query += ` category = $${paramIndex}`
        params.push(category)
      }
    }

    query += ' ORDER BY uploaded_at DESC'

    const media = await db.prepare(query).all(...params)

    res.json(media)
  } catch (error) {
    console.error('Get media error:', error)
    res.status(500).json({ message: 'Erro ao buscar mídia' })
  }
})

export default router

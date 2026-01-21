import express from 'express'
import { pool } from '../config/database.js'
import { authMiddleware } from '../middleware/auth.js'

const router = express.Router()

// Get site info (public)
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM site_info WHERE id = 1')
    const siteInfo = result.rows[0]

    if (!siteInfo) {
      return res.status(404).json({ message: 'Informações do site não encontradas' })
    }

    res.json(siteInfo)
  } catch (error) {
    console.error('Get site info error:', error)
    res.status(500).json({ message: 'Erro ao buscar informações do site' })
  }
})

// Update site info (admin only)
router.put('/', authMiddleware, async (req, res) => {
  try {
    const {
      about_text,
      contact_email,
      contact_phone,
      contact_address,
      check_in_time,
      check_out_time,
      facebook_url,
      instagram_url,
      whatsapp_number,
      hero_video_url,
      logo_url,
    } = req.body

    await pool.query(`
      UPDATE site_info
      SET about_text = $1,
          contact_email = $2,
          contact_phone = $3,
          contact_address = $4,
          check_in_time = $5,
          check_out_time = $6,
          facebook_url = $7,
          instagram_url = $8,
          whatsapp_number = $9,
          hero_video_url = $10,
          logo_url = $11,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = 1
    `, [
      about_text,
      contact_email,
      contact_phone,
      contact_address,
      check_in_time,
      check_out_time,
      facebook_url || null,
      instagram_url || null,
      whatsapp_number || null,
      hero_video_url || null,
      logo_url || null
    ])

    const result = await pool.query('SELECT * FROM site_info WHERE id = 1')
    res.json(result.rows[0])
  } catch (error) {
    console.error('Update site info error:', error)
    res.status(500).json({ message: 'Erro ao atualizar informações do site' })
  }
})

export default router

import express from 'express'
import db from '../config/database.js'
import { authMiddleware } from '../middleware/auth.js'

const router = express.Router()

// Get site info (public)
router.get('/', (req, res) => {
  try {
    const siteInfo = db.prepare('SELECT * FROM site_info WHERE id = 1').get()

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
router.put('/', authMiddleware, (req, res) => {
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

    db.prepare(`
      UPDATE site_info
      SET about_text = ?,
          contact_email = ?,
          contact_phone = ?,
          contact_address = ?,
          check_in_time = ?,
          check_out_time = ?,
          facebook_url = ?,
          instagram_url = ?,
          whatsapp_number = ?,
          hero_video_url = ?,
          logo_url = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = 1
    `).run(
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
    )

    const updated = db.prepare('SELECT * FROM site_info WHERE id = 1').get()

    res.json(updated)
  } catch (error) {
    console.error('Update site info error:', error)
    res.status(500).json({ message: 'Erro ao atualizar informações do site' })
  }
})

export default router

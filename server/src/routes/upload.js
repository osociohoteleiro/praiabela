import express from 'express'
import { uploadImage, uploadVideo, uploadMultipleImages } from '../middleware/upload.js'
import { authMiddleware } from '../middleware/auth.js'
import { uploadToS3, deleteFromS3 } from '../config/s3.js'
import db from '../config/database.js'

const router = express.Router()

// Upload single image
router.post('/image', authMiddleware, (req, res) => {
  uploadImage(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err.message })
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Nenhum arquivo enviado' })
    }

    try {
      const result = await uploadToS3(req.file, 'images')

      // Save to database
      db.prepare(`
        INSERT INTO media (type, category, url, s3_key, filename, size)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run('image', req.body.category || 'general', result.url, result.key, result.filename, req.file.size)

      res.json({
        message: 'Upload realizado com sucesso',
        ...result,
      })
    } catch (error) {
      console.error('Image upload error:', error)
      res.status(500).json({ message: 'Erro ao fazer upload da imagem' })
    }
  })
})

// Upload video
router.post('/video', authMiddleware, (req, res) => {
  uploadVideo(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err.message })
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Nenhum arquivo enviado' })
    }

    try {
      const result = await uploadToS3(req.file, 'videos')

      // Save to database
      db.prepare(`
        INSERT INTO media (type, category, url, s3_key, filename, size)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run('video', req.body.category || 'hero', result.url, result.key, result.filename, req.file.size)

      res.json({
        message: 'Upload realizado com sucesso',
        ...result,
      })
    } catch (error) {
      console.error('Video upload error:', error)
      res.status(500).json({ message: 'Erro ao fazer upload do vídeo' })
    }
  })
})

// Upload multiple images
router.post('/images', authMiddleware, (req, res) => {
  uploadMultipleImages(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err.message })
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'Nenhum arquivo enviado' })
    }

    try {
      const uploadPromises = req.files.map(file => uploadToS3(file, 'images'))
      const results = await Promise.all(uploadPromises)

      // Save to database
      const stmt = db.prepare(`
        INSERT INTO media (type, category, url, s3_key, filename, size)
        VALUES (?, ?, ?, ?, ?, ?)
      `)

      for (let i = 0; i < results.length; i++) {
        stmt.run('image', req.body.category || 'gallery', results[i].url, results[i].key, results[i].filename, req.files[i].size)
      }

      res.json({
        message: `${results.length} arquivos enviados com sucesso`,
        files: results,
      })
    } catch (error) {
      console.error('Multiple images upload error:', error)
      res.status(500).json({ message: 'Erro ao fazer upload das imagens' })
    }
  })
})

// Delete file
router.delete('/:key(*)', authMiddleware, async (req, res) => {
  try {
    const key = req.params.key

    // Delete from S3
    await deleteFromS3(key)

    // Delete from database
    db.prepare('DELETE FROM media WHERE s3_key = ?').run(key)

    res.json({ message: 'Arquivo deletado com sucesso' })
  } catch (error) {
    console.error('Delete file error:', error)
    res.status(500).json({ message: 'Erro ao deletar arquivo' })
  }
})

export default router

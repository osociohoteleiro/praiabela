import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import db from '../config/database.js'
import { authMiddleware } from '../middleware/auth.js'

const router = express.Router()

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: 'Email e senha são obrigatórios' })
    }

    // Find admin
    const admin = await db.prepare('SELECT * FROM admins WHERE email = $1').get(email)

    if (!admin) {
      return res.status(401).json({ message: 'Credenciais inválidas' })
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, admin.password)

    if (!isValidPassword) {
      return res.status(401).json({ message: 'Credenciais inválidas' })
    }

    // Generate token
    const token = jwt.sign(
      { id: admin.id, email: admin.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.json({
      token,
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
      },
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ message: 'Erro ao fazer login' })
  }
})

// Verify token
router.get('/verify', authMiddleware, async (req, res) => {
  try {
    const admin = await db.prepare('SELECT id, email, name FROM admins WHERE id = $1').get(req.adminId)

    if (!admin) {
      return res.status(404).json({ message: 'Admin não encontrado' })
    }

    res.json({ admin })
  } catch (error) {
    console.error('Verify error:', error)
    res.status(500).json({ message: 'Erro ao verificar token' })
  }
})

export default router

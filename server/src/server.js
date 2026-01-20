import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import rateLimit from 'express-rate-limit'
import dotenv from 'dotenv'
import { initDatabase } from './config/database.js'


// Routes
import authRoutes from './routes/auth.js'
import promotionsRoutes from './routes/promotions.js'
import packagesRoutes from './routes/packages.js'
import roomsRoutes from './routes/rooms.js'
import siteInfoRoutes from './routes/siteInfo.js'
import uploadRoutes from './routes/upload.js'
import galleryRoutes from './routes/gallery.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Initialize database (async)
await initDatabase()

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}))

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Muitas requisições deste IP, tente novamente mais tarde.',
})

app.use('/api/', limiter)

// CORS
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? 'https://yourdomain.com'
    : 'http://localhost:3000',
  credentials: true,
}))

// Body parsing
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Compression
app.use(compression())

// API Routes
app.use('/api/auth', authRoutes)
app.use('/api/promotions', promotionsRoutes)
app.use('/api/packages', packagesRoutes)
app.use('/api/rooms', roomsRoutes)
app.use('/api/site-info', siteInfoRoutes)
app.use('/api/upload', uploadRoutes)
app.use('/api/gallery', galleryRoutes)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'API Pousada Praia Bela funcionando!' })
})

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(err.status || 500).json({
    message: err.message || 'Erro interno do servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  })
})

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Rota não encontrada' })
})

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`)
  console.log(`🌊 Ambiente: ${process.env.NODE_ENV || 'development'}`)
  console.log(`📦 Database: ${process.env.DB_PATH}`)
})

export default app

import express from 'express'
import { pool } from '../config/database.js'
import { authMiddleware } from '../middleware/auth.js'

const router = express.Router()

function slugify(text) {
  return String(text)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 200)
}

async function uniqueSlug(base, ignoreId = null) {
  let slug = base || 'post'
  let i = 1
  while (true) {
    const params = ignoreId ? [slug, ignoreId] : [slug]
    const sql = ignoreId
      ? 'SELECT id FROM posts WHERE slug = $1 AND id <> $2'
      : 'SELECT id FROM posts WHERE slug = $1'
    const r = await pool.query(sql, params)
    if (r.rows.length === 0) return slug
    i += 1
    slug = `${base}-${i}`
  }
}

// Public list (active only) with optional category filter
router.get('/', async (req, res) => {
  try {
    const { category, limit } = req.query
    const params = []
    let sql = 'SELECT * FROM posts WHERE is_active = 1'
    if (category) {
      params.push(category)
      sql += ` AND category = $${params.length}`
    }
    sql += ' ORDER BY published_at DESC'
    if (limit) {
      params.push(Number(limit))
      sql += ` LIMIT $${params.length}`
    }
    const result = await pool.query(sql, params)
    res.json(result.rows)
  } catch (error) {
    console.error('Get posts error:', error)
    res.status(500).json({ message: 'Erro ao buscar postagens' })
  }
})

// Distinct categories (public)
router.get('/categories', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT category, COUNT(*)::int AS count
      FROM posts
      WHERE is_active = 1 AND category IS NOT NULL AND category <> ''
      GROUP BY category
      ORDER BY category ASC
    `)
    res.json(result.rows)
  } catch (error) {
    console.error('Get post categories error:', error)
    res.status(500).json({ message: 'Erro ao buscar categorias' })
  }
})

// Admin list (all, including inactive)
router.get('/admin/all', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM posts ORDER BY published_at DESC, created_at DESC')
    res.json(result.rows)
  } catch (error) {
    console.error('Get all posts error:', error)
    res.status(500).json({ message: 'Erro ao buscar postagens' })
  }
})

// Public — get by slug
router.get('/slug/:slug', async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM posts WHERE slug = $1 AND is_active = 1', [req.params.slug])
    if (r.rows.length === 0) return res.status(404).json({ message: 'Postagem não encontrada' })
    res.json(r.rows[0])
  } catch (error) {
    console.error('Get post by slug error:', error)
    res.status(500).json({ message: 'Erro ao buscar postagem' })
  }
})

// Get by id (admin or public)
router.get('/:id', async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM posts WHERE id = $1', [req.params.id])
    if (r.rows.length === 0) return res.status(404).json({ message: 'Postagem não encontrada' })
    res.json(r.rows[0])
  } catch (error) {
    console.error('Get post error:', error)
    res.status(500).json({ message: 'Erro ao buscar postagem' })
  }
})

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, content, cover_image, excerpt, category, published_at, is_active, slug } = req.body
    if (!title || !content || !cover_image) {
      return res.status(400).json({ message: 'Título, conteúdo e imagem de capa são obrigatórios' })
    }
    const baseSlug = slugify(slug || title)
    const finalSlug = await uniqueSlug(baseSlug)

    const result = await pool.query(`
      INSERT INTO posts (title, slug, excerpt, content, cover_image, category, published_at, is_active)
      VALUES ($1, $2, $3, $4, $5, $6, COALESCE($7, CURRENT_TIMESTAMP), $8)
      RETURNING *
    `, [
      title,
      finalSlug,
      excerpt || null,
      content,
      cover_image,
      category || null,
      published_at || null,
      is_active !== undefined ? is_active : 1,
    ])
    res.status(201).json(result.rows[0])
  } catch (error) {
    console.error('Create post error:', error)
    res.status(500).json({ message: 'Erro ao criar postagem' })
  }
})

router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const exists = await pool.query('SELECT id, slug FROM posts WHERE id = $1', [req.params.id])
    if (exists.rows.length === 0) return res.status(404).json({ message: 'Postagem não encontrada' })

    const { title, content, cover_image, excerpt, category, published_at, is_active, slug } = req.body

    const currentSlug = exists.rows[0].slug
    let finalSlug = currentSlug
    if (slug && slug !== currentSlug) {
      finalSlug = await uniqueSlug(slugify(slug), req.params.id)
    }

    const result = await pool.query(`
      UPDATE posts
      SET title = $1,
          slug = $2,
          excerpt = $3,
          content = $4,
          cover_image = $5,
          category = $6,
          published_at = COALESCE($7, published_at),
          is_active = $8,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $9
      RETURNING *
    `, [
      title,
      finalSlug,
      excerpt || null,
      content,
      cover_image,
      category || null,
      published_at || null,
      is_active !== undefined ? is_active : 1,
      req.params.id,
    ])
    res.json(result.rows[0])
  } catch (error) {
    console.error('Update post error:', error)
    res.status(500).json({ message: 'Erro ao atualizar postagem' })
  }
})

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const exists = await pool.query('SELECT id FROM posts WHERE id = $1', [req.params.id])
    if (exists.rows.length === 0) return res.status(404).json({ message: 'Postagem não encontrada' })
    await pool.query('DELETE FROM posts WHERE id = $1', [req.params.id])
    res.json({ message: 'Postagem removida com sucesso' })
  } catch (error) {
    console.error('Delete post error:', error)
    res.status(500).json({ message: 'Erro ao remover postagem' })
  }
})

export default router

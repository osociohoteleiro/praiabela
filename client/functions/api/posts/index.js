import { json, badRequest, serverError } from '../../_lib/response.js'
import { requireAuth } from '../../_lib/auth.js'

function slugify(text) {
  return String(text)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 200)
}

async function uniqueSlug(env, base, ignoreId = null) {
  let slug = base || 'post'
  let i = 1
  while (true) {
    const row = ignoreId
      ? await env.DB.prepare('SELECT id FROM posts WHERE slug = ? AND id <> ?').bind(slug, ignoreId).first()
      : await env.DB.prepare('SELECT id FROM posts WHERE slug = ?').bind(slug).first()
    if (!row) return slug
    i += 1
    slug = `${base}-${i}`
  }
}

export async function onRequestGet({ request, env }) {
  try {
    const url = new URL(request.url)
    const category = url.searchParams.get('category')
    const limit = url.searchParams.get('limit')

    const params = []
    let sql = 'SELECT * FROM posts WHERE is_active = 1'
    if (category) {
      params.push(category)
      sql += ' AND category = ?'
    }
    sql += ' ORDER BY published_at DESC'
    if (limit) {
      params.push(Number(limit))
      sql += ' LIMIT ?'
    }

    const result = await env.DB.prepare(sql).bind(...params).all()
    return json(result.results)
  } catch (err) {
    console.error('Get posts error:', err)
    return serverError('Erro ao buscar postagens')
  }
}

export async function onRequestPost({ request, env }) {
  const auth = await requireAuth(request, env)
  if (auth instanceof Response) return auth

  let body
  try {
    body = await request.json()
  } catch {
    return badRequest('JSON inválido')
  }

  const { title, content, cover_image, excerpt, category, published_at, is_active, slug } = body || {}
  if (!title || !content || !cover_image) {
    return badRequest('Título, conteúdo e imagem de capa são obrigatórios')
  }

  try {
    const base = slugify(slug || title)
    const finalSlug = await uniqueSlug(env, base)

    const result = await env.DB.prepare(`
      INSERT INTO posts (title, slug, excerpt, content, cover_image, category, published_at, is_active)
      VALUES (?, ?, ?, ?, ?, ?, COALESCE(?, CURRENT_TIMESTAMP), ?)
      RETURNING *
    `).bind(
      title,
      finalSlug,
      excerpt || null,
      content,
      cover_image,
      category || null,
      published_at || null,
      is_active !== undefined ? (is_active ? 1 : 0) : 1,
    ).first()

    return json(result, { status: 201 })
  } catch (err) {
    console.error('Create post error:', err)
    return serverError('Erro ao criar postagem')
  }
}

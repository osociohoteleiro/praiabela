import { json, badRequest, serverError } from '../../_lib/response.js'
import { requireAuth } from '../../_lib/auth.js'

export async function onRequestGet({ env }) {
  try {
    const result = await env.DB.prepare(
      'SELECT * FROM experiences WHERE is_active = 1 ORDER BY display_order ASC, created_at DESC'
    ).all()
    return json(result.results)
  } catch (err) {
    console.error('Get experiences error:', err)
    return serverError('Erro ao buscar experiências')
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

  const { title, description, image_url, display_order, is_active } = body || {}
  if (!title || !description || !image_url) {
    return badRequest('Título, descrição e imagem são obrigatórios')
  }

  try {
    const result = await env.DB.prepare(`
      INSERT INTO experiences (title, description, image_url, display_order, is_active)
      VALUES (?, ?, ?, ?, ?)
      RETURNING *
    `).bind(
      title,
      description,
      image_url,
      display_order || 0,
      is_active !== undefined ? (is_active ? 1 : 0) : 1
    ).first()

    return json(result, { status: 201 })
  } catch (err) {
    console.error('Create experience error:', err)
    return serverError('Erro ao criar experiência')
  }
}

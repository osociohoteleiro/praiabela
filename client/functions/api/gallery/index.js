import { json, badRequest, serverError } from '../../_lib/response.js'
import { requireAuth } from '../../_lib/auth.js'

export async function onRequestGet({ env }) {
  try {
    const result = await env.DB.prepare(
      'SELECT * FROM gallery WHERE is_active = 1 ORDER BY display_order ASC, created_at DESC'
    ).all()
    return json(result.results)
  } catch (err) {
    console.error('Get gallery error:', err)
    return serverError('Erro ao buscar galeria')
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

  const { url, caption, display_order, is_active } = body || {}
  if (!url) return badRequest('URL da imagem é obrigatória')

  try {
    const result = await env.DB.prepare(`
      INSERT INTO gallery (url, caption, display_order, is_active)
      VALUES (?, ?, ?, ?)
      RETURNING *
    `).bind(
      url,
      caption || '',
      display_order || 0,
      is_active !== undefined ? (is_active ? 1 : 0) : 1
    ).first()

    return json(result, { status: 201 })
  } catch (err) {
    console.error('Create gallery image error:', err)
    return serverError('Erro ao adicionar imagem')
  }
}

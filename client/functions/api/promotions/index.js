import { json, badRequest, serverError } from '../../_lib/response.js'
import { requireAuth } from '../../_lib/auth.js'

export async function onRequestGet({ env }) {
  try {
    const result = await env.DB.prepare(
      'SELECT * FROM promotions WHERE is_active = 1 ORDER BY created_at DESC'
    ).all()
    return json(result.results)
  } catch (err) {
    console.error('Get promotions error:', err)
    return serverError('Erro ao buscar promoções')
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

  const { title, description, discount, valid_until, image_url, is_active } = body || {}
  if (!title || !description || discount == null) {
    return badRequest('Campos obrigatórios faltando')
  }

  try {
    const result = await env.DB.prepare(`
      INSERT INTO promotions (title, description, discount, valid_until, image_url, is_active)
      VALUES (?, ?, ?, ?, ?, ?)
      RETURNING *
    `).bind(
      title,
      description,
      discount,
      valid_until || null,
      image_url || null,
      is_active !== undefined ? (is_active ? 1 : 0) : 1
    ).first()

    return json(result, { status: 201 })
  } catch (err) {
    console.error('Create promotion error:', err)
    return serverError('Erro ao criar promoção')
  }
}

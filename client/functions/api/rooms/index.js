import { json, badRequest, serverError, parseJsonField } from '../../_lib/response.js'
import { requireAuth } from '../../_lib/auth.js'

function parseRoom(room) {
  return {
    ...room,
    amenities: parseJsonField(room.amenities, []),
    image_urls: parseJsonField(room.image_urls, []),
  }
}

export async function onRequestGet({ env }) {
  try {
    const result = await env.DB.prepare(
      'SELECT * FROM rooms WHERE is_active = 1 ORDER BY created_at DESC'
    ).all()
    return json(result.results.map(parseRoom))
  } catch (err) {
    console.error('Get rooms error:', err)
    return serverError('Erro ao buscar quartos')
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

  const { name, description, capacity, size, price, amenities, image_urls, is_active } = body || {}
  if (!name || !description) {
    return badRequest('Campos obrigatórios faltando')
  }

  try {
    const result = await env.DB.prepare(`
      INSERT INTO rooms (name, description, capacity, size, price, amenities, image_urls, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      RETURNING *
    `).bind(
      name,
      description,
      capacity || 2,
      size || '',
      price || 0,
      JSON.stringify(amenities || []),
      JSON.stringify(image_urls || []),
      is_active !== undefined ? (is_active ? 1 : 0) : 1
    ).first()

    return json(parseRoom(result), { status: 201 })
  } catch (err) {
    console.error('Create room error:', err)
    return serverError('Erro ao criar quarto')
  }
}

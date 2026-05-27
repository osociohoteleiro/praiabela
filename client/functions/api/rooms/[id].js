import { json, badRequest, notFound, serverError, parseJsonField } from '../../_lib/response.js'
import { requireAuth } from '../../_lib/auth.js'

function parseRoom(room) {
  return {
    ...room,
    amenities: parseJsonField(room.amenities, []),
    image_urls: parseJsonField(room.image_urls, []),
  }
}

export async function onRequestGet({ params, env }) {
  try {
    const room = await env.DB.prepare('SELECT * FROM rooms WHERE id = ?')
      .bind(params.id).first()
    if (!room) return notFound('Quarto não encontrado')
    return json(parseRoom(room))
  } catch (err) {
    console.error('Get room error:', err)
    return serverError('Erro ao buscar quarto')
  }
}

export async function onRequestPut({ request, params, env }) {
  const auth = await requireAuth(request, env)
  if (auth instanceof Response) return auth

  let body
  try {
    body = await request.json()
  } catch {
    return badRequest('JSON inválido')
  }

  const { name, description, capacity, size, price, amenities, image_urls, is_active } = body || {}

  try {
    const exists = await env.DB.prepare('SELECT id FROM rooms WHERE id = ?')
      .bind(params.id).first()
    if (!exists) return notFound('Quarto não encontrado')

    const result = await env.DB.prepare(`
      UPDATE rooms
      SET name = ?, description = ?, capacity = ?, size = ?, price = ?, amenities = ?, image_urls = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
      RETURNING *
    `).bind(
      name,
      description,
      capacity || 2,
      size || '',
      price || 0,
      JSON.stringify(amenities || []),
      JSON.stringify(image_urls || []),
      is_active !== undefined ? (is_active ? 1 : 0) : 1,
      params.id
    ).first()

    return json(parseRoom(result))
  } catch (err) {
    console.error('Update room error:', err)
    return serverError('Erro ao atualizar quarto')
  }
}

export async function onRequestDelete({ request, params, env }) {
  const auth = await requireAuth(request, env)
  if (auth instanceof Response) return auth

  try {
    const exists = await env.DB.prepare('SELECT id FROM rooms WHERE id = ?')
      .bind(params.id).first()
    if (!exists) return notFound('Quarto não encontrado')

    await env.DB.prepare('DELETE FROM rooms WHERE id = ?').bind(params.id).run()
    return json({ message: 'Quarto deletado com sucesso' })
  } catch (err) {
    console.error('Delete room error:', err)
    return serverError('Erro ao deletar quarto')
  }
}

import { json, serverError, parseJsonField } from '../../../_lib/response.js'
import { requireAuth } from '../../../_lib/auth.js'

export async function onRequestGet({ request, env }) {
  const auth = await requireAuth(request, env)
  if (auth instanceof Response) return auth

  try {
    const result = await env.DB.prepare(
      'SELECT * FROM rooms ORDER BY created_at DESC'
    ).all()
    return json(result.results.map(room => ({
      ...room,
      amenities: parseJsonField(room.amenities, []),
      image_urls: parseJsonField(room.image_urls, []),
    })))
  } catch (err) {
    console.error('Get all rooms error:', err)
    return serverError('Erro ao buscar quartos')
  }
}

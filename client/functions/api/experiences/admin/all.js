import { json, serverError } from '../../../_lib/response.js'
import { requireAuth } from '../../../_lib/auth.js'

export async function onRequestGet({ request, env }) {
  const auth = await requireAuth(request, env)
  if (auth instanceof Response) return auth

  try {
    const result = await env.DB.prepare(
      'SELECT * FROM experiences ORDER BY display_order ASC, created_at DESC'
    ).all()
    return json(result.results)
  } catch (err) {
    console.error('Get all experiences error:', err)
    return serverError('Erro ao buscar experiências')
  }
}

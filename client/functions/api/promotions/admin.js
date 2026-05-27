import { json, serverError } from '../../_lib/response.js'
import { requireAuth } from '../../_lib/auth.js'

export async function onRequestGet({ request, env }) {
  const auth = await requireAuth(request, env)
  if (auth instanceof Response) return auth

  try {
    const result = await env.DB.prepare(
      'SELECT * FROM promotions ORDER BY created_at DESC'
    ).all()
    return json(result.results)
  } catch (err) {
    console.error('Get promotions admin error:', err)
    return serverError('Erro ao buscar promoções')
  }
}

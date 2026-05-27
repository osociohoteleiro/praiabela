import { json, serverError, parseJsonField } from '../../_lib/response.js'
import { requireAuth } from '../../_lib/auth.js'

export async function onRequestGet({ request, env }) {
  const auth = await requireAuth(request, env)
  if (auth instanceof Response) return auth

  try {
    const result = await env.DB.prepare(
      'SELECT * FROM packages ORDER BY is_featured DESC, created_at DESC'
    ).all()
    return json(result.results.map(pkg => ({
      ...pkg,
      inclusions: parseJsonField(pkg.inclusions, []),
      image_urls: parseJsonField(pkg.image_urls, []),
    })))
  } catch (err) {
    console.error('Get packages admin error:', err)
    return serverError('Erro ao buscar pacotes')
  }
}

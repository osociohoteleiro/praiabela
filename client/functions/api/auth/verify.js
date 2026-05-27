import { json, notFound, serverError } from '../../_lib/response.js'
import { requireAuth } from '../../_lib/auth.js'

export async function onRequestGet({ request, env }) {
  const auth = await requireAuth(request, env)
  if (auth instanceof Response) return auth

  try {
    const admin = await env.DB.prepare(
      'SELECT id, email, name FROM admins WHERE id = ?'
    ).bind(auth.adminId).first()

    if (!admin) return notFound('Admin não encontrado')

    return json({ admin })
  } catch (err) {
    console.error('Verify error:', err)
    return serverError('Erro ao verificar token')
  }
}

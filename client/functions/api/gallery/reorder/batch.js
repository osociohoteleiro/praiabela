import { json, badRequest, serverError } from '../../../_lib/response.js'
import { requireAuth } from '../../../_lib/auth.js'

export async function onRequestPut({ request, env }) {
  const auth = await requireAuth(request, env)
  if (auth instanceof Response) return auth

  let body
  try {
    body = await request.json()
  } catch {
    return badRequest('JSON inválido')
  }

  const { items } = body || {}
  if (!Array.isArray(items)) {
    return badRequest('Items deve ser um array')
  }

  try {
    const stmt = env.DB.prepare('UPDATE gallery SET display_order = ? WHERE id = ?')
    await env.DB.batch(items.map((item, i) => stmt.bind(i, item.id)))
    return json({ message: 'Ordem atualizada com sucesso' })
  } catch (err) {
    console.error('Reorder gallery error:', err)
    return serverError('Erro ao reordenar galeria')
  }
}

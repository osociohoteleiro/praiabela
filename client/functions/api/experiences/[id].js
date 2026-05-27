import { json, badRequest, notFound, serverError } from '../../_lib/response.js'
import { requireAuth } from '../../_lib/auth.js'

export async function onRequestGet({ params, env }) {
  try {
    const exp = await env.DB.prepare('SELECT * FROM experiences WHERE id = ?')
      .bind(params.id).first()
    if (!exp) return notFound('Experiência não encontrada')
    return json(exp)
  } catch (err) {
    console.error('Get experience error:', err)
    return serverError('Erro ao buscar experiência')
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

  const { title, description, image_url, display_order, is_active } = body || {}

  try {
    const exists = await env.DB.prepare('SELECT id FROM experiences WHERE id = ?')
      .bind(params.id).first()
    if (!exists) return notFound('Experiência não encontrada')

    const result = await env.DB.prepare(`
      UPDATE experiences
      SET title = ?, description = ?, image_url = ?, display_order = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
      RETURNING *
    `).bind(
      title,
      description,
      image_url,
      display_order || 0,
      is_active !== undefined ? (is_active ? 1 : 0) : 1,
      params.id
    ).first()

    return json(result)
  } catch (err) {
    console.error('Update experience error:', err)
    return serverError('Erro ao atualizar experiência')
  }
}

export async function onRequestDelete({ request, params, env }) {
  const auth = await requireAuth(request, env)
  if (auth instanceof Response) return auth

  try {
    const exists = await env.DB.prepare('SELECT id FROM experiences WHERE id = ?')
      .bind(params.id).first()
    if (!exists) return notFound('Experiência não encontrada')

    await env.DB.prepare('DELETE FROM experiences WHERE id = ?').bind(params.id).run()
    return json({ message: 'Experiência removida com sucesso' })
  } catch (err) {
    console.error('Delete experience error:', err)
    return serverError('Erro ao remover experiência')
  }
}

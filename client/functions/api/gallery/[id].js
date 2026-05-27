import { json, badRequest, notFound, serverError } from '../../_lib/response.js'
import { requireAuth } from '../../_lib/auth.js'

export async function onRequestPut({ request, params, env }) {
  const auth = await requireAuth(request, env)
  if (auth instanceof Response) return auth

  let body
  try {
    body = await request.json()
  } catch {
    return badRequest('JSON inválido')
  }

  const { url, caption, display_order, is_active } = body || {}

  try {
    const exists = await env.DB.prepare('SELECT id FROM gallery WHERE id = ?')
      .bind(params.id).first()
    if (!exists) return notFound('Imagem não encontrada')

    const result = await env.DB.prepare(`
      UPDATE gallery
      SET url = ?, caption = ?, display_order = ?, is_active = ?
      WHERE id = ?
      RETURNING *
    `).bind(
      url,
      caption || '',
      display_order || 0,
      is_active !== undefined ? (is_active ? 1 : 0) : 1,
      params.id
    ).first()

    return json(result)
  } catch (err) {
    console.error('Update gallery image error:', err)
    return serverError('Erro ao atualizar imagem')
  }
}

export async function onRequestDelete({ request, params, env }) {
  const auth = await requireAuth(request, env)
  if (auth instanceof Response) return auth

  try {
    const exists = await env.DB.prepare('SELECT id FROM gallery WHERE id = ?')
      .bind(params.id).first()
    if (!exists) return notFound('Imagem não encontrada')

    await env.DB.prepare('DELETE FROM gallery WHERE id = ?').bind(params.id).run()
    return json({ message: 'Imagem removida com sucesso' })
  } catch (err) {
    console.error('Delete gallery image error:', err)
    return serverError('Erro ao remover imagem')
  }
}

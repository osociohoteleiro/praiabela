import { json, badRequest, notFound, serverError } from '../../_lib/response.js'
import { requireAuth } from '../../_lib/auth.js'

export async function onRequestGet({ params, env }) {
  try {
    const promo = await env.DB.prepare('SELECT * FROM promotions WHERE id = ?')
      .bind(params.id).first()
    if (!promo) return notFound('Promoção não encontrada')
    return json(promo)
  } catch (err) {
    console.error('Get promotion error:', err)
    return serverError('Erro ao buscar promoção')
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

  const { title, description, discount, valid_until, image_url, is_active } = body || {}

  try {
    const exists = await env.DB.prepare('SELECT id FROM promotions WHERE id = ?')
      .bind(params.id).first()
    if (!exists) return notFound('Promoção não encontrada')

    const result = await env.DB.prepare(`
      UPDATE promotions
      SET title = ?, description = ?, discount = ?, valid_until = ?, image_url = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
      RETURNING *
    `).bind(
      title,
      description,
      discount,
      valid_until || null,
      image_url || null,
      is_active !== undefined ? (is_active ? 1 : 0) : 1,
      params.id
    ).first()

    return json(result)
  } catch (err) {
    console.error('Update promotion error:', err)
    return serverError('Erro ao atualizar promoção')
  }
}

export async function onRequestDelete({ request, params, env }) {
  const auth = await requireAuth(request, env)
  if (auth instanceof Response) return auth

  try {
    const exists = await env.DB.prepare('SELECT id FROM promotions WHERE id = ?')
      .bind(params.id).first()
    if (!exists) return notFound('Promoção não encontrada')

    await env.DB.prepare('DELETE FROM promotions WHERE id = ?').bind(params.id).run()
    return json({ message: 'Promoção deletada com sucesso' })
  } catch (err) {
    console.error('Delete promotion error:', err)
    return serverError('Erro ao deletar promoção')
  }
}

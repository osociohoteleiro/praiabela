import { json, badRequest, notFound, serverError, parseJsonField } from '../../_lib/response.js'
import { requireAuth } from '../../_lib/auth.js'

function parsePackage(pkg) {
  return {
    ...pkg,
    inclusions: parseJsonField(pkg.inclusions, []),
    image_urls: parseJsonField(pkg.image_urls, []),
  }
}

export async function onRequestGet({ params, env }) {
  try {
    const pkg = await env.DB.prepare('SELECT * FROM packages WHERE id = ?')
      .bind(params.id).first()
    if (!pkg) return notFound('Pacote não encontrado')
    return json(parsePackage(pkg))
  } catch (err) {
    console.error('Get package error:', err)
    return serverError('Erro ao buscar pacote')
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

  const { name, description, price, inclusions, image_urls, is_featured, is_active } = body || {}

  try {
    const exists = await env.DB.prepare('SELECT id FROM packages WHERE id = ?')
      .bind(params.id).first()
    if (!exists) return notFound('Pacote não encontrado')

    const result = await env.DB.prepare(`
      UPDATE packages
      SET name = ?, description = ?, price = ?, inclusions = ?, image_urls = ?, is_featured = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
      RETURNING *
    `).bind(
      name,
      description,
      price,
      JSON.stringify(inclusions),
      JSON.stringify(image_urls || []),
      is_featured ? 1 : 0,
      is_active !== undefined ? (is_active ? 1 : 0) : 1,
      params.id
    ).first()

    return json(parsePackage(result))
  } catch (err) {
    console.error('Update package error:', err)
    return serverError('Erro ao atualizar pacote')
  }
}

export async function onRequestDelete({ request, params, env }) {
  const auth = await requireAuth(request, env)
  if (auth instanceof Response) return auth

  try {
    const exists = await env.DB.prepare('SELECT id FROM packages WHERE id = ?')
      .bind(params.id).first()
    if (!exists) return notFound('Pacote não encontrado')

    await env.DB.prepare('DELETE FROM packages WHERE id = ?').bind(params.id).run()
    return json({ message: 'Pacote deletado com sucesso' })
  } catch (err) {
    console.error('Delete package error:', err)
    return serverError('Erro ao deletar pacote')
  }
}

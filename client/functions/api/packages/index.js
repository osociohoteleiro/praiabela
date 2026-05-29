import { json, badRequest, serverError, parseJsonField } from '../../_lib/response.js'
import { requireAuth } from '../../_lib/auth.js'

function parsePackage(pkg) {
  return {
    ...pkg,
    inclusions: parseJsonField(pkg.inclusions, []),
    image_urls: parseJsonField(pkg.image_urls, []),
  }
}

export async function onRequestGet({ env }) {
  try {
    const result = await env.DB.prepare(
      'SELECT * FROM packages WHERE is_active = 1 ORDER BY is_featured DESC, created_at DESC'
    ).all()
    return json(result.results.map(parsePackage))
  } catch (err) {
    console.error('Get packages error:', err)
    return serverError('Erro ao buscar pacotes')
  }
}

export async function onRequestPost({ request, env }) {
  const auth = await requireAuth(request, env)
  if (auth instanceof Response) return auth

  let body
  try {
    body = await request.json()
  } catch {
    return badRequest('JSON inválido')
  }

  const { name, description, price, inclusions, image_urls, is_featured, is_active, start_date, end_date } = body || {}
  if (!name || !description || !inclusions) {
    return badRequest('Campos obrigatórios faltando')
  }

  try {
    const result = await env.DB.prepare(`
      INSERT INTO packages (name, description, price, inclusions, image_urls, is_featured, is_active, start_date, end_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      RETURNING *
    `).bind(
      name,
      description,
      Number(price) || 0,
      JSON.stringify(inclusions),
      JSON.stringify(image_urls || []),
      is_featured ? 1 : 0,
      is_active !== undefined ? (is_active ? 1 : 0) : 1,
      start_date || null,
      end_date || null
    ).first()

    return json(parsePackage(result), { status: 201 })
  } catch (err) {
    console.error('Create package error:', err)
    return serverError('Erro ao criar pacote')
  }
}

import { json, badRequest, notFound, serverError } from '../../_lib/response.js'
import { requireAuth } from '../../_lib/auth.js'

function slugify(text) {
  return String(text)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 200)
}

async function uniqueSlug(env, base, ignoreId) {
  let slug = base || 'post'
  let i = 1
  while (true) {
    const row = await env.DB.prepare('SELECT id FROM posts WHERE slug = ? AND id <> ?')
      .bind(slug, ignoreId).first()
    if (!row) return slug
    i += 1
    slug = `${base}-${i}`
  }
}

export async function onRequestGet({ params, env }) {
  try {
    const post = await env.DB.prepare('SELECT * FROM posts WHERE id = ?')
      .bind(params.id).first()
    if (!post) return notFound('Postagem não encontrada')
    return json(post)
  } catch (err) {
    console.error('Get post error:', err)
    return serverError('Erro ao buscar postagem')
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

  const { title, content, cover_image, excerpt, category, published_at, is_active, slug } = body || {}

  try {
    const exists = await env.DB.prepare('SELECT id, slug FROM posts WHERE id = ?')
      .bind(params.id).first()
    if (!exists) return notFound('Postagem não encontrada')

    let finalSlug = exists.slug
    if (slug && slug !== exists.slug) {
      finalSlug = await uniqueSlug(env, slugify(slug), params.id)
    }

    const result = await env.DB.prepare(`
      UPDATE posts
      SET title = ?,
          slug = ?,
          excerpt = ?,
          content = ?,
          cover_image = ?,
          category = ?,
          published_at = COALESCE(?, published_at),
          is_active = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
      RETURNING *
    `).bind(
      title,
      finalSlug,
      excerpt || null,
      content,
      cover_image,
      category || null,
      published_at || null,
      is_active !== undefined ? (is_active ? 1 : 0) : 1,
      params.id,
    ).first()

    return json(result)
  } catch (err) {
    console.error('Update post error:', err)
    return serverError('Erro ao atualizar postagem')
  }
}

export async function onRequestDelete({ request, params, env }) {
  const auth = await requireAuth(request, env)
  if (auth instanceof Response) return auth

  try {
    const exists = await env.DB.prepare('SELECT id FROM posts WHERE id = ?')
      .bind(params.id).first()
    if (!exists) return notFound('Postagem não encontrada')

    await env.DB.prepare('DELETE FROM posts WHERE id = ?').bind(params.id).run()
    return json({ message: 'Postagem removida com sucesso' })
  } catch (err) {
    console.error('Delete post error:', err)
    return serverError('Erro ao remover postagem')
  }
}

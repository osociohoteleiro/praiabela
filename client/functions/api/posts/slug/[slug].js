import { json, notFound, serverError } from '../../../_lib/response.js'

export async function onRequestGet({ params, env }) {
  try {
    const post = await env.DB.prepare(
      'SELECT * FROM posts WHERE slug = ? AND is_active = 1'
    ).bind(params.slug).first()
    if (!post) return notFound('Postagem não encontrada')
    return json(post)
  } catch (err) {
    console.error('Get post by slug error:', err)
    return serverError('Erro ao buscar postagem')
  }
}

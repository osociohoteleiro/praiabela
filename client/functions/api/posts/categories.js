import { json, serverError } from '../../_lib/response.js'

export async function onRequestGet({ env }) {
  try {
    const result = await env.DB.prepare(`
      SELECT category, COUNT(*) AS count
      FROM posts
      WHERE is_active = 1 AND category IS NOT NULL AND category <> ''
      GROUP BY category
      ORDER BY category ASC
    `).all()
    return json(result.results)
  } catch (err) {
    console.error('Get post categories error:', err)
    return serverError('Erro ao buscar categorias')
  }
}

import { json, serverError } from '../../_lib/response.js'
import { requireAuth } from '../../_lib/auth.js'

const TABLES = ['site_info', 'rooms', 'gallery', 'packages', 'promotions', 'experiences', 'media']

export async function onRequestGet({ request, env }) {
  const auth = await requireAuth(request, env)
  if (auth instanceof Response) return auth

  try {
    const data = {}
    for (const table of TABLES) {
      const result = await env.DB.prepare(`SELECT * FROM ${table}`).all()
      data[table] = result.results
    }
    return json({ data })
  } catch (err) {
    console.error('Erro na exportação:', err)
    return serverError(err.message || 'Erro na exportação')
  }
}

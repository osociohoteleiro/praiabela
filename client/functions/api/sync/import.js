import { json, badRequest, serverError } from '../../_lib/response.js'
import { requireAuth } from '../../_lib/auth.js'

const TABLES = ['site_info', 'rooms', 'gallery', 'packages', 'promotions', 'experiences', 'posts', 'media']

export async function onRequestPost({ request, env }) {
  const auth = await requireAuth(request, env)
  if (auth instanceof Response) return auth

  let body
  try {
    body = await request.json()
  } catch {
    return badRequest('JSON inválido')
  }

  const { data } = body || {}
  if (!data) return badRequest('Dados não fornecidos')

  const results = {}

  for (const table of TABLES) {
    if (!Array.isArray(data[table])) continue
    try {
      await env.DB.prepare(`DELETE FROM ${table}`).run()
      if (data[table].length > 0) {
        const columns = Object.keys(data[table][0])
        const placeholders = columns.map(() => '?').join(', ')
        const stmt = env.DB.prepare(
          `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders})`
        )
        const batch = data[table].map(row => stmt.bind(...columns.map(c => row[c])))
        await env.DB.batch(batch)
      }
      results[table] = { success: true, count: data[table].length }
    } catch (err) {
      results[table] = { success: false, error: err.message }
    }
  }

  return json({ message: 'Importação concluída', results })
}

import { json, badRequest, notFound, serverError } from '../../_lib/response.js'
import { requireAuth } from '../../_lib/auth.js'

export async function onRequestGet({ env }) {
  try {
    const info = await env.DB.prepare('SELECT * FROM site_info WHERE id = 1').first()
    if (!info) return notFound('Informações do site não encontradas')
    return json(info)
  } catch (err) {
    console.error('Get site info error:', err)
    return serverError('Erro ao buscar informações do site')
  }
}

export async function onRequestPut({ request, env }) {
  const auth = await requireAuth(request, env)
  if (auth instanceof Response) return auth

  let body
  try {
    body = await request.json()
  } catch {
    return badRequest('JSON inválido')
  }

  const {
    about_text,
    contact_email,
    contact_phone,
    contact_address,
    check_in_time,
    check_out_time,
    facebook_url,
    instagram_url,
    whatsapp_number,
    hero_video_url,
    logo_url,
  } = body || {}

  try {
    await env.DB.prepare(`
      UPDATE site_info
      SET about_text = ?,
          contact_email = ?,
          contact_phone = ?,
          contact_address = ?,
          check_in_time = ?,
          check_out_time = ?,
          facebook_url = ?,
          instagram_url = ?,
          whatsapp_number = ?,
          hero_video_url = ?,
          logo_url = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = 1
    `).bind(
      about_text,
      contact_email,
      contact_phone,
      contact_address,
      check_in_time,
      check_out_time,
      facebook_url || null,
      instagram_url || null,
      whatsapp_number || null,
      hero_video_url || null,
      logo_url || null
    ).run()

    const updated = await env.DB.prepare('SELECT * FROM site_info WHERE id = 1').first()
    return json(updated)
  } catch (err) {
    console.error('Update site info error:', err)
    return serverError('Erro ao atualizar informações do site')
  }
}

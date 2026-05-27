import bcrypt from 'bcryptjs'
import { json, badRequest, unauthorized, serverError } from '../../_lib/response.js'
import { signToken } from '../../_lib/auth.js'

export async function onRequestPost({ request, env }) {
  let body
  try {
    body = await request.json()
  } catch {
    return badRequest('JSON inválido')
  }

  const { email, password } = body || {}
  if (!email || !password) {
    return badRequest('Email e senha são obrigatórios')
  }

  try {
    const admin = await env.DB.prepare(
      'SELECT id, email, password, name FROM admins WHERE email = ?'
    ).bind(email).first()

    if (!admin) return unauthorized('Credenciais inválidas')

    const ok = await bcrypt.compare(password, admin.password)
    if (!ok) return unauthorized('Credenciais inválidas')

    const token = await signToken({ id: admin.id, email: admin.email }, env.JWT_SECRET)

    return json({
      token,
      admin: { id: admin.id, email: admin.email, name: admin.name },
    })
  } catch (err) {
    console.error('Login error:', err)
    return serverError('Erro ao fazer login')
  }
}

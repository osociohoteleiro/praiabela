import jwt from '@tsndr/cloudflare-worker-jwt'
import { unauthorized } from './response.js'

export async function signToken(payload, secret) {
  const exp = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7
  return jwt.sign({ ...payload, exp }, secret)
}

// Returns { adminId, adminEmail } on success, or a Response (401) on failure.
export async function requireAuth(request, env) {
  const header = request.headers.get('authorization') || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null

  if (!token) return unauthorized('Token não fornecido')

  const valid = await jwt.verify(token, env.JWT_SECRET)
  if (!valid) return unauthorized()

  const { payload } = jwt.decode(token)
  if (!payload?.id) return unauthorized()

  if (payload.exp && payload.exp * 1000 < Date.now()) {
    return unauthorized('Token expirado')
  }

  return { adminId: payload.id, adminEmail: payload.email }
}

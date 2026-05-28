import { applyCors, preflight } from '../_lib/cors.js'
import { serverError } from '../_lib/response.js'
import { ensureSchema } from '../_lib/schema.js'

export async function onRequest(context) {
  const { request, env, next } = context

  if (request.method === 'OPTIONS') {
    return preflight(request, env)
  }

  try {
    await ensureSchema(env)
    const response = await next()
    return applyCors(response, request, env)
  } catch (err) {
    console.error('Unhandled error:', err)
    return applyCors(serverError(), request, env)
  }
}

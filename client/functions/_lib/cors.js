function resolveAllowOrigin(request, env) {
  const origin = request.headers.get('origin')
  if (!origin) return null
  const allowed = (env.CORS_ORIGINS || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)
  if (allowed.includes('*')) return '*'
  if (allowed.includes(origin)) return origin
  return null
}

export function applyCors(response, request, env) {
  const allow = resolveAllowOrigin(request, env)
  if (!allow) return response
  const headers = new Headers(response.headers)
  headers.set('Access-Control-Allow-Origin', allow)
  headers.set('Access-Control-Allow-Credentials', 'true')
  headers.set('Vary', 'Origin')
  return new Response(response.body, { status: response.status, headers })
}

export function preflight(request, env) {
  const allow = resolveAllowOrigin(request, env)
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': allow || '',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
      'Access-Control-Allow-Headers': request.headers.get('Access-Control-Request-Headers') || 'Authorization,Content-Type',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Max-Age': '86400',
      Vary: 'Origin',
    },
  })
}

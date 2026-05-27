export function json(data, init = {}) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...(init.headers || {}),
    },
  })
}

export function badRequest(message) {
  return json({ message }, { status: 400 })
}

export function unauthorized(message = 'Token inválido') {
  return json({ message }, { status: 401 })
}

export function notFound(message = 'Não encontrado') {
  return json({ message }, { status: 404 })
}

export function serverError(message = 'Erro interno do servidor') {
  return json({ message }, { status: 500 })
}

export function parseJsonField(value, fallback = []) {
  if (value == null) return fallback
  if (typeof value !== 'string') return value
  try {
    return JSON.parse(value)
  } catch {
    return fallback
  }
}

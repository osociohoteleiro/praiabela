import { json } from '../_lib/response.js'

export function onRequestGet() {
  return json({ status: 'ok', message: 'API Pousada Praia Bela funcionando!' })
}

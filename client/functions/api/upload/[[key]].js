import { json, badRequest, serverError } from '../../_lib/response.js'
import { requireAuth } from '../../_lib/auth.js'
import { deleteFileFromS3 } from '../../_lib/s3.js'

export async function onRequestDelete({ request, params, env }) {
  const auth = await requireAuth(request, env)
  if (auth instanceof Response) return auth

  const key = Array.isArray(params.key) ? params.key.join('/') : params.key
  if (!key) return badRequest('Chave não fornecida')

  try {
    await deleteFileFromS3(env, key)
    await env.DB.prepare('DELETE FROM media WHERE s3_key = ?').bind(key).run()
    return json({ message: 'Arquivo deletado com sucesso' })
  } catch (err) {
    console.error('Delete file error:', err)
    return serverError('Erro ao deletar arquivo')
  }
}

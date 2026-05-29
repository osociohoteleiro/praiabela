import { json, badRequest, serverError } from '../../_lib/response.js'
import { requireAuth } from '../../_lib/auth.js'
import { uploadFileToS3, validateImage } from '../../_lib/s3.js'

export async function onRequestPost({ request, env }) {
  const auth = await requireAuth(request, env)
  if (auth instanceof Response) return auth

  let form
  try {
    form = await request.formData()
  } catch {
    return badRequest('Form-data inválido')
  }

  const files = form.getAll('files').filter(f => typeof f !== 'string')
  if (files.length === 0) return badRequest('Nenhum arquivo enviado')

  for (const file of files) {
    const invalid = validateImage(file)
    if (invalid) return badRequest(invalid)
  }

  try {
    const results = await Promise.all(files.map(f => uploadFileToS3(env, f, 'images')))
    const category = form.get('category') || 'gallery'

    const stmt = env.DB.prepare(`
      INSERT INTO media (type, category, url, s3_key, filename, size)
      VALUES (?, ?, ?, ?, ?, ?)
    `)
    await env.DB.batch(results.map((r, i) =>
      stmt.bind('image', category, r.url, r.key, r.filename, files[i].size)
    ))

    return json({
      message: `${results.length} arquivos enviados com sucesso`,
      files: results,
    })
  } catch (err) {
    console.error('Multiple images upload error:', err)
    return serverError(`Erro ao fazer upload das imagens: ${err.message || err.name || 'desconhecido'}`)
  }
}

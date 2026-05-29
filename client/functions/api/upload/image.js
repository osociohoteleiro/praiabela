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

  const file = form.get('file') || form.get('image')
  if (!file || typeof file === 'string') return badRequest('Nenhum arquivo enviado')

  const invalid = validateImage(file)
  if (invalid) return badRequest(invalid)

  try {
    const result = await uploadFileToS3(env, file, 'images')
    await env.DB.prepare(`
      INSERT INTO media (type, category, url, s3_key, filename, size)
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(
      'image',
      form.get('category') || 'general',
      result.url,
      result.key,
      result.filename,
      file.size
    ).run()

    return json({ message: 'Upload realizado com sucesso', ...result })
  } catch (err) {
    console.error('Image upload error:', err)
    return serverError(`Erro ao fazer upload da imagem: ${err.message || err.name || 'desconhecido'}`)
  }
}

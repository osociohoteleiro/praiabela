import { json, badRequest, serverError } from '../../_lib/response.js'
import { requireAuth } from '../../_lib/auth.js'
import { uploadFileToS3, validateVideo } from '../../_lib/s3.js'

export async function onRequestPost({ request, env }) {
  const auth = await requireAuth(request, env)
  if (auth instanceof Response) return auth

  let form
  try {
    form = await request.formData()
  } catch {
    return badRequest('Form-data inválido')
  }

  const file = form.get('file') || form.get('video')
  if (!file || typeof file === 'string') return badRequest('Nenhum arquivo enviado')

  const invalid = validateVideo(file)
  if (invalid) return badRequest(invalid)

  try {
    const result = await uploadFileToS3(env, file, 'videos')
    await env.DB.prepare(`
      INSERT INTO media (type, category, url, s3_key, filename, size)
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(
      'video',
      form.get('category') || 'hero',
      result.url,
      result.key,
      result.filename,
      file.size
    ).run()

    return json({ message: 'Upload realizado com sucesso', ...result })
  } catch (err) {
    console.error('Video upload error:', err)
    return serverError('Erro ao fazer upload do vídeo')
  }
}

import { AwsClient } from 'aws4fetch'

const IMAGE_TYPES = new Set([
  'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml',
])
const VIDEO_TYPES = new Set([
  'video/mp4', 'video/quicktime', 'video/webm',
])
const MAX_IMAGE_SIZE = 10 * 1024 * 1024
const MAX_VIDEO_SIZE = 100 * 1024 * 1024

function makeClient(env) {
  return new AwsClient({
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
    region: env.AWS_REGION,
    service: 's3',
  })
}

function objectUrl(env, key) {
  // Virtual-hosted-style URL (bucket as subdomain) — works for all regions
  return `https://${env.AWS_BUCKET_NAME}.s3.${env.AWS_REGION}.amazonaws.com/${key}`
}

export function validateImage(file) {
  if (!IMAGE_TYPES.has(file.type)) {
    return 'Tipo de arquivo não permitido. Use JPG, PNG, WEBP, GIF ou SVG.'
  }
  if (file.size > MAX_IMAGE_SIZE) {
    return `Imagem excede o limite de ${MAX_IMAGE_SIZE / 1024 / 1024}MB.`
  }
  return null
}

export function validateVideo(file) {
  if (!VIDEO_TYPES.has(file.type)) {
    return 'Tipo de arquivo não permitido. Use MP4, MOV ou WEBM.'
  }
  if (file.size > MAX_VIDEO_SIZE) {
    return `Vídeo excede o limite de ${MAX_VIDEO_SIZE / 1024 / 1024}MB.`
  }
  return null
}

export async function uploadFileToS3(env, file, folder) {
  if (!env.AWS_ACCESS_KEY_ID || !env.AWS_SECRET_ACCESS_KEY) {
    throw new Error('Credenciais AWS não configuradas (AWS_ACCESS_KEY_ID/AWS_SECRET_ACCESS_KEY)')
  }
  if (!env.AWS_BUCKET_NAME || !env.AWS_REGION) {
    throw new Error('Bucket/region AWS não configurados (AWS_BUCKET_NAME/AWS_REGION)')
  }

  const aws = makeClient(env)
  const timestamp = Date.now()
  const safeName = file.name.replace(/\s+/g, '-').replace(/[^A-Za-z0-9._-]/g, '')
  const key = `${folder}/${timestamp}-${safeName}`
  const url = objectUrl(env, key)

  const res = await aws.fetch(url, {
    method: 'PUT',
    body: await file.arrayBuffer(),
    headers: {
      'Content-Type': file.type,
    },
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`S3 PUT ${res.status}: ${text.slice(0, 300) || res.statusText}`)
  }

  return {
    url,
    key,
    filename: file.name,
  }
}

export async function deleteFileFromS3(env, key) {
  if (!env.AWS_ACCESS_KEY_ID || !env.AWS_SECRET_ACCESS_KEY) {
    throw new Error('Credenciais AWS não configuradas')
  }
  const aws = makeClient(env)
  const res = await aws.fetch(objectUrl(env, key), { method: 'DELETE' })
  if (!res.ok && res.status !== 404) {
    const text = await res.text().catch(() => '')
    throw new Error(`S3 DELETE ${res.status}: ${text.slice(0, 300) || res.statusText}`)
  }
}

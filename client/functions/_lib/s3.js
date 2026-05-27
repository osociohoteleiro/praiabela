import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { Upload } from '@aws-sdk/lib-storage'

const IMAGE_TYPES = new Set([
  'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml',
])
const VIDEO_TYPES = new Set([
  'video/mp4', 'video/quicktime', 'video/webm',
])
const MAX_IMAGE_SIZE = 10 * 1024 * 1024
const MAX_VIDEO_SIZE = 100 * 1024 * 1024

function makeClient(env) {
  return new S3Client({
    region: env.AWS_REGION,
    credentials: {
      accessKeyId: env.AWS_ACCESS_KEY_ID,
      secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
    },
  })
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
  const client = makeClient(env)
  const timestamp = Date.now()
  const safeName = file.name.replace(/\s+/g, '-')
  const key = `${folder}/${timestamp}-${safeName}`

  const upload = new Upload({
    client,
    params: {
      Bucket: env.AWS_BUCKET_NAME,
      Key: key,
      Body: new Uint8Array(await file.arrayBuffer()),
      ContentType: file.type,
      ACL: 'public-read',
    },
  })
  const result = await upload.done()
  return {
    url: result.Location,
    key: result.Key,
    filename: file.name,
  }
}

export async function deleteFileFromS3(env, key) {
  const client = makeClient(env)
  await client.send(new DeleteObjectCommand({
    Bucket: env.AWS_BUCKET_NAME,
    Key: key,
  }))
}

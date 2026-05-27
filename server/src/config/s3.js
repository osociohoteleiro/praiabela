import {
  S3Client,
  DeleteObjectCommand,
  ListObjectsV2Command,
} from '@aws-sdk/client-s3'
import { Upload } from '@aws-sdk/lib-storage'
import dotenv from 'dotenv'

dotenv.config()

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
})

export const uploadToS3 = async (file, folder = 'images') => {
  const timestamp = Date.now()
  const filename = `${folder}/${timestamp}-${file.originalname.replace(/\s+/g, '-')}`

  try {
    const upload = new Upload({
      client: s3,
      params: {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: filename,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: 'public-read',
      },
    })
    const result = await upload.done()
    return {
      success: true,
      url: result.Location,
      key: result.Key,
      filename: file.originalname,
    }
  } catch (error) {
    console.error('Erro ao fazer upload para S3:', error)
    throw new Error('Falha ao fazer upload do arquivo')
  }
}

export const deleteFromS3 = async (key) => {
  try {
    await s3.send(new DeleteObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,
    }))
    return { success: true }
  } catch (error) {
    console.error('Erro ao deletar arquivo do S3:', error)
    throw new Error('Falha ao deletar arquivo')
  }
}

export const listS3Objects = async (prefix = '') => {
  try {
    const result = await s3.send(new ListObjectsV2Command({
      Bucket: process.env.AWS_BUCKET_NAME,
      Prefix: prefix,
    }))
    return (result.Contents || []).map(item => ({
      key: item.Key,
      size: item.Size,
      lastModified: item.LastModified,
      url: `${process.env.AWS_S3_ENDPOINT}/${process.env.AWS_BUCKET_NAME}/${item.Key}`,
    }))
  } catch (error) {
    console.error('Erro ao listar arquivos do S3:', error)
    throw new Error('Falha ao listar arquivos')
  }
}

export default s3

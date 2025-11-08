import AWS from 'aws-sdk'
import dotenv from 'dotenv'

dotenv.config()

// Configure AWS S3
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
})

export const uploadToS3 = async (file, folder = 'images') => {
  const timestamp = Date.now()
  const filename = `${folder}/${timestamp}-${file.originalname.replace(/\s+/g, '-')}`

  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: filename,
    Body: file.buffer,
    ContentType: file.mimetype,
    ACL: 'public-read',
  }

  try {
    const result = await s3.upload(params).promise()
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
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: key,
  }

  try {
    await s3.deleteObject(params).promise()
    return { success: true }
  } catch (error) {
    console.error('Erro ao deletar arquivo do S3:', error)
    throw new Error('Falha ao deletar arquivo')
  }
}

export const listS3Objects = async (prefix = '') => {
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Prefix: prefix,
  }

  try {
    const result = await s3.listObjectsV2(params).promise()
    return result.Contents.map(item => ({
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

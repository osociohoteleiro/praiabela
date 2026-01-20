import AWS from 'aws-sdk'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'
import { initDatabase } from './config/database.js'
import db from './config/database.js'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Configure AWS S3
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
})

const galleryDir = path.join(__dirname, '../../client/public/gallery')

// Captions para as imagens
const captions = [
  'Vista panorâmica da pousada',
  'Área externa',
  'Acomodações confortáveis',
  'Quarto aconchegante',
  'Detalhes especiais',
  'Ambiente agradável',
  'Vista deslumbrante',
  'Área de lazer',
  'Piscina',
  'Jardim tropical',
  'Espaço de convivência',
  'Decoração',
  'Natureza exuberante',
  'Praia dos Milionários',
  'Paisagem',
  'Área comum',
  'Detalhes da pousada',
  'Estrutura',
  'Ambiente tropical',
  'Vista da pousada',
  'Relaxamento',
  'Conforto',
  'Experiência única',
  'Momentos especiais',
  'Aconchego',
  'Café da manhã',
  'Recepção',
  'Varanda',
  'Pôr do sol',
  'Gastronomia',
  'Spa do Cacau',
  'Boas-vindas',
  'Despedida',
  'Projeto ambiental',
  'Sustentabilidade',
  'Praia',
  'Bem-estar',
  'Lazer',
  'Descanso',
  'Férias perfeitas',
]

const uploadToS3 = async (filePath, filename) => {
  const fileContent = fs.readFileSync(filePath)
  const ext = path.extname(filename).toLowerCase()

  let contentType = 'image/jpeg'
  if (ext === '.png') contentType = 'image/png'
  else if (ext === '.webp') contentType = 'image/webp'
  else if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg'

  const key = `gallery/${Date.now()}-${filename}`

  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: key,
    Body: fileContent,
    ContentType: contentType,
    ACL: 'public-read',
  }

  try {
    const result = await s3.upload(params).promise()
    console.log(`✅ Uploaded: ${filename} -> ${result.Location}`)
    return {
      url: result.Location,
      key: result.Key,
    }
  } catch (error) {
    console.error(`❌ Failed to upload ${filename}:`, error.message)
    return null
  }
}

const seedGallery = async () => {
  console.log('🚀 Iniciando seed da galeria...\n')

  // Initialize database
  await initDatabase()

  // Check if gallery already has images
  const existingImages = db.prepare('SELECT COUNT(*) as count FROM gallery').get()
  if (existingImages && existingImages.count > 0) {
    console.log(`⚠️  Galeria já possui ${existingImages.count} imagens.`)
    const readline = await import('readline')
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    })

    const answer = await new Promise(resolve => {
      rl.question('Deseja limpar e recriar? (s/n): ', resolve)
    })
    rl.close()

    if (answer.toLowerCase() !== 's') {
      console.log('Operação cancelada.')
      process.exit(0)
    }

    // Clear existing gallery
    db.prepare('DELETE FROM gallery').run()
    console.log('🗑️  Galeria limpa.\n')
  }

  // Get all image files
  const files = fs.readdirSync(galleryDir)
    .filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f))
    .sort()

  console.log(`📁 Encontradas ${files.length} imagens para upload.\n`)

  const uploadedImages = []

  for (let i = 0; i < files.length; i++) {
    const filename = files[i]
    const filePath = path.join(galleryDir, filename)

    console.log(`[${i + 1}/${files.length}] Fazendo upload de ${filename}...`)

    const result = await uploadToS3(filePath, filename)

    if (result) {
      uploadedImages.push({
        url: result.url,
        caption: captions[i] || `Imagem ${i + 1}`,
        display_order: i,
      })
    }
  }

  console.log(`\n📤 ${uploadedImages.length} imagens enviadas para o S3.\n`)

  // Insert into gallery table
  console.log('💾 Salvando no banco de dados...\n')

  for (const image of uploadedImages) {
    db.prepare(`
      INSERT INTO gallery (url, caption, display_order, is_active)
      VALUES (?, ?, ?, 1)
    `).run(image.url, image.caption, image.display_order)
  }

  console.log(`✅ ${uploadedImages.length} imagens adicionadas à galeria!`)
  console.log('\n🎉 Seed da galeria concluído com sucesso!')

  process.exit(0)
}

seedGallery().catch(error => {
  console.error('Erro:', error)
  process.exit(1)
})

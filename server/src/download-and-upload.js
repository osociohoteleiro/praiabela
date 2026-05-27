import { S3Client } from '@aws-sdk/client-s3'
import { Upload } from '@aws-sdk/lib-storage'
import https from 'https'
import http from 'http'
import { initDatabase, saveDatabase } from './config/database.js'
import db from './config/database.js'
import dotenv from 'dotenv'

dotenv.config()

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
})

// URLs das imagens do site original da Pousada Praia Bela
const imageUrls = [
  // Sobre nós page
  'https://praiabela.com.br/wp-content/uploads/2024/01/1077825.jpg',
  'https://praiabela.com.br/wp-content/uploads/2024/01/1077832.jpg',
  'https://praiabela.com.br/wp-content/uploads/2024/02/IMG_5021_AMnnAF.jpeg',
  'https://praiabela.com.br/wp-content/uploads/2024/02/IMG_5023_AMnnAF.jpeg',
  'https://praiabela.com.br/wp-content/uploads/2024/02/IMG_5028_AMnnAF.jpeg',
  'https://praiabela.com.br/wp-content/uploads/2024/02/59d6d7a7-2c57-42de-ae2f-98407b9b0308_lt7Jhr.jpeg',
  'https://praiabela.com.br/wp-content/uploads/2024/02/0a371bd3-b998-4c6b-b04f-997130203536_lt7Jhr.jpeg',
  'https://praiabela.com.br/wp-content/uploads/2024/02/IMG_8514_lt7Jhr.jpeg',
  'https://praiabela.com.br/wp-content/uploads/2024/02/IMG_8596_lt7Jhr.jpeg',
  'https://praiabela.com.br/wp-content/uploads/2024/02/IMG_8601_lt7Jhr.jpeg',
  'https://praiabela.com.br/wp-content/uploads/2024/02/IMG_3200_lt7Jhr.jpeg',
  'https://praiabela.com.br/wp-content/uploads/2024/02/IMG_3201_lt7Jhr.jpeg',
  'https://praiabela.com.br/wp-content/uploads/2024/02/IMG_3930_lt7Jhr.jpeg',
  // Experiências page
  'https://praiabela.com.br/wp-content/uploads/2024/01/62823dc02938fbe60cff66e8_Vira-Bolsa-p-500.webp',
  'https://praiabela.com.br/wp-content/uploads/2024/01/62913f4518fd241310568d02_Pingo-no-Oceano-p-500.webp',
  'https://praiabela.com.br/wp-content/uploads/2024/01/62913f35ead22d076a2a96c8_Spa-do-Cacau.webp',
  'https://praiabela.com.br/wp-content/uploads/2024/01/625ec5b82e2ad383153df250_Despedida-p-500.webp',
  'https://praiabela.com.br/wp-content/uploads/2024/01/625e01b005b86510d8bcd756_Boas-vindas-p-500.webp',
  // Home page
  'https://praiabela.com.br/wp-content/uploads/2024/01/5530-4df9-8df4-e1e2fa05e400-lt7jhr-768x603.webp',
  'https://praiabela.com.br/wp-content/uploads/2024/01/2646-4105-a968-48a31600b5dd-lt7jhr-768x1024.webp',
  'https://praiabela.com.br/wp-content/uploads/2024/01/e2a66032-13a2-4425-a32b-21c1d3f8c8bb_lt7Jhr-768x1024.jpeg',
  'https://praiabela.com.br/wp-content/uploads/2024/01/f29f864e-30fe-43cc-8c79-22933096d895_lt7Jhr-768x1024.jpeg',
  'https://praiabela.com.br/wp-content/uploads/2024/01/e4a29f86-0641-4244-b675-cfa27bb0c1a7_lt7Jhr-768x576.jpeg',
  'https://praiabela.com.br/wp-content/uploads/2024/01/f5284b19-558c-4a20-815d-d2837a829764_lt7Jhr-768x1024.jpeg',
  'https://praiabela.com.br/wp-content/uploads/2024/01/625df8a2e552164034355716_Cacau-1-p-500.webp',
  'https://praiabela.com.br/wp-content/uploads/2024/01/0b9663d0-bc1d-4ac3-a6a5-8ecfebfb4f3f_lt7Jhr-768x1024.jpeg',
  // Acomodações
  'https://praiabela.com.br/wp-content/uploads/2024/01/1077827.jpg',
]

const captions = [
  'Vista da pousada',
  'Área externa',
  'Piscina',
  'Área de lazer',
  'Jardim tropical',
  'Quarto',
  'Acomodação',
  'Suíte',
  'Varanda',
  'Vista do mar',
  'Restaurante',
  'Café da manhã',
  'Ambiente',
  'Projeto Vira Bolsa',
  'Pingo no Oceano',
  'Spa do Cacau',
  'Despedida especial',
  'Boas-vindas',
  'Gastronomia',
  'Comida regional',
  'Sabores locais',
  'Pratos especiais',
  'Decoração',
  'Doces',
  'Cacau',
  'Experiência única',
  'Apartamento',
]

const downloadImage = (url) => {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http

    const request = protocol.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    }, (response) => {
      // Handle redirects
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        downloadImage(response.headers.location).then(resolve).catch(reject)
        return
      }

      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download: ${response.statusCode}`))
        return
      }

      const chunks = []
      response.on('data', chunk => chunks.push(chunk))
      response.on('end', () => resolve(Buffer.concat(chunks)))
      response.on('error', reject)
    })

    request.on('error', reject)
    request.setTimeout(30000, () => {
      request.destroy()
      reject(new Error('Timeout'))
    })
  })
}

const uploadToS3 = async (buffer, filename) => {
  const key = `gallery/${Date.now()}-${filename}`

  try {
    const upload = new Upload({
      client: s3,
      params: {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: key,
        Body: buffer,
        ContentType: 'image/jpeg',
        ACL: 'public-read',
      },
    })
    const result = await upload.done()
    return {
      url: result.Location,
      key: result.Key,
    }
  } catch (error) {
    console.error(`Failed to upload ${filename}:`, error.message)
    return null
  }
}

const main = async () => {
  console.log('🚀 Iniciando download e upload das imagens...\n')

  // Initialize database
  await initDatabase()

  // Clear existing gallery
  console.log('🗑️  Limpando galeria existente...')
  db.prepare('DELETE FROM gallery').run()

  const uploadedImages = []

  for (let i = 0; i < imageUrls.length; i++) {
    const url = imageUrls[i]
    const filename = `gallery-${String(i + 1).padStart(2, '0')}.jpg`

    console.log(`\n[${i + 1}/${imageUrls.length}] Processando ${filename}...`)

    try {
      // Download
      console.log(`  📥 Baixando de ${url.substring(0, 60)}...`)
      const buffer = await downloadImage(url)
      console.log(`  ✅ Download OK (${(buffer.length / 1024).toFixed(0)} KB)`)

      // Upload to S3
      console.log(`  📤 Enviando para S3...`)
      const result = await uploadToS3(buffer, filename)

      if (result) {
        console.log(`  ✅ Upload OK: ${result.url.substring(0, 60)}...`)
        uploadedImages.push({
          url: result.url,
          caption: captions[i] || `Imagem ${i + 1}`,
          display_order: i,
        })
      }
    } catch (error) {
      console.log(`  ❌ Erro: ${error.message}`)
    }
  }

  console.log(`\n\n📊 ${uploadedImages.length} imagens enviadas para o S3.\n`)

  // Insert into gallery table
  console.log('💾 Salvando no banco de dados...\n')

  for (const image of uploadedImages) {
    db.prepare(`
      INSERT INTO gallery (url, caption, display_order, is_active)
      VALUES (?, ?, ?, 1)
    `).run(image.url, image.caption, image.display_order)
  }

  saveDatabase()

  console.log(`✅ ${uploadedImages.length} imagens adicionadas à galeria!`)
  console.log('\n🎉 Processo concluído com sucesso!')

  process.exit(0)
}

main().catch(error => {
  console.error('Erro:', error)
  process.exit(1)
})

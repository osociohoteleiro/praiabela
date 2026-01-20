import https from 'https'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const logoUrl = 'https://praiabela.com.br/wp-content/uploads/2024/01/Log-Praia-Bela.png'
const outputPath = path.join(__dirname, '../../client/public/favicon.png')

const downloadImage = (url, dest) => {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest)
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    }, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        downloadImage(response.headers.location, dest).then(resolve).catch(reject)
        return
      }
      response.pipe(file)
      file.on('finish', () => {
        file.close()
        resolve()
      })
    }).on('error', (err) => {
      fs.unlink(dest, () => {})
      reject(err)
    })
  })
}

// Ensure public directory exists
const publicDir = path.dirname(outputPath)
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true })
}

console.log('Downloading favicon...')
downloadImage(logoUrl, outputPath)
  .then(() => {
    console.log(`✅ Favicon saved to ${outputPath}`)
    process.exit(0)
  })
  .catch((err) => {
    console.error('Error:', err)
    process.exit(1)
  })

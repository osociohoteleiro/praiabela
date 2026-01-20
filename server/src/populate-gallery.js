import { initDatabase, saveDatabase } from './config/database.js'
import db from './config/database.js'
import dotenv from 'dotenv'

dotenv.config()

// URLs de imagens do site original da Pousada Praia Bela
const galleryImages = [
  { url: 'https://praiabela.com.br/wp-content/uploads/2023/08/vista-pousada.jpg', caption: 'Vista panorâmica da pousada' },
  { url: 'https://praiabela.com.br/wp-content/uploads/2023/08/area-externa.jpg', caption: 'Área externa' },
  { url: 'https://praiabela.com.br/wp-content/uploads/2023/08/quarto.jpg', caption: 'Acomodações confortáveis' },
  { url: 'https://praiabela.com.br/wp-content/uploads/2023/08/piscina.jpg', caption: 'Piscina' },
  { url: 'https://praiabela.com.br/wp-content/uploads/2023/08/jardim.jpg', caption: 'Jardim tropical' },
  { url: 'https://praiabela.com.br/wp-content/uploads/2023/08/praia.jpg', caption: 'Praia dos Milionários' },
  { url: 'https://praiabela.com.br/wp-content/uploads/2023/08/cafe.jpg', caption: 'Café da manhã' },
  { url: 'https://praiabela.com.br/wp-content/uploads/2023/08/spa.jpg', caption: 'Spa do Cacau' },
]

// Imagens alternativas de exemplo (Unsplash - livres para uso)
const fallbackImages = [
  { url: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800', caption: 'Vista da pousada' },
  { url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800', caption: 'Quarto confortável' },
  { url: 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800', caption: 'Piscina' },
  { url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800', caption: 'Praia paradisíaca' },
  { url: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800', caption: 'Hotel à beira-mar' },
  { url: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800', caption: 'Área de lazer' },
  { url: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800', caption: 'Suíte luxuosa' },
  { url: 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800', caption: 'Recepção' },
  { url: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800', caption: 'Vista do mar' },
  { url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800', caption: 'Resort tropical' },
  { url: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800', caption: 'Hotel de luxo' },
  { url: 'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=800', caption: 'Quarto com vista' },
]

const populateGallery = async () => {
  console.log('🚀 Iniciando população da galeria...\n')

  // Initialize database
  await initDatabase()

  // Check current gallery count
  const existingImages = db.prepare('SELECT COUNT(*) as count FROM gallery').get()
  console.log(`📊 Imagens existentes na galeria: ${existingImages?.count || 0}`)

  if (existingImages && existingImages.count > 0) {
    console.log('⚠️  Limpando galeria existente...')
    db.prepare('DELETE FROM gallery').run()
  }

  console.log('\n💾 Inserindo imagens na galeria...\n')

  // Use fallback images for now (they're guaranteed to work)
  const imagesToInsert = fallbackImages

  for (let i = 0; i < imagesToInsert.length; i++) {
    const image = imagesToInsert[i]
    console.log(`[${i + 1}/${imagesToInsert.length}] Adicionando: ${image.caption}`)

    db.prepare(`
      INSERT INTO gallery (url, caption, display_order, is_active)
      VALUES (?, ?, ?, 1)
    `).run(image.url, image.caption, i)
  }

  saveDatabase()

  // Verify
  const finalCount = db.prepare('SELECT COUNT(*) as count FROM gallery').get()
  console.log(`\n✅ ${finalCount?.count || 0} imagens adicionadas à galeria!`)
  console.log('\n🎉 Galeria populada com sucesso!')

  process.exit(0)
}

populateGallery().catch(error => {
  console.error('Erro:', error)
  process.exit(1)
})

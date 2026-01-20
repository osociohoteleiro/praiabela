import initSqlJs from 'sql.js'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import fs from 'fs'
import dotenv from 'dotenv'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const dbPath = join(__dirname, '../database/praiabela.db')

const seedRooms = async () => {
  console.log('🛏️ Iniciando seed de quartos da Pousada Praia Bela...')

  const SQL = await initSqlJs()
  const buffer = fs.readFileSync(dbPath)
  const db = new SQL.Database(buffer)

  // Clear existing rooms
  console.log('🧹 Limpando quartos existentes...')
  db.run('DELETE FROM rooms')

  // Quartos baseados nos dados do Omnibees com imagens reais
  const rooms = [
    {
      name: 'Apartamento Padrão',
      description: 'Apartamentos completos e confortáveis com vista para o jardim. Equipados com frigobar, TV LCD 32" com canais via satélite, ar condicionado Split e telefone com discagem direta. Ideal para casais ou pequenas famílias que buscam conforto e praticidade.',
      capacity: 3,
      size: '18m²',
      amenities: JSON.stringify([
        'Ar condicionado Split',
        'TV LCD 32"',
        'Canais via satélite',
        'Frigobar',
        'Telefone',
        'Cofre',
        'Wi-Fi gratuito',
        'Vista para o jardim',
        'Cama Queen + Solteiro',
        'Varanda privativa'
      ]),
      image_urls: JSON.stringify([
        'https://media.omnibees.com/Images/4071/RoomTypes/920x620/1077827.jpg',
        'https://media.omnibees.com/Images/4071/RoomTypes/920x620/1077823.jpg',
        'https://media.omnibees.com/Images/4071/RoomTypes/920x620/1077824.jpg',
        'https://media.omnibees.com/Images/4071/RoomTypes/920x620/1077831.jpg',
        'https://media.omnibees.com/Images/4071/RoomTypes/920x620/1077829.jpg',
        'https://media.omnibees.com/Images/4071/RoomTypes/920x620/1077832.jpg',
        'https://media.omnibees.com/Images/4071/RoomTypes/920x620/1077825.jpg',
        'https://media.omnibees.com/Images/4071/RoomTypes/920x620/1077837.jpg',
        'https://media.omnibees.com/Images/4071/RoomTypes/920x620/1077838.jpg',
        'https://media.omnibees.com/Images/4071/RoomTypes/920x620/1077834.jpg',
        'https://media.omnibees.com/Images/4071/RoomTypes/920x620/1077833.jpg',
        'https://media.omnibees.com/Images/4071/RoomTypes/920x620/1077835.jpg',
        'https://media.omnibees.com/Images/4071/RoomTypes/920x620/1077821.jpg',
        'https://media.omnibees.com/Images/4071/RoomTypes/920x620/1077828.jpg',
        'https://media.omnibees.com/Images/4071/RoomTypes/920x620/1077830.jpg',
        'https://media.omnibees.com/Images/4071/RoomTypes/920x620/1077822.jpg',
        'https://media.omnibees.com/Images/4071/RoomTypes/920x620/1077836.jpg',
        'https://media.omnibees.com/Images/4071/RoomTypes/920x620/793079.jpg',
        'https://media.omnibees.com/Images/4071/RoomTypes/920x620/793089.jpg',
        'https://media.omnibees.com/Images/4071/RoomTypes/920x620/793087.jpg',
        'https://media.omnibees.com/Images/4071/RoomTypes/920x620/793088.jpg'
      ]),
      is_active: 1
    },
    {
      name: 'Suíte Superior - 1º Andar',
      description: 'Suítes no primeiro andar com as mesmas comodidades dos apartamentos padrão, porém com vista privilegiada e maior privacidade. Equipadas com frigobar, TV LCD 32" com canais via satélite, ar condicionado Split e banheiro privativo completo.',
      capacity: 3,
      size: '18m²',
      amenities: JSON.stringify([
        'Ar condicionado Split',
        'TV LCD 32"',
        'Canais via satélite',
        'Frigobar',
        'Telefone',
        'Cofre',
        'Wi-Fi gratuito',
        'Vista para o jardim',
        'Banheiro privativo',
        'Cama Queen + Solteiro',
        'Varanda privativa'
      ]),
      image_urls: JSON.stringify([
        'https://media.omnibees.com/Images/4071/RoomTypes/920x620/1077834.jpg',
        'https://media.omnibees.com/Images/4071/RoomTypes/920x620/1077833.jpg',
        'https://media.omnibees.com/Images/4071/RoomTypes/920x620/1077828.jpg',
        'https://media.omnibees.com/Images/4071/RoomTypes/920x620/1077829.jpg',
        'https://media.omnibees.com/Images/4071/RoomTypes/920x620/1077830.jpg',
        'https://media.omnibees.com/Images/4071/RoomTypes/920x620/1077831.jpg',
        'https://media.omnibees.com/Images/4071/RoomTypes/920x620/1077832.jpg',
        'https://media.omnibees.com/Images/4071/RoomTypes/920x620/793079.jpg',
        'https://media.omnibees.com/Images/4071/RoomTypes/920x620/793087.jpg'
      ]),
      is_active: 1
    },
    {
      name: 'Suíte Garden com Hidro',
      description: 'Nossa suíte especial com banheira de hidromassagem para momentos de puro relaxamento. Ambiente aconchegante com cama king size, decoração tropical e todas as comodidades para uma estadia inesquecível. Perfeita para casais em lua de mel ou ocasiões especiais.',
      capacity: 2,
      size: '20m²',
      amenities: JSON.stringify([
        'Ar condicionado Split',
        'TV LCD 32"',
        'Canais via satélite',
        'Frigobar',
        'Telefone',
        'Cofre',
        'Wi-Fi gratuito',
        'Banheira de hidromassagem',
        'Cama King Size',
        'Banheiro privativo',
        'Varanda privativa',
        'Decoração especial'
      ]),
      image_urls: JSON.stringify([
        'https://media.omnibees.com/Images/4071/RoomTypes/920x620/1077835.jpg',
        'https://media.omnibees.com/Images/4071/RoomTypes/920x620/1077836.jpg',
        'https://media.omnibees.com/Images/4071/RoomTypes/920x620/1077837.jpg',
        'https://media.omnibees.com/Images/4071/RoomTypes/920x620/1077838.jpg',
        'https://media.omnibees.com/Images/4071/RoomTypes/920x620/1077825.jpg',
        'https://media.omnibees.com/Images/4071/RoomTypes/920x620/793088.jpg',
        'https://media.omnibees.com/Images/4071/RoomTypes/920x620/793089.jpg'
      ]),
      is_active: 1
    },
    {
      name: 'Studio Garden',
      description: 'Studio exclusivo com ambiente integrado e vista para os jardins tropicais da pousada. Espaço amplo com cama king size, área de estar confortável e varanda privativa. Ideal para quem busca privacidade e contato com a natureza.',
      capacity: 2,
      size: '20m²',
      amenities: JSON.stringify([
        'Ar condicionado Split',
        'TV LCD 32"',
        'Canais via satélite',
        'Frigobar',
        'Telefone',
        'Cofre',
        'Wi-Fi gratuito',
        'Cama King Size',
        'Banheiro privativo',
        'Varanda privativa',
        'Vista jardim tropical',
        'Ambiente integrado'
      ]),
      image_urls: JSON.stringify([
        'https://media.omnibees.com/Images/4071/RoomTypes/920x620/1077821.jpg',
        'https://media.omnibees.com/Images/4071/RoomTypes/920x620/1077822.jpg',
        'https://media.omnibees.com/Images/4071/RoomTypes/920x620/1077823.jpg',
        'https://media.omnibees.com/Images/4071/RoomTypes/920x620/1077824.jpg',
        'https://media.omnibees.com/Images/4071/RoomTypes/920x620/1077825.jpg',
        'https://media.omnibees.com/Images/4071/RoomTypes/920x620/793079.jpg',
        'https://media.omnibees.com/Images/4071/RoomTypes/920x620/793087.jpg'
      ]),
      is_active: 1
    }
  ]

  console.log('📝 Inserindo quartos...')

  for (const room of rooms) {
    db.run(`
      INSERT INTO rooms (name, description, capacity, size, amenities, image_urls, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      room.name,
      room.description,
      room.capacity,
      room.size,
      room.amenities,
      room.image_urls,
      room.is_active
    ])
    console.log(`   ✓ ${room.name}`)
  }

  // Save database
  const data = db.export()
  const buffer2 = Buffer.from(data)
  fs.writeFileSync(dbPath, buffer2)

  console.log('')
  console.log('✅ Quartos cadastrados com sucesso!')
  console.log(`📊 Total: ${rooms.length} quartos`)
  console.log('')
  console.log('🌐 Acesse o admin: http://localhost:3000/admin/rooms')
}

seedRooms().catch(console.error)

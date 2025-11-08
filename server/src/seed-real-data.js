import initSqlJs from 'sql.js'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import fs from 'fs'
import dotenv from 'dotenv'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const dbPath = join(__dirname, '../database/praiabela.db')

const seedRealData = async () => {
  console.log('🌱 Iniciando seed com dados reais da Pousada Praia Bela...')

  const SQL = await initSqlJs()
  const buffer = fs.readFileSync(dbPath)
  const db = new SQL.Database(buffer)

  // Update Site Info with real data
  console.log('📝 Atualizando informações do site...')
  db.run(`
    UPDATE site_info SET
      about_text = ?,
      contact_email = ?,
      contact_phone = ?,
      contact_address = ?,
      check_in_time = ?,
      check_out_time = ?,
      whatsapp_number = ?,
      facebook_url = ?,
      instagram_url = ?
    WHERE id = 1
  `, [
    'Há mais de 20 anos a Pousada Praia Bela tem acolhido hóspedes com grande dedicação e carinho. Localizada na Praia dos Milionários em Ilhéus, Bahia, oferecemos uma experiência única com infraestrutura completa: restaurante com culinária baiana, café da manhã farto, piscina com deck, sala de jogos, áreas de leitura e descanso, além do exclusivo Spa do Cacau. Todos os nossos apartamentos possuem Smart TV, telefone, frigobar, cofre, secador de cabelo, ar-condicionado, colchão box e varanda privativa. Visite nossa mini fazenda de cacau e aprenda sobre a produção de chocolate, conectando-se com a herança agrícola da região.',
    'reservas@praiabela.com.br',
    '+55 (73) 98664-4644',
    'Praia dos Milionários - Ilhéus/BA',
    '14:00',
    '12:00',
    '5573986644644',
    'https://facebook.com/praiabela',
    'https://instagram.com/praiabela'
  ])

  // Clear existing promotions and add real ones
  console.log('🏷️ Atualizando promoções...')
  db.run('DELETE FROM promotions')

  db.run(`
    INSERT INTO promotions (title, description, discount, valid_until, is_active) VALUES (?, ?, ?, ?, ?)
  `, [
    'Mais Noites Mais Desconto',
    'Quanto mais você fica, mais você economiza! Reserve múltiplas diárias e ganhe descontos progressivos. Entre em contato para saber os valores especiais.',
    15,
    '2025-12-31',
    1
  ])

  db.run(`
    INSERT INTO promotions (title, description, discount, valid_until, is_active) VALUES (?, ?, ?, ?, ?)
  `, [
    'Especial Final de Semana',
    'Aproveite nossa promoção especial para finais de semana prolongados. Inclui welcome drink com suco de cacau e chocolate orgânico 60%.',
    20,
    '2025-12-31',
    1
  ])

  db.run(`
    INSERT INTO promotions (title, description, discount, valid_until, is_active) VALUES (?, ?, ?, ?, ?)
  `, [
    'Pacote Romântico',
    'Perfeito para casais! Inclui decoração especial, jantar romântico e acesso ao Spa do Cacau com massagens profissionais.',
    10,
    '2025-12-31',
    1
  ])

  // Clear existing packages and add real ones
  console.log('📦 Atualizando pacotes...')
  db.run('DELETE FROM packages')

  db.run(`
    INSERT INTO packages (name, description, price, inclusions, is_featured, is_active) VALUES (?, ?, ?, ?, ?, ?)
  `, [
    'Pacote Experiência Completa',
    'Viva a melhor experiência na Pousada Praia Bela com tudo incluído para seu conforto e bem-estar',
    1800.00,
    JSON.stringify([
      '5 diárias em apartamento com varanda',
      'Café da manhã farto e completo',
      'Welcome drink (suco de cacau + chocolate 60%)',
      'Acesso ao Spa do Cacau',
      '1 sessão de massagem profissional',
      'Visita à mini fazenda de cacau',
      'Acesso à piscina e áreas de lazer',
      'Tsuru de despedida (origami especial)'
    ]),
    1,
    1
  ])

  db.run(`
    INSERT INTO packages (name, description, price, inclusions, is_featured, is_active) VALUES (?, ?, ?, ?, ?, ?)
  `, [
    'Pacote Fim de Semana Prolongado',
    'Escape perfeito para relaxar e renovar as energias em um final de semana especial',
    1200.00,
    JSON.stringify([
      '3 diárias (sexta a domingo)',
      'Café da manhã completo',
      'Welcome drink especial',
      'Acesso ao Spa do Cacau',
      'Uso de todas as áreas de lazer',
      'Tapioca especial de boas-vindas'
    ]),
    1,
    1
  ])

  db.run(`
    INSERT INTO packages (name, description, price, inclusions, is_featured, is_active) VALUES (?, ?, ?, ?, ?, ?)
  `, [
    'Pacote Relax & Bem-Estar',
    'Dedicado ao seu bem-estar com foco em relaxamento e cuidados pessoais',
    2200.00,
    JSON.stringify([
      '4 diárias em suíte confortável',
      'Café da manhã completo',
      '3 sessões de massagem no Spa do Cacau',
      'Tratamentos especiais de bem-estar',
      'Aulas de yoga (consultar horários)',
      'Dieta balanceada opcional',
      'Acesso à piscina e deck',
      'Kit de despedida especial'
    ]),
    0,
    1
  ])

  db.run(`
    INSERT INTO packages (name, description, price, inclusions, is_featured, is_active) VALUES (?, ?, ?, ?, ?, ?)
  `, [
    'Pacote Família',
    'Diversão e conforto para toda a família na Praia dos Milionários',
    2800.00,
    JSON.stringify([
      '7 diárias em apartamentos conectados',
      'Café da manhã farto para todos',
      'Welcome drink para adultos e crianças',
      'Acesso à sala de jogos',
      'Atividades recreativas',
      'Visita à fazenda de cacau',
      'Piscina com área infantil',
      'Transfer de cortesia (consultar disponibilidade)'
    ]),
    0,
    1
  ])

  // Save database
  const data = db.export()
  const buffer2 = Buffer.from(data)
  fs.writeFileSync(dbPath, buffer2)

  console.log('✅ Dados reais da Pousada Praia Bela carregados com sucesso!')
  console.log('📊 Resumo:')
  console.log('   - Informações do site atualizadas')
  console.log('   - 3 promoções criadas')
  console.log('   - 4 pacotes criados')
  console.log('')
  console.log('🌐 Acesse: http://localhost:3000')
  console.log('🔐 Admin: http://localhost:3000/admin/login')
}

seedRealData().catch(console.error)

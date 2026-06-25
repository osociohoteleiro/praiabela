-- Conteúdo inicial da Pousada Praia Bela, migrado do esquema antigo
-- (site_info / rooms / gallery) para o novo esquema (site-loft).
-- Re-executável: limpa e re-insere. Imagens antigas continuam servidas
-- pelas URLs absolutas (S3 hoteloshia / praiabela.com.br); novos uploads
-- vão para o R2 (binding BUCKET).

-- ---------- Settings (JSON) ----------
INSERT OR REPLACE INTO settings (key, value) VALUES
('general', json('{
  "siteName": "Pousada Praia Bela",
  "logoText": "PRAIA BELA",
  "logoSubtext": "POUSADA",
  "location": "Praia dos Milionários - Ilhéus/BA",
  "instagramHandle": "@praiabelailheus"
}')),
('hero', json('{
  "mode": "video",
  "imageUrl": "https://hoteloshia.s3.us-east-2.amazonaws.com/gallery/1768933086293-gallery-10.jpg",
  "videoUrl": "https://praiabela.com.br/wp-content/uploads/2024/01/bg-hero.mp4",
  "badge": "o melhor preço garantido",
  "title": "Sua Casa à Beira-Mar em Ilhéus",
  "subtitle": "Há mais de 20 anos acolhendo hóspedes com dedicação e carinho na Praia dos Milionários.",
  "showBooking": true
}')),
('about', json('{
  "eyebrow": "SOBRE A POUSADA",
  "title": "UMA EXPERIÊNCIA ÚNICA À BEIRA-MAR EM ILHÉUS, BAHIA",
  "paragraphs": [
    "Há mais de 20 anos a Pousada Praia Bela tem acolhido hóspedes com grande dedicação e carinho. Localizada na Praia dos Milionários em Ilhéus, Bahia, oferecemos uma experiência única com infraestrutura completa: restaurante com culinária baiana, café da manhã farto, piscina com deck, sala de jogos, áreas de leitura e descanso, além do exclusivo Spa do Cacau.",
    "Todos os nossos apartamentos possuem Smart TV, telefone, frigobar, cofre, secador de cabelo, ar-condicionado, colchão box e varanda privativa. Visite nossa mini fazenda de cacau e aprenda sobre a produção de chocolate, conectando-se com a herança agrícola da região."
  ],
  "ctaLabel": "FAÇA UMA RESERVA",
  "ctaUrl": "#reservar",
  "ctaNote": "O MELHOR PREÇO GARANTIDO.",
  "images": [
    "https://hoteloshia.s3.us-east-2.amazonaws.com/gallery/1768933077209-gallery-01.jpg",
    "https://hoteloshia.s3.us-east-2.amazonaws.com/gallery/1768933079553-gallery-03.jpg",
    "https://hoteloshia.s3.us-east-2.amazonaws.com/gallery/1768933094874-gallery-16.jpg"
  ]
}')),
('highlightsSection', json('{ "title": "Sua Casa no Paraíso" }')),
('amenitiesSection', json('{ "title": "TUDO PARA SEU CONFORTO" }')),
('roomsSection', json('{ "eyebrow": "ACOMODAÇÕES", "title": "NOSSOS APARTAMENTOS E SUÍTES" }')),
('location', json('{
  "eyebrow": "ONDE ESTAMOS",
  "title": "PRAIA DOS MILIONÁRIOS, ILHÉUS - BA",
  "paragraphs": [
    "A Pousada Praia Bela fica na deslumbrante Praia dos Milionários, uma das mais belas de Ilhéus, no sul da Bahia, cercada pela exuberância da Mata Atlântica e pelo mar de águas tranquilas.",
    "A região oferece uma atmosfera descontraída, rica cultura cacaueira e a deliciosa gastronomia baiana, o cenário perfeito para descansar e se reconectar com a natureza."
  ],
  "image": "https://hoteloshia.s3.us-east-2.amazonaws.com/gallery/1768933081504-gallery-05.jpg",
  "ctaLabel": "FAÇA UMA RESERVA",
  "ctaUrl": "#reservar"
}')),
('testimonialsSection', json('{ "title": "O QUE DIZEM NOSSOS HÓSPEDES" }')),
('gallerySection', json('{ "title": "SIGA-NOS NO INSTAGRAM" }')),
('promo', json('{
  "title": "CONHEÇA NOSSAS PROMOÇÕES",
  "ctaLabel": "FALE CONOSCO",
  "ctaUrl": "https://wa.me/5573986644644",
  "image": "https://hoteloshia.s3.us-east-2.amazonaws.com/gallery/1768933087278-gallery-11.jpg"
}')),
('contact', json('{
  "cnpj": "",
  "groupText": "A Pousada Praia Bela proporciona as melhores experiências de hospedagem, conforto e gastronomia baiana na Praia dos Milionários, em Ilhéus - BA.",
  "address": "Praia dos Milionários - Ilhéus/BA",
  "email": "reservas@praiabela.com.br",
  "phone": "+55 (73) 98664-4644",
  "whatsapp": "5573986644644",
  "instagram": "https://www.instagram.com/praiabelailheus/",
  "facebook": "https://facebook.com/praiabela"
}'));

-- ---------- Highlights ----------
DELETE FROM highlights;
INSERT INTO highlights (title, image_url, sort_order) VALUES
('Spa do Cacau', 'https://hoteloshia.s3.us-east-2.amazonaws.com/gallery/1768933094874-gallery-16.jpg', 1),
('Café da manhã farto', 'https://hoteloshia.s3.us-east-2.amazonaws.com/gallery/1768933088308-gallery-12.jpg', 2),
('Piscina com deck', 'https://hoteloshia.s3.us-east-2.amazonaws.com/gallery/1768933079553-gallery-03.jpg', 3),
('Avaliação nota máxima', 'https://hoteloshia.s3.us-east-2.amazonaws.com/gallery/1768933086293-gallery-10.jpg', 4);

-- ---------- Amenities ----------
DELETE FROM amenities;
INSERT INTO amenities (icon, label, sort_order) VALUES
('wifi', 'Wi-Fi gratuito', 1),
('car', 'Estacionamento gratuito', 2),
('check', 'Café da manhã incluso', 3),
('credit-card', 'Parcelamento facilitado', 4),
('check', 'Ar-condicionado em todos os quartos', 5);

-- ---------- Rooms (migrados de praiabela-db) ----------
DELETE FROM rooms;
INSERT INTO rooms (title, subtitle, description, image_url, amenities, sort_order) VALUES
('Apartamento Padrão', '18m² · até 3 hóspedes · Cama Queen + Solteiro',
 'Apartamentos completos e confortáveis com vista para o jardim. Equipados com frigobar, TV LCD 32" com canais via satélite, ar condicionado Split e telefone com discagem direta. Ideal para casais ou pequenas famílias que buscam conforto e praticidade.',
 'https://media.omnibees.com/Images/4071/RoomTypes/920x620/1077827.jpg',
 json('["Ar condicionado Split","TV LCD 32\"","Canais via satélite","Frigobar","Telefone","Cofre","Wi-Fi gratuito","Vista para o jardim","Cama Queen + Solteiro","Varanda privativa"]'), 1),
('Suíte Superior - 1º Andar', '18m² · até 3 hóspedes · Vista privilegiada',
 'Suítes no primeiro andar com as mesmas comodidades dos apartamentos padrão, porém com vista privilegiada e maior privacidade. Equipadas com frigobar, TV LCD 32" com canais via satélite, ar condicionado Split e banheiro privativo completo.',
 'https://media.omnibees.com/Images/4071/RoomTypes/920x620/1077834.jpg',
 json('["Ar condicionado Split","TV LCD 32\"","Canais via satélite","Frigobar","Telefone","Cofre","Wi-Fi gratuito","Vista para o jardim","Banheiro privativo","Cama Queen + Solteiro","Varanda privativa"]'), 2),
('Suíte Garden com Hidro', '20m² · até 2 hóspedes · Hidromassagem · Cama King',
 'Nossa suíte especial com banheira de hidromassagem para momentos de puro relaxamento. Ambiente aconchegante com cama king size, decoração tropical e todas as comodidades para uma estadia inesquecível. Perfeita para casais em lua de mel ou ocasiões especiais.',
 'https://media.omnibees.com/Images/4071/RoomTypes/920x620/1077835.jpg',
 json('["Ar condicionado Split","TV LCD 32\"","Canais via satélite","Frigobar","Telefone","Cofre","Wi-Fi gratuito","Banheira de hidromassagem","Cama King Size","Banheiro privativo","Varanda privativa","Decoração especial"]'), 3),
('Studio Garden', '20m² · até 2 hóspedes · Vista jardim tropical',
 'Studio exclusivo com ambiente integrado e vista para os jardins tropicais da pousada. Espaço amplo com cama king size, área de estar confortável e varanda privativa. Ideal para quem busca privacidade e contato com a natureza.',
 'https://media.omnibees.com/Images/4071/RoomTypes/920x620/1077821.jpg',
 json('["Ar condicionado Split","TV LCD 32\"","Canais via satélite","Frigobar","Telefone","Cofre","Wi-Fi gratuito","Cama King Size","Banheiro privativo","Varanda privativa","Vista jardim tropical","Ambiente integrado"]'), 4);

-- ---------- Testimonials ----------
DELETE FROM testimonials;
INSERT INTO testimonials (title, quote, author, rating, sort_order) VALUES
('Um ótimo local para se hospedar!',
 'Tudo muito bem organizado, atendimento super agradável, café da manhã farto e variado. Muito bem localizado, quartos confortáveis e limpos, com ótima estrutura de apoio: piscina, spa e sala de jogos.',
 'R.M.', 5, 1),
('Hospedagem incrível!',
 'Funcionários atenciosos, comidas saborosas e café da manhã delicioso. O Spa do Cacau é bem relaxante, com ótimos profissionais. Quarto aconchegante e sempre limpinho! Recomendamos de olhos fechados.',
 'K.M.', 5, 2),
('Férias deliciosas',
 'Local muito bonito e de bom gosto, ótima localização na Praia dos Milionários. Após um dia de passeio, um descanso na piscina conversando com outros hóspedes. Pessoal muito gentil. Quarto confortável e limpo.',
 'S.N.', 5, 3);

-- ---------- Gallery (27 itens migrados) ----------
DELETE FROM gallery;
INSERT INTO gallery (image_url, caption, sort_order) VALUES
('https://hoteloshia.s3.us-east-2.amazonaws.com/gallery/1768933077209-gallery-01.jpg', 'Vista da pousada', 1),
('https://hoteloshia.s3.us-east-2.amazonaws.com/gallery/1768933078418-gallery-02.jpg', 'Área externa', 2),
('https://hoteloshia.s3.us-east-2.amazonaws.com/gallery/1768933079553-gallery-03.jpg', 'Piscina', 3),
('https://hoteloshia.s3.us-east-2.amazonaws.com/gallery/1768933080533-gallery-04.jpg', 'Área de lazer', 4),
('https://hoteloshia.s3.us-east-2.amazonaws.com/gallery/1768933081504-gallery-05.jpg', 'Jardim tropical', 5),
('https://hoteloshia.s3.us-east-2.amazonaws.com/gallery/1768933082493-gallery-06.jpg', 'Quarto', 6),
('https://hoteloshia.s3.us-east-2.amazonaws.com/gallery/1768933083530-gallery-07.jpg', 'Acomodação', 7),
('https://hoteloshia.s3.us-east-2.amazonaws.com/gallery/1768933084339-gallery-08.jpg', 'Suíte', 8),
('https://hoteloshia.s3.us-east-2.amazonaws.com/gallery/1768933085327-gallery-09.jpg', 'Varanda', 9),
('https://hoteloshia.s3.us-east-2.amazonaws.com/gallery/1768933086293-gallery-10.jpg', 'Vista do mar', 10),
('https://hoteloshia.s3.us-east-2.amazonaws.com/gallery/1768933087278-gallery-11.jpg', 'Restaurante', 11),
('https://hoteloshia.s3.us-east-2.amazonaws.com/gallery/1768933088308-gallery-12.jpg', 'Café da manhã', 12),
('https://hoteloshia.s3.us-east-2.amazonaws.com/gallery/1768933089286-gallery-13.jpg', 'Ambiente', 13),
('https://hoteloshia.s3.us-east-2.amazonaws.com/gallery/1768933090249-gallery-14.jpg', 'Projeto Vira Bolsa', 14),
('https://hoteloshia.s3.us-east-2.amazonaws.com/gallery/1768933092284-gallery-15.jpg', 'Pingo no Oceano', 15),
('https://hoteloshia.s3.us-east-2.amazonaws.com/gallery/1768933094874-gallery-16.jpg', 'Spa do Cacau', 16),
('https://hoteloshia.s3.us-east-2.amazonaws.com/gallery/1768933096267-gallery-17.jpg', 'Despedida especial', 17),
('https://hoteloshia.s3.us-east-2.amazonaws.com/gallery/1768933097546-gallery-18.jpg', 'Boas-vindas', 18),
('https://hoteloshia.s3.us-east-2.amazonaws.com/gallery/1768933098413-gallery-19.jpg', 'Gastronomia', 19),
('https://hoteloshia.s3.us-east-2.amazonaws.com/gallery/1768933100455-gallery-20.jpg', 'Comida regional', 20),
('https://hoteloshia.s3.us-east-2.amazonaws.com/gallery/1768933101601-gallery-21.jpg', 'Sabores locais', 21),
('https://hoteloshia.s3.us-east-2.amazonaws.com/gallery/1768933102821-gallery-22.jpg', 'Pratos especiais', 22),
('https://hoteloshia.s3.us-east-2.amazonaws.com/gallery/1768933103990-gallery-23.jpg', 'Decoração', 23),
('https://hoteloshia.s3.us-east-2.amazonaws.com/gallery/1768933105082-gallery-24.jpg', 'Doces', 24),
('https://hoteloshia.s3.us-east-2.amazonaws.com/gallery/1768933106255-gallery-25.jpg', 'Cacau', 25),
('https://hoteloshia.s3.us-east-2.amazonaws.com/gallery/1768933107197-gallery-26.jpg', 'Experiência única', 26),
('https://hoteloshia.s3.us-east-2.amazonaws.com/gallery/1768933108313-gallery-27.jpg', 'Apartamento', 27);

-- ---------- Títulos das novas seções ----------
INSERT OR REPLACE INTO settings (key, value) VALUES
('experiencesSection', json('{ "eyebrow": "VIVA A PRAIA BELA", "title": "EXPERIÊNCIAS INESQUECÍVEIS" }')),
('packagesSection', json('{ "eyebrow": "OFERTAS ESPECIAIS", "title": "NOSSOS PACOTES" }')),
('promotionsSection', json('{ "eyebrow": "APROVEITE", "title": "PROMOÇÕES" }')),
('blogSection', json('{ "eyebrow": "DIÁRIO DA POUSADA", "title": "NOSSO BLOG" }'));

-- ---------- Tema / paleta de cores (editável na aba "Aparência" do admin) ----------
INSERT OR REPLACE INTO settings (key, value) VALUES
('theme', json('{
  "brand": "#2f8f63",
  "brandDark": "#246b4a",
  "brandLight": "#e6f1ea",
  "ink": "#1f3b30",
  "eyebrow": "#2f8f63"
}'));

-- ---------- Tour Virtual 360° (editável na aba "Tour Virtual 360°" do admin) ----------
INSERT OR REPLACE INTO settings (key, value) VALUES
('tour', json('{
  "enabled": true,
  "eyebrow": "EXPLORE A POUSADA",
  "title": "Tour Virtual 360°",
  "subtitle": "Passeie pela Pousada Praia Bela como se estivesse aqui. Arraste para girar e explore cada ambiente.",
  "url": "https://tourmkr.com/F1biwwjN1X/46253449p&346.86h&78.42t&autorotate=true"
}'));

-- ---------- Experiences ----------
DELETE FROM experiences;
INSERT INTO experiences (title, description, image_url, sort_order) VALUES
('Spa do Cacau', 'Relaxe com tratamentos exclusivos à base de cacau, em um ambiente tranquilo com profissionais especializados.', 'https://hoteloshia.s3.us-east-2.amazonaws.com/gallery/1768933094874-gallery-16.jpg', 1),
('Mini Fazenda de Cacau', 'Visite nossa mini fazenda, conheça a produção de chocolate e conecte-se com a herança cacaueira de Ilhéus.', 'https://hoteloshia.s3.us-east-2.amazonaws.com/gallery/1768933106255-gallery-25.jpg', 2),
('Projeto Vira Bolsa', 'Participe do nosso projeto socioambiental que transforma materiais em arte e renda para a comunidade.', 'https://hoteloshia.s3.us-east-2.amazonaws.com/gallery/1768933090249-gallery-14.jpg', 3),
('Pingo no Oceano', 'Uma experiência sensorial à beira-mar, celebrando a conexão entre o cacau, a gastronomia e o oceano.', 'https://hoteloshia.s3.us-east-2.amazonaws.com/gallery/1768933092284-gallery-15.jpg', 4);

-- ---------- Promotions ----------
DELETE FROM promotions;
INSERT INTO promotions (title, description, discount, valid_until, image_url, sort_order) VALUES
('Mais Noites, Mais Desconto', 'Quanto mais você fica, mais você economiza! Reserve múltiplas diárias e ganhe descontos progressivos. Entre em contato para saber os valores especiais.', 15, '2025-12-31', 'https://hoteloshia.s3.us-east-2.amazonaws.com/gallery/1768933079553-gallery-03.jpg', 1),
('Especial Final de Semana', 'Aproveite nossa promoção especial para finais de semana prolongados. Inclui welcome drink com suco de cacau e chocolate orgânico 60%.', 20, '2025-12-31', 'https://hoteloshia.s3.us-east-2.amazonaws.com/gallery/1768933086293-gallery-10.jpg', 2),
('Pacote Romântico', 'Perfeito para casais! Inclui decoração especial, jantar romântico e acesso ao Spa do Cacau com massagens profissionais.', 10, '2025-12-31', 'https://hoteloshia.s3.us-east-2.amazonaws.com/gallery/1768933094874-gallery-16.jpg', 3);

-- ---------- Packages ----------
DELETE FROM packages;
INSERT INTO packages (title, description, price, inclusions, image_url, featured, sort_order) VALUES
('Pacote Fim de Semana Prolongado', 'Escape perfeito para relaxar e renovar as energias em um final de semana especial.', 1200,
 json('["3 diárias (sexta a domingo)","Café da manhã completo","Welcome drink especial","Acesso ao Spa do Cacau","Uso de todas as áreas de lazer","Tapioca especial de boas-vindas"]'),
 'https://hoteloshia.s3.us-east-2.amazonaws.com/gallery/1768933088308-gallery-12.jpg', 1, 1),
('Pacote Relax & Bem-Estar', 'Dedicado ao seu bem-estar com foco em relaxamento e cuidados pessoais.', 2200,
 json('["4 diárias em suíte confortável","Café da manhã completo","3 sessões de massagem no Spa do Cacau","Tratamentos especiais de bem-estar","Acesso à piscina e deck","Kit de despedida especial"]'),
 'https://hoteloshia.s3.us-east-2.amazonaws.com/gallery/1768933094874-gallery-16.jpg', 0, 2),
('Pacote Aventura na Praia', 'Viva experiências únicas com esportes aquáticos e aventuras na natureza.', 980,
 json('["2 diárias em quarto standard","Café da manhã completo","Aula de surf ou stand-up paddle","Passeio de caiaque","Trilha guiada","Acesso a todas as áreas de lazer"]'),
 'https://hoteloshia.s3.us-east-2.amazonaws.com/gallery/1768933086293-gallery-10.jpg', 0, 3),
('Pacote Lua de Mel', 'Celebre seu amor em um ambiente romântico e inesquecível à beira-mar.', 2800,
 json('["3 diárias em suíte premium","Café da manhã na cama","Jantar romântico à luz de velas","Massagem para casal no Spa","Decoração especial no quarto","Champanhe e chocolates","Late check-out"]'),
 'https://hoteloshia.s3.us-east-2.amazonaws.com/gallery/1768933084339-gallery-08.jpg', 1, 4);

-- ---------- Posts (blog) ----------
DELETE FROM posts;
INSERT INTO posts (title, slug, excerpt, content, cover_image, category, published_at, sort_order) VALUES
('Conheça a Praia dos Milionários', 'conheca-a-praia-dos-milionarios',
 'Uma das praias mais belas de Ilhéus, com águas tranquilas, coqueirais e a estrutura perfeita para descansar.',
 'A Praia dos Milionários é um dos cartões-postais de Ilhéus, no sul da Bahia. Com águas calmas e mornas, faixa de areia extensa e coqueiros que garantem sombra, é o destino ideal para famílias e casais.

A poucos passos da Pousada Praia Bela, você encontra quiosques com a deliciosa gastronomia baiana, esportes aquáticos e o pôr do sol inesquecível sobre o oceano.

Venha descobrir por que a Praia dos Milionários conquista quem a visita.',
 'https://hoteloshia.s3.us-east-2.amazonaws.com/gallery/1768933086293-gallery-10.jpg', 'Destino', '2026-01-15', 1),
('O Spa do Cacau: relaxamento com aroma de chocolate', 'spa-do-cacau-relaxamento',
 'Tratamentos exclusivos à base de cacau que unem bem-estar e a tradição cacaueira da região.',
 'O Spa do Cacau é uma das experiências mais procuradas da Pousada Praia Bela. Inspirado na herança cacaueira de Ilhéus, oferece massagens e tratamentos com produtos derivados do cacau.

Os antioxidantes do cacau ajudam a hidratar a pele e promovem uma sensação de relaxamento profundo, enquanto o aroma de chocolate envolve todo o ambiente.

Reserve seu horário e descubra um novo significado para a palavra descanso.',
 'https://hoteloshia.s3.us-east-2.amazonaws.com/gallery/1768933094874-gallery-16.jpg', 'Bem-estar', '2026-01-10', 2),
('Da fazenda à barra: a experiência do cacau em Ilhéus', 'experiencia-do-cacau-em-ilheus',
 'Visite nossa mini fazenda e acompanhe o caminho do cacau até o chocolate, conectando-se com a cultura local.',
 'Ilhéus é o coração da cultura cacaueira do Brasil, e na Pousada Praia Bela você pode viver essa história de perto.

Em nossa mini fazenda de cacau, os hóspedes acompanham as etapas da produção: da colheita do fruto à fermentação e secagem das amêndoas, até a transformação em chocolate.

É uma experiência educativa e saborosa para todas as idades, que aproxima você da herança agrícola da região.',
 'https://hoteloshia.s3.us-east-2.amazonaws.com/gallery/1768933106255-gallery-25.jpg', 'Cultura', '2026-01-05', 3);

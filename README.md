# 🏖️ Pousada Praia Bela

Site elegante e moderno para a Pousada Praia Bela em Ilhéus/BA, desenvolvido com React, Vite, Tailwind CSS e Node.js.

## ✨ Características

### Frontend
- ⚛️ **React 18** com Vite para desenvolvimento rápido
- 🎨 **Tailwind CSS** com tema customizado de cores quentes
- 📱 **Totalmente responsivo** (mobile-first)
- 🎬 **Hero section** com vídeo de fundo do S3
- 📅 **Formulário de reserva** horizontal com date pickers
- 🖼️ **Galeria de fotos** com lightbox
- ✨ **Animações suaves** e efeitos visuais
- 🚀 **Performance otimizada** com lazy loading e code splitting

### Backend
- 🟢 **Node.js** com Express
- 🗄️ **SQLite** para banco de dados leve
- 🔐 **Autenticação JWT** para painel admin
- ☁️ **AWS S3** para armazenamento de mídia
- 🔒 **Segurança** com Helmet, CORS e rate limiting

### Painel Administrativo
- 📊 Dashboard com estatísticas
- 🏷️ CRUD completo de promoções
- 📦 CRUD completo de pacotes
- ℹ️ Editor de informações do site
- 📤 Gerenciador de mídia S3 (upload de imagens e vídeos)
- 🔐 Sistema de autenticação seguro

## 🚀 Instalação

### Pré-requisitos
- Node.js 18+ instalado
- Conta AWS com acesso ao S3

### Passo 1: Clonar/Baixar o projeto

```bash
cd site-praiabela
```

### Passo 2: Instalar dependências

```bash
# Instalar todas as dependências (root, client e server)
npm run install:all
```

Ou instalar manualmente:

```bash
# Instalar dependências do cliente
cd client
npm install

# Instalar dependências do servidor
cd ../server
npm install
```

### Passo 3: Configurar variáveis de ambiente

O arquivo `.env` já está configurado em `server/.env` com as credenciais AWS fornecidas. Verifique e ajuste se necessário:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Secret (ALTERE EM PRODUÇÃO!)
JWT_SECRET=sua_chave_secreta_super_segura_mude_em_producao_12345

# AWS S3 Configuration
AWS_ACCESS_KEY_ID=sua_access_key_aqui
AWS_SECRET_ACCESS_KEY=sua_secret_key_aqui
AWS_REGION=us-east-2
AWS_BUCKET_NAME=seu_bucket_aqui
AWS_S3_ENDPOINT=https://s3.us-east-2.amazonaws.com

# Admin Default Credentials
ADMIN_EMAIL=admin@praiabela.com
ADMIN_PASSWORD=admin123
```

### Passo 4: Iniciar o projeto

#### Desenvolvimento (ambos os servidores simultaneamente)

```bash
# Na raiz do projeto
npm run dev
```

Isso iniciará:
- Frontend em http://localhost:3000
- Backend em http://localhost:5000

#### Ou iniciar separadamente

```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
cd client
npm run dev
```

## 📁 Estrutura do Projeto

```
site-praiabela/
├── client/                      # Frontend React
│   ├── public/
│   ├── src/
│   │   ├── components/          # Componentes públicos e admin
│   │   │   ├── Hero.jsx
│   │   │   ├── BookingForm.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── About.jsx
│   │   │   ├── Rooms.jsx
│   │   │   ├── Packages.jsx
│   │   │   ├── Gallery.jsx
│   │   │   ├── Contact.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── AdminLayout.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   └── Admin/
│   │   │       ├── Login.jsx
│   │   │       ├── Dashboard.jsx
│   │   │       ├── Promotions.jsx
│   │   │       ├── Packages.jsx
│   │   │       ├── SiteInfo.jsx
│   │   │       └── MediaManager.jsx
│   │   ├── services/
│   │   │   └── api.js           # Configuração Axios e endpoints
│   │   ├── context/
│   │   │   └── AdminContext.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css            # Tailwind + estilos customizados
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js       # Tema de cores quentes
│   └── package.json
├── server/                      # Backend Node.js
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js      # SQLite setup
│   │   │   └── s3.js            # AWS S3 config
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── promotions.js
│   │   │   ├── packages.js
│   │   │   ├── siteInfo.js
│   │   │   ├── upload.js
│   │   │   └── media.js
│   │   ├── middleware/
│   │   │   ├── auth.js
│   │   │   └── upload.js
│   │   └── server.js
│   ├── database/
│   │   └── praiabela.db         # SQLite database (criado automaticamente)
│   ├── .env
│   └── package.json
└── package.json                 # Root package.json
```

## 🔑 Acesso ao Painel Admin

1. Acesse: http://localhost:3000/admin/login

2. Credenciais padrão:
   - **Email:** admin@praiabela.com
   - **Senha:** admin123

**⚠️ IMPORTANTE:** Altere as credenciais em produção!

## 🎨 Paleta de Cores

O site utiliza cores quentes inspiradas no litoral baiano:

- **Primary (Laranja):** #f97316 - Representa o sol e o calor
- **Secondary (Coral):** #f43f5e - Tons de pôr do sol
- **Accent (Amarelo Dourado):** #fbbf24 - Areia e luz
- **Ocean (Azul Turquesa):** #06b6d4 - Mar do nordeste

## 📤 Upload de Mídia

### Vídeo Hero
1. Acesse o painel admin → **Mídia**
2. Faça upload do vídeo (máx. 100MB, formato MP4/WebM)
3. Copie a URL gerada
4. Vá em **Info do Site** e cole a URL no campo "URL do Vídeo Hero"

### Imagens
1. Acesse **Mídia** no painel admin
2. Arraste e solte imagens ou clique para selecionar
3. As URLs podem ser copiadas e usadas em promoções, pacotes, etc.

## 🏗️ Build para Produção

```bash
# Build do frontend
cd client
npm run build

# Os arquivos otimizados estarão em client/dist/
```

### Deploy

#### Frontend (Vercel/Netlify)
1. Conecte o repositório
2. Configure build command: `cd client && npm run build`
3. Configure output directory: `client/dist`

#### Backend (Railway/Heroku/VPS)
1. Configure variáveis de ambiente
2. Altere JWT_SECRET para valor seguro
3. Ajuste CORS origin no `server.js`
4. Execute: `cd server && npm start`

## 🔐 Segurança

- ✅ Autenticação JWT com expiração
- ✅ Senhas criptografadas com bcrypt
- ✅ Headers de segurança com Helmet
- ✅ CORS configurado
- ✅ Rate limiting para APIs
- ✅ Validação server-side
- ✅ Upload de arquivos com verificação de tipo

**⚠️ Em produção:**
- Altere `JWT_SECRET` no `.env`
- Altere credenciais de admin padrão
- Configure CORS para seu domínio
- Use HTTPS
- Considere adicionar variáveis de ambiente seguras

## 📱 Funcionalidades do Site Público

- 🎬 Hero fullscreen com vídeo
- 📝 Formulário de reserva com validação
- ℹ️ Seção "Sobre a Pousada"
- 🏨 Showcase de acomodações
- 🎁 Pacotes promocionais
- 🖼️ Galeria de fotos com lightbox
- 📍 Mapa de localização
- 📧 Formulário de contato (integrado com WhatsApp)
- 📱 Links para redes sociais

## 🛠️ Tecnologias Utilizadas

### Frontend
- React 18.3.1
- Vite 5.1.6
- Tailwind CSS 3.4.1
- React Router DOM 6.22.0
- React Hook Form 7.50.1
- React DatePicker 6.1.0
- React Dropzone 14.2.3
- Axios 1.6.7
- Heroicons 2.1.1

### Backend
- Node.js
- Express 4.18.3
- Better-SQLite3 9.4.3
- JWT (jsonwebtoken 9.0.2)
- Bcrypt 2.4.3
- AWS SDK 2.1550.0
- Multer 1.4.5
- Helmet 7.1.0
- CORS 2.8.5

## 📞 Suporte

Para dúvidas ou problemas:
- Verifique os logs do console (F12 no navegador)
- Verifique os logs do servidor no terminal
- Certifique-se de que as credenciais AWS estão corretas
- Verifique se o bucket S3 permite uploads

## 📄 Licença

MIT

## 🎉 Próximos Passos

- [ ] Implementar sistema de reservas completo
- [ ] Adicionar integração com gateway de pagamento
- [ ] Criar painel de relatórios e analytics
- [ ] Adicionar newsletter
- [ ] Implementar sistema de avaliações
- [ ] PWA (Progressive Web App)
- [ ] Multi-idioma (PT/EN/ES)

---

Desenvolvido com ❤️ para a Pousada Praia Bela

# 🚀 Quick Start - Pousada Praia Bela

## Início Rápido em 3 Passos

### 1️⃣ Instalar Dependências

```bash
npm run install:all
```

### 2️⃣ Iniciar o Projeto

```bash
npm run dev
```

Isso iniciará:
- ✅ Frontend: http://localhost:3000
- ✅ Backend: http://localhost:5000

### 3️⃣ Acessar o Painel Admin

Abra: http://localhost:3000/admin/login

**Credenciais:**
- Email: `admin@praiabela.com`
- Senha: `admin123`

---

## 📋 Checklist Pós-Instalação

Após iniciar o projeto, faça o seguinte no painel admin:

### 1. Upload do Vídeo Hero
- [ ] Acesse "Mídia" no menu lateral
- [ ] Faça upload de um vídeo para o hero (MP4, máx. 100MB)
- [ ] Copie a URL do vídeo
- [ ] Vá em "Info do Site" e cole no campo "URL do Vídeo Hero"

### 2. Atualizar Informações
- [ ] Vá em "Info do Site"
- [ ] Preencha/ajuste todas as informações:
  - Texto "Sobre"
  - Email, telefone, endereço
  - Redes sociais (Facebook, Instagram, WhatsApp)
  - Horários de check-in/out

### 3. Criar Promoções
- [ ] Vá em "Promoções"
- [ ] Clique em "Nova Promoção"
- [ ] Preencha os dados e faça upload de uma imagem
- [ ] Salve

### 4. Criar/Editar Pacotes
- [ ] Vá em "Pacotes"
- [ ] Edite os pacotes existentes ou crie novos
- [ ] Adicione imagens aos pacotes
- [ ] Marque pacotes em destaque se desejar

### 5. Upload de Fotos para Galeria
- [ ] Vá em "Mídia"
- [ ] Faça upload de fotos da pousada
- [ ] Use as URLs em pacotes, promoções, etc.

---

## 🎯 Páginas Importantes

| Página | URL |
|--------|-----|
| Site Público | http://localhost:3000 |
| Admin Login | http://localhost:3000/admin/login |
| Dashboard | http://localhost:3000/admin/dashboard |
| Promoções | http://localhost:3000/admin/promotions |
| Pacotes | http://localhost:3000/admin/packages |
| Info do Site | http://localhost:3000/admin/site-info |
| Mídia | http://localhost:3000/admin/media |

---

## ⚙️ Configurações AWS S3

O projeto já está configurado com as credenciais fornecidas:

- **Bucket:** hoteloshia
- **Região:** us-east-2
- **Endpoint:** https://s3.us-east-2.amazonaws.com

Todos os uploads (imagens e vídeos) serão enviados automaticamente para este bucket.

---

## 🐛 Solução de Problemas

### Erro ao iniciar o servidor

**Problema:** `Error: Cannot find module 'express'`

**Solução:**
```bash
cd server
npm install
cd ..
```

### Erro ao iniciar o cliente

**Problema:** `Error: Cannot find module 'react'`

**Solução:**
```bash
cd client
npm install
cd ..
```

### Erro de upload para S3

**Problema:** `Access Denied` ou erro de permissão

**Solução:**
1. Verifique as credenciais AWS no arquivo `server/.env`
2. Certifique-se de que o bucket `hoteloshia` existe
3. Verifique as permissões do bucket

### Porta já em uso

**Problema:** `Error: listen EADDRINUSE: address already in use :::5000`

**Solução:**
1. Altere a porta no `server/.env`: `PORT=5001`
2. Ou finalize o processo que está usando a porta 5000

---

## 📝 Comandos Úteis

```bash
# Instalar tudo
npm run install:all

# Iniciar tudo (dev mode)
npm run dev

# Apenas frontend
npm run dev:client

# Apenas backend
npm run dev:server

# Build de produção
npm run build

# Ver estrutura do projeto
tree /F
```

---

## 🎨 Customização de Cores

As cores estão definidas em `client/tailwind.config.js`:

```javascript
colors: {
  primary: { ... },    // Laranja
  secondary: { ... },  // Coral
  accent: { ... },     // Amarelo
  ocean: { ... },      // Turquesa
}
```

Modifique conforme necessário para criar sua própria paleta!

---

## 📚 Próximos Passos

1. ✅ Configure todas as informações do site
2. ✅ Faça upload de mídia
3. ✅ Crie promoções e pacotes
4. ✅ Teste o formulário de reserva
5. ✅ Ajuste cores e textos conforme necessário
6. 🚀 Deploy para produção!

---

**Dúvidas?** Consulte o [README.md](README.md) completo.

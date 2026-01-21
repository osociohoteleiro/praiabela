# Deploy - Pousada Praia Bela

## Arquitetura

- **Frontend**: Cloudflare Pages (React/Vite)
- **Backend/API**: EasyPanel (Node.js + SQLite)
- **Storage**: AWS S3 (imagens e vídeos)

---

## 1. Deploy da API no EasyPanel

### Passo a Passo

1. No EasyPanel, crie um novo **App** do tipo **Dockerfile**
2. Conecte ao repositório GitHub
3. Configure:
   - **Dockerfile Path**: `server/Dockerfile`
   - **Context**: `server`
   - **Port**: `5000`

### Variáveis de Ambiente (EasyPanel)

```env
# Server
PORT=5000
NODE_ENV=production

# CORS - URLs do frontend (separadas por vírgula)
CORS_ORIGINS=https://praiabela.pages.dev,https://www.praiabela.com.br

# JWT Secret - GERE UMA CHAVE SEGURA!
JWT_SECRET=sua_chave_secreta_gerada_com_openssl

# AWS S3
AWS_ACCESS_KEY_ID=AKIA27ECEV5DUIEBSWMI
AWS_SECRET_ACCESS_KEY=sua_secret_key
AWS_REGION=us-east-2
AWS_BUCKET_NAME=hoteloshia
AWS_S3_ENDPOINT=https://s3.us-east-2.amazonaws.com

# Database
DB_PATH=./database/praiabela.db

# Admin (criado no primeiro deploy)
ADMIN_EMAIL=admin@praiabela.com
ADMIN_PASSWORD=SenhaForte123!
```

### Volume Persistente (IMPORTANTE!)

Configure um volume para persistir o banco de dados SQLite:
- **Mount Path**: `/app/database`
- **Size**: 1GB (suficiente)

### Domínio

Configure um domínio personalizado ou use o fornecido pelo EasyPanel:
- Exemplo: `api-praiabela.seudominio.com`

---

## 2. Deploy do Frontend no Cloudflare Pages

### Passo a Passo

1. No Cloudflare Pages, crie um novo projeto
2. Conecte ao repositório GitHub
3. Configure o build:

| Configuração | Valor |
|-------------|-------|
| **Framework preset** | Vite |
| **Build command** | `cd client && npm install && npm run build` |
| **Build output directory** | `client/dist` |
| **Root directory** | `/` |

### Variáveis de Ambiente (Cloudflare Pages)

```env
VITE_API_URL=https://api-praiabela.seudominio.com/api
```

> **Nota**: Substitua pela URL real da sua API no EasyPanel

### Domínio

Configure seu domínio personalizado no Cloudflare Pages:
- Exemplo: `www.praiabela.com.br`

---

## 3. Resumo das Variáveis de Ambiente

### API (EasyPanel)

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `PORT` | Porta do servidor | `5000` |
| `NODE_ENV` | Ambiente | `production` |
| `CORS_ORIGINS` | URLs do frontend (vírgula) | `https://praiabela.pages.dev` |
| `JWT_SECRET` | Chave secreta JWT | `openssl rand -base64 32` |
| `AWS_ACCESS_KEY_ID` | AWS Access Key | `AKIA...` |
| `AWS_SECRET_ACCESS_KEY` | AWS Secret Key | `xxx...` |
| `AWS_REGION` | Região AWS | `us-east-2` |
| `AWS_BUCKET_NAME` | Nome do bucket S3 | `hoteloshia` |
| `AWS_S3_ENDPOINT` | Endpoint S3 | `https://s3.us-east-2.amazonaws.com` |
| `DB_PATH` | Caminho do SQLite | `./database/praiabela.db` |
| `ADMIN_EMAIL` | Email do admin | `admin@praiabela.com` |
| `ADMIN_PASSWORD` | Senha do admin | `SenhaForte123!` |

### Frontend (Cloudflare Pages)

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `VITE_API_URL` | URL completa da API | `https://api.praiabela.com/api` |

---

## 4. Checklist de Deploy

### Antes do Deploy

- [ ] Gerar JWT_SECRET seguro: `openssl rand -base64 32`
- [ ] Definir senha forte para ADMIN_PASSWORD
- [ ] Verificar credenciais AWS S3
- [ ] Ter domínios configurados (opcional)

### Após Deploy da API

- [ ] Verificar health check: `GET /api/health`
- [ ] Testar login admin: `POST /api/auth/login`
- [ ] Copiar URL da API para usar no frontend

### Após Deploy do Frontend

- [ ] Verificar se carrega corretamente
- [ ] Testar login no painel admin
- [ ] Testar upload de imagens
- [ ] Verificar CORS funcionando

---

## 5. Comandos Úteis

### Gerar JWT Secret
```bash
openssl rand -base64 32
```

### Testar API Health
```bash
curl https://sua-api.easypanel.host/api/health
```

### Ver Logs (EasyPanel)
Acesse o painel do EasyPanel > App > Logs

---

## 6. Troubleshooting

### CORS Error
- Verifique se `CORS_ORIGINS` inclui a URL exata do frontend (com https://)
- Inclua todas as variações (www e sem www)

### Database não persiste
- Verifique se o volume está montado em `/app/database`

### Imagens não carregam
- Verifique credenciais AWS
- Verifique permissões do bucket S3 (CORS e políticas)

### 502 Bad Gateway
- Verifique se a porta está correta (5000)
- Verifique logs de erro no EasyPanel

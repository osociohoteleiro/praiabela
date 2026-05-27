# Deploy - Pousada Praia Bela

## Arquitetura

- **Frontend + Backend (Pages Functions)**: Cloudflare Pages (deploy unificado)
- **Database**: Cloudflare D1 (SQLite gerenciado, free tier 5GB)
- **Storage de mídia**: AWS S3 (`hoteloshia`)

A pasta [client/](client) contém o app inteiro: React (Vite) + Pages Functions em [client/functions/api/](client/functions/api). O backend antigo em [server/](server) é legado e pode ser deletado depois que esta arquitetura estiver no ar.

---

## 1. Pré-requisitos (uma única vez)

```bash
cd client
npm install
npx wrangler login
```

---

## 2. Criar a database D1 (uma única vez)

```bash
cd client
npx wrangler d1 create praiabela-db
```

A saída inclui o `database_id`. Copie e cole em [client/wrangler.toml](client/wrangler.toml), substituindo `PASTE_DATABASE_ID_HERE_AFTER_wrangler_d1_create`:

```toml
[[d1_databases]]
binding = "DB"
database_name = "praiabela-db"
database_id = "<UUID retornado pelo wrangler>"
```

### Aplicar schema na D1 remota

```bash
cd client
npm run db:migrate:remote
```

### Criar o admin remoto (com a senha que você quiser)

```bash
cd client
ADMIN_PASSWORD='SuaSenhaForte!' npm run db:seed:admin:remote
```

Reexecute o mesmo comando sempre que quiser **resetar** a senha (o script usa `INSERT ... ON CONFLICT DO UPDATE`).

---

## 3. Configurar secrets em produção

Pelo dashboard do Cloudflare (**Pages → seu projeto → Settings → Environment variables → Production**) ou pela CLI:

```bash
cd client
npx wrangler pages secret put JWT_SECRET            # cole um valor gerado: openssl rand -base64 32
npx wrangler pages secret put ADMIN_PASSWORD        # senha do admin (não fica em commit)
npx wrangler pages secret put AWS_ACCESS_KEY_ID
npx wrangler pages secret put AWS_SECRET_ACCESS_KEY
```

Vars **não-secretas** já estão em [client/wrangler.toml](client/wrangler.toml) (`AWS_REGION`, `AWS_BUCKET_NAME`, `AWS_S3_ENDPOINT`, `CORS_ORIGINS`, `ADMIN_EMAIL`). Ajuste lá se quiser mudar.

---

## 4. Deploy

### Opção A — manual (CLI)

```bash
cd client
npm run deploy   # roda vite build + wrangler pages deploy ./dist
```

### Opção B — automático (push para GitHub)

Se o projeto Pages já está conectado ao repositório (como o `praiabela.pages.dev`), basta:

```bash
git push origin main
```

Cloudflare Pages roda o build automaticamente. Configurações do build no painel devem ser:

| Configuração | Valor |
|---|---|
| Build command | `cd client && npm install && npm run build` |
| Build output | `client/dist` |
| Root directory | `/` |

**Importante**: o D1 binding e os secrets também precisam estar configurados no painel do Pages (passos 2 e 3), senão o deploy sobe mas as Functions falham em runtime.

---

## 5. Desenvolvimento local

Duas formas:

### A — só o frontend (mais rápido)
```bash
cd client
npm run dev          # Vite em http://localhost:3000
```
Use isso quando estiver mexendo só em UI. As chamadas à API quebram se você não tiver as Functions rodando — por isso a opção B existe.

### B — frontend + Functions + D1 emulado
```bash
cd client
npm run dev:pages    # wrangler pages dev em http://127.0.0.1:8788
```

Antes do primeiro `dev:pages`, prepare o D1 local:
```bash
cd client
cp .dev.vars.example .dev.vars     # preencha JWT_SECRET, AWS keys, etc
npm run db:migrate:local
ADMIN_PASSWORD='admin123' npm run db:seed:admin:local
```

---

## 6. Estrutura de arquivos

```
client/
├── functions/                    # Pages Functions (backend)
│   ├── _lib/                     # helpers compartilhados (auth, cors, s3, response)
│   └── api/
│       ├── _middleware.js        # CORS + tratamento de erro global
│       ├── health.js             # GET /api/health
│       ├── auth/                 # /api/auth/{login,verify}
│       ├── packages/             # /api/packages, /api/packages/:id, /api/packages/admin
│       ├── rooms/                # /api/rooms, /api/rooms/:id, /api/rooms/admin/all
│       ├── promotions/           # idem
│       ├── site-info/            # /api/site-info
│       ├── gallery/              # /api/gallery + reorder/batch
│       ├── experiences/          # /api/experiences + reorder/batch
│       ├── upload/               # /api/upload/{image,images,video} + DELETE /api/upload/<key>
│       └── sync/                 # /api/sync/{import,export}
├── scripts/seed-admin.mjs        # cria/reseta admin no D1
├── schema.sql                    # schema D1
├── wrangler.toml                 # config Cloudflare (bindings, vars, build dir)
└── .dev.vars                     # secrets locais (gitignored)
```

---

## 7. Variáveis de ambiente — referência

### Vars (em [wrangler.toml](client/wrangler.toml))
| Nome | Descrição |
|---|---|
| `ADMIN_EMAIL` | Email do admin (usado pelo seed) |
| `AWS_REGION` | Região do S3 |
| `AWS_BUCKET_NAME` | Nome do bucket |
| `AWS_S3_ENDPOINT` | Endpoint do S3 |
| `CORS_ORIGINS` | URLs do frontend separadas por vírgula |

### Secrets (dashboard ou `wrangler pages secret put`)
| Nome | Descrição |
|---|---|
| `JWT_SECRET` | Chave para assinar tokens (`openssl rand -base64 32`) |
| `ADMIN_PASSWORD` | Usada pelo seed-admin.mjs |
| `AWS_ACCESS_KEY_ID` | AWS S3 |
| `AWS_SECRET_ACCESS_KEY` | AWS S3 |

---

## 8. Troubleshooting

### `D1_ERROR: no such table: <X>`
O schema ainda não foi aplicado naquela database. Rode:
- Local: `npm run db:migrate:local`
- Remota: `npm run db:migrate:remote`

### Login retorna `Credenciais inválidas`
O admin não foi seed-ado (ou a senha não bate). Rode:
```bash
ADMIN_PASSWORD='<senha>' npm run db:seed:admin:remote   # ou :local
```

### CORS error no browser
- Verifique que a URL exata do frontend está em `CORS_ORIGINS` no [wrangler.toml](client/wrangler.toml).
- Inclua variações (com e sem `www`).
- Após mudar, redeploy.

### Upload falha em prod mas funciona local
Provavelmente os secrets `AWS_ACCESS_KEY_ID`/`AWS_SECRET_ACCESS_KEY` não foram configurados em produção. Rode `npx wrangler pages secret put <nome>`.

### `database_id` placeholder
Você precisa rodar `npx wrangler d1 create praiabela-db` e colar o UUID no wrangler.toml. Sem isso, o deploy remoto não encontra a database.

### Frontend carrega mas as APIs retornam HTML em vez de JSON
Cloudflare Pages está servindo o `index.html` (SPA fallback) em vez da Function. Isso significa que a Function não foi detectada — confira que `client/functions/api/<rota>.js` existe e o build aconteceu.

---

## 9. Migração: do EasyPanel/SQLite legado para Pages/D1

Se você tinha dados em produção no backend antigo ([server/](server)):

1. No backend antigo, chame `GET /api/sync/export` (autenticado) e salve o JSON.
2. Aplique o schema D1 remoto e crie o admin (passo 2 acima).
3. Faça login no novo backend, pegue o token, e chame `POST /api/sync/import` com o JSON.

Como a API antiga está fora do ar, esse caminho só serve se você ainda tiver um backup do JSON ou um snapshot do PG local.

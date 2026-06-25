# Pousada Praia Bela

Site institucional + painel administrativo da Pousada Praia Bela (Praia dos Milionários, Ilhéus/BA).
Base de código portada do projeto **site-loft**, reaproveitando a infraestrutura existente da Praia Bela
(banco D1 `praiabela-db` e armazenamento R2).

**Stack:** Vite + React + TypeScript · Tailwind CSS v4 · Cloudflare Workers (Hono) · Cloudflare D1 (SQLite) · R2.
Tudo roda na Cloudflare — frontend (assets estáticos) e API (Worker) no mesmo deploy.

---

## Estrutura

```
migrations/        Schema (0001_init.sql) e conteúdo inicial (seed.sql)
worker/            API em Hono: /api/content (público) + /api/admin/* (protegido) + auth HMAC
src/site/          Site público (Hero, Sobre, Acomodações, Galeria, Depoimentos, etc.)
src/admin/         Painel administrativo (login por senha + editores)
src/lib/           Cliente de API e tipos compartilhados
wrangler.jsonc     Configuração do Worker + binding D1 + assets (SPA)
.dev.vars          Variáveis de desenvolvimento (senha admin / segredo) — não committar
```

## Desenvolvimento local

```bash
npm install

# 1) Cria as tabelas e o conteúdo inicial no D1 local (.wrangler/state)
npm run db:migrate:local      # aplica migrations/ (0001_init.sql + seed.sql)

# 2) Sobe o site + API com hot reload
npm run dev                   # http://localhost:5170
```

- Site: <http://localhost:5170/>
- Admin: <http://localhost:5170/admin> — senha padrão **`admin123`** (definida em `.dev.vars`).

> A senha e o segredo de assinatura ficam em `.dev.vars` (`ADMIN_PASSWORD`, `AUTH_SECRET`).
> Troque-os antes de ir para produção.

## Deploy na Cloudflare Pages

O projeto roda no **Cloudflare Pages**: o SPA (Vite) é servido como estático em `dist/`
e a API Hono roda como **Pages Function** (`functions/[[path]].ts`, via adaptador
`hono/cloudflare-pages`). O deploy acontece automaticamente a cada `git push` na `main`.

> Reutilizamos o **D1 `praiabela-db` existente** (id já preenchido em `wrangler.jsonc`).
> A migração `0001_init.sql` **derruba as tabelas do esquema antigo** e recria no esquema
> novo. **Faça backup antes** (`npm run db:backup:remote`).

### Configuração do projeto no painel do Pages (uma vez)

Em **Workers & Pages → praiabela → Settings → Build**:

- **Root directory:** *(vazio / raiz do repo)* — remova qualquer `client`.
- **Build command:** `npm run build`
- **Build output directory:** `dist`

Em **Settings → Functions** (ou via `wrangler.jsonc`, já incluso):

- **Compatibility flags:** `nodejs_compat`
- **Bindings → D1:** `DB` → `praiabela-db`
- **Bindings → R2:** `BUCKET` → `praiabela-media`
- **Variables & Secrets (Production):** `ADMIN_PASSWORD` e `AUTH_SECRET` (valores longos/aleatórios — **não** use os de `.dev.vars`).

### Preparar os recursos (uma vez, via CLI)

```bash
npx wrangler login
npm run db:backup:remote                      # backup do D1 antes de tudo
npx wrangler r2 bucket create praiabela-media # bucket de uploads do admin
npm run db:migrate:remote                     # aplica schema + seed no D1 remoto
```

Depois é só `git push` (deploy automático) ou `npm run deploy` (`wrangler pages deploy`).

### Desenvolvimento full-stack local

`npm run dev` sobe só o frontend (Vite, porta 5172). Para rodar **frontend + API + D1**
localmente, use:

```bash
npm run pages:dev   # build + wrangler pages dev (http://localhost:8788)
```

> **Migração de dados:** o conteúdo antigo de `site_info`, `rooms` e `gallery` foi
> mapeado para o novo esquema em `migrations/seed.sql`. Recursos sem equivalente no
> site-loft (**pacotes, promoções, experiências e blog/posts**) foram descontinuados.
> As imagens antigas continuam servidas pelas URLs absolutas (S3 `hoteloshia` /
> `praiabela.com.br`); **novos uploads** vão para o R2 `praiabela-media`.

## Painel administrativo

Acessível em `/admin`. Permite editar:

| Aba | O que edita |
|-----|-------------|
| Geral | Nome, logo, localização, Instagram e títulos das seções |
| Hero | **Imagem ou vídeo** de fundo, textos e barra de reserva |
| Sobre | Eyebrow, título, parágrafos, imagens e CTA |
| Acomodações | CRUD de quartos/suítes (foto, descrição, comodidades, ordem) |
| Experiências | CRUD de experiências (foto, título, descrição) |
| Pacotes | CRUD de pacotes (preço, inclusões, destaque, foto) |
| Promoções | CRUD de promoções (desconto %, validade, foto) |
| Blog | CRUD de postagens (slug, categoria, capa, resumo, conteúdo) |
| Destaques & Comodidades | Tiles de destaque e ícones de comodidades |
| Localização | Textos e imagem da seção |
| Galeria | Fotos estilo Instagram |
| Faixa Promo | Faixa "Conheça nossas promoções" |
| Depoimentos | Avaliações de hóspedes (nota, autor, texto) |
| Contato | Endereço, e-mail, telefone, redes sociais, CNPJ |

O blog tem páginas próprias: `/blog` (lista) e `/blog/:slug` (postagem). As seções de
experiências, pacotes e promoções aparecem na home (âncoras `#experiencias`, `#pacotes`,
`#promocoes`).

### Hero: imagem ↔ vídeo
Na aba **Hero**, mude o campo *Modo de fundo* para **Vídeo** e informe a URL de um `.mp4`.
A *URL da imagem* continua sendo usada como _poster_ (frame inicial enquanto o vídeo carrega).

## Imagens (upload + compressão via R2)

Os campos de imagem do admin permitem **enviar arquivos** (clique ou arraste).
A imagem é **comprimida no navegador** (redimensionada para no máx. 800px de largura e
convertida para WebP, ~0,72 de qualidade) antes do upload — economiza banda e armazenamento.

- Upload: `POST /api/admin/upload` grava o arquivo no bucket **R2** (`BUCKET`).
- Entrega: o Worker serve as imagens em `/files/<key>` com cache imutável de 1 ano.
- O campo de URL continua disponível como alternativa (ex.: colar um link externo).
- No **dev local** o R2 é emulado pelo Miniflare (em `.wrangler/state`) — não precisa
  criar bucket para testar. Em produção, crie o bucket com
  `npx wrangler r2 bucket create praiabela-media`.

## Segurança do admin

- Login por **senha única**. A senha não é armazenada no banco; é comparada (via hash SHA-256,
  em tempo constante) com a variável `ADMIN_PASSWORD`.
- Em caso de sucesso, o Worker emite um **token assinado (HMAC-SHA256)** com validade de 12h,
  guardado no `localStorage` e enviado no header `Authorization: Bearer`.
- Todas as rotas `/api/admin/*` (exceto o login) exigem token válido.

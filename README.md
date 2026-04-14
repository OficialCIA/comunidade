# TESTERERSRSRS Comunidade

Rede social TESTERSSRSR — feed de posts, perfis, comentários, likes e follows. Construída com **Next.js 15 (App Router)**, **Supabase** e **Tailwind CSS**, hospedada gratuitamente na **Vercel**.

---

## Funcionalidades

- **Auth**: cadastro, login e logout via Supabase Auth (email/senha)
- **Feed**: publicar posts com texto e imagem opcional; curtir e comentar
- **Perfil** `/u/[username]`: ver posts, bio, avatar, seguidores e seguindo
- **Settings** `/settings`: editar username, bio e fazer upload de avatar
- **RLS**: Row Level Security completo — dados protegidos por política
- **Storage**: buckets `avatars` e `post-images` públicos para leitura

---

## Pré-requisitos

- Node.js ≥ 18
- Conta no [Supabase](https://supabase.com) (gratuita)
- Conta na [Vercel](https://vercel.com) (gratuita)

---

## 1. Configurar o Supabase

### 1.1 Criar projeto

Acesse [app.supabase.com](https://app.supabase.com) → **New project**.

### 1.2 Aplicar o schema SQL

No painel do Supabase → **SQL Editor**, copie e execute o conteúdo de [`supabase/schema.sql`](./supabase/schema.sql).

Isso cria:

| Tabela | Descrição |
|--------|-----------|
| `profiles` | Perfil público (username, bio, avatar) |
| `posts` | Posts do feed |
| `comments` | Comentários nos posts |
| `likes` | Curtidas (post_id + user_id únicos) |
| `follows` | Relacionamento follower/following |

E os buckets de Storage: `avatars` e `post-images`.

### 1.3 Configurar Auth → URL Configuration

No Supabase → **Authentication → URL Configuration**:

- **Site URL**: `https://seu-projeto.vercel.app`
- **Redirect URLs**:
  - `https://seu-projeto.vercel.app/**`
  - `https://*.vercel.app/**` *(para Preview Deployments)*

### 1.4 Pegar as chaves

Supabase → **Project Settings → API**:

- **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
- **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **service_role** → `SUPABASE_SERVICE_ROLE_KEY` *(apenas servidor)*

---

## 2. Variáveis de Ambiente

### Localmente

Copie o arquivo de exemplo:

```bash
cp .env.local.example .env.local
```

Preencha `.env.local` com seus valores:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

> ⚠️ **Nunca** comite `.env.local` — ele já está no `.gitignore`.

### Na Vercel

Vercel → **Project → Settings → Environment Variables**. Crie as 3 variáveis acima marcadas para **Production**, **Preview** e **Development**.

---

## 3. Rodando Localmente

```bash
npm install
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

---

## 4. Deploy na Vercel

1. Importe o repositório `OficialCIA/comunidade` na Vercel.
2. Configure as variáveis de ambiente (passo 2).
3. O **Framework Preset** será detectado automaticamente como **Next.js**.
4. Clique em **Deploy**.

Após o primeiro deploy, pegue a URL (ex.: `https://comunidade-xxx.vercel.app`) e atualize **Site URL** no Supabase (passo 1.3).

---

## Estrutura do Projeto

```
src/
├── app/
│   ├── page.tsx          # Landing page
│   ├── auth/page.tsx     # Login / cadastro
│   ├── feed/page.tsx     # Feed de posts
│   ├── settings/page.tsx # Editar perfil
│   └── u/[username]/     # Perfil público
├── components/
│   ├── Navbar.tsx
│   ├── PostCard.tsx
│   └── CommentSection.tsx
├── lib/
│   ├── types.ts
│   └── supabase/
│       ├── client.ts     # Browser client
│       ├── server.ts     # Server client
│       └── middleware.ts # Session refresh
├── middleware.ts          # Proteção de rotas
supabase/
└── schema.sql            # Schema + RLS + Storage
```

---

## Segurança (RLS)

Todas as tabelas têm Row Level Security ativado:

- **Leitura pública**: `profiles`, `posts`, `comments`, `likes`, `follows`
- **Criação**: somente usuários autenticados, sempre como si mesmos
- **Edição/Exclusão**: somente o próprio autor
- **Storage**: upload apenas para sua própria pasta (`user_id/`)

---

## Custo

| Serviço | Plano | Custo |
|---------|-------|-------|
| Vercel | Hobby | Grátis |
| Supabase | Free | Grátis |
| **Total** | | **$0/mês** |

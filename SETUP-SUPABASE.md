# Setup Supabase — Flash Brega (15 min)

## Passo 1 — Criar projeto

1. Acesse [supabase.com/dashboard](https://supabase.com/dashboard)
2. **New project**
3. Nome: `flash-brega` (ou qualquer um)
4. Senha do banco: anote (só precisa se for acessar SQL direto)
5. Região: escolha a mais perto do Brasil se possível (ex: South America)
6. Aguarde ~2 min até ficar **Active**

---

## Passo 2 — Rodar migrations (SQL)

1. No menu lateral: **SQL Editor** → **New query**
2. Copie **todo** o conteúdo de `supabase/migrations/001_initial.sql`
3. Clique **Run** — deve aparecer "Success"
4. Nova query → copie `supabase/migrations/002_storage.sql` → **Run**

### Conferir se deu certo

No **Table Editor**, você deve ver:
- `events` (1 linha: Fest Brega 2026)
- `songs` (~39 linhas)
- `participants`, `missions`, `encounters` (vazias)

No **Storage**, deve aparecer bucket **`photos`** (público).

---

## Passo 3 — Copiar as chaves (API)

1. **Project Settings** (ícone engrenagem) → **API**
2. Copie:

| Campo no Supabase | Variável no `.env.local` |
|-------------------|--------------------------|
| Project URL | `NEXT_PUBLIC_SUPABASE_URL` |
| anon public | `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| service_role (Reveal!) | `SUPABASE_SERVICE_ROLE_KEY` |

⚠️ **Nunca** commite ou compartilhe a `service_role` — ela bypassa toda segurança.

---

## Passo 4 — Configurar o app

No terminal, na pasta `flash-brega`:

```bash
cp .env.local.example .env.local
```

Edite `.env.local` e cole suas chaves:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...
ADMIN_PASSWORD=brega2026
```

---

## Passo 5 — Testar

```bash
node scripts/verify-supabase.mjs
```

Se tudo OK:

```bash
npm run dev
```

Abra [http://localhost:3000/e/BREGA2026](http://localhost:3000/e/BREGA2026) e faça um cadastro teste.

---

## Passo 6 — Deploy (Vercel)

No painel Vercel → Project → **Settings** → **Environment Variables**, adicione as **4 mesmas variáveis** do `.env.local`.

---

## Problemas comuns

| Erro | Solução |
|------|---------|
| `relation "events" does not exist` | Rode o `001_initial.sql` |
| `Bucket not found` / upload falha | Rode o `002_storage.sql` |
| `Missing SUPABASE_SERVICE_ROLE_KEY` | Preencha `.env.local` e reinicie `npm run dev` |
| Cadastro funciona, foto não sobe | Bucket `photos` deve ser **público** |
| `Apelido já em uso` | Normal — use outro apelido ou apague em Table Editor → participants |

---

## Onde achar cada coisa no dashboard

```
Supabase Dashboard
├── SQL Editor          → rodar migrations
├── Table Editor        → ver/editar dados
├── Storage             → bucket photos
└── Settings → API      → URL + keys
```

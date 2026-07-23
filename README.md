# Flash Brega

PWA de engajamento para festa brega: caça humano com autenticação por música + foto, feed ao vivo e painel para telão.

**Tagline:** Acha, autentica, flash — aparece no telão

## Setup rápido (antes da festa)

### 1. Supabase

1. Crie um projeto em [supabase.com](https://supabase.com)
2. No SQL Editor, rode as migrations em ordem (`001` → `002` → `003` → `004_auth`) ou use `supabase/setup-completo.sql`
3. **Authentication** → Email habilitado; redirect URLs: `/auth/callback` (prod + localhost)
4. **SMTP customizado** — ver [`SETUP-SMTP.md`](./SETUP-SMTP.md) (evita rate limit na festa)
5. Copie URL e keys + `NEXT_PUBLIC_SITE_URL` para `.env.local`

### 2. App

```bash
cp .env.local.example .env.local
# Edite .env.local com suas credenciais

npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000)

### 3. Deploy (Vercel)

```bash
npx vercel
```

Configure as mesmas env vars no painel da Vercel.

## Fluxo do evento

1. **Entrada:** QR code apontando para `/e/BREGA2026`
2. **Cadastro:** email + senha + apelido + selfie → recebe música brega
3. **Login / recuperação:** `/login` e `/recuperar-senha`
4. **Admin:** em `/admin`, gerar missões quando tiver participantes
5. **Telão:** notebook em `/live?event=BREGA2026` fullscreen
6. **Fim:** admin congela ranking → anuncia top caçador e top caçado

## Fluxo da missão

1. Caçador encontra alvo → **Encontrei!**
2. Caçador diz sua música → alvo **confirma música**
3. Caçador **tira foto** → alvo **confirma foto**
4. Legenda brega gerada → feed + telão + pontos no ranking

## URLs importantes

| URL | Uso |
|-----|-----|
| `/e/BREGA2026` | Entrada do evento (QR) |
| `/live?event=BREGA2026` | Painel telão |
| `/login` | Entrada (já cadastrado) |
| `/recuperar-senha` | Redefinir senha por email |
| `/admin` | Organizador |

## Checklist pré-festa

- [ ] Migrations SQL executadas (incl. `004_auth.sql`)
- [ ] Supabase Auth: Email + redirect URLs configurados
- [ ] **SMTP customizado** configurado ([SETUP-SMTP.md](./SETUP-SMTP.md))
- [ ] Teste recuperação de senha com email real
- [ ] `NEXT_PUBLIC_SITE_URL` no `.env.local` e Vercel
- [ ] Bucket `photos` criado (público)
- [ ] `.env.local` / Vercel env vars configuradas
- [ ] Teste com 2 celulares (fluxo completo)
- [ ] QR code impresso na entrada
- [ ] Notebook conectado ao projetor em `/live`
- [ ] Senha admin anotada para organizador

## Stack

- Next.js 16 (App Router)
- Supabase (Postgres + Storage + Realtime via polling)
- Tailwind CSS 4
- Deploy: Vercel

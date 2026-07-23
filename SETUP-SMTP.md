# SMTP customizado — Flash Brega (antes da festa)

O Supabase **Free** usa email interno com limite baixo (~4 emails/hora por endereço). Para dezenas de convidados recuperando senha ou se cadastrando, configure **SMTP externo**.

**Tempo:** ~15 min (Resend) ou ~30 min (domínio próprio)

---

## Opção recomendada: Resend (rápido)

Plano free: **100 emails/dia** — suficiente para uma festa.

### 1. Criar conta Resend

1. [resend.com/signup](https://resend.com/signup)
2. Confirme seu email

### 2. Obter API key (senha SMTP)

1. **API Keys** → **Create API Key**
2. Nome: `flash-brega-supabase`
3. Permissão: **Sending access**
4. Copie a key (`re_...`) — **só aparece uma vez**

### 3. Escolher remetente

**Teste rápido (sem domínio):**

- Resend permite enviar **só para o email da sua conta Resend** enquanto não verifica domínio
- Não serve para a festa com convidados reais

**Para a festa (domínio verificado):**

Use **`cocreatehub.co.uk`** (ou qualquer domínio que você controla).

1. Resend → **Domains** → **Add Domain** → digite `cocreatehub.co.uk`
2. O Resend mostra os registros DNS exatos (copie de lá — são únicos por conta)
3. Adicione no painel DNS do domínio (onde você gerencia `cocreatehub.co.uk`: Cloudflare, Namecheap, GoDaddy, etc.)
4. Aguarde status **Verified** no Resend (5 min a 48 h, normalmente < 1 h)

#### DNS em `cocreatehub.co.uk` (o que o Resend pede)

O Resend gera valores **específicos** para você. Em geral são estes tipos:

| Tipo | Nome / Host | Para quê |
|------|-------------|----------|
| **TXT** | `@` ou `cocreatehub.co.uk` | Verificação do domínio + SPF |
| **CNAME** | `resend._domainkey` (ou similar) | DKIM — assinatura do email |
| **CNAME** | outro `_domainkey` | DKIM (2º registro) |
| **CNAME** | outro `_domainkey` | DKIM (3º registro) |

**Onde colar:** painel DNS de quem vende/hospeda o domínio `cocreatehub.co.uk`.

**Cloudflare:** DNS → Add record → cole tipo, nome e valor do Resend. Deixe proxy **desligado** (DNS only / nuvem cinza) nos CNAME do email.

**Dica:** no campo "Name", alguns painéis pedem só `resend._domainkey` (sem `.cocreatehub.co.uk`); outros pedem o FQDN completo — siga o que o seu provedor mostra no exemplo.

Remetente sugerido no Supabase:

```
Flash Brega <festa@cocreatehub.co.uk>
```

ou `noreply@cocreatehub.co.uk` — **não precisa** criar caixa de email real; só o domínio verificado no Resend.

### 4. Colar no Supabase

1. [supabase.com/dashboard](https://supabase.com/dashboard) → projeto **flash-brega**
2. **Authentication** → **Email** (ou **SMTP Settings**)
3. Ative **Enable Custom SMTP**
4. Preencha:

| Campo Supabase | Valor Resend |
|----------------|--------------|
| **Host** | `smtp.resend.com` |
| **Port** | `465` (SSL) ou `587` (TLS) |
| **Username** | `resend` |
| **Password** | sua API key (`re_...`) |
| **Sender email** | `festa@cocreatehub.co.uk` (domínio verificado no Resend) |
| **Sender name** | `Flash Brega` |

5. **Save**

### 5. Ajustar template (opcional)

**Authentication** → **Email Templates** → **Reset Password**

- Assunto em português: `Redefinir senha — Flash Brega`
- O link usa o `redirectTo` do app (`/auth/callback?next=/atualizar-senha`)

### 6. Testar

1. Abra [flash-brega.vercel.app/recuperar-senha](https://flash-brega.vercel.app/recuperar-senha)
2. Use um email **cadastrado** no app (não precisa ser o da conta Resend, se domínio estiver verificado)
3. Deve chegar em segundos
4. Clique no link → `/atualizar-senha` → salve nova senha

Se ainda aparecer "Limite de emails atingido", aguarde ~1 h (limite antigo do SMTP built-in) ou teste com outro email que não tenha sido usado nos testes.

---

## Alternativas ao Resend

| Provedor | Free tier | SMTP host |
|----------|-----------|-----------|
| [Brevo](https://www.brevo.com) | 300 emails/dia | `smtp-relay.brevo.com` |
| [SendGrid](https://sendgrid.com) | 100 emails/dia | `smtp.sendgrid.net` |
| [Amazon SES](https://aws.amazon.com/ses/) | barato em volume | região-specific |

Mesmo fluxo: criar credencial SMTP → colar em **Supabase → Authentication → Email → Custom SMTP**.

---

## Limites úteis na festa

- **Cadastro:** o app confirma email via admin (`email_confirm: true`) — **não envia** email de confirmação
- **Recuperação de senha:** **envia** email — é o fluxo que mais usa SMTP
- Oriente convidados a **não spammar** "esqueci senha" no telão

---

## Checklist SMTP

- [ ] Conta no Resend (ou outro) criada
- [ ] Domínio verificado (ou aceita limite de teste)
- [ ] Custom SMTP habilitado no Supabase
- [ ] Teste de recuperação de senha OK em produção
- [ ] Redirect URLs no Supabase Auth (`/auth/callback`)

---

## Problemas comuns

| Sintoma | Solução |
|---------|---------|
| Email não chega | Spam/lixo; confira domínio DKIM/SPF no Resend |
| "Limite de emails atingido" | Rate limit antigo — aguarde 1 h ou use SMTP customizado |
| Link expirado | Peça link novo; use callback corrigido (deploy recente) |
| Só envia para seu email | Domínio não verificado no Resend — verifique DNS |

---

Ver também: `SETUP-SUPABASE.md` (Auth + redirect URLs)

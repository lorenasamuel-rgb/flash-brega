# Checklist pós-festa — Flash Brega

Use depois que a festa terminar (sexta à noite ou sábado).

---

## Imediato (no dia seguinte)

- [ ] **Anunciar vencedores** — se ainda não fez no palco, poste top caçador e top mais caçado (print do `/ranking` ou telão)
- [ ] **Congelar ranking** — em `/admin` → "Congelar ranking" (se não congelou na hora)
- [ ] **Salvar telão final** — screenshot ou gravação de tela do `/live` com o mosaico completo
- [ ] **Exportar fotos** — Supabase Dashboard → **Storage** → bucket `photos` → baixar pasta do evento (backup das imagens)

---

## Segurança (importante — faça em 24–48h)

- [ ] **Rotacionar a service_role key** — Supabase → **Settings → API** → service_role → **Rotate**
- [ ] **Atualizar chaves** no `.env.local` e na Vercel (se fez deploy) com a nova service_role
- [ ] **Trocar senha admin** — altere `ADMIN_PASSWORD` no `.env.local` e na Vercel
- [ ] **Revisar participantes de teste** — Table Editor → `participants` → apagar contas de teste (ex: TesteBrega)

---

## Dados e privacidade

- [ ] **Decidir retenção** — quanto tempo guardar fotos e apelidos (sugestão: 30 dias ou apagar logo)
- [ ] **Apagar dados sensíveis** (se quiser encerrar):
  - Table Editor → `participants` → apagar linhas ou truncar via SQL
  - `encounters` → apagar registros
  - Storage → apagar arquivos do bucket `photos`
- [ ] **Aviso LGPD** — se pediram exclusão de alguém, apague participante + encounters + fotos associadas

SQL opcional para limpar tudo do evento (cuidado — irreversível):

```sql
-- Só rode se quiser APAGAR TUDO do Flash Brega
delete from encounters;
delete from missions;
delete from participants;
-- Fotos: apague manualmente em Storage → photos
```

---

## Infraestrutura (economia)

- [ ] **Vercel** — pausar ou remover deploy de preview se não for reutilizar; manter só se planeja outra festa
- [ ] **Supabase** — projeto free fica ativo; se não for usar de novo em meses, considere pausar projeto ou exportar backup e deletar
- [ ] **Exportar backup do banco** — Supabase → **Database** → **Backups** (plano pago) ou export manual das tabelas via Table Editor / CSV

---

## Conteúdo / memória da festa

- [ ] **Montar álbum** — fotos do Storage + legendas da tabela `encounters` (coluna `caption`)
- [ ] **Compartilhar highlights** — melhores legendas, top 3 caçadores, top 3 mais caçados
- [ ] **Pedir feedback** — o que funcionou / o que melhorar (missões, telão, internet, cadastro)

---

## Se for fazer outra festa brega

- [ ] **Duplicar evento** — criar novo `code` em `events` (ex: `BREGA2027`) ou reutilizar app com novo código
- [ ] **Resetar missões** — gerar missões de novo no admin após novos cadastros
- [ ] **Lista de músicas** — revisar/atualizar `songs` se quiser hits diferentes
- [ ] **Teste com 2 celulares** — fluxo completo antes da próxima festa
- [ ] **Checklist pré-festa** — ver `README.md` seção "Checklist pré-festa"

---

## Ordem sugerida (rápida)

1. Backup fotos (Storage)  
2. Rotacionar service_role + senha admin  
3. Anunciar vencedores / álbum  
4. Limpar dados ou arquivar  
5. Decidir se mantém Supabase/Vercel ativos  

---

## Contatos úteis

| O quê | Onde |
|-------|------|
| Fotos | Supabase → Storage → `photos` |
| Legendas e ranking | Supabase → Table Editor → `encounters`, `missions` |
| Admin do app | `/admin` (senha: `ADMIN_PASSWORD`) |
| Chaves API | Supabase → Settings → API |

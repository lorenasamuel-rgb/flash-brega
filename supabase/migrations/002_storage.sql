-- Bucket de fotos (rode DEPOIS do 001_initial.sql)

insert into storage.buckets (id, name, public)
values ('photos', 'photos', true)
on conflict (id) do update set public = true;

-- Leitura pública das fotos (feed + telão)
create policy "Fotos publicas leitura"
on storage.objects for select
using (bucket_id = 'photos');

-- Upload via service role (app usa service role no servidor)
-- Se quiser upload direto do client no futuro, adicione policy de insert aqui.

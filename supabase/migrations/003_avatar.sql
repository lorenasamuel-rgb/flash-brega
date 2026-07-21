-- Foto de perfil no cadastro (reconhecimento nas missões)
alter table participants add column if not exists avatar_url text;

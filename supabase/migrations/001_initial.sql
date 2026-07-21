-- Flash Brega MVP schema

create extension if not exists "pgcrypto";

create table events (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text unique not null,
  starts_at timestamptz,
  ends_at timestamptz,
  ranking_frozen boolean default false,
  created_at timestamptz default now()
);

create table songs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  artist text not null
);

create table participants (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references events(id) on delete cascade not null,
  nickname text not null,
  pin_hash text not null,
  song_id uuid references songs(id),
  opt_in_public boolean default true,
  created_at timestamptz default now(),
  unique(event_id, nickname)
);

create table missions (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references events(id) on delete cascade not null,
  hunter_id uuid references participants(id) on delete cascade not null,
  target_id uuid references participants(id) on delete cascade not null,
  status text not null default 'pending'
    check (status in ('pending', 'awaiting_song', 'song_confirmed', 'photo_pending', 'completed')),
  created_at timestamptz default now(),
  unique(hunter_id, target_id),
  check (hunter_id <> target_id)
);

create table encounters (
  id uuid primary key default gen_random_uuid(),
  mission_id uuid references missions(id) on delete cascade unique not null,
  photo_url text,
  caption text,
  song_confirmed_at timestamptz,
  photo_confirmed_at timestamptz,
  hidden_from_live boolean default false,
  created_at timestamptz default now()
);

create index idx_participants_event on participants(event_id);
create index idx_missions_hunter on missions(hunter_id);
create index idx_missions_target on missions(target_id);
create index idx_missions_event on missions(event_id);
create index idx_missions_status on missions(status);
create index idx_encounters_created on encounters(created_at desc);

-- Seed default event
insert into events (name, code, starts_at) values
  ('Fest Brega 2026', 'BREGA2026', now());

-- Seed brega songs
insert into songs (title, artist) values
  ('Evangélica', 'Calcinha Preta'),
  ('Fio de Cabelo', 'Banda Calypso'),
  ('Você Não Vale Nada', 'Calcinha Preta'),
  ('A Loira do Banheiro', 'Banda Calypso'),
  ('Lacraia', 'Calcinha Preta'),
  ('Dancing Days', 'Banda Calypso'),
  ('María María', 'Banda Calypso'),
  ('Ainda Te Amo', 'Calcinha Preta'),
  ('Meu Segredo', 'Banda Calypso'),
  ('Tô Nem Aí', 'Banda Calypso'),
  ('Dona de Mim', 'Calcinha Preta'),
  ('Amor de Verdade', 'Banda Calypso'),
  ('Me Apaixonei', 'Calcinha Preta'),
  ('Sem Sal', 'Banda Calypso'),
  ('Baby Doll', 'Banda Calypso'),
  ('Vida Vazia', 'Calcinha Preta'),
  ('Chora Me Liga', 'Banda Calypso'),
  ('Pra Te Ter Aqui', 'Calcinha Preta'),
  ('Duvido', 'Banda Calypso'),
  ('Meu Ex-Amor', 'Calcinha Preta'),
  ('Acelera Aê', 'Banda Calypso'),
  ('Vou Botar', 'Banda Calypso'),
  ('Me Chama', 'Calcinha Preta'),
  ('Louca por Ti', 'Banda Calypso'),
  ('Quem Ama Sente Saudade', 'Calcinha Preta'),
  ('Isso é Calypso', 'Banda Calypso'),
  ('Não Me Toca', 'Calcinha Preta'),
  ('Vem Morar Comigo', 'Banda Calypso'),
  ('Tchau Tchau', 'Calcinha Preta'),
  ('Amor de Carnaval', 'Banda Calypso'),
  ('Só Dá Você', 'Calcinha Preta'),
  ('Paixão Proibida', 'Banda Calypso'),
  ('Não Quero Perder', 'Calcinha Preta'),
  ('Doida de Amor', 'Banda Calypso'),
  ('Meu Primeiro Amor', 'Calcinha Preta'),
  ('Porque Brigamos', 'Banda Calypso'),
  ('Sem Você', 'Calcinha Preta'),
  ('Volta Pra Mim', 'Banda Calypso'),
  ('Só Você', 'Calcinha Preta');

-- Storage bucket (run in Supabase dashboard or via API):
-- insert into storage.buckets (id, name, public) values ('photos', 'photos', true);

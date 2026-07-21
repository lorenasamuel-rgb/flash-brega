-- Supabase Auth: liga participants ao auth.users
alter table participants add column if not exists auth_user_id uuid unique references auth.users(id) on delete cascade;

-- pin_hash deixa de ser obrigatório (auth substitui PIN)
alter table participants alter column pin_hash drop not null;

create index if not exists idx_participants_auth_user on participants(auth_user_id);

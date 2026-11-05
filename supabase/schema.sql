-- Execute este arquivo no SQL Editor do projeto Supabase monisa-database-brasil.
-- Cada estudante só pode ler e alterar o próprio perfil.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default 'Estudante',
  bio text not null default '',
  subject text not null default '',
  avatar_url text,
  preferences jsonb not null default '{
    "theme": "dark",
    "fontSize": "normal",
    "reducedMotion": true,
    "simpleLanguage": true,
    "responseStyle": "steps",
    "focusMode": false,
    "breakMinutes": 25
  }'::jsonb,
  learning_profile jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

grant select, insert, update on public.profiles to authenticated;

drop policy if exists "Students can read their own profile" on public.profiles;
create policy "Students can read their own profile"
on public.profiles for select to authenticated
using (auth.uid() = id);

drop policy if exists "Students can create their own profile" on public.profiles;
create policy "Students can create their own profile"
on public.profiles for insert to authenticated
with check (auth.uid() = id);

drop policy if exists "Students can update their own profile" on public.profiles;
create policy "Students can update their own profile"
on public.profiles for update to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

create or replace function public.handle_new_monisa_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data ->> 'full_name', ''), split_part(new.email, '@', 1), 'Estudante')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_monisa on auth.users;
create trigger on_auth_user_created_monisa
after insert on auth.users
for each row execute procedure public.handle_new_monisa_user();

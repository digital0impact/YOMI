-- يومي: cloud backup & sync schema.
-- Run this once in your Supabase project's SQL Editor
-- (https://app.supabase.com/project/_/sql/new). Safe to re-run.

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  app_state jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- drop the username column from an earlier version of this schema, if
-- you already ran it once — login is by email now, so it's unused
alter table public.profiles drop column if exists username;

alter table public.profiles enable row level security;

-- each student can only ever read/write her own row
drop policy if exists "read own profile" on public.profiles;
create policy "read own profile" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "insert own profile" on public.profiles;
create policy "insert own profile" on public.profiles
  for insert with check (auth.uid() = id);

drop policy if exists "update own profile" on public.profiles;
create policy "update own profile" on public.profiles
  for update using (auth.uid() = id);

-- keep updated_at current on every write, without trusting the client
create or replace function public.touch_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists profiles_touch_updated_at on public.profiles;
create trigger profiles_touch_updated_at
  before update on public.profiles
  for each row execute function public.touch_updated_at();

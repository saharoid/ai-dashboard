-- Profiles: one row per auth user, holds the app role.
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  role text not null default 'viewer' check (role in ('admin', 'viewer')),
  created_at timestamptz not null default now()
);

-- New sign-ups get a viewer profile.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email) values (new.id, new.email);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Reports, ordered by position.
create table public.reports (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text not null,
  position integer not null default 0,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index reports_position_idx on public.reports (position);

-- Only the API server (service role) reads and writes these tables.
-- RLS on with no policies blocks direct access with the public anon key.
alter table public.profiles enable row level security;
alter table public.reports enable row level security;

-- Make a user admin:
--   update public.profiles set role = 'admin' where email = 'you@example.com';

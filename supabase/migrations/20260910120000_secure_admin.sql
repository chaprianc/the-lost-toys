create table if not exists public.admin_sessions (
  id uuid primary key default gen_random_uuid(),
  token_hash text not null unique,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  last_used_at timestamptz not null default now()
);

create index if not exists admin_sessions_expires_at_idx
  on public.admin_sessions (expires_at);

alter table public.admin_sessions enable row level security;
revoke all on table public.admin_sessions from anon, authenticated;
grant all on table public.admin_sessions to service_role;

create table if not exists public.admin_login_attempts (
  key_hash text primary key,
  attempts integer not null default 0 check (attempts >= 0),
  window_started_at timestamptz not null default now(),
  blocked_until timestamptz
);

alter table public.admin_login_attempts enable row level security;
revoke all on table public.admin_login_attempts from anon, authenticated;
grant all on table public.admin_login_attempts to service_role;

-- Browser clients may read marketplace listings, but privileged writes must go
-- through server functions that validate an admin or seller capability token.
revoke insert, update, delete on table public.toys from anon, authenticated;
revoke all on table public.blocked_phones from anon, authenticated;
revoke all on table public.admin_settings from anon, authenticated;


create table if not exists public.seller_management_tokens (
  toy_id uuid primary key references public.toys(id) on delete cascade,
  token_hash text not null unique check (token_hash ~ '^[0-9a-f]{64}$'),
  created_at timestamptz not null default now(),
  last_used_at timestamptz
);

alter table public.seller_management_tokens enable row level security;

revoke all on table public.seller_management_tokens from anon, authenticated;
grant all on table public.seller_management_tokens to service_role;

comment on table public.seller_management_tokens is
  'Private capability tokens for seller self-service. Only Edge Functions using service_role may access this table.';

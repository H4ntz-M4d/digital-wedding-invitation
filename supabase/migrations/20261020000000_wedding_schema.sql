-- Wedding invitation schema: guests, invitation_tokens, rsvps, wishes, admin_users.
-- All tables have RLS enabled. The public site never talks to these tables directly:
-- every public read/write goes through server-side routes using the service-role key.

create extension if not exists pgcrypto;

-- A. guests -----------------------------------------------------------------
create table public.guests (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(btrim(name)) between 1 and 120),
  phone text null check (phone is null or char_length(phone) <= 32),
  party_size_limit integer not null default 1 check (party_size_limit between 1 and 20),
  created_at timestamptz not null default now()
);

-- B. invitation_tokens (only the SHA-256 hash of the token is stored) --------
create table public.invitation_tokens (
  id uuid primary key default gen_random_uuid(),
  guest_id uuid not null references public.guests(id) on delete cascade,
  token_hash text not null unique,
  created_at timestamptz not null default now(),
  revoked_at timestamptz null
);
create index invitation_tokens_guest_id_idx on public.invitation_tokens(guest_id);

-- C. rsvps (one current RSVP per guest) --------------------------------------
create table public.rsvps (
  id uuid primary key default gen_random_uuid(),
  guest_id uuid not null unique references public.guests(id) on delete cascade,
  attendance_status text not null check (attendance_status in ('attending', 'declined')),
  guest_count integer not null default 0,
  message text null check (message is null or char_length(message) <= 500),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint rsvps_guest_count_matches_status check (
    (attendance_status = 'declined' and guest_count = 0)
    or (attendance_status = 'attending' and guest_count >= 1)
  )
);

-- Enforce party size limit and keep created_at / updated_at honest.
create or replace function public.rsvps_before_write()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  max_party integer;
begin
  select party_size_limit into max_party from public.guests where id = new.guest_id;
  if max_party is null then
    raise exception 'Guest not found';
  end if;
  if new.guest_count > max_party then
    raise exception 'guest_count % exceeds party_size_limit %', new.guest_count, max_party
      using errcode = '23514';
  end if;

  if tg_op = 'UPDATE' then
    new.created_at := old.created_at;
    new.guest_id := old.guest_id;
  end if;
  new.updated_at := now();
  return new;
end;
$$;

create trigger rsvps_before_write
  before insert or update on public.rsvps
  for each row execute function public.rsvps_before_write();

-- D. wishes ------------------------------------------------------------------
create table public.wishes (
  id uuid primary key default gen_random_uuid(),
  guest_id uuid null references public.guests(id) on delete set null,
  guest_name text not null check (char_length(btrim(guest_name)) between 1 and 80),
  message text not null check (char_length(btrim(message)) between 1 and 500),
  moderation_status text not null default 'pending'
    check (moderation_status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  moderated_at timestamptz null
);
create index wishes_status_created_idx on public.wishes(moderation_status, created_at desc);

-- E. admin_users -------------------------------------------------------------
create table public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(btrim(display_name)) between 1 and 80),
  created_at timestamptz not null default now()
);

-- Admin check used by policies. SECURITY DEFINER so it can read admin_users regardless of RLS.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.admin_users where user_id = (select auth.uid()));
$$;

revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

-- Row Level Security -----------------------------------------------------------
alter table public.guests enable row level security;
alter table public.invitation_tokens enable row level security;
alter table public.rsvps enable row level security;
alter table public.wishes enable row level security;
alter table public.admin_users enable row level security;

-- No policies for anon: public visitors get nothing.
-- Authenticated users get access only while they are listed in admin_users.
create policy "guests_admin_all" on public.guests
  for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

create policy "rsvps_admin_all" on public.rsvps
  for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

create policy "wishes_admin_all" on public.wishes
  for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

-- invitation_tokens: no policies at all. Hashes are only reachable with the service-role key.

-- admin_users: a signed-in user can see only their own membership row.
-- No insert/update/delete policies: membership is changed only with the service-role key / SQL.
create policy "admin_users_select_own" on public.admin_users
  for select to authenticated
  using (user_id = (select auth.uid()));

-- Defense in depth: strip default grants from anon, keep only what policies need for authenticated.
revoke all on public.guests, public.invitation_tokens, public.rsvps, public.wishes, public.admin_users from anon;
revoke all on public.invitation_tokens from authenticated;
revoke insert, update, delete, truncate on public.admin_users from authenticated;

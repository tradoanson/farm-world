-- V2.4 social foundation. STAGING ONLY: not applied to production.
-- Requires authenticated Supabase users and existing farm_public_profiles(owner_id, visible).
begin;
create table if not exists public.farm_friend_requests (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references auth.users(id) on delete cascade,
  receiver_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending','accepted','declined','cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint farm_friend_requests_distinct check (sender_id <> receiver_id),
  constraint farm_friend_requests_unique unique (sender_id,receiver_id)
);
create index if not exists farm_friend_requests_receiver_status_idx on public.farm_friend_requests(receiver_id,status);
alter table public.farm_friend_requests enable row level security;
revoke all on public.farm_friend_requests from anon;
grant select on public.farm_friend_requests to authenticated;
create policy "participants can read requests" on public.farm_friend_requests for select to authenticated
  using ((select auth.uid()) in (sender_id,receiver_id));
-- All writes are denied until authenticated RPCs enforce block checks and transitions.\n-- Do not allow direct UPDATE: accepting requests requires a server-side RPC with state transition checks.
revoke update on public.farm_friend_requests from authenticated;
create table if not exists public.farm_blocks (
  blocker_id uuid not null references auth.users(id) on delete cascade,
  blocked_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker_id,blocked_id),
  constraint farm_blocks_distinct check (blocker_id<>blocked_id)
);
alter table public.farm_blocks enable row level security;
revoke all on public.farm_blocks from anon;
grant select,insert,delete on public.farm_blocks to authenticated;
create policy "blocker sees blocks" on public.farm_blocks for select to authenticated using ((select auth.uid())=blocker_id);
create policy "blocker creates blocks" on public.farm_blocks for insert to authenticated with check ((select auth.uid())=blocker_id);
create policy "blocker removes blocks" on public.farm_blocks for delete to authenticated using ((select auth.uid())=blocker_id);
commit;\n
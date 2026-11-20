-- V0.7 staging only. Run manually in a NEW Supabase project.
create table if not exists public.player_farms (
 id uuid primary key default gen_random_uuid(),
 owner_id uuid not null unique references auth.users(id) on delete cascade,
 created_at timestamptz not null default now()
);
alter table public.player_farms enable row level security;
revoke all on public.player_farms from anon;
grant select on public.player_farms to authenticated;
drop policy if exists "read own farm" on public.player_farms;
create policy "read own farm" on public.player_farms for select to authenticated using (owner_id = (select auth.uid()));
-- No INSERT/UPDATE/DELETE policies. Client cannot award coins, XP or modify ownership.
-- A trusted server will create player_farms after validating a session in a future activation stage.

-- V2.7 seasonal community events, staging-only. Aggregated read-only event progress.
begin;
create table if not exists public.farm_seasons (
 id uuid primary key default gen_random_uuid(),
 title text not null check(length(title) between 3 and 80),
 starts_at timestamptz not null,
 ends_at timestamptz not null,
 target_harvests bigint not null check(target_harvests>0),
 baseline_harvests bigint not null default 0 check(baseline_harvests>=0),
 enabled boolean not null default false,
 created_at timestamptz not null default now(),
 check(ends_at>starts_at)
);
alter table public.farm_seasons enable row level security;
revoke all on public.farm_seasons from anon,authenticated;
grant select on public.farm_seasons to authenticated;
create policy "read active seasons" on public.farm_seasons for select to authenticated
 using (enabled and starts_at<=now() and ends_at>now());
-- Record baseline_harvests at season activation from authoritative farm_state.
-- This aggregate is an approximate season delta, not an event-sourced per-harvest ledger.
-- Harvest totals are read from authoritative farm_state. No user-editable progress fields.
create or replace function public.farm_season_progress()
returns table(season_id uuid,title text,ends_at timestamptz,target_harvests bigint,total_harvests bigint,participants bigint)
language sql stable security definer set search_path='' as $$
 select s.id,s.title,s.ends_at,s.target_harvests,
 greatest(0,coalesce((select sum(fs.harvested) from public.farm_state fs),0)-s.baseline_harvests)::bigint,
 (select count(*) from public.player_farms)::bigint
 from public.farm_seasons s
 where auth.uid() is not null and s.enabled and s.starts_at<=now() and s.ends_at>now()
 order by s.ends_at asc limit 10;
$$;
revoke all on function public.farm_season_progress() from public,anon;
grant execute on function public.farm_season_progress() to authenticated;
commit;

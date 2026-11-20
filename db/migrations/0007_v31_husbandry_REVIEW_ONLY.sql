-- V3.1 REVIEW ONLY. DO NOT APPLY TO PRODUCTION WITHOUT ISOLATED E2E/RESTORE.
-- Additive schema; no existing farm data is modified.
create table if not exists public.farm_animal_pens (
 farm_id uuid not null references public.player_farms(id) on delete cascade,
 animal_type text not null check (animal_type in ('chicken','cow','sheep')),
 animal_count integer not null default 0 check (animal_count between 0 and 6),
 capacity integer not null check (capacity between 0 and 6),
 feed_stock bigint not null default 0 check (feed_stock between 0 and 100000),
 fed_at timestamptz,
 collected_at timestamptz,
 revision bigint not null default 0 check (revision >= 0),
 primary key(farm_id,animal_type),
 constraint pen_type_capacity check (
  (animal_type='chicken' and capacity<=6) or
  (animal_type in ('cow','sheep') and capacity<=4)
 ),
 constraint pen_count_capacity check (animal_count<=capacity)
);
create table if not exists public.farm_animal_inventory (
 farm_id uuid not null references public.player_farms(id) on delete cascade,
 product text not null check (product in ('egg','milk','wool')),
 quantity bigint not null default 0 check (quantity between 0 and 1000000),
 primary key(farm_id,product)
);
create table if not exists public.farm_animal_commands (
 owner_id uuid not null references auth.users(id) on delete cascade,
 request_id uuid not null,
 farm_id uuid not null references public.player_farms(id) on delete cascade,
 action text not null check (action in ('buy','feed','collect')),
 animal_type text not null check (animal_type in ('chicken','cow','sheep')),
 quantity integer not null check (quantity between 1 and 6),
 result jsonb not null,
 created_at timestamptz not null default now(),
 primary key(owner_id,request_id)
);
alter table public.farm_animal_pens enable row level security;
alter table public.farm_animal_inventory enable row level security;
alter table public.farm_animal_commands enable row level security;
revoke all on public.farm_animal_pens,public.farm_animal_inventory,public.farm_animal_commands from public,anon,authenticated;
grant select on public.farm_animal_pens,public.farm_animal_inventory to authenticated;
create policy "owner reads animal pens" on public.farm_animal_pens
 for select to authenticated using (exists (
 select 1 from public.player_farms f where f.id=farm_id and f.owner_id=(select auth.uid())
 ));
create policy "owner reads animal products" on public.farm_animal_inventory
 for select to authenticated using (exists (
 select 1 from public.player_farms f where f.id=farm_id and f.owner_id=(select auth.uid())
 ));
-- No direct browser writes. Future authenticated RPC must enforce ownership,
-- advisory owner lock, row lock, request UUID replay and atomic ledger updates.

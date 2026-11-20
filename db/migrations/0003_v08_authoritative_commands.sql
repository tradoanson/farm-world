-- V0.8 STAGING ONLY. Apply AFTER 0002_v07_supabase_rls.sql on a NEW project.
-- Server-authoritative economy: only SECURITY DEFINER RPC mutates state.
-- SECURITY: do not expose service_role; enforce auth.uid() and own farm in every RPC.
create table if not exists public.farm_state (
 farm_id uuid primary key references public.player_farms(id) on delete cascade,
 coins bigint not null default 100 check (coins >= 0),
 harvested bigint not null default 0 check (harvested >= 0),
 revision bigint not null default 0 check (revision >= 0)
);
create table if not exists public.farm_plots (
 farm_id uuid not null references public.player_farms(id) on delete cascade,
 plot_index integer not null check (plot_index between 0 and 63),
 crop integer check (crop between 0 and 4),
 planted_at timestamptz,
 primary key(farm_id,plot_index),
 check ((crop is null and planted_at is null) or (crop is not null and planted_at is not null))
);
create table if not exists public.farm_commands (
 owner_id uuid not null references auth.users(id) on delete cascade,
 request_id uuid not null,
 farm_id uuid not null references public.player_farms(id) on delete cascade,
 action text not null,
 plot_index integer not null,
 crop integer,
 result jsonb not null,
 created_at timestamptz not null default now(),
 primary key(owner_id,request_id)
);
alter table public.farm_state enable row level security;
alter table public.farm_plots enable row level security;
alter table public.farm_commands enable row level security;
revoke all on public.farm_state, public.farm_plots, public.farm_commands from anon, authenticated;
grant select on public.farm_state, public.farm_plots to authenticated;
create policy "own state read" on public.farm_state for select to authenticated using (exists (select 1 from public.player_farms f where f.id=farm_id and f.owner_id=(select auth.uid())));
create policy "own plots read" on public.farm_plots for select to authenticated using (exists (select 1 from public.player_farms f where f.id=farm_id and f.owner_id=(select auth.uid())));
-- No browser INSERT/UPDATE/DELETE grants or policies.
create or replace function public.farm_apply_command(p_request_id uuid,p_action text,p_plot_index integer,p_crop integer default null)
returns jsonb
language plpgsql security definer set search_path = ''
as $$
declare
 v_owner uuid := auth.uid();
 v_farm uuid;
 v_coins bigint;
 v_harvested bigint;
 v_revision bigint;
 v_crop integer;
 v_planted timestamptz;
 v_cost integer;
 v_duration integer;
 v_result jsonb;
 v_previous public.farm_commands%rowtype;
begin
 if v_owner is null then raise exception 'authentication required' using errcode='28000'; end if;
 if p_request_id is null or p_action is null or p_action not in ('plant','harvest') or p_plot_index is null or p_plot_index not between 0 and 63
    or (p_action='plant' and (p_crop is null or p_crop not between 0 and 4))
    or (p_action='harvest' and p_crop is not null) then
   raise exception 'invalid command' using errcode='22023';
 end if;
 -- Serializes all commands per player, including repeated idempotency keys.
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(v_owner::text, 0));
 select id into v_farm from public.player_farms where owner_id=v_owner;
 if v_farm is null then raise exception 'farm not provisioned' using errcode='P0002'; end if;
 select * into v_previous from public.farm_commands where owner_id=v_owner and request_id=p_request_id;
 if found then
   if v_previous.action<>p_action or v_previous.plot_index<>p_plot_index or v_previous.crop is distinct from p_crop then
     raise exception 'idempotency key reused with different command' using errcode='23505';
   end if;
   return v_previous.result;
 end if;
 -- State and plots are written only inside the same database transaction.
 insert into public.farm_state(farm_id) values(v_farm) on conflict do nothing;
 select coins,harvested,revision into v_coins,v_harvested,v_revision from public.farm_state where farm_id=v_farm for update;
 insert into public.farm_plots(farm_id,plot_index) values(v_farm,p_plot_index) on conflict do nothing;
 select crop,planted_at into v_crop,v_planted from public.farm_plots where farm_id=v_farm and plot_index=p_plot_index for update;
 if p_action='plant' then
   if v_crop is not null then raise exception 'plot occupied' using errcode='P0001'; end if;
   v_cost := (array[1,3,5,7,10])[p_crop+1];
   if v_coins<v_cost then raise exception 'insufficient coins' using errcode='P0001'; end if;
   update public.farm_plots set crop=p_crop,planted_at=transaction_timestamp() where farm_id=v_farm and plot_index=p_plot_index;
   v_coins:=v_coins-v_cost;
 else
   if v_crop is null then raise exception 'plot empty' using errcode='P0001'; end if;
   v_duration := (array[120,300,600,900,1200])[v_crop+1];
   if v_planted + make_interval(secs=>v_duration) > transaction_timestamp() then
     raise exception 'crop not ready' using errcode='P0001';
   end if;
   v_cost := (array[1,3,5,7,10])[v_crop+1];
   update public.farm_plots set crop=null,planted_at=null where farm_id=v_farm and plot_index=p_plot_index;
   v_coins:=v_coins+v_cost*3;
   v_harvested:=v_harvested+1;
 end if;
 update public.farm_state set coins=v_coins,harvested=v_harvested,revision=v_revision+1 where farm_id=v_farm;
 v_result:=jsonb_build_object('farm_id',v_farm,'coins',v_coins,'harvested',v_harvested,'revision',v_revision+1,'plot_index',p_plot_index,'action',p_action);
 insert into public.farm_commands(owner_id,request_id,farm_id,action,plot_index,crop,result)
 values(v_owner,p_request_id,v_farm,p_action,p_plot_index,p_crop,v_result);
 return v_result;
end;
$$;
revoke all on function public.farm_apply_command(uuid,text,integer,integer) from public,anon;
grant execute on function public.farm_apply_command(uuid,text,integer,integer) to authenticated;
-- Production must review SECURITY DEFINER owner privileges and search_path before deployment.

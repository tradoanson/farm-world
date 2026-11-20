-- V2.2/V2.3 authoritative progression candidate. STAGING ONLY.
-- Generated from production function signature; no production DDL executed.
-- New farms enforce crop and plot unlocks; existing planted crops remain harvestable.
-- Warehouse capacity is checked at harvest; staging concurrency tests required.
begin;
CREATE OR REPLACE FUNCTION public.farm_apply_command(p_request_id uuid, p_action text, p_plot_index integer DEFAULT NULL::integer, p_crop integer DEFAULT NULL::integer, p_quantity integer DEFAULT NULL::integer, p_quest integer DEFAULT NULL::integer)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
 v_owner uuid := (select auth.uid()); v_farm uuid; v_coins bigint; v_harvested bigint; v_revision bigint; v_xp bigint; v_sold bigint;
 v_crop integer; v_planted timestamptz; v_cost integer; v_duration integer; v_stock bigint; v_reward integer; v_target bigint;
 v_result jsonb; v_prev public.farm_commands%rowtype; v_level integer; v_warehouse_level integer; v_inventory_total bigint;
begin
 if v_owner is null then raise exception 'authentication required' using errcode='28000'; end if;
 if p_request_id is null or p_action is null or p_action not in ('plant','harvest','sell','claim')
 or (p_action in ('plant','harvest') and (p_plot_index is null or p_plot_index not between 0 and 63 or p_quantity is not null or p_quest is not null))
 or (p_action='plant' and (p_crop is null or p_crop not between 0 and 4))
 or (p_action='harvest' and p_crop is not null)
 or (p_action='sell' and (p_plot_index is not null or p_quest is not null or p_crop is null or p_crop not between 0 and 4 or p_quantity is null or p_quantity not between 1 and 100000))
 or (p_action='claim' and (p_plot_index is not null or p_crop is not null or p_quantity is not null or p_quest is null or p_quest not between 0 and 2))
 then raise exception 'invalid command' using errcode='22023'; end if;
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(v_owner::text,0));
 select id into v_farm from public.player_farms where owner_id=v_owner;
 if v_farm is null then raise exception 'farm not provisioned' using errcode='P0002'; end if;
 select * into v_prev from public.farm_commands where owner_id=v_owner and request_id=p_request_id;
 if found then
  if v_prev.action<>p_action or v_prev.plot_index is distinct from p_plot_index or v_prev.crop is distinct from p_crop or v_prev.quantity is distinct from p_quantity or v_prev.quest is distinct from p_quest then
   raise exception 'request id reused with different payload' using errcode='23505';
  end if;
  return v_prev.result;
 end if;
 select coins,harvested,revision,xp,sold into v_coins,v_harvested,v_revision,v_xp,v_sold from public.farm_state where farm_id=v_farm for update;
 if not found then raise exception 'farm state missing' using errcode='P0002'; end if;
 v_level:=pg_catalog.floor(pg_catalog.sqrt(v_xp::numeric/25))::integer+1;
 if p_action='plant' then
  if p_plot_index>=pg_catalog.least(64,16+((v_level-1)/2)*4) then
   raise exception 'plot locked by level' using errcode='P0001';
  end if;
  if v_level<(array[1,2,3,5,8])[p_crop+1] then
   raise exception 'crop locked by level' using errcode='P0001';
  end if;
 end if;
 if p_action in ('plant','harvest') then
  insert into public.farm_plots(farm_id,plot_index) values(v_farm,p_plot_index) on conflict do nothing;
  select crop,planted_at into v_crop,v_planted from public.farm_plots where farm_id=v_farm and plot_index=p_plot_index for update;
 end if;
 if p_action='plant' then
  if v_crop is not null then raise exception 'plot occupied' using errcode='P0001'; end if;
  v_cost:=(array[1,3,5,7,10])[p_crop+1];
  if v_coins<v_cost then raise exception 'insufficient coins' using errcode='P0001'; end if;
  update public.farm_plots set crop=p_crop,planted_at=pg_catalog.transaction_timestamp() where farm_id=v_farm and plot_index=p_plot_index;
  v_coins:=v_coins-v_cost;
 elsif p_action='harvest' then
  if v_crop is null then raise exception 'plot empty' using errcode='P0001'; end if;
  v_duration:=(array[120,300,600,900,1200])[v_crop+1];
  if v_planted+pg_catalog.make_interval(secs=>v_duration)>pg_catalog.transaction_timestamp() then raise exception 'crop not ready' using errcode='P0001'; end if;
  select warehouse_level into v_warehouse_level from public.farm_upgrades where farm_id=v_farm;
  select coalesce(sum(quantity),0) into v_inventory_total from public.farm_inventory where farm_id=v_farm;
  if v_inventory_total>=40+20*coalesce(v_warehouse_level,0) then
   raise exception 'warehouse full' using errcode='P0001';
  end if;
  update public.farm_plots set crop=null,planted_at=null where farm_id=v_farm and plot_index=p_plot_index;
  insert into public.farm_inventory(farm_id,crop,quantity) values(v_farm,v_crop,1) on conflict(farm_id,crop) do update set quantity=public.farm_inventory.quantity+1;
  v_harvested:=v_harvested+1; v_xp:=v_xp+5+v_crop*2;
 elsif p_action='sell' then
  select quantity into v_stock from public.farm_inventory where farm_id=v_farm and crop=p_crop for update;
  if coalesce(v_stock,0)<p_quantity then raise exception 'insufficient inventory' using errcode='P0001'; end if;
  v_cost:=(array[1,3,5,7,10])[p_crop+1];
  if v_coins>9223372036854775807::bigint-(v_cost*3::bigint*p_quantity) then raise exception 'coin overflow' using errcode='22003'; end if;
  update public.farm_inventory set quantity=quantity-p_quantity where farm_id=v_farm and crop=p_crop;
  v_coins:=v_coins+v_cost*3::bigint*p_quantity; v_sold:=v_sold+p_quantity;
 else
  if exists(select 1 from public.farm_quests where farm_id=v_farm and quest=p_quest) then raise exception 'quest already claimed' using errcode='P0001'; end if;
  v_reward:=(array[20,35,50])[p_quest+1];
  v_target:=case p_quest when 0 then v_harvested when 1 then v_sold else floor(sqrt(v_xp::numeric/25))::bigint+1 end;
  if v_target<(array[5,10,3])[p_quest+1] then raise exception 'quest incomplete' using errcode='P0001'; end if;
  insert into public.farm_quests(farm_id,quest) values(v_farm,p_quest);
  v_coins:=v_coins+v_reward;
 end if;
 update public.farm_state set coins=v_coins,harvested=v_harvested,revision=v_revision+1,xp=v_xp,sold=v_sold where farm_id=v_farm;
 v_result:=pg_catalog.jsonb_build_object('farm_id',v_farm,'coins',v_coins,'harvested',v_harvested,'revision',v_revision+1,'xp',v_xp,'sold',v_sold,'action',p_action);
 insert into public.farm_commands(owner_id,request_id,farm_id,action,plot_index,crop,quantity,quest,result) values(v_owner,p_request_id,v_farm,p_action,p_plot_index,p_crop,p_quantity,p_quest,v_result);
 return v_result;
end; $function$

commit;

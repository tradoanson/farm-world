-- V2.4 read-only public farm visits. STAGING ONLY.
-- Only aggregate information is exposed, never plot locations, private inventory or email.
begin;
create or replace function public.farm_public_visit(p_owner uuid)
returns jsonb language plpgsql stable security definer set search_path='' as $$
declare v_viewer uuid:=auth.uid();v_name text;v_farm uuid;v_level integer;v_harvested bigint;v_sold bigint;
begin
 if v_viewer is null or p_owner is null then raise exception 'Authentication required';end if;
 if exists(select 1 from public.farm_blocks b where
 (b.blocker_id=p_owner and b.blocked_id=v_viewer)
 or (b.blocker_id=v_viewer and b.blocked_id=p_owner))
 then raise exception 'Profile unavailable';end if;
 select p.display_name,f.id into v_name,v_farm from public.farm_public_profiles p
 join public.player_farms f on f.owner_id=p.owner_id
 where p.owner_id=p_owner and p.visible=true;
 if v_farm is null then raise exception 'Profile unavailable';end if;
 select pg_catalog.floor(pg_catalog.sqrt(xp::numeric/25))::integer+1,harvested,sold
 into v_level,v_harvested,v_sold from public.farm_state where farm_id=v_farm;
 return pg_catalog.jsonb_build_object('owner_id',p_owner,'display_name',v_name,
 'level',coalesce(v_level,1),'harvested',coalesce(v_harvested,0),'sold',coalesce(v_sold,0));
end $$;
revoke all on function public.farm_public_visit(uuid) from public,anon;
grant execute on function public.farm_public_visit(uuid) to authenticated;
commit;

-- V2.7 seasonal community: UTC calendar-month season, harvest command journal as authority.
begin;
create table if not exists public.farm_season_rewards (
 owner_id uuid not null references auth.users(id) on delete cascade,
 season_start date not null,
 reward_coins integer not null check(reward_coins between 1 and 25),
 created_at timestamptz not null default now(),
 primary key(owner_id,season_start)
);
alter table public.farm_season_rewards enable row level security;
revoke all on public.farm_season_rewards from public,anon,authenticated;
create or replace function public.farm_season_leaderboard()
returns table(display_name text,harvests bigint,rank bigint,season_start date)
language sql stable security definer set search_path='' as $$
 with season as (select date_trunc('month',now() at time zone 'utc')::date as start_date),
 scores as (
 select p.owner_id,p.display_name,count(c.request_id)::bigint as harvests,p.updated_at
 from public.farm_public_profiles p
 cross join season z
 left join public.farm_commands c on c.owner_id=p.owner_id and c.action='harvest'
 and c.created_at>=z.start_date::timestamp at time zone 'UTC'
 and c.created_at<(z.start_date+interval '1 month')::timestamp at time zone 'UTC'
 where p.visible=true and p.display_name !~* '(fuck|shit|địt|đụ|cặc)'
 group by p.owner_id,p.display_name,p.updated_at
 )
 select s.display_name,s.harvests,row_number() over(order by s.harvests desc,s.updated_at asc,s.owner_id) as rank,z.start_date
 from scores s cross join season z where auth.uid() is not null
 order by s.harvests desc,s.updated_at asc,s.owner_id limit 50;
$$;
revoke all on function public.farm_season_leaderboard() from public,anon;
grant execute on function public.farm_season_leaderboard() to authenticated;
create or replace function public.farm_season_claim()
returns jsonb language plpgsql security definer set search_path='' as $$
declare v_user uuid:=auth.uid();v_farm uuid;v_season date;v_count bigint;v_reward integer:=25;
begin
 if v_user is null then raise exception 'Authentication required';end if;
 v_season:=date_trunc('month',now() at time zone 'utc')::date;
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(v_user::text,0));
 select id into v_farm from public.player_farms where owner_id=v_user;
 if v_farm is null then raise exception 'Farm not found';end if;
 if not exists(select 1 from public.farm_public_profiles where owner_id=v_user and visible=true) then raise exception 'Community opt-in required';end if;
 if exists(select 1 from public.farm_season_rewards where owner_id=v_user and season_start=v_season) then
  return jsonb_build_object('status','already_claimed','season',v_season,'coins',v_reward);
 end if;
 select count(*) into v_count from public.farm_commands
 where owner_id=v_user and action='harvest'
 and created_at>=v_season::timestamp at time zone 'UTC'
 and created_at<(v_season+interval '1 month')::timestamp at time zone 'UTC';
 if v_count<10 then raise exception 'Need 10 harvests this season';end if;
 insert into public.farm_season_rewards(owner_id,season_start,reward_coins) values(v_user,v_season,v_reward);
 update public.farm_state set coins=coins+v_reward,revision=revision+1 where farm_id=v_farm;
 if not found then raise exception 'Farm state unavailable';end if;
 return jsonb_build_object('status','claimed','season',v_season,'coins',v_reward);
end $$;
revoke all on function public.farm_season_claim() from public,anon;
grant execute on function public.farm_season_claim() to authenticated;
commit;

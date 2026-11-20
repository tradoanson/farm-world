-- V2.6 marketplace candidate. STAGING ONLY. Never run on live data without backup and integration tests.
-- One listing escrows inventory. Purchase transfers coins and inventory atomically.
begin;
create table if not exists public.farm_market_listings (
 id uuid primary key default gen_random_uuid(),
 seller_id uuid not null references auth.users(id) on delete cascade,
 seller_farm uuid not null references public.player_farms(id) on delete cascade,
 crop integer not null check (crop between 0 and 4),
 quantity integer not null check (quantity between 1 and 10000),
 price_each integer not null check (price_each between 1 and 100000),
 status text not null default 'open' check (status in ('open','sold','cancelled')),
 buyer_id uuid references auth.users(id),
 created_at timestamptz not null default now(),
 closed_at timestamptz,
 check ((status='sold' and buyer_id is not null) or (status<>'sold' and buyer_id is null))
);
create index if not exists farm_market_open_idx on public.farm_market_listings(created_at desc) where status='open';
create table if not exists public.farm_market_purchases (
 buyer_id uuid not null references auth.users(id) on delete cascade,
 request_id uuid not null,
 listing_id uuid not null references public.farm_market_listings(id),
 result jsonb not null,
 created_at timestamptz not null default now(),
 primary key(buyer_id,request_id),
 unique(listing_id)
);
alter table public.farm_market_listings enable row level security;
alter table public.farm_market_purchases enable row level security;
revoke all on public.farm_market_listings,public.farm_market_purchases from anon,authenticated;
grant select on public.farm_market_listings to authenticated;
create policy "open market or participant" on public.farm_market_listings for select to authenticated
 using (status='open' or seller_id=(select auth.uid()) or buyer_id=(select auth.uid()));
-- Purchase journal has no direct client access.
create or replace function public.farm_market_list(p_crop integer,p_quantity integer,p_price_each integer)
returns uuid language plpgsql security definer set search_path='' as $$
declare v_user uuid:=auth.uid();v_farm uuid;v_stock bigint;v_id uuid;
begin
 if v_user is null then raise exception 'Authentication required';end if;
 if p_crop not between 0 and 4 or p_quantity not between 1 and 10000 or p_price_each not between 1 and 100000
 then raise exception 'Invalid listing';end if;
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(v_user::text,0));
 select id into v_farm from public.player_farms where owner_id=v_user;
 if v_farm is null then raise exception 'Farm not found';end if;
 select quantity into v_stock from public.farm_inventory where farm_id=v_farm and crop=p_crop for update;
 if coalesce(v_stock,0)<p_quantity then raise exception 'Insufficient inventory';end if;
 update public.farm_inventory set quantity=quantity-p_quantity where farm_id=v_farm and crop=p_crop;
 insert into public.farm_market_listings(seller_id,seller_farm,crop,quantity,price_each)
 values(v_user,v_farm,p_crop,p_quantity,p_price_each) returning id into v_id;
 return v_id;
end $$;
revoke all on function public.farm_market_list(integer,integer,integer) from public,anon;
grant execute on function public.farm_market_list(integer,integer,integer) to authenticated;

create or replace function public.farm_market_buy(p_listing uuid,p_request uuid)
returns jsonb language plpgsql security definer set search_path='' as $$
declare v_user uuid:=auth.uid();v_listing public.farm_market_listings%rowtype;
v_buyer_farm uuid;v_total bigint;v_coins bigint;v_prior public.farm_market_purchases%rowtype;v_result jsonb;
begin
 if v_user is null or p_listing is null or p_request is null then raise exception 'Invalid purchase';end if;
 -- Serialize retries by buyer before checking idempotency.
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(v_user::text,0));
 select * into v_prior from public.farm_market_purchases where buyer_id=v_user and request_id=p_request;
 if found then
  if v_prior.listing_id<>p_listing then raise exception 'Request key reused';end if;
  return v_prior.result;
 end if;
 select * into v_listing from public.farm_market_listings where id=p_listing for update;
 if not found or v_listing.status<>'open' or v_listing.seller_id=v_user then raise exception 'Listing unavailable';end if;
 select id into v_buyer_farm from public.player_farms where owner_id=v_user;
 if v_buyer_farm is null then raise exception 'Farm not found';end if;
 v_total:=v_listing.quantity::bigint*v_listing.price_each::bigint;
 -- Atomic balance debit: prevents overspending under concurrent operations.
 update public.farm_state set coins=coins-v_total,revision=revision+1
 where farm_id=v_buyer_farm and coins>=v_total returning coins into v_coins;
 if not found then raise exception 'Insufficient coins';end if;
 update public.farm_state set coins=coins+v_total,revision=revision+1 where farm_id=v_listing.seller_farm;
 if not found then raise exception 'Seller farm unavailable';end if;
 insert into public.farm_inventory(farm_id,crop,quantity) values(v_buyer_farm,v_listing.crop,v_listing.quantity)
 on conflict(farm_id,crop) do update set quantity=public.farm_inventory.quantity+excluded.quantity;
 update public.farm_market_listings set status='sold',buyer_id=v_user,closed_at=now() where id=p_listing;
 v_result:=jsonb_build_object('listing_id',p_listing,'buyer_id',v_user,'crop',v_listing.crop,'quantity',v_listing.quantity,'total',v_total);
 insert into public.farm_market_purchases(buyer_id,request_id,listing_id,result) values(v_user,p_request,p_listing,v_result);
 return v_result;
end $$;
revoke all on function public.farm_market_buy(uuid,uuid) from public,anon;
grant execute on function public.farm_market_buy(uuid,uuid) to authenticated;

create or replace function public.farm_market_cancel(p_listing uuid)
returns boolean language plpgsql security definer set search_path='' as $$
declare v_user uuid:=auth.uid();v_listing public.farm_market_listings%rowtype;
begin
 if v_user is null then raise exception 'Authentication required';end if;
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(v_user::text,0));
 select * into v_listing from public.farm_market_listings where id=p_listing for update;
 if not found or v_listing.seller_id<>v_user or v_listing.status<>'open' then raise exception 'Listing unavailable';end if;
 insert into public.farm_inventory(farm_id,crop,quantity) values(v_listing.seller_farm,v_listing.crop,v_listing.quantity)
 on conflict(farm_id,crop) do update set quantity=public.farm_inventory.quantity+excluded.quantity;
 update public.farm_market_listings set status='cancelled',closed_at=now() where id=p_listing;
 return true;
end $$;
revoke all on function public.farm_market_cancel(uuid) from public,anon;
grant execute on function public.farm_market_cancel(uuid) to authenticated;
commit;

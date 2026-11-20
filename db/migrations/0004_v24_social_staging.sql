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
-- All writes are denied until authenticated RPCs enforce block checks and transitions.
-- Do not allow direct UPDATE: accepting requests requires a server-side RPC with state transition checks.
revoke insert,update,delete on public.farm_friend_requests from authenticated;
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

-- Mutations are RPC-only: identity is derived from auth.uid(), never from caller-provided sender.
create or replace function public.farm_friend_request(p_receiver uuid)
returns uuid language plpgsql security definer set search_path = '' as $
declare v_sender uuid := auth.uid(); v_id uuid;
begin
 if v_sender is null or p_receiver is null or v_sender = p_receiver then raise exception 'Invalid friend request'; end if;
 if not exists(select 1 from public.player_farms where owner_id=v_sender) then raise exception 'Sender farm not found'; end if;
 if not exists (select 1 from public.farm_public_profiles p where p.owner_id=p_receiver and p.visible=true)
 then raise exception 'Receiver has no public profile'; end if;
 if exists (select 1 from public.farm_blocks b where
   (b.blocker_id=v_sender and b.blocked_id=p_receiver)
   or (b.blocker_id=p_receiver and b.blocked_id=v_sender))
 then raise exception 'Friend request unavailable'; end if;
 insert into public.farm_friend_requests(sender_id,receiver_id,status)
 values(v_sender,p_receiver,'pending')
 on conflict(sender_id,receiver_id) do update
 set status='pending',updated_at=now()
 where public.farm_friend_requests.status in ('declined','cancelled')
 returning id into v_id;
 if v_id is null then raise exception 'Request already exists'; end if;
 return v_id;
end $;
revoke all on function public.farm_friend_request(uuid) from public,anon;
grant execute on function public.farm_friend_request(uuid) to authenticated;

create or replace function public.farm_friend_respond(p_request uuid,p_accept boolean)
returns text language plpgsql security definer set search_path = '' as $
declare v_user uuid:=auth.uid(); v_sender uuid; v_receiver uuid; v_status text;
begin
 if v_user is null or p_request is null or p_accept is null then raise exception 'Invalid friend response'; end if;
 select sender_id,receiver_id,status into v_sender,v_receiver,v_status
 from public.farm_friend_requests where id=p_request for update;
 if not found or v_receiver<>v_user or v_status<>'pending' then raise exception 'Request unavailable'; end if;
 if exists (select 1 from public.farm_blocks b where
 (b.blocker_id=v_sender and b.blocked_id=v_receiver)
 or (b.blocker_id=v_receiver and b.blocked_id=v_sender))
 then raise exception 'Blocked relationship'; end if;
 update public.farm_friend_requests set status=case when p_accept then 'accepted' else 'declined' end,updated_at=now()
 where id=p_request;
 return case when p_accept then 'accepted' else 'declined' end;
end $;
revoke all on function public.farm_friend_respond(uuid,boolean) from public,anon;
grant execute on function public.farm_friend_respond(uuid,boolean) to authenticated;
commit;

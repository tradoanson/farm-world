\set ON_ERROR_STOP on
SET ROLE authenticated;
SELECT set_config('request.jwt.claim.sub','123e4567-e89b-42d3-a456-426614174000',false);
DO $$ BEGIN
 IF has_function_privilege('anon','public.farm_friend_request(uuid)','EXECUTE') THEN RAISE EXCEPTION 'anon can request'; END IF;
 IF has_function_privilege('anon','public.farm_public_visit(uuid)','EXECUTE') THEN RAISE EXCEPTION 'anon can visit'; END IF;
 IF has_table_privilege('authenticated','public.farm_friend_requests','INSERT') THEN RAISE EXCEPTION 'direct insert allowed'; END IF;
END $$;
SELECT public.farm_friend_request('123e4567-e89b-42d3-a456-426614174001');
DO $$ BEGIN
 IF (SELECT count(*) FROM public.farm_friend_requests) <> 1 THEN RAISE EXCEPTION 'sender cannot see own request'; END IF;
 BEGIN
  PERFORM public.farm_friend_request('123e4567-e89b-42d3-a456-426614174001');
  RAISE EXCEPTION 'duplicate request allowed';
 EXCEPTION WHEN OTHERS THEN IF SQLERRM='duplicate request allowed' THEN RAISE; END IF; END;
 BEGIN
  PERFORM public.farm_friend_request('123e4567-e89b-42d3-a456-426614174000');
  RAISE EXCEPTION 'self request allowed';
 EXCEPTION WHEN OTHERS THEN IF SQLERRM='self request allowed' THEN RAISE; END IF; END;
 BEGIN
  PERFORM public.farm_friend_request('123e4567-e89b-42d3-a456-426614174002');
  RAISE EXCEPTION 'hidden request allowed';
 EXCEPTION WHEN OTHERS THEN IF SQLERRM='hidden request allowed' THEN RAISE; END IF; END;
 BEGIN
  PERFORM public.farm_friend_respond((SELECT id FROM public.farm_friend_requests LIMIT 1),true);
  RAISE EXCEPTION 'sender accepted own request';
 EXCEPTION WHEN OTHERS THEN IF SQLERRM='sender accepted own request' THEN RAISE; END IF; END;
 IF (public.farm_public_visit('123e4567-e89b-42d3-a456-426614174001')->>'display_name') <> 'Bob' THEN RAISE EXCEPTION 'public visit failed'; END IF;
 IF public.farm_public_visit('123e4567-e89b-42d3-a456-426614174001') ? 'inventory' THEN RAISE EXCEPTION 'private data exposed'; END IF;
END $$;
SELECT set_config('request.jwt.claim.sub','123e4567-e89b-42d3-a456-426614174001',false);
DO $$ DECLARE req uuid; BEGIN
 SELECT id INTO req FROM public.farm_friend_requests LIMIT 1;
 IF public.farm_friend_respond(req,true) <> 'accepted' THEN RAISE EXCEPTION 'accept failed'; END IF;
 BEGIN
  PERFORM public.farm_friend_respond(req,false);
  RAISE EXCEPTION 'repeat response allowed';
 EXCEPTION WHEN OTHERS THEN IF SQLERRM='repeat response allowed' THEN RAISE; END IF; END;
END $$;
INSERT INTO public.farm_blocks(blocker_id,blocked_id) VALUES ('123e4567-e89b-42d3-a456-426614174001','123e4567-e89b-42d3-a456-426614174000');
SELECT set_config('request.jwt.claim.sub','123e4567-e89b-42d3-a456-426614174000',false);
DO $$ BEGIN
 BEGIN
  PERFORM public.farm_public_visit('123e4567-e89b-42d3-a456-426614174001');
  RAISE EXCEPTION 'blocked visit allowed';
 EXCEPTION WHEN OTHERS THEN IF SQLERRM='blocked visit allowed' THEN RAISE; END IF; END;
 BEGIN
  PERFORM public.farm_friend_request('123e4567-e89b-42d3-a456-426614174001');
  RAISE EXCEPTION 'blocked request allowed';
 EXCEPTION WHEN OTHERS THEN IF SQLERRM='blocked request allowed' THEN RAISE; END IF; END;
 IF (SELECT count(*) FROM public.farm_blocks) <> 0 THEN RAISE EXCEPTION 'block privacy failed'; END IF;
END $$;
RESET ROLE;

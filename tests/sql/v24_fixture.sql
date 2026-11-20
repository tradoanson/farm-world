\set ON_ERROR_STOP on
CREATE ROLE authenticated NOLOGIN;
CREATE ROLE anon NOLOGIN;
CREATE SCHEMA auth;
CREATE TABLE auth.users(id uuid PRIMARY KEY);
CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$ SELECT nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
CREATE TABLE public.player_farms(id uuid PRIMARY KEY, owner_id uuid NOT NULL REFERENCES auth.users(id));
CREATE TABLE public.farm_public_profiles(owner_id uuid PRIMARY KEY REFERENCES auth.users(id), display_name text NOT NULL, visible boolean NOT NULL);
CREATE TABLE public.farm_state(farm_id uuid PRIMARY KEY REFERENCES public.player_farms(id), xp bigint NOT NULL DEFAULT 0, harvested bigint NOT NULL DEFAULT 0, sold bigint NOT NULL DEFAULT 0);
INSERT INTO auth.users(id) VALUES ('123e4567-e89b-42d3-a456-426614174000'),('123e4567-e89b-42d3-a456-426614174001'),('123e4567-e89b-42d3-a456-426614174002');
INSERT INTO public.player_farms(id,owner_id) VALUES ('223e4567-e89b-42d3-a456-426614174000','123e4567-e89b-42d3-a456-426614174000'),('223e4567-e89b-42d3-a456-426614174001','123e4567-e89b-42d3-a456-426614174001');
INSERT INTO public.farm_public_profiles(owner_id,display_name,visible) VALUES ('123e4567-e89b-42d3-a456-426614174000','Alice',true),('123e4567-e89b-42d3-a456-426614174001','Bob',true),('123e4567-e89b-42d3-a456-426614174002','Hidden',false);
INSERT INTO public.farm_state(farm_id,xp,harvested,sold) VALUES ('223e4567-e89b-42d3-a456-426614174000',100,4,2),('223e4567-e89b-42d3-a456-426614174001',225,8,3);
GRANT USAGE ON SCHEMA public,auth TO authenticated,anon;
GRANT SELECT ON public.player_farms,public.farm_public_profiles,public.farm_state TO authenticated;

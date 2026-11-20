import {describe,it,expect} from 'vitest';
import {readFileSync,readdirSync} from 'node:fs';
const files=readdirSync('db/migrations').filter(x=>x.endsWith('.sql')).sort();
const migrations=files.map(x=>readFileSync('db/migrations/'+x,'utf8'));
const all=migrations.join('\n');
describe('V2.9 release regression gates',()=>{
 it('keeps additive migration history with unique names',()=>{expect(new Set(files).size).toBe(files.length);expect(files.length).toBeGreaterThanOrEqual(6);expect(all.toLowerCase()).not.toMatch(/drop\s+table\s+(?:if\s+exists\s+)?(?:public\.)?(?:player_farms|farm_state|farm_inventory)/);});
 it('protects all transactional tables with RLS',()=>{for(const table of ['farm_market_listings','farm_market_purchases','farm_market_mutations','farm_season_rewards'])expect(all).toContain('alter table public.'+table+' enable row level security');});
 it('guards marketplace retries by request UUID',()=>{expect(all).toContain('primary key(buyer_id,request_id)');expect(all).toContain('primary key(actor_id,request_id)');expect(all).toContain('unique(listing_id)');});
 it('limits seasonal rewards to one per month',()=>{expect(all).toContain('primary key(owner_id,season_start)');expect(all).toContain('pg_advisory_xact_lock');});
 it('never embeds privileged Supabase credentials in client source',()=>{for(const path of ['app/page.tsx','app/marketplace.tsx']){const src=readFileSync(path,'utf8');expect(src).not.toMatch(/service_role|SUPABASE_SECRET_KEY|SUPABASE_SERVICE_ROLE_KEY/);}});
});

import {describe,it,expect} from 'vitest';
import {readFileSync} from 'node:fs';
import {join} from 'node:path';
const sql=(name:string)=>readFileSync(join(process.cwd(),'db','migrations',name),'utf8');
describe('V2.2–V2.9 migration release safety checks',()=>{
 it('all candidate migrations are explicitly staging only',()=>{
  for(const name of ['0004_v24_social_staging.sql','0005_v26_marketplace_staging.sql','0006_v27_seasons_staging.sql','0007_v24_public_visits_staging.sql','0008_v22_v23_progression_staging.sql']){
   const source=sql(name);expect(source.toLowerCase()).toContain('staging');
   expect(source).not.toMatch(/\b(drop\s+table|truncate\s+table|delete\s+from\s+public\.farm_state)\b/i);
  }
 });
 it('marketplace transactions are server authoritative, idempotent and restricted',()=>{
  const source=sql('0005_v26_marketplace_staging.sql');
  expect(source).toContain('security definer');
  expect(source).toContain('farm_market_purchases');
  expect(source).toContain('primary key(buyer_id,request_id)');
  expect(source).toContain('unique(listing_id)');
  expect(source).toContain('for update');
  expect(source).toContain('v_listing.seller_id=v_user');
  expect(source).toContain('coins>=v_total');
  expect(source).toContain('grant execute on function public.farm_market_buy(uuid,uuid) to authenticated');
 });
 it('season activation snapshots baseline and rejects client access',()=>{
  const source=sql('0006_v27_seasons_staging.sql');
  expect(source).toContain('farm_season_activate');
  expect(source).toContain('baseline_harvests=(select coalesce(sum(harvested),0)');
  expect(source).toContain("auth.uid() is not null");
  expect(source).toContain('revoke all on function public.farm_season_activate(uuid) from public,anon,authenticated');
 });
 it('social visit never returns private farm state or inventory',()=>{
  const source=sql('0007_v24_public_visits_staging.sql');
  expect(source).toContain('p.visible=true');
  expect(source).toContain('farm_blocks');
  expect(source).not.toContain('farm_inventory');
  expect(source).toContain('revoke all on function public.farm_public_visit(uuid) from public,anon');
 });
 it('authoritative planting and warehouse rules are enforced in RPC',()=>{
  const source=sql('0008_v22_v23_progression_staging.sql');
  expect(source).toContain('plot locked by level');
  expect(source).toContain('crop locked by level');
  expect(source).toContain('warehouse full');
  expect(source).toContain('v_inventory_total');
 });
});

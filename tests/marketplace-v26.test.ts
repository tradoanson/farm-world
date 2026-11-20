import {describe,it,expect} from 'vitest';
import {readFileSync} from 'node:fs';
const sql=readFileSync('db/migrations/0005_v26_marketplace_staging.sql','utf8');
describe('V2.6 marketplace migration contract',()=>{
 it('uses idempotent buyer purchase journal and locks listing',()=>{
  expect(sql).toContain('primary key(buyer_id,request_id)');
  expect(sql).toContain('unique(listing_id)');
  expect(sql).toContain('where id=p_listing for update');
  expect(sql).toContain('v_prior.listing_id<>p_listing');
 });
 it('makes listing and cancellation retries idempotent',()=>{
  expect(sql).toContain('primary key(actor_id,request_id)');
  expect(sql).toContain('v_prior.kind<>\'list\'');
  expect(sql).toContain('v_prior.kind<>\'cancel\'');
  expect(sql).toContain('farm_market_list(integer,integer,integer,uuid)');
  expect(sql).toContain('farm_market_cancel(uuid,uuid)');
 });
 it('restricts SQL execution to authenticated users and protects storage',()=>{
  expect(sql).toContain('grant execute on function public.farm_market_buy(uuid,uuid) to authenticated');
  expect(sql).toContain('grant execute on function public.farm_market_cancel(uuid,uuid) to authenticated');
  expect(sql).toContain('Buyer warehouse full');
  expect(sql).toContain('seller_id=v_user');
  expect(sql).toContain('enable row level security');
 });
});

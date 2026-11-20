import {describe,it,expect} from 'vitest';
import {reconcileSnapshot} from '../lib/farm-realtime';
import type {OnlineSnapshot} from '../lib/farm-online';
const sample=(revision:number,farmId='123e4567-e89b-42d3-a456-426614174000'):OnlineSnapshot=>({farmId,revision,coins:10,harvested:0,xp:0,sold:0,plots:[],inventory:[0,0,0,0,0],claimed:[]});
describe('V2.5 snapshot reconciliation',()=>{
 it('accepts first valid snapshot',()=>expect(reconcileSnapshot(null,sample(1))?.revision).toBe(1));
 it('rejects stale polling responses',()=>expect(reconcileSnapshot(sample(5),sample(4))?.revision).toBe(5));
 it('accepts newer revision',()=>expect(reconcileSnapshot(sample(5),sample(6))?.revision).toBe(6));
 it('allows same revision refresh',()=>expect(reconcileSnapshot(sample(5),sample(5))?.revision).toBe(5));
 it('ignores different farm snapshots',()=>expect(reconcileSnapshot(sample(5),sample(6,'123e4567-e89b-42d3-a456-426614174001'))?.revision).toBe(5));
 it('keeps last confirmed state on failed refresh',()=>expect(reconcileSnapshot(sample(5),null)?.revision).toBe(5));
});

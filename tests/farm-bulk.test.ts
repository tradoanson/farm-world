import {describe,it,expect} from 'vitest';
import {bulkPlan,plantEstimate} from '../lib/farm-bulk';
import type {OnlineSnapshot} from '../lib/farm-online';
const base:OnlineSnapshot={farmId:'test',coins:10,harvested:0,revision:0,xp:0,sold:0,plots:[],inventory:[0,0,0,0,0],claimed:[]};
describe('V1.1 online bulk planner',()=>{
 it('plants only affordable empty plots',()=>{
  const s={...base,coins:10,plots:[{index:0,crop:0,plantedAt:new Date(0).toISOString()}]};
  expect(bulkPlan(s,'plant',1,0)).toEqual([1,2,3]);
  expect(plantEstimate(s,1)).toEqual({empty:63,affordable:3,totalCost:189,missing:179});
 });
 it('never overspends and handles no coins',()=>expect(bulkPlan({...base,coins:0},'plant',4,0)).toEqual([]));
 it('harvests only mature plots, not immature ones',()=>{
  const s={...base,plots:[{index:0,crop:0,plantedAt:new Date(0).toISOString()},{index:1,crop:1,plantedAt:new Date(100000).toISOString()}]};
  expect(bulkPlan(s,'harvest',0,200000)).toEqual([0]);
 });
 it('never includes occupied plots in planting',()=>{
  const s={...base,coins:100,plots:[{index:2,crop:0,plantedAt:new Date(0).toISOString()}]};
  expect(bulkPlan(s,'plant',0,0)).not.toContain(2);
 });
 it('rejects invalid crop indices',()=>expect(bulkPlan(base,'plant',99,0)).toEqual([]));
});

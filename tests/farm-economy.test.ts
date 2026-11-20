import {describe,it,expect} from 'vitest';
import {cropEconomics,economyOverview,farmLevel} from '../lib/farm-economy';
import type {OnlineSnapshot} from '../lib/farm-online';
const farm:OnlineSnapshot={farmId:'test',coins:0,harvested:0,revision:0,xp:0,sold:0,plots:[],inventory:[2,1,0,0,0],claimed:[]};
describe('V1.3 online economy',()=>{
 it('computes sale proceeds from server inventory',()=>expect(economyOverview(farm)).toEqual({inventoryValue:15,stock:3,coins:0,canPlant:false,availableAfterSale:15}));
 it('shows seed margin and time',()=>expect(cropEconomics(1)).toEqual({seedCost:3,sellPrice:9,profit:6,growthMinutes:5}));
 it('handles invalid crop',()=>expect(cropEconomics(99)).toBeNull());
 it('computes levels from XP',()=>{expect(farmLevel(0)).toBe(1);expect(farmLevel(100)).toBe(3);});
});

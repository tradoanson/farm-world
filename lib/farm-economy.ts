import {CROPS} from './farm-demo';
import type {OnlineSnapshot} from './farm-online';
export const farmLevel=(xp:number)=>Math.floor(Math.sqrt(xp/25))+1;
export function economyOverview(snapshot:OnlineSnapshot|null){
 const inventoryValue=snapshot?.inventory.reduce((sum,q,i)=>sum+q*CROPS[i].cost*3,0)??0;
 const stock=snapshot?.inventory.reduce((sum,q)=>sum+q,0)??0;
 const coins=snapshot?.coins??0;
 const cheapest=CROPS[0].cost;
 return {inventoryValue,stock,coins,canPlant:coins>=cheapest,availableAfterSale:coins+inventoryValue};
}
export function cropEconomics(crop:number){
 const c=CROPS[crop];
 if(!c)return null;
 return {seedCost:c.cost,sellPrice:c.cost*3,profit:c.cost*2,growthMinutes:c.seconds/60};
}

import {CROPS} from './farm-demo';
import type {OnlineSnapshot} from './farm-online';
export function bulkPlan(snapshot:OnlineSnapshot,action:'plant'|'harvest',crop:number,now:number):number[]{
 if(!Number.isInteger(crop)||crop<0||crop>=CROPS.length)return [];
 const occupied=new Map(snapshot.plots.map(p=>[p.index,p]));
 const targets=Array.from({length:64},(_,i)=>i).filter(i=>{
  const p=occupied.get(i);
  if(action==='plant')return p?.crop==null;
  return p?.crop!=null&&!!p.plantedAt&&now-Date.parse(p.plantedAt)>=CROPS[p.crop].seconds*1000;
 });
 return action==='plant'?targets.slice(0,Math.floor(snapshot.coins/CROPS[crop].cost)):targets;
}
export function plantEstimate(snapshot:OnlineSnapshot|null,crop:number){
 if(!snapshot||!Number.isInteger(crop)||crop<0||crop>=CROPS.length)return {empty:0,affordable:0,totalCost:0,missing:0};
 const occupied=snapshot.plots.filter(p=>p.crop!==null).length;
 const empty=64-occupied;
 const cost=CROPS[crop].cost;
 return {empty,affordable:Math.min(empty,Math.floor(snapshot.coins/cost)),totalCost:empty*cost,missing:Math.max(0,empty*cost-snapshot.coins)};
}

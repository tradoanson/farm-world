import type {OnlineSnapshot} from './farm-online';
import {CROPS} from './farm-demo';
export type RenderPlot={index:number;crop:number|null;stage:'empty'|'sprout'|'growing'|'ripe';remainingSeconds:number};
export type RenderFarm={plots:RenderPlot[];ready:number;growing:number;empty:number;nextRipeAt:number|null;revision:number|null};
/** Pure, read-only adapter: never changes economy or authoritative server state. */
export function toRenderFarm(snapshot:OnlineSnapshot|null,now:number):RenderFarm {
 const byIndex=new Map(snapshot?.plots.map(p=>[p.index,p])??[]);
 const plots=Array.from({length:64},(_,index):RenderPlot=>{
  const p=byIndex.get(index);
  if(!p||p.crop===null||p.crop===undefined)return {index,crop:null,stage:'empty',remainingSeconds:0};
  const total=CROPS[p.crop]?.seconds;
  const planted=Date.parse(p.plantedAt??'');
  if(!total||!Number.isFinite(planted))return {index,crop:null,stage:'empty',remainingSeconds:0};
  const remaining=Math.max(0,Math.ceil((planted+total*1000-now)/1000));
  const elapsed=total-remaining;
  return {index,crop:p.crop,stage:remaining===0?'ripe':elapsed<total*.35?'sprout':'growing',remainingSeconds:remaining};
 });
 const ready=plots.filter(p=>p.stage==='ripe').length;
 const growing=plots.filter(p=>p.stage==='growing'||p.stage==='sprout').length;
 const nextRipeAt=plots.filter(p=>p.remainingSeconds>0).map(p=>now+p.remainingSeconds*1000).sort((a,b)=>a-b)[0]??null;
 return {plots,ready,growing,empty:64-ready-growing,nextRipeAt,revision:snapshot?.revision??null};
}

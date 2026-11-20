import {ANIMALS,type AnimalType} from './v3-production-contracts';

/** Deterministic, side-effect-free husbandry rules. Server RPC must independently enforce all rules. */
export type AnimalPen=Readonly<{type:AnimalType;count:number;capacity:number;feedStock:number;fedAt:string|null;collectedAt:string|null}>;
export type AnimalView=Readonly<{type:AnimalType;count:number;capacity:number;feedNeeded:number;feedStock:number;readyAt:string|null;ready:boolean;secondsRemaining:number;product:string;yieldCount:number}>;
const valid=(v:number)=>Number.isSafeInteger(v)&&v>=0;
export function validatePen(p:AnimalPen):boolean{
 const a=ANIMALS.find(x=>x.type===p.type);
 return !!a&&valid(p.count)&&valid(p.capacity)&&p.capacity<=a.barnCapacity&&p.count<=p.capacity&&valid(p.feedStock)&&p.feedStock<=100000&&[p.fedAt,p.collectedAt].every(x=>x===null||Number.isFinite(Date.parse(x)));
}
export function projectAnimalPen(p:AnimalPen,nowMs:number):AnimalView{
 if(!validatePen(p)||!Number.isFinite(nowMs))throw new Error('Invalid husbandry state');
 const animal=ANIMALS.find(a=>a.type===p.type)!;
 const feedNeeded=p.count*animal.feedUnits;
 const fed= p.fedAt===null?null:Date.parse(p.fedAt);
 const collected=p.collectedAt===null?null:Date.parse(p.collectedAt);
 const active=fed!==null&&fed<=nowMs&&p.count>0&&(collected===null||collected<fed);
 const readyAt=active?new Date(fed+animal.cycleSeconds*1000).toISOString():null;
 const secondsRemaining=active?Math.max(0,Math.ceil((Date.parse(readyAt!)-nowMs)/1000)):0;
 return {type:p.type,count:p.count,capacity:p.capacity,feedNeeded,feedStock:p.feedStock,readyAt,ready:active&&secondsRemaining===0,secondsRemaining,product:animal.product,yieldCount:active&&secondsRemaining===0?p.count:0};
}
export function projectAnimalPens(pens:readonly AnimalPen[],nowMs:number):AnimalView[]{
 if(new Set(pens.map(p=>p.type)).size!==pens.length)throw new Error('Duplicate pen');
 return pens.map(p=>projectAnimalPen(p,nowMs));
}

/** V3.0 forward-compatible design contracts only. No server writes or live economic logic. */
export const ANIMAL_TYPES=['chicken','cow','sheep'] as const;
export type AnimalType=typeof ANIMAL_TYPES[number];
export type AnimalProduct='egg'|'milk'|'wool';
export type AnimalDefinition=Readonly<{type:AnimalType;product:AnimalProduct;feedUnits:number;cycleSeconds:number;barnCapacity:number}>;
export const ANIMALS:readonly AnimalDefinition[]=[
 {type:'chicken',product:'egg',feedUnits:1,cycleSeconds:600,barnCapacity:6},
 {type:'cow',product:'milk',feedUnits:3,cycleSeconds:1800,barnCapacity:4},
 {type:'sheep',product:'wool',feedUnits:2,cycleSeconds:2400,barnCapacity:4},
];
export type ProductionIngredient=Readonly<{item:string;quantity:number}>;
export type ProductionRecipe=Readonly<{id:string;inputs:readonly ProductionIngredient[];output:ProductionIngredient;durationSeconds:number}>;
export const PRODUCTION_RECIPES:readonly ProductionRecipe[]=[
 {id:'feed',inputs:[{item:'wheat',quantity:2}],output:{item:'feed',quantity:1},durationSeconds:120},
 {id:'bread',inputs:[{item:'wheat',quantity:3}],output:{item:'bread',quantity:1},durationSeconds:300},
 {id:'cheese',inputs:[{item:'milk',quantity:2}],output:{item:'cheese',quantity:1},durationSeconds:600},
];
export function validateProductionRecipe(recipe:ProductionRecipe):boolean{
 return /^[a-z][a-z0-9_-]*$/.test(recipe.id)&&Number.isSafeInteger(recipe.durationSeconds)&&recipe.durationSeconds>0&&recipe.inputs.length>0&&recipe.inputs.every(x=>x.item.length>0&&Number.isSafeInteger(x.quantity)&&x.quantity>0)&&recipe.output.item.length>0&&Number.isSafeInteger(recipe.output.quantity)&&recipe.output.quantity>0;
}
/** UI/architecture planning data only: never award products or charge coins on the client. */

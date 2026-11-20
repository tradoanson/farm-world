import {describe,expect,it} from 'vitest';import {ANIMALS,ANIMAL_TYPES,PRODUCTION_RECIPES,validateProductionRecipe} from '../lib/v3-production-contracts';
describe('V3.0 design contracts do not change existing economy',()=>{
 it('defines the three planned husbandry species',()=>{expect(ANIMALS.map(a=>a.type)).toEqual([...ANIMAL_TYPES]);expect(new Set(ANIMALS.map(a=>a.product)).size).toBe(3);});
 it('requires bounded positive production inputs and durations',()=>{expect(PRODUCTION_RECIPES.every(validateProductionRecipe)).toBe(true);expect(validateProductionRecipe({...PRODUCTION_RECIPES[0],durationSeconds:0})).toBe(false);expect(validateProductionRecipe({...PRODUCTION_RECIPES[0],inputs:[{item:'wheat',quantity:-1}]})).toBe(false);});
});

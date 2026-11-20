import {describe,it,expect} from 'vitest';
import {projectAnimalPen,projectAnimalPens,validatePen,type AnimalPen} from '../lib/v3-husbandry';
const start=Date.parse('2026-11-20T00:00:00.000Z');
const chicken:AnimalPen={type:'chicken',count:3,capacity:6,feedStock:9,fedAt:new Date(start).toISOString(),collectedAt:null};
describe('V3.1 husbandry pure domain',()=>{
 it('projects production from server timestamps, without writes',()=>{const a=projectAnimalPen(chicken,start+1000);expect(a.ready).toBe(false);expect(a.feedNeeded).toBe(3);expect(a.yieldCount).toBe(0);const b=projectAnimalPen(chicken,start+600000);expect(b.ready).toBe(true);expect(b.yieldCount).toBe(3);});
 it('rejects over-capacity, invalid and duplicate pens',()=>{expect(validatePen({...chicken,count:7})).toBe(false);expect(validatePen({...chicken,feedStock:-1})).toBe(false);expect(()=>projectAnimalPens([chicken,chicken],start)).toThrow('Duplicate');});
 it('prevents collection twice in display state',()=>{expect(projectAnimalPen({...chicken,collectedAt:new Date(start+600000).toISOString()},start+700000).ready).toBe(false);});
 it('does not allow future feed to count as ready',()=>{expect(projectAnimalPen({...chicken,fedAt:new Date(start+500000).toISOString()},start).ready).toBe(false);});
 it('does not mutate input',()=>{const original=structuredClone(chicken);projectAnimalPen(chicken,start);expect(chicken).toEqual(original);});
});

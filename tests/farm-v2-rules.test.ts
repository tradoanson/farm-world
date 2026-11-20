import {describe,it,expect} from 'vitest';
import {warehouseCapacity,unlockedPlotCount,unlockedPlotCountWithBarn,isPlotUnlocked,cropUnlockLevel,canPlantCrop,canStore} from '../lib/farm-v2-rules';
describe('V2 economy and land rules',()=>{
 it('warehouse grows by upgrade and rejects impossible levels',()=>{
  expect(warehouseCapacity(0)).toBe(40);
  expect(warehouseCapacity(10)).toBe(240);
  expect(()=>warehouseCapacity(11)).toThrow();
 });
 it('land expansion never exceeds server plot maximum',()=>{
  expect(unlockedPlotCount(1)).toBe(16);
  expect(unlockedPlotCount(3)).toBe(20);
  expect(unlockedPlotCount(999)).toBe(64);
  expect(isPlotUnlocked(16,1)).toBe(false);
  expect(isPlotUnlocked(16,3)).toBe(true);
  expect(unlockedPlotCountWithBarn(1,1)).toBe(20);
  expect(unlockedPlotCountWithBarn(1,5)).toBe(36);
  expect(unlockedPlotCountWithBarn(999,5)).toBe(64);
  expect(()=>unlockedPlotCountWithBarn(1,6)).toThrow();
 });
 it('crop unlocks cannot be bypassed by client level',()=>{
  expect(cropUnlockLevel(4)).toBe(8);
  expect(canPlantCrop(4,7)).toBe(false);
  expect(canPlantCrop(4,8)).toBe(true);
  expect(()=>cropUnlockLevel(5)).toThrow();
 });
 it('storage boundary handles exact fit and invalid amounts',()=>{
  expect(canStore(39,1,40)).toBe(true);
  expect(canStore(40,1,40)).toBe(false);
  expect(canStore(-1,1,40)).toBe(false);
 });
});

import { describe, expect, it } from 'vitest';
import { CROPS, freshFarm, harvest, harvestAll, isValidFarm, plant, plantAvailable, remainingSeconds } from '../lib/farm-demo';
describe('offline farm rules', () => {
  it('starts with 64 empty tiles and 100 coins', () => { const farm = freshFarm(); expect(farm.tiles).toHaveLength(64); expect(farm.coins).toBe(100); });
  it('charges once, prevents duplicate planting and waits for maturity', () => {
    const farm = plant(freshFarm(), 0, 0, 1000);
    expect(farm.coins).toBe(99);
    expect(plant(farm, 0, 0, 1000)).toBe(farm);
    expect(remainingSeconds(farm.tiles[0]!, 120999)).toBe(1);
    expect(harvest(farm, 0, 120999)).toBe(farm);
    const done = harvest(farm, 0, 121000);
    expect(done.coins).toBe(102);
    expect(done.harvested).toBe(1);
    expect(harvest(done, 0, 121001)).toBe(done);
  });
  it('batch plants only affordable plots and harvests only ready plots', () => {
    const farm = plantAvailable(freshFarm(), CROPS.length - 1, 1000);
    expect(farm.tiles.filter(Boolean)).toHaveLength(10);
    expect(farm.coins).toBe(0);
    expect(harvestAll(farm, 1001)).toBe(farm);
    const harvested = harvestAll(farm, 1201000);
    expect(harvested.harvested).toBe(10);
    expect(harvested.coins).toBe(300);
  });
  it('validates backups and rejects malformed saves', () => {
    expect(isValidFarm(freshFarm())).toBe(true);
    expect(isValidFarm({ ...freshFarm(), tiles: [{ crop: 99, planted: 1 }] })).toBe(false);
    expect(isValidFarm({ ...freshFarm(), coins: -1 })).toBe(false);
    expect(isValidFarm({ ...freshFarm(), tiles: Array(64).fill({ crop: 0, planted: NaN }) })).toBe(false);
  });
});

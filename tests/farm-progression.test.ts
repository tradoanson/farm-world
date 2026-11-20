import { describe, expect, it } from 'vitest';
import { freshFarm, plant, harvest } from '../lib/farm-demo';
import { claimQuest, earnHarvest, freshProgression, levelOf, migrateProgression, sellCrop, validProgression } from '../lib/farm-progression';

describe('V0.4 progression', () => {
  it('migrates legacy V1 save without deleting coins or tiles', () => {
    const old = plant(freshFarm(), 0, 0, 1000);
    const progress = migrateProgression(old);
    expect(old.tiles[0]).not.toBeNull();
    expect(old.coins).toBe(99);
    expect(progress.version).toBe(2);
    expect(progress.inventory).toEqual([0,0,0,0,0]);
    expect(validProgression(progress)).toBe(true);
  });
  it('adds harvested items and xp, then sells only available stock', () => {
    const p = earnHarvest(freshProgression(), 0);
    expect(p.inventory[0]).toBe(1);
    expect(p.xp).toBe(5);
    const result = sellCrop(freshFarm(), p, 0, 1);
    expect(result.farm.coins).toBe(103);
    expect(result.progress.inventory[0]).toBe(0);
    expect(sellCrop(result.farm, result.progress, 0, 1).farm.coins).toBe(103);
  });
  it('awards a quest only once', () => {
    let farm = freshFarm();
    for (let i = 0; i < 5; i++) farm = harvest(plant(farm, i, 0, 1000), i, 121000);
    const first = claimQuest(farm, freshProgression(), 0);
    expect(first.farm.coins).toBe(farm.coins + 20);
    expect(claimQuest(first.farm, first.progress, 0).farm.coins).toBe(first.farm.coins);
    expect(levelOf(100)).toBe(3);
  });
});

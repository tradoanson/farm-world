import { CROPS, type FarmSave, isValidFarm } from './farm-demo';
export const PROGRESSION_KEY = 'farm-world-v04-progression';
export type Progression = { version: 2; inventory: number[]; xp: number; sold: number; claimed: number[] };
export const freshProgression = (): Progression => ({ version: 2, inventory: CROPS.map(() => 0), xp: 0, sold: 0, claimed: [] });
export function validProgression(v: unknown): v is Progression {
  if (!v || typeof v !== 'object') return false;
  const p = v as Partial<Progression>;
  return p.version === 2 && Array.isArray(p.inventory) && p.inventory.length === CROPS.length && p.inventory.every(n => Number.isSafeInteger(n) && n >= 0) && Number.isSafeInteger(p.xp) && (p.xp ?? -1) >= 0 && Number.isSafeInteger(p.sold) && (p.sold ?? -1) >= 0 && Array.isArray(p.claimed) && p.claimed.every(n => Number.isSafeInteger(n) && n >= 0 && n < 3) && new Set(p.claimed).size === p.claimed.length;
}
export function migrateProgression(farm: unknown, value?: unknown): Progression {
  if (!isValidFarm(farm)) throw new Error('Farm save không hợp lệ');
  return validProgression(value) ? value : freshProgression();
}
export const levelOf = (xp: number) => Math.floor(Math.sqrt(Math.max(0, xp) / 25)) + 1;
export const nextLevelXp = (level: number) => 25 * level * level;
export function earnHarvest(p: Progression, crop: number): Progression {
  if (!Number.isInteger(crop) || crop < 0 || crop >= CROPS.length) return p;
  return { ...p, xp: p.xp + 5 + crop * 2, inventory: p.inventory.map((n, i) => i === crop ? n + 1 : n) };
}
export function sellCrop(farm: FarmSave, p: Progression, crop: number, quantity: number): { farm: FarmSave; progress: Progression } {
  if (!Number.isInteger(crop) || crop < 0 || crop >= CROPS.length || !Number.isSafeInteger(quantity) || quantity <= 0 || p.inventory[crop] < quantity) return { farm, progress: p };
  const revenue = CROPS[crop].cost * 3 * quantity;
  if (!Number.isSafeInteger(farm.coins + revenue)) return { farm, progress: p };
  return { farm: { ...farm, coins: farm.coins + revenue }, progress: { ...p, sold: p.sold + quantity, inventory: p.inventory.map((n, i) => i === crop ? n - quantity : n) } };
}
export const QUESTS = [{ title: 'Thu hoạch 5 lần', target: 5, reward: 20, kind: 'harvest' }, { title: 'Bán 10 nông sản', target: 10, reward: 35, kind: 'sold' }, { title: 'Đạt cấp 3', target: 3, reward: 50, kind: 'level' }] as const;
export function questProgress(farm: FarmSave, p: Progression, index: number): number {
  const q = QUESTS[index];
  return q.kind === 'harvest' ? farm.harvested : q.kind === 'sold' ? p.sold : levelOf(p.xp);
}
export function claimQuest(farm: FarmSave, p: Progression, index: number): { farm: FarmSave; progress: Progression } {
  const q = QUESTS[index];
  if (!q || p.claimed.includes(index) || questProgress(farm, p, index) < q.target || !Number.isSafeInteger(farm.coins + q.reward)) return { farm, progress: p };
  return { farm: { ...farm, coins: farm.coins + q.reward }, progress: { ...p, claimed: [...p.claimed, index] } };
}

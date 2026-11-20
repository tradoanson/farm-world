export const CROPS = [
  { name: 'Lúa mì', emoji: '🌾', seconds: 120, cost: 1 },
  { name: 'Ngô', emoji: '🌽', seconds: 300, cost: 3 },
  { name: 'Cà rốt', emoji: '🥕', seconds: 600, cost: 5 },
  { name: 'Cà chua', emoji: '🍅', seconds: 900, cost: 7 },
  { name: 'Dâu tây', emoji: '🍓', seconds: 1200, cost: 10 },
] as const;
export const SAVE_KEY = 'farm-world-v01b-save';
export type Tile = { crop: number; planted: number } | null;
export type FarmSave = { version: 1; tiles: Tile[]; coins: number; harvested: number };
export const freshFarm = (): FarmSave => ({ version: 1, tiles: Array(64).fill(null), coins: 100, harvested: 0 });
export function isValidFarm(value: unknown): value is FarmSave {
  if (!value || typeof value !== 'object') return false;
  const v = value as Partial<FarmSave>;
  return v.version === 1 && typeof v.coins === 'number' && Number.isSafeInteger(v.coins) && v.coins >= 0 && typeof v.harvested === 'number' && Number.isSafeInteger(v.harvested) && v.harvested >= 0 && Array.isArray(v.tiles) && v.tiles.length === 64 && v.tiles.every(t => t === null || (typeof t === 'object' && t !== null && Number.isInteger(t.crop) && t.crop >= 0 && t.crop < CROPS.length && Number.isSafeInteger(t.planted) && t.planted > 0));
}
export const remainingSeconds = (tile: NonNullable<Tile>, now: number) => Math.max(0, Math.ceil((tile.planted + CROPS[tile.crop].seconds * 1000 - now) / 1000));
export const timeLabel = (seconds: number) => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
export function plant(farm: FarmSave, index: number, crop: number, now: number): FarmSave {
  if (!Number.isInteger(index) || index < 0 || index >= farm.tiles.length || farm.tiles[index] || !Number.isInteger(crop) || crop < 0 || crop >= CROPS.length || farm.coins < CROPS[crop].cost || !Number.isFinite(now) || now <= 0) return farm;
  return { ...farm, coins: farm.coins - CROPS[crop].cost, tiles: farm.tiles.map((t, i) => i === index ? { crop, planted: now } : t) };
}
export function harvest(farm: FarmSave, index: number, now: number): FarmSave {
  const tile = farm.tiles[index];
  if (!tile || remainingSeconds(tile, now) > 0) return farm;
  return { ...farm, coins: farm.coins + CROPS[tile.crop].cost * 3, harvested: farm.harvested + 1, tiles: farm.tiles.map((t, i) => i === index ? null : t) };
}
export function harvestAll(farm: FarmSave, now: number): FarmSave {
  return farm.tiles.reduce<FarmSave>((current, tile, index) => tile ? harvest(current, index, now) : current, farm);
}
export function plantAvailable(farm: FarmSave, crop: number, now: number): FarmSave {
  return farm.tiles.reduce<FarmSave>((current, _tile, index) => plant(current, index, crop, now), farm);
}

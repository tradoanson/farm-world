/** Camera controls are presentation-only: never mutate the farm save. */
export const MIN_ZOOM = 0.65;
export const MAX_ZOOM = 2;
export function clampZoom(value: number): number {
  if (!Number.isFinite(value)) return 1;
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, value));
}
export function pinchZoom(initialZoom: number, initialDistance: number, distance: number): number {
  if (!Number.isFinite(initialDistance) || initialDistance <= 0 || !Number.isFinite(distance) || distance < 0) return clampZoom(initialZoom);
  return clampZoom(initialZoom * distance / initialDistance);
}
export function hasDragged(dx: number, dy: number, threshold = 8): boolean {
  return Math.hypot(dx, dy) > threshold;
}

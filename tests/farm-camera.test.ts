import { describe, expect, it } from 'vitest';
import { clampZoom, hasDragged, pinchZoom } from '../lib/farm-camera';

describe('camera interaction rules', () => {
  it('clamps zoom and recovers from invalid values', () => {
    expect(clampZoom(.1)).toBe(.65);
    expect(clampZoom(3)).toBe(2);
    expect(clampZoom(1.25)).toBe(1.25);
    expect(clampZoom(Number.NaN)).toBe(1);
  });
  it('uses stable pinch ratio with bounded output', () => {
    expect(pinchZoom(1, 100, 150)).toBe(1.5);
    expect(pinchZoom(1, 100, 1000)).toBe(2);
    expect(pinchZoom(1, 0, 200)).toBe(1);
  });
  it('does not confuse a tap with dragging', () => {
    expect(hasDragged(3, 4)).toBe(false);
    expect(hasDragged(9, 0)).toBe(true);
  });
});

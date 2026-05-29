import { describe, expect, it, vi } from 'vitest';
import { pixiColorToSkia } from './pixiColor';
import type { CanvasKit, Color } from './canvaskit-global';

function mockCk(): CanvasKit {
  return {
    Color4f: (r: number, g: number, b: number, a: number) => Float32Array.of(r, g, b, a) as Color,
    parseColorString: (s: string) => Float32Array.of(0.2, 0.4, 0.6, 1) as Color,
    BLACK: Float32Array.of(0, 0, 0, 1) as Color,
  } as unknown as CanvasKit;
}

describe('pixiColorToSkia', () => {
  it('converts hex number', () => {
    const ck = mockCk();
    const c = pixiColorToSkia(ck, 0xff8040, 0.5);
    expect(c[0]).toBeCloseTo(1);
    expect(c[1]).toBeCloseTo(128 / 255, 2);
    expect(c[2]).toBeCloseTo(64 / 255, 2);
    expect(c[3]).toBeCloseTo(0.5);
  });

  it('parses css string', () => {
    const ck = mockCk();
    const spy = vi.spyOn(ck, 'parseColorString');
    pixiColorToSkia(ck, '#336699');
    expect(spy).toHaveBeenCalledWith('#336699');
  });
});

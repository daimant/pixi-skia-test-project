import type { ColorSource } from 'pixi.js-legacy';
import type { CanvasKit, Color } from './canvaskit-global';

export function pixiColorToSkia(ck: CanvasKit, source: ColorSource, alpha = 1): Color {
  if (typeof source === 'number') {
    const r = (source >> 16) & 0xff;
    const g = (source >> 8) & 0xff;
    const b = source & 0xff;
    return ck.Color4f(r / 255, g / 255, b / 255, alpha);
  }
  if (typeof source === 'string') {
    return ck.parseColorString(source);
  }
  if (Array.isArray(source)) {
    const [r, g, b, a = 1] = source;
    return ck.Color4f(
      typeof r === 'number' && r > 1 ? r / 255 : r,
      typeof g === 'number' && g > 1 ? g / 255 : g,
      typeof b === 'number' && b > 1 ? b / 255 : b,
      (typeof a === 'number' ? a : 1) * alpha,
    );
  }
  return ck.BLACK;
}

import type { Matrix } from 'pixi.js-legacy';

export function pixiWorldMatrixToSkia(m: Matrix): number[] {
  return [m.a, m.c, m.tx, m.b, m.d, m.ty, 0, 0, 1];
}

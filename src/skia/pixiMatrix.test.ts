import { Matrix } from 'pixi.js-legacy';
import { describe, expect, it } from 'vitest';
import { pixiWorldMatrixToSkia } from './pixiMatrix';

describe('pixiWorldMatrixToSkia', () => {
  it('maps identity', () => {
    const m = new Matrix();
    expect(pixiWorldMatrixToSkia(m)).toEqual([1, 0, 0, 0, 1, 0, 0, 0, 1]);
  });

  it('maps translate and scale', () => {
    const m = new Matrix(2, 0, 0, 3, 10, 20);
    expect(pixiWorldMatrixToSkia(m)).toEqual([2, 0, 10, 0, 3, 20, 0, 0, 1]);
  });
});

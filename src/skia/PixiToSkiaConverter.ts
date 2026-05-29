import type { Container, DisplayObject } from 'pixi.js-legacy';
import type { Canvas, CanvasKit } from './canvaskit-global';
import { isPixiContainer, isPixiGraphics, isPixiSprite } from '../pixi/types';
import { pixiWorldMatrixToSkia } from './pixiMatrix';
import { renderGraphics } from './renderGraphics';
import { renderSprite } from './renderSprite';

export interface IPixiToSkiaConverter {
  convertPixiContainerToSkia(container: Container, canvas: Canvas): void;
}

export class PixiToSkiaConverter implements IPixiToSkiaConverter {
  constructor(private readonly ck: CanvasKit) {}

  convertPixiContainerToSkia(container: Container, canvas: Canvas): void {
    container.updateTransform();
    this.walkDisplayObject(container, canvas);
  }

  private walkDisplayObject(object: DisplayObject, canvas: Canvas): void {
    if (!object.visible || object.worldAlpha <= 0) {
      return;
    }

    if (isPixiContainer(object)) {
      for (const child of object.children) {
        this.walkDisplayObject(child, canvas);
      }
      return;
    }

    object.updateTransform();
    const matrix = pixiWorldMatrixToSkia(object.worldTransform);
    canvas.save();
    canvas.concat(matrix);

    if (isPixiGraphics(object)) {
      renderGraphics(this.ck, canvas, object);
    } else if (isPixiSprite(object)) {
      renderSprite(this.ck, canvas, object);
    }

    canvas.restore();
  }
}

export function convertPixiContainerToSkia(
  ck: CanvasKit,
  container: Container,
  canvas: Canvas,
): void {
  const converter = new PixiToSkiaConverter(ck);
  converter.convertPixiContainerToSkia(container, canvas);
}

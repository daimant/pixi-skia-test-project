import type { Container, DisplayObject, Graphics, Sprite } from 'pixi.js-legacy';

export function isPixiGraphics(obj: DisplayObject): obj is Graphics {
  return Boolean((obj as Graphics).geometry?.graphicsData);
}

export function isPixiSprite(obj: DisplayObject): obj is Sprite {
  return Boolean((obj as Sprite).texture);
}

export function isPixiContainer(obj: DisplayObject): obj is Container {
  return typeof (obj as Container).children !== 'undefined' && !isPixiGraphics(obj) && !isPixiSprite(obj);
}

import type { Sprite } from 'pixi.js-legacy';
import type { Canvas, CanvasKit } from './canvaskit-global';

export function renderSprite(ck: CanvasKit, canvas: Canvas, sprite: Sprite): void {
  const texture = sprite.texture;
  if (!texture?.valid) {
    return;
  }

  const resource = texture.baseTexture.resource as { source?: CanvasImageSource };
  const source = resource?.source;
  if (!source) {
    return;
  }

  const image = ck.MakeImageFromCanvasImageSource(source);
  if (!image) {
    return;
  }

  const frame = texture.frame;
  const paint = new ck.Paint();
  paint.setAntiAlias(true);

  const src: [number, number, number, number] = [frame.x, frame.y, frame.x + frame.width, frame.y + frame.height];
  const dest: [number, number, number, number] = [
    -sprite.anchor.x * sprite.width,
    -sprite.anchor.y * sprite.height,
    (1 - sprite.anchor.x) * sprite.width,
    (1 - sprite.anchor.y) * sprite.height,
  ];

  canvas.drawImageRect(image, src, dest, paint, false);
  paint.delete();
  image.delete();
}

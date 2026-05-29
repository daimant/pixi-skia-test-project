import type { Graphics } from 'pixi.js-legacy';
import type { Canvas, CanvasKit, Paint } from './canvaskit-global';
import { buildPathFromGraphicsData } from './graphicsPath';
import { pixiColorToSkia } from './pixiColor';

export function renderGraphics(
  ck: CanvasKit,
  canvas: Canvas,
  graphics: Graphics,
): void {
  const geometry = graphics.geometry;
  if (!geometry.graphicsData.length) {
    return;
  }

  for (const data of geometry.graphicsData) {
    const path = buildPathFromGraphicsData(ck, data);
    if (!path) {
      continue;
    }

    const fillVisible = data.fillStyle.visible && data.fillStyle.alpha > 0;
    const lineVisible = data.lineStyle.visible && data.lineStyle.width > 0;

    if (fillVisible) {
      const fillPaint = new ck.Paint();
      fillPaint.setStyle(ck.PaintStyle.Fill);
      fillPaint.setAntiAlias(true);
      fillPaint.setColor(
        pixiColorToSkia(ck, data.fillStyle.color, data.fillStyle.alpha * graphics.worldAlpha),
      );
      canvas.drawPath(path, fillPaint);
      fillPaint.delete();
    }

    if (lineVisible) {
      const linePaint = new ck.Paint();
      linePaint.setStyle(ck.PaintStyle.Stroke);
      linePaint.setAntiAlias(true);
      linePaint.setStrokeWidth(data.lineStyle.width);
      linePaint.setColor(
        pixiColorToSkia(ck, data.lineStyle.color, data.lineStyle.alpha * graphics.worldAlpha),
      );
      applyLineCapJoin(ck, linePaint, Number(data.lineStyle.cap), Number(data.lineStyle.join));
      canvas.drawPath(path, linePaint);
      linePaint.delete();
    }

    path.delete();
  }
}

function applyLineCapJoin(
  ck: CanvasKit,
  paint: Paint,
  cap: number,
  join: number,
): void {
  const caps = [ck.StrokeCap.Butt, ck.StrokeCap.Round, ck.StrokeCap.Square];
  const joins = [ck.StrokeJoin.Miter, ck.StrokeJoin.Round, ck.StrokeJoin.Bevel];
  paint.setStrokeCap(caps[cap] ?? ck.StrokeCap.Butt);
  paint.setStrokeJoin(joins[join] ?? ck.StrokeJoin.Miter);
}

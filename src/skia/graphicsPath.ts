import { SHAPES } from 'pixi.js-legacy';
import type { Circle, Ellipse, IShape, Matrix, Polygon, Rectangle, RoundedRectangle } from 'pixi.js-legacy';
import type { GraphicsData } from '@pixi/graphics';
import type { CanvasKit, Path } from './canvaskit-global';
import { pixiWorldMatrixToSkia } from './pixiMatrix';

function addShapeToPath(ck: CanvasKit, path: Path, shape: IShape, type: SHAPES): void {
  switch (type) {
    case SHAPES.RECT: {
      const r = shape as Rectangle;
      path.addRect([r.x, r.y, r.x + r.width, r.y + r.height]);
      break;
    }
    case SHAPES.RREC: {
      const r = shape as RoundedRectangle;
      path.addRRect(
        ck.RRectXY(ck.LTRBRect(r.x, r.y, r.x + r.width, r.y + r.height), r.radius, r.radius),
      );
      break;
    }
    case SHAPES.CIRC: {
      const c = shape as Circle;
      path.addCircle(c.x, c.y, c.radius);
      break;
    }
    case SHAPES.ELIP: {
      const e = shape as Ellipse;
      path.addOval([e.x - e.width / 2, e.y - e.height / 2, e.x + e.width / 2, e.y + e.height / 2]);
      break;
    }
    case SHAPES.POLY: {
      const poly = shape as Polygon;
      const pts = poly.points;
      if (pts.length >= 2) {
        path.moveTo(pts[0], pts[1]);
        for (let i = 2; i < pts.length; i += 2) {
          path.lineTo(pts[i], pts[i + 1]);
        }
        if (poly.closeStroke) {
          path.close();
        }
      }
      break;
    }
    default:
      break;
  }
}

export function buildPathFromGraphicsData(
  ck: CanvasKit,
  data: GraphicsData,
): Path | null {
  const path = new ck.Path();
  const shapeMatrix = data.matrix;
  if (shapeMatrix) {
    path.transform(pixiWorldMatrixToSkia(shapeMatrix as Matrix));
  }
  addShapeToPath(ck, path, data.shape, data.type);
  return path;
}

import type { CanvasKitInitOptions } from '../../../public/skia-extract/package/types/index';

declare global {
  function CanvasKitInit(opts?: CanvasKitInitOptions): Promise<import('../../../public/skia-extract/package/types/index').CanvasKit>;
}

export type {
  CanvasKit,
  Canvas,
  Surface,
  Paint,
  Path,
  Document,
  PDFMetadata,
  Color,
} from '../../../public/skia-extract/package/types/index';

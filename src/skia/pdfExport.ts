import type { Container } from 'pixi.js-legacy';
import type { CanvasKit, PDFMetadata } from './canvaskit-global';
import { convertPixiContainerToSkia } from './PixiToSkiaConverter';

export interface PdfExportOptions {
  width: number;
  height: number;
  title?: string;
}

function buildPdfMetadata(ck: CanvasKit, title: string): PDFMetadata {
  return {
    title,
    author: 'pixi-skia-test-project',
    subject: '',
    keywords: '',
    creator: 'CanvasKit PDF',
    producer: '',
    language: '',
    rasterDPI: 72,
    PDFA: false,
    compressionLevel: ck.PDFCompressionLevel.Default,
    rootTag: {
      id: 1,
      type: 'Document',
      children: [],
    },
  };
}

export function exportContainerToPdf(
  ck: CanvasKit,
  container: Container,
  options: PdfExportOptions,
): Uint8Array {
  container.updateTransform();

  const doc = ck.MakePDFDocument(
    buildPdfMetadata(ck, options.title ?? 'pixi-skia-export'),
  );

  const canvas = doc.beginPage(options.width, options.height);
  canvas.clear(ck.WHITE);
  convertPixiContainerToSkia(ck, container, canvas);
  doc.endPage();

  const bytes = doc.close();
  doc.delete();
  return bytes;
}

export function downloadPdf(bytes: Uint8Array, filename: string): void {
  const copy = new Uint8Array(bytes);
  const blob = new Blob([copy], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

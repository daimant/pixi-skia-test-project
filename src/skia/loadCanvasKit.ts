import type { CanvasKit } from './canvaskit-global';

type CanvasKitInitFn = (opts?: { locateFile?: (file: string) => string }) => Promise<CanvasKit>;

let canvasKitPromise: Promise<CanvasKit> | null = null;
let scriptLoadPromise: Promise<void> | null = null;

function loadCanvasKitScript(): Promise<void> {
  if (typeof (globalThis as { CanvasKitInit?: CanvasKitInitFn }).CanvasKitInit === 'function') {
    return Promise.resolve();
  }
  if (!scriptLoadPromise) {
    scriptLoadPromise = new Promise((resolve, reject) => {
      const existing = document.querySelector('script[data-canvaskit-pdf]');
      if (existing) {
        existing.addEventListener('load', () => resolve(), { once: true });
        existing.addEventListener('error', () => reject(new Error('canvaskit-pdf.js')), {
          once: true,
        });
        return;
      }
      const script = document.createElement('script');
      script.src = '/skia/canvaskit-pdf.js';
      script.dataset.canvaskitPdf = '1';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Не удалось загрузить /skia/canvaskit-pdf.js'));
      document.head.appendChild(script);
    });
  }
  return scriptLoadPromise;
}

function getCanvasKitInit(): CanvasKitInitFn {
  const init = (globalThis as { CanvasKitInit?: CanvasKitInitFn }).CanvasKitInit;
  if (!init) {
    throw new Error('CanvasKitInit не определён после загрузки canvaskit-pdf.js');
  }
  return init;
}

export function loadCanvasKit(): Promise<CanvasKit> {
  if (!canvasKitPromise) {
    canvasKitPromise = loadCanvasKitScript()
      .then(() => getCanvasKitInit()({
        locateFile: (file: string) =>
          file === 'canvaskit.wasm' ? '/skia/canvaskit-pdf.wasm' : `/skia/${file}`,
      }))
      .then((ck) => {
        if (typeof ck.MakePDFDocument !== 'function') {
          throw new Error('В CanvasKit нет MakePDFDocument — нужна сборка canvaskit-pdf');
        }
        if (typeof ck.MakeSWCanvasSurface !== 'function') {
          throw new Error('В CanvasKit нет MakeSWCanvasSurface');
        }
        return ck;
      });
  }
  return canvasKitPromise;
}

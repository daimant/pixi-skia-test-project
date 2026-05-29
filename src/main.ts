import { PixiSkiaApp } from './app/PixiSkiaApp';

function byId<T extends HTMLElement>(id: string): T {
  const el = document.getElementById(id);
  if (!el) {
    throw new Error(`Не найден элемент UI: ${id}`);
  }
  return el as T;
}

async function bootstrap(): Promise<void> {
  const pixiHost = document.getElementById('pixi-host');
  const skiaCanvas = document.getElementById('skia-canvas') as HTMLCanvasElement | null;
  const statusEl = document.getElementById('status');
  const btnRandom = document.getElementById('btn-random');
  const btnExport = document.getElementById('btn-export-pdf');

  if (!pixiHost || !skiaCanvas || !statusEl || !btnRandom || !btnExport) {
    throw new Error('Не найдены элементы UI');
  }

  const app = new PixiSkiaApp(pixiHost, skiaCanvas, statusEl);

  // controls
  const selectedLabel = byId<HTMLSpanElement>('selected-label');
  const txInput = byId<HTMLInputElement>('tx-input');
  const tyInput = byId<HTMLInputElement>('ty-input');
  const rotationInput = byId<HTMLInputElement>('rotation-input');
  const sxInput = byId<HTMLInputElement>('sx-input');
  const syInput = byId<HTMLInputElement>('sy-input');

  const applyTranslateBtn = byId<HTMLButtonElement>('apply-translate');
  const applyRotateBtn = byId<HTMLButtonElement>('apply-rotate');
  const applyScaleBtn = byId<HTMLButtonElement>('apply-scale');
  const resetBtn = byId<HTMLButtonElement>('reset-transform');
  const clearSelectionBtn = byId<HTMLButtonElement>('clear-selection');

  // when selection changes, populate inputs
  app.onSelectionChanged = (obj) => {
    if (!obj) {
      selectedLabel.textContent = 'нет';
      txInput.value = '';
      tyInput.value = '';
      rotationInput.value = '';
      sxInput.value = '';
      syInput.value = '';
      return;
    }
    selectedLabel.textContent = (obj as any).name || obj.constructor.name || 'object';
    txInput.value = String(Math.round((obj.position?.x ?? 0) * 100) / 100);
    tyInput.value = String(Math.round((obj.position?.y ?? 0) * 100) / 100);
    rotationInput.value = String(Math.round((obj as any).angle ?? 0));
    sxInput.value = String(Math.round((obj.scale?.x ?? 1) * 100) / 100);
    syInput.value = String(Math.round((obj.scale?.y ?? 1) * 100) / 100);
  };

  applyTranslateBtn.addEventListener('click', () => {
    const x = parseFloat(txInput.value || '0');
    const y = parseFloat(tyInput.value || '0');
    app.setSelectedTransform({ x, y });
  });

  applyRotateBtn.addEventListener('click', () => {
    const a = parseFloat(rotationInput.value || '0');
    app.setSelectedTransform({ angleDeg: a });
  });

  applyScaleBtn.addEventListener('click', () => {
    const sx = parseFloat(sxInput.value || '1');
    const sy = parseFloat(syInput.value || sx.toString() || '1');
    app.setSelectedTransform({ scaleX: sx, scaleY: sy });
  });

  resetBtn.addEventListener('click', () => {
    app.resetSelectedTransform();
    // update UI to reflect reset
    const sel = app.getSelected();
    if (sel) {
      txInput.value = String(Math.round(sel.position.x * 100) / 100);
      tyInput.value = String(Math.round(sel.position.y * 100) / 100);
      rotationInput.value = String(Math.round((sel as any).angle ?? 0));
      sxInput.value = '1';
      syInput.value = '1';
    }
  });

  clearSelectionBtn.addEventListener('click', () => {
    app.setSelected(null);
  });

  btnRandom.addEventListener('click', () => app.addRandomShape());
  btnExport.addEventListener('click', () => {
    void app.exportPdf();
  });

  statusEl.textContent = 'Загрузка CanvasKit…';
  try {
    await app.initSkia();
  } catch (err) {
    statusEl.textContent = `Ошибка Skia: ${err instanceof Error ? err.message : String(err)}`;
    console.error(err);
  }
}

void bootstrap();

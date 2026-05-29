import {
  Application,
  Container,
  DisplayObject,
  IPointData,
} from "pixi.js-legacy";
import { DualCanvasPointerBridge } from "../events/DualCanvasPointerBridge";
import { loadCanvasKit } from "../skia/loadCanvasKit";
import { downloadPdf, exportContainerToPdf } from "../skia/pdfExport";
import { SkiaSurfaceRenderer } from "../skia/SkiaSurfaceRenderer";
import { createDemoScene } from "../scene/demoScene";
import { createRandomGraphic } from "../scene/randomShape";

export class PixiSkiaApp {
  private readonly pixiApp: Application;
  private readonly sceneRoot: Container;
  private skiaRenderer: SkiaSurfaceRenderer | null = null;
  private skiaReady = false;
  private readonly width = 640;
  private readonly height = 480;

  // selection
  private selected: DisplayObject | null = null;

  // drag state
  private dragTarget: DisplayObject | null = null;
  private dragOffset = { x: 0, y: 0 };

  /** Вызывается при смене выбранного объекта (в т.ч. после окончания перетаскивания). */
  public onSelectionChanged: (obj: DisplayObject | null) => void = () => {};

  constructor(
    pixiHost: HTMLElement,
    private readonly skiaCanvas: HTMLCanvasElement,
    private readonly statusEl: HTMLElement,
  ) {
    this.pixiApp = new Application({
      width: this.width,
      height: this.height,
      backgroundColor: 0x1e1e1e,
      antialias: true,
      forceCanvas: true,
      eventFeatures: {
        move: true, // нужно для pointermove на stage
        globalMove: false,
        click: true,
        wheel: false,
      },
    });

    this.pixiApp.stage.eventMode = "static";
    this.pixiApp.stage.hitArea = this.pixiApp.screen;

    pixiHost.appendChild(this.pixiApp.view as HTMLCanvasElement);
    this.sceneRoot = createDemoScene((msg) => this.setStatus(msg));
    this.pixiApp.stage.addChild(this.sceneRoot);

    // pointerdown на stage: выбор + начало drag
    this.pixiApp.stage.on("pointerdown", (ev) => {
      const fedEv = ev as any;
      const target = fedEv.target as DisplayObject | null;
      if (!target || target === this.pixiApp.stage) {
        this.setSelected(null);
        return;
      }
      this.setSelected(target);
      this.startDrag(target, ev.global, (fedEv.pointerId as number) ?? 1);
    });

    // pointermove на stage: двигаем перетаскиваемый объект
    this.pixiApp.stage.on("pointermove", (ev) => {
      if (this.dragTarget) {
        this.doDrag(ev.global);
      }
    });

    // конец перетаскивания
    const stopDrag = () => this.stopDrag();
    this.pixiApp.stage.on("pointerup", stopDrag);
    this.pixiApp.stage.on("pointerupoutside", stopDrag);

    this.pixiApp.ticker.add(() => {
      if (this.skiaReady) {
        this.syncSkia();
      }
    });
  }

  // ── Drag ────────────────────────────────────────────────────────────────────

  private startDrag(
    target: DisplayObject,
    globalPos: IPointData,
    pointerId: number,
  ): void {
    const parent = target.parent;
    if (!parent) return;

    // Смещение между origin объекта и точкой клика в координатах родителя
    const local = parent.toLocal(globalPos);
    this.dragOffset = { x: target.x - local.x, y: target.y - local.y };
    this.dragTarget = target;
    target.cursor = "grabbing";

    // Захватываем указатель, чтобы события продолжали идти на canvas при выходе за границы
    const pixiCanvas = this.pixiApp.view as HTMLCanvasElement;
    try {
      pixiCanvas.setPointerCapture(pointerId);
    } catch {
      // не все браузеры поддерживают
    }
  }

  private doDrag(globalPos: IPointData): void {
    const target = this.dragTarget;
    if (!target) return;
    const parent = target.parent;
    if (!parent) return;
    const local = parent.toLocal(globalPos);
    target.x = local.x + this.dragOffset.x;
    target.y = local.y + this.dragOffset.y;
    this.syncSkia();
  }

  private stopDrag(): void {
    if (this.dragTarget) {
      this.dragTarget.cursor = "grab";
      // Обновляем инпуты в UI с актуальными координатами
      this.onSelectionChanged(this.dragTarget);
    }
    this.dragTarget = null;
  }

  // ── Public API ──────────────────────────────────────────────────────────────

  async initSkia(): Promise<void> {
    const ck = await loadCanvasKit();
    this.skiaRenderer = new SkiaSurfaceRenderer(ck, this.skiaCanvas);
    this.skiaRenderer.resize(this.width, this.height);
    this.skiaReady = true;
    this.syncSkia();
    new DualCanvasPointerBridge(this.pixiApp, this.skiaCanvas);
    this.setStatus("Готово — перетаскивайте фигуры мышью");
  }

  addRandomShape(): void {
    this.sceneRoot.addChild(createRandomGraphic((msg) => this.setStatus(msg)));
    this.syncSkia();
    this.setStatus("Добавлена случайная фигура");
  }

  async exportPdf(): Promise<void> {
    try {
      this.setStatus("Экспорт PDF…");
      const ck = await loadCanvasKit();
      const bytes = exportContainerToPdf(ck, this.sceneRoot, {
        width: this.width,
        height: this.height,
        title: "pixi-skia-scene",
      });
      if (!bytes?.length) throw new Error("PDF пустой");
      downloadPdf(bytes, `pixi-skia-${Date.now()}.pdf`);
      this.setStatus(`PDF сохранён (${bytes.length} байт)`);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.setStatus(`Ошибка PDF: ${message}`);
      console.error(err);
    }
  }

  private syncSkia(): void {
    this.skiaRenderer?.render(this.sceneRoot);
  }

  private setStatus(text: string): void {
    this.statusEl.textContent = text;
  }

  // ── Selection ───────────────────────────────────────────────────────────────

  public getSelected(): DisplayObject | null {
    return this.selected;
  }

  public setSelected(obj: DisplayObject | null): void {
    this.selected = obj;
    this.setStatus(
      obj ? `Выбран: ${this.describeSelected(obj)}` : "Выбор снят",
    );
    try {
      this.onSelectionChanged(obj);
    } catch (err) {
      console.error(err);
    }
  }

  private describeSelected(obj: DisplayObject | null): string {
    if (!obj) return "нет";
    if ((obj as any).name) return (obj as any).name;
    return obj.constructor?.name ?? "object";
  }

  // ── Transform helpers ───────────────────────────────────────────────────────

  public setSelectedTransform(transform: {
    x?: number;
    y?: number;
    angleDeg?: number;
    scaleX?: number;
    scaleY?: number;
  }): void {
    const obj = this.selected;
    if (!obj) return;
    if (typeof transform.x === "number") obj.position.x = transform.x;
    if (typeof transform.y === "number") obj.position.y = transform.y;
    if (typeof transform.angleDeg === "number") obj.angle = transform.angleDeg;
    if (typeof transform.scaleX === "number") obj.scale.x = transform.scaleX;
    if (typeof transform.scaleY === "number") obj.scale.y = transform.scaleY;
    this.syncSkia();
  }

  public translateSelectedBy(dx: number, dy: number): void {
    const obj = this.selected;
    if (!obj) return;
    obj.position.x += dx;
    obj.position.y += dy;
    this.syncSkia();
  }

  public rotateSelectedBy(deltaDeg: number): void {
    const obj = this.selected;
    if (!obj) return;
    obj.angle += deltaDeg;
    this.syncSkia();
  }

  public scaleSelectedTo(sx: number, sy: number): void {
    const obj = this.selected;
    if (!obj) return;
    obj.scale.x = sx;
    obj.scale.y = sy;
    this.syncSkia();
  }

  public resetSelectedTransform(): void {
    const obj = this.selected;
    if (!obj) return;
    obj.position.set(0, 0);
    obj.angle = 0;
    obj.scale.set(1, 1);
    this.syncSkia();
  }
}

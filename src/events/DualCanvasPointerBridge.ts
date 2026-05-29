import type { Application } from "pixi.js-legacy";

/**
 * Пробрасывает pointer-события со Skia-canvas на Pixi-canvas,
 * конвертируя координаты. Это позволяет:
 *  - кликать и перетаскивать фигуры через Skia-холст;
 *  - продолжать drag, когда мышь переходит со Pixi-холста на Skia.
 */
export class DualCanvasPointerBridge {
  constructor(
    private readonly pixiApp: Application,
    private readonly skiaCanvas: HTMLCanvasElement,
  ) {
    this.bindSkiaCanvas();
  }

  private bindSkiaCanvas(): void {
    const skia = this.skiaCanvas;
    skia.style.touchAction = "none";

    skia.addEventListener("pointerdown", (ev) => {
      ev.preventDefault();
      this.dispatchOnPixi(ev, "pointerdown");
    });

    skia.addEventListener("pointermove", (ev) => {
      this.dispatchOnPixi(ev, "pointermove");
    });

    skia.addEventListener("pointerup", (ev) => {
      this.dispatchOnPixi(ev, "pointerup", globalThis);
    });
  }

  private dispatchOnPixi(
    source: PointerEvent,
    type: "pointerdown" | "pointermove" | "pointerup",
    target: EventTarget = this.pixiApp.view as HTMLCanvasElement,
  ): void {
    const pixiView = this.pixiApp.view as HTMLCanvasElement;
    const { clientX, clientY } = mapSkiaToPixiClient(
      pixiView,
      this.skiaCanvas,
      source,
    );

    const event = new PointerEvent(type, {
      pointerId: source.pointerId,
      pointerType: source.pointerType,
      button: source.button,
      // для pointerup — кнопки отпущены; для остальных сохраняем текущее состояние
      buttons:
        type === "pointerup"
          ? 0
          : source.buttons || (type === "pointerdown" ? 1 : 0),
      clientX,
      clientY,
      movementX: source.movementX,
      movementY: source.movementY,
      bubbles: true,
      cancelable: true,
      isPrimary: source.isPrimary,
    });

    target.dispatchEvent(event);
  }
}

function mapSkiaToPixiClient(
  pixiView: HTMLCanvasElement,
  skiaCanvas: HTMLCanvasElement,
  ev: PointerEvent,
): { clientX: number; clientY: number } {
  const skiaRect = skiaCanvas.getBoundingClientRect();
  const pixiRect = pixiView.getBoundingClientRect();
  const scaleX = skiaCanvas.width / skiaRect.width;
  const scaleY = skiaCanvas.height / skiaRect.height;
  const sceneX = (ev.clientX - skiaRect.left) * scaleX;
  const sceneY = (ev.clientY - skiaRect.top) * scaleY;
  return {
    clientX: pixiRect.left + (sceneX / skiaCanvas.width) * pixiRect.width,
    clientY: pixiRect.top + (sceneY / skiaCanvas.height) * pixiRect.height,
  };
}

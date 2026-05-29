import type { Container } from "pixi.js-legacy";
import type { CanvasKit, Surface } from "./canvaskit-global";
import { convertPixiContainerToSkia } from "./PixiToSkiaConverter";

export class SkiaSurfaceRenderer {
  private surface: Surface | null = null;

  constructor(
    private readonly ck: CanvasKit,
    private readonly canvasElement: HTMLCanvasElement,
  ) {}

  resize(width: number, height: number): void {
    this.canvasElement.width = width;
    this.canvasElement.height = height;
    this.disposeSurface();
    this.surface = this.ck.MakeSWCanvasSurface(this.canvasElement);
    if (!this.surface) {
      throw new Error("MakeSWCanvasSurface вернул null");
    }
  }

  render(
    container: Container,
    clearColor = [0.118, 0.118, 0.118, 1] as [number, number, number, number],
  ): void {
    if (!this.surface) {
      this.resize(
        this.canvasElement.width || 640,
        this.canvasElement.height || 480,
      );
    }
    const surface = this.surface;
    if (!surface) {
      return;
    }

    const canvas = surface.getCanvas();
    canvas.clear(this.ck.Color4f(...clearColor));
    convertPixiContainerToSkia(this.ck, container, canvas);
    surface.flush();
  }

  dispose(): void {
    this.disposeSurface();
  }

  private disposeSurface(): void {
    if (this.surface) {
      this.surface.dispose();
      this.surface = null;
    }
  }
}

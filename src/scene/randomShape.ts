import { Graphics } from "pixi.js-legacy";
import type { InteractionHandler } from "./demoScene";

const COLORS = [0xff6b6b, 0x4ecdc4, 0xffe66d, 0x95e1d3, 0xf38181, 0xaa96da];

export function createRandomGraphic(onInteract?: InteractionHandler): Graphics {
  const g = new Graphics();
  const color = COLORS[Math.floor(Math.random() * COLORS.length)];
  const x = 40 + Math.random() * 520;
  const y = 40 + Math.random() * 380;
  const kind = Math.floor(Math.random() * 3);

  g.position.set(x, y);
  g.angle = Math.random() * 60 - 30;
  g.scale.set(0.8 + Math.random() * 0.6);
  g.eventMode = "static";
  g.cursor = "grab";
  g.on("pointerdown", () => {
    console.log("random shape pointerdown");
    onInteract?.("random pointerdown");
    g.alpha = 0.6;
    setTimeout(() => {
      g.alpha = 1;
    }, 120);
  });
  g.on("pointerup", () => {
    onInteract?.("random pointerup");
  });

  if (kind === 0) {
    const w = 40 + Math.random() * 120;
    const h = 40 + Math.random() * 80;
    g.beginFill(color)
      .drawRect(-w / 2, -h / 2, w, h)
      .endFill();
  } else if (kind === 1) {
    g.lineStyle(4 + Math.random() * 8, color, 1);
    g.moveTo(0, 0);
    g.lineTo(80 + Math.random() * 100, Math.random() * 120 - 60);
    g.hitArea = g.getBounds().pad(10);
  } else {
    g.beginFill(color)
      .drawEllipse(0, 0, 30 + Math.random() * 70, 20 + Math.random() * 50)
      .endFill();
  }

  return g;
}

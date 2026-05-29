import {
  Container,
  DisplayObject,
  Graphics,
  Rectangle,
  Sprite,
  Texture,
} from "pixi.js-legacy";

export type InteractionHandler = (message: string) => void;

export function createDemoScene(onInteract?: InteractionHandler): Container {
  const mainContainer = new Container();
  const subContainer = new Container();
  const g1 = new Graphics();
  const g2 = new Graphics();
  const g3 = new Graphics();
  const g4 = new Graphics();

  g1.beginFill(0xff0000).drawEllipse(0, 0, 200, 100).endFill();
  g1.position.set(200, 100);
  g1.angle = 30;
  enablePointer(g1);
  bindPointer(g1, "g1", onInteract, ["pointerdown"]);

  g2.beginFill(0x0000ff).drawRect(-50, -75, 100, 150).endFill();
  g2.position.set(120, 60);
  g2.angle = 15;
  g2.scale.set(1.5, 1.7);
  enablePointer(g2);
  bindPointer(g2, "g2", onInteract, ["pointerup"]);

  g3.lineStyle(10, 0xffffff, 1).moveTo(0, 0).lineTo(150, 100);
  g3.angle = -20;
  enablePointer(g3);

  g4.lineStyle(10, 0xffff00, 1).moveTo(0, 70).lineTo(150, -30);
  g4.angle = 20;
  enablePointer(g4);

  subContainer.position.set(75, 50);
  subContainer.addChild(g3, g4);
  mainContainer.addChild(subContainer, g1, g2);

  for (const line of [g3, g4]) {
    line.hitArea = new Rectangle(-20, -20, 170, 130);
    bindPointer(line, line === g3 ? "g3" : "g4", onInteract, [
      "pointerdown",
      "pointerup",
    ]);
  }

  const labelCanvas = document.createElement("canvas");
  labelCanvas.width = 120;
  labelCanvas.height = 40;
  const ctx = labelCanvas.getContext("2d");
  if (ctx) {
    ctx.fillStyle = "#2d3436";
    ctx.fillRect(0, 0, 120, 40);
    ctx.fillStyle = "#dfe6e9";
    ctx.font = "14px sans-serif";
    ctx.fillText("PNG Sprite", 8, 24);
  }
  const sprite = Sprite.from(Texture.from(labelCanvas));
  sprite.position.set(400, 320);
  sprite.angle = -8;
  enablePointer(sprite);
  sprite.hitArea = new Rectangle(0, 0, sprite.width, sprite.height);
  bindPointer(sprite, "sprite", onInteract, ["pointerdown", "pointerup"]);

  mainContainer.eventMode = "passive";
  subContainer.eventMode = "passive";

  return mainContainer;
}

function enablePointer(target: DisplayObject): void {
  target.eventMode = "static";
  target.cursor = "grab";
}

function bindPointer(
  target: DisplayObject,
  label: string,
  onInteract: InteractionHandler | undefined,
  types: Array<"pointerdown" | "pointerup">,
): void {
  for (const type of types) {
    target.on(type, () => {
      const message = `${label} ${type}`;
      console.log(message);
      onInteract?.(message);
      pulse(target);
    });
  }
}

function pulse(target: DisplayObject): void {
  const base = target.alpha;
  target.alpha = 0.55;
  setTimeout(() => {
    target.alpha = base;
  }, 120);
}

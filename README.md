# Pixi → Skia

Демо: `pixi.js-legacy@7.2.4` (`forceCanvas`), отрисовка `PIXI.Container` в Skia (CanvasKit с PDF), `pointerdown`/`pointerup` на Pixi и Skia, векторный PDF (растр только для `PIXI.Sprite`).

## Запуск

```bash
yarn install
yarn dev
```

Откройте http://localhost:5173 — кнопки добавляют фигуры и скачивают PDF.

```bash
yarn test
yarn build
```

## WASM с PDF

В `public/skia/` лежит сборка **canvaskit-pdf** (Skia + PDF backend). Пересборка:

```bash
yarn build:canvaskit-pdf
```

Требуются depot_tools, emsdk и клон Skia (см. `scripts/build-canvaskit-pdf.sh`).

import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 5173,
  },
  assetsInclude: ['**/*.wasm'],
  resolve: {
    dedupe: ['pixi.js-legacy', '@pixi/core', '@pixi/display', '@pixi/graphics', '@pixi/sprite'],
  },
});

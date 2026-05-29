#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT_DIR="$ROOT/public/skia"
SKIA_DIR="${SKIA_DIR:-$ROOT/.skia}"

echo "Сборка CanvasKit с PDF backend"
echo "SKIA_DIR=$SKIA_DIR"
echo "OUT_DIR=$OUT_DIR"

if [[ ! -d "$SKIA_DIR/modules/canvaskit" ]]; then
  echo "Клонируйте Skia: git clone https://github.com/google/skia.git $SKIA_DIR"
  echo "Затем: cd $SKIA_DIR && python3 tools/git-sync-deps"
  exit 1
fi

cd "$SKIA_DIR/modules/canvaskit"

export SKIA_ENABLE_SKPDF=true
export SKIA_ENABLE_SKSHAPER=false
export SKIA_ENABLE_SKPARAGRAPH=false

if [[ -x compile.sh ]]; then
  ./compile.sh release pdf
else
  echo "Запустите compile.sh из modules/canvaskit с флагом pdf (см. документацию Skia)"
  exit 1
fi

mkdir -p "$OUT_DIR"
cp -f build/canvaskit*.js build/canvaskit*.wasm "$OUT_DIR/" 2>/dev/null || true
echo "Готово (если compile.sh положил артефакты в build/)"

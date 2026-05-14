#!/usr/bin/env bash
# Unity WebGL 빌드 파일을 mud_web 참조 레포에서 동기화한다.
# git에는 ignore 되어있으므로 신규 클론 후 반드시 한 번 실행.
set -euo pipefail

SRC="${MUD_WEB_REF:-/Users/ric/projects/mud_web_ref}"
DEST="$(cd "$(dirname "$0")/.." && pwd)/public/unity"

if [[ ! -d "$SRC/public/unity" ]]; then
  echo "[sync-unity] $SRC/public/unity 가 없습니다. 먼저 클론:"
  echo "  git clone --depth 1 https://github.com/qwerty2944/mud_web $SRC"
  exit 1
fi

mkdir -p "$DEST"
cp "$SRC"/public/unity/characterbuilder.{data,wasm,framework.js,loader.js} "$DEST/"
echo "[sync-unity] 동기화 완료 → $DEST"
ls -lh "$DEST"

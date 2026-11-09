#!/usr/bin/env bash
# Uso: ./gerar.sh roteiros/meu-video.json  ->  out/meu-video.mp4 (1080x1920, 30 fps)
set -euo pipefail
cd "$(dirname "$0")"
roteiro="${1:-roteiros/exemplo.json}"
nome="$(basename "$roteiro" .json)"
[ -d node_modules ] || npm i --silent
# Na nuvem do Claude o Chrome do Remotion não baixa: usa o Chromium já instalado.
extra=()
shell=/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell
[ -x "$shell" ] && extra=(--browser-executable="$shell")
npx remotion render Lista "out/$nome.mp4" --props="$roteiro" "${extra[@]}"
echo "Pronto: fabrica-video/out/$nome.mp4"

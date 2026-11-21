#!/usr/bin/env bash
# Uso: ./gerar.sh roteiros/<nome>.json  ->  out/<nome>.mp4 (1080x1920, 30 fps)
# 1) gera voz por cena (Gemini TTS), tempos, legenda e trilha  2) renderiza o 3D
set -euo pipefail
cd "$(dirname "$0")"
roteiro="${1:-roteiros/o-vigia.json}"
nome="$(python3 -c 'import json,sys; print(json.load(open(sys.argv[1]))["nome"])' "$roteiro")"
[ -d node_modules ] || npm i --silent
python3 -I scripts/preparar.py "$roteiro"
# Na nuvem do Claude o Chrome do Remotion não baixa: usa o Chromium já instalado.
extra=()
shell=$(ls -d /opt/pw-browsers/chromium_headless_shell-*/chrome-headless-shell-linux64/chrome-headless-shell 2>/dev/null | head -1 || true)
[ -n "$shell" ] && [ -x "$shell" ] && extra=(--browser-executable="$shell")
# Sem placa de vídeo: WebGL por software (swangle).
npx remotion render Historia "out/$nome.mp4" --props="public/$nome/tempos.json" --gl=swangle "${extra[@]}"
echo "Pronto: fabrica-historia/out/$nome.mp4"

#!/usr/bin/env bash
# Gera o vídeo: quadros (Chromium) + trilha (Python) + MP4 (ffmpeg).
# Precisa de: python3 com playwright e numpy, Chromium e ffmpeg.
set -e
cd "$(dirname "$0")"
W=../work
if ! curl -s -o /dev/null http://localhost:8765/bn-digital/video-placas/fonte/index.html; then
  python3 -m http.server 8765 --directory ../../.. >/dev/null 2>&1 & SRV=$!
  trap 'kill $SRV' EXIT; sleep 1
fi
rm -rf "$W/frames"
python3 montar_tempo.py
DUR=$(python3 -c "import json;print(json.load(open('../work/tempo.json'))['fim'])")
python3 capture.py frames 30 "$DUR" "$W/frames"
python3 synth.py "$W/trilha.wav"
# capa: placa na mesa com o título (2,8 s depois do início da cena da placa), também usada como 1º quadro
CAPA=$(python3 -c "import json;print('f%05d.jpg' % int((json.load(open('../work/tempo.json'))['placa']['a'] + 2.8) * 30))")
cp "$W/frames/$CAPA" ../capa.jpg
cp "$W/frames/$CAPA" "$W/frames/f00000.jpg"
ffmpeg -y -loglevel error -framerate 30 -i "$W/frames/f%05d.jpg" -i "$W/trilha.wav" \
  -c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p -c:a aac -b:a 192k -shortest -movflags +faststart ../placas.mp4
echo "pronto: bn-digital/video-placas/placas.mp4"

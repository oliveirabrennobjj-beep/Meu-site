"""Narração grátis, rodando no próprio computador (Kokoro, voz pm_alex em português do Brasil).

Uso: python3 falar.py <pasta dos modelos> <texto.txt> <saida.wav> [voz] [velocidade]

Precisa de: pip install kokoro-onnx soundfile, e dos arquivos kokoro-v1.0.onnx e voices-v1.0.bin
(https://github.com/thewh1teagle/kokoro-onnx/releases/tag/model-files-v1.0).
Dicas de pronúncia: escreva "chassí", "virabrequím", "frésta", "a bê ésse" (ABS), "um ponto zero" (1.0).
Depois: ffmpeg pra mp3 e python3 alinhar.py <audio.mp3> narracao.txt src/words.json.
"""
import sys, re
import numpy as np
import soundfile as sf
from kokoro_onnx import Kokoro

mdir, txt, out = sys.argv[1:4]
voz = sys.argv[4] if len(sys.argv) > 4 else "pm_alex"
vel = float(sys.argv[5]) if len(sys.argv) > 5 else 1.1
k = Kokoro(f"{mdir}/kokoro-v1.0.onnx", f"{mdir}/voices-v1.0.bin")
texto = open(txt, encoding="utf-8").read().strip()
# uma frase por vez, com pausa curta entre elas
frases = [f.strip() for f in re.split(r"(?<=[.!?])\s+", texto) if f.strip()]
partes, sr = [], 24000
for f in frases:
    s, sr = k.create(f, voice=voz, speed=vel, lang="pt-br")
    partes.append(s)
    partes.append(np.zeros(int(sr * 0.28), dtype=s.dtype))
sf.write(out, np.concatenate(partes), sr)
print(out, round(sum(len(p) for p in partes) / sr, 1), "s")

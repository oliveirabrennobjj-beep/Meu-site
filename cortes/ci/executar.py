#!/usr/bin/env python3
"""Executa o pedido em cortes/pedido.json e grava o resultado em saida/.

modo "sonda": cópia leve do vídeo inteiro, legendas e uma amostra em alta.
modo "cortes": roda cortes/editar.py para cada corte do pedido.
"""
import json
import shutil
import subprocess
import sys
from pathlib import Path

pedido = json.loads(Path('cortes/pedido.json').read_text())
fonte, saida = Path('fonte'), Path('saida')
saida.mkdir(exist_ok=True)
video = fonte / 'video.mp4'


def rodar(cmd):
    print('+', ' '.join(str(c) for c in cmd), flush=True)
    subprocess.run(cmd, check=True)


for extra in list(fonte.glob('*.json')) + list(fonte.glob('*.json3')):
    shutil.copy(extra, saida / extra.name)

if pedido['modo'] == 'sonda':
    rodar(['ffmpeg', '-v', 'error', '-stats', '-i', video, '-vf', 'fps=12,scale=-2:360',
           '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '30', '-g', '24',
           '-c:a', 'libopus', '-b:a', '32k', '-ac', '1', saida / 'proxy.mp4'])
    for i, inicio in enumerate(pedido.get('amostras', [120])):
        rodar(['ffmpeg', '-v', 'error', '-ss', str(inicio), '-i', video, '-t', '12',
               '-c', 'copy', saida / f'amostra_{i}.mp4'])
elif pedido['modo'] == 'cortes':
    rodar([sys.executable, 'cortes/editar.py', '--video', video, '--pedido', 'cortes/pedido.json',
           '--saida', saida])
else:
    sys.exit(f"modo desconhecido: {pedido['modo']}")

rodar(['du', '-sh', saida])

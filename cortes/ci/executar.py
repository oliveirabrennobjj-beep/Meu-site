#!/usr/bin/env python3
"""Executa o pedido em cortes/pedido.json e grava o resultado em saida/.

modo "sonda": cópia leve do vídeo inteiro, legendas e uma amostra em alta.
modo "brutos": recorta cada corte do pedido com margem, em alta, e transcreve com tempo por palavra.
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
    if video.stat().st_size < 60_000_000:  # arquivo pequeno: devolve o original também
        shutil.copy(video, saida / 'original.mp4')
    rodar(['ffmpeg', '-v', 'error', '-stats', '-i', video, '-vf', 'fps=12,scale=-2:360',
           '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '30', '-g', '24',
           '-c:a', 'libopus', '-b:a', '32k', '-ac', '1', saida / 'proxy.mp4'])
    for i, inicio in enumerate(pedido.get('amostras', [120])):
        rodar(['ffmpeg', '-v', 'error', '-ss', str(inicio), '-i', video, '-t', '12',
               '-c', 'copy', saida / f'amostra_{i}.mp4'])
elif pedido['modo'] == 'brutos':
    margem = pedido.get('margem', 8)
    meta = []
    for c in pedido['cortes']:
        ini = max(c['ini'] - margem, 0)
        dur = c['fim'] + margem - ini
        nome = f"{c['n']:02d}.mp4"
        rodar(['ffmpeg', '-v', 'error', '-ss', f'{ini:.3f}', '-i', video, '-t', f'{dur:.3f}',
               '-vf', "scale=-2:'min(1080,ih)'", '-c:v', 'libx264', '-preset', 'medium', '-crf', '21',
               '-c:a', 'aac', '-b:a', '160k', saida / nome])
        meta.append({'n': c['n'], 'arquivo': nome, 'ini_bruto': ini, 'dur_bruto': dur})
    (saida / 'meta.json').write_text(json.dumps(meta))
else:
    sys.exit(f"modo desconhecido: {pedido['modo']}")

if pedido.get('transcrever', pedido['modo'] == 'brutos'):
    alvos = sorted(p for p in saida.glob('*.mp4') if p.name != 'proxy.mp4' and not p.name.startswith('amostra'))
    rodar([sys.executable, 'cortes/ci/transcrever.py', pedido.get('idioma', 'pt')] + alvos)

rodar(['du', '-sh', saida])

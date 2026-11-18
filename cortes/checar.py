#!/usr/bin/env python3
"""Prepara um corte pronto para a checagem antes de postar (skill checar-viral).

Gera, ao lado do vídeo, numa pasta <video>.checagem/:
  - inicio.jpg: os 3 primeiros segundos, 4 quadros por segundo (o hook)
  - geral.jpg: um quadro a cada ~3 s do vídeo inteiro
  - fim.jpg: os 3 últimos segundos
  - fala.txt: a fala com tempos (faster-whisper)
e imprime as medidas técnicas: duração, formato, volume, silêncios e primeira fala.

Uso: checar.py <video.mp4> [--sem-fala]
"""
import argparse
import json
import re
import subprocess
import sys
from pathlib import Path

AQUI = Path(__file__).resolve().parent


def sonda(video):
    r = subprocess.run(['ffprobe', '-v', 'error', '-show_entries',
                        'stream=codec_type,width,height:format=duration', '-of', 'json', str(video)],
                       capture_output=True, text=True, check=True)
    d = json.loads(r.stdout)
    v = next(s for s in d['streams'] if s['codec_type'] == 'video')
    tem_audio = any(s['codec_type'] == 'audio' for s in d['streams'])
    return float(d['format']['duration']), v['width'], v['height'], tem_audio


def folha(video, tempos, destino, colunas, largura=270):
    pasta = destino.parent / (destino.stem + '_q')
    pasta.mkdir(exist_ok=True)
    for i, t in enumerate(tempos):
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', f'{t:.2f}', '-i', str(video), '-frames:v', '1',
                        '-vf', f"scale={largura}:-2,drawtext=text='{t:.1f}s':x=8:y=8:fontsize=22:"
                               "fontcolor=white:box=1:boxcolor=black@0.6",
                        str(pasta / f'{i:03d}.jpg')], check=True)
    linhas = -(-len(tempos) // colunas)
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', str(pasta / '%03d.jpg'),
                    '-vf', f'tile={colunas}x{linhas}:padding=4:color=black', '-frames:v', '1', str(destino)],
                   check=True)
    for f in pasta.glob('*.jpg'):
        f.unlink()
    pasta.rmdir()


def volume(video):
    r = subprocess.run(['ffmpeg', '-hide_banner', '-i', str(video), '-af', 'ebur128', '-f', 'null', '-'],
                       capture_output=True, text=True)
    m = re.findall(r'I:\s+(-?[\d.]+) LUFS', r.stderr)
    return float(m[-1]) if m else None


def silencios(video, limite=1.0):
    r = subprocess.run(['ffmpeg', '-hide_banner', '-i', str(video), '-af',
                        f'silencedetect=noise=-38dB:d={limite}', '-f', 'null', '-'],
                       capture_output=True, text=True)
    ini = [float(x) for x in re.findall(r'silence_start: (-?[\d.]+)', r.stderr)]
    dur = [float(x) for x in re.findall(r'silence_duration: ([\d.]+)', r.stderr)]
    return list(zip(ini, dur))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('video')
    ap.add_argument('--sem-fala', action='store_true', help='não transcreve')
    a = ap.parse_args()
    video = Path(a.video).resolve()
    saida = video.with_suffix('.checagem')
    saida.mkdir(exist_ok=True)
    dur, w, h, tem_audio = sonda(video)

    folha(video, [i / 4 for i in range(12)], saida / 'inicio.jpg', 6)
    passo = max(dur / 15, 1.5)
    folha(video, [min(i * passo + 0.5, dur - 0.2) for i in range(int(dur / passo) + 1)][:18], saida / 'geral.jpg', 6)
    folha(video, [max(dur - 3 + i * 0.5, 0) for i in range(6)], saida / 'fim.jpg', 6)

    primeira_fala = None
    if tem_audio and not a.sem_fala:
        subprocess.run([str(Path.home() / 'cortes-venv/bin/python'), str(AQUI / 'ci' / 'transcrever.py'), 'pt',
                        str(video)], check=True, capture_output=True)
        palavras = json.loads(video.with_suffix('.palavras.json').read_text())
        video.with_suffix('.palavras.json').rename(saida / 'palavras.json')
        linhas, atual, t0 = [], [], None
        for p in palavras:
            if t0 is None:
                t0 = p['t0']
            atual.append(p['texto'])
            if len(atual) >= 10 or re.search(r'[.?!]$', p['texto']):
                linhas.append(f'[{t0:5.1f}s] ' + ' '.join(atual))
                atual, t0 = [], None
        if atual:
            linhas.append(f'[{t0:5.1f}s] ' + ' '.join(atual))
        (saida / 'fala.txt').write_text('\n'.join(linhas) + '\n')
        primeira_fala = palavras[0]['t0'] if palavras else None

    lufs = volume(video) if tem_audio else None
    sil = silencios(video) if tem_audio else []
    medidas = {
        'duracao_s': round(dur, 1),
        'formato': f'{w}x{h}',
        'vertical_9_16': abs(w / h - 9 / 16) < 0.02,
        'volume_lufs': lufs,
        'primeira_fala_s': primeira_fala,
        'silencios_acima_de_1s': [[round(i, 1), round(d, 1)] for i, d in sil],
        'pasta': str(saida),
    }
    (saida / 'medidas.json').write_text(json.dumps(medidas, ensure_ascii=False, indent=1))
    print(json.dumps(medidas, ensure_ascii=False, indent=1))


if __name__ == '__main__':
    sys.exit(main())

#!/usr/bin/env python3
"""Baixa só os trechos escolhidos de uma VOD da Twitch, em alta, sem baixar a live inteira.

A Twitch serve a VOD em pedaços de 10 s; o script pega os pedaços que cobrem cada corte
(com margem), junta, recorta e grava NN.mp4 + meta.json no formato que montar.py lê.

Uso: twitch.py <id_da_vod> <lista.json> <pasta_saida> [--qualidade 1080p60] [--margem 8]
"""
import argparse
import json
import subprocess
import tempfile
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path


def url_playlist(vod, qualidade):
    fmt = f'{qualidade}/best[height<=1080]/best'
    r = subprocess.run([str(Path.home() / 'cortes-venv/bin/yt-dlp'), '--no-warnings', '-f', fmt, '-g',
                        f'https://www.twitch.tv/videos/{vod}'], capture_output=True, text=True, check=True)
    return r.stdout.strip().splitlines()[-1]


def baixar_pedaco(base, n, destino):
    for nome in (f'{n}.ts', f'{n}-muted.ts', f'{n}-unmuted.ts'):
        r = subprocess.run(['curl', '-sS', '--fail', '--max-time', '120', '-o', str(destino), f'{base}/{nome}'])
        if r.returncode == 0 and destino.stat().st_size > 1000:
            return True
    return False


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('vod')
    ap.add_argument('lista')
    ap.add_argument('saida')
    ap.add_argument('--qualidade', default='1080p60')
    ap.add_argument('--margem', type=float, default=8)
    a = ap.parse_args()

    cortes = json.loads(Path(a.lista).read_text())['cortes']
    saida = Path(a.saida)
    saida.mkdir(parents=True, exist_ok=True)
    base = url_playlist(a.vod, a.qualidade).rsplit('/', 1)[0]
    meta = []
    for c in cortes:
        ini = max(c['ini'] - a.margem, 0)
        fim = c['fim'] + a.margem
        primeiro, ultimo = int(ini // 10), int(fim // 10)
        with tempfile.TemporaryDirectory() as tmp:
            tmp = Path(tmp)
            nums = list(range(primeiro, ultimo + 1))
            with ThreadPoolExecutor(8) as ex:
                ok = list(ex.map(lambda n: baixar_pedaco(base, n, tmp / f'{n}.ts'), nums))
            if not all(ok):
                print(f"corte {c['n']}: faltaram pedaços, pulando", flush=True)
                continue
            # junta os bytes dos pedaços (o concat do ffmpeg se perde nas VODs com faixa timed_id3)
            junto = tmp / 'junto.ts'
            with open(junto, 'wb') as f:
                for n in nums:
                    f.write((tmp / f'{n}.ts').read_bytes())
            nome = f"{c['n']:02d}.mp4"
            # recorta e normaliza para 30 fps (o editor trabalha em 30)
            subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', f'{ini - primeiro * 10:.3f}', '-i', str(junto),
                            '-t', f'{fim - ini:.3f}', '-vf', 'fps=30', '-c:v', 'libx264', '-preset', 'fast',
                            '-crf', '18', '-c:a', 'aac', '-b:a', '160k', str(saida / nome)], check=True)
        meta.append({'n': c['n'], 'arquivo': nome, 'ini_bruto': ini, 'dur_bruto': fim - ini})
        print(f"corte {c['n']}: ok ({fim - ini:.0f} s)", flush=True)
    (saida / 'meta.json').write_text(json.dumps(meta))


if __name__ == '__main__':
    main()

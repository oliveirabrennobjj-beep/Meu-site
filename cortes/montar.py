#!/usr/bin/env python3
"""Edita os cortes brutos que o GitHub devolveu (modo "brutos").

Entrada: a pasta aberta por ci/abrir.sh, com NN.mp4, NN.palavras.json e meta.json,
e cortes/lista.json com gancho, teaser e tempos de cada corte.
Saída: prontos/NN-gancho.mp4, verticais, com legenda, título e teaser.

Uso: montar.py <pasta_brutos> [--so 1,5,9] [--saida prontos]
"""
import argparse
import subprocess
import tempfile
import json
import re
import unicodedata
from pathlib import Path

import editar

AQUI = Path(__file__).resolve().parent


def nome_arquivo(n, gancho):
    base = unicodedata.normalize('NFKD', gancho).encode('ascii', 'ignore').decode().lower()
    return f"{n:02d}-{re.sub(r'[^a-z0-9]+', '-', base).strip('-')[:40]}.mp4"


def sem_pausas(video, ini, fim, palavras, destino, max_pausa=1.1, folga=0.28):
    """Tira os silêncios longos (jump cut). Devolve (video_novo, palavras_novas, duracao) ou None."""
    if not palavras:
        return None
    dur = fim - ini
    segs = []
    a = max(0.0, palavras[0]['t0'] - folga) if palavras[0]['t0'] > 1.5 else 0.0
    ult = palavras[0]['t1']
    for w in palavras[1:]:
        if w['t0'] - ult > max_pausa:
            segs.append((a, min(ult + folga, dur)))
            a = max(w['t0'] - folga, 0)
        ult = max(ult, w['t1'])
    segs.append((a, min(ult + 0.6, dur)))
    tirado = dur - sum(b - x for x, b in segs)
    if tirado < 2.0:
        return None
    filtros, rotulos = [], ''
    for i, (x, b) in enumerate(segs):
        filtros.append(f'[0:v]trim=start={ini + x:.3f}:end={ini + b:.3f},setpts=PTS-STARTPTS[v{i}]')
        filtros.append(f'[0:a]atrim=start={ini + x:.3f}:end={ini + b:.3f},asetpts=PTS-STARTPTS[a{i}]')
        rotulos += f'[v{i}][a{i}]'
    filtros.append(f'{rotulos}concat=n={len(segs)}:v=1:a=1[v][a]')
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', str(video), '-filter_complex', ';'.join(filtros),
                    '-map', '[v]', '-map', '[a]', '-r', '30', '-c:v', 'libx264', '-preset', 'fast', '-crf', '17',
                    '-c:a', 'aac', '-b:a', '192k', str(destino)], check=True)
    novas, base = [], 0.0
    for x, b in segs:
        for w in palavras:
            if x <= w['t0'] < b:
                novas.append(dict(w, t0=w['t0'] - x + base, t1=min(w['t1'], b) - x + base))
        base += b - x
    return destino, novas, base


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('brutos')
    ap.add_argument('--so', help='números dos cortes, separados por vírgula')
    ap.add_argument('--saida', default=str(AQUI / 'prontos'))
    ap.add_argument('--credito', default='')
    ap.add_argument('--lista', default=str(AQUI / 'lista.json'))
    ap.add_argument('--estilo', default='ref', choices=['ref', 'game', 'game-titulo', 'game-amarelo', 'padrao'])
    ap.add_argument('--nome', default='EDUARDA CAMPOPIANO', help='nome padrão de quem fala')
    ap.add_argument('--arroba', default='', help='@ do seu canal')
    ap.add_argument('--com-pausas', action='store_true', help='não tira os silêncios longos')
    ap.add_argument('--camera', help='moldura padrão da câmera x0,y0,x1,y1 (0-1) quando o rosto some')
    a = ap.parse_args()

    brutos = Path(a.brutos)
    lista = json.loads(Path(a.lista).read_text())
    meta = {m['n']: m for m in json.loads((brutos / 'meta.json').read_text())}
    so = {int(x) for x in a.so.split(',')} if a.so else None
    credito = a.credito or f"trecho: {lista.get('fonte', '')}".strip(': ')

    for c in lista['cortes']:
        if (so and c['n'] not in so) or c['n'] not in meta:
            continue
        m = meta[c['n']]
        video = brutos / m['arquivo']
        palavras = json.loads(video.with_suffix('.palavras.json').read_text())
        # Tempos do corte dentro do arquivo bruto (que tem margem antes e depois).
        ini, fim = c['ini'] - m['ini_bruto'], c['fim'] - m['ini_bruto']
        # Ajusta o início e o fim para não cortar palavra no meio.
        antes = [p for p in palavras if p['t0'] <= ini + 0.3]
        if antes and ini - antes[-1]['t0'] < 1.2:
            ini = max(antes[-1]['t0'] - 0.15, 0)
        depois = [p for p in palavras if p['t1'] >= fim - 0.3]
        if depois and depois[0]['t1'] - fim < 1.5:
            fim = min(depois[0]['t1'] + 0.35, m['dur_bruto'])
        rel = [dict(p, t0=p['t0'] - ini, t1=p['t1'] - ini) for p in palavras if p['t1'] > ini and p['t0'] < fim]
        tmp = None
        if not a.com_pausas and a.estilo.startswith('game'):
            tmp = Path(tempfile.mkdtemp()) / 'sem_pausas.mp4'
            r = sem_pausas(video, ini, fim, rel, tmp)
            if r:
                video, rel, dur = r
                ini, fim = 0.0, dur
        teaser = editar.achar_frase(rel, c['teaser']) if c.get('teaser') else None
        if teaser and teaser[1] - teaser[0] > 4.5:   # frase espalhada: fica só com o fim (o soco)
            teaser = (teaser[1] - 3.5, teaser[1])
        if teaser and teaser[0] < 2.5:   # clímax já está no começo: teaser não acrescenta nada
            teaser = None
        destino = Path(a.saida) / nome_arquivo(c['n'], c['gancho'])
        if a.estilo == 'game-amarelo':   # título curto e seco, sem emoji (fonte condensada)
            titulo, nome = c['gancho'], ''
        elif a.estilo == 'ref' or a.estilo.startswith('game'):
            fim_txt = '' if c['gancho'].rstrip().endswith(('?', '!', '...')) else '!'
            titulo = f"•{c['gancho']}{fim_txt} {c.get('emoji', '🤯')}"
            nome = f"•{c.get('nome', a.nome)} 🎙️🔥"
        else:
            titulo, nome = c['gancho'], ''
        r = editar.editar_com_teaser(video, ini, fim, rel, titulo, destino, credito, teaser,
                                     estilo=a.estilo, nome=nome, arroba=a.arroba,
                                     camera=[float(x) for x in a.camera.split(',')] if a.camera else None)
        print(json.dumps({'n': c['n'], **r}, ensure_ascii=False)[:300], flush=True)


if __name__ == '__main__':
    main()

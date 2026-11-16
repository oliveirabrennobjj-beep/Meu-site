#!/usr/bin/env python3
"""Edita os cortes brutos que o GitHub devolveu (modo "brutos").

Entrada: a pasta aberta por ci/abrir.sh, com NN.mp4, NN.palavras.json e meta.json,
e cortes/lista.json com gancho, teaser e tempos de cada corte.
Saída: prontos/NN-gancho.mp4, verticais, com legenda, título e teaser.

Uso: montar.py <pasta_brutos> [--so 1,5,9] [--saida prontos]
"""
import argparse
import json
import re
import unicodedata
from pathlib import Path

import editar

AQUI = Path(__file__).resolve().parent


def nome_arquivo(n, gancho):
    base = unicodedata.normalize('NFKD', gancho).encode('ascii', 'ignore').decode().lower()
    return f"{n:02d}-{re.sub(r'[^a-z0-9]+', '-', base).strip('-')[:40]}.mp4"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('brutos')
    ap.add_argument('--so', help='números dos cortes, separados por vírgula')
    ap.add_argument('--saida', default=str(AQUI / 'prontos'))
    ap.add_argument('--credito', default='')
    a = ap.parse_args()

    brutos = Path(a.brutos)
    lista = json.loads((AQUI / 'lista.json').read_text())
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
        teaser = editar.achar_frase(rel, c['teaser']) if c.get('teaser') else None
        if teaser and teaser[0] < 2.5:   # clímax já está no começo: teaser não acrescenta nada
            teaser = None
        destino = Path(a.saida) / nome_arquivo(c['n'], c['gancho'])
        r = editar.editar_com_teaser(video, ini, fim, rel, c['gancho'], destino, credito, teaser)
        print(json.dumps({'n': c['n'], **r}, ensure_ascii=False)[:300], flush=True)


if __name__ == '__main__':
    main()

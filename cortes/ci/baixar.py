#!/usr/bin/env python3
"""Baixa o vídeo do pedido para fonte/ (pula se o cache já trouxe o arquivo)."""
import json
import subprocess
import sys
from pathlib import Path

pedido = json.loads(Path('cortes/pedido.json').read_text())
url = pedido['url']
fonte = Path('fonte')
fonte.mkdir(exist_ok=True)

if (fonte / 'video.mp4').exists():
    print('vídeo já está no cache')
    sys.exit(0)

FORMATO = ('bv*[height<=1080][vcodec^=avc1]+ba[ext=m4a]/'
           'bv*[height<=1080]+ba/b[height<=1080]/b')
base = ['yt-dlp', '--no-playlist', '--js-runtimes', 'node', '-f', FORMATO,
        '--merge-output-format', 'mp4', '-o', 'fonte/video.%(ext)s', '--write-info-json',
        '--retries', '5', '--fragment-retries', '10', '--concurrent-fragments', '4',
        '--no-progress']
# Clientes tentados em ordem; o YouTube às vezes barra IP de datacenter em um e libera outro.
tentativas = [[], ['--extractor-args', 'youtube:player_client=tv_simply,web_safari'],
              ['--extractor-args', 'youtube:player_client=android_vr'],
              ['--extractor-args', 'youtube:player_client=mweb,ios'],
              ['--extractor-args', 'youtube:player_client=web_embedded,tv']]

for extra in tentativas:
    print('tentando', extra or 'padrão', flush=True)
    if subprocess.run(base + extra + [url]).returncode == 0 and (fonte / 'video.mp4').exists():
        break
else:
    sys.exit('nenhum cliente do yt-dlp conseguiu baixar o vídeo')

# Legendas automáticas (tempo por palavra). Falhar aqui não derruba o pedido.
subprocess.run(['yt-dlp', '--no-playlist', '--js-runtimes', 'node', '--skip-download',
                '--write-auto-subs', '--write-subs', '--sub-langs', 'pt.*', '--sub-format', 'json3',
                '-o', 'fonte/legenda.%(ext)s', url])
subprocess.run(['ffprobe', '-v', 'error', '-show_entries',
                'stream=codec_name,width,height,avg_frame_rate:format=duration,size',
                '-of', 'default=nw=1', 'fonte/video.mp4'])

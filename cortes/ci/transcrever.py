#!/usr/bin/env python3
"""Transcreve arquivos com tempo por palavra (faster-whisper) e grava <arquivo>.palavras.json."""
import json
import os
import subprocess
import sys
from pathlib import Path

import numpy as np
from faster_whisper import WhisperModel


def audio(arq):
    """Áudio mono 16 kHz via ffmpeg (evita depender da versão do PyAV)."""
    bruto = subprocess.run(['ffmpeg', '-v', 'error', '-i', str(arq), '-ac', '1', '-ar', '16000', '-f', 's16le', '-'],
                           capture_output=True, check=True).stdout
    return np.frombuffer(bruto, np.int16).astype(np.float32) / 32768.0


def transcrever(arquivos, idioma='pt', modelo='large-v3-turbo'):
    m = WhisperModel(modelo, device='cpu', compute_type='int8', cpu_threads=os.cpu_count() or 4)
    for arq in arquivos:
        segmentos, _ = m.transcribe(audio(arq), language=idioma, word_timestamps=True, vad_filter=True,
                                    condition_on_previous_text=False, beam_size=5)
        palavras = [{'texto': p.word.strip(), 't0': round(p.start, 3), 't1': round(p.end, 3),
                     'conf': round(p.probability, 2)}
                    for s in segmentos for p in (s.words or [])]
        destino = Path(arq).with_suffix('.palavras.json')
        destino.write_text(json.dumps(palavras, ensure_ascii=False))
        print(f'{arq}: {len(palavras)} palavras', flush=True)


if __name__ == '__main__':
    transcrever(sys.argv[2:], idioma=sys.argv[1])

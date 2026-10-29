"""Transcreve a narração em português pra conferir se a voz falou tudo certo.

Uso: python3 ouvir.py <pasta do modelo> <audio.wav> ...
Precisa de: pip install sherpa-onnx soundfile, e do modelo sherpa-onnx-whisper-base
(https://github.com/k2-fsa/sherpa-onnx/releases/tag/asr-models).
"""
import sys
import numpy as np
import soundfile as sf
import sherpa_onnx

m = sys.argv[1]
rec = sherpa_onnx.OfflineRecognizer.from_whisper(
    encoder=f"{m}/base-encoder.int8.onnx", decoder=f"{m}/base-decoder.int8.onnx", tokens=f"{m}/base-tokens.txt", language="pt", task="transcribe"
)
for path in sys.argv[2:]:
    s, sr = sf.read(path, dtype="float32")
    if s.ndim > 1:
        s = s.mean(axis=1)
    if sr != 16000:
        n = int(len(s) * 16000 / sr)
        s = np.interp(np.linspace(0, len(s), n, endpoint=False), np.arange(len(s)), s).astype("float32")
    # whisper ouve 30 s por vez
    out = []
    for i in range(0, len(s), 16000 * 28):
        st = rec.create_stream()
        st.accept_waveform(16000, s[i : i + 16000 * 28])
        rec.decode_stream(st)
        out.append(st.result.text.strip())
    print(path, "→", " ".join(out))

# Monta a linha do tempo do vídeo a partir da locução.
# Se work/vo/<cena>.wav existir para todas as cenas, usa a duração real de cada fala e gera work/locucao.wav.
# Se faltar alguma, estima a duração pelo tamanho do texto (o vídeo sai sem voz).
# Saídas: fonte/tempo.js (lido pelo index.html) e work/tempo.json (lido pelo synth.py).
import json, os, subprocess, wave
import numpy as np

AQUI = os.path.dirname(os.path.abspath(__file__))
WORK = os.path.join(AQUI, "..", "work"); VO = os.path.join(WORK, "vo")
SR = 44100
cfg = json.load(open(os.path.join(AQUI, "locucao.json")))
FALAS = cfg["falas"]

# cena: (voz entra X s depois do início da cena, folga depois da voz)
CENAS = [("gancho", 0.45, 0.35), ("placa", 0.55, 0.1), ("demo", 0.35, 1.4), ("vantagens", 0.45, 0.6), ("atualiza", 0.45, 0.7),
         ("wifi", 0.5, 0.7), ("pix", 0.5, 0.7), ("insta", 0.5, 0.7), ("whats", 0.5, 0.7), ("google", 0.5, 0.8),
         ("outras", 0.5, 0.8), ("personalizada", 0.5, 0.8), ("valor", 0.5, 0.8), ("prova", 0.45, 0.5), ("cta", 0.5, 3.3)]

def ler(path):
    out = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-f", "s16le", "-ac", "1", "-ar", str(SR), "-"], capture_output=True).stdout
    return np.frombuffer(out, "<i2").astype(np.float32) / 32768

def aparar(x, lim=0.02):
    on = np.where(np.abs(x) > lim)[0]
    if len(on) == 0: return x
    return x[max(0, on[0] - int(0.03 * SR)): min(len(x), on[-1] + int(0.08 * SR))]

tem_voz = all(os.path.exists(os.path.join(VO, f"{n}.wav")) or os.path.exists(os.path.join(VO, f"{n}.mp3")) for n, _, _ in CENAS)
audios = {n: aparar(ler(next(os.path.join(VO, f"{n}.{e}") for e in ("wav", "mp3") if os.path.exists(os.path.join(VO, f"{n}.{e}"))))) for n, _, _ in CENAS} if tem_voz else {}
dur = {n: (len(audios[n]) / SR if tem_voz else round(len(FALAS[n]) / 16.5 + 0.3, 2)) for n, _, _ in CENAS}

t = 0.0; TL = {}
for nome, lead, tail in CENAS:
    d = dur[nome]
    if nome == "gancho": tail = max(tail, 3.5 - lead - d)
    if nome == "demo": tail = max(tail, 6.2 - lead - d)
    TL[nome] = {"a": round(t, 3), "v": round(t + lead, 3), "d": round(d, 3), "b": round(t + lead + d + tail, 3)}
    t = TL[nome]["b"]
TL["fim"] = round(t, 2); TL["voz"] = tem_voz

if tem_voz:
    loc = np.zeros(int((t + 0.5) * SR), np.float32)
    for nome, _, _ in CENAS:
        i = int(TL[nome]["v"] * SR); f = audios[nome]; loc[i:i + len(f)] += f
    loc *= 0.9 / max(1e-6, np.abs(loc).max())
    with wave.open(os.path.join(WORK, "locucao.wav"), "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((loc * 32767).astype("<i2").tobytes())
os.makedirs(WORK, exist_ok=True)
json.dump(TL, open(os.path.join(WORK, "tempo.json"), "w"), indent=1)
open(os.path.join(AQUI, "tempo.js"), "w").write("// gerado por montar_tempo.py: início (a), entrada da voz (v), duração da voz (d) e fim (b) de cada cena, em segundos\nwindow.TL = " + json.dumps(TL) + ";\n")
print("voz:", tem_voz, "| duração:", TL["fim"], "s")

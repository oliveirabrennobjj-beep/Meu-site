# Trilha original do vídeo das placas (110 BPM, Lá maior). Sem samples de terceiros.
# Os tempos vêm de work/tempo.json (montar_tempo.py). Se existir work/locucao.wav, a voz entra na mistura e a música abaixa embaixo dela.
import numpy as np, wave, sys, json, os
AQUI = os.path.dirname(os.path.abspath(__file__)); WORK = os.path.join(AQUI, "..", "work")
TL = json.load(open(os.path.join(WORK, "tempo.json")))
SR = 44100; DUR = TL["fim"]; N = int(SR * DUR); BPM = 110; BEAT = 60 / BPM
M = np.zeros((2, N)); FX = np.zeros((2, N))
rng = np.random.default_rng(23)
def note(m): return 440.0 * 2 ** ((m - 69) / 12)
def onepole(x, fc):
    a = np.exp(-2 * np.pi * fc / SR); y = np.empty_like(x); acc = 0.0
    for i in range(len(x)): acc = (1 - a) * x[i] + a * acc; y[i] = acc
    return y
def tt(d): return np.arange(int(d * SR)) / SR
def add(buf, sig, start, gain=1.0, pan=0.0):
    i = int(start * SR)
    if i >= N or i < 0: return
    j = min(N, i + len(sig)); s = sig[: j - i] * gain
    buf[0, i:j] += s * np.sqrt((1 - pan) / 2); buf[1, i:j] += s * np.sqrt((1 + pan) / 2)
def V(k, f): return TL[k]["v"] + TL[k]["d"] * f
# --- música ---
def pad(ms, d, bright=1.0):
    x = tt(d); s = np.zeros_like(x)
    for m in ms:
        f = note(m)
        for det in (-0.06, 0.06):
            ff = f * 2 ** (det / 12); s += np.sin(2*np.pi*ff*x) + 0.35*bright*np.sin(4*np.pi*ff*x) + 0.12*bright*np.sin(6*np.pi*ff*x)
    return s * np.minimum(1, x / 0.6) * np.minimum(1, (d - x) / 0.5)
G = TL["gancho"]["b"]
add(M, pad([42, 49, 54, 57], G + 0.3, 0.6), 0.0, 0.02)
x = tt(G + 0.3); add(M, onepole(rng.standard_normal(len(x)), 700) * np.minimum(1, x / 0.8) * np.minimum(1, (G + 0.3 - x) / 0.4), 0, 0.05)
START = G; END_BEAT = TL["cta"]["a"]
chords = [[57, 61, 64, 69], [54, 57, 61, 66], [50, 54, 57, 62], [52, 56, 59, 64]]; roots = [33, 30, 26, 28]; seg = BEAT * 8
k = 0; st = START
while st < DUR - 1.2:
    add(M, pad(chords[k % 4], min(seg, DUR - st) + 0.4), st, 0.022 if st < END_BEAT else 0.016); k += 1; st += seg
def kick():
    x = tt(0.35); f = 48 + 75 * np.exp(-x * 32); return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-x * 9)
def hat():
    n = int(0.05 * SR); h = rng.standard_normal(n); h = h - onepole(h, 7000); return h * np.exp(-np.arange(n) / SR * 70)
HAT = hat(); KICK = kick(); b = START; i = 0
while b < DUR - 1.0:
    soft = b >= END_BEAT
    if not soft or i % 2 == 0: add(M, KICK, b, 0.34 if not soft else 0.2)
    add(M, HAT, b + BEAT / 2, 0.035, 0.3)
    if i % 2 == 1 and not soft: add(M, HAT, b + BEAT * 0.75, 0.018, -0.3)
    m = roots[int((b - START) // seg) % 4]; x = tt(BEAT * 0.85)
    add(M, np.sin(2*np.pi*note(m+12)*x) * np.exp(-x * 3) * np.minimum(1, x / 0.01), b, 0.11 if not soft else 0.06)
    b += BEAT; i += 1
x = tt(5.5); fin = np.zeros_like(x)
for m in [45, 57, 64, 69, 73, 76]: fin += np.sin(2*np.pi*note(m)*x) + 0.25*np.sin(4*np.pi*note(m)*x)
add(M, fin * np.exp(-x * 0.55) * np.minimum(1, x / 0.02), END_BEAT, 0.045)
# --- efeitos ---
def pluck(m, d=0.6, dec=7):
    x = tt(d); f = note(m); s = np.sin(2*np.pi*f*x) + 0.4*np.sin(4*np.pi*f*x) + 0.15*np.sin(6*np.pi*f*x)
    return s * np.exp(-x * dec) * np.minimum(1, x / 0.004)
def whoosh(d=0.5, lo=300, hi=1800):
    x = tt(d); n = rng.standard_normal(len(x)); n = onepole(n, hi) - onepole(n, lo); return n * np.sin(np.pi * x / d) ** 2
def click(f=2400, d=0.018):
    x = tt(d); return np.sin(2*np.pi*f*x) * np.exp(-x * 260)
def buzz(at):
    x = tt(0.22); add(FX, onepole(np.sign(np.sin(2*np.pi*150*x)) * np.exp(-x * 10), 900), at, 0.09)
def nfc(at):
    buzz(at); add(FX, pluck(88, 0.8), at + 0.05, 0.05, -0.2); add(FX, pluck(93, 0.9), at + 0.17, 0.04, 0.2)
for i, m in enumerate([57, 61, 64, 66, 64, 69, 73, 76]): add(FX, pluck(m, 0.5), 0.15 + i * 0.09, 0.03, -0.3 + 0.08 * i)
x = tt(0.45); paper = (onepole(rng.standard_normal(len(x)), 4500) - onepole(rng.standard_normal(len(x)), 1200)) * np.sin(np.pi * x / 0.45) ** 2
add(FX, paper, G - 0.65, 0.1, -0.4)
for key in ["placa", "vantagens", "atualiza", "wifi", "pix", "insta", "whats", "google", "outras", "personalizada", "valor", "prova", "cta"]:
    add(FX, whoosh(0.5), TL[key]["a"] - 0.15, 0.11)
P = TL["placa"]; touch = P["b"] - 0.1
add(FX, pluck(57, 0.8), P["a"] + 0.1, 0.045); nfc(touch); add(FX, whoosh(0.35), touch + 0.15, 0.08)
D = TL["demo"]; tapRow = V("demo", 0.55)
add(FX, pluck(81, 0.3), tapRow, 0.045); add(FX, whoosh(0.3, 600, 3000), tapRow + 0.2, 0.07, 0.3); add(FX, whoosh(0.3, 600, 3000), D["b"] - 1.0, 0.07, -0.3)
add(FX, pluck(76, 0.5), TL["vantagens"]["v"], 0.04); add(FX, pluck(81, 0.5), V("vantagens", 0.5), 0.04)
st = V("atualiza", 0.15); add(FX, click(1400, 0.03), st, 0.08); add(FX, pluck(81, 0.5), st + 0.3, 0.04)
add(FX, whoosh(0.35, 500, 2500), V("atualiza", 0.38), 0.07); add(FX, pluck(88, 0.8), V("atualiza", 0.62), 0.045)
ACT = {"wifi": [0.6, 0.86], "pix": [0.12, 0.5], "insta": [0.3, 0.8], "whats": [0.38, 0.72], "google": [0.3, 0.62]}
for k_, (tf, af) in ACT.items():
    tap = V(k_, tf); act = V(k_, af); nfc(tap); add(FX, whoosh(0.35), tap - 0.9, 0.06, 0.3)
    if k_ == "wifi": add(FX, pluck(88, 0.6), act, 0.05); add(FX, pluck(93, 0.7), act + 0.1, 0.04)
    if k_ in ("pix", "insta"): add(FX, click(1500, 0.025), act, 0.08); add(FX, pluck(85, 0.5), act + 0.1, 0.04)
    if k_ == "whats": add(FX, click(1500, 0.025), act, 0.08); add(FX, whoosh(0.25, 800, 3500), act + 0.1, 0.05); add(FX, pluck(81, 0.4), act + 1.1, 0.04); add(FX, pluck(88, 0.5), act + 1.2, 0.035)
    if k_ == "google":
        for j in range(5): add(FX, pluck(81 + [0, 2, 4, 7, 9][j], 0.35), act + j * 0.12, 0.04)
        add(FX, click(1500, 0.025), act + 1.2, 0.08); add(FX, pluck(88, 0.6), act + 1.3, 0.04)
for j, f in enumerate([0.02, 0.17, 0.3, 0.42, 0.56, 0.74]): add(FX, pluck([69, 71, 73, 76, 78, 81][j], 0.45), V("outras", f), 0.04, -0.3 + 0.12 * j)
for f in [0.42, 0.68]: add(FX, whoosh(0.4, 400, 2200), V("personalizada", f), 0.07)
for j, f in enumerate([0.3, 0.5, 0.75]): add(FX, pluck([76, 81, 85][j], 0.4), V("personalizada", f), 0.035)
add(FX, pluck(81, 0.6), V("valor", 0.3), 0.04); add(FX, pluck(88, 0.7), V("valor", 0.72), 0.045)
tp = TL["cta"]["a"] + 3.0; add(FX, pluck(81, 0.6), tp, 0.055); add(FX, pluck(88, 0.8), tp + 0.1, 0.04)
# --- mistura ---
voz_path = os.path.join(WORK, "locucao.wav")
if TL.get("voz") and os.path.exists(voz_path):
    w = wave.open(voz_path); vz = np.frombuffer(w.readframes(w.getnframes()), "<i2").astype(np.float64) / 32768; vz = vz[:N]
    vz = np.pad(vz, (0, N - len(vz)))
    env = np.abs(vz); env = onepole(np.maximum(env, 0), 6)  # seguidor de envelope
    duck = 1 - 0.55 * np.clip(env / (env.max() * 0.25 + 1e-9), 0, 1)
    M *= duck; FX *= (0.55 + 0.45 * duck)
    mix = M * 1.0 + FX * 1.0 + np.stack([vz, vz]) * 0.9
else:
    mix = M + FX
mix = mix.T
fade = np.ones(N); fs = int((DUR - 1.4) * SR); fade[fs:] = np.linspace(1, 0, N - fs) ** 1.5
mix *= fade[:, None]
mix = np.tanh(mix * 1.5) / np.tanh(1.5); mix *= 0.86 / np.max(np.abs(mix))
out = sys.argv[1] if len(sys.argv) > 1 else os.path.join(WORK, "trilha.wav")
with wave.open(out, "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((mix * 32767).astype("<i2").tobytes())
print("ok", out, round(DUR, 2), "s, voz:", bool(TL.get("voz")))

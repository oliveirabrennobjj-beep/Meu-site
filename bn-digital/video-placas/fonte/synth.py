# Trilha original do vídeo das placas (44 s, 110 BPM, Lá maior). Sem samples de terceiros.
# Os tempos batem com a linha do tempo de index.html (objeto T e cenas).
import numpy as np, wave, sys
SR = 44100; DUR = 44.0; N = int(SR * DUR); BPM = 110; BEAT = 60 / BPM
L = np.zeros(N); R = np.zeros(N)
rng = np.random.default_rng(23)

def note(m): return 440.0 * 2 ** ((m - 69) / 12)
def onepole(x, fc):
    a = np.exp(-2 * np.pi * fc / SR); y = np.empty_like(x); acc = 0.0
    for i in range(len(x)): acc = (1 - a) * x[i] + a * acc; y[i] = acc
    return y
def add(sig, start, gain=1.0, pan=0.0):
    i = int(start * SR)
    if i >= N: return
    j = min(N, i + len(sig)); s = sig[: j - i] * gain
    L[i:j] += s * np.sqrt((1 - pan) / 2); R[i:j] += s * np.sqrt((1 + pan) / 2)
def tt(d): return np.arange(int(d * SR)) / SR

# --- música ---
def pad(ms, d, bright=1.0):
    x = tt(d); s = np.zeros_like(x)
    for m in ms:
        f = note(m)
        for det in (-0.06, 0.06):
            ff = f * 2 ** (det / 12)
            s += np.sin(2*np.pi*ff*x) + 0.35*bright*np.sin(4*np.pi*ff*x) + 0.12*bright*np.sin(6*np.pi*ff*x)
    return s * np.minimum(1, x / 0.6) * np.minimum(1, (d - x) / 0.5)
# abertura (cardápio de papel): Fá# menor e ambiente baixo do salão
add(pad([42, 49, 54, 57], 3.9, 0.6), 0.0, 0.02)
x = tt(3.9); room = onepole(rng.standard_normal(len(x)), 700); add(room * np.minimum(1, x / 0.8) * np.minimum(1, (3.9 - x) / 0.4), 0, 0.05)
START = 3.65; END_BEAT = 37.8
chords = [[57, 61, 64, 69], [54, 57, 61, 66], [50, 54, 57, 62], [52, 56, 59, 64]]
roots = [33, 30, 26, 28]; seg = BEAT * 8
k = 0; st = START
while st < 42.5:
    add(pad(chords[k % 4], min(seg, 44.0 - st) + 0.4), st, 0.022 if st < END_BEAT else 0.016); k += 1; st += seg
def kick():
    x = tt(0.35); f = 48 + 75 * np.exp(-x * 32)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-x * 9)
def hat():
    n = int(0.05 * SR); h = rng.standard_normal(n); h = h - onepole(h, 7000)
    return h * np.exp(-np.arange(n) / SR * 70)
HAT = hat(); KICK = kick()
b = START; i = 0
while b < 42.8:
    soft = b >= END_BEAT
    if not soft or i % 2 == 0: add(KICK, b, 0.34 if not soft else 0.2)
    add(HAT, b + BEAT / 2, 0.035, 0.3)
    if i % 2 == 1 and not soft: add(HAT, b + BEAT * 0.75, 0.018, -0.3)
    m = roots[int((b - START) // seg) % 4]
    x = tt(BEAT * 0.85); add(np.sin(2*np.pi*note(m+12)*x) * np.exp(-x * 3) * np.minimum(1, x / 0.01), b, 0.11 if not soft else 0.06)
    b += BEAT; i += 1
x = tt(5.5); fin = np.zeros_like(x)
for m in [45, 57, 64, 69, 73, 76]: fin += np.sin(2*np.pi*note(m)*x) + 0.25*np.sin(4*np.pi*note(m)*x)
add(fin * np.exp(-x * 0.55) * np.minimum(1, x / 0.02), 37.8, 0.045)

# --- efeitos (mesma tonalidade) ---
def pluck(m, d=0.6, dec=7):
    x = tt(d); f = note(m)
    s = np.sin(2*np.pi*f*x) + 0.4*np.sin(4*np.pi*f*x) + 0.15*np.sin(6*np.pi*f*x)
    return s * np.exp(-x * dec) * np.minimum(1, x / 0.004)
def whoosh(d=0.5, lo=300, hi=1800):
    x = tt(d); n = rng.standard_normal(len(x)); n = onepole(n, hi) - onepole(n, lo)
    return n * np.sin(np.pi * x / d) ** 2
def click(f=2400, d=0.018):
    x = tt(d); return np.sin(2*np.pi*f*x) * np.exp(-x * 260)
def keytap():
    n = int(0.014 * SR); k_ = rng.standard_normal(n); k_ = k_ - onepole(k_, 3000)
    return k_ * np.exp(-np.arange(n) / SR * 380)
# impressora térmica: zumbido do motor a cada passo de papel
def printer(t0, t1, step=0.1, gain=0.05):
    tm = t0
    while tm < t1:
        x = tt(0.075); f = 820 + 60 * np.sin(tm * 7)
        tone = np.sign(np.sin(2*np.pi*f*x)) * 0.5 + np.sin(4*np.pi*f*x) * 0.3
        tone = onepole(tone, 2600)
        hiss = rng.standard_normal(len(x)); hiss = onepole(hiss, 6000) - onepole(hiss, 1500)
        env = np.minimum(1, x / 0.006) * np.minimum(1, (0.075 - x) / 0.02)
        add((tone + 0.5 * hiss) * env, tm, gain, 0.05)
        add(click(1800, 0.012), tm, gain * 0.6)
        tm += step
# --- cenas ---
for i, m in enumerate([57, 61, 64, 66, 64, 69, 73, 76]): add(pluck(m, 0.5), 0.15 + i * 0.09, 0.035, -0.3 + 0.08 * i)
x = tt(0.45); paper = rng.standard_normal(len(x)); paper = (onepole(paper, 4500) - onepole(paper, 1200)) * np.sin(np.pi * x / 0.45) ** 2
add(paper, 2.95, 0.12, -0.4)
for c, d in [(3.65, 0.6), (7.55, 0.5), (8.55, 0.35), (11.95, 0.35), (16.3, 0.45), (19.6, 0.35), (22.6, 0.35), (25.8, 0.55), (34.0, 0.45), (37.8, 0.6)]:
    add(whoosh(d), c - d * 0.35, 0.13)
add(pluck(57, 0.8), 3.75, 0.05); add(pluck(64, 0.8), 3.8, 0.035, 0.2)
x = tt(0.22); bz = np.sign(np.sin(2*np.pi*150*x)) * np.exp(-x * 10); add(onepole(bz, 900), 8.4, 0.10)
add(pluck(88, 0.8), 8.45, 0.06, -0.2); add(pluck(93, 0.9), 8.57, 0.05, 0.2)
add(pluck(76, 0.6), 9.5, 0.05)
add(pluck(81, 0.3), 11.75, 0.05); add(whoosh(0.3, 600, 3000), 13.7, 0.08, 0.3); add(pluck(76, 0.6), 12.2, 0.045)
for i in range(3): add(pluck([73, 76, 81][i], 0.5), 16.85 + i * 0.15, 0.045, -0.3 + 0.3 * i)
add(click(1400, 0.03), 20.55, 0.1); add(pluck(81, 0.5), 20.85, 0.05); add(pluck(88, 0.8), 21.15, 0.05); add(pluck(93, 0.9), 21.25, 0.04)
for c in [23.3, 24.6]: add(pluck(88, 0.6), c, 0.05); add(pluck(93, 0.6), c + 0.3, 0.035)
for i in range(6): add(pluck([69, 71, 73, 76, 78, 81][i], 0.45), 26.5 + i * 0.28, 0.05, -0.3 + 0.12 * i)
add(pluck(76, 0.6), 34.65, 0.045)
add(pluck(81, 0.6), 40.85, 0.06); add(pluck(88, 0.8), 40.95, 0.04)

mix = np.stack([L, R], 1)
fade = np.ones(N); fs = int(42.8 * SR); fade[fs:] = np.linspace(1, 0, N - fs) ** 1.5
mix *= fade[:, None]
mix = np.tanh(mix * 1.5) / np.tanh(1.5)
mix *= 0.86 / np.max(np.abs(mix))
pcm = (mix * 32767).astype("<i2")
out = sys.argv[1] if len(sys.argv) > 1 else "trilha.wav"
with wave.open(out, "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
print("ok", out, mix.shape)

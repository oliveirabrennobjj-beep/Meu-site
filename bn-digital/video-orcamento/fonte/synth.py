# Trilha original do vídeo do orçamento (50,5 s, 110 BPM, Lá maior). Sem samples de terceiros.
# Os tempos batem com a linha do tempo de index.html (objeto T e cenas).
import numpy as np, wave, sys
SR = 44100; DUR = 50.5; N = int(SR * DUR); BPM = 110; BEAT = 60 / BPM
L = np.zeros(N); R = np.zeros(N)
rng = np.random.default_rng(11)

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
    a = np.minimum(1, x / 0.6) * np.minimum(1, (d - x) / 0.5)
    return s * a
# intro sombria (impressora): Fá# menor grave
add(pad([42, 49, 54, 57], 6.2, 0.6), 0.0, 0.018)
sub = tt(5.9); add(np.sin(2*np.pi*note(30)*sub) * np.minimum(1, sub / 2) * np.minimum(1, (5.9 - sub) / 0.4), 0, 0.10)
# riser antes da virada
x = tt(1.3); rs = rng.standard_normal(len(x)); rs = onepole(rs, 2500) - onepole(rs, 500)
add(rs * (x / 1.3) ** 2, 4.5, 0.10)

START = 5.75; END_BEAT = 44.75
chords = [[57, 61, 64, 69], [54, 57, 61, 66], [50, 54, 57, 62], [52, 56, 59, 64]]
roots = [33, 30, 26, 28]
seg = BEAT * 8
k = 0; st = START
while st < 49.0:
    d = min(seg, 50.5 - st) + 0.4
    add(pad(chords[k % 4], d), st, 0.022 if st < END_BEAT else 0.016)
    k += 1; st += seg
def kick():
    x = tt(0.35); f = 48 + 75 * np.exp(-x * 32)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-x * 9)
def hat():
    n = int(0.05 * SR); h = rng.standard_normal(n); h = h - onepole(h, 7000)
    return h * np.exp(-np.arange(n) / SR * 70)
HAT = hat(); KICK = kick()
b = START; i = 0
while b < 49.3:
    soft = b >= END_BEAT
    if not soft or i % 2 == 0: add(KICK, b, 0.36 if not soft else 0.22)
    add(HAT, b + BEAT / 2, 0.035, 0.3)
    if i % 2 == 1 and not soft: add(HAT, b + BEAT * 0.75, 0.018, -0.3)
    # baixo
    m = roots[int((b - START) // seg) % 4]
    x = tt(BEAT * 0.85); bs = np.sin(2*np.pi*note(m+12)*x) * np.exp(-x * 3) * np.minimum(1, x / 0.01)
    add(bs, b, 0.11 if not soft else 0.06)
    b += BEAT; i += 1
# acorde final
x = tt(5.5); fin = np.zeros_like(x)
for m in [45, 57, 64, 69, 73, 76]: fin += np.sin(2*np.pi*note(m)*x) + 0.25*np.sin(4*np.pi*note(m)*x)
add(fin * np.exp(-x * 0.55) * np.minimum(1, x / 0.02), 44.75, 0.045)

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
printer(0.75, 4.05)
printer(18.95, 24.05, gain=0.035)
printer(41.0, 41.6, step=0.08, gain=0.03)
# palavras do gancho
for i, m in enumerate([57, 61, 64, 66, 64, 69, 73]): add(pluck(m, 0.5), 0.12 + i * 0.09, 0.035, -0.3 + 0.1 * i)
# rasgo do papel
x = tt(0.2); rip = rng.standard_normal(len(x)); rip = onepole(rip, 5000) - onepole(rip, 900)
add(rip * np.exp(-x * 14) * (1 + 0.6 * np.sign(np.sin(2*np.pi*55*x))), 4.45, 0.16)
# transições
for c, d in [(5.75, 0.6), (6.15, 0.5), (10.45, 0.55), (18.45, 0.45), (25.6, 0.45), (30.75, 0.5), (32.75, 0.6), (35.25, 0.45), (39.85, 0.45), (40.25, 0.5), (44.75, 0.6)]:
    add(whoosh(d), c - d * 0.35, 0.13)
for c in [13.05, 14.9, 16.75]: add(whoosh(0.32, 600, 3000), c - 0.05, 0.07, 0.3)
add(pluck(76, 0.5), 7.6, 0.06); add(pluck(81, 0.6), 7.62, 0.035, 0.3)
for c in [7.8, 8.05]: add(pluck(88, 0.25, 14), c, 0.03, -0.3)
# checks da lista
ck = [18.95 + (80 + 78 * (i + 1) + 4) / 130 for i in range(7)]
for i, c in enumerate(ck): add(pluck([69, 71, 73, 76, 78, 81, 83][i], 0.5), c, 0.06, -0.2 + 0.07 * i)
# digitação: busca e domínio
q = "lanchonete em casimiro de abreu"
for i in range(len(q)): add(keytap(), 26.55 + 1.3 * (i + 1) / len(q) - 0.02, 0.10, 0.2)
add(click(1500, 0.03), 27.95, 0.1); add(pluck(81, 0.4), 28.05, 0.04)
add(pluck(76, 0.3), 28.95, 0.05)
dm = "seunegocio.com.br"
for i in range(len(dm)): add(keytap(), 31.3 + 1.0 * (i + 1) / len(dm) - 0.02, 0.10, -0.2)
add(click(1300, 0.02), 32.4, 0.14); add(click(2600, 0.015), 32.47, 0.10)
add(pluck(88, 0.8), 33.6, 0.05, -0.2); add(pluck(93, 0.9), 33.7, 0.05, 0.2)
# extras
add(pluck(69, 0.6), 35.9, 0.05)
for i, c in enumerate([36.75, 36.9, 37.05]): add(pluck([76, 81, 85][i], 0.5), c, 0.045, -0.3 + 0.3 * i)
# carimbo
x = tt(0.4); th = np.sin(2*np.pi*np.cumsum(40 + 60 * np.exp(-x * 40)) / SR) * np.exp(-x * 12)
nz = rng.standard_normal(len(x)); nz = onepole(nz, 1200) * np.exp(-x * 30)
add(th + 0.8 * nz, 42.0, 0.42)
# botão
add(pluck(81, 0.6), 47.75, 0.06); add(pluck(88, 0.8), 47.85, 0.04)

mix = np.stack([L, R], 1)
fade = np.ones(N); fs = int(49.3 * SR); fade[fs:] = np.linspace(1, 0, N - fs) ** 1.5
mix *= fade[:, None]
mix = np.tanh(mix * 1.5) / np.tanh(1.5)
mix *= 0.86 / np.max(np.abs(mix))
pcm = (mix * 32767).astype("<i2")
out = sys.argv[1] if len(sys.argv) > 1 else "trilha.wav"
with wave.open(out, "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
print("ok", out, mix.shape)

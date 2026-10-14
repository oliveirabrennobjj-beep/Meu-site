# Trilha original da BN Digital (22 s, 110 BPM, Lá maior). Sem samples de terceiros.
import numpy as np, wave
SR = 44100; DUR = 22.0; N = int(SR * DUR); BPM = 110; BEAT = 60 / BPM
t = np.arange(N) / SR
L = np.zeros(N); R = np.zeros(N)
rng = np.random.default_rng(7)

def note(f): return 440.0 * 2 ** ((f - 69) / 12)
def env(n, a, d, s, r, hold):
    e = np.zeros(n); ia, idd, ih, ir = int(a*SR), int(d*SR), int(hold*SR), int(r*SR)
    e[:ia] = np.linspace(0, 1, ia, endpoint=False)
    e[ia:ia+idd] = np.linspace(1, s, idd, endpoint=False)
    e[ia+idd:ih] = s
    end = min(n, ih + ir); e[ih:end] = s * np.linspace(1, 0, end - ih)
    return e
def onepole(x, fc):
    a = np.exp(-2 * np.pi * fc / SR); y = np.zeros_like(x); acc = 0.0
    for i in range(len(x)): acc = (1 - a) * x[i] + a * acc; y[i] = acc
    return y
def add(sig, start, gain=1.0, pan=0.0):
    i = int(start * SR); j = min(N, i + len(sig)); s = sig[: j - i] * gain
    L[i:j] += s * np.sqrt((1 - pan) / 2); R[i:j] += s * np.sqrt((1 + pan) / 2)

# pad: acordes A – F#m – D – E (2 compassos cada ~ 4.36 s), saws suaves filtradas
chords = [[57, 61, 64, 69], [54, 57, 61, 66], [50, 54, 57, 62], [52, 56, 59, 64]]
bar = BEAT * 4; seg = bar * 2
k = 0; start = 0.0
while start < 18.6:
    dur = min(seg, 18.6 - start) + 0.3
    n = int(dur * SR); tt = np.arange(n) / SR; sig = np.zeros(n)
    for m in chords[k % 4]:
        for det in (-0.08, 0.08):
            f = note(m) * 2 ** (det / 12)
            sig += 2 * ((tt * f) % 1) - 1
    sig = onepole(onepole(sig, 900), 1400) * env(n, 0.35, 0.5, 0.8, 0.4, dur - 0.4)
    add(sig, start, 0.035)
    k += 1; start += seg
# acorde final (Lá maior aberto) com cauda longa
n = int(4.0 * SR); tt = np.arange(n) / SR; sig = np.zeros(n)
for m in [45, 57, 64, 69, 73, 76]:
    sig += np.sin(2*np.pi*note(m)*tt) + 0.3*np.sin(4*np.pi*note(m)*tt)
sig *= np.exp(-tt * 0.9) * np.minimum(1, tt / 0.02)
add(sig, 18.6, 0.06)

# kick suave e hi-hat a partir do reveal (3.0 s) até o outro
def kick():
    n = int(0.35 * SR); tt = np.arange(n) / SR
    f = 50 + 70 * np.exp(-tt * 30); ph = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(ph) * np.exp(-tt * 9)
def hat():
    n = int(0.06 * SR); x = rng.standard_normal(n); x = x - onepole(x, 6000)
    return x * np.exp(-np.arange(n) / SR * 60)
b = 3.0
while b < 18.4:
    add(kick(), b, 0.45)
    add(hat(), b + BEAT / 2, 0.05, 0.3)
    b += BEAT
# baixo nas fundamentais
roots = [33, 30, 26, 28]; k = 0; start = 3.0
while start < 18.4:
    m = roots[int((start) // seg) % 4]
    n = int(BEAT * 0.9 * SR); tt = np.arange(n) / SR
    sig = np.sin(2*np.pi*note(m+12)*tt) * env(n, 0.01, 0.1, 0.6, 0.08, BEAT*0.8)
    add(sig, start, 0.12); start += BEAT

# pluck (cada palavra do título)
def pluck(m, d=0.6):
    n = int(d * SR); tt = np.arange(n) / SR; f = note(m)
    s = np.sin(2*np.pi*f*tt) + 0.4*np.sin(4*np.pi*f*tt) + 0.15*np.sin(6*np.pi*f*tt)
    return s * np.exp(-tt * 7) * np.minimum(1, tt / 0.004)
for i, (tm, m) in enumerate([(0.08, 69), (0.26, 73), (0.44, 76), (0.62, 73), (0.9, 81)]):
    add(pluck(m), tm, 0.10, -0.3 + 0.15 * i)
# whoosh antes de cada troca de cena
def whoosh(d=0.5):
    n = int(d * SR); x = rng.standard_normal(n); tt = np.arange(n) / SR
    x = onepole(x, 1800) - onepole(x, 300)
    return x * np.sin(np.pi * tt / d) ** 2
for c in [3.0, 6.0, 11.4, 15.0, 18.6]:
    add(whoosh(), c - 0.32, 0.18)
# tick suave a cada slide do carrossel
for s in [6.9, 7.95, 9.0, 10.05]:
    add(pluck(88, 0.15), s, 0.05, 0.4)
# toque e "chime" do pedido enviado
add(pluck(76, 0.2), 12.65, 0.08)
add(pluck(88, 0.8), 12.9, 0.07, -0.2); add(pluck(93, 0.9), 13.02, 0.07, 0.2)
# pulsos NFC nas palavras Aproxime / Avalie / Pronto
for tm, m in [(15.1, 69), (15.55, 73), (16.0, 76)]:
    add(pluck(m, 0.8), tm, 0.09)

mix = np.stack([L, R], 1)
fade = np.ones(N); fs = int(21.0 * SR); fade[fs:] = np.linspace(1, 0, N - fs) ** 1.5
mix *= fade[:, None]
mix = np.tanh(mix * 1.6) / np.tanh(1.6)            # saturação leve
mix *= 0.85 / np.max(np.abs(mix))
pcm = (mix * 32767).astype("<i2")
with wave.open("trilha.wav", "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
print("ok", mix.shape)

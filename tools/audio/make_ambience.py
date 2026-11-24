"""Procedural ambience/footstep sounds for the town and rooms (no recordings needed).
Writes assets/sfx/*.wav (22.05 kHz mono 16-bit). Loops are built to wrap seamlessly."""
import numpy as np, wave, os
SR = 22050
OUT = os.path.join(__file__.rsplit('/tools/', 1)[0], 'assets/sfx')
rng = np.random.default_rng(11)

def lp(x, a):  # one-pole low-pass, a in (0,1): smaller = darker
    y = np.empty_like(x); acc = 0.0
    for i, v in enumerate(x): acc += a * (v - acc); y[i] = acc
    return y
def hp(x, a): return x - lp(x, a)
def env(n, att, dec):
    t = np.arange(n) / SR
    return np.minimum(1, t / max(att, 1e-4)) * np.exp(-t / dec)
def save(name, x, peak=0.8):
    x = x / (np.abs(x).max() + 1e-9) * peak
    with wave.open(f'{OUT}/{name}.wav', 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((x * 32767).astype('<i2').tobytes())
def loopify(x, fade=0.4):  # crossfade the tail into the head so the loop has no click
    n = int(fade * SR); head, tail = x[:n], x[-n:]
    k = np.linspace(0, 1, n)
    x = x[:-n].copy(); x[:n] = head * k + tail * (1 - k)
    return x

# Footsteps: wood = hollow knock (low thump + resonant boards); cobble = gritty scuff.
for i in range(2):
    n = int(0.16 * SR); t = np.arange(n) / SR
    thump = np.sin(2 * np.pi * (95 + 20 * i) * t) * env(n, 0.002, 0.03)
    board = np.sin(2 * np.pi * (310 + 40 * i) * t) * env(n, 0.001, 0.05) * 0.5
    knock = lp(rng.normal(size=n), 0.25) * env(n, 0.001, 0.012)
    save(f'step_wood_{i}', thump + board + knock, 0.7)
    grit = hp(rng.normal(size=n), 0.5) * env(n, 0.003, 0.025)
    tap = lp(rng.normal(size=n), 0.3) * env(n, 0.001, 0.01) * 1.5
    save(f'step_cobble_{i}', grit + tap, 0.55)

# Soft ground (grass, sand, dirt): a muffled pad with a little grit.
for i in range(2):
    n = int(0.16 * SR)
    pad = lp(rng.normal(size=n), 0.08) * env(n, 0.006, 0.035)
    grit = hp(rng.normal(size=n), 0.6) * env(n, 0.004, 0.012) * 0.25
    save(f'step_soft_{i}', pad + grit, 0.5)

# Fire crackle loop: brown rumble + random pops.
n = 4 * SR
x = lp(rng.normal(size=n), 0.02) * 0.6
for _ in range(90):
    p = rng.integers(0, n - 2000); m = rng.integers(200, 1600)
    x[p:p + m] += hp(rng.normal(size=m), 0.6) * env(m, 0.0005, 0.004 + rng.random() * 0.01) * rng.uniform(0.6, 2.5)
save('fire_loop', loopify(x), 0.6)

# Harbour: slow surf swells on the quay.
n = 8 * SR; t = np.arange(n) / SR
surf = lp(rng.normal(size=n), 0.06)
swell = 0.35 + 0.65 * (0.5 + 0.5 * np.sin(2 * np.pi * t / 4.0)) ** 2
lap = hp(lp(rng.normal(size=n), 0.3), 0.05) * (0.5 + 0.5 * np.sin(2 * np.pi * t / 2.0 + 1)) ** 4 * 0.5
save('harbour_loop', loopify(surf * swell + lap), 0.6)

# Gull cry: two falling squawks with harmonics and a little rasp.
def squawk(dur, f0, f1):
    n = int(dur * SR); t = np.arange(n) / SR
    f = np.linspace(f0, f1, n) * (1 + 0.03 * np.sin(2 * np.pi * 28 * t))
    ph = 2 * np.pi * np.cumsum(f) / SR
    s = sum(np.sin(ph * k) / k ** 1.2 for k in range(1, 7))
    s += hp(rng.normal(size=n), 0.4) * 0.25
    return s * np.sin(np.pi * np.arange(n) / n) ** 0.6
g = np.concatenate([squawk(0.22, 1700, 1250), np.zeros(int(0.07 * SR)), squawk(0.3, 1650, 1100), np.zeros(int(0.2 * SR))])
save('gull', g, 0.45)

# Tavern murmur: band-limited voices (formant-ish AM noise) layered, plus odd clinks.
n = 6 * SR; t = np.arange(n) / SR
x = np.zeros(n)
for v in range(7):
    body = lp(hp(rng.normal(size=n), 0.08), 0.18)
    syll = np.clip(np.sin(2 * np.pi * rng.uniform(2.5, 4.5) * t + rng.uniform(0, 6)), 0, 1) ** 2
    phrase = (np.sin(2 * np.pi * rng.uniform(0.15, 0.35) * t + rng.uniform(0, 6)) > -0.2).astype(float)
    x += body * syll * lp(phrase, 0.001)
for _ in range(5):
    p = rng.integers(0, n - 4000); m = 3000; tt = np.arange(m) / SR
    x[p:p + m] += np.sin(2 * np.pi * rng.uniform(2400, 3600) * tt) * env(m, 0.0005, 0.06) * 0.25
save('tavern_murmur', loopify(x), 0.5)
print('ok')

# --- Sailing (2026-11-24) ---------------------------------------------------------------------
# Open sea under the hull: deep wash plus hull slap every couple of seconds.
n = 8 * SR; t = np.arange(n) / SR
wash = lp(rng.normal(size=n), 0.03) * (0.55 + 0.45 * np.sin(2 * np.pi * t / 8.0 * 2) ** 2)
slap = np.zeros(n)
for k in range(5):
    p = int((k * 1.6 + rng.uniform(0, 0.4)) * SR) % (n - 4000); m = 3000
    slap[p:p + m] += lp(rng.normal(size=m), 0.25) * env(m, 0.004, 0.05) * 1.2
save('sea_loop', loopify(wash + slap), 0.55)
# Timber creak: a slow, rubbing groan (resonant, pitch-wobbling), a few variants
for i in range(3):
    n = int((0.7 + 0.3 * i) * SR); t = np.arange(n) / SR
    f0 = 140 + 40 * i + 25 * np.sin(2 * np.pi * (1.3 + i * 0.4) * t)
    ph = 2 * np.pi * np.cumsum(f0) / SR
    rub = (np.abs(rng.normal(size=n)) ** 3) * 0.2
    tone = (np.sin(ph) + 0.5 * np.sin(2 * ph) + 0.25 * np.sin(3 * ph)) * (0.6 + rub)
    shape = np.sin(np.pi * np.clip(t / t[-1], 0, 1)) ** 1.5
    save(f'creak_{i}', lp(tone * shape, 0.35), 0.5)
# Canvas flap: a couple of quick fabric snaps
n = int(0.45 * SR); x = np.zeros(n)
for p0, g in ((0, 1.0), (0.12, 0.7), (0.22, 0.45)):
    p = int(p0 * SR); m = int(0.09 * SR)
    x[p:p + m] += hp(lp(rng.normal(size=m), 0.5), 0.1) * env(m, 0.002, 0.025) * g
save('canvas_flap', x, 0.55)

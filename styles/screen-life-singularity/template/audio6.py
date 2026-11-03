# v3 mix: ElevenLabs score + Freesound / Mixkit recordings, placed from the film's event list.
import json, os, numpy as np, wave
os.chdir(os.path.dirname(os.path.abspath(__file__)))
from scipy.io import wavfile
from scipy.signal import find_peaks, butter, sosfilt, fftconvolve

meta = json.load(open('./frames/meta.json'))
M, SFX = meta['marks'], meta['SFX']
SR = 48000; DUR = meta['duration'] + 1.0; N = int(DUR * SR)
rng = np.random.default_rng(11)
fx = np.zeros((2, N)); bed = np.zeros((2, N))
hp = lambda x, f: sosfilt(butter(2, f, 'high', fs=SR, output='sos'), x, axis=-1)
lp = lambda x, f: sosfilt(butter(2, f, 'low', fs=SR, output='sos'), x, axis=-1)

_c = {}
def S(key):
    if key not in _c:
        path = f'./fs/{key[3:]}.wav' if str(key).startswith('fs_') else (f'./elsfx/{key[3:]}.wav' if str(key).startswith('el_') else f'./sfxlib/wav/{key}.wav')
        _c[key] = wavfile.read(path)[1].astype(np.float64).T.copy()
    return _c[key]
def put(buf, t, x, gain=1., pan=0., rate=1.):
    if rate != 1.:
        n = int(x.shape[1] / rate); idx = np.arange(n) * rate
        x = np.stack([np.interp(idx, np.arange(x.shape[1]), c) for c in x])
    i = int(t * SR)
    if i < 0: x = x[:, -i:]; i = 0
    if i >= N: return
    x = x[:, :N - i]; l, r = np.sqrt((1 - pan) / 2) * 1.414, np.sqrt((1 + pan) / 2) * 1.414
    buf[0, i:i + x.shape[1]] += x[0] * gain * l; buf[1, i:i + x.shape[1]] += x[1] * gain * r
def seg(key, a, b, fi=.003, fo=.02):
    x = S(key)[:, int(a * SR):int(b * SR)].copy(); n = x.shape[1]; e = np.ones(n)
    k1, k2 = int(fi * SR), int(fo * SR)
    if k1: e[:k1] = np.linspace(0, 1, k1)
    if k2: e[-k2:] *= np.linspace(1, 0, k2)
    return x * e
def peak_t(key):
    env = np.convolve(np.abs(S(key)).mean(0), np.ones(480) / 480, 'same'); return np.argmax(env) / SR
def slices(key, pre=.004, post=.11, min_gap=.12, thr=.18):
    x = S(key); m = hp(x.mean(0), 1500); env = np.convolve(np.abs(m), np.ones(48) / 48, 'same')
    pk, _ = find_peaks(env, height=env.max() * thr, distance=int(.045 * SR)); out = []
    for j, p in enumerate(pk):
        nxt = pk[j + 1] / SR if j + 1 < len(pk) else 1e9; prv = pk[j - 1] / SR if j else -1e9
        if nxt - p / SR < min_gap or p / SR - prv < .05: continue
        s = seg(key, max(0, p / SR - pre), p / SR + post, .002, .04); v = np.abs(s).max()
        if v > 1e-4: out.append(s / v)
    return out
def clean(pool):
    keep = []
    for s in pool:
        m = np.abs(s.mean(0)); k = int(.035 * SR)
        if (m[k:] ** 2).sum() / ((m[:k] ** 2).sum() + 1e-12) < .35: keep.append(s)
    return keep

KEYS = clean(slices('fs_565645') + slices('fs_275131') + slices('fs_787313') + slices('fs_541763'))
KEYS_SOFT = clean(slices(1396, post=.09))
cent = lambda s: (np.abs(np.fft.rfft(s.mean(0))) * np.fft.rfftfreq(s.shape[1], 1 / SR)).sum() / (np.abs(np.fft.rfft(s.mean(0))).sum() + 1e-9)
KEYS_LOW = sorted(KEYS, key=cent)[:max(4, len(KEYS) // 5)]
ENTER = clean(slices('fs_391310', post=.2, min_gap=.05, thr=.3)) or [KEYS_LOW[0]]
CLICKS = clean(slices('fs_515816', post=.09, min_gap=.05) + slices('fs_515811', post=.09, min_gap=.05))
print('keys', len(KEYS), 'soft', len(KEYS_SOFT), 'enter', len(ENTER), 'clicks', len(CLICKS))
pick = lambda pool: pool[rng.integers(len(pool))]

for e in SFX:
    t, k = e['t'], e['type']; pan = rng.uniform(-.2, .2)
    if k == 'key': put(fx, t - .004, pick(KEYS), .30 * rng.uniform(.75, 1.1), pan)
    elif k == 'space': put(fx, t - .004, pick(KEYS_LOW), .34, pan)
    elif k == 'enter': put(fx, t - .004, pick(ENTER), .40, .05)
    elif k == 'akey': put(fx, t - .004, pick(KEYS_SOFT), .09 * rng.uniform(.7, 1.1), pan * 1.5)
    elif k == 'click': put(fx, t - .004, pick(CLICKS), .40, .1)
    elif k == 'tick': put(fx, t, S(2568), .09, rng.uniform(-.6, .6), rate=rng.uniform(.9, 1.15))
    elif k == 'whoosh': put(fx, t - peak_t('el_takeover') + .15, lp(lp(S('el_takeover'), 3500), 3500), .10); put(fx, t - peak_t(1143) + .1, S(1143), .32)
    elif k == 'whoosh2': put(fx, t - .05, S([3120, 2617, 2619][int(rng.integers(3))]), .15, rng.uniform(-.7, .7), rate=rng.uniform(.92, 1.08))
    elif k == 'chime': put(fx, t, S(2574), .20)
    elif k == 'blip': put(fx, t, S(2520), .06, rng.uniform(-.2, .2))
    elif k == 'blip2': put(fx, t, S(3116), .24)
    elif k == 'chime2': put(fx, t, S(2669), .05, (e['k'] - 2) * .25)
    elif k == 'tickmid': put(fx, t - .02, S(1061), .9)

# ambience and accents
put(bed, 0, seg('fs_635732', 5, 5 + DUR, 2, 3), .55)                      # night apartment room tone, whole film
put(bed, 0.4, seg('fs_342175', 0, 9.6, .6, 1.5), .5, -.15)                  # clock ticking under the opening
put(bed, M['T22'] - .3, seg('fs_342175', 20, 20 + M['TMID'] - M['T22'] + .25, .3, .02), .55, -.1)  # ...stops at midnight
put(fx, M['np3'] + .1 - peak_t(549), S(549), .5)
put(bed, M['T17'] + .4, seg(2507, 2, 2 + (M['T21'] - M['T17']), 1, 1.5), .06)
dl = S('el_data'); reps = int((M['T21'] - M['T17']) / 10) + 2
loop = np.concatenate([dl] * reps, axis=1)[:, :int((M['T21'] - M['T17'] - .8) * SR)]
e = np.ones(loop.shape[1]); k1 = int(1.5 * SR); e[:k1] = np.linspace(0, 1, k1); e[-k1:] *= np.linspace(1, 0, k1)
put(bed, M['T17'] + .6, loop * e, .35)
put(fx, M['T21'] + .45, S('el_shimmer'), .35)
put(fx, M['tTrue'] - .02, S(2519), .07)
for k in ('tFac', 't16'): put(fx, M[k], S(2519), .05)
rz = seg(794, 17.6 - (M['TT'] - .35 - M['T21'] - .5), 17.6, 1.5, .03)
put(fx, M['T21'] + .5, rz, .22)
put(fx, M['TT'], S('el_impact'), .38)
put(fx, M['TT'] - peak_t(1143), S(1143), .55)

tt_ = .7
while tt_ < 4.4:
    put(fx, tt_, pick(KEYS), .26 * rng.uniform(.75, 1.1), .25); tt_ += rng.uniform(.07, .19) + (.35 if rng.random() < .08 else 0)
fw = S('el_fireworks')
put(bed, 0, fw[:, :int(4.8 * SR)] * np.concatenate([np.linspace(0, 1, int(.8 * SR)), np.ones(int(3.4 * SR)), np.linspace(1, 0, int(4.8 * SR) - int(4.2 * SR))]), .5)
put(bed, M['TT'] + .6, seg('el_fireworks', 0, 10, 2.0, 2.5), .6)
# score with per-section gain automation (dB at section keyframes)
mus = wavfile.read('./music_dark.wav')[1].astype(np.float64).T
mus = np.pad(mus, ((0, 0), (0, max(0, N - mus.shape[1]))))[:, :N]
keys = [(0, -10), (12, -6), (M['T12'] - 1, -6), (M['T12'] + 1, -3), (M['T16'] - .5, -2), (M['T16'] + .3, -13), (M['T17'] - .6, -13),
        (M['T17'] + .6, -3), (M['T21'] - .5, -4), (M['T21'] + .5, -3), (M['TT'] - .4, 0), (M['TT'] - .36, -60), (M['TT'] - .01, -60),
        (M['TT'], 2), (M['T24'] - 1, 2), (M['T24'] + .5, 4), (M['ANS_END'], 3), (meta['duration'], -40)]
tm = np.arange(N) / SR
g = 10 ** (np.interp(tm, [k[0] for k in keys], [k[1] for k in keys]) / 20)
mus *= g
# silence beat also for beds/fx tails
duck = np.ones(N); a, b = int((M['TT'] - .36) * SR), int((M['TT'] - .01) * SR); duck[a:b] = .05
bed *= duck
def reverb(x, dur=2.2, decay=.6):
    t = np.arange(int(dur * SR)) / SR; ir = rng.normal(size=len(t)) * np.exp(-t / decay); ir = lp(ir, 7000); ir /= np.sqrt((ir ** 2).sum())
    return fftconvolve(x, ir)[:len(x)]
fxw = np.stack([reverb(fx[0]), reverb(fx[1])])
mix = mus + bed + fx + fxw * .12
mix = hp(mix, 25)
mix *= np.clip(tm / .4, 0, 1) * np.clip((meta['duration'] - tm) / 2.5, 0, 1)
pk = np.percentile(np.abs(mix), 99.97); mix = np.tanh(mix / pk * .9) * .95
with wave.open('./audio_v6.wav', 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((mix.T * 32767).astype(np.int16).tobytes())
for t0 in range(0, 172, 12):
    s = mix[:, t0 * SR:(t0 + 12) * SR]; print(t0, '%.1f dB' % (20 * np.log10(np.sqrt((s ** 2).mean()) + 1e-9)))

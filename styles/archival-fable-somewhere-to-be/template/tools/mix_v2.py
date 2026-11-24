"""v2 mix: VO (two takes) + three score cues + clock ticks + SFX + film bed -> render/premix_v2.wav, captions_v2.json."""
import json, os, re, subprocess, sys
import numpy as np
from scipy.signal import lfilter

sys.path.insert(0, os.getcwd())
import timeline_v2 as TL

SR = 48000
N = int(TL.DURATION * SR)
i_ = lambda t: int(round(t * SR))
db = lambda x: 10 ** (np.asarray(x) / 20)


def load(path, ch=1):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-ac", str(ch), "-ar", str(SR), "-f", "f32le", "-"],
                         capture_output=True, check=True).stdout
    a = np.frombuffer(raw, np.float32).copy()
    return a.reshape(-1, ch) if ch > 1 else a


def ramp(n, a, b):
    return np.linspace(a, b, max(n, 1), dtype=np.float32)


def place(dst, src, t, gain=1.0):
    i = i_(t)
    if i < 0:
        src = src[-i:]; i = 0
    n = min(len(src), len(dst) - i)
    if n > 0:
        dst[i:i + n] += src[:n] * gain


def fade(a, fin, fout):
    a = a.copy(); ni, no = i_(fin), i_(fout)
    sh = (lambda r: r[:, None]) if a.ndim > 1 else (lambda r: r)
    if ni: a[:ni] *= sh(ramp(ni, 0, 1))
    if no: a[-no:] *= sh(ramp(no, 1, 0))
    return a


norm = lambda w: re.sub(r"[^a-z]", "", w.lower())

# ---------- VO ----------
takes = {}
for k in {b[1] for b in TL.VO}:
    audio = load(f"vo2/vo_{k}.mp3")
    words = [w for w in json.load(open(f"vo2/tr_{k}.json"))["segments"] if norm(w["text"]) and not w["text"].strip().startswith(("[", "("))]
    hop = int(0.01 * SR)
    rms = np.sqrt(np.convolve(audio ** 2, np.ones(hop) / hop, "same"))
    takes[k] = dict(audio=audio, words=words, rms=rms, ptr=0)


def find(take, sentence):
    """Locate the sentence's words in order in this take; return (first, last) word index."""
    ws = [norm(x) for x in sentence.split()]
    W = take["words"]
    for s in range(take["ptr"], len(W) - len(ws) + 1):
        if all(norm(W[s + j]["text"]) == ws[j] for j in range(len(ws))):
            take["ptr"] = s + len(ws)
            return s, s + len(ws) - 1
    # fall back: search from the start (blocks may come out of order across takes)
    for s in range(0, len(W) - len(ws) + 1):
        if all(norm(W[s + j]["text"]) == ws[j] for j in range(len(ws))):
            return s, s + len(ws) - 1
    raise ValueError(f"not found: {sentence}")


def quietest(rms, t0, t1):
    a, b = i_(t0), i_(t1)
    return t0 if b <= a else (a + int(np.argmin(rms[a:b]))) / SR


vo = np.zeros(N, np.float32)
active = np.zeros(N, np.float32)
captions = []
for T, k, sentence in TL.VO:
    tk = takes[k]; W = tk["words"]
    a, b = find(tk, sentence)
    st, en = W[a]["start"], W[b]["end"]
    prev_end = W[a - 1]["end"] if a > 0 else 0.0
    next_start = W[b + 1]["start"] if b + 1 < len(W) else len(tk["audio"]) / SR
    c0 = quietest(tk["rms"], max(prev_end, st - 0.35), st - 0.01) if a > 0 else max(0.0, st - 0.2)
    c1 = quietest(tk["rms"], en + 0.03, min(next_start, en + 0.45)) if b + 1 < len(W) else min(len(tk["audio"]) / SR, en + 0.7)
    clip = fade(tk["audio"][i_(c0):i_(c1)], 0.02, 0.05)
    place(vo, clip, T - (st - c0))
    active[i_(T):i_(T + en - st)] = 1
    if TL.CAPTION_TEXT[sentence]:
        captions.append([round(T - 0.1, 2), round(T + en - st + 0.5, 2), TL.CAPTION_TEXT[sentence]])
for j in range(len(captions) - 1):
    captions[j][1] = min(captions[j][1], captions[j + 1][0] - 0.05)
vo = lfilter([0.994, -0.994], [1, -0.988], vo).astype(np.float32)  # gentle high-pass

# ---------- score ----------
music = np.zeros((N, 2), np.float32)
for path, at, g, fin, fout, hard_end in TL.MUSIC:
    m = load(path, 2)
    if hard_end is not None:
        m = m[:i_(hard_end - at)]
    m = fade(m, fin, fout if fout else 0.012)
    place(music, m, at, db(g))
# fear crescendo: the instrumental tail climbs into the hard cut
env = np.ones(N, np.float32)
env[i_(47.1):i_(TL.HARD_CUT)] = db(ramp(i_(TL.HARD_CUT) - i_(47.1), 0, 5))
# climax lift in Act III
env[i_(84.0):i_(88.0)] = db(ramp(i_(88.0) - i_(84.0), 0, 3))
env[i_(88.0):i_(97.0)] = db(3)
env[i_(97.0):i_(100.0)] = db(ramp(i_(100.0) - i_(97.0), 3, 0))
music *= env[:, None]


def smooth(x, att, rel):
    a1, r1 = np.exp(-1 / (att * SR)), np.exp(-1 / (rel * SR))
    return np.maximum(lfilter([1 - a1], [1, -a1], x), lfilter([1 - r1], [1, -r1], x))


t_axis = np.arange(N) / SR
duck_db = np.where(t_axis < TL.M2_AT, 4.0, np.where(t_axis < TL.HARD_CUT, 8.0, 5.0))
dk = np.clip(smooth(active, 0.1, 0.45), 0, 1)
music *= db(-duck_db * dk)[:, None]
# carve the speech band (1-4 kHz) out of the loud fear cue while she speaks
from scipy.signal import butter, sosfilt
band = sosfilt(butter(2, [1000, 4000], btype="bandpass", fs=SR, output="sos"), music, axis=0).astype(np.float32)
carve = np.where((t_axis >= TL.M2_AT) & (t_axis < TL.HARD_CUT), 0.6, 0.25) * dk
music -= band * carve[:, None]

# ---------- clock ticks and SFX ----------
fx = np.zeros((N, 2), np.float32)
tick = load("sfx/tick.mp3")
pk = int(np.argmax(np.abs(tick)))
tick = fade(tick[max(0, pk - i_(0.004)):pk + i_(0.28)], 0.002, 0.08)
tick = sosfilt(butter(2, 3500, btype="lowpass", fs=SR, output="sos"), tick).astype(np.float32)  # less click
for t in TL.TICKS:
    u = (t - TL.TICKS[0]) / (TL.TICKS[-1] - TL.TICKS[0])
    g = db(-11 + 6 * u)
    pan = 0.15 if int(round(t * 4)) % 2 else -0.15  # tick-tock
    place(fx, np.stack([tick * (1 - pan), tick * (1 + pan)], 1), t, g)
# a little room on the hits so they sit in the film, not on top of it
rng = np.random.RandomState(1)
ir = (rng.randn(i_(0.6)) * np.exp(-np.arange(i_(0.6)) / (0.12 * SR))).astype(np.float32); ir /= np.abs(ir).sum() / 4
def roomy(x, wet=0.35):
    from scipy.signal import fftconvolve
    w = np.stack([fftconvolve(x[:, c], ir)[:len(x)] for c in range(x.shape[1])], 1)
    return (x * (1 - wet) + w * wet).astype(np.float32)
for path, t, g in TL.SFX:
    place(fx, roomy(load(path, 2)), t, db(g))
# riser into the fear cue, sub boom on its first beat
riser = load("sfx/riser.mp3", 2)
place(fx, riser, TL.M2_AT - len(riser) / SR, db(4))
place(fx, load("sfx/boom.mp3", 2), TL.M2_AT - 0.13, db(-3))

# ---------- film bed ----------
proj = load("sfx/projector.mp3", 2)
bed = np.tile(proj, (int(np.ceil(N / len(proj))), 1))[:N] * db(8)
benv = np.ones(N, np.float32)
benv[:i_(1.0)] = ramp(i_(1.0), 0.5, 1)
benv[i_(TL.HARD_CUT):i_(TL.M3_AT)] = 0.0                      # true silence
benv[i_(TL.M3_AT):i_(TL.M3_AT + 2.0)] = ramp(i_(2.0), 0, db(-6))
benv[i_(TL.M3_AT + 2.0):i_(96.6)] = db(-8)
benv[i_(96.6):i_(104.2)] = ramp(i_(104.2) - i_(96.6), db(-8), db(-4))
benv[i_(104.2):] = ramp(N - i_(104.2), db(-4), 0)
bed *= benv[:, None]

# ---------- the hard cut: a big hit whose reverb rings into the black ----------
from scipy.signal import fftconvolve
hit = load("sfx/impact1.mp3", 2)
hit = fade(hit[i_(0.042):], 0.003, 0.0)   # start on the attack, not the pre-roll
place(fx, hit, TL.HARD_CUT, db(5))          # attack on the cue's final downbeat
# reverb throw: the cue's last beat, wet only, into a long dark hall
L = i_(3.2)
rng2 = np.random.RandomState(7)
irL = rng2.randn(L) * np.exp(-np.arange(L) / (0.75 * SR))
irR = rng2.randn(L) * np.exp(-np.arange(L) / (0.75 * SR))
lp = butter(2, 2500, btype="lowpass", fs=SR, output="sos")
irL, irR = sosfilt(lp, irL), sosfilt(lp, irR)
irL /= np.sqrt((irL ** 2).sum()); irR /= np.sqrt((irR ** 2).sum())
src = music[i_(TL.HARD_CUT - 0.35):i_(TL.HARD_CUT + 0.03)]
wet = np.stack([fftconvolve(src[:, 0], irL), fftconvolve(src[:, 1], irR)], 1).astype(np.float32)
wet = wet[i_(0.35):]                       # only what rings after the cut
place(fx, wet, TL.HARD_CUT, db(-2))
# the tails clear as the piano comes in
tail = np.ones(N, np.float32)
tail[i_(54.8):i_(55.8)] = ramp(i_(55.8) - i_(54.8), 1, 0)
tail[i_(55.8):] = 0
cut_zone = (t_axis >= TL.HARD_CUT)
fx[cut_zone] *= tail[cut_zone][:, None]
# keep the other hits (doors) that come later in Act III
for path, t, g in TL.SFX:
    if t > 56:
        place(fx, roomy(load(path, 2)), t, db(g))
# knocks: the file holds three knocks; each one's attack goes on a contact frame
kn = load("sfx/knock.mp3", 2)
slices = [(0.0, 0.205), (0.205, 0.41), (0.41, 0.85)]
for (a0, a1), t, g in zip(slices, TL.KNOCKS, (4.0, 3.0, 2.0)):
    k = kn[i_(a0):i_(a1)]
    m = np.abs(k).sum(1)
    on = int(np.argmax(m > 0.5 * m.max()))           # attack of this knock
    k = fade(k[max(0, on - i_(0.003)):], 0.002, 0.03)
    place(fx, roomy(k, 0.25), t - 0.003, db(g))

vo_gain = np.where((t_axis >= TL.M2_AT) & (t_axis < TL.HARD_CUT), db(7.5), db(6.5)).astype(np.float32)
mix = music + fx + bed + (vo * vo_gain)[:, None]
os.makedirs("render", exist_ok=True)
subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", "-", "-c:a", "pcm_f32le",
                "render/premix_v2.wav"], input=mix.astype(np.float32).tobytes(), check=True)
json.dump(captions, open("render/captions_v2.json", "w"), indent=1)
print("premix_v2 ok; peak", float(np.abs(mix).max()), "captions", len(captions))

"""Render the film: archival stills and 16mm clips, tinted, with grain, weave, flicker and a 4:3 gate.

Usage: python3 tools/render.py OUT.mp4 [--captions] [--from T --to T] [--workers N] [--scale S]
"""
import argparse, math, os, subprocess, sys, json
import numpy as np
from PIL import Image, ImageFilter, ImageDraw, ImageFont
from multiprocessing import Pool

sys.path.insert(0, os.getcwd())
import importlib
TL = importlib.import_module(os.environ.get("TIMELINE", "timeline"))

W, H = 1920, 1080
GW, GH = 1440, 1080          # 4:3 gate
GX = (W - GW) // 2

TINTS = {  # engraving duotones: shadow, highlight
    "green": ((14, 28, 20), (178, 208, 168)),
    "sepia": ((30, 20, 12), (232, 200, 146)),
    "teal": ((8, 26, 30), (160, 214, 208)),
    "red": ((34, 6, 10), (226, 128, 124)),
    "blue": ((6, 22, 44), (150, 206, 236)),
    "endblue": ((2, 16, 34), (52, 150, 200)),
}
FILM = {  # film grades: saturation, rgb gain, black lift
    "teal_film": (0.45, (0.86, 1.02, 1.04), (10, 18, 20)),
    "amber_film": (0.65, (1.06, 0.97, 0.82), (14, 10, 6)),
    "night_film": (0.55, (0.82, 0.92, 1.08), (6, 10, 18)),
    "dusk_film": (0.7, (0.92, 0.96, 1.06), (8, 10, 16)),
    "golden_film": (0.7, (1.06, 0.98, 0.86), (14, 10, 6)),
    "warm_film": (0.6, (1.05, 0.99, 0.86), (12, 10, 6)),
    "blue_film": (0.5, (0.84, 0.98, 1.08), (6, 16, 26)),
}

_cache = {}
PLATES = {"s01", "s02", "s10", "s11", "s12", "s13", "s16", "s22", "n2", "n4", "n6", "n8", "e2"}  # scans with paper margins


def plate_box(img):
    """Find the engraved plate inside a scanned page (drop paper margins)."""
    g = np.asarray(img.convert("L").resize((480, 358)), np.float32)
    dark = g < 150
    rows, cols = dark.mean(1), dark.mean(0)
    def span(v, thr=0.06):
        idx = np.where(v > thr)[0]
        if len(idx) == 0:
            return 0, len(v)
        return idx[0], idx[-1] + 1
    y0, y1 = span(rows); x0, x1 = span(cols)
    sx, sy = img.width / 480, img.height / 358
    x0, x1, y0, y1 = x0 * sx, x1 * sx, y0 * sy, y1 * sy
    ix, iy = (x1 - x0) * 0.015, (y1 - y0) * 0.015
    return x0 + ix, y0 + iy, x1 - ix, y1 - iy


def load_still(sid):
    if sid not in _cache:
        im = Image.open(f"stills/{sid}.png").convert("RGB")
        box = plate_box(im) if sid in PLATES else (im.width * 0.015, im.height * 0.015, im.width * 0.985, im.height * 0.985)
        im = im.filter(ImageFilter.GaussianBlur(0.7))
        _cache[sid] = (im, box)
    return _cache[sid]


def smooth_noise(t, seed, freq=1.0):
    # sum of sines: deterministic, smooth
    r = np.random.RandomState(seed)
    ph = r.rand(4) * 6.283; fr = (0.7 + r.rand(4)) * freq
    return sum(math.sin(t * f * 6.283 + p) for f, p in zip(fr, ph)) / 4


def ease(u):
    return u * u * (3 - 2 * u)


def still_frame(shot, t, end):
    im, (px0, py0, px1, py1) = load_still(shot["id"])
    pw, ph = px1 - px0, py1 - py0
    if pw / ph > 4 / 3:
        cw, ch = ph * 4 / 3, ph
    else:
        cw, ch = pw, pw * 3 / 4
    u = (t - shot["t"]) / max(end - shot["t"], 0.01)
    u = min(max(u, 0), 1.2)
    z = shot["z"][0] + (shot["z"][1] - shot["z"][0]) * u
    (cx0, cy0), (cx1, cy1) = shot.get("c", ((0.5, 0.5), (0.5, 0.5)))
    cx = px0 + pw * (cx0 + (cx1 - cx0) * u); cy = py0 + ph * (cy0 + (cy1 - cy0) * u)
    w, h = cw / z, ch / z
    x0 = min(max(cx - w / 2, px0), px1 - w); y0 = min(max(cy - h / 2, py0), py1 - h)
    # gate weave in source pixels
    k = w / GW
    sh = shot.get("shake", 0)
    x0 += (smooth_noise(t, 1, 2.5) * 1.4 + smooth_noise(t, 11, 9.0) * sh) * k
    y0 += (smooth_noise(t, 2, 2.0) * 1.8 + smooth_noise(t, 12, 8.0) * sh) * k
    out = im.transform((GW, GH), Image.EXTENT, (x0, y0, x0 + w, y0 + h), Image.BICUBIC)
    a = np.asarray(out, np.float32) / 255
    lo, hi = TINTS[shot["tint"]]
    L = a @ np.array([0.299, 0.587, 0.114], np.float32)
    L = np.clip((L - 0.06) / 0.9, 0, 1) ** 1.1
    lo = np.array(lo, np.float32) / 255; hi = np.array(hi, np.float32) / 255
    return lo + L[..., None] * (hi - lo)


def video_frame(shot, t):
    sid = shot["id"]
    st = shot["off"] + (t - shot["t"]) * shot["speed"]
    n = len(os.listdir(f"clips/frames/{sid}"))
    fi = int(round(st * 24))
    fi = min(max(fi, 0), n - 1)
    im = Image.open(f"clips/frames/{sid}/{fi + 1:04d}.jpg").convert("RGB")
    sh = shot.get("shake", 0)
    dx = smooth_noise(t, 3, 2.5) * 1.2 + smooth_noise(t, 13, 9.0) * sh
    dy = smooth_noise(t, 4, 2.0) * 1.6 + smooth_noise(t, 14, 8.0) * sh
    u = (t - shot["t"]) / 3.0
    vz = shot.get("vz", (1.0, 1.0))
    s = 1.04 * (vz[0] + (vz[1] - vz[0]) * min(max(u, 0), 1))  # trim soft edges, optional push
    w, h = im.width / s, im.height / s
    x0 = (im.width - w) / 2 + dx; y0 = (im.height - h) / 2 + dy
    im = im.transform((GW, GH), Image.EXTENT, (x0, y0, x0 + w, y0 + h), Image.BICUBIC)
    im = im.filter(ImageFilter.GaussianBlur(0.9))
    a = np.asarray(im, np.float32) / 255
    sat, gain, lift = FILM[shot["tint"]]
    L = (a @ np.array([0.299, 0.587, 0.114], np.float32))[..., None]
    a = L + (a - L) * sat
    a = a * np.array(gain, np.float32)
    lift = np.array(lift, np.float32) / 255
    a = lift + a * (1 - lift)
    return np.clip(a, 0, 1)


_logo = None


def logo():
    global _logo
    if _logo is None:
        im = Image.open("brand/cs_logo_420.png").convert("RGBA")  # pre-rendered from corespeed-logo.svg
        alpha = np.asarray(im, np.float32)[..., 3] / 255
        _logo = alpha
    return _logo


def put_logo(canvas, alpha_mul, cy=560):
    a = logo() * alpha_mul
    h, w = a.shape
    x0 = (W - w) // 2; y0 = cy - h // 2
    region = canvas[y0:y0 + h, x0:x0 + w]
    canvas[y0:y0 + h, x0:x0 + w] = region * (1 - a[..., None]) + 0.97 * a[..., None]


def shot_end(i):
    return TL.SHOTS[i + 1]["t"] if i + 1 < len(TL.SHOTS) else TL.DURATION


def raw_shot(i, t):
    s = TL.SHOTS[i]
    if s["id"] in ("black", "logo_only"):
        return np.zeros((GH, GW, 3), np.float32)
    if "z" in s:
        a = still_frame(s, t, shot_end(i))
    else:
        a = video_frame(s, t)
    if "out_fade" in s:
        f0, f1 = s["out_fade"]
        if t > f0:
            a = a * max(0.0, 1 - (t - f0) / (f1 - f0))
    return a


def gate_frame(t):
    """The picture inside the gate at time t, with transitions."""
    idx = max(i for i, s in enumerate(TL.SHOTS) if s["t"] <= t + 1e-6)
    s = TL.SHOTS[idx]
    a = raw_shot(idx, t)
    tr = s["tr"]
    if tr.startswith("dissolve:") and idx > 0:
        d = float(tr.split(":")[1])
        if t < s["t"] + d:
            u = ease((t - s["t"]) / d)
            a = raw_shot(idx - 1, t) * (1 - u) + a * u
    elif tr.startswith("dip:"):
        d = float(tr.split(":")[1])
        if t < s["t"] + d:
            a = a * ease((t - s["t"]) / d)
    return a, s


_static = {}


def statics():
    if not _static:
        yy, xx = np.mgrid[0:GH, 0:GW].astype(np.float32)
        nx, ny = (xx - GW / 2) / (GW / 2), (yy - GH / 2) / (GH / 2)
        r2 = nx * nx * 0.8 + ny * ny
        _static["vig"] = (1 - 0.32 * r2 ** 1.3).clip(0.3, 1)[..., None]
        # rounded gate mask with a soft edge
        rad, soft = 34, 2.5
        dx = np.maximum(np.maximum(rad - xx, xx - (GW - 1 - rad)), 0)
        dy = np.maximum(np.maximum(rad - yy, yy - (GH - 1 - rad)), 0)
        d = np.sqrt(dx * dx + dy * dy) - rad
        edge = np.minimum(np.minimum(xx, GW - 1 - xx), np.minimum(yy, GH - 1 - yy))
        m = np.clip((-d) / soft + 0.5, 0, 1) * np.clip(edge / soft, 0, 1)
        _static["mask"] = m[..., None]
    return _static


def film_fx(a, t, n, flk=0.0):
    st = statics()
    rng = np.random.RandomState(n * 7919 + 13)
    flick = 1 + 0.03 * smooth_noise(t, 5, 6.0) + (0.012 + flk) * (rng.rand() - 0.5)
    a = a * flick
    # halation
    small = Image.fromarray((np.clip(a, 0, 1) * 255).astype(np.uint8)).resize((GW // 4, GH // 4), Image.BILINEAR)
    sm = np.asarray(small.filter(ImageFilter.GaussianBlur(6)), np.float32) / 255
    hl = np.clip(sm.mean(-1, keepdims=True) - 0.62, 0, 1) * np.array([1.0, 0.5, 0.32], np.float32)
    hl = np.asarray(Image.fromarray((np.clip(hl, 0, 1) * 255).astype(np.uint8)).resize((GW, GH), Image.BILINEAR), np.float32) / 255
    a = a + hl * 0.55
    a = a * st["vig"]
    # grain: clumpy, stronger in midtones
    g = rng.normal(0, 1, (GH // 2, GW // 2)).astype(np.float32)
    g = np.asarray(Image.fromarray(((g * 0.18 + 0.5).clip(0, 1) * 255).astype(np.uint8)).resize((GW, GH), Image.BILINEAR), np.float32) / 255 - 0.5
    lum = a.mean(-1, keepdims=True)
    a = a + g[..., None] * (0.16 * (0.35 + lum * (1 - lum) * 2.6))
    # dust and hairs
    if rng.rand() < 0.22:
        im = Image.fromarray((np.clip(a, 0, 1) * 255).astype(np.uint8))
        dr = ImageDraw.Draw(im)
        for _ in range(rng.randint(1, 4)):
            x, y = rng.randint(0, GW), rng.randint(0, GH)
            r = rng.uniform(1, 3.5)
            c = (8, 8, 8) if rng.rand() < 0.7 else (235, 235, 225)
            dr.ellipse((x - r, y - r * rng.uniform(0.6, 1.4), x + r, y + r), fill=c)
        if rng.rand() < 0.08:
            x, y = rng.randint(0, GW), rng.randint(0, GH)
            pts = [(x + i * 3, y + 6 * math.sin(i / 4 + rng.rand())) for i in range(rng.randint(10, 30))]
            dr.line(pts, fill=(10, 10, 10), width=1)
        a = np.asarray(im, np.float32) / 255
    return np.clip(a, 0, 1) * st["mask"]


_font = None


_tag_font = None


def put_tagline(canvas, alpha_mul, cy=640):
    """The slogan under the logo, drawn in the logo's colour."""
    global _tag_font
    if _tag_font is None:
        _tag_font = ImageFont.truetype("fonts/DejaVuSerif.ttf", 36)
    text = TL.TAGLINE[0]
    m = Image.new("L", (W, 80), 0)
    dr = ImageDraw.Draw(m)
    w = dr.textlength(text, font=_tag_font)
    dr.text(((W - w) / 2, 18), text, font=_tag_font, fill=255)
    a = np.asarray(m, np.float32)[..., None] / 255 * alpha_mul
    y0 = cy - 40
    canvas[y0:y0 + 80] = canvas[y0:y0 + 80] * (1 - a) + 0.97 * a


def caption(canvas, text):
    global _font
    if _font is None:
        _font = ImageFont.truetype("fonts/DejaVuSerif.ttf", 34)
    im = Image.fromarray((canvas * 255).astype(np.uint8))
    dr = ImageDraw.Draw(im)
    w = dr.textlength(text, font=_font)
    x, y = (W - w) / 2, H - 112
    for ox, oy in ((-2, 0), (2, 0), (0, -2), (0, 2), (0, 3)):
        dr.text((x + ox, y + oy), text, font=_font, fill=(0, 0, 0))
    dr.text((x, y), text, font=_font, fill=(240, 238, 230))
    return np.asarray(im, np.float32) / 255


def frame(n, captions):
    t = n / TL.FPS
    a, s = gate_frame(t)
    a = film_fx(a, t, n, s.get("flick", 0.0))
    canvas = np.zeros((H, W, 3), np.float32)
    canvas[:, GX:GX + GW] = a
    end = next(x for x in TL.SHOTS if "logo" in x)
    l0, l1 = end["logo"]
    g0, g1 = TL.TAGLINE[1:]
    if s is end and t >= l0:
        f0, f1 = end["out_fade"]
        out = 1 if t < f0 else max(0, 1 - (t - f0) / (f1 - f0))
        put_logo(canvas, ease(min(1, (t - l0) / (l1 - l0))) * out, cy=530)
        if t >= g0:
            put_tagline(canvas, ease(min(1, (t - g0) / (g1 - g0))) * out)
    if s["id"] == "logo_only":
        f0, f1 = s["logo_fade_out"]
        k = 1.0 if t < f0 else max(0.0, 1 - (t - f0) / (f1 - f0))
        put_logo(canvas, k, cy=530)
        put_tagline(canvas, k)
    if captions:
        for c0, c1, text in TL.CAPTIONS:
            if c0 <= t < c1:
                canvas = caption(canvas, text)
    return (np.clip(canvas, 0, 1) * 255).astype(np.uint8)


def render_chunk(args):
    n0, n1, path, captions = args
    p = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}",
                          "-r", str(TL.FPS), "-i", "-", "-c:v", "libx264", "-threads", "8", "-preset", "medium", "-crf", "12",
                          "-pix_fmt", "yuv420p", path], stdin=subprocess.PIPE)
    for n in range(n0, n1):
        p.stdin.write(frame(n, captions).tobytes())
    p.stdin.close(); p.wait()
    return path


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("out"); ap.add_argument("--captions", action="store_true")
    ap.add_argument("--from", dest="t0", type=float, default=0); ap.add_argument("--to", dest="t1", type=float, default=TL.DURATION)
    ap.add_argument("--workers", type=int, default=os.cpu_count())
    ap.add_argument("--chunks", type=int, default=16, help="fixed so output does not depend on CPU count")
    ap.add_argument("--frames", type=str, default="", help="comma list of seconds to dump as PNG")
    a = ap.parse_args()
    cap_file = os.environ.get("CAPTIONS_FILE", "render/captions.json")
    if a.captions and os.path.exists(cap_file):
        TL.CAPTIONS = [tuple(c) for c in json.load(open(cap_file))]
    if a.frames:
        os.makedirs("review", exist_ok=True)
        for s in a.frames.split(","):
            n = int(float(s) * TL.FPS)
            Image.fromarray(frame(n, a.captions)).save(f"review/f_{float(s):06.2f}.png")
        sys.exit(0)
    n0, n1 = int(a.t0 * TL.FPS), int(a.t1 * TL.FPS)
    os.makedirs("render/parts", exist_ok=True)
    k = a.chunks
    edges = [n0 + (n1 - n0) * i // k for i in range(k + 1)]
    jobs = [(edges[i], edges[i + 1], f"render/parts/p{i:03d}.mp4", a.captions) for i in range(k)]
    with Pool(a.workers) as pool:
        parts = pool.map(render_chunk, jobs)
    with open("render/parts/list.txt", "w") as f:
        for p in parts:
            f.write(f"file '{os.path.abspath(p)}'\n")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", "render/parts/list.txt", "-c", "copy", a.out], check=True)
    print("wrote", a.out)

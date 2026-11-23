import sys, subprocess, numpy as np
def load(p, sr=22050):
    raw = subprocess.run(["ffmpeg","-v","error","-i",p,"-ac","1","-ar",str(sr),"-f","f32le","-"],capture_output=True).stdout
    return np.frombuffer(raw,np.float32), sr
def onset_env(x, sr, hop=256, n=1024):
    frames = np.lib.stride_tricks.sliding_window_view(x, n)[::hop] * np.hanning(n)
    S = np.log1p(np.abs(np.fft.rfft(frames, axis=1)) * 10)
    flux = np.maximum(0, np.diff(S, axis=0)).sum(1)
    flux = flux - np.convolve(flux, np.ones(16)/16, "same")
    return np.maximum(flux, 0), sr / hop
if __name__ == "__main__":
  for p in sys.argv[1:]:
        x, sr = load(p); o, fr = onset_env(x, sr)
        best = None
        for bpm in np.arange(60, 160, 0.5):
            lag = fr * 60 / bpm
            idx = np.arange(0, len(o) - lag, lag)
            for ph in np.linspace(0, lag, 24, endpoint=False):
                s = o[(idx + ph).astype(int)].mean()
                if best is None or s > best[0]: best = (s, bpm, ph / fr)
        s, bpm, ph = best
        # strongest onsets
        peaks = [i for i in range(1, len(o)-1) if o[i] > o[i-1] and o[i] >= o[i+1] and o[i] > np.percentile(o, 97)]
        print(f"{p}: ~{bpm} bpm, first beat {ph:.2f}s, beat {60/bpm:.3f}s; strong onsets: {[round(i/fr,2) for i in peaks][:40]}")

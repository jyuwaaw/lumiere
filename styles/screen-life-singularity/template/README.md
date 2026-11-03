# Template: how to run it

> This folder is code only. The large assets (live-action shots `live/`, the final mix `audio_v6.wav`, the sound-effect sources and the depth-of-field masks) are in `singularity/singularity-src.tar.gz` on Drive, which unpacks to the same layout.

## Requirements

- Node 18+, Google Chrome (or Chromium), ffmpeg with libx264 (`brew install ffmpeg`).
- The Chinese UI fonts Noto Sans / Serif / Sans Mono CJK SC. Without them the UI falls back to PingFang and looks different.
  `brew install --cask font-noto-sans-cjk-sc font-noto-serif-cjk-sc font-noto-sans-mono-cjk-sc`
- Python 3 with numpy, scipy and python-flint. Only needed for re-mixing or the math checks.

```bash
cd film && npm install && cd ..
export CHROME_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"   # macOS
```

## 1. Check a few stills first

```bash
cd film
SCALE=2 node render.js stills /tmp/st 3 62 98 128     # SCALE=2 gives 3840×2160; omit it for 1080p
```

Each Chrome process takes about a minute to initialise, because it generates the wallpaper.

## 2. Render all frames (4K: 5,125 frames, about 2.5 GB)

```bash
cd film
N=6
for w in $(seq 0 $((N-1))); do SCALE=2 node render.js frames ../frames4k/f 30 $w $N & done; wait
cd ..
```

## 3. Post-process and encode

```bash
./post4k.sh audio_v6.wav singularity_4k.mp4     # 1080p: SCALE=1, ../frames/f, then ./post.sh
```

To encode faster on a Mac, change the encoder in `post4k.sh` to `-c:v h264_videotoolbox -b:v 60M`.

## Re-rendering after an edit

```bash
cd film && SCALE=2 node render.js range ../frames4k/f 30 <start_frame> <end_frame>   # frame = seconds × 30
cd .. && ./post4k.sh audio_v6.wav singularity_4k.mp4
```

Shot start times are under `marks` in `frames/meta.json`.

## Re-mixing the sound

```bash
./prep_audio.sh && python3 audio6.py
```

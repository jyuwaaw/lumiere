# 模板：怎么跑

> 这里只有代码。大素材（真人镜头 live/、最终混音 audio_v6.wav、音效源文件、景深蒙版）在 Drive 的 `singularity/singularity-src.tar.gz` 里，解开后和这里的结构一样。

## Requirements

- Node 18+ and Google Chrome (or Chromium).
- ffmpeg built with libx264. Homebrew: `brew install ffmpeg`.
- The Chinese UI fonts Noto Sans CJK SC, Noto Serif CJK SC and Noto Sans Mono CJK SC. If they are missing, the UI falls back to PingFang and looks different. To install:
  `brew install --cask font-noto-sans-cjk-sc font-noto-serif-cjk-sc font-noto-sans-mono-cjk-sc`
- Python 3 with numpy, scipy and python-flint. Only needed for re-mixing or the math checks.

```bash
cd film && npm install && cd ..
export CHROME_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"   # macOS
```

## 1. Check a few stills first (recommended)

```bash
cd film
SCALE=2 node render.js stills /tmp/st 3 62 98 128     # SCALE=2 gives 3840×2160; omit it for 1080p
```

Each Chrome process takes about a minute to initialise, because it generates the wallpaper.

## 2. Render all 4K frames (5,125 frames, about 2.5 GB)

```bash
cd film
N=6   # number of parallel processes; about CPU cores minus 2
for w in $(seq 0 $((N-1))); do SCALE=2 node render.js frames ../frames4k/f 30 $w $N & done; wait
cd ..
```

This took about 30 minutes with 6 processes on the 8-core sandbox. An M-series Mac should be faster.

## 3. Post-process and encode

```bash
./post4k.sh audio_v6.wav singularity_4k.mp4
```

This took about 25 minutes in the sandbox (ffmpeg reaches roughly 4 fps). To encode faster on a Mac, change `-c:v libx264 -preset medium -crf 18` in `post4k.sh` to `-c:v h264_videotoolbox -b:v 60M`.

For 1080p, use `SCALE=1` and `../frames/f` in step 2, then run `./post.sh audio_v6.wav singularity_1080p.mp4`.

## Re-rendering after an edit

Every frame depends only on time, so after changing one shot you only need to re-render the frames in its time range:

```bash
cd film && SCALE=2 node render.js range ../frames4k/f 30 <start_frame> <end_frame>   # frame = seconds × 30
cd .. && ./post4k.sh audio_v6.wav singularity_4k.mp4
```

Shot start times are in `frames/meta.json` under `marks`, or in `FILM.marks` in the browser console.

## Re-mixing the sound (optional)

```bash
./prep_audio.sh        # decode the sources to WAV
python3 audio6.py      # writes audio_v6.wav: score, sound effects and room tone, placed from the film's event list
```

## Sources and licences (personal use)

- **Score:** ElevenLabs Music, generated in seven sections that follow the shot list. A 60-second excerpt of Scott Buckley's *Decoherence* (CC BY 4.0) was used as the style reference only; it is not in the mix.
- **Sound effects:**
  - Freesound: MacBook keyboard, mouse, clock and night room tone, each under its own CC licence.
  - Mixkit: cinematic impacts, risers and UI sounds.
  - ElevenLabs Sound Effects: impact, takeover, data stream, shimmer and fireworks.
  - The full list is in `sfxlib/CREDITS.md`.
- **Live action:** keyframes from Nano Banana Pro, animated with MiniMax H3 Max image-to-video. The sources are 1080p, so in 4K they are upscaled and slightly softer than the rest of the film.
- **Visual homage:** TakayamaMaria, 《我瘫坐在奇点，仿佛看见宇宙大爆炸爆炸》.

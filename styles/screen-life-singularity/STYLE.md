# Screen-life cinema (screen-life · singularity)

**English** | [中文](STYLE.zh.md)

Reference: TakayamaMaria, 《我瘫坐在奇点，仿佛看见宇宙大爆炸爆炸》, Bilibili BV17eHc6sEcX (3:15).
This film: SINGULARITY (a sequel), 2:52, 4K, about "what is lost going from the 32-ions to the 64-ions".

## Keywords

- **Form**: screen-life, macro shots hugging the screen, shallow depth of field, angled perspective camera, slight handheld drift, hard cuts
- **Texture**: LCD subpixel close-ups, replica UIs (Windows / Chrome / Claude), character-by-character typing through a Chinese pinyin IME, ticking counters, terminal data streams, a wall of windows
- **Story**:
  1. A late-night clock anchors the time.
  2. A human question gets no search results.
  3. The person summons the AI, sees a permission dialog, and lets the AI take over; it searches frantically.
  4. Notepad: "No existing literature answers this → I'll prove it."
  5. The computation produces a discovery.
  6. The clock hits 0:00, one beat of silence, an impact, the title.
  7. The answer streams in.
- **The soul**: **the content is real**. The discovery shown must be true and checkable; terminal output must be copied from real computation; never claim a proof that wasn't completed.

## Mood (the easiest thing to get wrong)

- **The protagonist is the person, not the AI.** This is someone watching something far beyond them happen, until they slump back in their chair.
- **The tone is awe plus unease, not "problem solved, celebrate".** The latter turns into a tech promo; the first score fell into exactly that trap.
- By section:

| Section | Feeling | Music direction |
|---|---|---|
| Late-night open | cold, empty, alone | low drone, sparse distant piano |
| Search fails | stuck, restless | same, barely moving |
| AI takeover | uneasy, something waking | dissonant strings slowly creeping upward |
| "I'll prove it" | breath held | near silence, one high harmonic |
| Computation | cold, mechanical, inhuman | minor-key mechanical ostinato, **never heroic** |
| Discovery / spectrum split | awe mixed with dread | choir-like pad and low brass swelling |
| Midnight | one beat of silence | everything cut, only the clock ticking, which stops at 0:00 |
| Title | cosmic weight | one huge low boom, then vacuum |
| Answer | quiet, fragile, lingering | a lone piano ending on an unresolved chord |

## Shot grammar (about 170 s)

| Time | Shot |
|---|---|
| 0–4.6 | Live action: rainy window at night, a man typing at a laptop, desk clock 23:57 |
| 4.6–9 | LCD subpixel clock close-up → slightly wider clock and date |
| 9–34 | Browser search: pinyin IME typing, results page, Wikipedia "no reliable sources", search again in quotes → "no results" |
| 34–49 | Open Claude from the taskbar → pick "Singularity research preview" in the model menu (close-up on the badge) → type the question |
| 49–55 | System permission dialog (wide → close-up on "Yes", click) |
| 55–66 | Chrome under automation, tabs popping open one by one → a wall of 16 windows, camera pulls back |
| 66–76 | Paper close-ups (highlights, Ctrl+F find bar) → control banner at the top, counter reaching "3,107 sources searched" |
| 76–84 | Notepad: "Searched 3,107 sources. No existing literature answers this." Pause → "→ I'll prove it." (**must be dead centre**) |
| 84–114 | Terminal: command → scrolling multiplication table → progress bar → results table → exact Python verification (real output) |
| 114–122 | Eigenvalue-splitting visualisation (real data, row by row) |
| 122–125 | Clock 23:59 → 0:00, the ticking stops, about 0.35 s of silence |
| 125–130 | Title: black deep space, a point of light bursts into an event-horizon ring, thin wide-spaced SINGULARITY below |
| 130–133 | Live action: clock at 0:00, fireworks outside, the man slumped in his chair |
| 133–163 | Claude's answer streaming, camera following the text |
| 163–171 | End card: the math is real, homage to the original |

## Look recipe

- **Camera**:
  - Give each shot start and end keyframes (focus point, zoom, rotateX, rotateY), ease between them, and add a little handheld noise.
  - Hard-cut between shots, with a 0.2–0.5 s focus pull on the way in.
- **Depth of field**: in ffmpeg, blend a blurred layer over the sharp one through a mask (`gblur` + `maskedmerge`), keeping a horizontal band in the middle sharp.
- **Texture**: bloom (blur the highlights and screen them back on), slight chromatic aberration (`rgbashift`), vignette, animated grain.
- **LCD subpixels**: draw the text on a small canvas, then blow each pixel up into three vertical R, G, B bars.
- **Live action**:
  1. Make the first frame with Nano Banana Pro.
  2. Derive the last frame from it in edit mode, so the scene stays the same.
  3. Animate between the two with MiniMax H3 Max first-and-last-frame image-to-video.

## Sound recipe

- **Keyboard**:
  - Slice real MacBook typing recordings into single keystrokes (336 this time) and pick one at random per keypress.
  - **The human types with real keystrokes; the AI types with lighter digital clicks**, so you can hear the difference.
- **Bed**: a night apartment room tone (distant traffic, appliance hum) under the whole film.
- **Key moments**:
  - AI takeover: a low whoosh plus a thud. **No piercing electronic sweeps.**
  - "I'll prove it": a low drum.
  - Before midnight: a choir riser that pushes up, then hard-cuts to silence.
  - Title: a deep boom.
- **Score**:
  - Generate it with AI in sections that follow the shot list, each with its own duration and style.
  - Give the first section a reference track that fits the mood (Scott Buckley's *Decoherence* this time), and set the later sections to follow context.
  - Fix the result afterwards with per-section gain automation.
- **Sync**: picture and sound effects come from the same timeline, so every keystroke sound lands on a keypress on screen.

## Pipeline

See `template/`:
1. `film/`: an HTML page implementing `FILM.seek(t)`. The picture is a pure function of time; no CSS animations.
2. `film/render.js`: multi-process frame capture with puppeteer-core. `SCALE=2` gives 4K, and it can re-render just a range of frames.
3. `post.sh` / `post4k.sh`: post-processing, live-action overlays, audio mux, encode.
4. `audio6.py`: reads the timeline events, places sound effects and beds, applies per-section score gain, and writes the mix.
5. `math/`: the math checks (exact arithmetic with python-flint).

## Cost reference

- First version (1080p, synthesized sound): about 30 minutes.
- Media generation: about 6,300 credits in total.
  - Two scores: about 5,200 (about 2,600 each).
  - 2 keyframes, 2 image-to-video clips and 5 custom sound effects: about 1,100.
- 4K rendering: about 30 minutes with 6 processes on an 8-core server, plus about 25 minutes of post and encode.

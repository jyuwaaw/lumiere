# Lessons (SINGULARITY, 2026-10-28 → 11-03)

**English** | [中文](LESSONS.zh.md)

Each entry: problem → cause → what to do from the start next time. 👤 marks problems Benji pointed out.

## Mood and sound

1. 👤 **The sound effects sounded cheap**
   - Cause: in the first version every sound was synthesized in code.
   - Next time: use real recordings for sound effects (Freesound MacBook typing, mouse, room tone). Keep synthesis for beds only.
2. 👤 **The score sounded like a tech promo: too hyped, off-theme**
   - Cause: the mood was set as "AI cracks the problem", and the prompts asked for drive, rising intensity, majesty, brass and hope.
   - Next time: **before writing music prompts, decide whose point of view the film is from.** In this kind of film the protagonist is the person watching the singularity happen, so the tone is awe plus unease. Exclude triumphant, heroic, corporate, tech promo, epic trailer and major key explicitly.
3. **The AI score was generated once, with no candidates to compare**
   - Next time: condition on a reference track that fits the mood, and when you can, generate 2–3 candidates for a human to pick from.
4. 👤 **The sound at 54 s (the AI takeover) was piercing**
   - Cause: the AI-generated "digital glitch sweep" had almost all its energy above 4 kHz and raised the overall loudness by 12 dB the moment it came in.
   - Next time: look at the spectrum of every generated sound effect first. If the high-frequency share is too big, low-pass it and turn it down, or swap it for a low whoosh plus a thud.
5. **The maker can't hear**
   - Cause: the AI doing the production has no hearing, only data: loudness, spectra, onsets.
   - Next time: any sound change needs a human listening on headphones before it's final.

## Picture

6. 👤 **"I'll prove it" was not centred**
   - Cause: that shot's focus point used hard-coded coordinates.
   - Next time: **anchor every camera move to a DOM element** (e.g. `x: '#np_l3'`). For a line being typed, hold its full width with invisible remaining text, so the whole line stays centred.
7. 👤 **The title card was ugly**
   - Cause: a blurry red-and-blue petal wallpaper with thin text looked cheap and clashed with the dark tone.
   - Next time: build the title card around the film's core image (here "singularity" became black deep space with an event-horizon ring), with lots of empty space, wide letter spacing and thin type.
8. 👤 **A flash frame right after the title**
   - Cause: the overlaid live-action shot ended 2 frames before the cut and exposed the title card underneath.
   - Next time: hold the last frame of overlays up to the cut (ffmpeg `overlay` with `eof_action=repeat`). **After every render, scan per-frame luminance automatically for isolated flash frames.**
9. **The window wall strobed**
   - Cause: 16 windows switched rapidly between white and dark pages, so overall brightness jumped around.
   - Next time: switch more slowly, darken the white pages, and make sure neighbouring windows never show the same page.

## Tools and engineering

10. **Bilibili blocks direct downloads from the server (412)**
    - Next time: read `window.__playinfo__` inside the browser page to get the audio and video URLs, then download them in chunks from within the page.
11. **The video-understanding tool bills but returns no text**
    - Status: reported to the platform; still not fixed.
    - Next time: look at reference videos through ffmpeg frame contact sheets instead.
12. **The image-to-video model rejects Drive file IDs**
    - Next time: pass a signed download URL.
13. **Drive rejected a 525 MB upload (413)**
    - Next time: serve large files from the sandbox preview page.
14. **4K initialisation is slow**
    - Cause: the double-resolution wallpaper needs a large-radius blur, so each render process takes about a minute to start.
    - Next time: don't time out the page load (`timeout: 0`).
15. **A wait script waited 2 hours for itself**
    - Cause: `pgrep -f` matched the waiting script's own command line.
    - Next time: match the process name exactly with `pgrep -x`.
16. **Changing one shot doesn't need a full re-render**
    - How: `render.js range` renders just that range of frames; then run post again.

## What the controlled experiment showed

- Without CoreSpeed tools (only the sandbox and open-source software), the same quality of picture and real math is achievable. An independent sub-session made a version in about 70 minutes.
- What really needs generation is the AI score that follows the shot list, the live-action shots and the custom sound effects.
- The ready-made film score the sub-session picked (Scott Buckley) fit the theme better than the first AI score. **Choosing the mood matters more than choosing the tool.**

# Archival fable (archival-fable · somewhere to be)

**English** | [中文](STYLE.zh.md)

Reference: the Paradigm launch film (x.com/thescottfan/status/2119863088795001001).
This film: *Somewhere to Be*, a 106 s brand film for CoreSpeed, 1920×1080, 24 fps, v2.1 (2026-11-23).

A parable told over archival material: steel engravings and faded 16mm footage, a whispered fairy-tale voiceover, and the product only in the last seconds. It suits any brand film where the product answers a problem the audience already feels.

## Keywords

- **Form**: a fable in three acts (a world with a problem, a turn, the answer); a 4:3 gate inside a 16:9 frame; Ken Burns moves on stills, short image-to-video clips, hard cuts that get faster toward the climax.
- **Texture**: 19th-century steel engravings in duotone tints; 1970s 16mm Ektachrome frames with grain, weave, flicker, halation and dust; star charts; a small glowing sphere of light that stands for "the mind" in every shot.
- **Story**:
  1. Minds that can answer anything wake every morning in an empty room, with no memory and no keys.
  2. People become their keepers and repeat the same story to them every day.
  3. The minds multiply; fear sets in; doors get bolted and watchers set at every window.
  4. Hard cut to black.
  5. Someone asks where the minds should live, not how clever they are.
  6. Each image of the answer maps to one real capability of the product (a room that remembers, doors that open with your keys, hands that reach your machines, a clock that wakes them, a keeper who still asks first).
  7. An image from the fear act comes back answered (chains → a harness), then the slogan and the logo.
- **The soul**: **every image of the answer is a real product capability**, and the fear is real too. If a metaphor maps to nothing that ships, cut it. The brand appears only at the end, carried by the logo, not by a spoken name.

## Mood

Whose point of view? The people who look after the minds. The audience should feel wonder, then weariness, then dread, then relief that feels earned.

| Section | Time (s) | Feeling | Music direction |
|---|---|---|---|
| Wonder | 0–14 | tender, magical, quiet | celesta, music box, felt piano, soft high strings |
| Routine | 14–31.6 | weary, repetitive | pizzicato ostinato like a clock, 100 bpm, slowly growing |
| Fear | 31.6–53.6 | anxious, relentless | layered string ostinatos at 120 bpm, low brass, taiko-like hits, a shepard tone, ending on its loudest hit |
| Black | 53.6–55.2 | the floor drops | nothing but the hit's reverb tail |
| Turn | 55.2–65 | fragile hope | solo felt piano, single notes, lots of space |
| Rise and climax | 65–92 | warm, building, euphoric | piano arpeggios, warm strings, then full orchestra |
| Resolve | 92–106 | calm, at home | one long sustained chord that rings out |

## Shot grammar (106 s)

| Time (s) | Shot |
|---|---|
| 0–14 | Engravings and film: a domed library with a glowing sphere, an empty room at dawn with the sphere on the floor, a slate wiped clean, a corridor of doors with no handles |
| 14–31.6 | Routine, cut on the clock: a crowd around spheres under glass, a clock spinning, hands reading the same book, keys passed through a hatch, a keeper asleep under a wall of keys, a night watch by a door. The cuts go from 1 s to 0.5 s as the ticks speed up |
| 31.6–53.6 | Fear, cut on the score's half-second grid: windows lighting one by one, spheres multiplying, a Piranesi hall of doors, frightened townspeople, a bolt slammed shut, barred windows with a watchman at each, an eye at a keyhole, a panopticon. The last 6.5 s is a montage at 0.5 s then 0.25 s with growing shake and flicker |
| 53.6–55.2 | Black. One reverb hit on the score's final downbeat |
| 55.2–65.2 | A figure with a lantern walking up a hill at golden hour; a light coming on in a lone house |
| 65.2–82 | The answer, one image per capability: a star chart like a map of memory, doors opening down a corridor, a mechanical hand flipping a switch, an astronomical clock lighting up, a hand knocking on a door |
| 82–92 | The earlier images return warm and lit: the apartment windows, the spheres, the sphere alone, the empty room now a lived-in study |
| 92–97.6 | The answer to the chains: hands buckling a leather harness, the sphere glowing behind them |
| 97.6–106 | Engraving: people and spheres pulling one wagon together by a shared harness; the logo, then the slogan under it |

## Look recipe

- **Two style prefixes, used on every prompt** (full text in `prompts/shots.md`):
  - engraving: steel engraving, cross-hatching and stipple, full-bleed crop, no margins, no border, no text;
  - film: a single frame of 1970s 16mm Ektachrome, grain, halation, no sprocket holes, no date stamp, no letters or numbers.
- **One recurring character**: the same phrase for the glowing sphere in every prompt, so it reads as one being.
- **Stills**: Nano Banana Pro, 4:3, 2K. **Clips**: MiniMax H3 Max image-to-video from the still, 6 s, 768P, with the motion written as its own prompt.
- **Renderer** (`template/tools/render.py`, Python with numpy and Pillow):
  - engravings get a duotone (shadow and highlight colour per section: green, sepia, teal, red, blue);
  - film gets a grade (saturation, RGB gain, black lift) and its own tints (amber, night, dusk, golden);
  - both get grain, gate weave, flicker, halation, dust and a rounded 4:3 gate;
  - engravings that came on paper with margins are cropped to the plate (the `PLATES` set); full-bleed ones are not.
- **Movement**: stills get a slow zoom and pan; the fear act adds shake and flicker that grow with the cutting speed.
- **End card**: the logo, then one line of slogan in a serif under it. No caption under the slogan, because the card already shows it.

## Sound recipe

- **Voiceover**: ElevenLabs v4, voice Laura, the whole script as one take with an emotion tag per section (`[softly, with wonder]`, `[wearily]`, `[tense]`, `[anxious, faster]`, `[whispers]`, `[warm, hopeful]`, `[gently]`). Make three takes and pick by emotional contrast. Cut phrases at the quietest point between words and place each one by its word timings.
- **Score**: ElevenLabs Music v2.5, **one cue per act** (three cues), each generated on its own. Name banned instruments in every prompt (guitar, folk, choir, vocals).
- **Ducking**: music 4 dB under the voice in calm parts, 8 dB in the fear act, where 1–4 kHz is also carved out while she speaks.
- **Accents at every section boundary**: a riser and a sub boom into the fear cue; a big impact on the fear cue's own final downbeat, whose reverb rings into the black; true silence after it.
- **Action sounds** (bolt, knocks, doors, clock ticks) sit on the frames where the action happens. The clock ticks follow the routine cuts: once a second, then twice, then four times.
- **Bed**: a 16mm projector loop under the whole film, pulled out entirely for the black.
- **Loudness**: about −15 LUFS, true peak under −1.5 dB, loudness range about 9 LU.

## Pipeline

See `template/`. Everything after generation is code, and a rebuild never calls a model.

1. `shots.py`: the style prefixes and every shot's prompt and motion.
2. `tools/stills.py`, `tools/vids.py`, `tools/music3.py`, `tools/vo2.py`: generation, through the CoreSpeed MCP endpoint (`tools/cs_mcp.py`).
3. `tools/beats.py`, `tools/onsets.py`: find each cue's beat grid and strong onsets, to place the cuts.
4. `timeline_v2.py`: the edit list (shots, tints, moves), cue placement, voiceover lines, sound-effect times.
5. `tools/mix_v2.py`: the mix and the caption timings. `tools/render.py`: the picture, in 16 fixed chunks.
6. `build.sh`: checks versions and asset checksums, mixes, renders, encodes and compares the stream hashes with the delivered film.

## Cost reference

- v1 (one agent run of about 55 minutes): about 19k credits.
- v2 (four rounds of notes over three days: per-act music, three voice takes, eight inserts, sound effects): about 8k more.
- v2.1 (new ending: one still, one clip, three voice takes): not tracked separately.
- A rebuild from the frozen assets costs nothing and takes about 14 minutes on 8 cores.

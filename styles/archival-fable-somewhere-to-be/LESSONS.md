# Lessons (Somewhere to Be, 2026-11-09 → 11-23)

**English** | [中文](LESSONS.zh.md)

Each entry: problem → cause → what to do from the start next time. 👤 marks problems the director caught in review.

## Mood and sound

1. 👤 **"Good style, but no rhythm and no change of emotion"** (v1)
   - Cause: there was no emotional arc, and the whole score came from one plan.
   - Next time: write the arc (mood, tempo and time per section) before generating anything; one cue per act; cut on the beat grid.
2. **One long music plan put the hopeful swell under the fear lines**
   - Cause: a single five-section composition plan drifts; the model places its own builds.
   - Next time: generate each act's cue on its own and place it on the timeline yourself.
3. **Composition plans started with 8–9 s of silence**
   - Next time: for short, intense cues use plain prompt mode with `music_length_ms`.
4. 👤 **"The music sounds like guitar"** (v1)
   - Cause: no instrument was banned, and a model asked about the whole film called a piano a guitar.
   - Next time: name banned instruments in every music prompt. Ask a media model narrow questions about one short isolated clip, never about the whole film.
5. 👤 **"The hard cut needs a reverb hit"** (v2)
   - Cause: digital silence alone felt empty, not dramatic.
   - Next time: plan an accent at every section boundary. Black can follow the hit, but something has to land first.
6. 👤 **"The hit is off the beat and stiff"** (v2)
   - Cause: the hit was aligned by its peak, the cue's own last downbeat had been trimmed away, and the voice ducking punched a hole in the pulse just before.
   - Next time: trim the effect's pre-roll and put its **attack** on the cue's own downbeat; let the cue play that downbeat.
7. 👤 **"The knock does not match the hand"** (v2)
   - Cause: the knock times were guessed from a 2 fps strip.
   - Next time: track the hand with frame-to-frame phase correlation, take the frames where the motion reverses (here clip frames 60, 67 and 73), and put each knock's attack on its frame.
8. **The brand name said on its own had odd stress**
   - Cause: said as a sentence of its own, "CoreSpeed" got a pitch spike on "Core".
   - Next time: keep the name inside a sentence, or let the logo carry it (in v2.1 the voiceover never says it). If it must be spoken, measure the stressed syllable's pitch against the take's median; above about +30 % take that line from a calmer take.
9. **Picking a voice take by ear is not possible for the maker**
   - Cause: the agent that made the film cannot hear.
   - Next time: pick takes by measured contrast and pitch peaks, then have a person listen on headphones at each review gate (script, each cue alone, first full cut, detail pass, freeze). Every audio problem above was found by the director, not by the agent.

## Picture

10. **Engravings came on paper with margins, and 16mm frames came with sprocket holes and date stamps**
    - Next time: ban margins, borders, sprocket holes, date stamps and all text in the style prefixes. Crop to the plate only the stills that really have margins: the plate detector cuts the top off a full-bleed image.
11. **A clip where "the doors swing open" barely moved**
    - Next time: describe motion the camera can see: which door, which direction, what light comes out ("The nearest door on the right swings wide open toward the camera… Clear, visible door motion").
12. **The fast montages ran out of images**
    - Next time: plan inserts for the montages from the start: details like a bolt, an eye at a keyhole, chains, a clock, a wall of keys.
13. **An ending that only states the brand feels flat**
    - In v2.1 the ending answers an image from the fear act: the door locked with chains comes back as a harness that lets people and minds pull together. A callback lands harder than a new image.

## Tools and engineering

14. **A rebuild gave the identical picture but different H.264 bytes**
    - Cause: x264's output depends on its thread count, which ffmpeg sets from the CPU count, and the sandbox's CPU count had changed.
    - Next time: pin `-threads 8` on every libx264 call. Then the bytes are identical on 8, 4 or 2 cores.
15. **VBV made x264 non-deterministic**
    - Cause: with `-maxrate`/`-bufsize` and threads, two encodes on the same machine differed.
    - Next time: drop VBV; two-pass at 6.5 Mbps holds the size by itself (about 90 MB) at the same quality.
16. **The sandbox died, twice, with work only on its disk**
    - Cause: the cloud sandbox became unavailable at the VM level; it had nothing to do with the step that was running.
    - Next time: freeze a package (assets + code + checksums + expected stream hashes) and upload it as soon as a version is approved. Commit or upload work in progress often.
17. **Generated files had expiring links**
    - Cause: the media service's output links expire after 7 days.
    - Next time: download every generated file into the project at once and record its model, prompt, seed and job id in a ledger.
18. **Uploads over about 100 MB were refused**
    - Next time: encode deliverables at 6.5 Mbps two-pass (about 90 MB for 106 s) and split archives into 90 MB parts.
19. **The checksum step failed after only reading the code**
    - Cause: `MANIFEST.sha256` lists the `__pycache__` files, and importing `shots.py` with another Python build rewrote them.
    - Next time: leave `__pycache__` out of the manifest. Until then, don't run Python inside an unpacked package before `build.sh`; restore the cache files from the archive if you did.
20. 👤 **The ending felt off: a slogan card, then a closing shot of mostly empty sky**
    - Cause: the slogan was said and then shown again, and the last engraving was composed with an empty upper two thirds to hold the logo and slogan. Without the text it was four seconds of empty frame.
    - Next time: end like a film. Fade the last story image to black, hold a beat of black, then show the logo alone. Don't compose a shot only to carry text.

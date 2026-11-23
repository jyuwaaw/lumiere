# Score prompts (ElevenLabs Music v2.5)

Three cues, one per act, each generated on its own and placed on the timeline in `template/timeline_v2.py`:
`M1` wonder and routine (from 0 s), `M2` fear (from 31.6 s, ends on its own hit at 53.6 s), `M3` turn to resolve (from 55.2 s).

Banned in every chunk (`negative_styles`): vocals, singing, choir, humming, spoken word, acoustic guitar, guitar, folk, ukulele, drum kit, EDM, pop.

Takes were picked by their loudness curve (`template/tools/loud.py`, the max momentary loudness per 3 s) and by asking a media model one narrow question about the instruments of a short isolated clip.

## M1: composition plan (seeds 3 and 17; seed 17 used)

```json
{
 "chunks": [
  {
   "text": "[Wonder]\n{instrumental, delicate, slow}",
   "duration_ms": 16000,
   "positive_styles": [
    "cinematic film score",
    "celesta and music box",
    "felt piano",
    "soft high strings",
    "wonder",
    "fairy tale",
    "tender",
    "magical",
    "quiet"
   ],
   "negative_styles": [
    "vocals",
    "singing",
    "choir",
    "humming",
    "spoken word",
    "acoustic guitar",
    "guitar",
    "folk",
    "ukulele",
    "drum kit",
    "EDM",
    "pop"
   ]
  },
  {
   "text": "[Routine]\n{instrumental, a repeating pizzicato ostinato like a clock, 100 bpm, slowly growing}",
   "duration_ms": 18000,
   "positive_styles": [
    "pizzicato strings ostinato",
    "ticking clock rhythm",
    "repetitive",
    "felt piano",
    "minor key",
    "weary",
    "steady pulse",
    "gradual build"
   ],
   "negative_styles": [
    "vocals",
    "singing",
    "choir",
    "humming",
    "spoken word",
    "acoustic guitar",
    "guitar",
    "folk",
    "ukulele",
    "drum kit",
    "EDM",
    "pop"
   ],
   "context_adherence": "medium"
  }
 ]
}
```

## M2: composition plan (seeds 3 and 17; neither used)

```json
{
 "chunks": [
  {
   "text": "[Multiply]\n{instrumental, the ostinato speeds up and multiplies, 120 bpm}",
   "duration_ms": 9000,
   "positive_styles": [
    "layered string ostinatos",
    "accelerating",
    "low cello",
    "pulsing low synth",
    "urgent",
    "minor key",
    "cinematic"
   ],
   "negative_styles": [
    "vocals",
    "singing",
    "choir",
    "humming",
    "spoken word",
    "acoustic guitar",
    "guitar",
    "folk",
    "ukulele",
    "drum kit",
    "EDM",
    "pop"
   ]
  },
  {
   "text": "[Fear]\n{instrumental, relentless crescendo, low brass, deep percussion hits, rising tension to a peak}",
   "duration_ms": 11000,
   "positive_styles": [
    "relentless crescendo",
    "low brass",
    "taiko-like deep percussion",
    "shepard tone rising",
    "dark",
    "tense",
    "cinematic thriller score",
    "ends at the loudest peak"
   ],
   "negative_styles": [
    "vocals",
    "singing",
    "choir",
    "humming",
    "spoken word",
    "acoustic guitar",
    "guitar",
    "folk",
    "ukulele",
    "drum kit",
    "EDM",
    "pop"
   ],
   "context_adherence": "high"
  }
 ]
}
```

⚠️ Counter-example: composition plans started with 8–9 s of silence, which a 22 s fear cue cannot afford.
The cue in the film is a prompt-mode take instead:

## M2: prompt mode (used, file `M2p_2.mp3`)

`music_length_ms: 22000`, `force_instrumental: true`

> Instrumental cinematic thriller cue, 22 seconds. It starts immediately at a moderate level with a fast pizzicato string ostinato at 120 bpm and a low pulsing synth, then layers multiply: more string ostinatos, low cello and low brass, deep taiko-like percussion hits every bar, a rising shepard-tone effect. A relentless crescendo of dread that keeps accelerating and climbs to a huge peak in the final two seconds, ending abruptly on the loudest hit. Dark, minor key, urgent, anxious. No guitar, no vocals, no choir, no drum kit.

Result: works. Its last hit lands at 53.6 s and the film cuts to black on it; the impact effect and a reverb throw of that beat carry into the silence.

## M3: composition plan (seeds 3 and 17; seed 3 used)

```json
{
 "chunks": [
  {
   "text": "[Turn]\n{instrumental, solo piano, a few single notes with space, fragile, hopeful}",
   "duration_ms": 9000,
   "positive_styles": [
    "solo felt piano",
    "sparse",
    "fragile",
    "hopeful",
    "intimate",
    "lots of space",
    "major key"
   ],
   "negative_styles": [
    "vocals",
    "singing",
    "choir",
    "humming",
    "spoken word",
    "acoustic guitar",
    "guitar",
    "folk",
    "ukulele",
    "drum kit",
    "EDM",
    "pop"
   ]
  },
  {
   "text": "[Rise]\n{instrumental, piano arpeggios, warm strings enter, a gentle pulse returns, building, 96 bpm}",
   "duration_ms": 22000,
   "positive_styles": [
    "piano arpeggios",
    "warm string ensemble",
    "soft pulsing synth",
    "building",
    "hopeful",
    "major key",
    "cinematic modern score",
    "emotional"
   ],
   "negative_styles": [
    "vocals",
    "singing",
    "choir",
    "humming",
    "spoken word",
    "acoustic guitar",
    "guitar",
    "folk",
    "ukulele",
    "drum kit",
    "EDM",
    "pop"
   ],
   "context_adherence": "medium"
  },
  {
   "text": "[Climax]\n{instrumental, full orchestral swell, soaring strings, big and emotional}",
   "duration_ms": 10000,
   "positive_styles": [
    "full orchestra",
    "soaring strings",
    "french horns",
    "timpani swell",
    "euphoric",
    "emotional climax",
    "major key",
    "cinematic"
   ],
   "negative_styles": [
    "vocals",
    "singing",
    "choir",
    "humming",
    "spoken word",
    "acoustic guitar",
    "guitar",
    "folk",
    "ukulele",
    "drum kit",
    "EDM",
    "pop"
   ],
   "context_adherence": "high"
  },
  {
   "text": "[Resolve]\n{instrumental, one long sustained chord, strings and piano, rings out to silence}",
   "duration_ms": 10000,
   "positive_styles": [
    "one long sustained major chord",
    "strings",
    "single piano note",
    "peaceful",
    "resolution",
    "ring out"
   ],
   "negative_styles": [
    "vocals",
    "singing",
    "choir",
    "humming",
    "spoken word",
    "acoustic guitar",
    "guitar",
    "folk",
    "ukulele",
    "drum kit",
    "EDM",
    "pop"
   ],
   "context_adherence": "high"
  }
 ]
}
```

## Lessons

- A single plan for the whole film put the hopeful swell under the fear lines. One cue per act fixed it.
- In v1 the score was heard as guitar by the director; the instrument was never banned. Name what you don't want in every chunk.

# Custom sound effects (fal-ai/elevenlabs/sound-effects/v2, 3 credits/s)

| Use | Length | prompt_influence | Prompt | Result |
|---|---|---|---|---|
| Title impact | 7 s | 0.6 | Massive cinematic movie trailer impact: a huge deep sub-bass boom with a dark low brass braam, followed by a long, dark, slowly decaying reverb tail. Clean, powerful, high production quality. | Works; very loud, mixed at gain 0.38 |
| AI takeover | 2.5 s | 0.6 | Digital system takeover: a glitchy electronic sweep rising quickly, data stutter, ending in a sharp, satisfying digital lock-in click. Sleek sci-fi UI sound design. | ⚠️ Too piercing (energy concentrated at 5–10 kHz). Ended up low-passed at 3.5 kHz at gain 0.10 as a faint texture, with a low whoosh plus thud carrying the moment |
| Computation bed | 10 s loop | 0.5 | Fast computer data processing texture: dense, rapid, soft electronic clicks, chirps and tiny beeps, like a supercomputer crunching numbers, subtle and rhythmic, background layer. | Works; loop=true, runs under the whole computation section |
| Spectrum split | 6 s | 0.6 | Crystalline shimmering chime cascade: a single pure glassy tone that splits into many glittering bell-like tones spreading out, ethereal, awe, with soft reverb. | Works |
| Midnight fireworks | 10 s | 0.5 | Distant New Year fireworks heard from inside a quiet apartment through a closed rainy window: muffled booms and soft crackles far away, light rain on glass, calm room tone. | Works; used under both the opening and the slump shot |

Lesson: check the spectrum of every generated effect before using it, and treat anything with too much high-frequency energy.

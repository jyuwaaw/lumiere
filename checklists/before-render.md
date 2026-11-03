# Before rendering

**English** | [中文](before-render.zh.md)

## Before the full render

- [ ] Pull 1–2 stills per shot into a contact sheet and look at each one
- [ ] Key lines and key numbers sit dead centre (camera anchored to elements, no hard-coded coordinates)
- [ ] Typing shots: text isn't cropped and the IME candidate bar is fully visible
- [ ] Look at the title card on its own: is it restrained enough, and does it carry the film's core image?
- [ ] Every number and code output on screen comes from a real computation

## After the render

- [ ] Scan per-frame mean luminance for isolated flash frames (a frame much brighter or darker than both neighbours)
- [ ] Check 3 frames either side of every hard cut
- [ ] No overlay ends early and exposes the layer underneath
- [ ] Fast-flickering passages (the window wall, etc.) don't strobe

## Sound

- [ ] **A human listens to the whole thing on headphones**
- [ ] Every section of the score matches the mood in STYLE.md and hasn't drifted into a promo
- [ ] Generated sound effects checked on a spectrum: no excessive high-frequency share, no sudden loudness jumps over 6 dB
- [ ] Keyboard and mouse sounds line up with the actions on screen
- [ ] Silent beats are truly silent (beds and reverb tails pulled down too)
- [ ] Overall loudness normalised (-16 LUFS)

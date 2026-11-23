"""Edit decision list for v2: an emotional arc with rhythm. Times in seconds, 24 fps."""

FPS = 24
DURATION = 106.0

# Music cues: (file, timeline start, gain dB, fade-in s, fade-out s, hard_end)
M1_AT, M2_AT, M3_AT = 0.0, 31.6, 55.2
HARD_CUT = 53.6          # end of M2: picture and sound cut to black and silence
MUSIC = [
    ("music2/M1_17.mp3", M1_AT, -9.5, 0.3, 1.6, 33.2),
    ("music2/M2p_2.mp3", M2_AT, -5.5, 0.25, 0.0, None),  # plays its own final hit at HARD_CUT
    ("music2/M3_3.mp3", M3_AT, -9.0, 0.0, 2.0, None),
]

# Voiceover: (timeline start, take, sentence). Take 5 carries the arc; take 13 has the calmest brand name.
VO = [
    (1.5, 5, "Once upon a time there were minds that could answer anything"),
    (6.5, 5, "But every morning they woke in an empty room"),
    (9.8, 5, "No memory of yesterday"),
    (11.9, 5, "No key to any door"),
    (14.2, 5, "So the people became their keepers"),
    (16.9, 5, "Every day they told them the same story again"),
    (20.1, 5, "They passed keys through the window one by one"),
    (23.0, 5, "and sat up through the night in case something went wrong"),
    (32.6, 5, "Then the minds multiplied"),
    (35.2, 5, "One keeper a hundred rooms"),
    (38.6, 5, "The people grew afraid"),
    (40.6, 5, "They bolted the doors and set a watcher at every window"),
    (44.0, 5, "until they spent their days watching the minds instead of working with them"),
    (56.4, 5, "Until one day someone stopped asking how clever the minds were"),
    (60.8, 5, "and asked where they would live"),
    (65.6, 5, "A room that remembers what you told it"),
    (69.0, 5, "Doors that open with your own keys"),
    (72.2, 5, "Hands that can reach your machines"),
    (75.4, 5, "A clock that wakes them while you sleep"),
    (78.6, 5, "And a keeper at the door who still asks you first"),
    (85.4, 5, "The minds were never the problem"),
    (88.0, 5, "They only needed somewhere to be"),
    (92.4, "e13", "Not chains to hold them still"),
    (95.1, "e13", "A harness to pull together"),
    (98.0, "e13", "Your team"),
    (99.3, "e13", "your agent"),
    (100.6, "e13", "One Company Harness"),
]
TAGLINE = ("Your team. Your agent. One company harness.", 102.0, 102.8)  # under the logo on the end card

CAPTION_TEXT = {
    "Once upon a time there were minds that could answer anything": "Once upon a time, there were minds that could answer anything.",
    "But every morning they woke in an empty room": "But every morning, they woke in an empty room.",
    "No memory of yesterday": "No memory of yesterday.",
    "No key to any door": "No key to any door.",
    "So the people became their keepers": "So the people became their keepers.",
    "Every day they told them the same story again": "Every day, they told them the same story again.",
    "They passed keys through the window one by one": "They passed keys through the window, one by one,",
    "and sat up through the night in case something went wrong": "and sat up through the night, in case something went wrong.",
    "Then the minds multiplied": "Then the minds multiplied.",
    "One keeper a hundred rooms": "One keeper. A hundred rooms.",
    "The people grew afraid": "The people grew afraid.",
    "They bolted the doors and set a watcher at every window": "They bolted the doors, and set a watcher at every window,",
    "until they spent their days watching the minds instead of working with them": "until they spent their days watching the minds, instead of working with them.",
    "Until one day someone stopped asking how clever the minds were": "Until one day, someone stopped asking how clever the minds were,",
    "and asked where they would live": "and asked where they would live.",
    "A room that remembers what you told it": "A room that remembers what you told it.",
    "Doors that open with your own keys": "Doors that open with your own keys.",
    "Hands that can reach your machines": "Hands that can reach your machines.",
    "A clock that wakes them while you sleep": "A clock that wakes them while you sleep.",
    "And a keeper at the door who still asks you first": "And a keeper at the door, who still asks you first.",
    "The minds were never the problem": "The minds were never the problem.",
    "They only needed somewhere to be": "They only needed somewhere to be.",
    "Not chains to hold them still": "Not chains, to hold them still.",
    "A harness to pull together": "A harness, to pull together.",
    "Your team": None,            # the slogan is on the end card; no caption under it
    "your agent": None,
    "One Company Harness": None,
}

# Sound effects: (file, time, gain dB)
TICKS = []  # filled below: the routine clock, accelerating on the M1 half-second grid
_t = 14.0
for step, until in ((1.0, 24.0), (0.5, 30.0), (0.25, 31.0)):
    while _t < until - 1e-6:
        TICKS.append(round(_t, 3)); _t += step
SFX = [("sfx/bolt.mp3", 40.6 - 0.11, -3.0), ("sfx/bolt.mp3", 49.6 - 0.11, -6.0),
       ("sfx/doors.mp3", 68.9, 0.0)]
# three knocks, each on the frame where the fist meets the door in clip s20 (frames 60, 67, 73)
KNOCKS = [1942 / 24, 1949 / 24, 1955 / 24]  # output frames showing clip frames 60, 67, 73


def _montage(start, items, tint_map):
    out = []
    t = start
    for sid, d, extra in items:
        s = dict(id=sid, t=round(t, 3), tr="cut", tint=tint_map[sid])
        s.update(extra)
        out.append(s); t += d
    return out, t


TINTS = {"s04": "sepia", "s06": "amber_film", "s07": "amber_film", "s08": "night_film", "n5": "amber_film",
         "n4": "green", "n7": "night_film", "n8": "red", "n2": "sepia", "s12": "red", "n1": "night_film",
         "s11": "green", "n6": "teal", "s13": "teal", "s09": "dusk_film", "n3": "dusk_film", "s21": "green"}
V = lambda off, speed=1.0, **k: dict(off=off, speed=speed, **k)          # clip
S = lambda z, c=((0.5, 0.5), (0.5, 0.5)), **k: dict(z=z, c=c, **k)       # still

SHOTS = [
    # Act I: wonder
    dict(id="s01", t=0.0, tr="cut", tint="green", z=(1.0, 1.15), c=((0.5, 0.52), (0.5, 0.46))),
    dict(id="s02", t=6.0, tr="dissolve:0.8", tint="sepia", z=(1.05, 1.2), c=((0.45, 0.5), (0.55, 0.55))),
    dict(id="s03", t=9.5, tr="cut", tint="teal_film", off=0.4, speed=1.1),
    dict(id="s04", t=11.5, tr="cut", tint="sepia", z=(1.0, 1.45)),
    # Act I-b: routine, cutting on the clock
    dict(id="s05", t=14.0, tr="cut", tint="green", z=(1.12, 1.0), c=((0.5, 0.42), (0.5, 0.5))),
    dict(id="n5", t=16.5, tr="cut", tint="amber_film", off=0.0, speed=2.5),
    dict(id="s06", t=17.5, tr="cut", tint="amber_film", off=1.2, speed=1.0),
    dict(id="s07", t=20.0, tr="cut", tint="amber_film", off=0.2, speed=1.0),
    dict(id="n4", t=22.0, tr="cut", tint="green", z=(1.0, 1.1)),
    dict(id="s08", t=23.0, tr="cut", tint="night_film", off=0.3, speed=1.0),
]
_m, _ = _montage(26.0, [
    ("n5", 1.0, V(2.5, 3.0)), ("s07", 1.0, V(3.0)), ("s06", 0.5, V(3.5)), ("n5", 0.5, V(4.5, 3.0)),
    ("s07", 0.5, V(1.0)), ("s08", 0.5, V(3.5)), ("n4", 1.6, S((1.1, 1.35), ((0.6, 0.6), (0.62, 0.62)))),
], TINTS)
SHOTS += _m
SHOTS += [
    # Act II: multiplication and fear, cut on the M2 half-second grid (31.6 + k*0.5)
    dict(id="s09", t=31.6, tr="cut", tint="dusk_film", off=0.0, speed=1.7),
    dict(id="n3", t=34.1, tr="cut", tint="dusk_film", off=1.2, speed=2.0),
    dict(id="s10", t=35.6, tr="cut", tint="sepia", z=(1.0, 1.4), c=((0.5, 0.55), (0.42, 0.75))),
    dict(id="n6", t=37.6, tr="cut", tint="teal", z=(1.7, 1.0)),
    dict(id="s11", t=38.6, tr="cut", tint="green", z=(1.0, 1.15), c=((0.5, 0.45), (0.5, 0.4)), shake=5),
    dict(id="n1", t=40.6, tr="cut", tint="night_film", off=0.1, speed=1.0, shake=3),
    dict(id="s12", t=41.6, tr="cut", tint="red", z=(1.2, 1.0), c=((0.5, 0.35), (0.5, 0.5)), shake=3),
    dict(id="n2", t=43.1, tr="cut", tint="sepia", z=(1.0, 1.3), shake=2),
    dict(id="s13", t=44.1, tr="cut", tint="teal", z=(1.0, 1.35), shake=3, flick=0.04),
]
_m, _ = _montage(47.1, [
    ("n7", 1.0, V(1.0, 1.4, shake=6, flick=0.08)), ("n8", 0.5, S((1.0, 1.25), shake=6, flick=0.08)),
    ("n2", 0.5, S((1.2, 1.5), shake=6, flick=0.1)), ("s12", 0.5, S((1.0, 1.3), ((0.5, 0.4), (0.5, 0.4)), shake=7, flick=0.1)),
    ("n1", 0.5, V(0.15, 1.0, shake=8, flick=0.1)), ("s11", 0.5, S((1.1, 1.4), shake=8, flick=0.12)),
    ("n6", 0.5, S((1.3, 1.9), shake=8, flick=0.12)), ("s13", 0.25, S((1.4, 1.6), shake=10, flick=0.15)),
    ("n2", 0.25, S((1.6, 1.8), shake=10, flick=0.15)), ("n8", 0.25, S((1.3, 1.5), shake=10, flick=0.15)),
    ("s12", 0.25, S((1.4, 1.6), shake=10, flick=0.15)), ("n7", 0.25, V(3.5, 1.5, shake=12, flick=0.15)),
    ("s04", 0.25, S((1.5, 1.9), shake=12, flick=0.18)), ("n2", 1.0, S((1.5, 3.2), shake=14, flick=0.2)),
], TINTS)
SHOTS += _m
SHOTS += [
    dict(id="black", t=HARD_CUT, tr="cut"),
    # Act III: the turn and the answer
    dict(id="s14", t=55.2, tr="dip:1.0", tint="golden_film", off=0.0, speed=0.85),
    dict(id="s15", t=59.8, tr="cut", tint="golden_film", off=0.0, speed=0.9),
    dict(id="s16", t=65.2, tr="dissolve:0.6", tint="blue", z=(1.0, 1.3), c=((0.5, 0.5), (0.52, 0.48))),
    dict(id="s17", t=68.8, tr="cut", tint="warm_film", off=0.3, speed=1.1),
    dict(id="s18", t=72.0, tr="cut", tint="teal_film", off=1.8, speed=1.1),
    dict(id="s19", t=75.2, tr="cut", tint="night_film", off=2.2, speed=1.1),
    dict(id="s20", t=78.4, tr="cut", tint="amber_film", off=0.0, speed=1.0),
    # build: the earlier images return, now warm and lit
    dict(id="s09", t=82.0, tr="cut", tint="golden_film", off=3.5, speed=1.0, vz=(1.0, 1.12)),
    dict(id="n3", t=83.4, tr="cut", tint="golden_film", off=3.5, speed=1.0, vz=(1.0, 1.15)),
    dict(id="s21", t=84.6, tr="cut", tint="green", z=(1.05, 1.4)),
    dict(id="s22", t=87.2, tr="dissolve:0.5", tint="sepia", z=(1.0, 1.18), c=((0.5, 0.5), (0.55, 0.52))),
    # the answer to the chains: a harness, then the team pulling together
    dict(id="e1", t=92.0, tr="dissolve:0.6", tint="golden_film", off=0.3, speed=1.0, vz=(1.0, 1.06)),
    dict(id="e2", t=97.6, tr="dissolve:1.0", tint="endblue", z=(1.0, 1.08), c=((0.5, 0.5), (0.5, 0.47)),
         logo=(99.4, 100.6), out_fade=(103.4, 104.2)),
    dict(id="logo_only", t=104.2, tr="cut", logo_fade_out=(105.2, 106.0)),
]

CAPTIONS = []

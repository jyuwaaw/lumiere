import sys, json, concurrent.futures as cf
sys.path.insert(0, "tools")
from cs_mcp import call, download, first_url
NO = ["vocals", "singing", "choir", "humming", "spoken word", "acoustic guitar", "guitar", "folk", "ukulele", "drum kit", "EDM", "pop"]
M1 = {"chunks": [  # 0-34: wonder -> routine
  {"text": "[Wonder]\n{instrumental, delicate, slow}", "duration_ms": 16000,
   "positive_styles": ["cinematic film score", "celesta and music box", "felt piano", "soft high strings", "wonder", "fairy tale",
                       "tender", "magical", "quiet"], "negative_styles": NO},
  {"text": "[Routine]\n{instrumental, a repeating pizzicato ostinato like a clock, 100 bpm, slowly growing}", "duration_ms": 18000,
   "positive_styles": ["pizzicato strings ostinato", "ticking clock rhythm", "repetitive", "felt piano", "minor key", "weary",
                       "steady pulse", "gradual build"], "negative_styles": NO, "context_adherence": "medium"}]}
M2 = {"chunks": [  # 34-54: multiply -> fear -> peak
  {"text": "[Multiply]\n{instrumental, the ostinato speeds up and multiplies, 120 bpm}", "duration_ms": 9000,
   "positive_styles": ["layered string ostinatos", "accelerating", "low cello", "pulsing low synth", "urgent", "minor key", "cinematic"],
   "negative_styles": NO},
  {"text": "[Fear]\n{instrumental, relentless crescendo, low brass, deep percussion hits, rising tension to a peak}", "duration_ms": 11000,
   "positive_styles": ["relentless crescendo", "low brass", "taiko-like deep percussion", "shepard tone rising", "dark", "tense",
                       "cinematic thriller score", "ends at the loudest peak"], "negative_styles": NO, "context_adherence": "high"}]}
M3 = {"chunks": [  # 55-106: turn -> rise -> climax -> resolve
  {"text": "[Turn]\n{instrumental, solo piano, a few single notes with space, fragile, hopeful}", "duration_ms": 9000,
   "positive_styles": ["solo felt piano", "sparse", "fragile", "hopeful", "intimate", "lots of space", "major key"], "negative_styles": NO},
  {"text": "[Rise]\n{instrumental, piano arpeggios, warm strings enter, a gentle pulse returns, building, 96 bpm}", "duration_ms": 22000,
   "positive_styles": ["piano arpeggios", "warm string ensemble", "soft pulsing synth", "building", "hopeful", "major key",
                       "cinematic modern score", "emotional"], "negative_styles": NO, "context_adherence": "medium"},
  {"text": "[Climax]\n{instrumental, full orchestral swell, soaring strings, big and emotional}", "duration_ms": 10000,
   "positive_styles": ["full orchestra", "soaring strings", "french horns", "timpani swell", "euphoric", "emotional climax",
                       "major key", "cinematic"], "negative_styles": NO, "context_adherence": "high"},
  {"text": "[Resolve]\n{instrumental, one long sustained chord, strings and piano, rings out to silence}", "duration_ms": 10000,
   "positive_styles": ["one long sustained major chord", "strings", "single piano note", "peaceful", "resolution", "ring out"],
   "negative_styles": NO, "context_adherence": "high"}]}
def go(a):
    name, plan, seed = a
    out, _ = call("media__generate", {"model": "elevenlabs/music/v2.5", "wait_seconds": 280,
        "input": {"composition_plan": plan, "seed": seed, "output_format": "mp3_48000_320"}})
    while out.get("status") not in ("succeeded", "failed"):
        out, _ = call("media__get_result", {"job_id": out["job_id"], "wait_seconds": 240})
    if out.get("status") == "succeeded":
        download(first_url(out), f"music2/{name}_{seed}.mp3")
    return name, seed, out.get("status"), out["assets"][0]["path"] if out.get("assets") else json.dumps(out)[:200]
jobs = [(n, p, s) for n, p in (("M1", M1), ("M2", M2), ("M3", M3)) for s in (3, 17)]
with cf.ThreadPoolExecutor(6) as ex:
    res = list(ex.map(go, jobs))
json.dump(res, open("music2/jobs.json", "w"), indent=1)
for r in res: print(r)

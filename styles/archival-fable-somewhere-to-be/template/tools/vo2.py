import sys, json, concurrent.futures as cf
sys.path.insert(0, "tools")
from cs_mcp import call, download, first_url
TEXT = """[softly, with wonder] Once upon a time, there were minds that could answer anything.

[softly] But every morning, they woke in an empty room.

[quietly] No memory of yesterday... No key to any door.

[wearily] So the people became their keepers.

[wearily] Every day, they told them the same story again.

They passed keys through the window, one by one... and sat up through the night, in case something went wrong.

[tense] Then the minds multiplied.

[tense] One keeper. A hundred rooms.

[anxious, faster] The people grew afraid. They bolted the doors, and set a watcher at every window... until they spent their days watching the minds, instead of working with them.

[whispers] Until one day, someone stopped asking how clever the minds were...

[whispers] and asked where they would live.

[warm, hopeful] A room that remembers what you told it.

[warm, hopeful] Doors that open with your own keys.

[warm, hopeful] Hands that can reach your machines.

[warm, hopeful] A clock that wakes them while you sleep.

[warm, hopeful] And a keeper at the door, who still asks you first.

[gently] The minds were never the problem.

[gently] They only needed somewhere to be.

[warmly] Imagine a cloud made for agents.

/ˈkɔɹspid/, everything your agents need."""
def gen(seed):
    out, _ = call("media__generate", {"model": "elevenlabs/tts/eleven-v4", "wait_seconds": 240,
        "input": {"text": TEXT, "voice": "Laura", "stability": 0.4, "similarity_boost": 0.75, "seed": seed,
                  "output_format": "mp3_44100_192", "language_code": "en"}})
    download(first_url(out), f"vo2/vo_{seed}.mp3")
    return seed, out["assets"][0]["path"]
with cf.ThreadPoolExecutor(3) as ex:
    res = dict(ex.map(gen, [5, 9, 13]))
json.dump(res, open("vo2/paths.json", "w"), indent=1)
def tr(seed):
    out, _ = call("media__transcribe", {"media": res[seed], "timestamps": True, "diarize": False, "language": "en", "tag_audio_events": True})
    json.dump(out, open(f"vo2/tr_{seed}.json", "w")); return seed, out.get("text") or " ".join(s["text"] for s in out["segments"])
with cf.ThreadPoolExecutor(3) as ex:
    for s, t in ex.map(tr, res): print(s, t[:200], "...", t[-120:], "\n")

import sys, json, os, time, concurrent.futures as cf
sys.path.insert(0, "tools"); sys.path.insert(0, ".")
from cs_mcp import call, download, first_url
from shots import SHOTS, INSERTS
SHOTS = SHOTS + INSERTS
want = set(sys.argv[1:])
led = json.load(open("stills/ledger.json"))
vled = json.load(open("clips/ledger.json")) if os.path.exists("clips/ledger.json") else {}
def gen(s):
    sid, kind, tint, prompt, motion = s
    try:
        out, _ = call("media__get_result", {"job_id": led[sid]["job"]})
        img = first_url(out)
        out, err = call("media__generate", {"model": "minimax/h3-max/image-to-video", "wait_seconds": 280, "input": {
            "prompt": motion + " Keep the look of a 1970s 16mm documentary film: soft, grainy, natural light, realistic, subtle motion. No text.",
            "image_url": img, "duration": 6, "resolution": "768P", "prompt_expansion_mode": "balanced"}})
        job = out.get("job_id")
        while out.get("status") not in ("succeeded", "failed", "cancelled", "expired"):
            out, _ = call("media__get_result", {"job_id": job, "wait_seconds": 240})
        if out.get("status") != "succeeded":
            return sid, job, json.dumps(out)[:300]
        download(first_url(out), f"clips/{sid}.mp4")
        return sid, job, "ok"
    except Exception as e:
        return sid, None, str(e)[:300]
todo = [s for s in SHOTS if s[1] == "video" and (not want or s[0] in want)]
with cf.ThreadPoolExecutor(8) as ex:
    for sid, job, info in ex.map(gen, todo):
        print(sid, job, info, flush=True)
        if info == "ok": vled[sid] = job
        json.dump(vled, open("clips/ledger.json", "w"), indent=1)

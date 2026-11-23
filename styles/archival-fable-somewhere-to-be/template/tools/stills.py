import sys, json, os, concurrent.futures as cf
sys.path.insert(0, "tools"); sys.path.insert(0, ".")
from cs_mcp import call, download, first_url
from shots import SHOTS, INSERTS
SHOTS = SHOTS + INSERTS
want = set(sys.argv[1:])
ledger = json.load(open("stills/ledger.json")) if os.path.exists("stills/ledger.json") else {}
def gen(s):
    sid, kind, tint, prompt, motion = s
    try:
        out, err = call("media__generate", {"model": "fal-ai/nano-banana-pro", "wait_seconds": 200,
            "input": {"prompt": prompt, "aspect_ratio": "4:3", "resolution": "2K", "output_format": "png"}})
        u = first_url(out)
        if not u: return sid, None, json.dumps(out)[:300]
        download(u, f"stills/{sid}.png")
        return sid, out.get("job_id"), out["assets"][0]["path"]
    except Exception as e:
        return sid, None, str(e)[:300]
todo = [s for s in SHOTS if (not want or s[0] in want)]
with cf.ThreadPoolExecutor(8) as ex:
    for sid, job, info in ex.map(gen, todo):
        print(sid, job, info)
        if job: ledger[sid] = {"job": job, "path": info}
json.dump(ledger, open("stills/ledger.json", "w"), indent=1)

"""Minimal JSON-RPC client for the CoreSpeed MCP endpoint (direct, long timeout)."""
import json, os, sys, urllib.request

URL = "https://api.corespeed.io/mcp"
KEY = os.environ["CORESPEED_API_KEY"]


def call(tool, args, timeout=330):
    body = json.dumps({"jsonrpc": "2.0", "id": 1, "method": "tools/call",
                       "params": {"name": tool, "arguments": args}}).encode()
    req = urllib.request.Request(URL, data=body, method="POST", headers={
        "Authorization": f"Bearer {KEY}",
        "Content-Type": "application/json",
        "Accept": "application/json, text/event-stream",
        "User-Agent": "curl/8.5.0",
    })
    with urllib.request.urlopen(req, timeout=timeout) as r:
        raw = r.read().decode()
    msg = None
    if raw.lstrip().startswith("{"):
        msg = json.loads(raw)
    else:
        data = []
        for block in raw.split("\n\n"):
            lines = [l[5:].lstrip() for l in block.splitlines() if l.startswith("data:")]
            if lines:
                data.append("\n".join(lines))
        for d in data:
            m = json.loads(d)
            if "result" in m or "error" in m:
                msg = m
    if msg is None:
        raise RuntimeError(raw[:500])
    if "error" in msg:
        raise RuntimeError(json.dumps(msg["error"]))
    res = msg["result"]
    if res.get("structuredContent"):
        return res["structuredContent"], res.get("isError", False)
    text = "".join(c.get("text", "") for c in res.get("content", []))
    try:
        return json.loads(text), res.get("isError", False)
    except Exception:
        return {"text": text}, res.get("isError", False)


def download(url, path):
    req = urllib.request.Request(url, headers={"User-Agent": "curl/8.5.0"})
    with urllib.request.urlopen(req, timeout=600) as r, open(path, "wb") as f:
        f.write(r.read())


def first_url(out):
    """Find the first output file URL in a media__generate/get_result payload."""
    def walk(o):
        if isinstance(o, dict):
            for k, v in o.items():
                if k in ("uri", "url", "signed_url") and isinstance(v, str) and v.startswith("http"):
                    yield v
                else:
                    yield from walk(v)
        elif isinstance(o, list):
            for v in o:
                yield from walk(v)
    for u in walk(out):
        return u
    return None


if __name__ == "__main__":
    out, err = call(sys.argv[1], json.loads(sys.argv[2]))
    print(json.dumps(out, indent=1)[:4000])

import sys, json, numpy as np
sys.path.insert(0, "tools")
from beats import load, onset_env
out = {}
for p in sys.argv[1:]:
    x, sr = load(p); o, fr = onset_env(x, sr)
    thr = np.percentile(o, 93)
    pk = [i for i in range(2, len(o)-2) if o[i] == o[i-2:i+3].max() and o[i] > thr]
    out[p] = [round(i / fr, 3) for i in pk]
    print(p, len(out[p]), out[p][-40:])
json.dump(out, open("music2/onsets.json", "w"))

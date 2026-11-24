import re, sys, subprocess
for f in sys.argv[1:]:
    subprocess.run(["ffmpeg","-i",f,"-af","ebur128=metadata=1,ametadata=print:key=lavfi.r128.M:file=/tmp/m.txt","-f","null","-"],capture_output=True)
    vals=[]; t=None
    for l in open("/tmp/m.txt"):
        m=re.search(r"pts_time:([\d.]+)",l)
        if m: t=float(m.group(1))
        m=re.search(r"M=(-?[\d.]+)",l)
        if m and t is not None: vals.append((t,float(m.group(1))))
    row=[]
    for s in range(0,int(vals[-1][0])+1,3):
        w=[v for tt,v in vals if s<=tt<s+3]
        row.append(f"{max(w):.0f}" if w else "")
    print(f, " ".join(row))

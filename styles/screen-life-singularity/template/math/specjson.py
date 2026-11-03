import numpy as np, json
from cdlib import *
rng=np.random.default_rng(2029); out={}
for n in (8,16,32,64,128):
    x=rng.normal(size=n); x/=np.linalg.norm(x)
    ev=np.sort(np.linalg.eigvalsh(Amat(x)))
    cl=[]
    for z in ev:
        if not cl or abs(z-cl[-1][0])>1e-6: cl.append([float(z),1])
        else: cl[-1][1]+=1
    out[n]=cl; print(n,len(cl),[c[1] for c in cl])
json.dump(out,open("film/spectrum.json","w"))

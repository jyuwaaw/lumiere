import numpy as np
def mul(a,b):
    n=len(a)
    if n==1: return a*b
    h=n//2; p,q=a[:h],a[h:]; r,s=b[:h],b[h:]
    conj=lambda v: np.concatenate([v[:1],-v[1:]])
    return np.concatenate([mul(p,r)-mul(conj(s),q), mul(s,p)+mul(q,conj(r))])
def e(i,n): v=np.zeros(n); v[i]=1; return v
def A(x,y): return mul(mul(x,x),y)-mul(x,mul(x,y))
def E(x,y,z): return A(x, mul(A(x,y),A(x,z)))
rng=np.random.default_rng(0)
for n in (8,16,32):
    m=max(np.linalg.norm(E(*[rng.normal(size=n) for _ in range(3)])) for _ in range(200))
    print(n,"max|E| random:",m)
x=e(1,32)+e(18,32); y=e(4,32); z=e(8,32)
r=E(x,y,z); print("witness:",{i:r[i] for i in np.nonzero(np.abs(r)>1e-9)[0]})

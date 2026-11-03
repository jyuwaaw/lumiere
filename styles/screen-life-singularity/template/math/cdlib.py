import numpy as np
def mul(a,b):
    n=a.shape[-1]
    if n==1: return a*b
    h=n//2; p,q=a[...,:h],a[...,h:]; r,s=b[...,:h],b[...,h:]
    conj=lambda v: np.concatenate([v[...,:1],-v[...,1:]],-1)
    return np.concatenate([mul(p,r)-mul(conj(s),q), mul(s,p)+mul(q,conj(r))],-1)
def Amat(x):
    n=len(x); I=np.eye(n); xx=mul(x,x)
    return np.stack([mul(xx,I[i])-mul(x,mul(x,I[i])) for i in range(n)],1)

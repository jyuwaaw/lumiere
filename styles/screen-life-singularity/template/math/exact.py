import flint, random
def mul(a,b):
    n=len(a)
    if n==1: return [a[0]*b[0]]
    h=n//2; p,q,r,s=a[:h],a[h:],b[:h],b[h:]
    conj=lambda v:[v[0]]+[-t for t in v[1:]]
    add=lambda u,v:[i+j for i,j in zip(u,v)]; sub=lambda u,v:[i-j for i,j in zip(u,v)]
    return sub(mul(p,r),mul(conj(s),q))+add(mul(s,p),mul(q,conj(r)))
def Amat(x):
    n=len(x); xx=mul(x,x); cols=[]
    for i in range(n):
        e=[0]*n; e[i]=1
        cols.append([u-v for u,v in zip(mul(xx,e),mul(x,mul(x,e)))])
    return flint.fmpz_mat([[cols[j][i] for j in range(n)] for i in range(n)])
random.seed(2029)
for n in (8,16,32,64,128):
    x=[random.randint(-3,3) for _ in range(n)]
    cp=Amat(x).charpoly()
    fac=cp.factor()
    print(n,"charpoly factors (degree^mult):",[(f.degree(),m) for f,m in fac[1]])

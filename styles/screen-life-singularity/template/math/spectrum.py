import flint, random
exec(open("exact.py").read().split("random.seed")[0])
random.seed(64)
for n in (16,32,64):
    x=[random.choice([-1,0,1]) for _ in range(n)]
    cp=Amat(x).charpoly(); _,fs=cp.factor()
    print(n, "factors:", ["deg%d^%d"%(f.degree(),m) for f,m in fs])
    if n==32:
        print("x =", x)
        for f,m in fs:
            if f.degree()>1: print("q7 =", f)

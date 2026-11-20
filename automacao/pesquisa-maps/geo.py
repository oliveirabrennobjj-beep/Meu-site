import json,re,math,collections
C={'Casimiro de Abreu':(-22.481,-42.204,6),'Barra de São João':(-22.598,-42.001,4),'Rio Dourado':(-22.535,-42.13,4),'Professor Souza':(-22.43,-42.28,4),
'Silva Jardim':(-22.651,-42.392,5),'Rio das Ostras':(-22.527,-41.945,8),'Unamar':(-22.64,-42.05,6),'Macaé':(-22.376,-41.787,9),'Cabo Frio':(-22.879,-42.019,8),
'Búzios':(-22.75,-41.889,6),'São Pedro da Aldeia':(-22.839,-42.103,6),'Conceição de Macabu':(-22.085,-41.868,5)}
def km(a,b,c,d): return math.hypot((a-c)*111,(b-d)*111*math.cos(math.radians(a)))
def zona(href):
    m=re.search(r'!3d(-?[\d.]+)!4d(-?[\d.]+)',href)
    if not m: return None
    la,lo=float(m[1]),float(m[2])
    best=min(((km(la,lo,c[0],c[1])/c[2],n) for n,c in C.items()))
    return best[1] if best[0]<=1 else None
if __name__=='__main__':
    L=json.load(open('lista.json'))
    print(len(L),collections.Counter(zona(v['href']) for v in L.values()))

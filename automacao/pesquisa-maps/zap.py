# python3 zap.py nums.txt saida.json  -> {numero: nome da conta WhatsApp Business | ""}
import sys,json,re,html,os,urllib.request,concurrent.futures as cf
nums=[n.strip() for n in open(sys.argv[1]) if n.strip()]; out=sys.argv[2]
res=json.load(open(out)) if os.path.exists(out) else {}
def um(n):
    for _ in range(3):
        try:
            r=urllib.request.urlopen(urllib.request.Request(f'https://www.whatsapp.com/catalog/{n}/',headers={'User-Agent':'Mozilla/5.0'}),timeout=20)
            t=r.read().decode('utf8','ignore')
            m=re.search(r'og:title" content="View (.*?)(?:&#039;|\')s Catalog on WhatsApp',t)
            return n, html.unescape(m[1]) if m else '?'
        except urllib.error.HTTPError as e:
            if e.code==404: return n,''
        except Exception: pass
    return n,None
with cf.ThreadPoolExecutor(8) as ex:
    for n,nome in ex.map(um,[n for n in nums if n not in res]):
        if nome is not None: res[n]=nome
json.dump(res,open(out,'w'),ensure_ascii=False)
print(len(res), sum(1 for v in res.values() if v), sum(1 for v in res.values() if v=='?'))

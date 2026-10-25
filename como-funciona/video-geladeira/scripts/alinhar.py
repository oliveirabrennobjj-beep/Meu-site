# Alinha o texto do roteiro com a narração quando a transcrição da ElevenLabs não está disponível.
# Uso (dentro de video-geladeira/):
#   ffmpeg -i public/narracao.mp3 -af silencedetect=noise=-35dB:d=0.18 -f null - 2>&1 \
#     | grep -oE "silence_(start|end): [0-9.]+" | paste - - | awk '{print $2, $4}' > sil.txt
#   python3 scripts/alinhar.py 1.0
# Cada trecho falado entre pausas recebe as frases do roteiro que melhor cabem no tempo dele,
# e dentro do trecho o tempo é dividido pelo tamanho das palavras. Gera src/words.json.
import re, json, sys
PEN=float(sys.argv[1])
sil=[tuple(map(float,l.split())) for l in open('sil.txt')]
import subprocess
total=float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0','public/narracao.mp3']))
segs=[];prev=0.05
for s,e in sil:
    if s-prev>0.05: segs.append((prev,s))
    prev=e
if total-prev>0.1: segs.append((prev,total))
txt=open('../roteiros/03-geladeira.md').read()
nar=' '.join(l[2:].strip() for l in txt.split('\n') if l.startswith('> '))
words=nar.split()
# finer units: split at punctuation AND before "Isso"/"Então"/"Mas" etc. is not needed; punctuation only
phr=[];cur=[]
for w in words:
    cur.append(w)
    if re.search(r'[.,:!?]["”]?$',w): phr.append(cur);cur=[]
if cur: phr.append(cur)
W=lambda ws: sum((31 if re.search(r'\d',w) else len(re.sub(r'[^\wÀ-ú]','',w)))+1 for w in ws)
nP,nS=len(phr),len(segs)
sd=[e-s for s,e in segs]
rate=sum(sd)/sum(W(p) for p in phr)
INF=1e18
dp=[[INF]*(nS+1) for _ in range(nP+1)];bk={}
dp[0][0]=0
for i in range(nP):
  for j in range(nS):
    if dp[i][j]>=INF: continue
    for i2 in range(i+1,min(nP,i+8)+1):
      ch=sum(W(p) for p in phr[i:i2])
      for j2 in range(j+1,min(nS,j+4)+1):
        d=sum(sd[j:j2])
        c=((d-rate*ch)/max(d,0.5))**2*4+PEN*(j2-j-1)
        if dp[i][j]+c<dp[i2][j2]:
          dp[i2][j2]=dp[i][j]+c;bk[(i2,j2)]=(i,j)
groups=[];k=(nP,nS)
while k!=(0,0):
  p=bk[k];groups.append((p[0],k[0],p[1],k[1]));k=p
groups.reverse()
out=[]
for i,i2,j,j2 in groups:
  ws=[w for p in phr[i:i2] for w in p]
  spans=segs[j:j2];tot=sum(e-s for s,e in spans)
  wts=[W([w]) for w in ws];T=sum(wts)
  def at(f):
    x=f*tot
    for s,e in spans:
      if x<=e-s+1e-9: return s+x
      x-=e-s
    return spans[-1][1]
  c=0
  for w,wt in zip(ws,wts):
    s=at(c/T);c+=wt;e=at(c/T)
    out.append({"t":w,"s":round(s,3),"e":round(e-0.02,3)})
  print(f"{segs[j][0]:6.2f}-{segs[j2-1][1]:6.2f} [{j2-j}] {(tot-rate*sum(wts)):+.2f}", ' '.join(ws)[:60])
json.dump(out,open('src/words.json','w'),ensure_ascii=False)

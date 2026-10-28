import json,re,sys
text=open(sys.argv[1]).read()
words=re.findall(r'\S+',text); t=0.1; out=[]
for w in words:
    d=0.12+0.045*len(w)
    out.append({"t":w,"s":round(t,3),"e":round(t+d,3)}); t+=d+0.04
    if re.search(r'[.?!]$',w): t+=0.35
json.dump(out,open(sys.argv[2],'w'),ensure_ascii=False)
print(len(out), round(t,1))

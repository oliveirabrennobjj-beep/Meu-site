import json,sys,urllib.request
raw=json.load(open(sys.argv[1]))
ws=raw["words"] if isinstance(raw,dict) else raw
out=[];inb=False
for w in ws:
    if w.get("type")!="word": continue
    t=w["text"]
    if t.startswith("["): inb=True
    if not inb:
        out.append({"t":t.replace('"',''),"s":w["start"],"e":w["end"]})
    if t.endswith("]"): inb=False
json.dump(out,open(sys.argv[2],"w"),ensure_ascii=False)
print(len(out), out[0], out[-1])

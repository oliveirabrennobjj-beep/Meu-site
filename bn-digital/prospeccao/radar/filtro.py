import json,sys,glob,re
known=set()
for f in glob.glob('/home/user/Meu-site/bn-digital/prospeccao/leads*.json'):
  for l in json.load(open(f)):
    known.add(re.sub(r'\W','',(l.get('nome') or '').lower()))
seen={};
def social(w): return (not w) or re.search(r'instagram|facebook|linktr|wa\.me|whatsapp|ifood|goomer|anota',w or '')
for f in sorted(glob.glob('b*.json')):
  for r in json.load(open(f))['data']['alexandria']:
    for p in (r.get('data') or {}).get('results',[]):
      if p['feature_id'] in seen: continue
      rc=p.get('review_count') or 0
      if social(p.get('website')) and rc<20 and p.get('phone'):
        k=re.sub(r'\W','',p['name'].lower())
        p['ja_na_lista']=k in known
        seen[p['feature_id']]=p
print(len(seen), sum(1 for p in seen.values() if p['ja_na_lista']))
for p in seen.values(): print(p['review_count'],p['rating'],p['name'],'|',p['categories'][:1],'|',p['address_lines'][-2] if p.get('address_lines') else '', '|',p.get('website'))

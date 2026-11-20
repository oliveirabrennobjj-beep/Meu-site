import json,glob,sys,collections,datetime,casa
nome_lote=sys.argv[1]
Z=json.load(open('zap.json')); N=json.load(open('scr/novos.json'))
em=datetime.datetime.now(datetime.UTC).strftime('%Y-%m-%dT%H:%M:%SZ')
def zap(nome,num):
    if num not in Z or Z[num]=='?': return None
    return {'nome':Z[num],'confere':bool(Z[num]) and casa.casa(nome,Z[num]),'em':em}
leads=[]; c=collections.Counter()
for v in N.values():
    z=zap(v['nome'],v['whatsapp'])
    if z: v['zap']=z
    c['novo:'+('sem' if not z or not z['nome'] else 'ok' if z['confere'] else 'outro')]+=1
    leads.append(v)
conf={}
for f in glob.glob('db2/leads/*.json'):
    d=json.load(open(f)); z=zap(d['nome'],d['whatsapp'])
    if z: conf[d['whatsapp']]=z; c['antigo:'+('sem' if not z['nome'] else 'ok' if z['confere'] else 'outro')]+=1
for v in leads:
    if v.get('zap'): conf.setdefault(v['whatsapp'],v['zap'])
json.dump({'lote':nome_lote,'leads':leads,'conferencia':conf},open('pub/pesquisa/lote.json','w'),ensure_ascii=False)
print(len(leads),len(conf),dict(c))

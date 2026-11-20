import json,glob,re,unicodedata,collections,geo,datetime,sys
def norm(s): return re.sub(r'[^a-z0-9]','',unicodedata.normalize('NFKD',(s or '').lower()).encode('ascii','ignore').decode())
db=[json.load(open(f)) for f in glob.glob('../db/leads/*.json')]
zaps={d['whatsapp'] for d in db}|{re.sub(r'\D','',d.get('outroWhatsapp') or '') for d in db}
nomes={norm(d['nome']) for d in db}
L=json.load(open('lista.json')); D=json.load(open('detalhe.json'))
SOCIAL=re.compile(r'instagram\.com|facebook\.com|fb\.com|linktr\.ee|wa\.me|whatsapp\.com|api\.whatsapp|ifood|goomer|anota\.ai|linkbio|bio\.link|beacons\.ai|linkme|taplink|cardapio|menudino|aiqfome|deliverymuch|delivery|business\.site|negocio\.site|sites\.google|wixsite|instabio|tiktok\.com|youtube',re.I)
FORA=re.compile(r'banco|caixa econ|lot[eé]rica|correio|prefeitura|secretaria|escola (municipal|estadual)|col[eé]gio estadual|igreja|templo|par[oó]quia|hospital|posto de sa[uú]de|unidade de sa[uú]de|upa\b|cart[oó]rio|delegacia|pol[ií]cia|bombeiro|f[oó]rum|tribunal|c[aâ]mara|inss|detran|ponto de [oô]nibus|estacionamento|cemit[eé]rio|pra[cç]a|parque|associa[cç][aã]o|sindicato|condom[ií]nio|atm|caixa eletr|ag[eê]ncia banc|terminal|rodovi[aá]ria|posto de gasolina|posto de combust|reparti[cç][aã]o|casa lar|assistente social|casa de campo|abrigo|conselho tutelar|t[aá]xi|atra[cç][aã]o tur|escrit[oó]rio da empresa|aluguel de temporada|apartamento|marketing|designer gr[aá]fico|web ?design|criação de sites|ag[eê]ncia de publicidade|mototaxi|transporte p[uú]blico|ponto tur|praia|cachoeira|mirante|trilha',re.I)
CIDADES=['Casimiro de Abreu','Rio das Ostras','Silva Jardim','Macaé','Cabo Frio','Armação dos Búzios','São Pedro da Aldeia','Conceição de Macabu','Araruama']
agora=datetime.datetime.now(datetime.UTC).strftime('%Y-%m-%dT%H:%M:%S.000Z')
zonas=set(sys.argv[1].split(',')) if len(sys.argv)>1 else None
out={};motivo=collections.Counter()
for k,d in D.items():
    if 'erro' in d: motivo['erro']+=1; continue
    z=geo.zona(L[k]['href']) if k in L else None
    if zonas and z not in zonas: continue
    if d.get('fechado'): motivo['fechado']+=1; continue
    tel=re.sub(r'\D','',d.get('telefone') or '')
    if tel.startswith('55'): tel=tel[2:]
    if len(tel)!=11 or tel[2]!='9': motivo['sem celular' if tel else 'sem telefone']+=1; continue
    wa='55'+tel
    if wa in zaps: motivo['ja no painel (zap)']+=1; continue
    if norm(d['nome']) in nomes: motivo['ja no painel (nome)']+=1; continue
    cat=d.get('categoria') or ''
    if FORA.search(cat) or FORA.search(d['nome']) and not cat: motivo['nao e comercio']+=1; continue
    site=(d.get('site') or '').strip()
    if site and not SOCIAL.search(site): motivo['ja tem site']+=1; continue
    end=d.get('endereco','').strip()
    cid=next((c for c in CIDADES if c in end), None) or (z if z else '')
    if z=='Unamar' or re.search(r'Unamar|Tamoios',end): cid='Unamar'
    for dist,pat in [('Barra de São João',r'Barra de S[aã]o Jo[aã]o|28880'),('Rio Dourado',r'Rio Dourado'),('Professor Souza',r'Professor Souza')]:
        if re.search(pat,end) or (z==dist and cid in ('Casimiro de Abreu','')): cid=dist
    if cid=='Cabo Frio' and z in ('Barra de São João','Unamar','Casimiro de Abreu'): cid='Unamar'
    if cid=='Armação dos Búzios': cid='Búzios'
    if not cid: motivo['sem cidade']+=1; continue
    zaps.add(wa); nomes.add(norm(d['nome']))
    out['w'+wa]={'nome':d['nome'].strip(),'tipo':cat,'cidade':cid,'whatsapp':wa,'telefone':f'({tel[:2]}) {tel[2:7]}-{tel[7:]}',
      'nota':d.get('nota'),'avaliacoes':None,'link':site,'status':'novo','criado':agora,'fonte':'Google Maps',
      'endereco':end,'maps':L[k]['href'] if k in L else ''}
print(len(out),dict(motivo))
print(collections.Counter(v['cidade'] for v in out.values()))
print(collections.Counter(v['tipo'] for v in out.values()).most_common(70))
json.dump(out,open('novos.json','w'),ensure_ascii=False)

import json,geo,glob,unicodedata,re,sys,collections
def norm(s): return re.sub(r'[^a-z0-9]','',unicodedata.normalize('NFKD',(s or '').lower()).encode('ascii','ignore').decode())
nomes={norm(json.load(open(f))['nome']) for f in glob.glob('../db/leads/*.json')}
L=json.load(open('lista.json')); det=json.load(open('detalhe.json'))
REDE=re.compile(r"boticário|boticario|cacau show|mcdonald|subway|burger king|bob'?s\b|habib|kopenhagen|hering|renner|riachuelo|centauro|casas bahia|magazine luiza|magalu|americanas|assa[ií]|atacad|drogaria (pacheco|raia|venancio|são paulo)|drogasil|pague menos|vivo\b|claro\b|\btim\b|oi\b|carrefour|extra\b|guanabara|prezunic|mundial|supermarket|spoleto|china in box|giraffas|outback|kfc|domino|pizza hut|jeronimo|chiquinho|natura\b|eudora|quem disse,? berenice|localiza|movida|unidas|smart fit|bluefit|selfit|ipiranga|petrobras|shell\b|br mania|banco|bradesco|itaú|itau|santander|sicoob|caixa\b|correios|lotérica|loterica|igreja|assembleia de deus|prefeitura|escola municipal|e\.?m\.? |ciep|hospital|upa\b|posto de saúde",re.I)
FORA=re.compile(r'Banco|Igreja|Escola pública|Hospital|Prefeitura|Órgão|Repartição|Ponto de ônibus|Estacionamento|Cemitério|Praça|Parque|Associação|Sindicato|Condomínio|Caixa eletrônico|Posto de gasolina|Cartório|Delegacia|Hotel\b.*\d estrelas',re.I)
zonas=sys.argv[1].split(','); out=sys.argv[2]
sel={k:v for k,v in L.items() if geo.zona(v['href']) in zonas and k not in det and norm(v['nome']) not in nomes and not REDE.search(v['nome'] or '') and not FORA.search(v['texto'] or '')}
json.dump(sel,open(out,'w')); print(len(sel), collections.Counter(geo.zona(v['href']) for v in sel.values()))

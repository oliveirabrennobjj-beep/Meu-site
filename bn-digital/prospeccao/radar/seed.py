import json,glob,re
exec(open('filtro.py').read().split('print(len(seen)')[0])
GANCHO=[(r'hamb|burg|dog|pizz|açaí|acai|sorvet|delivery',"cardápio com fotos e pedido direto no WhatsApp","comida"),
 (r'barb|salão|salao|cabele|beleza|estétic|estetic|esteticista|hair|studio',"serviços, preços e horário marcado pelo WhatsApp","beleza"),
 (r'pet|veterin|ração|racao|agro|aquar',"serviços de banho e tosa, produtos e agendamento pelo WhatsApp","pet"),
 (r'mecân|mecan|auto|oficina|motorsport',"serviços e pedido de orçamento pelo WhatsApp","oficina"),
 (r'roupa|vestim|boutique|moda|store',"vitrine das peças e pedido pelo WhatsApp","loja"),
 (r'pousada|hotel|apartament',"fotos dos quartos e reserva direto no WhatsApp, sem pagar comissão pra Booking","pousada"),
 (r'padaria|pão|restaurante|pão',"cardápio e encomendas pelo WhatsApp","comida")]
def gancho(p):
  t=(p['name']+' '+' '.join(p['categories'])).lower()
  for rx,g,c in GANCHO:
    if re.search(rx,t): return g,c
  return "seus serviços e um botão que cai direto no WhatsApp","outros"
out=[]
for p in seen.values():
  if 'São Paulo' in p['name']: continue
  dig=re.sub(r'\D','',p['phone'])
  if dig.startswith('0'): dig=dig[1:]
  movel=len(dig)==11 and dig[2]=='9'
  cidade=next((c for c in ['Barra de São João','Barra de Sao Joao','Rio das Ostras','Casimiro de Abreu'] if c in (p['address'] or '')),'Casimiro de Abreu').replace('Sao Joao','São João')
  g,cat=gancho(p)
  rc=p.get('review_count') or 0
  if rc==0: av="ainda não têm nenhuma avaliação por lá"
  elif rc==1: av="têm só 1 avaliação por lá"
  else: av=f"têm {rc} avaliações por lá"
  msg=(f"Oi, tudo bem? Sou o Brenno, da BN Digital, aqui de Casimiro. Achei vocês no Google ({p['name'].split(' | ')[0].split('. Abra')[0]}) e vi que {av}. "
       f"Quem procura no Google costuma escolher quem tem mais avaliação e um site pra ver antes. "
       f"Eu faço as duas coisas: um site com {g}, e uma plaquinha NFC pro balcão, que o cliente encosta o celular e já cai na página de avaliar vocês. "
       f"Dá uma olhada num site que fiz pra uma academia aqui de Casimiro: https://oliveirabrennobjj-beep.github.io/Meu-site/brteam/ "
       f"Posso montar um modelo do de vocês, sem compromisso?")
  ig=p.get('website') or ''
  out.append(dict(id=re.sub(r'[^0-9a-fx]','',p['feature_id'].replace(':','-'))[:60],
    nome=p['name'].split('. Abra')[0], categoria=p['categories'][0] if p['categories'] else '', grupo=cat, cidade=cidade,
    endereco=p['address'] or '', nota=p.get('rating'), avaliacoes=rc, telefone=p['phone'], whatsapp=('55'+dig) if movel else '',
    fixo=not movel, maps=f"https://www.google.com/maps/place/?q=place_id:{p['place_id']}", redesocial=ig,
    mensagem=msg, status='novo', lista='2026-11-08'))
out.sort(key=lambda x:(x['fixo'], x['avaliacoes']))
json.dump(out,open('lojas.json','w'),ensure_ascii=False,indent=1)
print(len(out), sum(o['fixo'] for o in out)); print(out[0]['mensagem']); 
from collections import Counter; print(Counter(o['grupo'] for o in out), Counter(o['cidade'] for o in out))

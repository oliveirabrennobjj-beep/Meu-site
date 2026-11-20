import re,unicodedata
STOP=set('de da do das dos e a o the and loja studio estudio espaco salao bar restaurante barbearia casa clinica centro rj casimiro abreu rio ostras barra sao joao delivery store shop oficial ltda me eireli'.split())
def toks(s):
    s=unicodedata.normalize('NFKD',(s or '').lower()).encode('ascii','ignore').decode()
    return {t for t in re.findall(r'[a-z0-9]{3,}',s) if t not in STOP}
def casa(loja,zap):
    a,b=toks(loja),toks(zap)
    if not a or not b: return False
    if a&b: return True
    j=lambda x:''.join(sorted(x))
    sa=re.sub(r'[^a-z0-9]','',unicodedata.normalize('NFKD',loja.lower()).encode('ascii','ignore').decode())
    sb=re.sub(r'[^a-z0-9]','',unicodedata.normalize('NFKD',zap.lower()).encode('ascii','ignore').decode())
    return any(t in sa for t in b if len(t)>=4) or any(t in sb for t in a if len(t)>=4)

import difflib
def _n(s): return re.sub(r'[^a-z0-9]','',unicodedata.normalize('NFKD',(s or '').lower()).encode('ascii','ignore').decode())
_casa_base=casa
def casa(loja,zap):
    if _casa_base(loja,zap): return True
    a,b=_n(loja),_n(zap)
    return bool(a and b) and difflib.SequenceMatcher(None,a,b).ratio()>=0.75

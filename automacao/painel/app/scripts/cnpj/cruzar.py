"""Cruza as lojas do lote com o cadastro público do CNPJ (dados abertos da Receita).

Uso: python3 -I cruzar.py <lote.json> <pasta com est*.csv e emp*.csv> <saida.json>

Saída: {whatsappDaLoja: {"nome"?: primeiro nome, "whatsapp"?: celular, "mesmo"?: true, "cnpj": ..., "por": ...}}
Só grava quando a loja e o CNPJ batem pelo nome E por um dado concreto (telefone, rua e número, ou CEP de rua).
"""
import csv, glob, json, math, re, sys, unicodedata, collections

lote_arq, pasta, saida = sys.argv[1:4]

MUNICIPIO = {  # cidade do lead -> código do município na Receita
    "rio das ostras": "2921", "unamar": "5813", "cabo frio": "5813", "tamoios": "5813",
    "casimiro de abreu": "5825", "barra de sao joao": "5825", "rio dourado": "5825",
    "silva jardim": "5911", "macae": "5847",
}
VAZIAS = set("""de da do das dos e a o em no na com the
ltda me eireli epp mei sa s/a cia comercio servicos servico loja
casimiro abreu barra sao joao rio ostras unamar tamoios macae cabo frio silva jardim dourado centro rj
""".split())


def norm(t):
    t = unicodedata.normalize("NFKD", t or "").encode("ascii", "ignore").decode().lower()
    return re.sub(r"[^a-z0-9 ]+", " ", t)


def palavras(t):
    return {p for p in norm(t).split() if len(p) > 1 and p not in VAZIAS and not p.isdigit()}


def celular(ddd, num):
    """Telefone do cadastro -> 55DDD9XXXXXXXX quando é celular; None quando é fixo ou inválido."""
    ddd, num = re.sub(r"\D", "", ddd or ""), re.sub(r"\D", "", num or "")
    if len(ddd) != 2:
        return None
    if len(num) == 8 and num[0] in "6789":
        num = "9" + num  # celular antigo, antes do nono dígito
    if len(num) == 9 and num[0] == "9":
        return "55" + ddd + num
    return None


def ultimos8(n):
    return re.sub(r"\D", "", n or "")[-8:]


RUA = re.compile(r"^(r|rua|av|avenida|estr|estrada|rod|rodovia|tv|travessa|al|alameda|pc|praca|lgo|largo|via)\b\.?\s*", re.I)


def ruakey(t):
    """Nome da rua sem tipo (rua, av...) e sem de/da/dos: 'Av. dos Bandeirantes' == 'BANDEIRANTES'."""
    t = norm(RUA.sub("", (t or "").strip()))
    return " ".join(p for p in t.split() if p not in {"de", "da", "do", "das", "dos", "e"})


def rua_lead(endereco):
    """'R. Jonas Nunes, 176 - Loja 3 - Bairro, Cidade - RJ, 28860-000, Brasil' -> ('jonas nunes', '176', '28860000')."""
    cep = re.search(r"(\d{5})-?(\d{3})", endereco or "")
    partes = (endereco or "").split(",")
    rua = ruakey(partes[0]) if partes else ""
    num = ""
    if len(partes) > 1:
        m = re.match(r"\s*(\d+)", partes[1])
        num = m.group(1) if m else ""
    return rua, num, (cep.group(1) + cep.group(2)) if cep else ""


# --- cadastro -----------------------------------------------------------------------------------
estab = []
for arq in sorted(glob.glob(f"{pasta}/est*.csv")):
    for r in csv.reader(open(arq, encoding="latin1"), delimiter=";"):
        if len(r) < 28 or r[5] not in ("02", "04"):  # ativa ou inapta (muita loja pequena segue aberta)
            continue
        estab.append({
            "basico": r[0], "cnpj": r[0] + r[1] + r[2], "fantasia": r[4], "situacao": r[5],
            "rua": ruakey(r[14]), "num": re.sub(r"\D", "", r[15]), "cep": r[18], "mun": r[20],
            "tels": [t for t in (r[21] + r[22], r[23] + r[24]) if len(re.sub(r"\D", "", t)) >= 10],
            "cels": [c for c in (celular(r[21], r[22]), celular(r[23], r[24])) if c],
        })
empresa = {}
for arq in sorted(glob.glob(f"{pasta}/emp*.csv")):
    for r in csv.reader(open(arq, encoding="latin1"), delimiter=";"):
        if len(r) >= 3:
            empresa[r[0]] = {"razao": r[1], "natureza": r[2]}

# Número em mais de 3 CNPJs é de contador/despachante: não é do dono.
uso = collections.Counter(c for e in estab for c in set(e["cels"]))
por_tel = collections.defaultdict(list)
por_rua = collections.defaultdict(list)
por_mun = collections.defaultdict(list)
for e in estab:
    e["fant"] = palavras(e["fantasia"])
    e["razao"] = palavras(re.sub(r"[\d.]+", " ", empresa.get(e["basico"], {}).get("razao", "")))
    e["nomes"] = e["fant"] | e["razao"]
    for t in e["tels"]:
        por_tel[ultimos8(t)].append(e)
    if e["rua"] and e["num"]:
        por_rua[(e["mun"], e["rua"], e["num"])].append(e)
    por_mun[e["mun"]].append(e)
# Palavra que aparece em muitos nomes (cafe, bar, clinica...) não identifica a loja.
freq = collections.Counter(p for e in estab for p in e["nomes"])


TOTAL = len(estab)


def peso(p):
    return math.log(TOTAL / (1 + freq[p]))


def cobre(a, b):
    """Quanto de `a` (pesado pela raridade de cada palavra) está em `b`."""
    total = sum(peso(p) for p in a)
    return sum(peso(p) for p in a & b) / total if total else 0


def bate(nl, e, forte=False):
    """O nome da loja e o do CNPJ (fantasia ou razão social) são o mesmo nos dois sentidos."""
    minimo = (0.7, 0.6) if forte else (0.55, 0.45)
    return any(n and cobre(nl, n) >= minimo[0] and cobre(n, nl) >= minimo[1] for n in (e["fant"], e["razao"]))


def primeiro_nome(e):
    emp = empresa.get(e["basico"])
    if not emp or emp["natureza"] != "2135":  # só empresário individual / MEI: a razão social é o nome da pessoa
        return ""
    nome = re.sub(r"[\d./-]+", " ", emp["razao"]).split()
    return nome[0].capitalize() if nome and re.fullmatch(r"[A-Za-zÀ-ÿ]{2,20}", nome[0]) else ""


# Primeiros nomes de gente (das razões sociais de MEI): se o nome da loja tem outro nome de pessoa
# ("Espaço Flávia" num CNPJ do Maicon), não chama pelo nome pra não errar a pessoa.
PRIMEIROS = collections.Counter(
    norm(re.sub(r"[\d./-]+", " ", m["razao"])).split()[0]
    for m in empresa.values() if m["natureza"] == "2135" and norm(re.sub(r"[\d./-]+", " ", m["razao"])).split()
)
GENTE = {n for n, c in PRIMEIROS.items() if c >= 5 and len(n) >= 3}


# --- cruzamento ---------------------------------------------------------------------------------
lote = json.load(open(lote_arq))
res, motivo = {}, collections.Counter()
for l in lote["leads"]:
    zap = re.sub(r"\D", "", l.get("whatsapp", ""))
    mun = MUNICIPIO.get(norm(l.get("cidade", "")).strip())
    if not zap or not mun:
        motivo["sem cidade"] += 1
        continue
    nl = palavras(l.get("nome", ""))
    rua, num, cep = rua_lead(l.get("endereco", ""))
    achados = []  # (força, por, estabelecimento)
    for t in {ultimos8(zap), ultimos8(l.get("telefone", ""))} - {""}:
        for e in por_tel.get(t, []):
            if e["mun"] == mun:
                achados.append((3, "telefone", e))
    if rua and num:
        for e in por_rua.get((mun, rua, num), []):
            if bate(nl, e):
                achados.append((2, "endereço", e))
    if cep and not cep.endswith("000"):  # CEP de rua (o geral da cidade termina em 000)
        for e in por_mun[mun]:
            if e["cep"] == cep and bate(nl, e, forte=True):
                achados.append((1, "nome e CEP", e))
    if not achados:
        motivo["não achou"] += 1
        continue
    achados.sort(key=lambda x: (-x[0], x[2]["situacao"]))
    forca, por, e = achados[0]
    # Empate entre CNPJs diferentes no mesmo nível sem telefone: ambíguo, não grava.
    if forca < 3 and len({a[2]["cnpj"] for a in achados if a[0] == forca}) > 1:
        motivo["ambíguo"] += 1
        continue
    cels = [c for c in e["cels"] if uso[c] <= 3]
    item = {"cnpj": e["cnpj"], "por": por}
    nome = primeiro_nome(e)
    outra_pessoa = {p for p in norm(l.get("nome", "")).split() if p in GENTE} - {norm(nome)}
    # Acento do jeito que está no nome da loja ("André Vieira Imobiliária"); o cadastro vem sem acento.
    for p in re.findall(r"[^\W\d_]+", l.get("nome", "")):
        if nome and norm(p) == norm(nome):
            nome = p.capitalize()
    if nome and not outra_pessoa:
        item["nome"] = nome
    # O WhatsApp da loja só é "do dono" quando a empresa é de uma pessoa só (MEI/empresário individual).
    if zap in cels and empresa.get(e["basico"], {}).get("natureza") == "2135":
        item["mesmo"] = True
    outros = [c for c in cels if c != zap]
    if outros:
        item["whatsapp"] = outros[0]
    if "mesmo" in item or "whatsapp" in item:
        res[zap] = item
        motivo["mesmo" if "mesmo" in item and "whatsapp" not in item else "celular do dono"] += 1
    else:
        motivo["CNPJ sem celular útil"] += 1

json.dump(res, open(saida, "w"), ensure_ascii=False, indent=0)
print(len(lote["leads"]), "lojas;", dict(motivo))

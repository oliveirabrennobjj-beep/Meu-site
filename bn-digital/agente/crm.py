#!/usr/bin/env python3
"""CRM do agente de vendas da BN Digital.

Guarda os comércios (leads), a nota de cada um, a mensagem que está esperando
aprovação e o histórico da conversa. Tudo fica em dados/crm.json, que NÃO vai
para o repositório (o repositório é público e as conversas são particulares).

Só usa a biblioteca padrão do Python. Exemplos:

    python3 crm.py importar ../prospeccao/*.json     # quem já foi abordado
    python3 crm.py adicionar novos.json              # leads novos (do buscar_osm.py ou da pesquisa)
    python3 crm.py fila                              # o que fazer agora
    python3 crm.py rascunho 12 --canal whatsapp --texto "Oi..."
    python3 crm.py enviado 12                        # você mandou a mensagem aprovada
    python3 crm.py recebido 12 --texto "Quanto custa?"
    python3 crm.py etapa 12 reuniao --nota "passar lá sexta 10h"
    python3 crm.py painel                            # gera dados/painel.html pro celular
"""
from __future__ import annotations

import argparse
import html
import json
import re
import sys
import unicodedata
from datetime import datetime, timedelta
from pathlib import Path
from urllib.parse import quote

AQUI = Path(__file__).resolve().parent
CONFIG = AQUI / "config.json"
DADOS = AQUI / "dados"
CRM = DADOS / "crm.json"

# Ordem do funil. "ja_abordado" = veio das listas antigas, antes do agente.
ETAPAS = [
    "novo",          # achado, ainda sem mensagem
    "rascunho",      # mensagem escrita, esperando você aprovar e mandar
    "enviado",       # você mandou, esperando resposta
    "respondeu",     # a pessoa respondeu e falta você responder de volta
    "conversando",   # você respondeu, esperando a pessoa de novo
    "reuniao",       # visita, ligação ou demonstração marcada
    "fechado",       # vendeu
    "perdido",       # disse não ou sumiu depois do lembrete
    "nao_contatar",  # pediu pra não mandar mais. Nunca mais escreva.
    "ja_abordado",   # estava nas listas antigas (antes do agente)
]
CANAIS = ["whatsapp", "instagram", "facebook", "email", "presencial"]


def agora() -> str:
    return datetime.now().replace(microsecond=0).isoformat()


def chave(nome: str) -> str:
    """Nome sem acento, sem pontuação e sem palavras genéricas: evita lead repetido."""
    s = unicodedata.normalize("NFKD", nome).encode("ascii", "ignore").decode().lower()
    s = re.sub(r"[^a-z0-9 ]", " ", s)
    genericas = {"a", "o", "e", "de", "da", "do", "das", "dos", "the", "ltda", "me"}
    return " ".join(p for p in s.split() if p not in genericas)


def so_digitos(tel: str) -> str:
    d = re.sub(r"\D", "", tel or "")
    if d.startswith("55") and len(d) in (12, 13):
        d = d[2:]
    if d.startswith("0"):
        d = d.lstrip("0")
    return d


def eh_celular(tel: str) -> bool:
    d = so_digitos(tel)
    return len(d) == 11 and d[2] == "9"


def link_whatsapp(tel: str, texto: str) -> str:
    return f"https://wa.me/55{so_digitos(tel)}?text={quote(texto, safe='')}"


def site_de_verdade(site: str) -> bool:
    if not site:
        return False
    redes = ("instagram.com", "facebook.com", "fb.com", "linktr.ee", "wa.me", "whatsapp.com", "ifood.com")
    return not any(r in site.lower() for r in redes)


def carregar_config() -> dict:
    return json.loads(CONFIG.read_text(encoding="utf-8"))


def carregar() -> dict:
    if CRM.exists():
        return json.loads(CRM.read_text(encoding="utf-8"))
    return {"proximo_id": 1, "leads": []}


def salvar(db: dict) -> None:
    DADOS.mkdir(exist_ok=True)
    tmp = CRM.with_suffix(".tmp")
    tmp.write_text(json.dumps(db, ensure_ascii=False, indent=1), encoding="utf-8")
    tmp.replace(CRM)


def achar(db: dict, ident: str) -> dict:
    for l in db["leads"]:
        if str(l["id"]) == str(ident):
            return l
    alvo = chave(ident)
    achados = [l for l in db["leads"] if alvo and alvo in chave(l["nome"])]
    if len(achados) == 1:
        return achados[0]
    if achados:
        sys.exit("Mais de um lead com esse nome: " + ", ".join(f"#{l['id']} {l['nome']}" for l in achados))
    sys.exit(f"Lead não encontrado: {ident}")


def dar_nota(lead: dict, cfg: dict) -> tuple[int, list[str]]:
    """Nota de 0 a 10: quanto mais alta, maior a chance de precisar do que você vende."""
    nota, motivos = 0, []
    if not site_de_verdade(lead.get("site", "")):
        nota += 3
        motivos.append("sem site")
    else:
        motivos.append("já tem site: oferecer placa")
    if eh_celular(lead.get("wa", "")):
        nota += 2
        motivos.append("tem celular/WhatsApp")
    elif lead.get("wa"):
        nota += 1
        motivos.append("só telefone fixo")
    if lead.get("ig"):
        nota += 1
        motivos.append("tem Instagram")
    if lead.get("tipo") in cfg.get("tipos", []):
        nota += 2
        motivos.append(f"ramo-alvo ({lead['tipo']})")
    cidades = [chave(c) for c in cfg.get("cidades", [])]
    cid = chave(lead.get("cidade", ""))
    if cidades and cidades[0] and cidades[0] in cid:
        nota += 2
        motivos.append("na sua cidade: dá pra visitar")
    elif any(c and c in cid for c in cidades):
        nota += 1
        motivos.append("cidade da região")
    if not lead.get("wa") and not lead.get("ig") and not lead.get("email") and not lead.get("fb"):
        nota = min(nota, 3)
        motivos.append("sem contato: só visita")
    return min(nota, 10), motivos


def novo_lead(db: dict, dados: dict, cfg: dict, etapa: str = "novo") -> dict | None:
    nome = (dados.get("nome") or "").strip()
    if not nome:
        return None
    k = chave(nome)
    tel = so_digitos(dados.get("wa", ""))
    for l in db["leads"]:
        if chave(l["nome"]) == k or (tel and so_digitos(l.get("wa", "")) == tel):
            return None  # já existe
    lead = {
        "id": db["proximo_id"],
        "nome": nome,
        "tipo": dados.get("tipo", ""),
        "cidade": dados.get("cidade", ""),
        "endereco": dados.get("endereco", ""),
        "wa": tel,
        "ig": (dados.get("ig") or "").lstrip("@"),
        "fb": dados.get("fb", ""),
        "email": dados.get("email", ""),
        "site": dados.get("site", ""),
        "fonte": dados.get("src") or dados.get("fonte", ""),
        "obs": dados.get("obs", ""),
        "gancho": dados.get("gancho", ""),  # o detalhe daquele negócio citado na mensagem
        "etapa": etapa,
        "criado": agora(),
        "atualizado": agora(),
        "rascunho": None,
        "historico": [],
        "lembretes": 0,
    }
    if dados.get("lista"):
        lead["obs"] = (lead["obs"] + f" (lista de {dados['lista']})").strip()
    lead["nota"], lead["motivos"] = dar_nota(lead, cfg)
    db["proximo_id"] += 1
    db["leads"].append(lead)
    return lead


def ler_lista(caminho: str) -> list[dict]:
    texto = sys.stdin.read() if caminho == "-" else Path(caminho).read_text(encoding="utf-8")
    d = json.loads(texto)
    if isinstance(d, dict):
        d = d.get("leads", [d])
    return d


# ---------- comandos ----------

def cmd_importar(a):
    db, cfg, n = carregar(), carregar_config(), 0
    for arq in a.arquivos:
        for item in ler_lista(arq):
            if novo_lead(db, item, cfg, etapa="ja_abordado"):
                n += 1
    salvar(db)
    print(f"{n} comércios das listas antigas importados como 'ja_abordado' (o agente não aborda de novo).")


def cmd_adicionar(a):
    db, cfg = carregar(), carregar_config()
    novos, repetidos = [], 0
    for item in ler_lista(a.arquivo):
        l = novo_lead(db, item, cfg)
        if l:
            novos.append(l)
        else:
            repetidos += 1
    salvar(db)
    print(f"{len(novos)} leads novos, {repetidos} já estavam no CRM (ignorados).")
    for l in sorted(novos, key=lambda x: -x["nota"]):
        print(f"  #{l['id']:<4} nota {l['nota']:>2}  {l['nome']} · {l['cidade']}  ({', '.join(l['motivos'])})")


def linha(l: dict) -> str:
    contato = "WA" if l.get("wa") else ("IG" if l.get("ig") else ("FB" if l.get("fb") else ("email" if l.get("email") else "—")))
    return f"#{l['id']:<4} {l['etapa']:<12} nota {l['nota']:>2}  {contato:<5} {l['nome']} · {l['cidade']}"


def cmd_listar(a):
    db = carregar()
    ls = [l for l in db["leads"] if (not a.etapa or l["etapa"] == a.etapa) and l["nota"] >= a.min_nota]
    if not a.etapa and not a.todos:
        ls = [l for l in ls if l["etapa"] != "ja_abordado"]
    for l in sorted(ls, key=lambda x: (ETAPAS.index(x["etapa"]), -x["nota"])):
        print(linha(l))
    print(f"({len(ls)} leads)")


def cmd_ver(a):
    l = achar(carregar(), a.lead)
    print(json.dumps(l, ensure_ascii=False, indent=2))


def cmd_rascunho(a):
    db = carregar()
    l = achar(db, a.lead)
    if l["etapa"] == "nao_contatar":
        sys.exit(f"{l['nome']} pediu pra não ser contatado. Nenhuma mensagem.")
    canal = a.canal or ("whatsapp" if l.get("wa") else "instagram" if l.get("ig") else "facebook" if l.get("fb") else "email" if l.get("email") else "presencial")
    l["rascunho"] = {"canal": canal, "texto": a.texto.strip(), "criado": agora()}
    if a.gancho:
        l["gancho"] = a.gancho
    if l["etapa"] in ("novo", "ja_abordado"):
        l["etapa"] = "rascunho"
    l["atualizado"] = agora()
    salvar(db)
    print(f"Rascunho salvo para #{l['id']} {l['nome']} ({canal}). Ele só sai quando você mandar.")


def cmd_enviado(a):
    db = carregar()
    l = achar(db, a.lead)
    r = l.get("rascunho")
    if not r and not a.texto:
        sys.exit("Esse lead não tem rascunho. Use --texto com o que você mandou.")
    texto = a.texto or r["texto"]
    canal = (r or {}).get("canal") or a.canal or "whatsapp"
    ja_conversava = any(m["de"] == "cliente" for m in l["historico"])
    eh_lembrete = l["etapa"] == "enviado"
    l["historico"].append({"de": "voce", "canal": canal, "texto": texto, "data": agora()})
    l["rascunho"] = None
    if eh_lembrete and not ja_conversava:
        l["lembretes"] += 1
    if not ja_conversava:
        l["etapa"] = "enviado"
    elif l["etapa"] not in ("reuniao", "fechado"):
        l["etapa"] = "conversando"
    l["atualizado"] = agora()
    salvar(db)
    print(f"Registrado: mensagem enviada para #{l['id']} {l['nome']} → etapa '{l['etapa']}'.")


def cmd_recebido(a):
    db = carregar()
    l = achar(db, a.lead)
    l["historico"].append({"de": "cliente", "canal": a.canal or "whatsapp", "texto": a.texto.strip(), "data": agora()})
    if l["etapa"] not in ("reuniao", "fechado", "nao_contatar"):
        l["etapa"] = "respondeu"
    l["atualizado"] = agora()
    salvar(db)
    print(f"Resposta de #{l['id']} {l['nome']} registrada. Etapa: '{l['etapa']}'.")


def cmd_etapa(a):
    if a.etapa not in ETAPAS:
        sys.exit("Etapas: " + ", ".join(ETAPAS))
    db = carregar()
    l = achar(db, a.lead)
    l["etapa"] = a.etapa
    if a.etapa in ("nao_contatar", "perdido", "fechado"):
        l["rascunho"] = None
    if a.nota:
        l["historico"].append({"de": "nota", "canal": "", "texto": a.nota, "data": agora()})
    l["atualizado"] = agora()
    salvar(db)
    print(f"#{l['id']} {l['nome']} → '{a.etapa}'.")


def cmd_editar(a):
    db = carregar()
    l = achar(db, a.lead)
    for campo in a.campos:
        k, _, v = campo.partition("=")
        if k not in ("nome", "tipo", "cidade", "endereco", "wa", "ig", "fb", "email", "site", "obs", "gancho"):
            sys.exit(f"Campo não editável: {k}")
        l[k] = so_digitos(v) if k == "wa" else v
    l["nota"], l["motivos"] = dar_nota(l, carregar_config())
    l["atualizado"] = agora()
    salvar(db)
    print(linha(l))


def fila(db: dict, cfg: dict) -> dict:
    lim = cfg.get("limites", {})
    dias = lim.get("dias_ate_lembrete", 3)
    max_lemb = lim.get("maximo_de_lembretes", 1)
    hoje = datetime.now()
    f = {"responder": [], "aprovar": [], "lembrar": [], "desistir": [], "reunioes": [], "abordar": []}
    for l in db["leads"]:
        e = l["etapa"]
        if l.get("rascunho") and e not in ("nao_contatar", "fechado", "perdido"):
            f["aprovar"].append(l)
        elif e == "respondeu":
            f["responder"].append(l)
        elif e == "enviado":
            ultima = max((m["data"] for m in l["historico"] if m["de"] == "voce"), default=l["atualizado"])
            if hoje - datetime.fromisoformat(ultima) >= timedelta(days=dias):
                (f["lembrar"] if l.get("lembretes", 0) < max_lemb else f["desistir"]).append(l)
        elif e == "reuniao":
            f["reunioes"].append(l)
        elif e == "novo":
            f["abordar"].append(l)
    f["abordar"].sort(key=lambda x: -x["nota"])
    feitas_hoje = sum(
        1 for l in db["leads"] for m in l["historico"][:1]
        if m["de"] == "voce" and m["data"][:10] == hoje.date().isoformat()
    )
    vagas = max(0, lim.get("novas_abordagens_por_dia", 15) - feitas_hoje - len(f["aprovar"]))
    f["abordar"] = f["abordar"][:vagas]
    return f


def cmd_fila(a):
    db, cfg = carregar(), carregar_config()
    f = fila(db, cfg)
    titulos = {
        "responder": "1. RESPONDER (o cliente falou, é a prioridade)",
        "aprovar": "2. APROVAR E MANDAR (rascunhos prontos)",
        "reunioes": "3. REUNIÕES / VISITAS marcadas",
        "lembrar": "4. LEMBRETE (mandou faz dias e não responderam)",
        "desistir": "5. MARCAR COMO PERDIDO (já levou lembrete e não respondeu)",
        "abordar": "6. ABORDAR (leads novos, maior nota primeiro, dentro do limite do dia)",
    }
    if a.json:
        print(json.dumps({k: [l["id"] for l in v] for k, v in f.items()}))
        return
    for k, t in titulos.items():
        print(t)
        for l in f[k]:
            print("   " + linha(l))
        if not f[k]:
            print("   (nada)")
    contagem = {e: sum(1 for l in db["leads"] if l["etapa"] == e) for e in ETAPAS}
    print("\nFunil: " + "  ".join(f"{e} {n}" for e, n in contagem.items() if n))


# ---------- painel ----------

ROTULO = {
    "novo": "Novo", "rascunho": "Aprovar", "enviado": "Enviado", "respondeu": "Respondeu!",
    "conversando": "Conversando", "reuniao": "Reunião", "fechado": "Fechado",
    "perdido": "Perdido", "nao_contatar": "Não contatar", "ja_abordado": "Lista antiga",
}


def botoes(l: dict, texto: str) -> str:
    b = []
    if l.get("wa"):
        b.append(f'<a class="btn wa" href="{html.escape(link_whatsapp(l["wa"], texto))}">Abrir no WhatsApp</a>')
    if l.get("ig"):
        b.append(f'<a class="btn" href="https://ig.me/m/{html.escape(l["ig"])}">Abrir DM no Instagram</a>')
    if l.get("fb"):
        fb = l["fb"].rstrip("/").split("/")[-1]
        b.append(f'<a class="btn" href="https://m.me/{html.escape(fb)}">Abrir Messenger</a>')
    if l.get("email"):
        b.append(f'<a class="btn" href="mailto:{html.escape(l["email"])}?body={quote(texto)}">Abrir e-mail</a>')
    b.append('<button class="btn" type="button" onclick="copiar(this)">Copiar texto</button>')
    return "".join(b)


def cartao(l: dict) -> str:
    hist = "".join(
        f'<p class="msg m-{m["de"]}"><small>{m["data"][:16].replace("T", " ")} · {html.escape(m["canal"] or "nota")}</small>{html.escape(m["texto"])}</p>'
        for m in l["historico"][-6:]
    )
    r = l.get("rascunho")
    corpo = ""
    if r:
        corpo = (
            f'<div class="rascunho"><small>Mensagem para aprovar ({html.escape(r["canal"])}). Leia, ajuste se quiser e mande:</small>'
            f'<p class="texto">{html.escape(r["texto"])}</p><div class="acoes">{botoes(l, r["texto"])}</div>'
            '<small>Depois de mandar, diga ao agente: "mandei a #' + str(l["id"]) + '".</small></div>'
        )
    contato = " · ".join(x for x in [
        (f"WhatsApp {l['wa']}" if eh_celular(l["wa"]) else f"Telefone {l['wa']} (fixo: ligue ou confira se tem WhatsApp)") if l.get("wa") else "",
        f"@{l['ig']}" if l.get("ig") else "",
        f'<a href="{html.escape(l["fonte"])}">fonte</a>' if l.get("fonte") else "",
    ] if x)
    return (
        f'<article class="lead e-{l["etapa"]}"><header><b>#{l["id"]} {html.escape(l["nome"])}</b>'
        f'<span class="tag">{ROTULO[l["etapa"]]}</span><span class="nota">{l["nota"]}</span></header>'
        f'<p class="meta">{html.escape(l["tipo"])} · {html.escape(l["cidade"])}<br>{contato}</p>'
        f'<p class="meta">{html.escape(", ".join(l.get("motivos", [])))}</p>'
        f'{"<p class=meta>Gancho: " + html.escape(l["gancho"]) + "</p>" if l.get("gancho") else ""}'
        f"{corpo}{hist}</article>"
    )


def cmd_painel(a):
    db, cfg = carregar(), carregar_config()
    f = fila(db, cfg)
    secoes = [
        ("Responder agora", f["responder"]),
        ("Aprovar e mandar", f["aprovar"]),
        ("Reuniões e visitas", f["reunioes"]),
        ("Mandar lembrete", f["lembrar"]),
    ]
    ativos = [l for l in db["leads"] if l["etapa"] in ("enviado", "conversando")
              and l not in f["lembrar"] and l not in f["aprovar"]]
    secoes.append(("Esperando resposta", sorted(ativos, key=lambda x: x["atualizado"], reverse=True)))
    secoes.append(("Fechados", [l for l in db["leads"] if l["etapa"] == "fechado"]))
    contagem = {e: sum(1 for l in db["leads"] if l["etapa"] == e) for e in ETAPAS}
    funil = "".join(f"<span><b>{n}</b> {ROTULO[e]}</span>" for e, n in contagem.items() if n and e != "ja_abordado")
    corpo = "".join(
        f"<h2>{t} <small>({len(ls)})</small></h2>" + ("".join(cartao(l) for l in ls) or '<p class="vazio">Nada aqui.</p>')
        for t, ls in secoes
    )
    pagina = PAINEL.replace("__FUNIL__", funil).replace("__CORPO__", corpo).replace(
        "__QUANDO__", datetime.now().strftime("%d/%m/%Y %H:%M")).replace("__EMPRESA__", html.escape(cfg["vendedor"]["empresa"]))
    saida = Path(a.saida) if a.saida else DADOS / "painel.html"
    saida.parent.mkdir(exist_ok=True)
    saida.write_text(pagina, encoding="utf-8")
    print(f"Painel gerado: {saida}")


PAINEL = """<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Agente de vendas</title>
<style>
:root{--bg:#f6f4ef;--card:#fff;--tx:#1d1b18;--mut:#6b655c;--ac:#e8562a;--wa:#1f9d55;--ln:#e3ded4}
@media (prefers-color-scheme:dark){:root{--bg:#141311;--card:#1f1d1a;--tx:#f1ede6;--mut:#a39c90;--ln:#34302a}}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--tx);font:15px/1.45 system-ui,sans-serif;padding:16px;max-width:720px;margin:auto}
h1{font-size:22px;margin:4px 0}h1 span{color:var(--ac)}h2{font-size:17px;margin:28px 0 10px}h2 small{color:var(--mut);font-weight:400}
.funil{display:flex;flex-wrap:wrap;gap:6px;margin:10px 0}.funil span{background:var(--card);border:1px solid var(--ln);border-radius:99px;padding:3px 10px;font-size:13px}
.lead{background:var(--card);border:1px solid var(--ln);border-radius:12px;padding:12px;margin:10px 0}
.lead header{display:flex;gap:8px;align-items:center}.lead header b{flex:1}
.tag{font-size:12px;background:var(--bg);border-radius:99px;padding:2px 8px}.e-respondeu .tag{background:var(--ac);color:#fff}
.nota{width:28px;height:28px;border-radius:50%;border:2px solid var(--ac);display:grid;place-items:center;font-weight:700;font-size:13px}
.meta{color:var(--mut);font-size:13px;margin:4px 0;overflow-wrap:anywhere}.meta a{color:inherit}
.rascunho{border-left:3px solid var(--ac);padding:6px 10px;margin:8px 0}.texto{white-space:pre-wrap}
.acoes{display:flex;flex-wrap:wrap;gap:6px;margin:8px 0}
.btn{appearance:none;border:1px solid var(--ln);background:var(--bg);color:var(--tx);border-radius:8px;padding:9px 12px;font:inherit;font-size:14px;text-decoration:none;cursor:pointer}
.btn.wa{background:var(--wa);border-color:var(--wa);color:#fff}
.msg{margin:6px 0;padding:6px 10px;border-radius:10px;white-space:pre-wrap;max-width:90%}.msg small{display:block;color:var(--mut);font-size:11px}
.m-voce{background:var(--bg);margin-left:auto}.m-cliente{border:1px solid var(--ac)}.m-nota{font-style:italic;color:var(--mut)}
.vazio{color:var(--mut)}
</style></head><body>
<h1><span>__EMPRESA__</span> · agente de vendas</h1>
<p class="meta">Atualizado em __QUANDO__. Nenhuma mensagem sai sozinha: você abre, confere e manda.</p>
<div class="funil">__FUNIL__</div>
__CORPO__
<script>
function copiar(b){const t=b.closest('.rascunho').querySelector('.texto').innerText;
navigator.clipboard.writeText(t).then(()=>{b.textContent='Copiado!';setTimeout(()=>b.textContent='Copiar texto',1500)})}
</script></body></html>"""


def main(argv=None):
    p = argparse.ArgumentParser(description="CRM do agente de vendas da BN Digital")
    s = p.add_subparsers(dest="cmd", required=True)

    x = s.add_parser("importar", help="importa listas antigas como já abordadas")
    x.add_argument("arquivos", nargs="+")
    x.set_defaults(f=cmd_importar)

    x = s.add_parser("adicionar", help="adiciona leads novos de um JSON (ou - para stdin)")
    x.add_argument("arquivo")
    x.set_defaults(f=cmd_adicionar)

    x = s.add_parser("listar")
    x.add_argument("--etapa")
    x.add_argument("--min-nota", type=int, default=0)
    x.add_argument("--todos", action="store_true", help="inclui as listas antigas")
    x.set_defaults(f=cmd_listar)

    x = s.add_parser("ver")
    x.add_argument("lead")
    x.set_defaults(f=cmd_ver)

    x = s.add_parser("rascunho", help="salva a mensagem que espera sua aprovação")
    x.add_argument("lead")
    x.add_argument("--texto", required=True)
    x.add_argument("--canal", choices=CANAIS)
    x.add_argument("--gancho", help="o detalhe daquele negócio que a mensagem cita")
    x.set_defaults(f=cmd_rascunho)

    x = s.add_parser("enviado", help="registra que você mandou o rascunho")
    x.add_argument("lead")
    x.add_argument("--texto", help="se mandou algo diferente do rascunho")
    x.add_argument("--canal", choices=CANAIS)
    x.set_defaults(f=cmd_enviado)

    x = s.add_parser("recebido", help="registra a resposta do cliente")
    x.add_argument("lead")
    x.add_argument("--texto", required=True)
    x.add_argument("--canal", choices=CANAIS)
    x.set_defaults(f=cmd_recebido)

    x = s.add_parser("etapa")
    x.add_argument("lead")
    x.add_argument("etapa")
    x.add_argument("--nota", help="anotação (ex.: dia e hora da visita)")
    x.set_defaults(f=cmd_etapa)

    x = s.add_parser("editar", help="corrige campos: editar 12 wa=22999999999 ig=perfil")
    x.add_argument("lead")
    x.add_argument("campos", nargs="+")
    x.set_defaults(f=cmd_editar)

    x = s.add_parser("fila", help="o que fazer agora, em ordem")
    x.add_argument("--json", action="store_true")
    x.set_defaults(f=cmd_fila)

    x = s.add_parser("painel", help="gera o painel HTML pro celular")
    x.add_argument("--saida")
    x.set_defaults(f=cmd_painel)

    a = p.parse_args(argv)
    a.f(a)


if __name__ == "__main__":
    main()

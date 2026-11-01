#!/usr/bin/env python3
"""Acha comércios no mapa (OpenStreetMap, grátis, sem chave de API).

    python3 buscar_osm.py --cidade "Rio das Ostras" --tipos barbearia,pet > dados/osm.json
    python3 crm.py adicionar dados/osm.json

Sai uma lista de leads no formato do crm.py (nome, tipo, cidade, endereço,
telefone, Instagram, site). A nota é calculada pelo crm.py ao adicionar.

Precisa de acesso a overpass-api.de. Nas sessões na nuvem, libere esse
endereço na rede do ambiente; se não der, o agente pesquisa na web.
Com --arquivo, lê uma resposta do Overpass já salva (útil para testar).
"""
from __future__ import annotations

import argparse
import json
import sys
import time
import urllib.parse
import urllib.request

OVERPASS = ["https://overpass-api.de/api/interpreter", "https://overpass.kumi.systems/api/interpreter"]

# tipo do CRM -> filtros do OpenStreetMap
TIPOS = {
    "barbearia": ['["shop"="hairdresser"]["hairdresser"~"barber|men",i]', '["shop"="barber"]', '["name"~"barbearia",i]'],
    "salao": ['["shop"="hairdresser"]', '["shop"="beauty"]["beauty"!~"nails",i]'],
    "estetica": ['["shop"="beauty"]', '["leisure"="spa"]', '["shop"="cosmetics"]'],
    "pet": ['["shop"="pet"]', '["amenity"="veterinary"]', '["shop"="pet_grooming"]'],
    "oficina": ['["shop"="car_repair"]', '["shop"="tyres"]', '["shop"="car_parts"]', '["shop"="motorcycle_repair"]'],
    "comida": ['["amenity"="restaurant"]', '["amenity"="fast_food"]', '["amenity"="cafe"]', '["shop"="bakery"]', '["amenity"="ice_cream"]'],
    "pousada": ['["tourism"="guest_house"]', '["tourism"="hotel"]', '["tourism"="hostel"]'],
    "academia": ['["leisure"="fitness_centre"]', '["leisure"="sports_centre"]["sport"~"martial|fitness|crossfit",i]'],
    "loja": ['["shop"="clothes"]', '["shop"="shoes"]', '["shop"="gift"]', '["shop"="boutique"]', '["shop"="jewelry"]'],
    "hortifruti": ['["shop"="greengrocer"]', '["shop"="convenience"]'],
    "corretor": ['["office"="estate_agent"]'],
}


def consulta(cidade: str, tipos: list[str]) -> str:
    filtros = []
    for t in tipos:
        for f in TIPOS[t]:
            filtros.append(f'  nwr{f}["name"](area.a);')
    return (
        "[out:json][timeout:90];\n"
        f'area["name"="{cidade}"]["boundary"="administrative"]->.a;\n'
        "(\n" + "\n".join(filtros) + "\n);\nout center tags;"
    )


def baixar(q: str) -> dict:
    corpo = urllib.parse.urlencode({"data": q}).encode()
    erro = None
    for url in OVERPASS:
        for tentativa in range(3):
            try:
                req = urllib.request.Request(url, data=corpo, headers={"User-Agent": "bn-digital-agente/1.0"})
                with urllib.request.urlopen(req, timeout=120) as r:
                    return json.load(r)
            except Exception as e:  # rede instável ou servidor ocupado
                erro = e
                time.sleep(2 ** (tentativa + 1))
    sys.exit(f"Não consegui falar com o OpenStreetMap ({erro}). Use a pesquisa na web.")


def casa(tags: dict, filtro: str) -> bool:
    """Confere um filtro simples do tipo ["k"="v"], ["k"~"regex",i] ou ["k"!~"regex",i]."""
    import re
    for parte in re.findall(r'\[([^\]]+)\]', filtro):
        m = re.match(r'"([^"]+)"\s*(!~|~|=)\s*"([^"]*)"(,i)?', parte)
        if not m:
            continue
        k, op, v, _ = m.groups()
        valor = tags.get(k, "")
        if op == "=" and valor != v:
            return False
        if op == "~" and not re.search(v, valor, re.I):
            return False
        if op == "!~" and re.search(v, valor, re.I):
            return False
    return True


def classificar(tags: dict, pedidos: list[str]) -> str:
    for t in pedidos:
        if any(casa(tags, f) for f in TIPOS[t]):
            return t
    return pedidos[0]


def para_lead(el: dict, cidade: str, pedidos: list[str]) -> dict:
    t = el.get("tags", {})
    tel = t.get("contact:whatsapp") or t.get("phone") or t.get("contact:phone") or t.get("contact:mobile") or ""
    tel = tel.split(";")[0]
    ig = t.get("contact:instagram", "").rstrip("/").split("/")[-1].lstrip("@")
    fb = t.get("contact:facebook", "")
    site = t.get("website") or t.get("contact:website") or ""
    if "instagram.com" in site and not ig:
        ig = site.rstrip("/").split("/")[-1]
    if "facebook.com" in site and not fb:
        fb = site
    rua = " ".join(x for x in [t.get("addr:street", ""), t.get("addr:housenumber", "")] if x)
    bairro = t.get("addr:suburb", "")
    centro = el.get("center") or {"lat": el.get("lat"), "lon": el.get("lon")}
    return {
        "nome": t.get("name", "").strip(),
        "tipo": classificar(t, pedidos),
        "cidade": f"{cidade} ({bairro})" if bairro else cidade,
        "endereco": rua,
        "wa": tel,
        "ig": ig,
        "fb": fb,
        "email": t.get("email") or t.get("contact:email") or "",
        "site": site,
        "src": f"https://www.openstreetmap.org/{el['type']}/{el['id']}",
        "obs": "Achado no OpenStreetMap: confirmar telefone e se ainda funciona."
               + (f" Horário: {t['opening_hours']}." if t.get("opening_hours") else ""),
        "lat": centro.get("lat"),
        "lon": centro.get("lon"),
    }


def main(argv=None):
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("--cidade", required=True)
    p.add_argument("--tipos", default="barbearia,salao,pet,oficina,comida,pousada",
                   help="separados por vírgula: " + ", ".join(TIPOS))
    p.add_argument("--arquivo", help="resposta do Overpass já salva (sem internet)")
    p.add_argument("--mostrar-consulta", action="store_true")
    a = p.parse_args(argv)

    pedidos = [t.strip() for t in a.tipos.split(",") if t.strip()]
    ruins = [t for t in pedidos if t not in TIPOS]
    if ruins:
        sys.exit(f"Tipos desconhecidos: {ruins}. Use: {', '.join(TIPOS)}")
    q = consulta(a.cidade, pedidos)
    if a.mostrar_consulta:
        print(q)
        return
    dados = json.load(open(a.arquivo, encoding="utf-8")) if a.arquivo else baixar(q)

    vistos, leads = set(), []
    for el in dados.get("elements", []):
        l = para_lead(el, a.cidade, pedidos)
        k = l["nome"].lower()
        if l["nome"] and k not in vistos:
            vistos.add(k)
            leads.append(l)
    json.dump(leads, sys.stdout, ensure_ascii=False, indent=1)
    print(f"\n{len(leads)} comércios em {a.cidade}.", file=sys.stderr)


if __name__ == "__main__":
    main()

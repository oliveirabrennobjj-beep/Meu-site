#!/usr/bin/env python3
"""Busca no acervo do prompts.chat (data/prompts.csv), sem internet.

Uso:
  buscar.py "code review"              # 10 melhores resultados (título + início)
  buscar.py "logo" --tipo IMAGE -n 5   # filtra por tipo: TEXT, STRUCTURED, IMAGE
  buscar.py "marketing" --dev          # só prompts marcados para desenvolvedores
  buscar.py --ver "Linux Terminal"     # mostra o prompt inteiro pelo título exato
"""
import argparse
import csv
import sys
import unicodedata
from pathlib import Path

CSV = Path(__file__).resolve().parent.parent / "data" / "prompts.csv"


def normalizar(texto):
    sem_acento = unicodedata.normalize("NFKD", texto)
    return "".join(c for c in sem_acento if not unicodedata.combining(c)).lower()


def carregar():
    csv.field_size_limit(sys.maxsize)
    with CSV.open(encoding="utf-8") as f:
        return list(csv.DictReader(f))


def pontuar(prompt, termos):
    titulo = normalizar(prompt["act"])
    corpo = normalizar(prompt["prompt"])
    pontos = 0
    for termo in termos:
        if termo in titulo:
            pontos += 5
        pontos += min(corpo.count(termo), 5)
    # Exige que todos os termos apareçam em algum lugar
    if not all(t in titulo or t in corpo for t in termos):
        return 0
    return pontos


def main():
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("consulta", nargs="?", default="")
    p.add_argument("-n", type=int, default=10, help="quantidade de resultados (padrão 10)")
    p.add_argument("--tipo", choices=["TEXT", "STRUCTURED", "IMAGE"])
    p.add_argument("--dev", action="store_true", help="só prompts para desenvolvedores")
    p.add_argument("--ver", metavar="TITULO", help="mostra o prompt completo com este título")
    args = p.parse_args()

    prompts = carregar()

    if args.ver:
        alvo = normalizar(args.ver)
        achados = [x for x in prompts if normalizar(x["act"]) == alvo]
        if not achados:
            sys.exit(f"Nenhum prompt com o título exato: {args.ver}")
        for x in achados:
            print(f"# {x['act']}  [{x['type']}]  por {x['contributor'] or 'anônimo'}\n")
            print(x["prompt"])
            print()
        return

    if not args.consulta:
        p.error("informe o que procurar, ou use --ver")

    termos = normalizar(args.consulta).split()
    resultados = []
    for x in prompts:
        if args.tipo and x["type"] != args.tipo:
            continue
        if args.dev and x["for_devs"] != "TRUE":
            continue
        pontos = pontuar(x, termos)
        if pontos:
            resultados.append((pontos, x))

    resultados.sort(key=lambda r: -r[0])
    print(f"{len(resultados)} prompt(s) para '{args.consulta}' (mostrando {min(args.n, len(resultados))})\n")
    for _, x in resultados[: args.n]:
        resumo = " ".join(x["prompt"].split())[:220]
        print(f"- {x['act']}  [{x['type']}]\n  {resumo}…\n")


if __name__ == "__main__":
    main()

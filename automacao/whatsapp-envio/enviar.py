#!/usr/bin/env python3
"""Envio automático de prospecção pelo WhatsApp (Evolution API ou Z-API).

Uso:
  python3 enviar.py leads.json --limite 15            # simulação (não envia nada)
  python3 enviar.py leads.json --limite 15 --enviar   # envia de verdade

Configuração por variáveis de ambiente (a chave fica no ambiente, nunca no repositório):
  WA_PROVEDOR=evolution  WA_URL=https://seu-servidor  WA_INSTANCIA=bn  (chave: header apikey)
  WA_PROVEDOR=zapi       WA_INSTANCIA=<id>  WA_TOKEN=<token>          (chave: header Client-Token)
A chave/headers são injetados pelo proxy do Claude; localmente use WA_CHAVE.

leads.json: lista de {"nome","tipo","cidade","whatsapp","avaliacoes","status"}.
Só envia para status "novo". Grava o resultado em enviados.json ao lado do arquivo de leads.
"""
import argparse, json, os, random, sys, time, urllib.request
from datetime import datetime, timezone
from pathlib import Path

MENSAGEM = (
    "Oi, tudo bem? Aqui é o Brenno, da BN Digital, da região.\n"
    "Vi a {nome} no Google Maps ({avaliacoes} avaliações, parabéns!) e notei que vocês ainda não têm um site próprio.\n"
    "Eu faço sites simples para comércio local: abre rápido no celular, tem botão direto para o WhatsApp e ajuda a aparecer no Google.\n"
    "Posso te mandar um exemplo de como ficaria o da {nome}? Se não fizer sentido agora, sem problema, é só me avisar."
)


def texto(lead):
    return MENSAGEM.format(nome=lead.get("nome") or "sua empresa", avaliacoes=lead.get("avaliacoes") or "várias")


def requisicao(lead_numero, msg):
    prov = os.environ.get("WA_PROVEDOR", "evolution")
    chave = os.environ.get("WA_CHAVE", "dummy")  # o proxy troca pelo valor real
    if prov == "zapi":
        inst, tok = os.environ["WA_INSTANCIA"], os.environ["WA_TOKEN"]
        url = f"https://api.z-api.io/instances/{inst}/token/{tok}/send-text"
        corpo, headers = {"phone": lead_numero, "message": msg}, {"Client-Token": chave}
    else:
        url = f"{os.environ['WA_URL'].rstrip('/')}/message/sendText/{os.environ['WA_INSTANCIA']}"
        corpo, headers = {"number": lead_numero, "text": msg}, {"apikey": chave}
    headers["Content-Type"] = "application/json"
    return urllib.request.Request(url, data=json.dumps(corpo).encode(), headers=headers, method="POST")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("leads")
    ap.add_argument("--limite", type=int, default=15)
    ap.add_argument("--enviar", action="store_true", help="sem isto é só simulação")
    ap.add_argument("--espera-min", type=int, default=120, help="segundos mínimos entre mensagens")
    ap.add_argument("--espera-max", type=int, default=300)
    a = ap.parse_args()

    leads = json.loads(Path(a.leads).read_text(encoding="utf-8"))
    fila = [l for l in leads if l.get("status", "novo") == "novo" and str(l.get("whatsapp", "")).isdigit()]
    fila = fila[: a.limite]
    saida = Path(a.leads).with_name("enviados.json")
    log = json.loads(saida.read_text(encoding="utf-8")) if saida.exists() else []

    for i, lead in enumerate(fila, 1):
        msg = texto(lead)
        quando = datetime.now(timezone.utc).isoformat()
        if not a.enviar:
            print(f"[simulação {i}/{len(fila)}] {lead['nome']} ({lead['whatsapp']}): {msg[:60]}…")
            continue
        try:
            with urllib.request.urlopen(requisicao(lead["whatsapp"], msg), timeout=30) as r:
                ok = 200 <= r.status < 300
        except Exception as e:  # registra e segue para o próximo
            ok = False
            print("erro:", e)
        log.append({"whatsapp": lead["whatsapp"], "nome": lead["nome"], "enviadoEm": quando, "ok": ok})
        saida.write_text(json.dumps(log, ensure_ascii=False, indent=1), encoding="utf-8")
        print(f"[{i}/{len(fila)}] {'ok' if ok else 'FALHOU'} {lead['nome']}")
        if i < len(fila):
            time.sleep(random.randint(a.espera_min, a.espera_max))  # espaçar evita bloqueio

    print(f"Fila: {len(fila)} | modo: {'envio' if a.enviar else 'simulação'}")


if __name__ == "__main__":
    sys.exit(main())

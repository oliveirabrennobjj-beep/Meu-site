---
name: vendas
description: Agente de vendas da BN Digital. Acha comércios no mapa e na web, dá nota, escreve a mensagem citando algo do negócio e responde quem respondeu, até marcar visita. Nenhuma mensagem sai sem aprovação. Use com "/vendas", "/vendas buscar Rio das Ostras", "/vendas responder 12 <texto>", "/vendas mandei 3 5 8", "achar clientes", "prospectar".
---

# /vendas

Siga as instruções de `.claude/agents/vendedor-bn.md` (leia o arquivo inteiro) e trabalhe em `bn-digital/agente`.

## Antes de começar: carregar o CRM

`bn-digital/agente/dados/` não vai pro GitHub (o repositório é público e as conversas são particulares).
Nas sessões na nuvem a pasta começa vazia, então:
1. Se `dados/crm.json` não existir e as ferramentas do Google Drive estiverem disponíveis (procure com ToolSearch "google drive"),
   procure o arquivo `crm-bn-digital.json` no Drive e salve o conteúdo em `dados/crm.json`.
2. Se não achar, rode `python3 crm.py importar ../prospeccao/*.json` (marca as listas antigas como já abordadas).

## O que fazer com cada pedido

| Pedido | Ação |
|---|---|
| `/vendas` (sem nada) | O ciclo completo do agente (fila → responder → lembretes → abordar → buscar se faltar → painel → resumo) |
| `/vendas buscar <cidade> [tipos]` | Só "Como achar leads" e depois escrever os rascunhos dos melhores |
| `/vendas responder <ID ou nome> <texto do cliente>` | `crm.py recebido`, rascunho da resposta, mostra o rascunho no chat |
| `/vendas mandei <IDs>` | `crm.py enviado` pra cada ID |
| `/vendas fila` ou "o que tenho hoje" | `crm.py fila` e resumo |
| `/vendas marcou <ID> <quando>` | `crm.py etapa ID reuniao --nota "<quando>"` e lembrar o roteiro presencial |
| `/vendas fechou <ID> <valor>` | `crm.py etapa ID fechado --nota "<valor>"` |
| `/vendas parar <ID>` | `crm.py etapa ID nao_contatar` |

Se o Brenno colar um print de conversa, leia a imagem, registre cada mensagem nova do cliente com `crm.py recebido` e responda.

## No fim: salvar e mostrar

1. `python3 crm.py painel`.
2. Se o Google Drive estiver disponível, salve `dados/crm.json` no Drive como `crm-bn-digital.json` (atualize o mesmo arquivo, não crie outro).
3. Publique `dados/painel.html` com a ferramenta Artifact (mesmo arquivo de sempre, pra manter o link) para o Brenno abrir no celular. Ele fica privado.
4. Mostre o resumo final do agente.

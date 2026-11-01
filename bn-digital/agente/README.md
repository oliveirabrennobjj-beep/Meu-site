# Agente de vendas da BN Digital

Um vendedor que roda no Claude Code, com a assinatura que você já paga. Ele:

1. **acha comércios** da região no mapa (OpenStreetMap) e na web;
2. **dá uma nota de 0 a 10** pra cada um (sem site, tem WhatsApp, ramo e cidade certos = nota alta);
3. **escreve a primeira mensagem** citando algo daquele negócio;
4. **conversa** com quem responde (preço, dúvida, objeção) até **marcar uma visita**;
5. manda **1 lembrete** pra quem não respondeu em 3 dias e depois desiste.

**Nenhuma mensagem sai sem você.** O agente deixa a mensagem pronta no painel; você toca em "Abrir no WhatsApp", confere e envia.
Isso é de propósito: disparo automático no WhatsApp leva bloqueio do número.

## Como usar (no Claude Code)

| Você digita | O que acontece |
|---|---|
| `/vendas` | Faz o ciclo do dia: responde quem respondeu, prepara lembretes, escreve mensagens novas, busca mais comércios se faltar e gera o painel |
| `/vendas buscar Rio das Ostras barbearia,pet` | Busca comércios nessa cidade e escreve as mensagens dos melhores |
| `/vendas responder 12 Quanto custa a placa?` | Registra o que o cliente disse e escreve a resposta. Também dá pra colar o print da conversa |
| `/vendas mandei 12 15 18` | Marca que você enviou essas mensagens |
| `/vendas marcou 12 sexta 10h` | Registra a visita |
| `/vendas fechou 12 R$ 129` | Venda feita |
| `/vendas parar 12` | A pessoa pediu pra não mandar mais: nunca mais é contatada |

O painel (`dados/painel.html`) abre no celular e mostra, em ordem: quem responder, mensagens para aprovar, visitas, lembretes e quem está esperando.

## Arquivos

| Arquivo | O que é |
|---|---|
| `config.json` | **O que você vende, por quanto, pra quem e onde.** Preço vazio = o agente não fala valor e oferece um modelo. Mude aqui |
| `roteiro-conversa.md` | Regras e respostas que o agente segue (primeira mensagem, lembrete, objeções, quando parar) |
| `crm.py` | O CRM: leads, notas, rascunhos, histórico e painel. Só Python, sem instalar nada |
| `buscar_osm.py` | Busca no OpenStreetMap por cidade e ramo |
| `dados/` | CRM e painel. **Não vai pro GitHub** (o repositório é público). O agente guarda uma cópia no seu Google Drive (`crm-bn-digital.json`) pra não perder entre sessões |
| `../../.claude/agents/vendedor-bn.md` | As instruções do agente |
| `../../.claude/skills/vendas/SKILL.md` | O comando `/vendas` |

## Comandos do CRM (o agente usa; você também pode)

```bash
cd bn-digital/agente
python3 crm.py importar ../prospeccao/*.json        # listas antigas: não aborda de novo
python3 buscar_osm.py --cidade "Casimiro de Abreu" --tipos barbearia,pet > dados/osm.json
python3 crm.py adicionar dados/osm.json             # dá nota e descarta repetidos
python3 crm.py fila                                 # o que fazer agora
python3 crm.py listar --min-nota 7
python3 crm.py ver 12
python3 crm.py rascunho 12 --texto "Oi..." --gancho "barbearia no Centro sem site"
python3 crm.py enviado 12
python3 crm.py recebido 12 --texto "Quanto custa?"
python3 crm.py etapa 12 reuniao --nota "sexta 10h"
python3 crm.py editar 12 wa=22999999999 ig=perfil
python3 crm.py painel
```

Etapas: `novo → rascunho → enviado → respondeu ⇄ conversando → reuniao → fechado`, ou `perdido` / `nao_contatar`.

## Na nuvem

O OpenStreetMap (`overpass-api.de`) pode estar bloqueado na rede do ambiente. Nesse caso o agente busca pela web, ou você libera o endereço nas configurações de rede do ambiente.

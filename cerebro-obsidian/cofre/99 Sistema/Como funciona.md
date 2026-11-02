---
tipo: sistema
tags: ["cerebro/sistema"]
---
# ⚙️ Como funciona

## O que foi instalado no computador

| Onde | O quê |
|---|---|
| `~/.cerebro/cerebro.mjs` | O motor (Node, sem dependências). Busca, registra e reindexa. |
| `~/.cerebro/config.json` | Caminho deste cofre. |
| `~/.claude/settings.json` | Hooks do Claude Code + permissão para ler e escrever neste cofre sem perguntar. |
| `~/.claude/CLAUDE.md` | Bloco curto explicando o combinado (entre `<!-- cerebro:inicio -->` e `<!-- cerebro:fim -->`). |
| `~/.codex/hooks.json` | Os mesmos hooks para o Codex. |
| `~/.codex/config.toml` | Este cofre nas `writable_roots`, para o Codex poder gravar aqui. |
| `~/.codex/AGENTS.md` | O mesmo bloco do CLAUDE.md. |

## Os 4 momentos automáticos

| Quando | O que acontece |
|---|---|
| Abre uma sessão | Cria a nota do projeto se ainda não existir (com a stack detectada) e entrega ao agente a nota do projeto, suas preferências e o combinado. |
| Você manda um pedido | Busca no cofre as notas mais parecidas com o pedido (em todos os projetos) e entrega ao agente, com caminho e resumo. |
| O agente mexe em arquivos | Anota quais arquivos mudaram (para saber que houve entrega). |
| O agente termina | Se houve entrega e ele ainda não registrou nada, o hook pede que ele registre antes de encerrar. Depois grava o diário em `07 Sessões`, a linha do tempo do projeto e refaz o `Índice`. |

Perguntas simples, sem mudar arquivos, não geram registro (para não encher o cofre).

## Comandos úteis (terminal)

```bash
node ~/.cerebro/cerebro.mjs status            # mostra o cofre e quantas notas tem
node ~/.cerebro/cerebro.mjs buscar "whatsapp"  # busca como os agentes buscam
node ~/.cerebro/cerebro.mjs semear ~/projetos  # cria notas para projetos antigos
node ~/.cerebro/cerebro.mjs reindexar          # refaz o Índice
```

## Desligar

Rode o instalador com `--desinstalar`. Ele tira os hooks e os blocos de instrução, e **não apaga** nenhuma nota.

## Segurança

O motor apaga do diário padrões óbvios de senhas, tokens e chaves antes de gravar. Mesmo assim, o cofre fica só no seu computador: não publique a pasta sem olhar antes.

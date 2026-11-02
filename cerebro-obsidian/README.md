# 🧠 Segundo cérebro · Obsidian + Claude Code + Codex

Liga o seu cofre **cérebro** do Obsidian ao Claude Code e ao Codex, em **todos** os projetos do computador:

- **Antes de cada pedido:** o agente recebe sozinho as notas relacionadas, de qualquer projeto (padrões, decisões, preferências, stack, erros já resolvidos).
- **Depois de cada entrega:** o agente registra o que aprendeu e o hook atualiza o índice, a linha do tempo do projeto e o diário do dia.

Você não pede nada. É tudo por hooks, que o próprio Claude Code e o Codex executam.

## Instalar (uma vez, no seu computador)

Precisa do [Node.js](https://nodejs.org) (versão LTS). Se você usa o Codex pelo `npm`, já tem.

1. Baixe esta pasta `cerebro-obsidian` (no GitHub: **Code → Download ZIP**, ou `git pull` se já tem o repositório).
2. **Feche o Obsidian.**
3. Rode o instalador:
   - **Windows:** dois cliques em `instalar.cmd`
   - **Mac:** dois cliques em `instalar.command` (ou `bash instalar.sh` no Terminal)
   - **Linux:** `bash instalar.sh`
4. Ele acha o cofre "cérebro" sozinho (pelo próprio Obsidian). Se não achar, pergunta o caminho.
5. Ele pergunta onde ficam seus projetos, para já criar uma nota para cada um. Aperte Enter para aceitar a sugestão.
6. **No Codex**, uma vez só: digite `/hooks` e confie (*trust*) nos 4 hooks do cérebro. O Codex exige isso para qualquer hook novo.
7. Abra o Obsidian de novo. Pronto.

Para escolher tudo pela linha de comando:

```bash
node instalar.mjs --cofre "C:\Users\voce\Documents\cérebro" --semear "C:\Users\voce\projetos"
```

Rodar de novo é seguro: atualiza sem duplicar. Toda config alterada ganha um backup `*.bak-cerebro-<data>` antes.

## O que aparece no Obsidian

| Cor | Pasta | O que guarda |
|---|---|---|
| 🟦 | `01 Projetos` | Uma nota por projeto (criada sozinha na 1ª vez que você abre o projeto), com stack detectada e linha do tempo |
| 🟩 | `02 Padrões` | Jeitos de fazer que deram certo |
| 🟧 | `03 Decisões` | Escolhas com motivo e alternativas descartadas |
| 🟪 | `04 Preferências` | Seus gostos e jeito de trabalhar |
| 🟨 | `05 Stack` | Ferramentas: uso, versões, pegadinhas |
| 🟥 | `06 Aprendizados` | Erros e como foram resolvidos |
| ⬜ | `07 Sessões` | Diário automático de cada entrega |

As pastas, as tags e o grafo (Ctrl/Cmd + G) ficam nessas cores. A página `00 Início/Início` explica tudo e o `00 Início/Índice` é refeito sozinho.

O cofre já vem com algumas notas tiradas deste repositório (como fazer site de cliente, publicação no GitHub Pages, "nunca inventar dados do cliente", como falar com você). Edite à vontade.

## O que o instalador muda no computador

| Arquivo | Mudança |
|---|---|
| `~/.cerebro/` | O motor (`cerebro.mjs`, sem dependências) e o caminho do cofre |
| `~/.claude/settings.json` | 4 hooks + permissão para ler/escrever no cofre sem perguntar |
| `~/.claude/CLAUDE.md` | Um bloco curto com o combinado |
| `~/.codex/hooks.json` | Os mesmos 4 hooks |
| `~/.codex/config.toml` | O cofre em `writable_roots`, para o Codex poder gravar nele |
| `~/.codex/AGENTS.md` | O mesmo bloco do CLAUDE.md |
| Cofre | Pastas, modelos, cores (`.obsidian/snippets/cerebro.css` e cores do grafo). Notas que já existem não são tocadas |

Os 4 hooks: **SessionStart** (entrega a nota do projeto e suas preferências), **UserPromptSubmit** (busca notas parecidas com o pedido), **PostToolUse** (anota quais arquivos mudaram) e **Stop** (se houve entrega e nada foi registrado, pede o registro uma vez; depois grava diário e índice).

Perguntas que não mudam arquivos não geram registro, para o cofre não encher de ruído.

## Comandos úteis

```bash
node ~/.cerebro/cerebro.mjs status
node ~/.cerebro/cerebro.mjs buscar "whatsapp checkout"
node ~/.cerebro/cerebro.mjs semear ~/projetos     # projetos antigos
node ~/.cerebro/cerebro.mjs reindexar
```

## Desinstalar

`node instalar.mjs --desinstalar` tira hooks, permissões e instruções. **Nenhuma nota é apagada.**

## Testes

`node --test cerebro-obsidian/teste/teste.mjs` instala numa pasta pessoal falsa e simula os hooks do Claude Code e do Codex (início, pedido, edição, fim, reinstalação e desinstalação).

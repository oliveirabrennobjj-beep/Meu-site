---
name: prompts-chat
description: Busca prompts prontos no acervo do prompts.chat (2.600+ prompts em domínio público, CC0), sem internet. Use quando o usuário pedir um prompt pronto, um modelo de prompt, "um prompt para X", quiser melhorar um prompt, ou citar prompts.chat. Também use antes de escrever do zero um prompt longo para outra IA (ChatGPT, Midjourney, Higgsfield, ElevenLabs, Canva): procure primeiro se já existe um bom ponto de partida.
---

# prompts.chat (acervo local)

O arquivo `data/prompts.csv` é uma cópia do acervo do repositório [f/prompts.chat](https://github.com/f/prompts.chat)
(commit `dbb20df`, 2.607 prompts). O conteúdo é de domínio público (CC0, ver `data/LICENSE-CC0`).

O site prompts.chat tem mais prompts e um servidor MCP (`https://prompts.chat/api/mcp`), mas o
ambiente de nuvem do Claude Code bloqueia esse endereço. Por isso a busca aqui é local.

## Como buscar

Os prompts estão em inglês. Traduza os termos do usuário para inglês antes de buscar.

```bash
python3 .claude/skills/prompts-chat/scripts/buscar.py "sales email"          # 10 melhores
python3 .claude/skills/prompts-chat/scripts/buscar.py "logo" --tipo IMAGE    # TEXT, STRUCTURED ou IMAGE
python3 .claude/skills/prompts-chat/scripts/buscar.py "review" --dev -n 5    # só para devs
python3 .claude/skills/prompts-chat/scripts/buscar.py --ver "Linux Terminal" # prompt completo
```

## Como usar o resultado

1. Mostre ao usuário de 3 a 5 opções com o título e uma linha explicando para que serve.
2. Quando ele escolher, abra o prompt completo com `--ver` e **adapte**: traduza para português se
   o destino for em português, troque os exemplos genéricos pelos dados reais do negócio dele e
   preencha variáveis como `${nome}`.
3. Se nada servir, escreva um prompt novo e diga que não havia um pronto no acervo.

## Atualizar o acervo

```bash
git clone --depth 1 https://github.com/f/prompts.chat /tmp/prompts.chat
cp /tmp/prompts.chat/prompts.csv .claude/skills/prompts-chat/data/prompts.csv
```

Numa máquina local (fora da nuvem), dá para usar o servidor MCP completo, com busca no site
inteiro: `/plugin marketplace add f/prompts.chat` e depois `/plugin install prompts.chat@prompts.chat`.

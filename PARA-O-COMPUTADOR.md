# Guardado para quando tiver computador

Coisas que o Brenno pediu e que só funcionam (ou só funcionam inteiras) com o Claude Code instalado num computador.
Na nuvem elas ficam limitadas. Quando o computador chegar, instale tudo desta lista.

| O quê | Pedido em | Por que precisa do computador | Como instalar no computador |
|---|---|---|---|
| **Concat** (editor de vídeo) — github.com/jub0t/Concat | 06/11/2026 | É um programa de desktop; o Claude edita através dele (`concat --mcp`). | Baixar em concat.standalones.org e rodar `claude mcp add concat -- <caminho do concat> --mcp` (ver `.claude/skills/concat-video/SKILL.md`). |
| **Watch** (Claude assistir vídeo) — github.com/bradautomates/claude-video | 06/11/2026 | Na nuvem a rede bloqueia o YouTube/TikTok/Instagram, então links não baixam. Vídeo enviado como arquivo funciona na nuvem. | Já fica ligado pelo `.claude/settings.json` do projeto. No computador: instalar `ffmpeg` e `yt-dlp`. |

## Já funcionam na nuvem (não precisa esperar)

Caveman, Ponytail, Superpowers, Graphify, Remotion, e o Watch com arquivo de vídeo enviado.

## Regra

Toda skill ou ferramenta nova que só funcione no computador entra nesta tabela, com a data e o motivo.

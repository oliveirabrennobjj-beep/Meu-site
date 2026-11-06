---
name: concat-video
description: Editar vídeo com o Concat (editor de vídeo grátis, jub0t/Concat) pelo servidor MCP dele. Use quando o Brenno pedir para cortar, legendar, montar ou exportar vídeo (Reels, TikTok, Shorts) e as ferramentas mcp__concat__* estiverem disponíveis, ou quando ele perguntar como ligar o Concat ao Claude.
---

# Concat: edição de vídeo pelo Claude

O Concat é um app de desktop (macOS, Windows, Linux, Android). Ele traz um servidor MCP: `concat --mcp`.
Referência completa das ferramentas: `MCP.md` nesta pasta.

## Ligar (no computador do Brenno, uma vez)

1. Baixar e instalar: https://concat.standalones.org/#download
2. No Claude Code do computador: `claude mcp add concat -- <caminho do concat> --mcp`
   - Windows: `%LOCALAPPDATA%\Programs\Concat\concat.exe`
   - macOS: `/Applications/Concat.app/Contents/MacOS/concat`
   - Linux: `/usr/bin/concat`
3. Para editar com o app aberto: Settings > Automation > Scripts and apps ligado.

Nas sessões na nuvem o Concat não está instalado: aí use Remotion/ffmpeg (skills remotion-*).

## Fluxo de um Reel

1. `project_create` (vertical 1080x1920, 30 fps) → `project_set_video` se precisar.
2. `media_probe` e `media_import` dos arquivos.
3. `clips_add_sequence` para montar; `clip_trim` / `clips_split` / `clips_remove` para cortar silêncio e erros.
4. `captions_add` (legenda automática) e `title_add` (gancho nos 3 primeiros segundos); `title_style_words` para destacar palavras.
5. `keyframe_set` para zoom/movimento; `effect_layer_add` com o que `effects_list` mostrar.
6. `preview_frame` para conferir quadros-chave antes de exportar.
7. `project_save`, depois `export_start` + `export_wait`.

## Regras

- Tempos em segundos; posição de keyframe é fração do clipe (0 a 1); tamanhos são fração do quadro.
- Edição fica na memória até `project_save`.
- O agente só grava arquivos dentro da pasta do usuário.
- Não abrir um projeto que está aberto na janela do app: usar modo `--mcp window`.

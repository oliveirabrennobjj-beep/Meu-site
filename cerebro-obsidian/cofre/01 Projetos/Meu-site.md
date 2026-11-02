---
tipo: projeto
caminho: ""
stack: ["HTML/CSS/JS estático", "Vite", "React", "Tailwind CSS", "TypeScript", "Playwright", "GitHub Actions", "Remotion"]
tags: ["cerebro/projeto"]
criado: 2026-11-02
atualizado: 2026-11-02
resumo: "Repositório da BN Digital: sites de clientes (um por pasta), site da agência e da BR Team, publicados no GitHub Pages."
---
# Meu-site

## O que é
Repositório principal da **BN Digital** (agência de sites do Brenno). Cada cliente ganha uma pasta própria na raiz (`padaria/`, `hortifruti/`, `acai-do-rei/`…). O site da agência fica em `bn-digital/` e o da academia BR Team em `brteam/` (os dois em Vite + React).

Publicado em <https://oliveirabrennobjj-beep.github.io/Meu-site/>.

## Stack
- [[HTML-CSS-JS estático]] para sites de clientes (sem build)
- [[Vite]] + [[React]] + [[Tailwind CSS]] em `bn-digital/` e `brteam/`
- [[Playwright]] para testes e capturas de tela
- [[GitHub Actions]] publica no GitHub Pages
- [[Remotion]] para vídeos de apresentação (`como-funciona/`)

## Como rodar
- Site estático: `python3 -m http.server 8000` na pasta e abrir <http://localhost:8000>.
- Capturas de um site novo: `node .claude/skills/site-bn-digital/scripts/capturas.mjs <pasta>`.

## Decisões, padrões e aprendizados
- [[Site de cliente em HTML puro com config.js]]
- [[Publicar site novo no GitHub Pages do Meu-site]]
- [[Fotos em WebP com srcset e lazy]]
- [[Checklist de site para comércio local]]
- [[Nunca inventar dados do cliente]]
- [[Como falar com o Brenno]]

## Linha do tempo
- 2026-11-02 · cérebro criado no Obsidian e ligado ao Claude Code e ao Codex

---
tipo: decisao
projetos: ["[[Meu-site]]"]
tags: ["cerebro/decisao", "deploy", "github-pages"]
criado: 2026-11-02
atualizado: 2026-11-02
resumo: "Sites de clientes vão para oliveirabrennobjj-beep.github.io/Meu-site/<pasta>/ via workflow publicar-bn-digital.yml, por PR."
---
# Publicar site novo no GitHub Pages do Meu-site

## Decisão
Cada site fica em `https://oliveirabrennobjj-beep.github.io/Meu-site/<pasta>/`. O workflow `.github/workflows/publicar-bn-digital.yml` junta os sites em `_site/`.

## Como
1. No passo "Junta os sites": `mkdir -p _site/<pasta> && cp -r <pasta>/. _site/<pasta>/`.
2. Em `on.push.paths`: `<pasta>/**`.
3. Branch `claude/site-<pasta>` → PR para `main`. O Brenno faz o merge pelo celular; o link funciona depois do merge.

## Motivo
Hospedagem grátis, um link por cliente para mandar no WhatsApp, e tudo num repositório só.

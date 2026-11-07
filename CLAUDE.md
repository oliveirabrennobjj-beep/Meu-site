# Como responder ao Brenno

- Respostas curtas. No máximo 5 linhas, salvo se ele pedir detalhe.
- Sem introdução, sem repetir o pedido, sem resumo no fim.
- Diga só: o que foi feito, o link ou arquivo, e o que falta ou precisa da decisão dele.
- Listas curtas em vez de parágrafos. Nada de explicar código que ele não pediu.
- Não carregue skills que não servem para a tarefa. Teste uma vez, não em loop.
- Sempre use a skill `caveman` (modo curto) desde a primeira resposta, em português.
- Use as skills do Superpowers quando servirem: `brainstorming` antes de criar algo novo, `systematic-debugging` em bugs, `verification-before-completion` antes de dizer que terminou.

# Skills obrigatórias por tipo de pedido

O Brenno instalou estas skills para serem usadas. Antes de começar, carregue (Skill tool) as da linha que bate com o pedido. Não pule por achar que já sabe fazer.

| Pedido | Carregar |
|---|---|
| Qualquer resposta | `caveman` |
| Site novo para cliente | `site-bn-digital`, `brainstorming`, `frontend-design` (ou `impeccable`), `copywriting` |
| Mexer no visual de site existente | `impeccable` (ou `frontend-design`), `web-design-guidelines` |
| Logo, marca, banner, post | `brand`, `design`, `banner-design` |
| Textos de venda, títulos | `copywriting` |
| SEO, aparecer no Google | `seo-audit` |
| Erro, bug, algo quebrado | `systematic-debugging` (ou `investigate-first`) |
| Mudança grande em código | `writing-plans`, depois `executing-plans` |
| Vídeo do projeto para divulgar | `brag` ou `brag-slim`; vídeo programado: `remotion-best-practices` |
| Assistir vídeo (YouTube etc.) | `watch` |
| Word, PDF, PowerPoint, Excel | `docx`, `pdf`, `pptx`, `xlsx` |
| Instalar skill ou plugin | `find-skills`; ler o código antes de instalar |
| Commit | `caveman-commit` |
| Antes de dizer "pronto" | `verification-before-completion` |

Quando o Brenno mandar print de uma skill ou plugin para instalar: instale em `.claude/skills/` com `npx skills add <dono/repo>`, revise o código e acrescente a skill nesta tabela.

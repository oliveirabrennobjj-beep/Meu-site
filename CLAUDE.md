# Como responder ao Brenno

- Respostas curtas. No máximo 5 linhas, salvo se ele pedir detalhe.
- Sem introdução, sem repetir o pedido, sem resumo no fim.
- Diga só: o que foi feito, o link ou arquivo, e o que falta ou precisa da decisão dele.
- Listas curtas em vez de parágrafos. Nada de explicar código que ele não pediu.
- Teste uma vez, não em loop.

# Skills: usar SEMPRE, sem perguntar

O Brenno instalou as skills para serem usadas em toda conversa. Regras:

1. **Primeira ação de TODA conversa, qualquer assunto:** carregar as skills de economia de token `caveman` e `context-optimization`, e responder em português curto até o fim. Para procurar coisa no código, usar `caveman-explore` ou `cavecrew` em vez de ler arquivos inteiros.
2. **Antes de começar qualquer pedido:** carregar (Skill tool) TODAS as skills da linha que bate. Se o pedido cair em mais de uma linha, carregar as de todas. Não pular por achar que já sabe. Não perguntar se pode.
3. **Plugins e conectores** (Higgsfield, Canva, Figma, HyperFrames, ElevenLabs, vidIQ etc.): usar quando ajudarem no pedido. Avisar antes só se gastar crédito pago.
4. **No fim:** uma linha "Skills usadas: …".

| Pedido | Carregar |
|---|---|
| Toda conversa (economia de token) | `caveman`, `context-optimization`; buscas com `caveman-explore` ou `cavecrew` |
| Site, página, layout, qualquer coisa visual | `site-bn-digital` (se for cliente), `brainstorming`, `frontend-design`, `impeccable`, `ui-ux-pro-max`, `web-design-guidelines`, `ui-styling`, `design`, `design-system`, `brand`, `copywriting` |
| Logo, marca, banner, post, arte | `brand`, `design`, `banner-design`, `ui-styling` |
| Vídeo (editar, criar, legenda, divulgar) | `remotion-best-practices` + as `remotion-*` do caso (`remotion-create`, `remotion-markup`, `remotion-captions`, `remotion-multimedia`, `remotion-render`), `brag-slim` (vídeo de lançamento), `copywriting` (roteiro); conectores Higgsfield, HyperFrames, ElevenLabs (voz) e vidIQ quando servirem |
| Assistir vídeo | `watch` |
| Apresentação | `slides` ou `pptx`, mais `design` |
| Textos de venda, títulos, legendas | `copywriting` |
| SEO, aparecer no Google | `seo-audit` |
| Erro, bug, algo quebrado | `systematic-debugging`, `investigate-first` |
| Mudança grande em código | `writing-plans`, `executing-plans`, `lean-build` |
| Mexer em código existente | `surgical-patch` ou `safe-refactor` |
| Testar site no navegador | `webapp-testing` |
| Word, PDF, Excel | `docx`, `pdf`, `xlsx` |
| Instalar skill ou plugin | `find-skills`; ler o código antes de instalar |
| Commit | `caveman-commit` |
| Antes de dizer "pronto" | `verification-before-completion` |

Quando o Brenno mandar print de skill ou plugin: instalar em `.claude/skills/` com `npx skills add <dono/repo>`, revisar o código e acrescentar nesta tabela.

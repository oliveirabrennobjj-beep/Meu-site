# Skills do Claude Code neste projeto

Todas as skills ficam em `.claude/skills/` (escopo de projeto, versionadas no Git).
Instaladas em 2026-10-03 a partir das fontes abaixo.

## Procedência

| Skill(s) | Fonte (commit) | Método |
|---|---|---|
| find-skills | vercel-labs/skills (`18f96ea`) | `npx skills add vercel-labs/skills --skill find-skills -a claude-code --copy -y` |
| frontend-design, skill-creator, docx, xlsx, pptx, pdf | anthropics/skills (`8a1541c`) | `npx skills add anthropics/skills --skill … -a claude-code --copy -y` |
| copywriting, seo-audit | coreyhaines31/marketingskills (`dda3841`) | `npx skills add coreyhaines31/marketingskills --skill … -a claude-code --copy -y` |
| remotion-* (12 skills; `remotion-best-practices` é o roteador) | remotion-dev/skills (`0b5db9d`) | `npx skills add remotion-dev/skills --skill '*' -a claude-code --copy -y` |
| context-optimization | muratcankoylan/Agent-Skills-for-Context-Engineering (`58b55a8`) | Cópia manual documentada no README da fonte (`cp -R skills/context-optimization .claude/skills/`); o CLI `skills` só enxerga o SKILL.md raiz desse repositório |
| web-design-guidelines | vercel-labs/agent-skills (`063bee9`, v1.0.0) | `npx skills add vercel-labs/agent-skills --skill web-design-guidelines -a claude-code --copy -y` (o README oficial usa `npx skills add vercel-labs/agent-skills`; `--skill` limita à skill escolhida) |
| webapp-testing | anthropics/skills (`8a1541c`) | `npx skills add anthropics/skills --skill webapp-testing -a claude-code --copy -y`. O README oficial indica o marketplace (`/plugin install example-skills@anthropic-agent-skills`), mas isso instala o pacote `example-skills` inteiro no escopo do usuário; o CLI instala só esta skill, no projeto |
| impeccable + `.claude/agents/impeccable-*.md` | pbakaus/impeccable (`e103efe`, skill v4.5.0) | Cópia da build para Claude Code commitada no repositório da fonte (`.claude/skills/impeccable` e `.claude/agents/`). Ver observações |
| brag, brag-slim | latent-spaces/brag (`069432c`, v0.4.0) | `npx skills add latent-spaces/brag -a claude-code --copy -y` (2026-10-14). Revisada antes: só instruções em Markdown, músicas/efeitos e um script Python de análise de batidas (`librosa`), sem acesso à rede nem hooks. No Opus 5.5 o `/brag` passa para o `/brag-slim`. As músicas incluídas não têm licença confirmada (o README da fonte avisa); o vídeo da BN Digital usa trilha original |
| brainstorming, verification-before-completion | obra/superpowers (`bb92a77`, v7.0.0) | `npx skills add obra/superpowers --skill brainstorming --skill verification-before-completion -a claude-code --copy -y` (2026-10-14). Revisadas antes: o `brainstorming` traz um servidor local (só `localhost`, com token) para mostrar rascunhos no navegador |

| hyperframes, hyperframes-cli, media-use | heygen-com/hyperframes (`443ded4`) | `npx skills add heygen-com/hyperframes --skill hyperframes --skill hyperframes-cli --skill media-use -a claude-code --copy -y` (2026-10-30). `hyperframes-cli` entrou junto porque a `hyperframes` manda usá-la. Revisadas antes: o `media-use` traz efeitos sonoros e scripts Node que só falam com HeyGen, Openverse, Wikimedia, Internet Archive e museus (busca de mídia livre) |
| research, grilling | mattpocock/skills (`a496f55`) | `npx skills add mattpocock/skills --skill research --skill grilling -a claude-code --copy -y` (2026-10-30). Só instruções |
| design-mobile-apps | designed-by-ai/skills (`03c20ae`) | `npx skills add designed-by-ai/skills --skill design-mobile-apps -a claude-code --copy -y` (2026-10-30). Só instruções; usa o serviço Sleek |
| design-taste-frontend | leonxlnx/taste-skill (`12af471`, v2) | `npx skills add leonxlnx/taste-skill --skill design-taste-frontend -a claude-code --copy -y` (2026-10-30). Revisada antes: scripts Node que abrem o Chrome local (sem npm install) para tirar prints e conferir a página. A antiga `high-end-visual-design` não existe mais: virou parte desta |
| apple-design | emilkowalski/skills (`a81dbca`) | `npx skills add emilkowalski/skills --skill apple-design -a claude-code --copy -y` (2026-10-30). Só instruções |
| agent-browser | vercel-labs/agent-browser (`f7a4cde`) | `npx skills add vercel-labs/agent-browser --skill agent-browser -a claude-code --copy -y` (2026-10-30). É só um atalho: o conteúdo vem do CLI `agent-browser` |
| marketing-ideas, marketing-psychology | coreyhaines31/marketingskills (`820ad2c`) | `npx skills add coreyhaines31/marketingskills --skill marketing-ideas --skill marketing-psychology -a claude-code --copy -y` (2026-10-30). Só instruções |
| ai-video-generation, ai-image-generation, ai-avatar-video | `101-skills/superpowers`, `magentosh/superpowers`, `qu-skills/superpowers` (os três no commit `becc256`) | `npx skills add https://github.com/<repo> --skill <nome> -a claude-code --copy -y` (2026-10-30, a pedido do Brenno, que achou no skills.sh). Os três repositórios são cópias idênticas do `inference-sh/skills` com o nome "superpowers" (não têm relação com o `obra/superpowers`). Só instruções em Markdown; para funcionar precisam do CLI `belt` da inference.sh (`curl -fsSL cli.inference.sh \| sh`, depois `belt login`, conta paga) |
| obra-superpowers-brainstorming | openakita/openakita (`5f5b38d`) | `npx skills add https://github.com/openakita/openakita --skill obra/superpowers@brainstorming -a claude-code --copy -y` (2026-10-30). Versão antiga e mais curta da `brainstorming` (que continua instalada, vinda do `obra/superpowers`). Só instruções |
| caveman | juliusbrussee/caveman (`9b68f7e`) | `npx skills add https://github.com/juliusbrussee/caveman --skill caveman -a claude-code --copy -y` (2026-10-30). Só instruções: respostas curtas até dizer "stop caveman" |
| headroom | roman-ryzenadvanced/headroom-skill (`118466d`) | `npx skills add https://github.com/roman-ryzenadvanced/headroom-skill --skill headroom -a claude-code --copy -y` (2026-10-30). Revisada: instruções + scripts Python locais de compressão de saída, sem rede |
| hallmark | nutlope/hallmark (`4f6a46c`) | `npx skills add https://github.com/nutlope/hallmark --skill hallmark -a claude-code --copy -y` (2026-10-30). Revisada: instruções, temas e lista de fotos (Wikimedia, Google Fonts, Fontshare) |
| humanizer-zh | op7418/humanizer-zh (`f4518a8`) | `npx skills add https://github.com/op7418/humanizer-zh --skill humanizer-zh -a claude-code --copy -y` (2026-10-30). Só instruções; é para texto em **chinês** (para português, use a `copywriting`) |
| setup-matt-pocock-skills, grill-with-docs | mattpocock/skills (`a496f55`) | `npx skills add https://github.com/mattpocock/skills --skill setup-matt-pocock-skills --skill grill-with-docs -a claude-code --copy -y` (2026-10-30). Só instruções |
| karpathy-guidelines | szkocot/andrej-karpathy-skills (`64723a4`) | `npx skills add https://github.com/szkocot/andrej-karpathy-skills --skill karpathy-guidelines -a claude-code --copy -y` (2026-10-30). Só instruções; mesmas regras do plugin `andrej-karpathy-skills` já ligado |
| last30days | mvanhorn/last30days-skill (`7efc0ef`) | `npx skills add https://github.com/mvanhorn/last30days-skill --skill last30days -a claude-code --copy -y` (2026-10-30). Revisada: script Python que pesquisa Reddit, X, YouTube, Hacker News, TikTok/Instagram etc. dos últimos 30 dias. Grátis só em parte; o resto pede chaves (`SCRAPECREATORS_API_KEY`, `XAI_API_KEY`, `OPENAI_API_KEY`…), que gastam créditos |
| humanizer | blader/humanizer (`0ef9fe5`, v3.1.0) | `npx skills add https://github.com/blader/humanizer --skill humanizer -a claude-code --copy -y` (2026-10-30). Só instruções: tira de textos os vícios de escrita de IA (contrastes "não é X, é Y", travessões, trios forçados, palavras infladas). Versão geral da `humanizer-zh` |

### Da lista do reel, não instaladas (2026-10-30)

- `heygen-com/hyperframes --skill general-video`: o CLI responde "No matching skills found"; o repositório não tem essa skill. A `hyperframes` cobre vídeo em geral.
- `leonxlnx/taste-skill --skill high-end-visual-design`: também não existe mais; virou parte da `design-taste-frontend`.
- `find-skills`, `frontend-design`, `web-design-guidelines`, `remotion-best-practices`: já estavam instaladas.

Pré-existentes e preservadas sem alteração: ui-ux-pro-max, banner-design, brand, design, design-system, slides, ui-styling.

`skills-lock.json` (raiz) é gerado pelo CLI `skills` e permite `npx skills update -p`.
Ele **não** lista `impeccable` nem `context-optimization`, que foram instaladas manualmente.

Os arquivos das skills são cópias idênticas das fontes, sem edições locais.

### Adiada: vercel-react-best-practices

Fica para depois. Em 2026-10-03 o site ainda não tinha tecnologia definida (não havia `package.json`, nem React ou Next.js).
Quando o projeto adotar React ou Next.js, instale com:
`npx skills add vercel-labs/agent-skills --skill vercel-react-best-practices -a claude-code --copy -y`
(no repositório, a pasta é `skills/react-best-practices`, mas o nome da skill é `vercel-react-best-practices`).

## Observações

- **Impeccable**: `npx impeccable install` falhou neste ambiente (o host `impeccable.style` está bloqueado pela política de rede, e o download do bundle assinado retornou 403).
  `npx skills add pbakaus/impeccable` instala a variante universal `.agents/`, cujos caminhos internos apontam para `.agents/skills/impeccable/...`, então foi substituída pela build específica do Claude.
  O hook automático do Impeccable (detector após Edit/Write e no Stop) **não** foi instalado. Para ativá-lo numa máquina local: `npx impeccable install --providers=claude --scope=project` (ele grava em `.claude/settings.local.json`, que é local e não versionado).
  O launcher `scripts/impeccable` baixa o engine para `~/.impeccable/bin/` na primeira execução.
- Atualizar o Impeccable: rode `npx impeccable update` localmente, ou copie de novo `.claude/skills/impeccable` e `.claude/agents/impeccable-*.md` da fonte.

## Dependências por skill

| Skill | Precisa de |
|---|---|
| docx | Node + pacote `docx`; Python (`defusedxml`, `lxml`); pandoc; LibreOffice (`soffice`) para conversões e PDF; poppler (`pdftoppm`) |
| xlsx | Python `openpyxl`, `pandas`; LibreOffice **com Calc** para `scripts/recalc.py` |
| pptx | Node + `pptxgenjs`; Python `markitdown[pptx]`, `python-pptx`; LibreOffice **com Impress** e `pdftoppm` para `thumbnail.py` |
| pdf | Python `pypdf`, `pdfplumber`, `reportlab`; `qpdf`, `pdftotext`; OCR opcional: `pytesseract`, `pdf2image`, tesseract |
| skill-creator | Python 3 + `pyyaml`; `run_eval`/`improve_description` usam o CLI `claude` |
| remotion-* | Node 18+, um projeto Remotion (`npx create-video@latest`); render baixa o Chrome Headless Shell; `remotion-docs` consulta remotion.dev/Algolia |
| find-skills | Node + `npx skills`; busca usa a API de skills.sh |
| impeccable | Engine baixado pelo launcher; `detect` em URL usa Chrome/Chromium |
| context-optimization | Python 3 (script de demonstração sem dependências externas) |
| copywriting, seo-audit, frontend-design | Somente instruções; seo-audit fica melhor com acesso web |
| hyperframes, hyperframes-cli, media-use | Node + `npx hyperframes` (baixa o pacote na primeira vez); Chrome para renderizar; HeyGen (conta, `npx hyperframes auth login`) é opcional, há caminho grátis local |
| design-taste-frontend | Node 22+ e Chrome/Chromium local (`CHROME_PATH=/opt/pw-browsers/chromium-*/chrome-linux/chrome` na nuvem, se não achar sozinho) |
| ai-video-generation, ai-image-generation, ai-avatar-video | CLI `belt` da inference.sh + conta (`belt login`) |
| agent-browser | CLI: `npm i -g agent-browser && agent-browser install` (não vem instalado; reinstalar a cada sessão na nuvem) |
| design-mobile-apps | `SLEEK_API_KEY` (conta em sleek.design) |
| research, grilling, apple-design, marketing-ideas, marketing-psychology | Somente instruções |
| web-design-guidelines | Somente instruções. A cada revisão, busca as regras em `https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md` (precisa de acesso web) |
| webapp-testing | Python 3 + pacote **Python** `playwright` (o pacote Node não serve: os exemplos e `scripts/with_server.py` são Python) e um Chromium compatível com a versão do Playwright |

## Preparar o webapp-testing numa nova sessão

Pacotes Python e navegadores **não** ficam no Git; reinstale a cada sessão nova (containers da nuvem são descartados).

**Nuvem (Claude Code na web).** O Chromium já vem em `/opt/pw-browsers` (`PLAYWRIGHT_BROWSERS_PATH` já definido) na revisão `chromium-1194`, a mesma do Playwright **1.56**. Fixe a versão para não precisar baixar navegador (`playwright install` não deve ser usado nesse ambiente):

```bash
python3 -m venv /tmp/pw-venv
/tmp/pw-venv/bin/pip install playwright==1.56.0
/tmp/pw-venv/bin/python -m playwright install --dry-run chromium   # deve apontar para /opt/pw-browsers/chromium-1194
```

Se a imagem do ambiente mudar, confira a revisão em `ls /opt/pw-browsers` e ajuste a versão do Playwright. O venv fica fora do repositório; se preferir criar dentro do projeto, use `.venv/`, que já está no `.gitignore`.

**Máquina local.**

```bash
python3 -m venv .venv && .venv/bin/pip install playwright
.venv/bin/python -m playwright install chromium
```

**Automático na nuvem.** O hook SessionStart `.claude/hooks/session-start.sh` (registrado em `.claude/settings.json`) faz isso sozinho: cria `.venv/` no projeto, instala `playwright==1.56.0` se faltar e põe `.venv/bin` no PATH, então `python` já importa o Playwright. Só roda quando `CLAUDE_CODE_REMOTE=true`; em máquina local não faz nada. Se a revisão do Chromium em `/opt/pw-browsers` mudar, o hook avisa e basta ajustar `PLAYWRIGHT_VERSION` nele.

### Estado verificado em 2026-10-03 (nuvem)

- **Skill instalada:** sim (`.claude/skills/webapp-testing`, idêntica à fonte).
- **Recurso testado e funcionando:** sim, depois de instalar o Playwright Python 1.56.0 num venv temporário. Esse Python **não** vem pré-instalado, só o pacote Node `playwright@1.56.1` e o Chromium.
  Teste: `scripts/with_server.py` subiu `python3 -m http.server` com uma página HTML de teste; o Chromium headless 141.0.7390.37 carregou a página, clicou num botão, conferiu o texto, capturou o `console.log` e salvou uma captura de tela.
- **Bloqueio encontrado (bug do script upstream, não do ambiente):** `with_server.py` inicia o servidor com `shell=True` e, no fim, encerra só o `/bin/sh`. O servidor fica órfão, ainda ocupando a porta, e com os pipes fechados. Na próxima execução na mesma porta, o helper acha que o servidor está pronto, e a página falha com `net::ERR_EMPTY_RESPONSE`.
  **Contorno validado** (duas execuções seguidas, sem órfãos): começar o comando do servidor com `exec`, por exemplo `--server "exec npm run dev"`. Para comandos com `cd … &&`, use `--server "cd web && exec npm run dev"`. Para limpar um órfão: `pkill -f '<comando do servidor>'`.
- **web-design-guidelines:** instalada; a URL de regras respondeu HTTP 200 neste ambiente.

## O que não vai para o Git

Ver `.gitignore`: caches Python (`__pycache__/`, `*.pyc`), ambientes virtuais (`.venv/`, `venv/`), `node_modules/`, navegadores do Playwright, relatórios e resultados de teste, além de `.claude/settings.local.json`.
Os 24 arquivos `__pycache__/*.pyc` que tinham sido versionados por engano (em docx, xlsx, pptx e skill-creator) saíram do Git; o Python os recria quando precisa.

## Servidores MCP do projeto (`.mcp.json`)

Adicionados em 2026-10-14, com versão fixa:

| Servidor | Pacote | Para que serve | Precisa de |
|---|---|---|---|
| `chrome-devtools` | `chrome-devtools-mcp@1.10.1` (Google) | Abrir o site num Chrome de verdade, ver console, rede e desempenho | Chrome instalado (roda `--headless --isolated`) |
| `shadcn-ui` | `@jpisnice/shadcn-ui-mcp-server@3.0.0` | Consultar componentes, blocos e exemplos do shadcn/ui | Opcional: `GITHUB_PERSONAL_ACCESS_TOKEN` (sem ele, a API do GitHub limita a 60 consultas/hora) |
| `magic-21st` | Conexão HTTP oficial `https://21st.dev/api/mcp` (trocou o pacote `@21st-dev/magic@0.2.3` em 2026-10-24) | Gerar componentes de interface da 21st.dev | **Obrigatório:** `TWENTY_FIRST_API_KEY` (chave criada em 21st.dev/mcp), enviada no cabeçalho `x-api-key` |

As chaves não vão para o repositório: o `.mcp.json` lê as variáveis de ambiente. Na nuvem, cadastre-as nas variáveis do ambiente; no computador, exporte-as antes de abrir o Claude Code.
Na nuvem, o `magic-21st` também precisa que o domínio `21st.dev` esteja liberado no acesso de rede do ambiente.
Ao abrir o projeto, o Claude Code pergunta se você aprova os servidores do `.mcp.json`.

`frontend-design` e `web-design-guidelines`, citadas nos mesmos vídeos, já estavam instaladas.

## Plugins do projeto (`.claude/settings.json`)

Adicionados em 2026-10-30, a pedido do Brenno. Ficam em `extraKnownMarketplaces` e `enabledPlugins`: toda sessão nova
do Meu-site instala e liga os quatro. Para desligar um, troque `true` por `false` em `enabledPlugins`.

| Plugin | De onde vem | Para que serve |
|---|---|---|
| `superpowers` | `obra/superpowers-marketplace` | Planejar antes de programar, testes primeiro, depuração em etapas. As skills `brainstorming` e `verification-before-completion` desta pasta vêm dele também. |
| `andrej-karpathy-skills` | `forrestchang/andrej-karpathy-skills` | 4 regras: pensar antes de codar, código simples, mexer só no necessário, conferir o resultado. |
| `i-have-adhd` | `ayghri/i-have-adhd` | Respostas que começam pela próxima ação, com passos numerados e sem enrolação. |
| `octo` (Claude Octopus) | `nyldn/plugins` | Manda a mesma tarefa para outras IAs (Codex, Grok, Copilot…) e mostra onde elas discordam. Comece com `/octo:setup`. As outras IAs só entram quando um comando `/octo:*` é usado e podem precisar de conta própria. |

Os quatro rodam um aviso no começo da sessão (hook SessionStart). O Octopus também confere alguns comandos antes de
executar (hooks PreToolUse), por isso é o mais pesado.

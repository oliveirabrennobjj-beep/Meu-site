# Skills do Claude Code neste projeto

Todas as skills ficam em `.claude/skills/` (escopo de projeto, versionadas no Git).
Instaladas a partir de 2026-10-03, das fontes abaixo.

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
| Restante do Superpowers: writing-plans, executing-plans, systematic-debugging, test-driven-development, requesting-code-review, receiving-code-review, subagent-driven-development, dispatching-parallel-agents, using-git-worktrees, finishing-a-development-branch, using-superpowers, writing-skills, diagnosing-superpowers | obra/superpowers (`2ce8aa1`, v7.0.1) | `npx skills add obra/superpowers --skill '*' -a claude-code --copy -y` (2026-10-24). Atualizou o `brainstorming` para a v7.0.1. Revisadas antes: só Markdown e scripts de exemplo; nenhuma faz chamada de rede sozinha |
| founder-board, founder-competitors, founder-consumer, founder-pricing, founder-offer, founder-cfo, founder-marketing, founder-brand, founder-ops, founder-launch, founder-plan | Jakeschincariol/founder-skill (`fd9385b`, MIT) | `npx skills add Jakeschincariol/founder-skill --skill '*' -a claude-code --copy -y` (2026-10-24). Testam um negócio antes do lançamento; ordem de uso no README da fonte. Scripts em Python puro (só biblioteca padrão, sem rede). Gravam o trabalho numa pasta `founder/` |
| video-use (+ `skills/manim-video` dentro dela) | browser-use/video-use (`43cfc56`, MIT) | Cópia do repositório sem `.git` (o README da fonte manda clonar e ligar em `.claude/skills/`; não é instalável pelo CLI `skills`). Edita vídeo por conversa: corta pausas e vícios de fala, color grading, legendas animadas, animações sobrepostas. Única chamada de rede: transcrição na API da ElevenLabs |
| prompts-chat | **criada aqui**, com dados de f/prompts.chat (`dbb20df`) | `data/prompts.csv` (2.607 prompts, CC0) + `scripts/buscar.py` (busca local). O servidor MCP oficial (`https://prompts.chat/api/mcp`) é bloqueado pela rede da nuvem, por isso a busca é offline |
| leis-brasil | **criada aqui**, consulta ctresb/leis (`15eb09b`, MIT) | `scripts/leis.sh` faz clone parcial (só a lista de caminhos) em `~/.cache/leis-brasil` e baixa cada norma ao ler. O acervo tem 1,1 milhão de arquivos e não cabe no repositório |
| emil-design-eng, animate, review-animations, improve-animations, find-animation-opportunities, animation-performance, animation-vocabulary, apple-design, mobile-native, break-ui, prototype, pick-ui-library, ask-sonner | emilkowalski/skills (`2d22863`, MIT) | `npx skills add emilkowalski/skills --skill … -a claude-code --copy -y` (2026-10-24). Revisadas antes: só Markdown. Ficaram de fora `write-swift` e `animate-expo` (apps nativos iOS e React Native, fora do escopo destes sites) |
| design-taste-frontend | Leonxlnx/taste-skill (`6010f91`, MIT) | `npx skills add https://github.com/Leonxlnx/taste-skill --skill design-taste-frontend -a claude-code --copy -y` (2026-10-24). Revisada antes: scripts Node sem dependências; só acessam a internet para buscar fotos de acervos abertos (Openverse, Wikimedia, museus, NASA, Internet Archive) e gravam o crédito de cada uma. Precisa de Node 22+ e Chrome (ver `CHROME_PATH` abaixo) |

Pré-existentes e preservadas sem alteração: ui-ux-pro-max, banner-design, brand, design, design-system, slides, ui-styling.

`skills-lock.json` (raiz) é gerado pelo CLI `skills` e permite `npx skills update -p`.
Ele **não** lista `impeccable` nem `context-optimization`, que foram instaladas manualmente.

Os arquivos das skills são cópias idênticas das fontes, sem edições locais. As exceções são `prompts-chat` e `leis-brasil`, criadas neste projeto.

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
| founder-* | Python 3.8+ (só biblioteca padrão); `founder-competitors` precisa de acesso web |
| video-use | `ffmpeg`/`ffprobe` (já vêm na nuvem); Python `requests`, `librosa`, `matplotlib`, `pillow`, `numpy` (instalar no `.venv/`); **`ELEVENLABS_API_KEY`** na variável de ambiente ou em `.claude/skills/video-use/.env` (ignorado pelo Git). Opcional: `manim` para animações matemáticas, `yt-dlp` para baixar vídeos |
| prompts-chat | Python 3 (só biblioteca padrão) |
| leis-brasil | `git` e acesso a github.com |
| design-taste-frontend | Node 22+ e Chrome/Chromium. Na nuvem, o hook define `CHROME_PATH` para `.claude/bin/chrome-nuvem.sh`. Uma página leva de 30 a 45 minutos e consome muitos tokens (aviso do README da fonte) |
| copywriting, seo-audit, frontend-design | Somente instruções; seo-audit fica melhor com acesso web |
| web-design-guidelines | Somente instruções. A cada revisão, busca as regras em `https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md` (precisa de acesso web) |
| webapp-testing | Python 3 + pacote **Python** `playwright` (o pacote Node não serve: os exemplos e `scripts/with_server.py` são Python) e um Chromium compatível com a versão do Playwright |

## Preparar o webapp-testing numa nova sessão

Pacotes Python e navegadores **não** ficam no Git; reinstale a cada sessão nova (containers da nuvem são descartados).

**Nuvem (Claude Code na web).** O Chromium já vem em `/opt/pw-browsers` (`PLAYWRIGHT_BROWSERS_PATH` já definido) na revisão `chromium-1243`, a mesma do Playwright **1.63** (a imagem trazia `chromium-1194`/1.56 até o início de out/2026). Fixe a versão para não precisar baixar navegador (`playwright install` não deve ser usado nesse ambiente):

```bash
python3 -m venv /tmp/pw-venv
/tmp/pw-venv/bin/pip install playwright==1.63.0
/tmp/pw-venv/bin/python -m playwright install --dry-run chromium   # deve apontar para /opt/pw-browsers/chromium-1243
```

Se a imagem do ambiente mudar, confira a revisão em `ls /opt/pw-browsers` e ajuste a versão do Playwright. O venv fica fora do repositório; se preferir criar dentro do projeto, use `.venv/`, que já está no `.gitignore`.

**Máquina local.**

```bash
python3 -m venv .venv && .venv/bin/pip install playwright
.venv/bin/python -m playwright install chromium
```

**Automático na nuvem.** O hook SessionStart `.claude/hooks/session-start.sh` (registrado em `.claude/settings.json`) faz isso sozinho: cria `.venv/` no projeto, instala `playwright==1.63.0` se faltar e põe `.venv/bin` no PATH, então `python` já importa o Playwright. Também exporta `CHROME_PATH` apontando para `.claude/bin/chrome-nuvem.sh`, que abre o Chromium com `--no-sandbox` (exigido porque a nuvem roda como root), para a skill `design-taste-frontend`. Só roda quando `CLAUDE_CODE_REMOTE=true`; em máquina local não faz nada. Se a revisão do Chromium em `/opt/pw-browsers` mudar, o hook avisa e basta ajustar `PLAYWRIGHT_VERSION` nele.

### Estado verificado em 2026-10-24 (nuvem)

Playwright 1.63.0 com `chromium-1243`: `tests/test_site.py` passou inteiro. A skill `design-taste-frontend` abriu o `index.html` no Chromium pelo lançador `chrome-nuvem.sh` e gerou as capturas em três larguras.

### Estado verificado em 2026-10-03 (nuvem)

- **Skill instalada:** sim (`.claude/skills/webapp-testing`, idêntica à fonte).
- **Recurso testado e funcionando:** sim, depois de instalar o Playwright Python 1.56.0 num venv temporário. Esse Python **não** vem pré-instalado, só o pacote Node `playwright@1.56.1` e o Chromium.
  Teste: `scripts/with_server.py` subiu `python3 -m http.server` com uma página HTML de teste; o Chromium headless 141.0.7390.37 carregou a página, clicou num botão, conferiu o texto, capturou o `console.log` e salvou uma captura de tela.
- **Bloqueio encontrado (bug do script upstream, não do ambiente):** `with_server.py` inicia o servidor com `shell=True` e, no fim, encerra só o `/bin/sh`. O servidor fica órfão, ainda ocupando a porta, e com os pipes fechados. Na próxima execução na mesma porta, o helper acha que o servidor está pronto, e a página falha com `net::ERR_EMPTY_RESPONSE`.
  **Contorno validado** (duas execuções seguidas, sem órfãos): começar o comando do servidor com `exec`, por exemplo `--server "exec npm run dev"`. Para comandos com `cd … &&`, use `--server "cd web && exec npm run dev"`. Para limpar um órfão: `pkill -f '<comando do servidor>'`.
- **web-design-guidelines:** instalada; a URL de regras respondeu HTTP 200 neste ambiente.

## Vistos nos vídeos e não instalados

| O quê | Por quê |
|---|---|
| tashfeenahmed/freellmapi, Alishahryar1/free-claude-code ("Claude Code de graça") | Não são skills: são proxies que fazem o Claude Code conversar com outros modelos usando chaves de terceiros. O código do projeto passaria por servidores desconhecidos, e trocar o modelo por trás do Claude Code pode violar os termos de uso das contas envolvidas |
| OpenCut-app/OpenCut | É um editor de vídeo completo (app web, alternativa ao CapCut), não uma skill. Use direto em opencut.app ou rode localmente pelo README da fonte. Para editar vídeo pelo Claude, use `video-use` e as `remotion-*` |
| Ponytail, Graphify, Caveman, Understand Anything, Archify, Awesome Claude Skills (lista "Top 10") | Servem para analisar códigos grandes; este repositório é de sites estáticos pequenos. Instale quando houver projeto que precise (`npx skills add <dono>/<repo> -a claude-code --copy -y`, depois de revisar) |

## O que não vai para o Git

Ver `.gitignore`: caches Python (`__pycache__/`, `*.pyc`), ambientes virtuais (`.venv/`, `venv/`), `node_modules/`, navegadores do Playwright, relatórios e resultados de teste, além de `.claude/settings.local.json`.
Os 24 arquivos `__pycache__/*.pyc` que tinham sido versionados por engano (em docx, xlsx, pptx e skill-creator) saíram do Git; o Python os recria quando precisa.

## Servidores MCP do projeto (`.mcp.json`)

Adicionados em 2026-10-14, com versão fixa:

| Servidor | Pacote | Para que serve | Precisa de |
|---|---|---|---|
| `chrome-devtools` | `chrome-devtools-mcp@1.10.1` (Google) | Abrir o site num Chrome de verdade, ver console, rede e desempenho | Chrome instalado (roda `--headless --isolated`) |
| `shadcn-ui` | `@jpisnice/shadcn-ui-mcp-server@3.0.0` | Consultar componentes, blocos e exemplos do shadcn/ui | Opcional: `GITHUB_PERSONAL_ACCESS_TOKEN` (sem ele, a API do GitHub limita a 60 consultas/hora) |
| `magic-21st` | `@21st-dev/magic@0.2.3` | Gerar componentes de interface da 21st.dev | **Obrigatório:** `TWENTY_FIRST_API_KEY` (chave criada em 21st.dev/magic) |

As chaves não vão para o repositório: o `.mcp.json` lê as variáveis de ambiente. Na nuvem, cadastre-as nas variáveis do ambiente; no computador, exporte-as antes de abrir o Claude Code.
Ao abrir o projeto, o Claude Code pergunta se você aprova os servidores do `.mcp.json`.

`frontend-design` e `web-design-guidelines`, citadas nos mesmos vídeos, já estavam instaladas.

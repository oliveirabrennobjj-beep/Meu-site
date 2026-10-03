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

Para automatizar na nuvem, dá para pôr os comandos acima num hook SessionStart (skill `session-start-hook`) ou no script de setup do ambiente.

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

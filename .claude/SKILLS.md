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
| impeccable + `.claude/agents/impeccable-*.md` | pbakaus/impeccable (`e103efe`, skill v4.5.0) | Cópia da build para Claude Code commitada no repositório da fonte (`.claude/skills/impeccable` e `.claude/agents/`). Ver observações |

Pré-existentes e preservadas sem alteração: ui-ux-pro-max, banner-design, brand, design, design-system, slides, ui-styling.

`skills-lock.json` (raiz) é gerado pelo CLI `skills` e permite `npx skills update -p`.
Ele **não** lista `impeccable` nem `context-optimization`, que foram instaladas manualmente.

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

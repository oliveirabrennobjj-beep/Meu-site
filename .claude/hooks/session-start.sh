#!/bin/bash
# Prepara a skill webapp-testing nas sessões na nuvem: instala o pacote Python
# do Playwright num venv do projeto (.venv/, fora do Git) e o põe no PATH.
set -euo pipefail

if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

# 1.56 usa o Chromium chromium-1194, o mesmo que vem em /opt/pw-browsers.
PLAYWRIGHT_VERSION="1.56.0"
VENV="$CLAUDE_PROJECT_DIR/.venv"

if [ ! -x "$VENV/bin/python" ]; then
  python3 -m venv "$VENV"
fi

if ! "$VENV/bin/python" -c "import playwright, importlib.metadata as m; assert m.version('playwright') == '$PLAYWRIGHT_VERSION'" 2>/dev/null; then
  "$VENV/bin/pip" install --quiet --disable-pip-version-check "playwright==$PLAYWRIGHT_VERSION"
fi

if [ -n "${PLAYWRIGHT_BROWSERS_PATH:-}" ] && [ ! -d "$PLAYWRIGHT_BROWSERS_PATH/chromium-1194" ]; then
  echo "Aviso: chromium-1194 não encontrado em $PLAYWRIGHT_BROWSERS_PATH; ajuste PLAYWRIGHT_VERSION (ver .claude/SKILLS.md)." >&2
fi

# Skill graphify: instala e monta o mapa do código sem atrasar o começo da sessão.
nohup "$CLAUDE_PROJECT_DIR/.claude/hooks/graphify-mapa.sh" > "$VENV/graphify-mapa.log" 2>&1 < /dev/null &

# Skill agent-browser: o programa dela, usando o Chromium que já vem na nuvem (sem baixar outro).
if ! command -v agent-browser > /dev/null 2>&1; then
  npm i -g --silent agent-browser > /dev/null 2>&1 || echo "Aviso: não instalou o agent-browser." >&2
fi

if [ -n "${CLAUDE_ENV_FILE:-}" ]; then
  echo "export VIRTUAL_ENV=\"$VENV\"" >> "$CLAUDE_ENV_FILE"
  echo "export PATH=\"$VENV/bin:\$PATH\"" >> "$CLAUDE_ENV_FILE"
  if [ -x /opt/pw-browsers/chromium ]; then
    echo "export AGENT_BROWSER_EXECUTABLE_PATH=/opt/pw-browsers/chromium" >> "$CLAUDE_ENV_FILE"
    echo "export AGENT_BROWSER_ARGS=--no-sandbox" >> "$CLAUDE_ENV_FILE"
  fi
fi

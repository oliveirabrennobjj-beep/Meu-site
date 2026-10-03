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

if [ -n "${CLAUDE_ENV_FILE:-}" ]; then
  echo "export VIRTUAL_ENV=\"$VENV\"" >> "$CLAUDE_ENV_FILE"
  echo "export PATH=\"$VENV/bin:\$PATH\"" >> "$CLAUDE_ENV_FILE"
fi

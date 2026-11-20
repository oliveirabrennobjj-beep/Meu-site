#!/bin/bash
# Prepara a skill graphify: instala a versão fixa no .venv do projeto e monta o mapa do código
# em graphify-out/ (só código, análise local, sem gastar token). O session-start.sh roda isto
# em segundo plano; também dá para rodar na mão: .claude/hooks/graphify-mapa.sh
set -euo pipefail

# Versão revisada em 14/11/2026 (ver .claude/SKILLS.md). O pacote sai quase todo dia: não usar "latest".
GRAPHIFY_VERSION="0.9.99"
RAIZ="${CLAUDE_PROJECT_DIR:-$(cd "$(dirname "$0")/../.." && pwd)}"
VENV="$RAIZ/.venv"

if [ ! -x "$VENV/bin/python" ]; then
  python3 -m venv "$VENV"
fi

if ! "$VENV/bin/python" -c "import importlib.metadata as m; assert m.version('graphifyy') == '$GRAPHIFY_VERSION'" 2>/dev/null; then
  "$VENV/bin/pip" install --quiet --disable-pip-version-check "graphifyy==$GRAPHIFY_VERSION"
fi

cd "$RAIZ"
if [ -f graphify-out/graph.json ]; then
  "$VENV/bin/graphify" update .
else
  "$VENV/bin/graphify" extract . --code-only
fi

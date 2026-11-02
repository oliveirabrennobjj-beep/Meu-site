#!/usr/bin/env bash
# Mac e Linux: bash instalar.sh  (no Mac também dá para dar dois cliques em instalar.command)
set -e
if ! command -v node >/dev/null 2>&1; then
  echo "Node.js não encontrado. Instale a versão LTS em https://nodejs.org e rode de novo."
  exit 1
fi
node "$(cd "$(dirname "$0")" && pwd)/instalar.mjs" "$@"

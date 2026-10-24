#!/bin/bash
# Consulta o acervo ctresb/leis (legislação brasileira em Markdown) sem baixar tudo.
# O repositório tem mais de 1 milhão de arquivos; aqui fica só a lista de caminhos,
# e cada lei é baixada na hora em que for lida.
#
#   leis.sh procurar <padrão>   lista caminhos que casam com o padrão (regex, sem diferenciar maiúsculas)
#   leis.sh ler <caminho>       mostra o texto de uma norma
#   leis.sh pastas [pasta]      lista as subpastas (ex.: pastas federal, pastas estaduais/RJ)
#   leis.sh atualizar           busca a versão mais nova do acervo
set -euo pipefail

REPO_URL="https://github.com/ctresb/leis.git"
DIR="${LEIS_DIR:-$HOME/.cache/leis-brasil}"
LISTA="$DIR/.lista-caminhos.txt"

preparar() {
  if [ ! -d "$DIR/.git" ]; then
    echo "Preparando o acervo em $DIR (só a lista de arquivos, alguns segundos)..." >&2
    git clone -q --depth 1 --filter=blob:none --no-checkout "$REPO_URL" "$DIR"
  fi
  if [ ! -s "$LISTA" ]; then
    # Arquivos e pastas que começam com "_" são registros internos de coleta, não normas.
    git -C "$DIR" ls-tree -r --name-only HEAD | grep -v '/_' | grep -v '^_' > "$LISTA"
  fi
}

case "${1:-}" in
  procurar)
    [ -n "${2:-}" ] || { echo "Uso: leis.sh procurar <padrão>" >&2; exit 2; }
    preparar
    total=$(grep -icE -- "$2" "$LISTA" || true)
    grep -iE -- "$2" "$LISTA" | head -n "${LIMITE:-50}"
    [ "$total" -gt "${LIMITE:-50}" ] && echo "... e mais $((total - ${LIMITE:-50})) (refine o padrão ou use LIMITE=200)" >&2
    [ "$total" -eq 0 ] && echo "Nada encontrado para: $2" >&2
    exit 0
    ;;
  ler)
    [ -n "${2:-}" ] || { echo "Uso: leis.sh ler <caminho>" >&2; exit 2; }
    preparar
    git -C "$DIR" show "HEAD:$2"
    ;;
  pastas)
    preparar
    git -C "$DIR" ls-tree --name-only "HEAD:${2:-}" | grep -v '^_'
    ;;
  atualizar)
    preparar
    git -C "$DIR" fetch -q --depth 1 --filter=blob:none origin HEAD
    git -C "$DIR" update-ref HEAD FETCH_HEAD
    rm -f "$LISTA"
    preparar
    echo "Acervo atualizado: $(git -C "$DIR" log -1 --format='%h, %cd' --date=short)"
    ;;
  *)
    sed -n '2,10p' "$0" | sed 's/^# \{0,1\}//'
    exit 2
    ;;
esac

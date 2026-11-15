#!/bin/bash
# Cifra saida/ com a chave pública do pedido e publica no branch cortes-saida.
# O repositório é público: só quem tem a chave privada (a sessão que fez o pedido) abre o pacote.
set -euo pipefail

pub=$(mktemp -d)
chave=$(mktemp)
openssl rand -hex 32 > "$chave"
tar -C saida -cf - . | openssl enc -aes-256-ctr -pbkdf2 -pass "file:$chave" | split -b 90M - "$pub/pacote.enc."
openssl pkeyutl -encrypt -pubin -inkey cortes/ci/chave_publica.pem \
  -pkeyopt rsa_padding_mode:oaep -in "$chave" -out "$pub/chave.enc"
rm -f "$chave"
jq -c '{modo, id}' cortes/pedido.json > "$pub/pedido.json"

cd "$pub"
ls -la
git init -q -b cortes-saida
git add -A
git -c user.name="cortes-ci" -c user.email="cortes-ci@users.noreply.github.com" commit -q -m "Saída cifrada do pedido de cortes"
git push -f "https://x-access-token:${GITHUB_TOKEN}@github.com/${GITHUB_REPOSITORY}" cortes-saida

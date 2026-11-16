#!/bin/bash
# Baixa o branch cortes-saida e abre o pacote cifrado com a chave privada desta sessão.
# Uso: abrir.sh <chave_privada.pem> <pasta_destino>
set -euo pipefail
chave_priv=$1
destino=$2
tmp=$(mktemp -d)
git clone -q --depth 1 --branch cortes-saida https://github.com/oliveirabrennobjj-beep/Meu-site "$tmp/s"
cat "$tmp/s/pedido.json"; echo
openssl pkeyutl -decrypt -inkey "$chave_priv" -pkeyopt rsa_padding_mode:oaep -in "$tmp/s/chave.enc" -out "$tmp/chave"
mkdir -p "$destino"
cat "$tmp"/s/pacote.enc.* | openssl enc -d -aes-256-ctr -pbkdf2 -pass "file:$tmp/chave" | tar -C "$destino" -xf -
rm -rf "$tmp"
ls -la "$destino"

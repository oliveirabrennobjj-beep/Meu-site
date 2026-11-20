#!/bin/bash
# Baixa EstabelecimentosN.zip em fluxo e guarda só as linhas (RJ) dos municípios da região.
U=https://arquivos.receitafederal.gov.br/public.php/webdav/2026-11
n=$1
for t in 1 2 3; do
  curl -sf -u YggdBLfdninEJX9: "$U/Estabelecimentos$n.zip" | funzip | grep -a -F -e '"RJ";"2921";' -e '"RJ";"5813";' -e '"RJ";"5825";' -e '"RJ";"5847";' -e '"RJ";"5911";' > est$n.csv
  st=("${PIPESTATUS[@]}")
  if [ "${st[0]}" = 0 ] && [ "${st[1]}" = 0 ]; then echo "est$n ok $(wc -l < est$n.csv)"; exit 0; fi
  echo "est$n falhou (${st[*]}), tentativa $t"
done
exit 1

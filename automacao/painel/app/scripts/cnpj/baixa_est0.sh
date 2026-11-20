#!/bin/bash
# Estabelecimentos0 (2,3 GB) em 16 pedaços paralelos (Range), depois descompacta e filtra.
U=https://arquivos.receitafederal.gov.br/public.php/webdav/2026-11/Estabelecimentos0.zip
T=$(curl -sI -u YggdBLfdninEJX9: "$U" | awk 'tolower($1)=="content-length:"{print $2+0}')
N=16; P=$(( (T + N - 1) / N )); mkdir -p p0
for i in $(seq 0 $((N-1))); do
  a=$((i*P)); b=$(( (i+1)*P - 1 )); [ $b -ge $T ] && b=$((T-1))
  ( for t in 1 2 3 4; do curl -sf -u YggdBLfdninEJX9: -r $a-$b "$U" -o p0/$i && [ $(stat -c%s p0/$i) -eq $((b-a+1)) ] && exit 0; sleep 3; done; echo "parte $i falhou" ) &
done
wait
tot=$(cat p0/* | wc -c); echo "baixado $tot de $T"
for i in $(seq 0 $((N-1))); do cat p0/$i; done | funzip | grep -a -F -e '"RJ";"2921";' -e '"RJ";"5813";' -e '"RJ";"5825";' -e '"RJ";"5847";' -e '"RJ";"5911";' > est0.csv && echo "est0 ok $(wc -l < est0.csv)" && rm -rf p0

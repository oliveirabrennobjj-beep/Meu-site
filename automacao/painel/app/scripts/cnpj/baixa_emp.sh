#!/bin/bash
# Empresas0-9: baixa em pedaços paralelos e guarda só as empresas dos CNPJs da região (pats.txt).
cut -d';' -f1 est*.csv | sort -u | sed 's/$/;/' > pats.txt
echo "padroes $(wc -l < pats.txt)"
B=https://arquivos.receitafederal.gov.br/public.php/webdav/2026-11
for n in 0 1 2 3 4 5 6 7 8 9; do
  U=$B/Empresas$n.zip
  T=$(curl -sI -u YggdBLfdninEJX9: "$U" | awk 'tolower($1)=="content-length:"{print $2+0}')
  N=$([ $n = 0 ] && echo 16 || echo 6); P=$(( (T + N - 1) / N )); rm -rf pe; mkdir -p pe
  for i in $(seq 0 $((N-1))); do
    a=$((i*P)); b=$(( (i+1)*P - 1 )); [ $b -ge $T ] && b=$((T-1))
    ( for t in 1 2 3 4; do curl -sf -u YggdBLfdninEJX9: -r $a-$b "$U" -o pe/$i && [ $(stat -c%s pe/$i) -eq $((b-a+1)) ] && exit 0; sleep 3; done; echo "emp$n parte $i falhou" ) &
  done
  wait
  for i in $(seq 0 $((N-1))); do cat pe/$i; done | funzip | grep -a -F -f pats.txt > emp$n.csv
  echo "emp$n ok $(wc -l < emp$n.csv)"
done
rm -rf pe; echo FIM

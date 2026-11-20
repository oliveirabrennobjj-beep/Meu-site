# Celular do dono pelo cadastro do CNPJ

Dados abertos da Receita (públicos por lei), compartilhamento `YggdBLfdninEJX9` em
`arquivos.receitafederal.gov.br` (WebDAV `public.php/webdav/AAAA-MM/`). Rodar numa pasta de trabalho:

1. `for n in 1 2 3 4 5 6 7 8 9; do ./baixa_est.sh $n & done; ./baixa_est0.sh; wait`: estabelecimentos dos municípios
   da região (Rio das Ostras 2921, Cabo Frio 5813, Casimiro 5825, Macaé 5847, Silva Jardim 5911). Uns 10 min.
2. `./baixa_emp.sh`: razão social e natureza jurídica só desses CNPJs. Uns 4 min.
3. `python3 -I cruzar.py lote.json . donos.json`: cruza com as lojas do lote.

Regras: nome parecido nos dois sentidos (palavra rara pesa mais) e mais telefone, rua e número, ou CEP de rua.
Celular em mais de 3 CNPJs é de contador. Nome do dono só de MEI/empresário individual (natureza 2135), e não
quando o nome da loja tem o nome de outra pessoa. Não usar site de consulta de pessoa nem vazamento; não guardar CPF.

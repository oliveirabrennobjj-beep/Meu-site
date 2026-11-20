# Pesquisa de comércios no Google Maps

Acha comércios com celular e sem site para o painel de vendas
(<https://claude.ai/artifact/LMpGydYCibdZoLEf3eNBNo>, coleção `leads`).
Usa o Chromium com Playwright que já vem na nuvem; não gasta crédito.

## Passos

Rode tudo numa pasta de rascunho (os arquivos de dados não vão para o Git).

1. Baixe os leads atuais do banco (`ArtifactData` list, coleção `leads`, `out_dir` = `db`),
   para a pasta `db/leads/` ao lado da pasta dos scripts (`converte.py` lê `../db/leads`).
2. Escreva `consultas.txt`, uma busca por linha: `"<nicho> em <cidade> RJ"`.
3. `node lista.js consultas.txt lista.json`: rola cada busca até o fim e guarda os lugares (5 abas).
4. Escolha os lugares pela posição (`geo.py`, raio por cidade) e rode
   `N=7 node detalhe.js entrada.json detalhe.json`: abre a ficha de cada um e pega telefone,
   nota, endereço e site. Os dois scripts retomam de onde pararam.
5. `python3 converte.py "Casimiro de Abreu,Barra de São João"`: gera `novos.json` com id
   `w<whatsapp>`, só celular, sem site próprio (Instagram e Linktree contam como sem site),
   sem repetir número ou nome do painel, e cidade/distrito certos.
6. `python3 zap.py nums.txt zap.json` confere cada número em `whatsapp.com/catalog/<número>/`:
   com WhatsApp Business a página traz o nome da conta; sem, dá 404. `casa.py` compara esse nome
   com o da loja. `monta_lote.py <nome-do-lote>` junta tudo em `pesquisa/lote.json`, com `zap` em cada
   loja e `conferencia` ({número: zap}) para atualizar quem já estava no painel.
7. Ponha os leads em `{"lote": "<nome novo>", "leads": [...]}` e publique o painel com esse
   arquivo em `pesquisa/lote.json` (`files` do Artifact). Quando o Brenno abre o painel, ele grava
   no banco quem ainda não está (pelo WhatsApp) e marca o lote em `config/pesquisa`, então cada
   lote entra uma vez só. Lote com nome repetido é ignorado. O arquivo não vai para o Git.

## Limites

- 404 na conferência não prova que o número não tem WhatsApp (pode ser WhatsApp comum).
  Os 4 números tirados por "sem WhatsApp"/"número errado" e o da Raffus deram 404.

- Sem login o Google não mostra o número de avaliações: `avaliacoes` fica `null` (o painel mostra "—").
- Telefone fixo fica de fora (o painel é por WhatsApp).
- Em 20/11/2026: 687 buscas e ~1.300 fichas levaram cerca de 1 hora.

# Painel de vendas: onde paramos (13/11/2026)

Resumo para continuar numa conversa nova sem perder nada.

## O painel
- Link (só o Brenno abre): https://claude.ai/artifact/LMpGydYCibdZoLEf3eNBNo
- Serve para achar comércios sem site e vender **site** (por aluguel: entrada + mensalidade, valores ainda não definidos) e **placa NFC** de avaliação do Google.
- Código: `automacao/painel/app` (React + Tailwind + Vite). `npm install && npm run build` gera `automacao/painel/vendas.html`; `npm run teste` testa no celular simulado. Publicar o `vendas.html` no mesmo link com a ferramenta Artifact, **sem** `capabilities` (mantém `db`, `user` e `sample` com fotos). Detalhes em `automacao/painel/app/README.md`.
- **O código está no branch `ccr-aeb44e3e-tksqri`, ainda não na main.** Trabalhe a partir dele.
- Dados no banco do Artifact: lojas em `leads`, mensagens prontas em `config/mensagens`, conversa do assistente em `assistente/conversa`.
- O que já tem: tabela por cidade, filtro por nicho, ordem por avaliações, ficha com mensagem pronta (em Casimiro: AS DUAS / PLACA / SITE / DONO, sem repetir o "oi"), atalhos Google Maps / Instagram / WhatsApp, anotação com assistente, "Próximos passos" e o menu **Assistente** (chat com o Claude que lê print de conversa e propõe atualizar a loja). Meta de 30 comércios contatados por dia.

## Regras do Brenno (não mudar sem ele pedir)
- Cidade de Casimiro de Abreu: dá para conversar pessoalmente ou pegar o contato do dono.
- Distritos (Barra de São João, Rio Dourado, Professor Souza) e outras cidades (Rio das Ostras, Macaé): só WhatsApp, nunca prometer visita. Loja de distrito cadastrada como Casimiro: na ficha, "Dá pra ir lá pessoalmente?" = NÃO.
- Sem preço na primeira mensagem. Sempre buscar o dono. Quem gostou recebe oferta de demonstração do site para hoje ou amanhã.
- Tom profissional com o cliente: roteiro em `automacao/painel/app/src/painel/conhecimento.ts` (nota "Abordagem profissional de vendas" no cérebro).

## Situação das conversas (13/11)
- **Parada Ideal** (cadastro diz Casimiro, mas fica longe): respondeu. A funcionária mandou falar com o dono no **sábado 14/11 por volta de 12h**, pelo WhatsApp da padaria. Tem aviso agendado às 11:45 com a mensagem pronta.
- **Leiteria Casimiro**: respondeu. A funcionária vai passar o contato do Brenno aos donos; se se interessarem, ele faz a demonstração do site.
- Padaria do bairro industrial, Sempre Viva, Pão e N pão: receberam site, placa e pedido do dono; sem resposta ainda.
- 76 lojas no painel; só 18 com Instagram salvo.

## Esperando decisão do Brenno
- Pesquisa diária trazer 30 comércios novos em vez de 10 (com a meta de 30, a lista acaba em uns 3 dias).
- Trazer os 139 comércios de Casimiro do "Mapa da Plaquinha".
- Reescrever as mensagens prontas no formato profissional.
- Fazer o merge do branch `ccr-aeb44e3e-tksqri` na main.
- O resumo das 06:17 lê `automacao/LEMBRETES.md` deste branch e sugere uma "melhoria de hoje" da lista "Ideias para o painel e o portfólio".

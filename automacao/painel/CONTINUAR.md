# Painel de vendas (o app): resumo

Atualizado em 14/11/2026 (tarde).

## O que é
- Link (só o Brenno abre): https://claude.ai/artifact/LMpGydYCibdZoLEf3eNBNo
- App que o Brenno usa no celular para achar comércios e mandar mensagem no WhatsApp oferecendo **site** (aluguel) e **placa NFC** de avaliação do Google.

## Telas
- **Visão geral / Casimiro / Fora:** lojas por cidade, filtro por nicho, ordem da mais para a menos avaliada, meta de 30 contatos por dia e "Próximos passos" (o que ficou marcado).
- **Ficha da loja:**
  - Atalhos: Google Maps, Instagram e WhatsApp.
  - Pergunta "Dá pra ir lá pessoalmente?".
  - Escolha do que mandar: AS DUAS, PLACA, SITE ou DONO.
  - Mensagem pronta: muda o cumprimento conforme a hora e não repete o "oi" na segunda mensagem.
  - Botões: Enviar no WhatsApp, Falei pessoalmente, Copiar e Próximo.
  - Quando a loja responde: oferta de demonstração e botões de resultado.
  - "Anotar": o assistente organiza a anotação.
  - "Tira da lista": botões "Número sem WhatsApp" e "Loja não existe mais". A loja some das listas e das contagens (meta do dia, funil, agenda, assistente) e a ficha pula para a próxima. O filtro "Tiradas" mostra essas lojas; na ficha delas, "Voltar pra lista" desfaz.
  - "Mostrar demonstração do site": prévia do site da loja no estilo do ramo (fotos de banco livre, só dados reais). "Mandar foto" gera a imagem da página para mandar no WhatsApp.
- **Agenda:** calendário do mês; o dia com algo combinado ganha um ponto (vermelho se passou). Tocar no dia mostra as lojas e o horário. Para marcar, usar "Anotar" na ficha.
- **Funil:** fluxo animado das etapas (A enviar → Enviado → Respondeu → Fechou / Mais pra frente / Não quer) com a quantidade de lojas; tocar numa etapa abre a lista dela.
- **Assistente:** chat com o Claude dentro do app. Aceita print da conversa e propõe atualizar a loja. Sabe o roteiro do "tá caro" (perguntar antes, nunca desconto de cara).
- **Mensagens:** editar os textos prontos.
- **Importar:** colar uma lista de lojas.

## De onde vêm as lojas
- 13/11: 103 de Casimiro vieram do "Mapa da Plaquinha" (93 da sede, 10 de Barra de São João). Entraram também Barbearia Dias e Cid Burguer (o número do Cid Burguer não foi confirmado). Hoje são 180 lojas: 69 em Macaé e Rio das Ostras, o resto em Casimiro.
- A "Barbearia em São Paulo - Barbshop" foi tirada: o número não tem WhatsApp.
- 14/11: tiradas da lista (continuam no banco, para a importação não trazer de volta) a Studio Juliana Bkenda (número sem WhatsApp) e a Sol Marques Espaço da Beleza (respondeu que não tem mais o salão).
- Não existe jeito de testar de fora se um número tem WhatsApp: só o WhatsApp do celular sabe. Por isso o botão na ficha.
- 16/11: entraram 44 lojas das pesquisas de 15 e 16/11 e mais 78 de modalidades (pilates, yoga, CrossFit/funcional, natação, dança) achadas no Google Maps: 11 em Casimiro e Barra de São João, o resto em Rio das Ostras e Macaé. Ficaram de fora as que só têm telefone fixo (Acqua Sport, natação em Casimiro: (22) 2778-4620; Escola de Dança de Barra de São João: (22) 2774-5631) — dá para ir pessoalmente.
- A pesquisa das 06:17 traz até 30 por dia, nesta ordem: sede de Casimiro (outros ramos), depois Barra de São João, Rio Dourado, Professor Souza, e só então Rio das Ostras e Macaé. Colar o JSON em Importar.

## Regras que o app segue
- Visita pessoal só na cidade de Casimiro de Abreu.
- Barra de São João, Rio Dourado, Professor Souza e outras cidades: só WhatsApp.
- Sem preço na primeira mensagem. Sempre buscar o dono.

## Código
- Pasta `automacao/painel/app` (React 18, Tailwind 4, Vite), no branch `ccr-1d993679-yyz410` (continuação do `ccr-aeb44e3e-tksqri`).
- Arquivos principais em `src/painel/`:
  - `leads.ts`: regras e textos.
  - `FichaLead.tsx`: ficha da loja.
  - `PainelVendas.tsx`: telas e menu.
  - `Assistente.tsx`: chat.
  - `conhecimento.ts`: o que o assistente sabe.
  - `Ferramentas.tsx`: Mensagens e Importar.
- Montar e testar: `npm install && npm run build` gera `automacao/painel/vendas.html`. `npm run teste` testa no celular simulado.
- Publicar: mandar o `vendas.html` para o mesmo link com a ferramenta Artifact, **sem** `capabilities`. Detalhes em `app/README.md`.
- Fotos e fontes da prévia: `automacao/painel/img/demo/` (publicadas junto como arquivos de apoio, com `root` = `automacao/painel`; só precisa reenviar quando mudarem). Temas por ramo em `src/painel/Demonstracao.tsx`. Nunca usar foto com marca de outra empresa.
- Ver a prévia de um ramo sem publicar: `EXTRA='{"nome":"Loja","tipo":"Pizzaria"}' npm run teste` salva `capturas/foto-previa.jpg`. Com `RAMOS=crossfit,moda` junto, tira um print da prévia de cada ramo (`capturas/previa-<ramo>.png`).
- Ramos (16/11): além dos de antes, CrossFit e funcional, pilates, yoga, dança, natação, fisioterapia, lava-jato, roupas, papelaria, ótica, construção, mercado e farmácia. Sem tema ainda: pousada, distribuidora, assistência de celular, presentes e variedades (caem em "Outro comércio").
- Dados ficam no banco do Artifact:
  - `leads`: as lojas.
  - `config/mensagens`: os textos.
  - `assistente/conversa`: o chat.

## Horário marcado (novidade de 18/11)
- Oferta do sistema na ficha (botão HORÁRIO ou ALUNOS, conforme o ramo):
  - Horário marcado: barbearia, salão, estética, massagem, pet shop (banho e tosa) e lava-jato.
  - Controle de alunos e mensalidade: pilates, yoga, dança, natação, CrossFit, luta e academia.
  - Barbearia sem contato já abre no sistema. Loja desses ramos que já recebeu mensagem também abre nele (texto de continuação, sem novo "oi").
- Filtro "Oferecer sistema" na lista: quem já recebeu mensagem, é de ramo com sistema e ainda não ouviu falar dele.
- Botão "Mostrar o sistema" na ficha: a loja no notebook e no celular, com "Mandar foto" (em `src/painel/SistemaPrevia.tsx`).
- 18/11: entraram 16 barbearias de Casimiro, Barra de São João e Rio Dourado (Google Maps). Sem telefone no Google, só indo lá: KING BARBER e Seu Orlando (Barra), Niilo Barbeiro, Léo do Corte e Barbearia Pirulito (Casimiro), Tesoura de Ouro e Barberia do Zé (Rio Dourado).
- Demonstração para mostrar ao barbeiro: https://claude.ai/artifact/Wd4vVWKcnP8NRG6qcT8ZUY (fonte em `automacao/horario-marcado/`). "Trocar nome" põe o nome da barbearia antes de mostrar. Dados de exemplo; o sistema de verdade só depois de 2 ou 3 barbearias toparem.

## Esperando o Brenno
- Testar o botão "Mandar foto" no celular de verdade e dizer o que aconteceu (abriu o WhatsApp, salvou a foto ou mostrou a foto para segurar).
- Mandar uma foto boa de açaí na tigela (a prévia de açaiteria usa copo de açaí e sorvete).
- Decidir o merge do branch `ccr-1d993679-yyz410` na main.
- Contar como foi a conversa com o dono da Parada Ideal (combinada para 14/11 por volta das 12h).

## Melhorias pendentes no app
- Reescrever as mensagens prontas no formato profissional (o roteiro está em `conhecimento.ts`).
- Outras ideias: seção "Ideias para o painel e o portfólio" em `automacao/LEMBRETES.md`.

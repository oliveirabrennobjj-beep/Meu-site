# Painel de vendas (o app): resumo

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
  - "Mostrar demonstração do site": prévia do site da loja no estilo do ramo (fotos de banco livre, só dados reais). "Mandar foto" gera a imagem da página para mandar no WhatsApp.
- **Assistente:** chat com o Claude dentro do app. Aceita print da conversa e propõe atualizar a loja.
- **Mensagens:** editar os textos prontos.
- **Importar:** colar uma lista de lojas.

## De onde vêm as lojas
- 13/11: 103 de Casimiro vieram do "Mapa da Plaquinha" (93 da sede, 10 de Barra de São João).
- A pesquisa das 06:17 traz até 30 por dia, nesta ordem: sede de Casimiro (outros ramos), depois Barra de São João, Rio Dourado, Professor Souza, e só então Rio das Ostras e Macaé. Colar o JSON em Importar.

## Regras que o app segue
- Visita pessoal só na cidade de Casimiro de Abreu.
- Barra de São João, Rio Dourado, Professor Souza e outras cidades: só WhatsApp.
- Sem preço na primeira mensagem. Sempre buscar o dono.

## Código
- Pasta `automacao/painel/app` (React 18, Tailwind 4, Vite), no branch `ccr-aeb44e3e-tksqri`.
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
- Ver a prévia de um ramo sem publicar: `EXTRA='{"nome":"Loja","tipo":"Pizzaria"}' npm run teste` salva `capturas/foto-previa.jpg`.
- Dados ficam no banco do Artifact:
  - `leads`: as lojas.
  - `config/mensagens`: os textos.
  - `assistente/conversa`: o chat.

## Melhorias pendentes no app
- Reescrever as mensagens prontas no formato profissional (o roteiro está em `conhecimento.ts`).
- Outras ideias: seção "Ideias para o painel e o portfólio" em `automacao/LEMBRETES.md`.

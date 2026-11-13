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
- **Assistente:** chat com o Claude dentro do app. Aceita print da conversa e propõe atualizar a loja.
- **Mensagens:** editar os textos prontos.
- **Importar:** colar uma lista de lojas.

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
- Dados ficam no banco do Artifact:
  - `leads`: as lojas.
  - `config/mensagens`: os textos.
  - `assistente/conversa`: o chat.

## Melhorias pendentes no app
- Reescrever as mensagens prontas no formato profissional (o roteiro está em `conhecimento.ts`).
- Trazer para o app os 139 comércios de Casimiro do "Mapa da Plaquinha".
- Outras ideias: seção "Ideias para o painel e o portfólio" em `automacao/LEMBRETES.md`.

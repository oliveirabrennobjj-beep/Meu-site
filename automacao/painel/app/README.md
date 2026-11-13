# Painel de vendas (prospecção)

Painel do Brenno para mandar mensagem a comércios sem site. Publicado como Artifact em
<https://claude.ai/artifact/LMpGydYCibdZoLEf3eNBNo>. Os comércios ficam no banco do Artifact
(coleção `leads`; os quatro textos de contato em `config/mensagens`), nunca neste repositório.

Visual: casca escura adaptada do componente "Dashboard Shell" de @isaiahbjork no 21st.dev,
que o Brenno escolheu como referência. No celular o painel é desenhado a 520 px e encolhido
para caber (ver `src/main.tsx`), para ficar igual à referência.

## Mudar e publicar

```bash
npm install
npm run build   # confere os tipos, compila e gera ../vendas.html
npm run teste   # abre o vendas.html com empresas fictícias e confere o fluxo de envio
```

Depois publique `automacao/painel/vendas.html` com a ferramenta Artifact, passando a URL acima
e sem `capabilities` (mantém `db`, `user`, `downloads` e `sample` com fotos). As fotos e fontes da
prévia do site ficam em `automacao/painel/img/demo/` e vão como arquivos de apoio (`root` =
`automacao/painel`); só precisa reenviar quando mudarem.

## Onde fica cada coisa

- `src/painel/leads.ts`: regras (situações, cidade, nicho, site ou placa, textos das mensagens, importação).
  Casimiro: mensagem pede para falar com o dono pessoalmente (placa para quem tem menos de 50 avaliações).
  Visita na cidade de Casimiro (distritos como Barra de São João e Rio Dourado contam como fora); `visita: false` tira uma loja.
  O resto recebe o texto de WhatsApp (`fora`).
  Loja longe que recebeu pedido de visita ganha a mensagem de correção (`corrigidoEm` quando enviada).
  Com visita, abre com as duas ofertas numa mensagem; a segunda oferta mandada depois entra como continuação, sem novo "oi".
  Opção DONO (`enviados.dono`): pedir para falar com o dono; depois de cada envio a ficha pula para a próxima opção.
  `{saudacao}` vira bom dia, boa tarde ou boa noite pela hora do celular.
  Fora: mensagem de site pelo WhatsApp. Quem gostou recebe a oferta de demonstração do site para hoje ou amanhã.
  Nenhum texto cita preço.
  Cada oferta tem seu próprio registro de envio (`enviados.site`, `enviados.placa`); contatos antigos tinham
  só `produto` + `enviadoEm` e continuam sendo lidos.
- `src/painel/assistente.ts` e `Anotar.tsx`: assistente de anotação (capability `sample`, modelo rápido). Grava `obs`,
  `historico` e `compromisso` ({quando: "AAAA-MM-DDTHH:mm", oque}); `ProximosPassos.tsx` lista os compromissos.
  `Assistente.tsx` + `conhecimento.ts`: chat com foto (regras de abordagem e lista de lojas vão no início de cada pedido;
  a resposta pode terminar num bloco ```painel com mudanças que o Brenno confirma). Conversa em `assistente/conversa`.
  Publicar com `capabilities: {db: {}, user: {}, sample: {images: true}, downloads: true}`.
- `src/painel/usePainel.ts`: leitura e gravação no banco do Artifact.
- `src/painel/PainelVendas.tsx`: a tela; `TabelaLeads`, `FichaLead` e `Ferramentas` são as partes.
- `src/components/ui/`: casca e blocos visuais, sem regra de negócio.

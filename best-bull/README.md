# Best Bull SteakHouse (prévia de site)

Prévia feita pela BN Digital, no estilo da referência do Brenno (preto quente, dourado, brasas), para a Best Bull SteakHouse, hamburgueria artesanal de Casimiro de Abreu. Montada a partir do Instagram da loja (@bestbull_steakhouse): logo, nome e o que ela mostra (lanches, milk shake, acompanhamentos, delivery, Espaço Kids). Serve de base: se o dono topar, é só preencher o `config.js`.

Depois do merge na `main`, abre em: https://oliveirabrennobjj-beep.github.io/Meu-site/best-bull/

## Como ver
Abra `index.html` no navegador (funciona com dois cliques).

## O que o site faz
- Botão "+" nas assinaturas monta o pedido; o carrinho (ícone no topo) lista os itens, aceita observações e abre o WhatsApp da loja com o pedido escrito.
- "Peça agora" abre o WhatsApp com mensagem pronta.
- Sem preços e sem cardápio: o site mostra "Valor pelo WhatsApp" até o dono passar os valores.

## Onde mudar
Tudo que é da loja fica em `assets/js/config.js`:

| Campo | O que é |
|---|---|
| `whatsapp`, `whatsappVisivel` | número da loja (do Google Maps). DDI + DDD + número, só dígitos |
| `instagram`, `email` | usuário do Instagram (sem @) e e-mail. Vazio esconde |
| `nota`, `avaliacoes` | nota do Google (4,9 com 50 avaliações em 24/11/2026) |
| `endereco`, `horarios` | rodapé e botão "Como chegar". Endereço sem número até o dono confirmar |
| `linkAnotaAi` | link do cardápio no Anota Aí. Vazio = o botão some |
| `itens` | `nome`, `descricao` e `preco` de cada assinatura (`xbacon`, `supreme`, `acomp`, `shake`) |
| `mensagens` | texto pronto de cada botão de WhatsApp |

Para trocar foto, substitua o arquivo em `assets/img/` com o mesmo nome (WebP).

## Pendências (dependem do dono)
- Nomes, descrições e preços do cardápio. As assinaturas usam nomes vistos no Instagram da loja ("X-Bacon sabor picanha", "Supreme") mais "Acompanhamentos" e "Milk shake"; confirmar.
- Horários de funcionamento, número da rua e e-mail.
- Área de entrega e o link do Anota Aí.
- **Fotos:** as de lanche, shake, acompanhamento, galeria e delivery são de banco de imagens (Pexels). Trocar pelas fotos reais da Best Bull, inclusive uma do ambiente. A foto do Espaço Kids é um recorte do Instagram em baixa resolução: pedir uma melhor.
- Confirmar se o número do WhatsApp da loja é o que o dono quer no site.
- Domínio próprio, se ele quiser.

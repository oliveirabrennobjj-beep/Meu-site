# Best Bull SteakHouse (prévia de site)

Prévia feita pela BN Digital para a Best Bull SteakHouse, hamburgueria artesanal de Casimiro de Abreu. Montada a partir do Instagram da loja (@bestbull_steakhouse): logo, nome, cores e a lista do que ela mostra (lanches, milk shake, acompanhamentos, delivery, Espaço Kids).

Depois do merge na `main`, abre em: https://oliveirabrennobjj-beep.github.io/Meu-site/best-bull/

## Como ver
Abra `index.html` no navegador (funciona com dois cliques).

## Onde mudar
Tudo que é da loja fica em `assets/js/config.js`:

| Campo | O que é |
|---|---|
| `whatsapp`, `whatsappVisivel` | número da loja (do Google Maps). DDI + DDD + número, só dígitos |
| `instagram` | usuário do Instagram, sem o @ |
| `nota`, `avaliacoes` | nota do Google (4,9 com 50 avaliações em 24/11/2026). Apague para esconder |
| `endereco`, `horarios`, `areaEntrega` | aparecem na seção "Onde fica" e em "Delivery" só quando preenchidos |
| `linkAnotaAi` | link do cardápio no Anota Aí. Vazio = o botão some |
| `mensagens` | texto pronto de cada botão de WhatsApp |
| `cardapio` | itens `{ nome, descricao, preco }` de lanches, shake e acompanhamentos. Vazio = "peça o cardápio pelo WhatsApp" |

## Pendências (dependem do dono)
- Cardápio com nomes, descrições e preços.
- Endereço completo (no Instagram aparece cortado: "R. Ten. João dos Santos Pesso…") e horários de funcionamento.
- Área de entrega e o link do Anota Aí.
- **Fotos:** as de lanche, shake, acompanhamento e delivery são de banco de imagens (Pexels). Trocar pelas fotos reais da Best Bull. A foto do Espaço Kids é um recorte do Instagram em baixa resolução: pedir uma melhor.
- Confirmar se o número do WhatsApp da loja é o que o dono quer no site.
- Domínio próprio, se ele quiser.

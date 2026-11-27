# Depósito do Gordinho

Site do depósito de bebidas da Vila Mataruna, Casimiro de Abreu (RJ). HTML, CSS e JS puros, publicado no GitHub Pages:
https://oliveirabrennobjj-beep.github.io/Meu-site/deposito-do-gordinho/

## Onde mexer
| Quero mudar | Arquivo |
|---|---|
| Produtos, preços, destaques | `assets/js/produtos.js` |
| Fotos dos produtos | `assets/img/produtos/<nome>.webp` (o nome vai no campo `foto`) |
| WhatsApp, horário, modo prévia | `assets/js/config.js` |
| Endereço, avaliações, textos | `index.html` |
| Cores e fontes | topo de `assets/css/styles.css` |
| Fotos da loja | `assets/img/loja-fachada.webp`, `loja-geladeira-2.webp` (seção Nossa história) |
| Fotos de clima (provisórias, Unsplash) | `assets/img/clima/`: `hero-cerveja` (banner), `promo-whisky` (banner lateral), `banner-garrafas` e `banner-tampas` (2 promoções). No `index.html` cada uma tem o comentário `FOTO PROVISÓRIA` |

Depois de mexer em `produtos.js`, rode `node deposito-do-gordinho/montar.mjs`: ele escreve os cards no `index.html` para a página abrir completa mesmo antes do JavaScript.

Foto de produto nova: imagem em fundo branco e recorte com
`convert foto.jpg -fuzz 6% -fill none -draw "color 0,0 floodfill" -trim -resize x640 produto.webp`.

## Pedido pelo site (carrinho)
- Botão **Comprar** em cada produto abre a ficha (gelada ou natural, quantidade, observação) e põe no carrinho (ícone de sacola no topo).
- **Finalizar pedido**: nome, WhatsApp, entrega ou retirada, endereço com **busca de rua** (1.067 ruas do município inteiro em `assets/js/ruas.js`: Censo 2022 do IBGE + lista da Prefeitura + leis da Câmara + OpenStreetMap; escolher a rua já preenche o bairro), pagamento e observação. Gera a mensagem pronta no WhatsApp do depósito.
- Taxa de entrega e formas de pagamento: `taxaEntrega` e `pagamentos` em `config.js`. Rua faltando: acrescentar em `ruas.js`.
- Código: `assets/js/carrinho.js`.

## Painel do dono (estoque)
Endereço: `painel/` (https://oliveirabrennobjj-beep.github.io/Meu-site/deposito-do-gordinho/painel/). Não aparece no site.
- Cada produto tem **Tem / Acabou**. Acabou = no site aparece "Esgotado" e não dá para pedir.
- Hoje (prévia) fica salvo só no aparelho de quem marca. Para valer para todos os clientes: ligar a um banco online (ex.: Supabase) com login do dono, trocando `ler()` e `gravar()` em `painel/painel.js` e a função `estoque()` em `assets/js/main.js`.

## Modo prévia
`previa: true` em `config.js`: os botões de WhatsApp e Ligar só mostram um aviso, e o "Enviar pedido" mostra como a mensagem chegaria, sem enviar. Quando o dono aprovar, trocar para `false`.

## Pendências (dependem do cliente)
- [ ] Preços reais (hoje: "Preço a confirmar").
- [ ] Lista real de produtos. As fotos de produto são de divulgação das marcas.
- [ ] Fotos da loja: fachada e geladeiras são do Google (perfil Estação das Bebidas, de 6 anos atrás). A fachada hoje tem letreiro "Depósito do Gordinho": vale tirar foto nova.
- [ ] Logo em alta (o atual foi recortado do print do WhatsApp).
- [ ] Bairros atendidos e taxa de entrega.
- [ ] Aceita dinheiro? Hoje o site diz Pix e cartão.
- [ ] Trocar as 4 fotos de clima por fotos reais da loja (dá para tirar com o celular, de noite, luz quente).
- [ ] Taxa de entrega (hoje "a combinar") e se aceita dinheiro.
- [ ] Domínio próprio.

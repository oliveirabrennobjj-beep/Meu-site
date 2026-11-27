# Depósito do Gordinho

Site do depósito de bebidas da Vila Mataruna, Casimiro de Abreu (RJ). HTML, CSS e JS puros, publicado no GitHub Pages:
https://oliveirabrennobjj-beep.github.io/Meu-site/deposito-do-gordinho/

## Onde mexer
| Quero mudar | Arquivo |
|---|---|
| Produtos, preços, destaques, combos | `assets/js/produtos.js` |
| Fotos dos produtos | `assets/img/produtos/<nome>.webp` (o nome vai no campo `foto`) |
| WhatsApp, horário, modo prévia | `assets/js/config.js` |
| Endereço, avaliações, textos | `index.html` |
| Cores e fontes | topo de `assets/css/styles.css` |
| Fotos da loja | `assets/img/loja-fachada.webp`, `loja-geladeira-2.webp` (seção Nossa história) |
| Fotos de clima (provisórias, Unsplash) | `assets/img/clima/`: `hero-cerveja` (banner), `promo-whisky` (banner lateral), `banner-garrafas` e `banner-tampas` (2 promoções), `clube` (trocar por foto do dono no balcão). No `index.html` cada uma tem o comentário `FOTO PROVISÓRIA` |

Depois de mexer em `produtos.js`, rode `node deposito-do-gordinho/montar.mjs`: ele escreve os cards no `index.html` para a página abrir completa mesmo antes do JavaScript.

Foto de produto nova: imagem em fundo branco e recorte com
`convert foto.jpg -fuzz 6% -fill none -draw "color 0,0 floodfill" -trim -resize x640 produto.webp`.

## Modo prévia
`previa: true` em `config.js`: os botões de WhatsApp e Ligar só mostram um aviso. Quando o dono aprovar, trocar para `false`.

## Pendências (dependem do cliente)
- [ ] Preços reais (hoje: "Preço a confirmar") e combos.
- [ ] Lista real de produtos. As fotos de produto são de divulgação das marcas.
- [ ] Fotos da loja: fachada e geladeiras são do Google (perfil Estação das Bebidas, de 6 anos atrás). A fachada hoje tem letreiro "Depósito do Gordinho": vale tirar foto nova.
- [ ] Logo em alta (o atual foi recortado do print do WhatsApp).
- [ ] Bairros atendidos e taxa de entrega.
- [ ] Aceita dinheiro? Hoje o site diz Pix e cartão.
- [ ] Clube do Gordinho: confirmar com o dono se ele quer a lista de transmissão de promoções.
- [ ] Trocar as 5 fotos de clima por fotos reais da loja (dá para tirar com o celular, de noite, luz quente).
- [ ] Domínio próprio.

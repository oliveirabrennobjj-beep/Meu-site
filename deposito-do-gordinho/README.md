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
| Fotos da loja | `assets/img/loja-*.webp` e a caixa "Foto do balcão em breve" no `index.html` (seção A loja) |

Depois de mexer em `produtos.js`, rode `node deposito-do-gordinho/montar.mjs`: ele escreve os cards no `index.html` para a página abrir completa mesmo antes do JavaScript.

Foto de produto nova: imagem em fundo branco e recorte com
`convert foto.jpg -fuzz 6% -fill none -draw "color 0,0 floodfill" -trim -resize x640 produto.webp`.

## Modo prévia
`previa: true` em `config.js`: os botões de WhatsApp e Ligar só mostram um aviso. Quando o dono aprovar, trocar para `false`.

## Pendências (dependem do cliente)
- [ ] Preços reais (hoje: "Preço a confirmar") e combos.
- [ ] Lista real de produtos. As fotos de produto são de divulgação das marcas.
- [ ] Fotos que o Brenno vai tirar: balcão (caixa marcada na seção A loja) e, se quiser, trocar fachada e geladeiras por fotos melhores.
- [ ] Logo em alta (o atual foi recortado do print do WhatsApp).
- [ ] Bairros atendidos e taxa de entrega.
- [ ] Aceita dinheiro? Hoje o site diz Pix e cartão.
- [ ] Domínio próprio.

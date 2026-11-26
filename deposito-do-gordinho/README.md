# Depósito do Gordinho: prévia do site

Depósito de bebidas com entrega na Vila Mataruna, Casimiro de Abreu (RJ). Prévia para mostrar ao dono até sábado.

## Como ver
Abra `index.html` no navegador. Não precisa instalar nada.

## Onde mudar
- **Textos, telefone, horário, avaliações e produtos:** `assets/js/config.js`.
- **Cores e fontes:** topo de `assets/css/styles.css`.
- **Fotos dos produtos:** `assets/img/produtos/*.webp`, sem fundo. Produto novo: foto em fundo branco, recorte com `convert foto.jpg -fuzz 6% -fill none -draw "color 0,0 floodfill" -trim produto.webp` e uma linha no `config.js` (`img` e `cm`, a altura real).

## O que tem
1. Topo com 3 garrafas reais que sobem, flutuam e seguem o mouse.
2. Círculos de categoria (levam direto para a vitrine).
3. **Vitrine do Gordinho:** barra lateral com 5 tipos, garrafas em fotos reais no tamanho certo, curva em 3D, arrasta com o dedo, setas grandes, bolinhas e "Pedir esta" com o nome da bebida no WhatsApp.
4. Duas faixas (cerveja gelada, entrega) com zoom ao passar o mouse.
5. Grade de todos os produtos com filtro e botão "Pedir".
6. Como pedir em 3 passos, a loja (fotos reais do Google), avaliações reais correndo em faixa, endereço e horário.
7. Barra fixa de WhatsApp e Ligar no celular.

Movimento: entrada do topo, coisas aparecendo ao rolar, brilho nos botões verdes, garrafa que balança ao ser escolhida, nota do Google contando até 4,7. Tudo em CSS e JS leve (sem biblioteca), e tudo para quando o celular pede "reduzir movimento".

Pensado para idoso: letra de 19 px, fonte Atkinson Hyperlegible (feita para baixa visão), botões de 56 a 62 px de altura, alto contraste, nada se mexe sozinho.

## Pendências (dependem do cliente)
- [ ] **Lista real de produtos e preços.** A lista atual é de exemplo: cervejas e refrigerantes vistos nas fotos da loja, Breez Cooler do catálogo do WhatsApp, o resto é sugestão comum de depósito.
- [ ] Confirmar se vende doces e petiscos (paçoca, bala, amendoim, salgadinho).
- [ ] Número da casa: o Google mostra 1197 e o WhatsApp mostra 962. O site está sem número.
- [ ] Bairros atendidos e taxa de entrega.
- [ ] Aceita dinheiro? Hoje o site diz Pix e cartão.
- [ ] Logo em alta (o atual foi recortado do print do WhatsApp).
- [ ] Fotos de produto são de divulgação das marcas (tiradas de lojas online). Para o site oficial: o dono manda as fotos dele ou confirmamos o uso. As 3 fotos de ambiente são do Unsplash.
- [ ] Gin e Catuaba ficaram de fora (não achei foto boa).
- [ ] História do depósito: nome do Gordinho, como começou. A citação é do post de 5 anos (parte do texto estava coberta no print; confirmar).
- [ ] Domínio próprio (ex.: depositodogordinho.com.br).

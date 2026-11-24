# Design

## Mundo

Casa de carne em modo escuro, no clima da referência do Brenno: marrom-preto quente, luz de bar desfocada, brasas subindo e o hambúrguer grande flutuando no escuro. Título condensado e grosso, com uma linha manuscrita dourada. Tudo com cantos pouco arredondados, sem cara de modelo pronto.

## Cores

| Papel | Valor |
|---|---|
| Fundo | `#0B0705` (faixas `#1B120D`, rodapé `#070403`) |
| Dourado (botões, linha manuscrita, ícones, bordas finas) | `#D9A441`, hover `#EDC271` |
| Brasa (partículas, brilho, pontos) | `#F29A38` |
| Creme (texto) | `#F3E9D8` |
| Cinza quente (apoio) | `#B3A593` |

## Tipografia

- Títulos: Anton, caixa alta.
- Linha de destaque: Yellowtail, dourado, uma por bloco ("do nosso jeito.", "toda a família", "cozinha").
- Texto e botões: Barlow 400, 500 e 700; botões e menu em caixa alta com espaçamento. Fontes em `assets/fonts/`.

## Componentes

- Cabeçalho com logo + "SteakHouse", menu em caixa alta, ícone do pedido e botão dourado retangular com seta.
- Topo: fundo com luzes de bar feitas em CSS, canvas de brasas, burger com `mix-blend-mode: screen` e bordas esmaecidas, selo redondo com texto girando devagar e o touro no centro.
- Fileira "Nossas assinaturas": 4 mini cartões com miniatura, nome e botão "+" que monta o pedido.
- Faixa de 4 diferenciais com ícone fino em medalha dourada.
- Faixa que corre, ambiente com a foto real do Espaço Kids, galeria que rola, delivery com brilho de brasa, rodapé.
- Gaveta do pedido: lista com +/−, observações e envio pelo WhatsApp.

## Botões

Retangulares (raio 6 px), caixa alta, texto pequeno e espaçado, seta que anda no hover. Nada de pílula larga nem botão de largura total no celular.

## Detalhe assinatura

O hambúrguer saindo do escuro no meio das luzes e das brasas, com o selo ao lado.

## Regras

- Nada escrito por cima do produto.
- Um par de botões: dourado cheio e contorno creme.
- Nada inventado: preço, cardápio, ano de fundação e horário não confirmados ficam de fora; o site mostra "valor pelo WhatsApp".
- Brasas e giro do selo desligam com "reduzir movimento".

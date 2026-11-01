# Design

## Direção

"Noite de açaí": roxo profundo e magenta da referência do Pinterest, com o amarelo da coroa do logo como cor de ação. Elegante e divertido ao mesmo tempo: títulos grossos em caixa alta e uma palavra em letra de mão amarela.

## Cores (`:root` em `assets/css/styles.css`)

| Token | Hex | Uso |
|---|---|---|
| `--noite` | #1e0b3a | fundo do topo, rodapé, títulos |
| `--roxo-escuro` | #3b1373 | gradientes |
| `--roxo` | #5b21b6 | botões secundários, kicker |
| `--roxo-marca` | #8b55f0 | logo, 2º cartão de promoção |
| `--magenta` | #a3127a | respingo, palavra manuscrita em fundo claro, selos |
| `--amarelo` | #f7d51d | botões de pedido, palavra manuscrita em fundo escuro |
| `--creme` | #fbf7ff | fundo das seções claras |
| `--lilas` | #efe6ff | chips, mapa |

## Fontes

- Títulos: Bricolage Grotesque 800.
- Palavra de destaque: Kaushan Script (amarelo no escuro, magenta no claro).
- Texto: Nunito 400–800.

## Detalhe assinatura

Topo com três copos em fotos com moldura branca, abertos em leque sobre um respingo magenta, e o título "Sabor que *coroa* seu dia." com "coroa" manuscrito e inclinado.

## Componentes

- Botão pílula (raio 999px, 52 px; 44 px no pequeno). Amarelo = pedir.
- Cartão: branco, raio 22px, sombra roxa suave, foto quadrada, selo magenta.
- Blocos grandes (promo, monte o seu): raio 36px, gradiente roxo.
- Entrada suave ao rolar; desligada com `prefers-reduced-motion`.

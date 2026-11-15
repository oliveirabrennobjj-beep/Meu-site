# Design — Carvão

Registro do sistema visual como foi construído (`assets/css/styles.css`).

## Direção

Noite, brasa e pouca coisa na tela. A página é quase preta e a única cor é a da brasa.
As fotos são escuras, com o hambúrguer saindo do fundo. A identidade veio da referência
do Brenno; o trabalho foi trocar o que era de mentira por coisa real.

## Cores (`:root`)

| Token | Hex | Uso |
|---|---|---|
| `--ink` | `#0C0B0A` | Fundo da página |
| `--smoke` | `#151312` | Faixa do processo, cartão "Onde", cortina das fotos |
| `--bone` | `#F4EFE7` | Texto principal |
| `--ash` | `#9A9186` | Texto de apoio e rótulos (6,3:1 sobre o fundo) |
| `--ember` | `#E4552B` | Ação (pedir), palavra em itálico, números do processo |
| `--line` | `rgba(244,239,231,.14)` | Divisórias |

## Tipografia

- Títulos: **Bricolage Grotesque** 400–500, caixa alta, tracking -0.03 a -0.04em.
- Palavra de destaque: **Instrument Serif** itálico, cor brasa ("carne", "espera", "atalho", "comer?").
- Texto: **Inter** 400–600, 16–17px, entrelinha 1.65. Rótulos em 12px, caixa alta, tracking largo.

## Componentes

- Botões em pílula: brasa (principal) e contorno claro (secundário), 46px de altura.
- Cardápio em lista: cada linha é um link de pedido. Celular mostra miniatura 4:5; computador com mouse mostra só letra e uma prévia que segue o cursor.
- Processo: número em serifa, texto e uma foto 4:3 por etapa.
- Galeria: faixa horizontal de fotos 4:5, arrasta com o dedo, com o mouse ou com as setas.
- "Onde": cartão com os dados e uma foto com o endereço em letra grande, que abre o Google Maps.
- Barra fixa no celular com "Ver o menu" e "Pedir no WhatsApp", aparece depois do topo.

## Detalhe assinatura

O topo: título gigante à esquerda e o hambúrguer em close saindo do escuro à direita, com um brilho de brasa por baixo.

## Movimento

- Ao carregar: as três linhas do título sobem e a foto do topo assenta. Uma vez só.
- Ao rolar: uma cortina sobe e mostra cada foto. O texto não se mexe.
- Letreiro do topo corre devagar e para com o mouse em cima.
- Tudo desliga com `prefers-reduced-motion`.

## Pontos de quebra

1100px (colunas viram uma), 860px (menu do celular, foto do topo vai para cima do título, barra fixa), 620px (foto do processo desce), 520px (cardápio sem numeração).

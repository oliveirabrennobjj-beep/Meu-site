# Design — Kitanda Hortifruti

Registro do sistema visual como foi construído (`assets/css/styles.css`).

## Direção

Vitrine verde-escura no espírito da referência "GreenBasket" escolhida pelo dono,
tingida com a marca real da Kitanda: o laranja da pera do logo nos botões e a
etiqueta vermelha das ofertas do Instagram como selo.

## Cores (`:root`)

| Token | Hex | Uso |
|---|---|---|
| `--mata-700` | `#0e3b25` | Fundo da página |
| `--mata-600` / `--mata-500` | `#134a2f` / `#1b5c3b` | Painéis (boas-vindas, por que, pedido) |
| `--mata-900` | `#08281a` | Rodapé e texto sobre botões claros |
| `--linha` | `#2b6446` | Bordas e divisórias |
| `--folha` | `#8cc63f` | Ícones, sublinhado do menu |
| `--laranja` | `#f28c28` | Ação principal (WhatsApp) e "Hortifruti" |
| `--amarelo` | `#f6c445` | Foco, selo, botão do Instagram |
| `--etiqueta` | `#e0262b` | Etiqueta de oferta, girada -4° |
| `--creme` | `#fbf8f0` | Cartões de categoria, produto e loja |
| `--texto` / `--texto-2` | `#f4f7f1` / `#cfe3c4` | Texto sobre verde |
| `--tinta` / `--tinta-2` | `#10291c` / `#4b5f52` | Texto sobre creme |

## Tipografia

- Títulos: **Bricolage Grotesque** 800, tracking -0.02 a -0.035em.
- Texto: **Nunito Sans** 400–800, 16px, entrelinha 1.6.

## Componentes

- Botões em pílula: laranja (principal), contorno claro (secundário), verde (cartão), amarelo (Instagram).
- Cartões creme com raio 16px e sombra escura deslocada.
- Foto do hero em arco, com selo giratório "Qualidade que alimenta" e etiqueta vermelha.
- Ícones SVG próprios (traço 1.9) em sprite no topo do `index.html`.

## Movimento

Um único momento de entrada no hero (título, foto revelada de baixo para cima, etiqueta "colada").
Selo gira devagar. Tudo desliga com `prefers-reduced-motion`.

## Pontos de quebra

Celular primeiro; 560px (grades de 2→3 colunas) e 860px (menu completo, hero em duas colunas).

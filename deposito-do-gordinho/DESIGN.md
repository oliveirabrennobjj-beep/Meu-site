# DESIGN: Depósito do Gordinho (v2, estilo loja de bebidas)

Referências do Brenno: Winesto e Winestyle (e-commerce de bebidas). Adaptado a depósito de bairro que vende pelo WhatsApp.

## Cores (do logo)
| Nome | Hex | Uso |
|---|---|---|
| carvão | #141210 | topo, banner, loja, rodapé, botão Pedir |
| dourado | #e0b03a | botões principais, títulos em fundo escuro, ícones |
| dourado texto | #7d5e0c | dourado em fundo claro (contraste AA) |
| verde mascote | #8db63c | só no ponto "Aberto agora" |
| vinho | #4a191a | aviso do topo, slide 2, promo, selo de desconto |
| creme / névoa | #f7f5f0 / #eeece6 | áreas de produto e fundo da foto |

## Tipografia
- Títulos: Marcellus em maiúsculas, espaçado (serifa fina, cara de adega).
- Texto: Atkinson Hyperlegible 18 a 19 px (legível para idoso).

## Regras
- Cantos de 6 px em tudo; sombra só no hover do card.
- Sem gradiente, sem brilho, sem emoji de enfeite. Ícones de linha dourados.
- Animação só ao rolar (aparece 14 px) e ao passar o mouse. O carrossel passa a cada 7 s e para quando a pessoa mexe.
- Todo conteúdo está no HTML (montar.mjs); o JS só filtra, busca e calcula aberto/fechado.
- Mascote: card de entrega, citação da loja, rodapé.

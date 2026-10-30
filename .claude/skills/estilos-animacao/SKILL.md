---
name: estilos-animacao
description: Catálogo de 20 estilos visuais/animação (partículas, metal líquido, holográfico, neon, tipografia cinética, isométrico, clay 3D, quadrinhos, VHS retrô, neo-brutalismo, wireframe 3D, glassmorphism, ASCII art, gradient mesh, split-flap, halftone, blueprint, Bauhaus, pixel art, art déco) com técnica, paleta, movimento e prompt pronto. Use ao criar hero, landing page, card, loader, banner ou qualquer animação web nos projetos deste repositório, ou quando o usuário citar um desses estilos pelo nome ou número.
argument-hint: "[número ou nome do estilo] [onde aplicar]"
---

# 20 estilos de animação

Fonte: reel de @_daniellcruz, "20 estilos de animação absurdos no Claude". A lista é dele; técnicas e prompts foram escritos para este repositório.

## Como usar

1. O usuário escolhe um estilo pelo número ou nome (ex.: "hero no estilo 20", "loader split-flap"). Se não escolher, sugira 2 ou 3 que combinem com a marca do projeto.
2. Siga a **técnica** e a **paleta** do estilo; adapte as cores aos tokens do projeto, se ele tiver.
3. Regras que valem para todos:
   - HTML/CSS/JS puro, sem dependência obrigatória. Three.js só nos estilos 3D (7, 11), via CDN com versão fixa.
   - Animar só `transform`, `opacity` e `filter`; canvas com `requestAnimationFrame`.
   - Respeitar `prefers-reduced-motion: reduce` (desligar ou deixar estático).
   - Pausar canvas fora da tela (`IntersectionObserver`) e quando a aba estiver oculta.
   - Contraste AA no texto por cima da animação; testar em celular (360px).

## Catálogo

| # | Estilo | Técnica | Paleta | Movimento |
|---|--------|---------|--------|-----------|
| 1 | Partículas | Canvas 2D: 150–600 pontos com velocidade; linhas entre os vizinhos próximos; reage ao mouse/toque | Fundo escuro, pontos claros, 1 cor de destaque | Deriva lenta, fuga ou atração pelo cursor |
| 2 | Metal líquido | Blobs com SVG `feTurbulence` + `feDisplacementMap`, ou shader de ruído em canvas; gradiente cromado | Prata, grafite, reflexo azulado | Ondulação contínua e viscosa (6–12 s) |
| 3 | Holográfico | `conic-gradient` iridescente + `mix-blend-mode`; tilt 3D seguindo o cursor; brilho que varre | Ciano, magenta, lilás, verde-água sobre prata | Inclinação com perspectiva, shimmer em loop |
| 4 | Neon | `text-shadow`/`box-shadow` em camadas; flicker com `@keyframes` em `opacity` | Preto, rosa #ff2d95, ciano #00e5ff | Liga com falha, piscadas raras |
| 5 | Tipografia cinética | Letras em `span`; entrada escalonada por caractere (stagger), máscara, troca de peso de fonte variável | Duas cores de alto contraste | Palavras entram, giram, esticam no ritmo |
| 6 | Isométrico | Cubos com `transform: rotateX(60deg) rotateZ(45deg)` ou SVG isométrico; peças empilhadas | Pastéis com 3 tons por face (claro/médio/escuro) | Blocos sobem e encaixam, câmera fixa |
| 7 | Clay 3D | Three.js com `MeshStandardMaterial` fosco, cantos arredondados, luz suave e sombra de contato | Pastéis saturados, fundo claro | Objetos quicam com squash & stretch |
| 8 | Quadrinhos | Contorno preto grosso, retícula de pontos, balões, onomatopeias ("POW!") | CMYK: amarelo, vermelho, azul, preto | Quadros entram em sequência, tremor no impacto |
| 9 | VHS retrô | Scanlines, aberração cromática (canais RGB deslocados), ruído, faixa de tracking, timestamp "PLAY ▶" | Cores lavadas, magenta/ciano, preto | Jitter horizontal, glitch esporádico |
| 10 | Neo-brutalismo | Bordas pretas 3px, sombra sólida deslocada (`8px 8px 0 #000`), tipografia grande, sem gradiente | Amarelo, rosa, verde-limão chapados | Botões "afundam" no clique, cartões batem no lugar |
| 11 | Wireframe 3D | Three.js `wireframe: true` ou malha em canvas; terreno ou objeto em linhas | Fundo preto, linhas verdes ou ciano | Rotação lenta, voo sobre o terreno |
| 12 | Glassmorphism | `backdrop-filter: blur()` sobre blobs coloridos animados; borda branca translúcida | Fundo vibrante, vidro branco 10–20% | Blobs flutuam atrás do vidro |
| 13 | ASCII art | Grade de caracteres em `<pre>` ou canvas; brilho de imagem/vídeo convertido em `@%#*+=-:. ` | Monoespaçada verde/âmbar no preto | Caracteres se reorganizam, efeito "decifrando" |
| 14 | Gradient mesh | 3–5 blobs radiais grandes com `filter: blur(80px)` ou WebGL; grão por cima | Gradientes suaves e saturados | Fluxo lento e orgânico (15–30 s) |
| 15 | Split-flap | Placas de aeroporto: cada letra em 2 metades com `rotateX` | Preto, cinza-chumbo, letras brancas ou amarelas | Letras viram em cascata até o texto final, com "clac" visual |
| 16 | Halftone | Pontos cujo raio segue o brilho da imagem (canvas) ou `radial-gradient` repetido | 1–2 cores + papel creme | Pontos pulsam e revelam a imagem |
| 17 | Blueprint | Fundo azul com grade, linhas brancas finas, cotas e anotações técnicas; SVG com `stroke-dashoffset` | Azul #1e3a8a, branco, ciano claro | Traços se desenham sozinhos, régua e medidas aparecem |
| 18 | Bauhaus | Círculos, quadrados e triângulos chapados; grid rígido; tipografia geométrica | Vermelho, amarelo, azul, preto, creme | Formas giram, deslizam e se recompõem |
| 19 | Pixel art | `image-rendering: pixelated`, sprites em canvas pequeno escalado, fonte pixel | Paleta limitada (8–16 cores) | Animação por quadros (steps), sem interpolação |
| 20 | Art déco | Raios de sol em leque, arcos concêntricos, linhas finas douradas, simetria; SVG com `stroke-dashoffset` | Preto, dourado #c9a96e, creme | Raios se desenham do centro, brilho dourado lento |

## Prompts prontos

Troque `[ELEMENTO]` por hero, card, loader, botão, banner, página etc.

1. **Partículas**: "Crie um [ELEMENTO] com fundo de partículas em canvas que se conectam por linhas quando estão próximas e fogem do cursor. Fundo escuro, partículas claras, uma cor de destaque."
2. **Metal líquido**: "Crie um [ELEMENTO] com um blob de metal líquido cromado que ondula sem parar, usando filtros SVG de turbulência e deslocamento."
3. **Holográfico**: "Crie um [ELEMENTO] em estilo cartão holográfico: gradiente iridescente, inclinação 3D seguindo o mouse e um brilho que atravessa a superfície."
4. **Neon**: "Crie um [ELEMENTO] com letreiro neon rosa e ciano sobre fundo preto, com brilho em camadas e uma piscada ocasional, como lâmpada falhando."
5. **Tipografia cinética**: "Crie um [ELEMENTO] em tipografia cinética: cada letra entra em sequência, as palavras giram e mudam de peso no ritmo."
6. **Isométrico**: "Crie um [ELEMENTO] com uma cena isométrica de blocos em tons pastel que sobem e se encaixam um a um."
7. **Clay 3D**: "Crie um [ELEMENTO] com objetos 3D de massinha em tons pastel (Three.js), foscos e arredondados, quicando com squash & stretch."
8. **Quadrinhos**: "Crie um [ELEMENTO] estilo história em quadrinhos: contornos pretos grossos, retícula de pontos, balões de fala e onomatopeias animadas."
9. **VHS retrô**: "Crie um [ELEMENTO] com efeito de fita VHS: scanlines, aberração cromática, ruído, tremor horizontal e o texto PLAY ▶ no canto."
10. **Neo-brutalismo**: "Crie um [ELEMENTO] neo-brutalista: bordas pretas grossas, sombras sólidas deslocadas, cores chapadas e botões que afundam ao clicar."
11. **Wireframe 3D**: "Crie um [ELEMENTO] com um terreno em wireframe 3D verde sobre fundo preto, com a câmera voando lentamente por cima."
12. **Glassmorphism**: "Crie um [ELEMENTO] em glassmorphism: painéis de vidro fosco translúcido sobre blobs coloridos que flutuam ao fundo."
13. **ASCII art**: "Crie um [ELEMENTO] em ASCII art animado: uma forma feita de caracteres monoespaçados que se embaralham e se decifram."
14. **Gradient mesh**: "Crie um [ELEMENTO] com fundo de gradient mesh: manchas de cor grandes e desfocadas que fluem devagar, com textura de grão."
15. **Split-flap**: "Crie um [ELEMENTO] com painel split-flap de aeroporto: as letras viram uma a uma até formar o texto final."
16. **Halftone**: "Crie um [ELEMENTO] em halftone: uma imagem formada por pontos de tamanhos diferentes que pulsam e se revelam."
17. **Blueprint**: "Crie um [ELEMENTO] estilo blueprint: fundo azul com grade, linhas técnicas brancas que se desenham sozinhas, cotas e anotações."
18. **Bauhaus**: "Crie um [ELEMENTO] estilo Bauhaus: círculos, quadrados e triângulos em vermelho, amarelo e azul que giram e se reorganizam num grid."
19. **Pixel art**: "Crie um [ELEMENTO] em pixel art: sprites com paleta limitada, animação quadro a quadro e fonte pixelada."
20. **Art déco**: "Crie um [ELEMENTO] art déco: raios de sol dourados em leque sobre fundo preto, arcos concêntricos que se desenham do centro e brilho dourado lento."

## Combinações que funcionam

- Restaurante/padaria elegante: 20 (art déco) ou 18 (Bauhaus).
- Tecnologia/SaaS: 1 (partículas), 12 (glassmorphism), 14 (gradient mesh).
- Jogos/música: 4 (neon), 9 (VHS), 19 (pixel art).
- Portfólio/agência: 5 (tipografia cinética), 10 (neo-brutalismo), 17 (blueprint).
- Avisos e placares: 15 (split-flap).

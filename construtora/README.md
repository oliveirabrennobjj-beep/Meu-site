# Prumo Construtora — site institucional

Site estático (HTML, CSS e JavaScript puros, sem build), pronto para Vercel ou GitHub Pages.
"Prumo Construtora" é um **nome provisório**: troque pelo nome real.

## Como ver no computador

```bash
cd construtora
python3 -m http.server 8000
```

Abra <http://localhost:8000>.

## Estrutura

```
index.html          página única
css/style.css       cores, fontes e layout (variáveis no topo, em :root)
js/config.js        TODOS os dados da empresa, obras e depoimentos
js/main.js          monta galeria, lightbox, comparador, formulário e o vídeo do topo
assets/img/         favicon (coloque aqui as fotos reais em WebP)
assets/video/       coloque aqui o hero.mp4
```

## Design plan seguido

**Paleta**

| Nome | Hex | Uso |
|---|---|---|
| Grafite | `#1E2124` | fundos escuros, texto |
| Crepúsculo | `#2A323C` | céu ao anoitecer: fundo do topo e rodapé |
| Concreto | `#BFBBB4` | divisores |
| Cimento claro | `#ECEAE6` | seções claras |
| Madeira cumaru | `#8A5A3B` | botões |
| Bronze | `#A7864F` | detalhes finos, hover |
| Luz de janela | `#F2C98A` | progresso da régua de etapas, foco |

**Tipografia:** uma família só, Archivo (Google Fonts). Títulos na largura expandida (125%), peso 600–700,
tracking negativo; texto na largura normal, 17px, linhas de até ~56 caracteres.
Escala: 13 / 16 / 18 / 24 / 56 / 108 px (no computador).

**Layout**

```
TOPO     [logo]                       Obras Serviços Processo Sobre Contato [Pedir orçamento]
HERO     vídeo em tela cheia (300vh no computador, vídeo fixo avança com a rolagem)
         Do alicerce à
         última luz acesa.            ← título 2 linhas, alinhado à esquerda, embaixo
         subtítulo / [Pedir orçamento]
         |—Terreno—Fundação—Estrutura—Alvenaria—Acabamento—Entrega—|   ← linha de cota
SOBRE    [texto 5 col + números]  [foto grande 7 col]
OBRAS    título ............................ Todas Residencial Comercial Reforma
         [ largo 8 ][ 4 ]
         [ 4 ][ 4 ][ 4 ]
         [ 4 ][ largo 8 ]                    ← clique abre lightbox
ANTES    [texto 4 col] [comparador arrastável 8 col]
SERVIÇOS [lista editorial 7 col]       [foto fixa que troca no hover 5 col]
PROCESSO 1 ── 2 ── 3 ── 4 ── 5          ← linha do tempo (vertical no celular)
DEPOIM.  [foto grande][foto][foto] com citação embaixo
CONTATO  [formulário → WhatsApp 7 col] [dados + mapa 5 col]
RODAPÉ   logo / links / contatos / CNPJ / ano automático
```

**Princípios**
- A ousadia fica só no topo: a casa sendo construída enquanto a pessoa rola, com a linha de cota
  (desenho técnico de obra) marcando as etapas. A mesma linha reaparece, discreta, no Processo.
- O resto é disciplinado: muito respiro, cantos retos, sem sombras de cartão, sem animação de entrada nas seções.
- Clima da referência: casa pronta ao entardecer, luz quente nas janelas contra o céu azul.

**Revisão contra sites genéricos (o que troquei)**
- Números 01/02/03: só no Processo, que é sequência real.
- Rótulos em caixa alta acima dos títulos: removidos; os títulos falam sozinhos.
- Cards iguais com sombra: trocados por galeria de tamanhos diferentes e lista editorial.
- Duas fontes sans parecidas: trocadas por uma família só, variando a largura.
- Seta "→" nos botões e palavra destacada no título: não usadas.

## O que você precisa substituir

**Dados** (todos em `js/config.js`; o site mostra `[PREENCHER]` até serem preenchidos):
1. Nome da empresa (`empresa.nome`) — também no `<title>`, nas metas e no JSON-LD do `index.html`.
2. Cidade/UF, anos de mercado, obras entregues, m² construídos, CNPJ.
3. WhatsApp, Instagram, e-mail, endereço (o mapa aparece sozinho) e horário.
4. Local, área e prazo de cada obra.
5. Três depoimentos reais (com nome, cidade e autorização).
6. No `index.html`: troque `[CIDADE/UF]`, `[PREENCHER]` e `[UF]` no `<head>` (SEO e schema.org).

**Fotos** (hoje vêm do Unsplash, licença livre; troque por fotos das obras da empresa):
1. Topo: casa pronta ao entardecer (também é o poster do vídeo e a imagem de compartilhamento).
2. Apresentação: uma obra entregue, foto horizontal.
3. Obras: 2 ou 3 fotos de cada obra.
4. Antes e depois: **o mesmo ângulo** do canteiro e da obra pronta (hoje são casas diferentes).
5. Serviços: uma foto por serviço.
6. Depoimentos: foto da obra de cada cliente.

Para usar foto local, coloque em `assets/img/` e troque o link, por exemplo
`src: "assets/img/casa-lago-azul.webp"`.

## Vídeo do topo (hero.mp4)

1. Gere no Google Flow (ou outro) a partir da foto da casa pronta. Prompt usado na referência:
   > Vídeo cinematográfico em timelapse, câmera totalmente estática, da construção desta casa: começa com o terreno vazio, fundação de concreto, estrutura de pilares e vigas, paredes, vidros e acabamento, até a casa pronta com as luzes acesas ao entardecer. Movimento contínuo e suave, iluminação realista, sem pessoas em primeiro plano, 8 segundos.
2. Para o vídeo avançar liso com a rolagem, converta com quadro-chave em todo quadro e sem áudio:
   ```bash
   ffmpeg -i entrada.mp4 -vf "scale=1920:-2" -c:v libx264 -g 1 -crf 24 -an -movflags +faststart hero.mp4
   ```
3. Salve como `assets/video/hero.mp4`. Pronto: o site detecta sozinho.

Como o topo se comporta:
- Computador: seção de 300vh, vídeo fixo avançando com a rolagem e a régua de etapas acompanhando.
- Celular: vídeo em autoplay, mudo, em loop (sem scrub, para não travar).
- Sem vídeo, ou com "reduzir movimento" ativado: só a foto, e a régua se completa uma vez.

## Publicar na Vercel

1. Entre em <https://vercel.com> com a conta do GitHub.
2. **Add New → Project** e escolha o repositório `Meu-site`.
3. Em **Root Directory**, escolha `construtora`. Framework: **Other**. Sem comando de build.
4. Clique em **Deploy**. Em 1 minuto sai o link `*.vercel.app`.
5. Domínio próprio: **Settings → Domains → Add** e siga as instruções de DNS.

No GitHub Pages ele também sai em `https://oliveirabrennobjj-beep.github.io/Meu-site/construtora/` depois do merge.

## Testado

- Larguras 375, 768 e 1440 px sem rolagem lateral.
- Lighthouse local: desempenho 94, acessibilidade 97, boas práticas 96, SEO 100
  (medido com as fotos do Unsplash bloqueadas na máquina de teste).
- Vídeo de teste: o scrub vai de 0 a 8 s com a rolagem; no celular toca em loop.

# Vídeo do orçamento (BN Digital)

Vídeo vertical para Reels, 1080×1920, 30 fps, 62 s. Uma impressora imprime o orçamento e o vídeo mostra o que vem no site, o preço do aluguel, as placas NFC e o botão de WhatsApp.

| Arquivo | O que é |
|---|---|
| `orcamento.mp4` | o vídeo pronto para postar |
| `capa.jpg` | capa (também é o 1º quadro do vídeo) |
| `legenda.txt` | legenda pronta para o post |
| `roteiro.md` | cena a cena, com os tempos |
| `fonte/textos.js` | **todos os textos e preços** (troque aqui) |
| `fonte/index.html` | as cenas e as animações |
| `fonte/synth.py` | trilha e efeitos sonoros (originais, sem música de terceiros) |
| `fonte/assets/` | prints dos sites, logo e fontes |

## Trocar um texto ou o preço

1. Edite `fonte/textos.js` (preço em `precoMin`, `precoMax`; itens em `inclusos`; extras em `extras`).
2. Gere de novo: `bash fonte/gerar.sh` (uns 8 minutos).

Mantenha 7 itens em `inclusos`, 3 em `extras`, 4 em `sites` e 7 em `placas`: os tempos das animações e dos sons contam com isso.
Para ver uma cena sem gerar tudo: `python3 -m http.server 8765` na raiz do repositório e `python3 fonte/capture.py stills work/stills 12 30 43` (tempos em segundos).

## Trocar um site da cena 3

Tire o print do site no computador (1440 px de largura) e no celular (390 px) e salve como `fonte/assets/full-<nome>-desk.jpg` e `full-<nome>-mob.jpg`. Depois troque o `img`, o `nome` e o `tipo` em `sites` no `textos.js`.

Os prints dos sites são tirados por `fonte/prints.py` (rode de dentro de `work/`), que troca nomes de marca por nomes fictícios antes de fotografar. Nunca use print de site com nome de outra marca.

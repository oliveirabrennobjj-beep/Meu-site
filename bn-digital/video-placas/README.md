# Vídeo das placas (BN Digital)

Vídeo vertical para Reels, 1080×1920, 30 fps, 44 s. Mostra a placa de mesa com cardápio digital (o cliente encosta o celular e o cardápio abre) e as placas de Wi-Fi, Pix, Instagram, WhatsApp e avaliação no Google. Feito para restaurantes, bares e lanchonetes.

| Arquivo | O que é |
|---|---|
| `placas.mp4` | o vídeo pronto para postar |
| `capa.jpg` | capa (também é o 1º quadro do vídeo) |
| `legenda.txt` | legenda pronta para o post |
| `roteiro.md` | cena a cena, com os tempos |
| `fonte/textos.js` | **todos os textos** (troque aqui) |
| `fonte/index.html` | as cenas e as animações |
| `fonte/synth.py` | trilha e efeitos sonoros (originais) |
| `fonte/assets/` | fotos, logo e fontes |

## Trocar um texto

1. Edite `fonte/textos.js`.
2. Gere de novo: `bash fonte/gerar.sh` (uns 6 minutos).

Mantenha 4 itens em `pratos`, 3 em `vantagens` e 6 em `placas`: os tempos das animações e dos sons contam com isso.

## Fotos

- Hambúrgueres: Unsplash (licença livre para uso comercial), as mesmas do modelo `carvao/` (créditos em `carvao/README.md`).
- Placa no balcão: foto real da BN Digital (`bn-digital/public/nfc/`).
- "Burgeria", a mesa e os preços do cardápio são exemplos.

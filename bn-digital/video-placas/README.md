# Vídeo das placas NFC (BN Digital)

Vídeo vertical para Reels, 1080×1920, 30 fps, ~1min35. Começa na placa de mesa com cardápio digital e passa por cada placa sendo usada (Wi-Fi, Pix, Instagram, WhatsApp, Google), as outras placas, a placa personalizada com a cara do negócio, e termina no botão do WhatsApp.

| Arquivo | O que é |
|---|---|
| `placas.mp4` | o vídeo pronto para postar |
| `capa.jpg` | capa (também é o 1º quadro do vídeo) |
| `legenda.txt` | legenda pronta para o post |
| `roteiro.md` | cena a cena |
| `fonte/textos.js` | **textos da tela** |
| `fonte/locucao.json` | **o que a voz fala**, uma frase por cena |
| `fonte/index.html` | cenas e animações (os tempos vêm de `fonte/tempo.js`) |
| `fonte/synth.py` | trilha e efeitos (originais); mistura a voz se ela existir |

## Gerar de novo

```bash
bash fonte/gerar.sh      # monta os tempos, captura os quadros, faz a trilha e o MP4 (~15 min)
```

## Voz

Os tempos das cenas seguem a duração de cada fala. Sem voz, o vídeo usa uma estimativa e sai só com música.
Para pôr a voz: gere as falas com `python3 fonte/gerar_locucao.py` (Gemini TTS, plano grátis tem cota por dia) ou coloque um áudio por cena em `work/vo/<cena>.wav` (ou `.mp3`, por exemplo vindo do ElevenLabs), com os nomes de `locucao.json` (`gancho`, `placa`, `demo`...). Depois rode `bash fonte/gerar.sh`.

## Fotos

- Hambúrgueres: Unsplash (licença livre para uso comercial), as mesmas do modelo `carvao/` (créditos em `carvao/README.md`).
- Placa no balcão: foto real da BN Digital (`bn-digital/public/nfc/`).
- "Burgeria", "Navalha", "Açaí da Orla", a chave Pix, o perfil e os preços são exemplos.

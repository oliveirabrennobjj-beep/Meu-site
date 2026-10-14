# Vídeo de divulgação da BN Digital

Feito com a skill `/brag` (no modo `/brag-slim`): vídeo vertical para Reels/TikTok, 1080×1920, 30 fps.

- **`brag.mp4` (versão 2, 29,5 s):** abre com uma pergunta, mostra um pedido completo até a mensagem pronta no WhatsApp, detalhes dos trabalhos (com a Kitanda), a avaliação abrindo pela placa e termina com o contato.
- **`brag-v1.mp4` (versão 1, 22 s):** a primeira versão.

| Arquivo | O que é |
|---|---|
| `brag.mp4` | o vídeo pronto para postar |
| `brag.jpg` | capa (também é o 1º quadro do vídeo) |
| `share-copy.txt` | legenda pronta para o post |
| `brag-plan.md` | roteiro cena a cena |
| `fonte/v2`, `fonte/v1` | como cada versão foi feita: `index.html` (as cenas), `capture.py` (captura os quadros), `synth.py` (trilha original) |

A trilha é original, gerada por `synth.py`, sem música de terceiros. Nas redes, dá para trocar por um áudio em alta do próprio Instagram/TikTok.

Para refazer: na pasta `bn-digital`, rode `python3 -m http.server 8765`, copie `fonte/v2/` para `brag-output/work/v2/` e rode
`python capture.py frames 30 22 frames`, `python synth.py` e o `ffmpeg` (ver histórico do commit).

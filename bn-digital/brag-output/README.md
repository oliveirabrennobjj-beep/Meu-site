# Vídeo de divulgação da BN Digital

Feito com a skill `/brag` (no modo `/brag-slim`): vídeo vertical para Reels/TikTok, 22 s, 1080×1920, 30 fps.

| Arquivo | O que é |
|---|---|
| `brag.mp4` | o vídeo pronto para postar |
| `brag.jpg` | capa (também é o 1º quadro do vídeo) |
| `share-copy.txt` | legenda pronta para o post |
| `brag-plan.md` | roteiro cena a cena |
| `fonte/` | como o vídeo foi feito: `index.html` (as cenas), `capture.py` (captura os quadros), `synth.py` (trilha original) |

A trilha é original, gerada por `synth.py`, sem música de terceiros. Nas redes, dá para trocar por um áudio em alta do próprio Instagram/TikTok.

Para refazer: na pasta `bn-digital`, rode `python3 -m http.server 8765`, copie `fonte/` para `brag-output/work/` e rode
`python capture.py frames 30 22 frames`, `python synth.py` e o `ffmpeg` (ver histórico do commit).

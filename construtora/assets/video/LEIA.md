# Vídeo do topo

Coloque aqui o arquivo `hero.mp4` (timelapse da casa sendo construída).
Enquanto ele não existir, o site mostra só a foto da casa pronta.

Para o vídeo avançar liso com a rolagem, converta antes:

```bash
ffmpeg -i entrada.mp4 -vf "scale=1920:-2" -c:v libx264 -g 1 -crf 24 -an -movflags +faststart hero.mp4
```

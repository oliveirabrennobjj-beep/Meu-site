# Vídeos — Contos da Madrugada (Remotion)

Um template para todos os episódios. Cada episódio fica em `src/episodes.ts`
(cenas, efeitos e capa) e as cenas sincronizam com a narração pelas frases
(`"@frase|+0.5"`), usando os tempos das palavras em `src/words/<id>.json`.

| Episódio | Narração | Palavras | Status |
|---|---|---|---|
| 3h33 | ✅ `public/narracao-3h33.mp3` | ✅ reais | ✅ renderizado |
| loira | ⏳ falta gerar | estimadas | animação pronta |
| varginha | ⏳ falta gerar | estimadas | animação pronta |

Para um episódio novo: coloque `public/narracao-<id>.mp3`, transcreva para
`src/words/<id>.json` (`[{ "t": "palavra", "s": 0.1, "e": 0.4 }]`) e adicione em `EPISODES`.

```bash
npm i
npx remotion render Conto-3h33 out/3h33.mp4
npx remotion still Capa-3h33 out/capa.png
ffmpeg -i out/3h33.mp4 -c:v copy -af loudnorm=I=-14:TP=-1.5:LRA=11 -c:a aac -b:a 192k -movflags +faststart 3h33_final.mp4
```

Sem as narrações de `loira` e `varginha` o Studio ainda abre, mas esses dois ficam mudos.

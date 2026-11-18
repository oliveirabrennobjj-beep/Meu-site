---
name: checar-viral
description: Checagem de um corte pronto antes de postar (TikTok, Reels, Shorts). Dá nota de 0 a 100 para viralização, comentários e retenção, avalia os 6 pontos (persona, ângulo, formato, hook, body, CTA) com o segundo exato de cada problema, lista as 3 mudanças que mais ajudam e reescreve o gancho e a pergunta. Use quando o Brenno pedir para analisar, checar ou avaliar um corte ou short, perguntar se um vídeo vai viralizar, ou antes de entregar cortes prontos.
---

# Checar viral

Reproduz a lógica de analisadores pagos (como o Nex Viral Predict, da Nextags): a IA assiste os quadros, com mais atenção aos 3 primeiros segundos e ao final, ouve a fala com os tempos e dá as notas. Aqui quem assiste é você.

## 1. Preparar

```bash
/home/user/editar-venv/bin/python cortes/checar.py <video.mp4>
```

O script grava `<video>.checagem/` com `inicio.jpg` (3 primeiros segundos, 4 quadros por segundo), `geral.jpg`, `fim.jpg`, `fala.txt` e `medidas.json`, e imprime as medidas. Se o `editar-venv` não existir, crie com `uv venv --python 3.12` e instale `numpy opencv-python-headless pillow`. A fala precisa do `~/cortes-venv` com `faster-whisper`.

## 2. Assistir

Leia as três folhas (Read nas imagens) e o `fala.txt`. Antes de dar nota, anote o que acontece no segundo 0 a 1, no 1 a 3 e no final.

## 3. Dar as notas

Para cada um dos 6 pontos, dê nota de 0 a 10, o porquê e o segundo:

| Ponto | Pergunta | Sinais de nota alta |
|---|---|---|
| Persona | Fala com o público certo? | Quem posta corte de streamer fala com fã do streamer ou do jogo; nome reconhecível na tela |
| Ângulo | Pega uma emoção forte? | Raiva, susto, risada, polêmica, absurdo; algo que dá vontade de mandar para um amigo |
| Formato | É nativo e sem trecho parado? | 9:16, legenda grande, sem silêncio acima de 1 s, entre 15 e 60 s, áudio perto de -14 LUFS |
| Hook | Prende nos 3 primeiros segundos? | Ação ou fala forte já no segundo 0 a 1; texto na tela que abre uma pergunta sem contar o final |
| Body | Entrega o que o hook prometeu? | O clímax acontece; nada de explicação longa antes; termina logo depois do pico |
| CTA | Pede algo claro? | Pergunta polêmica na legenda do post ou no fim ("quem tá certo?", "nota de 0 a 10?") |

Depois calcule três potenciais de 0 a 100: **viralização** (hook, ângulo e formato pesam mais), **comentários** (ângulo polêmico e CTA) e **retenção** (body e ritmo). Seja exigente: 80+ só para corte que você mesmo compartilharia.

## 4. Entregar

Resposta curta, em português, neste formato:

```
<nome do corte>: viralização X · comentários X · retenção X
Persona X · Ângulo X · Formato X · Hook X · Body X · CTA X
Mudar primeiro:
1. ... (segundo X)
2. ...
3. ...
Gancho novo: "..."
Pergunta nova: "..."
```

Se a mudança for de edição (cortar silêncio, trocar o gancho, encurtar), faça você mesmo com `cortes/editar.py` ou `cortes/montar.py` e checagem de novo, em vez de só sugerir. É uma previsão e não garante resultado.

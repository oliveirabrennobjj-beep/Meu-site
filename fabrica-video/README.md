# Fábrica de vídeo (Remotion)

Roteiro em JSON → MP4 vertical 1080x1920, no estilo "Recapitulando" (gancho cinético, lista numerada, chamada final).

## Pelo celular
Diga ao Claude: "faz um vídeo da fábrica sobre <assunto>". Ele escreve `roteiros/<nome>.json`, roda `./gerar.sh` e manda o MP4.

## Manual
```bash
./gerar.sh roteiros/exemplo.json   # gera out/exemplo.mp4
npm run dev                         # abre o Remotion Studio para ajustar
```

Campos do roteiro: `gancho`, `titulo`, `itens` (2 a 5, cada um com `titulo` e `sub`), `cta`, `marca`, `cor`.
Duração automática: 2,5 s de gancho + 1,5 s por item + 4,5 s de lista e chamada.

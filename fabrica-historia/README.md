# Fábrica de historinhas 3D (Remotion + Three.js)

Historinha de mistério narrada, com bonecos 3D de bloco, no estilo de `ESTILO.md`. Vertical 1080x1920, 30 fps. Tudo grátis: 3D feito em código e voz do Gemini.

## Pelo celular
Diga ao Claude: "faz uma historinha da fábrica: <base da animação + contexto>".
Ele escreve o roteiro, monta personagens e tomadas em `src/historias/<nome>/`, roda `./gerar.sh` e manda o MP4.

## Manual
```bash
./gerar.sh roteiros/o-vigia.json   # voz + tempos + legenda + trilha + render -> out/o-vigia.mp4
npm run dev                         # abre o Remotion Studio para ajustar câmera e cena
```

## Como funciona
1. `roteiros/<nome>.json`: `nome`, `historia`, `velocidade` da voz, `voz` (modelo, voz, tom) e `cenas[]` com `fala`, `tomadas` (nomes de tomada), `som` opcional (`sino`, `grave`, `arranhao`) e `tom` opcional por fala.
2. `scripts/preparar.py`: gera uma fala por cena no Gemini TTS (pelo proxy da sessão; fora dela, `GEMINI_API_KEY`), corta silêncio, acelera, calcula o tempo de cada palavra e gera a trilha. Falas já geradas são reaproveitadas.
3. `src/Historia.tsx`: cada tomada vira um `ThreeCanvas`; a fala dita a duração da cena e as tomadas dividem esse tempo.
4. Kit em `src/kit/`: `Boneco` (poses parado, andar, olharCima, escalar, medo, deitado), `Cenario` (Noite, Vila, Casa, Torre, Poste, Arvore), `Camera` (de → para), `Legenda`.

## Limites
- Gemini TTS grátis: ~10 falas por dia por modelo. O script troca sozinho para o modelo reserva. Para mais, ativar pagamento no Google AI Studio.
- ElevenLabs (voz melhor) está sem crédito; dá para voltar a usar quando recarregar.

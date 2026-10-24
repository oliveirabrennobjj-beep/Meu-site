# Canal "Como funciona"

Vídeos curtos e animados explicando como as coisas do dia a dia funcionam por dentro.
Esta pasta guarda o plano do canal, os roteiros e o projeto de cada vídeo.

## Decisão atual (out/2026)

- **TikTok é a rede principal**, mas o mesmo @ fica reservado no Instagram desde o início e cada vídeo
  também sai no Reels (sempre o arquivo original, sem marca d'água de outra rede). Depois de uns 10 vídeos,
  comparar os números das duas redes e decidir onde investir mais. YouTube Shorts entra depois.
- **Formato:** fundo escuro, diagrama em corte com neon, legenda palavra por palavra, narração animada.
- **Roteiro "você inventou":** começa com a versão mais simples do objeto e cada "Mas…" traz um problema e
  a peça que resolve ("Então você… Isso é o ___."). Fecha com "Parabéns, você construiu um ___!" e o CTA
  "Já sabia? Comenta X. Não sabia? Comenta Y".
- **Duração:** entre 60 e 90 segundos. Passar de 1 minuto conta para o programa de monetização do TikTok.

## Referências

- @desmontandoomundo e @voceconstruiu: 3D low-poly, roteiro "você construiu".
- @comofunciona.br e Zaptorio: 3D escuro com neon e números na tela (o estilo que estamos usando).
- @viralizeamanha: bonequinho palito 2D com legenda amarela grande.

## Perfil

- **Nome:** IA Todo Dia (no campo "Nome" do TikTok: "IA Todo Dia | Curiosidades")
- **@ (nesta ordem de preferência):** @iatododia, @ia.todo.dia, @iatododia.br, @iatododiaoficial.
  Usar o mesmo @ no TikTok, Instagram e YouTube.
- **Bio do TikTok (até 80 caracteres):** "Como as coisas do dia a dia funcionam por dentro 🔧 Vídeo novo todo dia!"
- **Bio do Instagram:** "🔧 Como as coisas do dia a dia funcionam por dentro / 🤖 Explicado com IA, vídeo novo todo dia / 👇 Comenta o que você quer ver"
- **Tipo de conta:** TikTok pessoal (para ter os sons em alta); Instagram profissional, Criador de conteúdo.
- **Ritmo:** 1 vídeo por dia, produzido em lote uma vez por semana.
- **Segundo perfil (futuro):** novela dos objetos da casa ("Barraco na Cozinha" é a sugestão), depois de um episódio piloto.

## Temas (com gancho)

| # | Tema | Gancho | Status |
|---|------|--------|--------|
| 1 | Elevador | "Se o cabo arrebentar… você cai?" | ✅ pronto ([roteiro](roteiros/01-elevador.md)) |
| 2 | Tampa da caneta | "Sabe aquele furinho na tampa?" | a fazer |
| 3 | Chuveiro | "Por que esquenta mais com menos água?" | a fazer |
| 4 | Geladeira | "Ela não faz frio, tira o calor." | a fazer |
| 5 | Descarga | "Pra onde vai tudo?" | a fazer |
| 6 | Chave | "Como ela sabe que é da sua porta?" | a fazer |
| 7 | Panela de pressão | "Por que cozinha na metade do tempo?" | a fazer |
| 8 | Ar-condicionado | "De onde vem a água que pinga?" | a fazer |
| 9 | Micro-ondas | "Por que quase não esquenta o prato?" | a fazer |
| 10 | Telhado | "Se a telha tem frestas, por que a chuva não entra?" | a fazer |

## Ferramentas

- **Narração e efeitos sonoros:** ElevenLabs (voz "Luiz Henrique", modelo eleven_v4).
- **Animação:** Remotion (projeto em `video-elevador/`), feita por código, sem crédito de IA.
- **Alternativas:** Higgsfield (vídeo/3D com IA), HyperFrames (motion 2D), Canva (capas), vidIQ (pesquisa).

## Como gerar o vídeo de novo

Precisa de Node.js 20 ou mais novo.

```bash
cd como-funciona/video-elevador
npm install
npm run render   # gera out/elevador.mp4
npm run capa     # gera out/capa.png
```

Para o volume ficar no padrão das redes (-14 LUFS):

```bash
ffmpeg -i out/elevador.mp4 -c:v copy -af "loudnorm=I=-14:TP=-1.5:LRA=11" -c:a aac -b:a 192k elevador_final.mp4
```

O MP4 final (38 MB) não fica no repositório. A capa está em `entregas/capa-elevador.png`.

## Como o projeto do vídeo está organizado

- `src/timeline.ts`: tempos de cada cena, títulos, posição da cabine e efeitos sonoros.
- `src/Elevator.tsx`: o diagrama do poço (cabine, roldana, contrapeso, cabos, freio, molas, porta).
- `src/Cards.tsx`: cartões históricos (Arquimedes, Coliseu, Otis).
- `src/Composition.tsx`: títulos, legendas, transições, áudio e a capa.
- `src/words.json`: tempo de cada palavra da narração (transcrição do ElevenLabs).

Para um vídeo novo, copie a pasta, troque a narração e as palavras e redesenhe o diagrama.

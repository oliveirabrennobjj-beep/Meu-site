# Contexto para uma conversa nova (vídeos), atualizado em 27/10/2026 (tarde)

Leia este arquivo primeiro. Responda sempre em **português**: o Brenno reclama quando a resposta vem em inglês.
Depois leia `PROXIMOS-PASSOS.md` e `README.md` desta pasta.

## Os perfis

| Perfil | Estilo | O que explica | Bordão |
|---|---|---|---|
| **Raio-X das Coisas** (IG @raiox.dascoisas; TikTok ainda @ia265393) | 2D neon (futuro: palitinho) | Como foi inventado e como funciona por dentro | "Você inventou…" e, no fim, "Já sabia? Comenta X. Não sabia? Comenta Y" |
| **E Se Você Fizesse?** (IG @e.se.voce.fizesse) | 3D low-poly com boneco de capacete | Como se constrói em casa e no quintal | Começo: "E se você fizesse…?" Fim: "Parabéns: você fez…" |
| **Contos da Madrugada** | terror e lendas | Histórias | — |

- Ritmo: **1 vídeo por dia em cada perfil**, o mesmo arquivo no Instagram, no TikTok e no YouTube Shorts.
- No YouTube e no Instagram, marcar **"Conteúdo alterado/sintético"** e o rótulo de IA, por causa da voz.
- Bio do E Se Você Fizesse: "👷 E se você fizesse… e descobrisse como tudo funciona? 🏗️ Piscina, poço, casa, fossa e muito mais em 3D 🔔 Vídeo novo todo dia".
- Foto de perfil: `entregas/perfil-e-se-voce-fizesse/foto-perfil.png`.

## Vídeos prontos

| Vídeo | Perfil | Projeto | Composição | Status |
|---|---|---|---|---|
| Piscina | E Se Você Fizesse? | `video-piscina-3d/` | `Piscina` / `Capa-Piscina` | combinado para 26/10 (conferir se foi postado) |
| Fossa | E Se Você Fizesse? | `video-fossa-3d/` | `Fossa` / `Capa-Fossa` | **postar em 27/10** |
| Caixa d'água | E Se Você Fizesse? | `video-caixa-3d/` | `Caixa` / `Capa-Caixa` | o Brenno estava postando em 27/10 às 13h (conferir) |
| Chuveiro | Raio-X | `video-chuveiro/` | `Chuveiro` / `Capa` | postado em 26/10 |
| Elevador, caneta | Raio-X | `video-elevador/`, `video-caneta/` | `Elevador`, `Caneta` | prontos antes |
| Motor | E Se Você Fizesse? | `video-motor-3d/` | `Motor` / `Capa-Motor` | animação pronta com tempo provisório, **falta a voz** (roteiro `09-motor.md`) |
| Descarga | Raio-X | `video-descarga/` | `Descarga` / `Capa` | animação pronta com tempo provisório, **falta a voz** (roteiro `04-descarga.md`) |
| Caminhão | Engenheiro (perfil novo) | `video-caminhao-3d/` | `Caminhao` / `Capa-Caminhao` | animação pronta com tempo provisório, **falta a voz** (roteiro `E01-caminhao.md`) |
| 3h33 | Contos | `../contos-da-madrugada/video/` | — | pronto, falta criar o perfil |

Os MP4 finais ficaram na sessão antiga, que não existe mais. O Brenno guardou os arquivos no celular.
Para gerar de novo: `npm install` dentro do projeto, depois `npx remotion render <Composição> out/video.mp4 --codec=h264 --crf=18`,
e normalizar o áudio com `ffmpeg -i out/video.mp4 -af loudnorm=I=-14:TP=-1.5:LRA=11 -c:v copy -c:a aac -b:a 192k -movflags +faststart final.mp4`.

As legendas dos posts estão em `roteiros/07-fossa.md` e `roteiros/08-piscina.md`. A da caixa d'água é:

```
E se você fizesse uma caixa d'água? 🚰
Rua → hidrômetro → caixa no alto → gravidade → chuveiro.
E aquela boia lá dentro? Ela que manda em tudo 👀

Comenta aí: quando foi a última vez que lavaram a caixa da sua casa? 👇

#esevocefizesse #comofunciona #caixadagua #curiosidades #construcao #animacao3d
```
YouTube: `E se você fizesse uma caixa d'água? 🚰 #shorts`

## Como os vídeos são feitos

- **Remotion 4.0.538.** Os 3D usam `@remotion/three` + `@react-three/fiber` 9.1.2 + `three` 0.170.0.
  O `remotion.config.ts` já usa o Chromium da nuvem com OpenGL `swangle`.
- **Estrutura de um projeto 3D** (copie `video-caixa-3d/` para começar um novo):
  - `timeline.ts`: marcos `T` tirados da narração com `at("frase")`, câmera `CAM` (`[tempo, posição, alvo]`), `LABELS`, `SFX` e `PLAN` do boneco.
  - `Guy.tsx`: o boneco. Poses: idle, wave, point, dig, nose, worried, thumbs, panic, party, throw, pick.
    `PLAN` é uma lista de `[início, x, z, pose, olhar]`.
  - Técnica de corte: a frente da caixa de terra fica em z=0 e o que está "por dentro" aparece de frente.
    Rótulos são pílulas HTML projetadas a partir de pontos 3D.
- **Narração:** ElevenLabs, voz "Luiz Henrique" (id `6GWfivGWZoUg1lb8HBrE`), modelo `eleven_v4`, flow `UNsUW4zYe6DfNtNzqSOH`.
  Transcrever com `eleven_scribe_v1` (connect_from do nó de voz), baixar `words_download_url` e rodar
  `python3 ferramentas/savewords.py raw.json src/words.json`.
  Não repetir uma geração para "tentar de novo": cada chamada gasta crédito. Se a transcrição der 429, espere e tente de novo (é grátis).
- **Créditos da ElevenLabs acabaram em 26/10** (22 de 10.000). Cada vídeo de ~1 min gasta 1.000 a 1.300.
  Falta o Brenno decidir: esperar renovar, subir de plano (Creator ~US$ 22/mês) ou usar outra voz (vidIQ ou Higgsfield).
  Enquanto isso dá para montar a animação com `ferramentas/fakewords.py` e sincronizar depois.

## Quando tiver crédito de voz (motor, descarga e caminhão)
Para cada um: gerar a narração do roteiro (voz Luiz Henrique), transcrever com `eleven_scribe_v1`, rodar `savewords.py`
para trocar o `src/words.json`, salvar o áudio em `public/` (`narracao-motor.mp3`, `narracao.mp3` na descarga,
`narracao-caminhao.mp3`), conferir uns quadros com `remotion still` e renderizar. O código já toca o áudio se o arquivo existir.
Os projetos `video-descarga/`, `video-caminhao-3d/` e `canal-engenheiro/` usam o `node_modules` do `video-motor-3d/` por um atalho
(`ln -s ../video-motor-3d/node_modules node_modules`); numa sessão nova, rode `npm install` no `video-motor-3d/` e recrie os atalhos.

## O que fazer a seguir

1. **Série "carro e máquinas"** (E Se Você Fizesse?, 3D): 15 temas em `PROXIMOS-PASSOS.md`.
   - **Motor:** animação feita em 27/10 com `fakewords.py`. Quando tiver crédito: gerar a narração do `roteiros/09-motor.md`
     com o Luiz Henrique num tom mais calmo e neutro (o Brenno gostou da voz do reel do arroz com peixe:
     instagram.com/reel/Deo6pFJzw0B, "parece IA, mas não muito"), transcrever, trocar o `src/words.json`,
     salvar o áudio em `public/narracao-motor.mp3`, conferir os quadros e renderizar.
   - Depois: freio → câmbio → turbo → radiador.
   - Ideia nova: "E se você criasse peixe dentro do arroz?" (rizipiscicultura), tirada do mesmo reel. Fazer com gancho próprio.
2. **Raio-X:** descarga (roteiro `04`, sem voz e sem animação), fechadura (`05`), panela de pressão (`06`).
3. **Contos:** Loira do Banheiro e ET de Varginha precisam de voz.
4. **Outras ideias 3D:** poço artesiano, placa solar, telhado.

## Cuidados

- O repositório é **público**: nada de CPF, chave Pix com CPF ou o PDF do minicurso (`minicurso/` está no `.gitignore`).
- A página de vendas `../raiox-das-coisas/` ainda precisa de uma **chave Pix aleatória**. Só publicar com o OK dele.
- Não colocar nome de modelo de IA em commits.
- Fazer o trabalho no branch indicado pela sessão e dar push no fim.

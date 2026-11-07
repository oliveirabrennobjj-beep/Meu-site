---
name: do-bruto-ao-pronto
description: Manual de edição de vídeo do Brenno (BN Digital). Use quando ele mandar um vídeo bruto de cliente (mp4/mov) e pedir "edita esse vídeo", ou pedir para editar vários vídeos em fila. Corta pausas e tomadas repetidas, legenda palavra a palavra, coloca ênfases, imagens, efeitos sonoros e exporta pronto para postar.
---

# Do bruto ao pronto

O cliente manda o bruto (erros, pausas, tomada repetida). O Claude devolve pronto para postar. O Brenno só revisa.

## Antes de começar (perguntar só se não estiver claro)

- Formato: vertical 1080x1920 (padrão, Reels/TikTok), horizontal 1920x1080 ou 4K.
- Cliente e assunto: definem a identidade visual (cores do cenário/marca do cliente).
- Duração alvo (padrão: o que sobrar depois do corte, ideal até 60 s).

## 1. Transcrever

- Extrair o áudio: `ffmpeg -i bruto.mp4 -vn -ac 1 -ar 16000 audio.wav`
- Transcrever com tempo por palavra pelo Gemini (chave já salva no ambiente,
  host `generativelanguage.googleapis.com`): enviar o áudio e pedir JSON `[{palavra, inicio, fim}]` em segundos.
- Sem Gemini: legenda nativa do arquivo, ou Whisper se estiver instalado.

## 2. O corte (como editor)

- Tirar silêncios acima de 0,4 s (`ffmpeg -af silencedetect=noise=-35dB:d=0.4`).
- Tomada repetida: manter a ÚLTIMA versão completa da frase, cortar as anteriores.
- Nunca comer o fim da frase: deixar 0,12 s depois da última palavra.
- Preservar o sentido e organizar a história: gancho forte nos 3 primeiros segundos.
- Gerar uma lista de cortes (EDL) e montar com `ffmpeg` (concat) ou Remotion.

## 3. O acabamento

- Legenda palavra a palavra, 1 a 3 palavras por vez, centro-baixo, fonte grossa.
- Legendas de ênfase: números, preços e palavras fortes maiores ou na cor da marca.
- Câmera viva: zoom leve (100%→108%) nos pontos fortes; corte seco a cada 3-5 s.
- Recorte da pessoa (fundo removido) só quando ajudar a mensagem.
- Imagens e animações que nascem da fala: quando ele cita um produto/lugar, mostrar.
  Imagem nova: Nano Banana (Higgsfield). B-roll: modelos de vídeo do Higgsfield.
- Efeitos sonoros no lugar certo: whoosh na transição, pop na ênfase. Volume baixo.
- Áudio final normalizado: `loudnorm=I=-14:TP=-1.5:LRA=11`.
- Montagem e legendas animadas: skills `remotion-*`.

## 4. Exportar

- H.264, 1080p 30 ou 60 fps, `-movflags +faststart`, versão leve (`-crf 24`) para mandar no WhatsApp.
- Capa: quadro do gancho com título grande.
- Conferir 3 quadros (início, meio, fim) antes de entregar.

## 5. Fila de clientes

- Vários brutos: processar um de cada vez, em segundo plano, nomeando `cliente_<nome>.mp4`.
- Relatório no fim: o que foi cortado (segundos), duração final, pontos para o Brenno revisar.

## Regras

- O Brenno é o diretor: pedir ajuste é normal; aplicar só o ajuste pedido.
- Não inventar fala, preço ou promessa que o cliente não disse.
- Na nuvem, link de Instagram/YouTube não baixa: pedir o arquivo.

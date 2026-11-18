# Cortes (vídeo longo → shorts verticais)

Fluxo para transformar debates, podcasts e lives em cortes de 20 a 60 s para TikTok e YouTube Shorts.

## Como roda

1. **Achar os momentos:** o Gemini assiste ao vídeo em trechos (`analise/` na sessão) e gera `lista.json`, com início, fim, gancho, frase de clímax e título do post.
2. **Baixar e recortar:** o GitHub Actions (`.github/workflows/cortes.yml`) baixa o vídeo de `pedido.json`, recorta cada corte com margem e transcreve palavra por palavra (faster-whisper). O resultado volta cifrado no branch `cortes-saida`; `ci/abrir.sh` abre.
3. **Editar:** `montar.py <pasta>` gera `prontos/NN-gancho.mp4` com `editar.py`.

## Estilos do editor (`editar.py`)

- `ref`: fundo preto, vídeo inteiro no meio, título branco com emoji em cima, nome de quem fala e @ embaixo, e legenda palavra por palavra. É o estilo da referência do Brenno.
- `padrao`: vertical reenquadrado no rosto (solo, dupla ou plano geral), título amarelo e barra de progresso.

Os dois abrem com a frase mais forte do corte (teaser de 2 a 3 s), um flash branco e depois o trecho inteiro.

## Checar antes de postar

`checar.py <corte.mp4>` gera os quadros do gancho, do meio e do fim, a fala com tempos e as medidas (duração, 9:16, volume, silêncios). A skill `checar-viral` usa isso para dar nota aos 6 pontos (persona, ângulo, formato, hook, body e CTA), igual aos analisadores pagos.

## Fonte do vídeo

- YouTube recusa servidores ("Sign in to confirm you're not a bot"), tanto aqui quanto no GitHub.
- Google Drive funciona se o arquivo estiver com "Qualquer pessoa com o link".
- TikTok baixa direto.

## Próximos passos (GTA 6)

- Cortes de gameplay de streamers (iShowSpeed, Bistecone, Alanzoca, David Jones). Precisa de um layout com a câmera do streamer em cima e o jogo embaixo.
- Lives de 5 a 9 h: analisar em trechos e recortar só os momentos escolhidos. Testar o download de VOD da Twitch e da Kick.
- Gringo (iShowSpeed): dublagem em português com voz criada no ElevenLabs que combine com ele. Gasta crédito pago, então avisar antes. Marcar o vídeo como conteúdo com IA no TikTok e no YouTube.

Fontes: Poppins e Anton (OFL), Liberation Serif (OFL). Emoji: Noto Color Emoji do sistema. Rosto: YuNet (BSD-3).

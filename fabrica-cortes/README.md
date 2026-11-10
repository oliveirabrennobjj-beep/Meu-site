# Fábrica de cortes

Vídeo longo (live) → cortes verticais 1080x1920, com título em cima, legenda em português embaixo e nome do canal.

## Pelo celular
1. Mande o arquivo do vídeo para o Claude (ou o trecho baixado pelo botão "Clipe" da Twitch).
2. Diga: "faz os cortes desse vídeo". Se você viu o momento, diga o tempo: "foi em 02:14:07".
3. O Claude devolve os MP4 e a lista de títulos e descrições.

## Manual
```bash
python3 cortar.py entrada/live.mp4                                  # acha os momentos sozinho
python3 cortar.py entrada/live.mp4 --so-listar                      # só mostra os momentos
python3 cortar.py entrada/live.mp4 --momentos 02:14:07,05:41:22     # você diz onde foi
python3 cortar.py entrada/live.mp4 --quantos 10 --duracao 40 --canal "Nome do canal"
```
Os cortes saem em `prontos/`, junto com um `.md` de títulos, descrições e nota de cada trecho.

## Como escolhe os momentos
- Mede o volume de cada segundo da live. Pico de volume (grito, risada, susto) vira candidato.
- Cada corte começa um pouco antes do pico, para pegar o que levou a ele.
- O Gemini ouve só o trecho, transcreve, traduz para português, sugere título e dá nota de 0 a 10.
- Volume alto nem sempre é momento bom. Confira a nota e assista antes de postar.

## O que precisa
- `ffmpeg`.
- Chave do Gemini em `GEMINI_API_KEY` (na nuvem do Claude já é injetada). Sem ela, use `--sem-ia`: os cortes saem sem legenda e sem título.
- A chave grátis tem limite diário por modelo. O script tenta 4 modelos em ordem (`GEMINI_MODEL` troca a lista).

## Limites
- Não baixa vídeo. A nuvem do Claude bloqueia YouTube, Twitch, Kick e TikTok; o arquivo tem que ser enviado.
- Não posta. O envio para YouTube, TikTok e Instagram ainda é manual.
- Testado com um vídeo sintético de 3 minutos em inglês. Ainda não foi testado com uma live real de várias horas.
- Só use material de criador que autoriza cortes, ou de campanha de clipagem.

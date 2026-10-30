# CLAUDE.md — leia antes de qualquer coisa

O Claude lê este arquivo sozinho no começo de toda conversa neste repositório.
Ele guarda as regras fixas e diz onde está a memória de cada assunto.

## Quem é o dono

Brenno, de Casimiro de Abreu (RJ). Tem a **BN Digital**: faz sites, cardápios digitais e **placas NFC** para comércios da região.
Também produz vídeos curtos animados para perfis no Instagram/TikTok.

- Responda sempre em **português do Brasil**, simples e direto, sem jargão.
- Ele usa muito o **celular**: textos curtos, passos numerados, nada de tabela enorme.
- **Não pergunte "quer que eu ative a skill X?"**. Use as skills listadas abaixo direto, conforme o tipo de tarefa.

## Memória por assunto (`memoria/`)

Antes de começar, abra o arquivo do assunto da tarefa. Não espere o Brenno lembrar você.

| Se a conversa for sobre… | Leia primeiro |
|---|---|
| Placa NFC, avaliação no Google, vender placa, cliente de placa | `memoria/placa-nfc.md` |
| Criar ou mexer em site, cardápio digital, landing page | `memoria/criar-site.md` |
| Vídeos (Raio-X, E Se Você Fizesse, Engenheirinho, BN Digital) | `como-funciona/CONTEXTO-NOVA-CONVERSA.md` |
| Prospecção, lista de comércios, abordagem | `bn-digital/prospeccao/abordagem-presencial.md` |
| Qualquer coisa, no começo de uma conversa nova | `memoria/passagem-de-bastao.md` (onde a última conversa parou) |

Quando aparecer uma informação nova e importante (preço, cliente, decisão, preferência), **salve no arquivo do assunto** em `memoria/` (ou use `/lembrar`). Se o assunto ainda não tiver arquivo, crie um e acrescente uma linha na tabela acima.

## Skills por tipo de tarefa (usar sem pedir)

- **Site novo ou redesign:** `frontend-design` + `ui-ux-pro-max` para a direção visual, `impeccable` para o acabamento, `copywriting` para os textos, `seo-audit` antes de publicar, `webapp-testing` para testar no celular e no computador, `verification-before-completion` antes de dizer que terminou.
- **Logo, banner, post, identidade:** `design`, `banner-design`, `brand`.
- **Vídeo:** `remotion-best-practices` (roteador das skills `remotion-*`); `brag-slim` para vídeo de lançamento de um site.
- **Apresentação ou documento:** `slides`/`pptx`, `docx`, `pdf`, `xlsx`.
- **Ideia nova ainda crua:** `brainstorming`.

A lista completa e a procedência das skills ficam em `.claude/SKILLS.md`.

## Projetos neste repositório

| Pasta | O que é | Tecnologia |
|---|---|---|
| raiz (`index.html`, `assets/`) | Barbearia Vértice | HTML/CSS/JS estático |
| `bn-digital/` | Site da BN Digital + `prospeccao/` | React + TS + Tailwind v4 (shadcn) |
| `brteam/` | BR Team Jiu-Jitsu (professor Bruno Ramos) | React + TS + Tailwind v4 (shadcn) |
| `padaria/` | Padaria BNH | HTML/CSS/JS estático |
| `hortifruti/` | Kitanda Hortifruti | HTML/CSS/JS estático |
| `demos/` | Prévias "modelo grátis" para clientes | HTML estático |
| `como-funciona/`, `barraco-na-cozinha/`, `contos-da-madrugada/`, `raiox-das-coisas/` | Vídeos e página de minicurso | Remotion / HTML |

Publicado no GitHub Pages: `https://oliveirabrennobjj-beep.github.io/Meu-site/<pasta>/`.

## Regras fixas

- Cada site tem um `README.md` dizendo onde mudar as coisas. Mantenha esse README atualizado quando mudar o site.
- Dados do negócio (WhatsApp, endereço, horários, preços) ficam num arquivo de configuração só (`config.js` / `site-config.js`), nunca espalhados pelo HTML.
- Celular primeiro. Teste em 390 px de largura antes do computador.
- Nunca invente dado de cliente (telefone, endereço, nota do Google). Se faltar, deixe o campo vazio e avise.

## Antes de terminar uma conversa longa

Uma conversa nova para cada tarefa nova. Antes de trocar, rode `/bastao`: ele atualiza `memoria/passagem-de-bastao.md` com o que está pronto, o que está quebrado e o que vem agora.

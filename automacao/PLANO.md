# Plano de automação (feito pelo celular)

Pesquisa de 09/11/2026. A tarefa diária atualiza este plano em `automacao/pesquisas/`.

## 0. O que já roda sozinho
Tarefas agendadas (horário de Brasília). Cada uma abre uma sessão nova do Claude e manda aviso no celular.
O resultado fica salvo na própria sessão (app Claude → Code).
- **02:43 Pesquisa profunda:** um tema por noite (vídeo, Instagram, design, token, WhatsApp, PC pelo celular,
  novidades do Claude Code). Até 5 achados com link, uso e risco.
- **06:17 Resumo + lembretes:** 3 skills novas do tema do dia, 1 dica de token, ação do dia e seus lembretes abertos.
- **Domingo 19:23 Roteiros da semana:** 3 roteiros prontos para a fábrica de vídeo + legendas e hashtags.
- **Fábrica de vídeo:** `fabrica-video/`. Roteiro JSON → MP4 vertical em ~1 min, na nuvem, sem o PC.
- **Lembretes:** `automacao/LEMBRETES.md`. Diga "me lembra de …" e o Claude adiciona.
Limite: as sessões agendadas leem o repositório (público), mas não salvam nele.
Para salvar sozinhas, crie as tarefas pelo site (claude.ai/code → Routines) escolhendo o repositório Meu-site.

## 1. WhatsApp
Três caminhos. Todos precisam de uma ação sua (conta, número ou servidor).

| Caminho | Como | Prós | Contras |
|---|---|---|---|
| **A. API oficial (Meta Cloud API)** | Conta Meta Business + número verificado. MCP oficial: "WhatsApp Business Tools MCP" (Meta) ou `networkerman/whatsapp-cloud-api-mcp-server`. | Sem risco de ban. Respostas automáticas, modelos de mensagem. | Número novo/empresa. Mensagem fora de 24 h só com modelo aprovado (pago por conversa). Não lê suas conversas pessoais. |
| **B. Evolution API (não oficial, popular no Brasil)** | Servidor com Evolution API conectado ao seu número via QR. MCP: `aiteks-ltda/mcp-evolution-whatsapp-api`. Alternativa paga BR: Z-API. | Usa seu número atual. Lê e responde conversas. | Risco de bloqueio do número. Precisa de servidor ligado (VPS ~R$ 30/mês ou o PC). |
| **C. Make (já conectado ao Claude)** | Cenário no Make: mensagem chega no WhatsApp Business → Claude/IA responde → salva lead. | Sem código, roda 24 h. | Também exige WhatsApp Business API (caminho A) por baixo. |

**Decisão (09/11):** Brenno escolheu **A + Make**.
**Recomendação:** começar pelo **A + Make** para atendimento de clientes da BN Digital (seguro);
usar **B** só num número secundário se quiser ler/responder conversas pelo Claude.
**Falta:** você criar a conta Meta Business e me passar o acesso (o Claude pede a chave num formulário seguro).

## 1b. Vendas no automático (prospecção)
- **Painel de vendas:** https://claude.ai/artifact/LMpGydYCibdZoLEf3eNBNo (só você abre). Fonte: `automacao/painel/app/` (ver o README de lá).
  76 comércios reais da região sem site próprio (Google Maps, 09/11): pizzaria, barbearia, açaí, padaria, salão, lanchonete, pet shop.
  Desde 12/11 tem o visual escuro da referência do 21st.dev, focado em vender **site** e **placa NFC**:
  - Uma tabela por cidade (Casimiro, Barra de São João, Rio das Ostras, Macaé), com nota e número de avaliações.
  - "Nichos": todos os ramos, um por um; tocar em um filtra as tabelas. Botão "Mais/Menos avaliados" em cada tabela.
  - **Casimiro:** mensagem pede para passar lá e falar com o dono (placa para quem tem menos de 50 avaliações, senão site),
    botão "Falei pessoalmente" e roteiro curto. **Fora:** mensagem de site pelo WhatsApp. Nenhum texto cita preço.
  - Os 3 textos são editáveis em "Mensagens". Depois de enviar aparece "Próximo" para seguir a lista.
- **Todo dia 06:17:** o resumo lembra a meta (15 mensagens) e traz 10 comércios novos em JSON para "Importar".
- **Por que não 100% sozinho ainda:** mandar mensagem fria em massa por número comum pode bloquear o número.
  Mandar aos poucos (15/dia) pelo painel é seguro. Com a Evolution API (~R$ 30/mês, decisão com seu pai) o envio
  e as respostas viram automáticos; com a API oficial da Meta, só com modelo de mensagem aprovado.
- Mensagem padrão se apresenta, cita a avaliação no Google e deixa a pessoa dizer não. Editável no painel.

## 3b. Segundo cérebro no celular
O cofre fica em `cerebro-obsidian/cofre/` neste repositório. No Android, o Obsidian não lê pastas do GitHub sozinho:
1. Instale o app **GitSync** (ou o plugin "Git" dentro do Obsidian).
2. Clone `oliveirabrennobjj-beep/Meu-site` numa pasta do celular.
3. No Obsidian: "Abrir pasta como cofre" e escolha `Meu-site/cerebro-obsidian/cofre`.

## 2. Vídeos
Fluxo já possível hoje, todo pelo celular:
1. Você manda a ideia por áudio/texto no app do Claude (Code).
2. Claude escreve o roteiro (`copywriting`), monta em Remotion seguindo
   `cerebro-obsidian/cofre/02 Padrões/Motion graphics com Claude Code em 5 passos.md`.
3. Voz: ElevenLabs (conectado). Cenas geradas: Higgsfield (conectado, gasta crédito).
4. Render em MP4 na nuvem (`npx remotion render`), versão vertical recomposta.
5. Publicar: **Metricool** (conectado) agenda no Instagram/TikTok; vidIQ publica Reel.
**Falta:** o Metricool está ligado ao Claude, mas sem nenhuma rede social. Conectar Instagram/TikTok em
https://app.metricool.com/brands/connections?blogId=7626128 e dizer o horário de postagem.
Depois disso dá para agendar: tarefa semanal gera 3 vídeos da fábrica e agenda no Metricool.

## 3. Controlar o PC pelo celular
Precisa do PC ligado uma vez para configurar:
- **Remote Control:** no PC, rodar `claude remote-control` na pasta do projeto. No celular: app Claude → Code → abrir a sessão.
- **Dispatch:** app Claude Desktop no PC → Cowork → Dispatch → ler o QR com o celular. Depois é só mandar tarefa pelo celular; o PC executa (precisa ficar ligado e com o app aberto).
- Depois disso, a sessão na nuvem também pode pedir para usar uma pasta do seu PC.
Docs: https://code.claude.com/docs/en/remote-control

## 4. Economia de token (o que funciona)
- `caveman` já ativo (corta 13–65 % da saída).
- **CLAUDE.md curto** (< 2.000 tokens): é pago em toda mensagem. O seu está ok.
- `/compact` ao fim de cada fase; `/clear` ao trocar de assunto. `/context` mostra o que pesa.
- Uma tarefa por conversa. Pedidos com arquivo/linha exatos gastam menos que "procura aí".
- Pesquisas pesadas: tarefa agendada de madrugada (sessão nova, sem histórico).

## 5. Sites mais bonitos: skills
Instaladas em 09/11 (aprovadas): `design-taste-frontend`, `apple-design`, `hyperframes`, `instagram-marketing`.
O skill `gsap` saiu do repo da HeyGen; o conhecimento de GSAP agora vem dentro de `hyperframes`.

### Histórico da sugestão
Já instaladas: `frontend-design`, `impeccable`, `ui-ux-pro-max`, `web-design-guidelines`, `design`.
Faltam (mais citadas em 2026):
- `npx skills add leonxlnx/taste-skill --skill design-taste-frontend`: regras de "bom gosto", evita cara de IA.
- `npx skills add heygen-com/hyperframes --skill gsap`: animação correta (serve para site e vídeo).
- `npx skills add emilkowalski/skills --skill apple-design`: tipografia e movimento estilo Apple.
- Instagram: `sergebulaev/instagram-skills` e `Jakeschincariol/instagram-agent-skill` (legendas, hashtags, carrossel).
Dica que mais pesa: sempre mandar **1 site de referência** que você acha bonito. Já é regra no cérebro.

# Plano de automação (feito pelo celular)

Pesquisa de 09/11/2026. A tarefa diária atualiza este plano em `automacao/pesquisas/`.

## 0. O que já roda sozinho
- **Pesquisa diária (06:17, horário de Brasília):** sessão nova do Claude procura skills novas
  (vídeo, marketing/Instagram, design de site, economia de token, automação), salva o resumo em
  `automacao/pesquisas/AAAA-MM-DD.md` e manda aviso no celular com os lembretes abertos.
- **Lembretes:** `automacao/LEMBRETES.md`. Diga "me lembra de …" e o Claude adiciona.

## 1. WhatsApp
Três caminhos. Todos precisam de uma ação sua (conta, número ou servidor).

| Caminho | Como | Prós | Contras |
|---|---|---|---|
| **A. API oficial (Meta Cloud API)** | Conta Meta Business + número verificado. MCP oficial: "WhatsApp Business Tools MCP" (Meta) ou `networkerman/whatsapp-cloud-api-mcp-server`. | Sem risco de ban. Respostas automáticas, modelos de mensagem. | Número novo/empresa. Mensagem fora de 24 h só com modelo aprovado (pago por conversa). Não lê suas conversas pessoais. |
| **B. Evolution API (não oficial, popular no Brasil)** | Servidor com Evolution API conectado ao seu número via QR. MCP: `aiteks-ltda/mcp-evolution-whatsapp-api`. Alternativa paga BR: Z-API. | Usa seu número atual. Lê e responde conversas. | Risco de bloqueio do número. Precisa de servidor ligado (VPS ~R$ 30/mês ou o PC). |
| **C. Make (já conectado ao Claude)** | Cenário no Make: mensagem chega no WhatsApp Business → Claude/IA responde → salva lead. | Sem código, roda 24 h. | Também exige WhatsApp Business API (caminho A) por baixo. |

**Recomendação:** começar pelo **A + Make** para atendimento de clientes da BN Digital (seguro);
usar **B** só num número secundário se quiser ler/responder conversas pelo Claude.
**Falta:** você criar a conta Meta Business e me passar o acesso (o Claude pede a chave num formulário seguro).

## 2. Vídeos
Fluxo já possível hoje, todo pelo celular:
1. Você manda a ideia por áudio/texto no app do Claude (Code).
2. Claude escreve o roteiro (`copywriting`), monta em Remotion seguindo
   `cerebro-obsidian/cofre/02 Padrões/Motion graphics com Claude Code em 5 passos.md`.
3. Voz: ElevenLabs (conectado). Cenas geradas: Higgsfield (conectado, gasta crédito).
4. Render em MP4 na nuvem (`npx remotion render`), versão vertical recomposta.
5. Publicar: **Metricool** (conectado) agenda no Instagram/TikTok; vidIQ publica Reel.
**Falta:** conectar as contas do Instagram/TikTok no Metricool e dizer o horário de postagem.

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

## 5. Sites mais bonitos: skills sugeridas (aguardando sua aprovação para instalar)
Já instaladas: `frontend-design`, `impeccable`, `ui-ux-pro-max`, `web-design-guidelines`, `design`.
Faltam (mais citadas em 2026):
- `npx skills add leonxlnx/taste-skill --skill design-taste-frontend`: regras de "bom gosto", evita cara de IA.
- `npx skills add heygen-com/hyperframes --skill gsap`: animação correta (serve para site e vídeo).
- `npx skills add emilkowalski/skills --skill apple-design`: tipografia e movimento estilo Apple.
- Instagram: `sergebulaev/instagram-skills` e `Jakeschincariol/instagram-agent-skill` (legendas, hashtags, carrossel).
Dica que mais pesa: sempre mandar **1 site de referência** que você acha bonito. Já é regra no cérebro.

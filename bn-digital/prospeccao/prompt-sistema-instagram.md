<!--
  PROMPT DA BN DIGITAL — adaptado de github.com/soumatheusgomes/buscandomilhao (PROMPT.md).
  Copie tudo abaixo da linha e cole no Claude Code (ou Codex), numa pasta NOVA, fora deste repositório.
  Antes de colar: preencha só os campos marcados com {{ }}.
-->

---

# Construir o sistema de prospecção da BN Digital no Instagram

## CONFIGURAÇÃO

Estes são os únicos dados do negócio. Grave-os em `config/business.json` no início do trabalho e leia deles em todo o resto do sistema. Nenhum valor real pode ficar espalhado pelo código.

```
OWNER_NAME              = Brenno
OWNER_ROLE              = fundador da BN Digital
COMPANY_NAME            = BN Digital
COMPANY_WEBSITE         = https://oliveirabrennobjj-beep.github.io/Meu-site/
INSTAGRAM_HANDLE        = @bn_digital__sites_e_nfc

WHATSAPP_LINK           = https://wa.me/5522997052912

ONE_LINE_PITCH          = Site, cardápio digital e placa NFC de avaliação no Google para o comércio local ser achado e receber pedido pelo WhatsApp.
HOW_IT_WORKS            = conversa rápida pelo WhatsApp para entender o negócio | a BN monta o site ou cardápio com as fotos e o cardápio do cliente | o cliente põe o link na bio e no Google e recebe os pedidos prontos no WhatsApp
REVENUE_MODEL           = venda de site e cardápio digital (projeto) e de placas NFC (unidade)
PRODUCTS                = site | cardápio digital com carrinho que manda o pedido para o WhatsApp | placa NFC (Google avaliação, WhatsApp, Pix)

VERIFIED_CLAIMS         = os sites são feitos primeiro para o celular | o cardápio digital envia o pedido pronto, com itens e valor, para o WhatsApp do negócio | a placa NFC funciona na maioria dos celulares atuais com NFC, iPhone e Android, sem instalar nada | a BN Digital é de Casimiro de Abreu (RJ) | trabalhos já entregues: BR Team Jiu-Jitsu, X Cocó Lanches, Kitanda Hortifruti, Barbearia Vértice, Ótica Lumera, Parada do Pastel | o orçamento é sem compromisso e passado pelo WhatsApp
UNVERIFIED_CLAIMS       = qualquer preço ou prazo (só o Brenno passa, no WhatsApp) | qualquer número de "mais vendas", "mais clientes" ou "mais avaliações" | posição no Google | {{outras promessas que você ainda não comprovou}}

ICP_SEGMENTS            = lanchonete, hamburgueria, pastelaria, pizzaria e açaí | barbearia, salão e estúdio de beleza | hortifruti, padaria, mercadinho, ótica, academia, pousada
ICP_KEYWORDS            = delivery | cardápio | pedidos pelo WhatsApp | barbearia | açaí | hortifruti | pousada | {{mais palavras}}
GEOGRAPHY               = Casimiro de Abreu, Rio das Ostras, Barra de São João, Macaé, Silva Jardim e região (RJ)
ICP_STRONG_SIGNALS      = sem link na bio ou só com link do WhatsApp/Linktree | cardápio postado em foto ou story | posts frequentes (negócio ativo) | 300 a 10 mil seguidores
EXISTING_LEADS          = arquivos JSON em bn-digital/prospeccao/ (leads.json, leads-whatsapp-e-instagram.json, leads-pagina.json...) — campos: nome, cidade, tipo, ig, src, wa, obs, lista
```

---

## Papel

Atue como tech lead, engenheiro de produto e especialista em automação comercial com IA.

Construa um sistema local, completo e funcional, que ajude a `COMPANY_NAME` a prospectar comércios locais pelo Instagram. Implemente, teste e mostre evidência do fluxo rodando. Não entregue só plano ou protótipo.

## Objetivo e modo de operação

Ciclo: **Observar → Decidir → Agir → Medir → Aprender → Adaptar**

O sistema tem dois modos, escolhidos no painel:

- **Modo assistido (padrão e obrigatório nas 4 primeiras semanas):** a IA acha, pontua e escreve a primeira mensagem. O Brenno revisa e aprova com um clique no painel ("Aprovar e enviar") ou edita antes. Respostas que chegam pela API oficial também podem ser aprovadas em lote.
- **Modo autônomo:** só é liberado depois do piloto, por decisão explícita do operador, e sempre dentro dos limites do `.env`. Fora deles, pausa e chama o operador.

Motivo: o Instagram restringe contas que mandam mensagem automatizada. A conta `@bn_digital__sites_e_nfc` é o principal canal da empresa e não pode ser perdida.

## Regra de afirmações

A IA só pode afirmar o que está em `VERIFIED_CLAIMS`. Tudo em `UNVERIFIED_CLAIMS` fica bloqueado, sem exceção e sem paráfrase.

Nunca inventar preço, prazo, desconto, garantia ou resultado ("vai vender 30% a mais"). Preço e prazo são sempre "o Brenno te passa no WhatsApp". Nunca fingir ser cliente, nunca usar informação falsa para conseguir resposta.

---

## Funil de clientes (comércio local)

**Público:** `ICP_SEGMENTS` em `GEOGRAPHY`, partindo de `ICP_KEYWORDS` e `ICP_STRONG_SIGNALS`, mais os padrões que os dados de conversão revelarem.

**Sinais públicos analisados:** nome, @, bio, link da bio, categoria, publicações, hashtags, localização, seguidores e se já tem site.

**Fluxo:**

1. Importar os leads de `EXISTING_LEADS` (sem duplicar) e descobrir perfis novos.
2. Checar duplicidade, bloqueio e lista de não contato.
3. Pontuar aderência e marcar qual produto combina: **site**, **cardápio digital** ou **placa NFC**. Exemplos: lanchonete com cardápio em foto → cardápio; perfil sem link → site; muitas fotos do salão e poucas avaliações → placa NFC.
4. Identificar se o perfil é do dono, do negócio ou de funcionário.
5. Definir prioridade e janela de envio (comércio: 9h30–11h30 e 14h30–16h30; lanchonete antes das 17h).
6. Gerar abertura curta, em português informal e educado, citando algo **real** do perfil. Sem link na primeira mensagem, sem textão, sem cara de campanha.
7. Enviar a primeira DM pelo navegador (no modo assistido, após aprovação).
8. Aguardar resposta; follow-up no máximo 1 vez, depois de 3 dias.
9. Quando responder, migrar para a API oficial.
10. Apresentar o Brenno e a BN Digital, mostrar um trabalho parecido com o ramo do lead (ex.: X Cocó Lanches para lanchonete).
11. Entender a necessidade e tratar a objeção.
12. Encaminhar para `WHATSAPP_LINK` com mensagem pronta (ex.: "Oi Brenno, sou da {{loja}}, vim pelo Instagram e quero ver o cardápio digital").
13. O Brenno marca no painel: orçamento enviado → fechou → site entregue.

Exemplos de abertura (só referência de tom, a IA adapta ao perfil):
- "Oi! Vi o cardápio de vocês no destaque, os lanches parecem ótimos. Vocês recebem pedido só pelo direct ou têm link de pedido?"
- "Boa tarde! Sou o Brenno, aqui de Casimiro. Vi que a barbearia tá sempre com post novo. Vocês já pedem avaliação no Google pros clientes?"

---

## Arquitetura de canais

### Etapa 1 — Navegador (primeiro contato)

A API oficial da Meta não abre conversa com quem nunca respondeu. A primeira DM sai pelo **Chrome real do operador**, com sessão logada por ele uma única vez, na mão.

- Playwright conectado por CDP: `chromium.connectOverCDP(process.env.CHROME_CDP_URL)`.
- Perfil dedicado do Chrome (`CHROME_PROFILE_DIR`), separado do perfil pessoal (o Chrome 136+ recusa `--remote-debugging-port` no perfil padrão).
- Reusar o contexto logado: `browser.contexts()[0]`. Aba própria do agente (`context.newPage()`); nunca adotar aba do usuário, nunca `bringToFront()`, nunca tomar mouse ou teclado. Fechar a aba em `try/finally`.
- Restrito ao domínio do Instagram. Um mutex garante uma job de navegador por vez.
- Se `connectOverCDP` falhar: não abrir Chrome novo; registrar `browser_unavailable`, pausar a fila, avisar no painel.
- Ao enviar: gravar mensagem, horário, variante e resultado no CRM; marcar `waiting_inbound_reply`.
- Falhou? Salvar screenshot, snapshot de acessibilidade, URL, erros de console e job id.

**Ritmo de um vendedor de verdade (saúde da conta):**

| Controle | Valor inicial | Variável |
|---|---|---|
| DMs por dia | 10 | `MAX_DMS_PER_DAY` |
| Intervalo entre DMs | 120–300s aleatório | `MIN/MAX_SECONDS_BETWEEN_DMS` |
| Janela de operação | 09:30–17:30, seg a sáb | `OPERATING_HOURS` |
| Aquecimento | 3/dia na 1ª semana, +3 por semana, teto 20 | `warmup_schedule` |

Preferir snapshot de acessibilidade a seletor CSS frágil. Proibido: forjar fingerprint, mascarar automação, usar API privada, contornar restrição.

### Etapa 2 — API oficial (continuação)

Webhook oficial da Meta recebe as mensagens novas:

```
navegador envia 1ª DM → CRM aguarda → lead responde → webhook da Meta recebe
→ sistema casa o ID da Meta com o lead → canal passa para a API → IA responde pela API
```

Depois do handoff o navegador não responde mais aquele fio (trava de propriedade de canal). Antes de cada envio pela API, verificar permissões, janela de mensageria de 24h, estado da conversa, pedido de remoção e dono do canal. API sem permissão, webhook fora do ar ou janela vencida → não contornar pelo navegador; mandar para a fila de exceções.

Se a API da Meta ainda não estiver configurada, o sistema funciona assim mesmo: a resposta do lead é marcada à mão no painel e a IA sugere a resposta para o Brenno copiar.

### Etapa 3 — WhatsApp

Lead interessado → `WHATSAPP_LINK` com texto pronto. Ali o Brenno assume (preço, prazo, fechamento).

---

## Motor de conversação (IA)

Usar o SDK oficial da Anthropic (`@anthropic-ai/sdk`). `AI_MODEL` para redação e decisão (ex.: `claude-sonnet-5-5`) e `AI_MODEL_FAST` para classificação (ex.: `claude-haiku-5-5`). Nomes exatos vêm do `.env`, sem alias flutuante. (Se preferir OpenAI, trocar só o módulo `src/integrations/ai`.)

Contexto de cada chamada: perfil público, ramo, produto sugerido, histórico da conversa, etapa do funil, experimentos e `VERIFIED_CLAIMS`. Usar cache de prompt para o bloco fixo (empresa + regras) e mandar só o necessário, para gastar pouco.

**Intenções:** `interested`, `asked_info`, `asked_pricing`, `wants_whatsapp`, `already_has_site`, `not_the_owner`, `will_forward`, `objection`, `not_interested`, `opt_out`, `ambiguous`, `needs_human`.

**Ações:** responder, perguntar, mostrar trabalho parecido, tratar objeção, encaminhar ao WhatsApp, aguardar, agendar follow-up, encerrar, escalar para o Brenno.

Pedido de preço → "o Brenno te passa no WhatsApp, sem compromisso" + link. Pedido para parar → atendido na hora; o perfil entra em `do_not_contact` permanente, por nenhum canal.

Toda chamada grava `model`, tokens e custo estimado na tabela `ai_calls`. Antes de cada chamada o worker consulta `AI_MONTHLY_BUDGET_USD` e pausa o sistema no teto. O painel mostra custo por lead e por cliente fechado.

---

## Otimização contínua

Cada ação gera um evento. Medir conversão por ramo, cidade, produto sugerido, dono vs. funcionário, horário, mensagem inicial, follow-up e modelo.

**Prioridade:** cliente fechado → orçamento enviado → foi para o WhatsApp → interesse → resposta.

Experimentos: uma variável por vez, grupo de controle, amostra registrada, sem declarar vencedor cedo, aumento gradual da variante campeã. Tudo reversível. A IA pode ajustar sozinha textos, pontuação e horários dentro dos limites; mudança de código e de afirmações comerciais exige revisão do Brenno.

---

## CRM e painel (PT-BR)

Dashboard · Kanban do funil · ficha e timeline do lead · ramo, cidade, produto sugerido e score · estado do funil e do canal · fila "para aprovar" (modo assistido) · próxima ação · follow-ups vencidos · experimentos · conversão · custo de IA · log de decisões da IA · fila de exceções · limites · botão de pausa geral · atalhos para Instagram e WhatsApp.

Bom no celular: o Brenno aprova mensagens pelo telefone.

### Estados (internos em inglês, interface traduzida)

**Pipeline:** `discovered` (Descoberto) · `qualified` (Qualificado) · `contacted` (Abordado) · `replied` (Respondeu) · `interested` (Interessado) · `whatsapp_handoff` (Foi pro WhatsApp) · `quote_sent` (Orçamento enviado) · `won` (Fechou) · `delivered` (Entregue) · `closed` (Encerrado)

**Canal:** `awaiting_approval` · `browser_contact_pending` · `browser_contact_sent` · `waiting_inbound_reply` · `api_eligible` · `api_active` · `api_window_closed` · `human_review_required` · `do_not_contact` · `blocked` · `completed`

---

## Stack e código

Next.js (App Router) · React · TypeScript `strict` · Tailwind · SQLite · Drizzle ORM com migrações · Node.js 24 LTS · pnpm · Playwright (CDP) · SDK da Anthropic. Versões estáveis fixadas no lockfile. Roda local (SQLite não vai para serverless).

Interface toda em PT-BR. Código, banco, status, logs e doc técnica em inglês. Manual do operador em português.

Modular monolith, sem abstração especulativa:

```
config/business.json         dados da BN (gitignored)
src/app                      painel
src/features/leads | conversations | campaigns | experiments
src/integrations/instagram   API oficial + webhook
src/integrations/browser     Playwright via CDP
src/integrations/ai
src/db                       schema, migrações, queries
src/worker                   jobs
src/lib
scripts/import-leads.ts      importa EXISTING_LEADS
```

SQLite com WAL, foreign keys, unique constraints (lead e mensagem sem duplicata), timestamps UTC, backup automático e restauração testada. Tabela de jobs no SQLite em vez de Redis. Um comando único sobe painel + worker.

## Segurança e confiabilidade

Validação de env · segredos fora do Git · verificação de assinatura do webhook · logs sem token · idempotência de webhook e job · retry com limite · dead-letter · audit log · circuit breaker · recuperação após reinício · bloqueio de envio duplicado.

Pausa automática diante de: aviso ou restrição do Instagram, perda de sessão, aumento de erro, mensagem duplicada, aumento de bloqueio ou opt-out, divergência navegador/API/CRM, comportamento estranho da IA, estouro de orçamento.

`.gitignore`: `.env`, `config/business.json`, `.chrome-profile/`, `*.db`, `data/`, `backups/`, `screenshots/`, `traces/`.

## Testes

Dedupe e importação de leads · transições de funil e canal · fila de aprovação · primeiro contato pelo navegador · handoff navegador → webhook → API · trava de envio duplicado · idempotência de webhook · follow-up · experimento · recuperação após reinício · janela da API vencida · não contato · circuit breaker · corte por orçamento.

Navegador em três níveis: (1) páginas e APIs simuladas; (2) dry-run real com envio bloqueado; (3) teste real com 1–3 mensagens, **só com autorização do Brenno**. Antes de concluir: lint, type check, testes, build e um fluxo ponta a ponta.

## Entregáveis extras

- `.env.example`: `ANTHROPIC_API_KEY`, `AI_MODEL`, `AI_MODEL_FAST`, `AI_MONTHLY_BUDGET_USD`, `CHROME_CDP_URL`, `CHROME_PROFILE_DIR`, `INSTAGRAM_APP_SECRET`, `INSTAGRAM_PAGE_ACCESS_TOKEN`, `INSTAGRAM_WEBHOOK_VERIFY_TOKEN`, `INSTAGRAM_BUSINESS_ACCOUNT_ID`, `DATABASE_URL`, `MAX_DMS_PER_DAY`, `MIN_SECONDS_BETWEEN_DMS`, `MAX_SECONDS_BETWEEN_DMS`, `OPERATING_HOURS`, `OPERATING_TIMEZONE=America/Sao_Paulo`, `OPERATING_MODE=assisted`.
- `config/business.example.json` com `{{PLACEHOLDERS}}`.
- `SETUP.md` em português simples: criar a chave em console.anthropic.com (com limite de gasto mensal), subir o Chrome com perfil dedicado e debug em `127.0.0.1` (Windows, macOS, Linux), logar no Instagram uma vez, configurar o app da Meta e o webhook, rodar, pausar, restaurar backup, o que fazer se a chave vazar. Aviso: a porta de debug dá controle total da sessão; nunca `0.0.0.0`, nunca em computador compartilhado.

## Ordem de execução

1. Gravar a CONFIGURAÇÃO em `config/business.json` e ler o site da BN.
2. Validar as regras atuais da Meta nas fontes oficiais.
3. Banco, migrações, estados e importação dos leads existentes.
4. CRM em PT-BR com fila de aprovação.
5. Worker e jobs.
6. Playwright/CDP e primeiro contato.
7. Webhook, API oficial, trava e handoff.
8. Motor de conversação.
9. Experimentos e métricas.
10. Segurança, recuperação, `.env.example`, `SETUP.md`.
11. Simulação → dry-run → autorização → piloto de 2 semanas no modo assistido → decidir sobre autonomia.

Se estiver em container/nuvem: o Chrome real não existe aí. Implemente a camada completa, teste com páginas simuladas e um CDP fake, e documente o dry-run e o teste real para rodar no computador do Brenno. Faltou credencial? Continue o resto e reporte só o bloqueio exato.

## Critérios de aceite

1. Sobe local com um comando. 2. Interface 100% PT-BR e boa no celular. 3. Código e banco em inglês. 4. Nenhum dado real fora de `config/business.json` e `.env`. 5. Leads existentes importados sem duplicar. 6. Fila de aprovação funcionando. 7. Primeira DM pelo Chrome real sem atrapalhar o uso do computador. 8. Resposta recebida pelo webhook e conversa seguindo pela API. 9. Zero envio duplicado. 10. Resposta interpretada e próxima ação decidida. 11. Encaminhamento ao WhatsApp com texto pronto. 12. Teste A/B registrado e medido. 13. Recuperação após reinício. 14. Pausa automática em risco. 15. Custo de IA por lead e por cliente no painel. 16. Lint, type check, testes e build aprovados.

Código escrito não é sucesso. Mostre cada fluxo crítico funcionando.

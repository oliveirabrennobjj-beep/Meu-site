# Economia de tokens no Claude (guia da BN Digital)

Pesquisado em 04/11/2026. O ponto mais importante: **o que mais gasta não é o tamanho da sua pergunta, é tudo que já está carregado na conversa.** Cada mensagem reenvia o histórico inteiro, a lista de skills, os plugins e as instruções.

## 1. O que está pesando na SUA conta (visto nesta sessão)

| O que | Por que pesa | O que fazer |
|---|---|---|
| **Plugins da conta: PostHog, Data, Engineering, Design** | Só o PostHog põe **mais de 150 skills** na lista que vai em toda mensagem. Você não usa PostHog nos sites | Em claude.ai → Configurações → Plugins/Conectores, **desligue PostHog, Data e Engineering**. É a maior economia possível, de graça |
| **Conectores (ElevenLabs, Higgsfield, vidIQ, Vercel, Supabase, Figma, Canva, Notion, Gmail, Make, Metricool...)** | Cada um adiciona nome de ferramentas e instruções em toda sessão | Deixe ligados só os que usa toda semana. Ligue os outros quando precisar |
| **4 plugins do projeto** (`superpowers`, `karpathy`, `i-have-adhd`, `octo`) em `.claude/settings.json` | Cada um roda um aviso no início da sessão; o `octo` ainda confere comandos antes de rodar | Desligue os que não usa trocando `true` por `false` em `enabledPlugins`. Sugestão: desligar `octo` |
| **12 skills do Remotion** | 12 descrições em toda mensagem, mesmo sem fazer vídeo | Se fizer vídeo raramente, dá para deixar só `remotion-best-practices` (é o roteador) |
| **Conversas longas** | Uma pergunta de 1 linha numa conversa de horas custa a conversa inteira | `/clear` ao trocar de cliente |

## 2. Comandos que economizam (Claude Code)

- `/usage`: mostra quanto gastou e **o que** pesou (skills, plugins, MCP), com sugestões. Aperte `f` para aplicar as que ele consegue.
- `/context`: mostra o que está ocupando o contexto agora.
- `/clear`: começa do zero, **custo zero**. Use ao mudar de cliente ou de assunto. Antes, `/rename nome` e depois `/resume` para voltar.
- `/compact foco em X`: resume a conversa. Atenção: compactar uma conversa enorme também gasta. Se não precisa da continuidade, `/clear` é melhor.
- `/model`: troque para **Sonnet** em tarefas simples (texto, cor, foto, ajuste). Opus para site novo ou bug difícil.
- `/effort low|medium|high`: menos esforço = menos "pensamento" (que é cobrado como saída). Evite `max` no dia a dia.
- `Esc`: pare na hora quando o Claude estiver indo para o lado errado. `/rewind` volta a um ponto anterior.
- Modo planejamento (Shift+Tab) em tarefa grande: evita refazer tudo.

## 3. Hábitos que mais rendem

1. **Uma conversa por cliente/tarefa.** Terminou o Açaí do Rei? `/clear` antes da padaria.
2. **Pedido exato.** "No `padaria/index.html`, troca o preço do pão francês para R$ 0,80" gasta muito menos que "arruma a padaria".
3. **Não cole arquivos gigantes nem logs inteiros.** Mande só o trecho com o erro.
4. **Prints:** um print que mostra o problema vale mais que três parágrafos explicando.
5. **Não deixe a conversa parada e volte horas depois.** O cache expira e tudo é reprocessado; prefira `/clear` e um resumo curto.
6. **Tarefas agendadas e `/loop`** gastam mesmo com você dormindo, porque mandam o contexto inteiro a cada disparo. Use pouco.
7. **Subagentes e "arena"** (`/arena` roda até 100 agentes!) consomem muito. Use só quando valer a pena.

## 4. O que já foi feito neste repositório

- `CLAUDE.md` curto (menos de 25 linhas) com regras de economia e instruções de compactação. É carregado em toda conversa, então foi mantido pequeno de propósito.
- Skill própria `economia-tokens` (`.claude/skills/economia-tokens/`): diga "modo econômico" para respostas curtas e trabalho enxuto.

## 5. Ferramentas da comunidade (não instaladas, avalie antes)

A instalação automática de código de terceiros foi bloqueada nesta sessão por segurança. Os números são **dos próprios autores**, não testados aqui.

| Ferramenta | O que faz | Economia anunciada | Como instalar | Cuidado |
|---|---|---|---|---|
| [Caveman](https://github.com/JuliusBrussee/caveman) | Respostas no estilo "telegrama"; `/caveman-compress` encolhe o CLAUDE.md; `/caveman-stats` mostra o gasto real | 75% (autor); testes independentes viram 15–33% | Só a skill: `npx skills add JuliusBrussee/caveman` | O CLI completo manda estatísticas de uso (desligue com `DO_NOT_TRACK=1`). A skill sozinha é local |
| [RTK (rtk-ai/rtk)](https://github.com/rtk-ai/rtk) | Comprime a saída de comandos do terminal antes de chegar ao Claude | ~60–80% na saída de comandos | `cargo install --git https://github.com/rtk-ai/rtk` e `rtk init -g` | Só age em comandos Bash. Existe outro pacote "rtk" sem relação: confira com `rtk gain` |
| [Context Mode](https://github.com/mksglu/context-mode) | Roda ferramentas que geram muita saída numa "caixa" e devolve só o resumo | até 98% nas saídas grandes | `/plugin marketplace add mksglu/context-mode` | Adiciona hooks; pode perder detalhes |
| [claude-token-optimizer (nadimtuhin)](https://github.com/nadimtuhin/claude-token-optimizer) | Reorganiza o CLAUDE.md em arquivos lidos só quando precisa | início de sessão de ~11 mil para ~800 tokens | ver README | Seu CLAUDE.md já é pequeno, ganho baixo aqui |
| [usage-limit-reducer](https://github.com/Dubibubii/usage-limit-reducer) / [claude-usage-analyzer](https://github.com/SingggggYee/claude-usage-analyzer) | Analisam os logs locais e mostram onde foram os tokens | (diagnóstico) | ver README | Hoje o `/usage` oficial já faz quase isso |
| ccusage | Relatório diário de tokens e custo pelos logs locais | (diagnóstico) | `npx ccusage` | Só no computador (lê `~/.claude`) |

Recomendação: **comece pelo item 1 (desligar PostHog/plugins/conectores) e pelos comandos da seção 2.** Só depois experimente o Caveman (só a skill) se ainda faltar limite.

## 6. "Repositórios que dão tokens"

Não existe repositório legítimo que dê tokens ou uso grátis do Claude. Repositórios ou sites que oferecem "chave grátis", "Claude ilimitado" ou "conta compartilhada" são golpe: roubam sua conta ou usam chaves roubadas, e sua conta pode ser banida. **Não use.**

Formas legítimas de ter mais uso:
- Plano maior (Max) ou **créditos de uso extra**: `/usage-credits` no Claude Code (abre Configurações → Uso no claude.ai).
- Programas oficiais da Anthropic para startups e educação. Confira em anthropic.com/claude.com se a BN Digital se encaixa.
- Usar Sonnet/Haiku nas tarefas simples já faz o limite durar bem mais.

## Fontes

- Documentação oficial: [Manage costs effectively (code.claude.com)](https://code.claude.com/docs/en/costs)
- [Caveman](https://github.com/JuliusBrussee/caveman) · [análise com números independentes (pasqualepillitteri.it)](https://pasqualepillitteri.it/en/news/846/claude-code-caveman-mode-token-saving) · [Hora de Codar sobre o Caveman](https://horadecodar.com.br/caveman-claude-code-2/)
- [RTK](https://github.com/rtk-ai/rtk) · [Context Mode](https://github.com/mksglu/context-mode)
- [claude-token-optimizer](https://github.com/nadimtuhin/claude-token-optimizer) · [usage-limit-reducer](https://github.com/Dubibubii/usage-limit-reducer) · [claude-usage-analyzer](https://github.com/SingggggYee/claude-usage-analyzer) · [tópico reduce-token-usage no GitHub](https://github.com/topics/reduce-token-usage)

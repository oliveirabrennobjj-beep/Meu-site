# Biblioteca de Skills da BN Digital

Pesquisado em 04/11/2026, a partir do PDF "BN Digital – Biblioteca de Skills". Os nomes do PDF eram só termos de busca. Aqui está o que **existe de verdade**, de onde vem e o que você **já tem**.

> **Regra de ouro (economia):** toda skill instalada põe a descrição dela em **todas** as mensagens. 30 skills bem escolhidas valem mais que 150. Instale só o que vai usar no mês.

Legenda: ✅ já instalada · ⭐ recomendo instalar · ➖ opcional/depois

## 1. Design e UI/UX (prioridade muito alta)

| Termo do PDF | Skill real | Fonte | Situação |
|---|---|---|---|
| frontend-design | `frontend-design` | anthropics/skills | ✅ |
| ui-ux-pro-max | `ui-ux-pro-max` | (pré-existente) | ✅ |
| design-system | `design-system`, `design`, `ui-styling` | (pré-existentes) | ✅ |
| brand-guidelines | `brand` | (pré-existente) | ✅ (não precisa da `brand-guidelines` da Anthropic, é da marca Anthropic) |
| web-design / polimento | `impeccable` | pbakaus/impeccable | ✅ |
| accessibility | `web-design-guidelines` + `design:accessibility-review` | vercel-labs + plugin Design | ✅ |
| animação e acabamento | `emil-design-eng` | emilkowalski/skills | ⭐ |
| testar com dados ruins (nomes longos, lista vazia) | `break-ui` | emilkowalski/skills | ⭐ |
| site "parecer app" no celular | `mobile-native` | emilkowalski/skills | ✅ |
| "gosto" de agência premium | `design-taste-frontend` | leonxlnx/taste-skill | ➖ (pode brigar com o impeccable; escolha um) |
| artes/pôsteres | `canvas-design` | anthropics/skills | ➖ (você já tem `banner-design`) |

## 2. Programação

| Termo | Skill real | Fonte | Situação |
|---|---|---|---|
| webapp-testing | `webapp-testing` | anthropics/skills | ✅ |
| debugging | `systematic-debugging` | obra/superpowers (plugin já ligado) | ✅ via plugin |
| verificação antes de entregar | `verification-before-completion` | obra/superpowers | ✅ |
| react / nextjs | `vercel-react-best-practices` | vercel-labs/agent-skills | ➖ só quando usar React/Next |
| performance | `animation-performance` (emilkowalski) + `chrome-devtools` MCP (Lighthouse) | | ✅ MCP / ➖ skill |

## 3. Marketing e redes sociais — coreyhaines31/marketingskills (MIT, 53 skills)

✅ já tem: `copywriting`, `seo-audit`.

✅ instaladas em 04/11 (servem direto para comércio local):
- `social`: criar e programar posts.
- `offers`: montar a oferta (bônus, garantia) para vender o site.
- `marketing-psychology`: gatilhos de comportamento aplicados.
- `cro`: aumentar conversão das páginas (mais cliques no WhatsApp).
- `ads`: campanhas no Meta/Google.

➖ depois: `content-strategy`, `ad-creative`, `emails`, `sms` (inclui WhatsApp), `copy-editing`, `marketing-plan`, `launch`, `video`, `image`.

## 4. Vendas e negócios

- ✅ `sales-enablement` (marketingskills): proposta, apresentação e roteiro de demonstração.
- ✅ `pricing` (marketingskills): definir preço e pacotes dos sites.
- ➖ `prospecting`, `cold-email`, `referrals` (programa de indicação), `customer-research`, `competitor-profiling` (marketingskills).
- ➖ Pacote `sales-skills/sales` (comunidade, prospecção e propostas). Revise antes.

## 5. Economia e finanças

Não achei skill boa e confiável para "finanças de pequena agência". Melhor caminho:
- ✅ `xlsx` (planilhas de custo, preço e margem) + `data:analyze`.
- ➖ Plugins oficiais "knowledge-work" da Anthropic (finance, sales, marketing), para o Cowork. Confira em github.com/anthropics.
- ⭐ Criar uma skill própria **BN Business Analyst** (ver seção 8).

## 6. SEO e crescimento

- ✅ `seo-audit`
- ✅ `schema` (marketingskills): dados estruturados LocalBusiness, que faz o comércio aparecer melhor no Google.
- ✅ `ai-seo` (marketingskills): aparecer nas respostas de IA (ChatGPT, Gemini).
- ➖ `site-architecture`, `analytics`, `conversion-tracking`, `programmatic-seo`.
- Google Business Profile: não há skill específica confiável; `schema` + `seo-audit` cobrem o site.

## 7. Produtividade

- ✅ `brainstorming`, `docx`, `pdf`, `pptx`, `xlsx`, `slides`, `find-skills`, `skill-creator`.
- ✅ `economia-tokens` (nova, própria).
- ✅ `caveman`, `caveman-commit`, `caveman-explore` (JuliusBrussee/caveman): modo telegrama, commits curtos e busca barata com Haiku.
- ➖ `anthropic-skills:deep-research` (já disponível na conta) para pesquisas grandes. Gasta bastante, use com moderação.

## 8. Skills próprias da BN Digital (a ideia do PDF)

| Skill | Situação | Observação |
|---|---|---|
| BN Developer + BN Designer | ✅ `site-bn-digital` já faz os dois | Pode ganhar referências de design por ramo |
| BN Economia | ✅ `economia-tokens` | Feita nesta sessão |
| BN Sales | ⭐ a criar | Preciso de: preços, pacotes, como você aborda o cliente, objeções comuns |
| BN Marketing | ⭐ a criar | Precisa: tom da marca, redes usadas, frequência de posts |
| BN Business Analyst | ⭐ a criar | Precisa: seus custos (domínio, hospedagem, horas) e preço cobrado |

Para criar, peça: "cria a skill BN Sales" e mande as informações acima. A `skill-creator` cuida do formato.

## 9. Comandos usados (já instaladas em 04/11; servem para reinstalar)

```bash
# Marketing, vendas e SEO (9 skills)
npx skills add coreyhaines31/marketingskills \
  --skill social --skill offers --skill marketing-psychology --skill cro --skill ads \
  --skill sales-enablement --skill pricing --skill schema --skill ai-seo \
  -a claude-code --copy -y

# Design (3 skills)
npx skills add emilkowalski/skills \
  --skill emil-design-eng --skill break-ui --skill mobile-native \
  -a claude-code --copy -y
```

Depois de instalar, registre a origem em `.claude/SKILLS.md`, como já é feito com as outras.

## 10. Para economizar, considere tirar

- Plugins de conta **PostHog, Data, Engineering**: mais de 150 skills que você não usa (ver `docs/economia-de-tokens.md`).
- `remotion-*` (12): se fizer vídeo raramente, deixe só `remotion-best-practices`.
- `brag` **ou** `brag-slim`: no Opus 5.5 o `brag` já passa para o `brag-slim`, então um dos dois basta.
- `arena`: muito cara (até 100 agentes). Use rarissimamente.

## Onde procurar mais

- [anthropics/skills](https://github.com/anthropics/skills) (oficial)
- [agentskills.io](https://agentskills.io) (padrão aberto) e [skills.sh](https://skills.sh) (busca usada pela `find-skills`)
- [coreyhaines31/marketingskills](https://github.com/coreyhaines31/marketingskills)
- [emilkowalski/skills](https://github.com/emilkowalski/skills)
- Listas: [travisvn/awesome-claude-skills](https://github.com/travisvn/awesome-claude-skills), [ComposioHQ/awesome-claude-skills](https://github.com/ComposioHQ/awesome-claude-skills), [VoltAgent/awesome-agent-skills](https://github.com/VoltAgent/awesome-agent-skills)
- Reportagens usadas: [Krumzi: skills para marketing](https://www.krumzi.com/blog/best-claude-skills-marketers), [Coupler: top skills 2026](https://blog.coupler.io/top-claude-skills/), [Elevarus: skills de design para marketing](https://elevarus.com/top-10-claude-code-skills-for-marketing/)

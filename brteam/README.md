# BR Team Brazilian Jiu-Jitsu — site

Site da BR Team, academia de Jiu-Jitsu do professor Bruno Ramos em Casimiro de Abreu (RJ).

React + TypeScript + Tailwind CSS v4 na estrutura do shadcn/ui (`components.json`, `src/components/ui`, `src/lib/utils.ts`).
Direção visual: foto em tela cheia na abertura e seções alternando claro (branco e "gelo") com azul-marinho,
botões em azul e detalhes em dourado. A faixa preta desenhada (ponteira vermelha e graus) é o elemento de assinatura.
Cores em `src/index.css` (bloco `@theme`: `marinho`, `azul`, `ouro`, `gelo`…).
Fontes: Barlow Condensed nos títulos e Barlow no texto.

## Como rodar

```bash
cd brteam
npm install
npm run dev       # http://localhost:5173
npm run build     # gera dist/ (site pronto, funciona em qualquer hospedagem estática)
npm run preview   # confere o build: http://localhost:4173
```

**Arquivo único:** `npm run arquivo-unico` gera `dist-arquivo-unico/index.html`, o site inteiro (com fotos e fontes)
em um só arquivo de cerca de 2 MB. Abre direto no celular ou no computador, sem servidor, e dá para mandar por WhatsApp.

**Publicação:** o workflow `.github/workflows/publicar-bn-digital.yml` publica `brteam/dist/` no GitHub Pages,
em https://oliveirabrennobjj-beep.github.io/Meu-site/brteam/, sempre que a `main` recebe mudanças em `brteam/dist/`.
Depois de mudar algo, rode `npm run build` e envie a pasta `dist/` junto.

## Onde mudar cada coisa

| O que | Onde |
|---|---|
| **Preços da troca de faixa** (crianças: branca, cinza, amarela, laranja e verde; adultos: branca, azul, roxa, marrom e preta; cada uma com seu `preco`) | `src/data/site.ts` → `trocaDeFaixa` (troque `null` por `"R$ 80"`, por exemplo). As três versões de uma cor infantil (com branco, pura, com preto) usam o mesmo preço. |
| **Mensalidade** (R$ 125, igual para todos) | `src/data/site.ts` → `mensalidade.valor` |
| **Loja de kimonos** (cores, preço) | `src/data/site.ts` → `loja` (`preco: null` mostra "valor combinado com o professor") |
| **Horários das turmas** | `src/data/site.ts` → `aulas` e `diasDeAula` |
| WhatsApp, Instagram, e-mail, endereço, idade mínima, Pix e estacionamento | `src/data/site.ts` → `contato`, `endereco` e `academia` |
| Parceiros | `src/data/site.ts` → `parceiros` |
| Fotos | `public/fotos/*.webp` e a lista `fotos` em `src/data/site.ts` |
| Menu lateral (celular) | `src/components/sections/header.tsx` → `grupos` |
| Cores e fontes | `src/index.css` (bloco `@theme`) |

Enquanto um valor estiver `null`, o site mostra "A confirmar" e um aviso para confirmar pelo WhatsApp.

## Componente integrado: `dashboard-sidebar`

`src/components/ui/dashboard-sidebar.tsx` é o componente enviado (sidebar com grupos, itens com filhos que abrem e fecham).
Fica em `components/ui` porque é o caminho padrão do shadcn (`components.json` → `aliases.ui`): o CLI do shadcn instala e procura componentes ali.
Ele é usado como **menu lateral do celular** (`header.tsx`), com os itens da academia. Extensões feitas, todas opcionais
e compatíveis com o original: props `groups`, `bottomItems` e `header`; `href` nos itens (WhatsApp, Instagram, mapa);
linhas como `<button>`/`<a>` para funcionar com teclado. A prévia original continua no export padrão e em
`dashboard-sidebar-demo.tsx`. Dependências: `lucide-react` e `tw-animate-css` (classes `animate-in`).

## Componente integrado: `boxly-pricing-1`

`src/components/ui/boxly-pricing-1.tsx` é a tabela de preços enviada, usada na seção **Mensalidade**
(`Mensalidade` em `src/components/sections/treinos.tsx`), com os planos de `src/data/site.ts`.
Sem props ela mostra o original (prévia em `boxly-pricing-1-demo.tsx`). Extensões opcionais: `tiers` (com `href`
para o botão abrir o WhatsApp, `period` e `note`), `eyebrow`, `title`, `aside`, `includedLabel`, `featuredIcon` e `className`.
Ajustes de acessibilidade: o botão do plano em destaque usa `red-600` (o `red-500` original não tinha contraste suficiente
com o texto branco) e as cantoneiras decorativas não bloqueiam mais o clique nos botões.
Depende de `src/components/ui/button.tsx` (Button padrão do shadcn, com `@radix-ui/react-slot` e `class-variance-authority`).

Sobre o CSS enviado junto: as linhas `--ring: var(----ring)` e parecidas (com quatro hífens) apontam para variáveis
que não existem e apagariam as cores do tema, por isso ficaram de fora. Entraram só os tokens novos
(`info`, `success`, `warning`, `destructive-foreground`), em `src/index.css`.

## Interações com o visitante

- **Agendar aula experimental** (`#agendar`, `src/components/sections/interacoes.tsx`): formulário curto (para quem é a aula,
  nome, idade, experiência e faixa, horário da turma). Valida os campos com mensagens ao lado de cada um, mostra a
  **turma indicada pela idade** enquanto a pessoa digita e, ao enviar, abre o WhatsApp com a mensagem pronta.
  As idades de corte das turmas ficam em `src/data/site.ts` → `faixasEtarias`.
- O botão "Agendar aula para meu filho" (seção Kids) leva ao formulário já com "Para meu filho(a)" marcado.
- **Loja BR Team** (`#loja`, `src/components/sections/loja.tsx`): encomenda de kimono com o professor. O visitante
  informa nome e idade do aluno, escolhe o horário da turma, a cor e a quantidade; o pedido abre pronto no WhatsApp
  da academia. O tipo (infantil ou adulto) sai da idade, e o tamanho o professor vê com o aluno.
- **Horários** (`#horarios`): a grade por período, com "Agendar aula neste horário", que leva ao formulário já
  com o horário marcado. Os horários ficam em `src/data/site.ts` → `aulas` (dias da semana em `diasDeAula`).
- **Dúvidas frequentes** (`#duvidas`): perguntas que abrem e fecham, com links para planos, troca de faixa e rota.
- Os botões "Agendar aula" do topo, do menu e da abertura levam ao formulário; o botão verde flutuante (celular)
  continua abrindo o WhatsApp direto.

## Movimento e interações

Tudo em `src/lib/movimento.ts` (comportamento), `src/components/movimento.tsx` e no fim de `src/index.css`:

- blocos das seções aparecem subindo, em sequência, ao rolar; as faixas da troca de faixa "crescem" ao aparecer;
- título da abertura entra palavra por palavra, faixa preta "amarra" e a foto tem parallax leve;
- botões: brilho que atravessa, leve subida com sombra vermelha, ícone que gira e onda no toque;
- barra vermelha de progresso no topo, cabeçalho que some ao descer e volta ao subir, botão de voltar ao topo;
- galeria abre a foto ampliada (setas do teclado, Esc ou toque fora para fechar);
- botão do WhatsApp pulsa e mostra "Dúvidas? Fale com a gente" uma vez;
- confirmações (pedido, agendamento, turma indicada, quantidade) aparecem com animação curta.

Com "reduzir movimento" ativado no aparelho, nada fica escondido nem se mexe.

## Fotos

As fotos foram recortadas dos prints do Instagram (@brteambjj e @bjjbrunoramos) e do perfil do WhatsApp Business (foto do tatame) com `scripts/recortar-fotos.mjs`.
Algumas vêm de miniaturas e têm resolução baixa (cerca de 360 px). Para melhorar, envie as fotos originais e troque os arquivos em `public/fotos/`.

## Pendências

1. Preços da troca de faixa e dias da semana das aulas (o site já está pronto para recebê-los).
   Confirmar também as cores de kimono vendidas (o site oferece branco, preto e azul).
2. Confirmar o número do endereço: o Instagram diz **886** e a apresentação em PDF diz **1049**. O site usa 886.
3. Confirmar os horários: Adulto 6h–7h, 13h–14h e 20h–21h; Kids I 18h–19h e Kids II 19h–20h; e até que idade a criança fica no Kids (o site usa 12 anos).
4. Confirmar as idades de cada turma (`faixasEtarias`) e as respostas das dúvidas frequentes.
5. Autorização dos responsáveis para usar fotos das crianças no site.

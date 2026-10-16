# BR Team Brazilian Jiu-Jitsu — site

Site da BR Team, academia de Jiu-Jitsu do professor Bruno Ramos em Casimiro de Abreu (RJ).

React + TypeScript + Tailwind CSS v4 na estrutura do shadcn/ui (`components.json`, `src/components/ui`, `src/lib/utils.ts`).
Direção visual inspirada na Ferrari (fundo escuro, foto em tela cheia, um único vermelho), traduzida para o tatame:
preto e branco como a marca e o vermelho da ponteira da faixa preta. A faixa desenhada (com graus) é o elemento de assinatura.
Fontes: Barlow Condensed nos títulos e Barlow no texto.

## Como rodar

```bash
cd brteam
npm install
npm run dev       # http://localhost:5173
npm run build     # gera dist/ (site pronto, funciona em qualquer hospedagem estática)
npm run preview   # confere o build: http://localhost:4173
```

**Publicação:** o workflow `.github/workflows/publicar-bn-digital.yml` publica `brteam/dist/` no GitHub Pages,
em https://oliveirabrennobjj-beep.github.io/Meu-site/brteam/, sempre que a `main` recebe mudanças em `brteam/dist/`.
Depois de mudar algo, rode `npm run build` e envie a pasta `dist/` junto.

## Onde mudar cada coisa

| O que | Onde |
|---|---|
| **Preços da troca de faixa** (infantil: um valor; azul, roxa, marrom, preta: um valor cada) | `src/data/site.ts` → `trocaDeFaixa` (troque `null` por `"R$ 80"`, por exemplo) |
| **Mensalidade** (R$ 125, igual para todos) | `src/data/site.ts` → `mensalidade.valor` |
| **Loja de kimonos** (cores, tamanhos, preço) | `src/data/site.ts` → `loja` (`preco: null` aparece como "Consulte") |
| **Horários das turmas** | `src/data/site.ts` → `horarios[].dias` e `horarios[].horario` |
| WhatsApp, Instagram, endereço | `src/data/site.ts` → `contato` e `endereco` |
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
  nome, idade, experiência e faixa, melhor período). Valida os campos com mensagens ao lado de cada um, mostra a
  **turma indicada pela idade** enquanto a pessoa digita e, ao enviar, abre o WhatsApp com a mensagem pronta.
  As idades de corte das turmas ficam em `src/data/site.ts` → `faixasEtarias`.
- O botão "Agendar aula para meu filho" (seção Kids) leva ao formulário já com "Para meu filho(a)" marcado.
- **Loja BR Team** (`#loja`, `src/components/sections/loja.tsx`): o visitante escolhe kimono adulto ou infantil, cor,
  tamanho e quantidade. Se não souber o tamanho, informa a altura e o site indica pela tabela de medidas.
  O botão "Pedir pelo WhatsApp" abre a conversa com o pedido pronto.
- **Dúvidas frequentes** (`#duvidas`): perguntas que abrem e fecham, com links para planos, troca de faixa e rota.
- Os botões "Agendar aula" do topo, do menu e da abertura levam ao formulário; o botão verde flutuante (celular)
  continua abrindo o WhatsApp direto.

## Fotos

As fotos foram recortadas dos prints do Instagram (@brteambjj e @bjjbrunoramos) com `scripts/recortar-fotos.mjs`.
Algumas vêm de miniaturas e têm resolução baixa (cerca de 360 px). Para melhorar, envie as fotos originais e troque os arquivos em `public/fotos/`.

## Pendências

1. Preços da troca de faixa, preço dos kimonos e grade de horários (o site já está pronto para recebê-los).
   Confirmar também as cores de kimono vendidas (o site oferece branco, preto e azul).
2. Confirmar o número do endereço: o Instagram diz **886** e a apresentação em PDF diz **1049**. O site usa 886.
3. Confirmar se as turmas são Kids I, Kids II, Juvenil e Adulto, e se existe plano família.
4. Confirmar as idades de cada turma (`faixasEtarias`) e as respostas das dúvidas frequentes.
5. Autorização dos responsáveis para usar fotos das crianças no site.

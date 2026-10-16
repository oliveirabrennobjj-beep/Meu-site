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

## Onde mudar cada coisa

| O que | Onde |
|---|---|
| **Preços da troca de faixa** (infantil: um valor; azul, roxa, marrom, preta: um valor cada) | `src/data/site.ts` → `trocaDeFaixa` (troque `null` por `"R$ 80"`, por exemplo) |
| **Mensalidades** | `src/data/site.ts` → `planos[].preco` |
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

## Fotos

As fotos foram recortadas dos prints do Instagram (@brteambjj e @bjjbrunoramos) com `scripts/recortar-fotos.mjs`.
Algumas vêm de miniaturas e têm resolução baixa (cerca de 360 px). Para melhorar, envie as fotos originais e troque os arquivos em `public/fotos/`.

## Pendências

1. Preços da troca de faixa, mensalidades e grade de horários (o site já está pronto para recebê-los).
2. Confirmar o número do endereço: o Instagram diz **886** e a apresentação em PDF diz **1049**. O site usa 886.
3. Confirmar se as turmas são Kids I, Kids II, Juvenil e Adulto, e se existe plano família.
4. Autorização dos responsáveis para usar fotos das crianças no site.

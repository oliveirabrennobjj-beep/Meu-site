# BR Team Brazilian Jiu-Jitsu — site

Site da BR Team, academia de Jiu-Jitsu do professor Bruno Ramos em Casimiro de Abreu (RJ).

React + TypeScript + Tailwind CSS v4 na estrutura do shadcn/ui (`components.json`, `src/components/ui`, `src/lib/utils.ts`).
Direção visual: foto em tela cheia na abertura e seções claras (branco e "gelo"), com azul-marinho só no topo, na Mensalidade, no cartão das faixas adultas e no rodapé;
botões em azul e detalhes em dourado. A faixa preta desenhada (ponteira vermelha e graus) é o elemento de assinatura.
Cores em `src/index.css` (bloco `@theme`: `marinho`, `azul`, `ouro`, `gelo`…). Não há cinza neutro nem preto puro:
`black` é um azul-marinho quase preto e o texto secundário (`chumbo`) é azul-ardósia. As cores das faixas (`faixa-amarela`,
`faixa-laranja`, `faixa-verde`, `faixa-azul`, `faixa-roxa`, `faixa-marrom`) marcam os benefícios do Kids e dos adultos.
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
| **Mensalidade** (R$ 135,00*, consultar planos) | `src/data/site.ts` → `mensalidade` (`valor`, `nota`, quem paga em `para` e a lista `inclui`) |
| **Loja de kimonos** (cores, preço, idade do kimono adulto) | `src/data/site.ts` → `loja` (`preco: null` mostra "Preço e prazo com o professor Bruno"; até 15 anos o pedido sai como kimono infantil) |
| **Horários das turmas** | `src/data/site.ts` → `aulas` e `diasDeAula`. Os textos que citam os horários (subtítulo da seção, turma indicada no formulário, dúvida "Com que idade…") saem de `aulas` sozinhos; só a frase dos dias sem aula, em `treinos.tsx`, é escrita à mão. |
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

## Componente `boxly-pricing-1` (fora do site)

`src/components/ui/boxly-pricing-1.tsx` é a tabela de preços enviada. Ela mostrava três cartões iguais de R$ 125 na
Mensalidade; como o valor é um só, a seção virou um bloco único (`Mensalidade` em `src/components/sections/treinos.tsx`).
O componente continua no projeto, com a prévia em `boxly-pricing-1-demo.tsx`, caso um dia existam planos diferentes.

## Interações com o visitante

- **Agendar aula experimental** (`#agendar`, `src/components/sections/interacoes.tsx`): formulário curto (para quem é a aula,
  nome, idade, experiência e faixa, horário da turma). Valida os campos com mensagens ao lado de cada um, mostra a
  **turma indicada pela idade** enquanto a pessoa digita e, ao enviar, abre o WhatsApp com a mensagem pronta.
  A idade de corte entre Kids e adultos sai das idades em `aulas` (hoje, 13 anos); os textos de cada turma ficam em `faixasEtarias`.
- O botão "Agendar aula para meu filho" (seção Kids) leva ao formulário já com "Para meu filho(a)" marcado.
- **Loja BR Team** (`#loja`, `src/components/sections/loja.tsx`): fotos e dois caminhos. "Pedir junto com a aula
  experimental" leva ao formulário de agendamento com "Também quero saber o preço do kimono" já marcado (cor e
  quantidade vão na mesma mensagem). "Já é aluno?" abre o WhatsApp do professor com o pedido de preço pronto.
- **Horários** (`#horarios`): a grade por período, com "Agendar aula neste horário", que leva ao formulário já
  com o horário marcado. Os horários ficam em `src/data/site.ts` → `aulas` (dias da semana em `diasDeAula`).
- **Dúvidas frequentes** (`#duvidas`): perguntas que abrem e fecham, com links para planos, troca de faixa e rota.
- Os botões "Agendar aula" do topo, do menu e da abertura levam ao formulário; o botão verde flutuante (celular)
  continua abrindo o WhatsApp direto e some enquanto o formulário está na tela, para não cobrir os campos.

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

O endereço é o **nº 886** (confirmado pela placa na fachada, no Street View). O Google Maps mostra "896" por estimativa e a apresentação em PDF dizia 1049.

1. Perfil da Empresa no Google com o mesmo nome, endereço (886) e telefone do site. Enquanto não existir, a BR Team não aparece pelo nome no Google Maps; o mapa da seção Contato usa as coordenadas da fachada (`coordenadas` em `src/data/site.ts`, também no `geo` do JSON-LD) e mostra um aviso explicando isso. Quando o cadastro sair, apague o aviso em `CartaoMapa` (`src/components/sections/final.tsx`).
2. Até que idade a criança fica no Kids (o site usa 12 anos) e as respostas das dúvidas frequentes.

Resolvido: o professor Bruno autorizou o uso das fotos das crianças (ele pediu o site e falou com os pais).

**Preços de troca de faixa e kimono:** de propósito, não ficam no site. Os botões "Pedir o preço" (troca de faixa),
o bloco "Troca de faixa e kimono" (dentro da Mensalidade), a Loja e a opção de kimono do agendamento abrem o WhatsApp do professor com a
mensagem pronta (textos em `mensagemPreco`, em `src/data/site.ts`). Se um dia quiser mostrar um valor, preencha `preco`
em `trocaDeFaixa` ou em `loja`.

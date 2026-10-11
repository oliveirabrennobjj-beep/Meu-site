# BN Digital — site

Site da BN Digital (sites, cardápios digitais e placas NFC para avaliações no Google), Casimiro de Abreu (RJ).

Feito com React + TypeScript + Tailwind CSS v4, na estrutura do shadcn/ui (`components.json`, `src/components/ui`, `src/lib/utils.ts`).
Direção visual inspirada na Apple: vitrine escura, produto em destaque, tipografia grande (Inter) e um único azul de ação.

## Como rodar

```bash
cd bn-digital
npm install
npm run dev       # desenvolvimento: http://localhost:5173
npm run build     # gera a versão publicável em dist/
npm run preview   # confere o build: http://localhost:4173
```

A pasta `dist/` vai versionada: é o site pronto (HTML, CSS, JS e imagens) e funciona em qualquer hospedagem estática, inclusive em subpasta.
Depois de mudar algo, rode `npm run build` de novo antes de publicar.

## Onde mudar cada coisa

| O que | Arquivo |
|---|---|
| WhatsApp, Instagram, cidade e textos das mensagens do WhatsApp | `src/data/site.ts` |
| Trabalhos do carrossel (ordem, nome, legenda) | `src/data/site.ts` → `trabalhos` |
| Prints dos trabalhos | `public/trabalhos/*.webp` (celular em pé, ~640 px de largura) |
| Cores e fonte | `src/index.css` → bloco `@theme` |
| Textos de cada seção | `src/components/sections/*.tsx` |
| Perguntas frequentes | `src/components/sections/faq.tsx` |

Para adicionar um trabalho: coloque o print em `public/trabalhos/` e acrescente um item em `trabalhos` com `src`, `alt` (descrição da imagem), `title` e `subtitle`.
`scripts/crop.mjs` mostra como os prints atuais foram recortados (remove a barra de status e a do navegador) e convertidos para WebP com o `sharp`.

## Seções

1. Início: chamada principal, botão de orçamento no WhatsApp e vitrine com celulares e a placa NFC
2. Últimos trabalhos: carrossel 3D (Skiper49 / Swiper, efeito coverflow), arrastável, com setas e bolinhas
3. Sites e cardápios digitais: recursos e segmentos atendidos
4. Placas NFC: como funciona em 3 passos e vantagens
5. Como funciona: as 4 etapas do projeto
6. Dúvidas (acordeão)
7. Chamada final e rodapé

Todos os botões de orçamento abrem o WhatsApp (22) 99705-2912 com a mensagem pronta.
Com "reduzir movimento" ativado no aparelho, as animações ficam desligadas.

## Componente do carrossel

`src/components/ui/skiper49.tsx` é o componente Skiper49 / `Carousel_003` da Skiper UI, copiado como veio.
Única mudança: cada imagem aceita `title` e `subtitle` opcionais, mostrados como legenda no slide.
O tamanho dos slides e as cores das setas e bolinhas são ajustados em `src/index.css` (bloco "Carrossel de trabalhos").
A versão gratuita da Skiper UI exige atribuição; ela está no rodapé ("Carrossel por Skiper UI").

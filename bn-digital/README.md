# BN Digital — site

Site da BN Digital (sites, cardápios digitais e placas NFC para avaliações no Google), Casimiro de Abreu (RJ).

Feito com React + TypeScript + Tailwind CSS v4, na estrutura do shadcn/ui (`components.json`, `src/components/ui`, `src/lib/utils.ts`).
Direção visual inspirada na Apple: seções alternando branco e preto, títulos em serifa (Playfair Display), texto em Inter e o azul da logo como destaque.

## Como rodar

```bash
cd bn-digital
npm install
npm run dev       # desenvolvimento: http://localhost:5173
npm run build     # gera a versão publicável em dist/
npm run preview   # confere o build: http://localhost:4173
```

**Publicação:** o workflow `.github/workflows/publicar-bn-digital.yml` publica `dist/` no GitHub Pages a cada mudança na `main` (endereço: https://oliveirabrennobjj-beep.github.io/Meu-site/). Na primeira vez, ative em Settings → Pages → Source: "GitHub Actions".

A pasta `dist/` vai versionada: é o site pronto (HTML, CSS, JS e imagens) e funciona em qualquer hospedagem estática, inclusive em subpasta.
Depois de mudar algo, rode `npm run build` de novo antes de publicar.

## Onde mudar cada coisa

| O que | Arquivo |
|---|---|
| WhatsApp, Instagram, cidade e textos das mensagens do WhatsApp | `src/data/site.ts` |
| Trabalhos do carrossel (ordem, nome, legenda) | `src/data/site.ts` → `trabalhos` |
| Prints dos trabalhos | `public/trabalhos/*.webp` (celular em pé, ~640 px de largura) |
| Logo | `public/logo-bn-digital.webp` (e `favicon.png`) |
| Fotos das placas NFC | `public/nfc/*.webp` |
| Cores e fontes | `src/index.css` → blocos `@theme` e `.theme-light` / `.theme-mist` / `.theme-dark` (cada seção escolhe o seu) |
| Textos de cada seção | `src/components/sections/*.tsx` |
| Perguntas frequentes | `src/components/sections/faq.tsx` |

Para adicionar um trabalho: coloque o print em `public/trabalhos/` e acrescente um item em `trabalhos` com `src`, `alt` (descrição da imagem), `title` e `subtitle`.
`scripts/crop.mjs` e `scripts/crop-fotos.mjs` mostram como os prints, a logo e as fotos das placas foram recortados e convertidos para WebP com o `sharp`.

## Seções

1. Início (branco): chamada principal, botão de orçamento no WhatsApp, celulares com sites e foto da placa NFC
2. Últimos trabalhos (preto): carrossel 3D (Skiper49 / Swiper, efeito coverflow), arrastável, com setas e bolinhas
3. Sites e cardápios digitais (cinza-claro, cartões brancos): recursos e segmentos atendidos
4. Placas NFC (preto): fotos reais das placas, 3 passos em cartões brancos e vantagens
5. Como funciona (branco): as 4 etapas do projeto
6. Preços (preto): site, cardápio e placa, todos "sob consulta", com botão para pedir o valor no WhatsApp
7. Dúvidas (branco, acordeão)
8. Chamada final e rodapé

Todos os botões de orçamento abrem o WhatsApp (22) 99705-2912 com a mensagem pronta.
Com "reduzir movimento" ativado no aparelho, as animações ficam desligadas.
A fonte, o fundo e as cores básicas ficam fora de `@layer` no CSS de propósito: assim nenhuma página que incorpore o site (como a visualização do Claude) consegue sobrescrevê-las.

## Componente do carrossel

`src/components/ui/skiper49.tsx` é o componente Skiper49 / `Carousel_003` da Skiper UI, copiado como veio.
Única mudança: cada imagem aceita `title` e `subtitle` opcionais, mostrados como legenda no slide.
O tamanho dos slides e as cores das setas e bolinhas são ajustados em `src/index.css` (bloco "Carrossel de trabalhos").
A versão gratuita da Skiper UI exige atribuição; ela está no rodapé ("Carrossel por Skiper UI").

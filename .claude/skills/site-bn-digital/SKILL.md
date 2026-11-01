---
name: site-bn-digital
description: Cria do zero um site completo e bonito para um cliente da BN Digital (açaiteria, pizzaria, barbearia, academia, padaria, salão, lanchonete, loja, clínica etc.), pronto para mostrar ao dono. Use quando o Brenno pedir "faz um site pra/para <negócio>", "cliente novo quer site", "usa a skill de site", "/site-bn-digital", ou mandar nome/Instagram de um comércio pedindo um site. Entrega pasta própria no repositório, capturas no celular e no computador, link publicado e mensagem pronta para mandar ao cliente no WhatsApp.
---

# Site BN Digital

Objetivo: o Brenno fala o negócio, e sai um site **pronto para vender**: bonito de verdade, rápido no celular, com botão de WhatsApp funcionando e nada inventado.

O Brenno fala português, usa o celular e quer respostas curtas, passo a passo e com links. Fale com ele assim. Não mostre código para ele, mostre o resultado (capturas e link).

## Modo de trabalho

- **Modo direto (padrão):** depois de juntar as informações, faz o site inteiro e só para no final para mostrar. É o "já sai pronto".
- **Modo etapas:** se o Brenno pedir "por etapas" ou "quero aprovar", pare depois de cada fase marcada com ⏸ abaixo e espere ele dizer "ok".

## Fase 1. Juntar o que existe (sem inventar)

Pergunte **uma vez só**, numa lista curta, o que ainda faltar. Não trave esperando o que é opcional.

Obrigatório:
1. Nome do negócio e ramo (ex.: "Açaí do Zé, açaiteria").
2. Cidade/bairro.
3. WhatsApp para pedidos.

Ajuda muito (opcional):
4. Instagram do negócio (de onde saem fotos, cardápio, horários e cores).
5. Endereço, horários, cardápio/serviços com preços.
6. Logo e fotos reais (o Brenno pode mandar pelo chat).
7. Um site que o dono acha bonito, como referência.

Regras:
- **Nunca invente** telefone, endereço, horário, preço, depoimento, número de clientes ou prêmio. O que faltar vira campo vazio em `config.js` (o site esconde ou mostra "Consulte pelo WhatsApp") e entra na lista de pendências do README.
- Se houver Instagram ou site, tente ler (busca na web/Firecrawl). Se a rede bloquear, siga com o que o Brenno mandou e avise numa linha.
- Fotos: use as reais do cliente. A foto é metade da beleza do site: produto em close, fundo escuro ou madeira, luz quente. Sem foto real, use banco de imagens gratuito com licença livre (ex.: Unsplash, Pexels) **que mostre o produto daquele ramo**, e marque no README "trocar por fotos da loja". Se a rede bloquear os bancos de imagem, peça fotos ao Brenno ou, com o ok dele, gere com uma ferramenta de imagem conectada (ex.: Higgsfield, Canva), avisando que gasta créditos. Nunca use foto com marca de outra empresa.

## Fase 2. Referência e direção visual ⏸

**Primeiro a referência, depois o código.** O site tem que sair no nível de um "shot" bonito do Pinterest/Dribbble, não de modelo genérico.

1. **Print do Brenno (melhor caminho):** se ele mandou prints do Pinterest/Dribbble, essa é a referência principal. Olhe a imagem com atenção e anote: estrutura das seções, tamanho dos títulos, a palavra em fonte manuscrita, cores, formato dos cartões e dos botões, cantos, como a foto do topo ocupa o espaço.
2. **Biblioteca da skill:** veja `references/inspiracao/` (prints já aprovados pelo Brenno, um ou mais por ramo) e o padrão descrito em `references/ramos.md`.
3. **Buscar na web:** se a rede deixar, procure "<ramo> website design" no Pinterest, Dribbble ou Behance (Firecrawl search). Esses sites costumam estar bloqueados neste ambiente: se falhar, siga com 1 e 2 e, se não houver nada para o ramo, peça ao Brenno numa linha: "me manda 1 ou 2 prints do Pinterest do estilo que você curte".

Regras da referência:
- **Inspirar, não copiar:** use a estrutura, o clima e o nível de acabamento; troque textos, logo, fotos e detalhes. Nunca copie marca, nome ou foto de outro site.
- Tudo em português e com a cara do cliente (os textos da referência normalmente vêm em inglês).
- Quando o Brenno aprovar um site novo, salve a referência usada em `references/inspiracao/<ramo>-<nome>.jpg` e acrescente uma linha em `references/inspiracao/LEIA.md`, para a biblioteca crescer.

Depois, leia `references/ramos.md` e escolha a direção do ramo. Depois, para ficar com cara de site caro e não de modelo pronto, carregue a skill **impeccable** (ou **frontend-design** se a impeccable não estiver disponível) e siga o fluxo dela para:
- definir paleta (4 a 6 cores como variáveis CSS), par de fontes do Google Fonts e o "detalhe assinatura" do site (o elemento que faz o dono falar "nossa");
- registrar em `<pasta>/PRODUCT.md` e `<pasta>/DESIGN.md`, no mesmo formato de `hortifruti/`.

No modo etapas, mostre a direção em 3 linhas (cores, fontes, ideia do topo) e espere o ok.

## Fase 3. Construir

Padrão da casa (igual a `padaria/` e `hortifruti/`): **HTML, CSS e JS puros, sem build**, numa pasta nova na raiz do repositório com nome curto em minúsculas e hífen (ex.: `acaiteria-do-ze/`).

```
<pasta>/
  index.html
  README.md          ← como ver, onde mudar, pendências
  PRODUCT.md, DESIGN.md
  assets/css/styles.css   ← cores e fontes no topo (:root)
  assets/js/config.js     ← TODOS os dados editáveis (window.SITE = {...})
  assets/js/main.js       ← lê o config e monta as partes dinâmicas
  assets/img/             ← fotos em WebP (até ~200 KB cada, 960 px e 480 px)
```

Seções (adapte ao ramo, corte o que não tiver conteúdo):
1. Topo (hero) com foto forte, frase curta que vende e botão "Pedir no WhatsApp".
2. Destaques / mais pedidos (cartões com foto).
3. Cardápio ou serviços (abas ou lista), com "Consulte" quando não tiver preço.
4. Sobre / diferencial (curto, verdadeiro).
5. Onde fica: endereço, horários e cartão "Abrir no Google Maps" (link, não iframe pesado).
6. Rodapé com Instagram, WhatsApp e "Site feito por BN Digital" linkando para https://oliveirabrennobjj-beep.github.io/Meu-site/.
7. Botão flutuante de WhatsApp no celular.

Obrigatório no código:
- Link do WhatsApp: `https://wa.me/55DDDNUMERO?text=<mensagem codificada>`; com número vazio, o botão leva ao Instagram ou some.
- SEO local: `<title>` e `description` com nome + ramo + cidade, `og:image` (JPG), `canonical` quando publicado, JSON-LD do tipo certo (`Restaurant`, `CafeOrCoffeeShop`, `BarberShop`, `ExerciseGym`, `BeautySalon`, `Store`…) só com dados confirmados.
- Acessibilidade: `lang="pt-BR"`, link "Pular para o conteúdo", contraste AA, `alt` nas fotos, foco visível, alvos de toque ≥ 44 px, respeita `prefers-reduced-motion`.
- Desempenho: imagem do topo com `preload`, demais com `loading="lazy"` e `width/height`; nada de framework; fontes com `display=swap`.
- Textos: use a skill **copywriting** para o topo e os destaques. Frases curtas, jeito de falar da cidade, sem clichê de IA ("eleve sua experiência", "não é só X, é Y").

## Fase 4. Conferir antes de mostrar (não pule)

1. Rode as capturas:
   `node .claude/skills/site-bn-digital/scripts/capturas.mjs <pasta>`
   Ele sobe um servidor local, tira print no celular (390 px) e no computador (1440 px) e lista erros do console. As imagens ficam em `docs/capturas/<pasta>/`.
2. Olhe as capturas de verdade (Read nas imagens) e corrija o que estiver feio: texto cortado, foto esticada, espaço sobrando, botão escondido, rolagem lateral.
3. Passe pelo `references/checklist.md` inteiro. Só siga quando tudo estiver ✅ ou explicado.
4. Se a skill **impeccable** estiver disponível, rode a revisão dela (critique/polish) e aplique as correções materiais.

## Fase 5. Publicar e entregar

1. Commit numa branch nova (`claude/site-<pasta>`), push e PR para `main` (o Brenno faz o merge pelo celular).
2. Publicação: o workflow `.github/workflows/publicar-bn-digital.yml` só publica `bn-digital/dist` e `brteam/dist`. Para o site novo aparecer em `https://oliveirabrennobjj-beep.github.io/Meu-site/<pasta>/`, acrescente no passo "Junta os sites" um `mkdir -p _site/<pasta> && cp -r <pasta>/. _site/<pasta>/` e o caminho `<pasta>/**` em `on.push.paths`. Diga ao Brenno que o link funciona depois do merge.
3. Mande ao Brenno, nesta ordem e curto:
   - as 2 capturas (celular e computador) com SendUserFile;
   - o link do PR e o link que vai ficar no ar;
   - as pendências que dependem do cliente (ex.: "confirmar horário de domingo");
   - uma **mensagem pronta para o cliente** no WhatsApp, por exemplo:

     > Fala, <nome>! Montei uma prévia do site da <negócio>: <link>
     > Abre no celular e me diz o que achou. Se quiser trocar foto, texto ou preço, é só me mandar que eu ajusto.

## Ao terminar

Sugira em uma linha o próximo passo que faz sentido (ex.: "quer que eu faça 3 posts do Instagram anunciando o site?").

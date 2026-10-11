# Kitanda Hortifruti — site

Site estático (HTML, CSS e JS, sem build) da Rede Kitanda Hortifruti.
Este site é das lojas de **Casimiro de Abreu: Centro e Mataruna**.
Arraial do Cabo (2 lojas) e Rio das Ostras ficam guardadas em `outrasLojas`
no `config.js`, para um site próprio de cada cidade no futuro.
O layout se ajusta sozinho a 1, 2 ou mais lojas.

**Fase atual: só o design da loja.** Carrinho, preços, pagamento e delivery pelo site
ficam para a próxima fase. Por enquanto os botões levam ao WhatsApp de cada loja.

## Ver no computador

```bash
cd hortifruti
python3 -m http.server 8000
```

Abra <http://localhost:8000>.

## Onde mudar as coisas

Tudo em `assets/js/config.js`:

| O que | Campo |
|---|---|
| WhatsApp, endereço, mapa, horário e foto de cada loja | `lojas` |
| Cartões de "Compre por categoria" | `categorias` (nome, desc, img, pos) |
| Vitrine "Direto das bancadas" | `produtos` (nome, unidade, img, pos) |
| Instagram / Facebook | `instagram`, `facebook` |

`pos` é o enquadramento da foto (ex.: `"50% 80%"` mostra a parte de baixo).
Endereço vazio aparece como "Endereço em breve no site".

## Visual

Ver `DESIGN.md`. Cores e fontes no topo de `assets/css/styles.css`.

## Fotos

As fotos em `assets/img/` foram recortadas dos posts do Instagram da Kitanda
(bancadas reais). Algumas são pequenas (mamão, aipim, laranja, uva: ~350 px):
vale trocar por fotos maiores tiradas na loja. Para trocar, salve em WebP
e use o nome do arquivo (sem extensão) no campo `img`.

## Pendências antes de publicar

1. WhatsApp das lojas do Centro e da Mataruna (o dono vai enviar). Enquanto o campo `whatsapp` estiver vazio,
   o botão abre a lista oficial em instabio.cc/Kitandahortifruti.
2. Endereço, horário e link do mapa de cada loja.
3. Link do Facebook (hoje abre a busca "Kitanda Hortifruti").

## Logo

A pera laranja com a folha verde é o logo da Kitanda (confirmado pelo dono).
No site ela está desenhada em SVG (símbolo `i-pear` no topo do `index.html` e `assets/img/favicon.svg`).
Se houver o arquivo original, ele pode substituir o desenho.

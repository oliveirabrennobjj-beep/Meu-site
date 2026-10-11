# Kitanda Hortifruti — site

Site estático (HTML, CSS e JS, sem build) da Rede Kitanda Hortifruti:
Casimiro de Abreu, Arraial do Cabo e Rio das Ostras (RJ).

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
| WhatsApp, endereço, mapa e horário de cada loja | `lojas` |
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

1. Confirmar os 3 WhatsApps (vieram de um post de maio/2023); o dono vai enviar os números.
2. Endereços, horários e link do mapa de cada loja.
3. Link do Facebook (hoje abre a busca "Kitanda Hortifruti").

## Logo

A pera laranja com a folha verde é o logo da Kitanda (confirmado pelo dono).
No site ela está desenhada em SVG (símbolo `i-pear` no topo do `index.html` e `assets/img/favicon.svg`).
Se houver o arquivo original, ele pode substituir o desenho.

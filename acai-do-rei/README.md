# Açaí do Rei Delivery — site

Site estático (HTML, CSS e JS, sem build) do Açaí do Rei Delivery, na Praça do Skate em Casimiro de Abreu (RJ).
Feito com a skill `site-bn-digital`: dados do Instagram @acaidoreideliverycasimiro + referência visual do Pinterest (topo roxo/magenta com copos, cartões de combos, faixa de promoção, "Monte seu açaí").

No ar (depois do merge): <https://oliveirabrennobjj-beep.github.io/Meu-site/acai-do-rei/>

## Ver no computador

```bash
cd acai-do-rei
python3 -m http.server 8000
```

Abra <http://localhost:8000>. Também abre dando dois cliques no `index.html`.

## Onde mudar as coisas

Tudo em `assets/js/config.js`:

| O que | Campo |
|---|---|
| WhatsApp e mensagem pronta | `contato.whatsapp`, `contato.mensagemWhatsapp` |
| Instagram | `contato.instagram` |
| Endereço e link do mapa | `local.texto`, `local.mapaUrl` |
| Horários | `horarios` |
| Cartões "Os queridinhos" | `destaques` (nome, desc, preco, img, selo) |
| Promoções | `promocoes` (nome, tamanho, preco) e `avisoPromocoes` |
| Adicionais | `adicionais` |

Preço vazio aparece como "Consulte no WhatsApp". Lista de promoções vazia esconde a seção.
Cores e fontes ficam no topo de `assets/css/styles.css`. Visual descrito em `DESIGN.md`.

## Fotos

As fotos de `assets/img/` foram recortadas de um print do Instagram (352 px).
Servem para a prévia, mas ficam melhores trocadas por fotos originais em boa resolução
(salve em WebP, quadradas, e use o nome do arquivo sem extensão no campo `img`).
O post com Nutella aparecendo não foi usado (marca de outra empresa), nem o post de promoção com políticos.

## Pendências com o cliente

1. Nomes e preços dos copos dos "queridinhos" (hoje os nomes descrevem a foto).
2. Se as promoções Ninhotella 300 ml (R$ 13,00) e Maracutella 500 ml (R$ 22,00) ainda valem.
3. Dias de funcionamento do delivery (o Instagram só diz "14:00 às 23:00").
4. Tamanhos, preços e lista completa de adicionais (se quiser no site).
5. Logo oficial em SVG ou PNG em alta (hoje é um redesenho do logo do Instagram).
6. Fotos originais em boa resolução.
7. Texto completo da bio ("Única plataforma de pedido...") para o aviso de golpe.

# Nota do CFO (BN Digital)

- **A margem:** a R$ 79/mês, cada cliente deixa R$ 73,17 depois dos custos diretos (93%). Com 15 clientes ativos, a margem é de 83%. Os custos são baixos, então **o problema não é margem, é conseguir clientes**.
- **O ponto de equilíbrio:** cerca de 1,5 cliente por mês cobre o custo fixo (a assinatura do Claude, estimada).
- **A linha a observar:** a quantidade de clientes. Com metade do volume planejado, o lucro do ano 1 cai de R$ 6.802 para R$ 2.741 (o que-se da ferramenta com volume em 50%). O ramp (1 cliente no mês 1, chegando a 15 no mês 12) é um **palpite**: o painel simulado deu 0% de compra a R$ 200, então nada aqui foi provado.
- **Dinheiro para começar:** cerca de R$ 287 (5 placas de demonstração e impulsionamento), também estimados.
- **Fora do modelo:** a taxa de criação de R$ 250 por cliente novo entra à parte. Com 15 clientes no ano, seriam até R$ 3.750 a mais, menos os 5 fundadores que não pagam a criação.
- **Três formas de melhorar o resultado:**
  1. Preço de R$ 99 em vez de R$ 79: lucro do ano 1 sobe de R$ 6.802 para R$ 9.022 (o que-se da ferramenta com preço de R$ 99).
  2. Vender o plano Completo (R$ 149) para 1 em cada 3 clientes.
  3. Vender a placa avulsa (R$ 129, custo de ~R$ 30) para quem recusa o site: cerca de R$ 99 de lucro por placa.
- **Condições financeiras do conselho:** a margem está calculada (✔), mas o custo real da placa e do domínio ainda **não foi cotado** (✘).

Isto não é assessoria contábil. Antes de crescer, converse com um contador sobre MEI e impostos.

---

# Unit economics: BN Digital

Every number below comes from the input file. Nothing is looked up or guessed.

## One cliente ativo no mês

| line | per cliente ativo no mês |
| --- | ---: |
| Price | $79.00 |
| Domínio .com.br (R$ 40/ano ÷ 12) [estimativa] | -$3.33 |
| Placa NFC (custo ~R$ 30 ÷ 12 meses) [estimativa] | -$2.50 |
| Hospedagem estática (GitHub Pages/Cloudflare, grátis) [estimativa] | -$0.00 |
| **Contribution** (what each cliente ativo no mês leaves to pay the fixed costs) | **$73.17** (93%) |

## The margin that matters

Fixed costs: $110 a month (Assinatura Claude (~US$ 20) [estimativa] $110).

- **Break-even: 2 cliente ativo no mêss a day.** Below that you lose money every month.
- **Profit margin at your plan** (15 a day): **83%** of every sale, after every cost.

## Year 1, month by month

| month | cliente ativo no mêss a day | revenue | profit | cumulative (after $250 startup) |
| ---: | ---: | ---: | ---: | ---: |
| 1 | 1 | $79 | -$37 | -$287 |
| 2 | 2 | $158 | $36 | -$250 |
| 3 | 4 | $316 | $183 | -$68 |
| 4 | 6 | $474 | $329 | $261 |
| 5 | 8 | $632 | $475 | $737 |
| 6 | 10 | $790 | $622 | $1,358 |
| 7 | 11 | $869 | $695 | $2,053 |
| 8 | 12 | $948 | $768 | $2,821 |
| 9 | 13 | $1,027 | $841 | $3,662 |
| 10 | 14 | $1,106 | $914 | $4,577 |
| 11 | 15 | $1,185 | $988 | $5,564 |
| 12 | 15 | $1,185 | $988 | $6,552 |

- **Year 1 operating profit: $6,802** on $8,769 of revenue.
- After the $250 startup spend: $6,552.
- Startup money earned back: month 4.
- Cash you need before it pays for itself: **$287**.

## What if

| scenario | margin at plan | break-even a day | year 1 profit |
| --- | ---: | ---: | ---: |
| Base plan | 83% | 2 | $6,802 |
| Price -10% | 81% | 2 | $5,925 |
| Volume -20% | 81% | 2 | $5,177 |
| Unit costs +15% | 82% | 2 | $6,705 |

No red flags in these numbers. They are only as good as the inputs: check every cost against a real quote.

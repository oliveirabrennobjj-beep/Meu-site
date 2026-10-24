---
name: leis-brasil
description: Consulta o texto oficial de leis brasileiras (Constituição, leis federais, decretos, leis estaduais e municipais, súmulas do STF/STJ/TST e normas de agências reguladoras) no acervo ctresb/leis. Use antes de afirmar o que uma lei diz, e sempre que o trabalho tocar em regra legal - LGPD e dados pessoais em sites e formulários, Código de Defesa do Consumidor em preços, ofertas e promoções, envio de e-mail ou WhatsApp comercial, contratos, direitos autorais de fotos e músicas, exigências de acessibilidade, MEI, nota fiscal, alvará. Também quando o usuário perguntar "isso é legal?", "o que a lei diz sobre", "posso fazer X?".
---

# Leis do Brasil

Acervo: [ctresb/leis](https://github.com/ctresb/leis), licença MIT. Mais de 1 milhão de arquivos
em Markdown, cada um com cabeçalho (título, ementa, se está revogada, link da fonte oficial).
O script baixa só a lista de caminhos (uns 5 segundos na primeira vez) e cada norma na hora de ler.

## Comandos

```bash
L=.claude/skills/leis-brasil/scripts/leis.sh
$L procurar 'federal/.*lei-8078-1990'  # acha o arquivo pelo número e ano
$L ler federal/leis-ordinarias/1990/lei-8078-1990-09-11.md
$L pastas federal                      # tipos de norma federal
$L pastas estaduais/RJ                 # o que há para um estado
$L pastas municipais/RJ                # municípios com acervo (ainda parcial)
$L atualizar                           # pega a versão mais nova
```

`procurar` aceita regex e mostra até 50 caminhos (`LIMITE=200 $L procurar ...` para mais).
O mesmo número pode existir em vários estados; comece o padrão com `federal/` ou `estaduais/<UF>/`.

## Onde está cada coisa

| Pasta | Conteúdo | Nome do arquivo |
|---|---|---|
| `constituicao.md` | Constituição Federal | |
| `federal/leis-ordinarias/<ano>/` | Leis federais | `lei-<número>-<aaaa-mm-dd>.md` |
| `federal/decretos/<ano>/` | Decretos federais | `dec-<número>-<aaaa-mm-dd>.md` |
| `federal/leis-complementares/`, `decretos-lei/`, `medidas-provisorias/`, `emendas-constitucionais/` | Demais normas federais | veja com `pastas` |
| `estaduais/<UF>/` | Leis estaduais | |
| `municipais/<UF>/<município>/` | Leis municipais (cobertura parcial) | |
| `jurisprudencia/stf/sumulas-vinculantes/`, `stf/sumulas/`, `stj/`, `tst/` | Súmulas e precedentes | `sumula-vinculante-<n>.md` |
| `reguladores/<órgão>/` | Atos de agências (anvisa, anac, rfb, mapa…) | |

## Leis que mais aparecem neste projeto (sites e marketing para pequenos negócios)

| Assunto | Norma | Procurar por |
|---|---|---|
| Dados pessoais, formulários, cookies, e-mail marketing | LGPD, Lei 13.709/2018 | `federal/.*lei-13709-2018` |
| Preço, oferta, publicidade, promoção | Código de Defesa do Consumidor, Lei 8.078/1990 | `federal/.*lei-8078-1990` |
| Comércio eletrônico (dados obrigatórios do vendedor no site) | Decreto 7.962/2013 | `federal/.*dec-7962-2013` |
| Internet, guarda de registros | Marco Civil, Lei 12.965/2014 | `federal/.*lei-12965-2014` |
| Fotos, textos e músicas de terceiros | Direitos Autorais, Lei 9.610/1998 | `federal/.*lei-9610-1998` |
| Acessibilidade em sites | Estatuto da Pessoa com Deficiência, Lei 13.146/2015, art. 63 | `federal/.*lei-13146-2015` |
| Contratos | Código Civil, Lei 10.406/2002 | `federal/.*lei-10406-2002` |

Se não souber o número da lei, use o próprio conhecimento para chegar ao número e confirme
lendo o arquivo; o cabeçalho `ementa:` diz do que a norma trata.

## Regras

1. **Leia antes de citar.** Não afirme o que um artigo diz sem abrir o arquivo. Cite o artigo e
   dê o link do campo `fonte:` do cabeçalho.
2. **Confira se está em vigor.** Veja `revogada:` e `versao_texto:` no cabeçalho. Se estiver
   revogada, procure a norma que a substituiu.
3. **Aviso.** O acervo é conversão automática (às vezes OCR) e não substitui o Diário Oficial.
   Para decisões com risco (contrato, multa, processo), diga ao usuário para confirmar com um
   advogado ou contador.
4. Se a norma não estiver no acervo (comum em leis municipais), diga isso e indique a fonte
   oficial (site da prefeitura ou da câmara municipal) em vez de supor o conteúdo.

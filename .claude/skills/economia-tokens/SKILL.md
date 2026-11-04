---
name: economia-tokens
description: Modo econômico para gastar menos do limite do Claude. Use quando o Brenno disser "modo econômico", "economiza token", "tá gastando muito", "/economia-tokens", ou quando a tarefa for simples e repetitiva (ajuste de texto, troca de cor, correção pequena). Também diz qual modelo e esforço usar e quando limpar a conversa.
---

# Modo econômico

Objetivo: entregar o mesmo resultado gastando menos do limite. O que mais gasta é **contexto** (tudo que já está na conversa é reenviado a cada mensagem), depois **pensamento longo** e **ferramentas que despejam muita saída**.

## Como responder enquanto o modo estiver ligado

- Resposta curta: a ação feita e o resultado, sem repetir o pedido nem explicar o óbvio.
- Nada de resumo no fim se o diff ou o arquivo já mostra o que mudou.
- Código, comandos, caminhos e mensagens de erro ficam exatos; só o texto em volta encolhe.
- Pergunta só quando a resposta mudar o que vai ser feito.

## Como trabalhar gastando menos

1. **Ler pouco.** Use Grep/Glob para achar o trecho e leia só as linhas necessárias (`offset`/`limit`). Não abra arquivo inteiro de 1.000 linhas para trocar uma cor.
2. **Cortar saída de comando.** Sempre `| tail -20`, `| head -50`, `grep -c`, `--quiet`. Nunca imprimir `node_modules`, logs completos, JSON gigante ou HTML minificado.
3. **Não repetir trabalho.** Não releia arquivo que acabou de editar; o Edit já falha se não aplicar.
4. **Chamadas em paralelo.** Buscas independentes vão juntas numa mensagem só.
5. **Subagente só para coisa barulhenta** (varrer muitos arquivos, ler documentação longa). Cada subagente começa do zero e também gasta; para tarefa pequena, faça direto.
6. **Capturas de tela:** `deviceScaleFactor: 1` quando só o Claude vai olhar; uma captura por tela, não dez.
7. **Pesquisa na web:** modo `standard` primeiro; `extended` só se vier fraco.

## O que recomendar ao Brenno (diga em 1 linha quando fizer sentido)

| Situação | Recomendação |
|---|---|
| Mudou de assunto/cliente | `/clear` (de graça). Antes, `/rename` para achar depois com `/resume` |
| Conversa longa mas precisa continuar | `/compact foco no site X e nas decisões` |
| Tarefa simples (texto, cor, foto) | `/model` → Sonnet, e `/effort low` ou `medium` |
| Tarefa difícil (site novo, bug estranho) | Opus com esforço `high`; evitar `max` |
| Quer saber o que está gastando | `/usage` (mostra o que pesa e sugere correções; aperte `f`) e `/context` |
| Saiu para almoçar no meio | Voltar depois de muito tempo reprocessa tudo; prefira `/clear` + resumo curto |

## Pedido bom gasta menos

Ruim: "melhora o site". Bom: "no `acai-do-rei/index.html`, troca o telefone do rodapé para (xx) xxxxx-xxxx". Quanto mais exato (arquivo, seção, o que muda), menos o Claude precisa procurar.

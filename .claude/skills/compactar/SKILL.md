---
name: compactar
description: Resume a conversa inteira em 5 a 7 pontos para colar num chat novo. Use quando o usuário escrever "COMPACTAR" (ou "compactar", "/compactar").
---

# COMPACTAR

Quando o usuário escrever **COMPACTAR**, gere um resumo da conversa inteira para ele copiar e colar num chat novo e continuar de onde parou.

## Regras

- **5 a 7 pontos**, numerados. Nem mais, nem menos.
- Cada ponto cobre um tema e traz o **contexto crítico**: o que existe, onde está e em que estado.
- Inclua as **decisões tomadas** e o motivo, em uma linha.
- Inclua os **trechos de código** essenciais (comandos, caminhos, configs curtas) em blocos de código. Só o que o próximo chat precisa para continuar.
- Inclua links, nomes de arquivos, branches, repositórios e URLs exatos.
- Termine com **pendências**: o que falta fazer e o que depende do usuário.
- Não invente nada. Se algo não foi confirmado, marque como "não confirmado".
- Não inclua senhas, chaves de API nem dados pessoais de terceiros.

## Formato da resposta

Responda **somente** com um único bloco de código em Markdown, pronto para copiar:

````
```markdown
# Contexto da conversa anterior

1. **<tema>**: <contexto, estado e decisão>
2. ...
(5 a 7 pontos)

## Pendências
- ...

Continue a partir daqui.
```
````

Sem texto antes nem depois do bloco.

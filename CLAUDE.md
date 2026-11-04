# Meu-site (BN Digital)

Repositório de sites da BN Digital (comércios locais). Cada cliente tem sua pasta na raiz (`acai-do-rei/`, `padaria/`, `hortifruti/`...). Skills em `.claude/skills/` (catálogo: `.claude/SKILLS.md`).

## Economia de tokens (sempre)

- Respostas curtas e diretas, em português simples. Sem resumo final repetindo o que já foi mostrado.
- Ler só o necessário: Grep/Glob antes de abrir arquivo; ler trechos, não arquivos inteiros.
- Cortar saída de comandos (`| tail`, `| head`, `--quiet`). Nunca despejar logs, `node_modules` ou HTML minificado.
- Não reler arquivo recém-editado. Chamadas independentes em paralelo.
- Subagentes só para buscas grandes; tarefa pequena se faz direto.
- Mexer só na pasta do cliente pedido.
- Guia completo: `docs/economia-de-tokens.md`.

## Compact instructions

Ao compactar, guarde: qual cliente/pasta está em uso, o que já foi feito, decisões de design (cores, fontes), o que falta e links publicados. Descarte saídas de comandos e conteúdo de arquivos já lidos.

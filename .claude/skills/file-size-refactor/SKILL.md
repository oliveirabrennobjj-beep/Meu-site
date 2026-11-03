---
name: file-size-refactor
description: Quebra os arquivos que passam do teto de linhas (regra quality/max-lines) em módulos menores, cortando por responsabilidade e sem mudar o comportamento, três arquivos por rodada, com typecheck, testes, lint e um commit por arquivo. Use quando o Brenno pedir "quebrar os arquivos grandes", "dividir arquivos gigantes", "refatorar arquivos acima de 350 linhas" ou "/file-size-refactor". Passo 2 de 3, depois de eslint-quality-gates-install e antes de eslint-warning-burndown.
---

# Quebrar os arquivos grandes

Fonte: prompt `docs/prompts/09-file-size-refactor.md` de
soumatheusgomes/vibe-coding-toolkit (commit `21b71b6`, licença MIT).

Valores padrão desta instalação, a menos que o pedido diga outra coisa:

- `[MAX_LINES]` = `350`
- `[BATCH_SIZE]` = `3`
- `[RULE_ID]` = `quality/max-lines`
- `[LINT_COMMAND]`, `[TEST_COMMAND]`, `[TYPECHECK_COMMAND]`: descubra sozinho
  lendo o `package.json` (use `none` para typecheck em JavaScript puro, e
  diga se não houver script de teste)
- `[STACK/FRAMEWORK]`: descubra lendo o projeto

Pré-requisito: a regra `quality/max-lines` instalada (skill
`eslint-quality-gates-install`). Se ela não existir, pare e diga isso.

Commits: faça na branch de trabalho atual, nunca em `main`. Não faça push sem
o Brenno pedir.

Execute o prompt abaixo, substituindo os marcadores pelos valores acima.
Depois, o passo seguinte é a skill `eslint-warning-burndown`.

## The prompt

```
Split the files that exceed this project's per-file size budget into
smaller, focused modules. This is behavior-preserving refactoring, not a
rewrite and not a feature change.

## 0. Ground truth

Run [LINT_COMMAND] and list every file reported by [RULE_ID], with its
actual line count, sorted largest first. Use the real output from running
it now. Never a count from memory, from a previous message, or from a
summary — if the command's output is truncated by a wrapper, run the
linter directly until you have the full list.

Report that list before touching anything.

## 1. Pick the batch

Take the [BATCH_SIZE] largest files. Do not start on any others.

For each one, before editing, state:
  - what the file is responsible for today, in one sentence
  - the seams you found, and which one you will cut on
  - what its public exports are (the names other files import from it)

## 2. Where to cut

Cut on responsibility, never on line count. The four seams worth looking
for, in this order:

  - business logic mixed into a UI or route file -> a domain service or
    use-case module
  - a repeated block of UI -> a reusable sub-component
  - data access (queries, ORM calls, raw SQL) -> a repository or adapter
  - a cluster of helpers that only serve one concept -> a
    domain-specific utility module

If a file has no seam — it is one long, genuinely cohesive
implementation — say so, leave it alone, and move to the next file. Adding
an abstraction that exists only to satisfy the linter makes the codebase
worse than the long file did. Report it as "no natural seam" and let a
human decide.

Never split at an arbitrary line number to get under the budget. A file
named helpers.ts, utils.ts, misc.ts or common.ts holding whatever was
left over is a failure, not a result.

## 3. Preserve the interface

After the split, the original file's public exports must still exist,
with the same names and the same signatures. Prefer leaving the original
file as a thin module that re-exports from the new ones over editing
every import site across the codebase.

Rewriting import sites is allowed only when the original file is meant to
disappear entirely, and only when you say so explicitly before doing it.

## 4. One file at a time

For each file in the batch, in order:

  a. make the split
  b. run [TYPECHECK_COMMAND] (skip if it is "none")
  c. run [TEST_COMMAND]
  d. run [LINT_COMMAND] and confirm the file is no longer reported, and
     that no NEW violation appeared anywhere
  e. commit, with a message naming the file and the seam you cut on
  f. only then move to the next file

If b, c, or d fails, fix it before moving on. Do not proceed with a
failing check and do not batch the fixes at the end.

Watch for a specific trap in step d: extracting code frequently trades one
violation for another. A function pulled out of a long file can push its
new home over the budget, and an extraction can change a function's
inferred return type, which surfaces as a type error rather than a lint
error. Both are your problem, in the same commit.

## 5. Stop and report

After [BATCH_SIZE] files, stop. Do not continue into the next batch on
your own.

Report:
  - the files you split, and the seam used for each
  - the files you deliberately did NOT split, and why
  - the output of [LINT_COMMAND] run one final time: how many files are
    still over the budget, and their names
  - any violation of another rule that appeared as a side effect

Mark nothing as done that you did not verify by running the command again.

Codebase: [STACK/FRAMEWORK]. Budget: [MAX_LINES] lines. Rule: [RULE_ID].
```


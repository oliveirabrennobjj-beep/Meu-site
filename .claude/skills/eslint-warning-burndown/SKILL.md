---
name: eslint-warning-burndown
description: Planeja e executa a limpeza dos avisos (warnings) de lint que restaram num projeto, regra por regra ou o conjunto inteiro, com contagem real, um ponto de decisão antes da parte mais arriscada, ondas de trabalho em arquivos separados, revisão e checklist final verificado rodando lint, typecheck, testes e build. Use quando o Brenno pedir "zerar o resto", "zerar os warnings", "limpar os avisos do ESLint", "warning burndown" ou "/eslint-warning-burndown". Passo 3 de 3, depois de eslint-quality-gates-install e file-size-refactor.
---

# Zerar o resto (ESLint warning burndown)

Fonte: prompt `docs/prompts/02-eslint-warning-burndown.md` de
soumatheusgomes/vibe-coding-toolkit (commit `21b71b6`, licença MIT).

Valores padrão desta instalação, a menos que o pedido diga outra coisa:

- `[RULE_NAME]` = o conjunto inteiro de avisos restantes
- `[LINT_COMMAND]`, `[TYPECHECK_COMMAND]`, `[TEST_COMMAND]`, `[BUILD_COMMAND]`:
  descubra sozinho lendo o `package.json` (diga quais não existem)
- `[STACK/FRAMEWORK]`: descubra lendo o projeto

O prompt cita `05-parallel-wave-dispatch.md` "nesta mesma pasta": ele está em
`references/parallel-wave-dispatch.md`, ao lado deste arquivo.

No ponto de decisão (passo 1), pergunte ao Brenno e espere a resposta antes de
mexer na área de risco. Commits só na branch de trabalho atual, nunca em
`main`; não faça push sem ele pedir.

Execute o prompt abaixo, substituindo os marcadores pelos valores acima.

## The prompt

```
You are planning and executing a lint warning burn-down for [RULE_NAME] (or
the full warning set) in this repo. Do not start fixing anything until the
plan below is written and the decision gate in step 1 is answered.

## 0. Ground truth
Run `[LINT_COMMAND]` right now and report the actual current count — total
warnings, broken down by rule and by file. Do not reuse a number from an
earlier run, a commit message, or memory. If the output looks filtered or
truncated (some wrappers/proxies summarize instead of showing every line),
re-run with whatever flag or direct invocation gives full per-line output.

## 1. 🔴 Decision gate — answer before any implementation
Find the single riskiest or most expensive part of this burn-down — usually
one rule responsible for a large share of the count, concentrated in files
where "fixing" it is expensive or risky (e.g. a size cap tripped mainly in
generated or test files). State it with real numbers: file count, line
count, estimated new files/functions if applicable. Then present options:

- **(A) Fix every violation fully.** Default if there's no response — the
  fully-correct option is the safe assumption when scope wasn't explicitly
  narrowed.
- **(B) Fix most, track the rest as tracked debt.** Fix the cheap majority;
  leave the expensive tail as an explicit, visible exception (comment +
  issue/ticket reference), not a silent suppression.
- **(C) Re-scope or loosen the rule itself.** ⚠️ **This is a config change,
  not a warning fix — say so explicitly in the plan and in any PR. Never
  present it as if the code got cleaner.**

Wait for a decision before implementing anything in this area. Everything
outside the flagged risk area proceeds regardless of which option is picked.

## 2. Success criteria — commands, not prose
State every criterion as a command and its expected output, e.g.:
- `[LINT_COMMAND] shows 0 warnings for [RULE_NAME]`
- `[TYPECHECK_COMMAND]` clean
- `[TEST_COMMAND]` green
- **Zero behavior change.** Any fix that isn't a pure mechanical
  extraction/rename/move gets pulled out of this burn-down and flagged as
  its own item for separate human review — never folded in silently.

## 3. Break the work into waves
Group the remaining violations into ordered, file-disjoint waves. For each
task in each wave, specify: task ID, exact file scope (`Files:`), what it
depends on (`Depends-on:`, or "none"), and the specialist role that owns
it. Use the parallel wave dispatch worksheet (`05-parallel-wave-dispatch.md`
in this same folder) for the grouping rule and dispatch mechanics.

## 4. Pitfalls — copy verbatim into every task brief
List every concrete gotcha specific to this rule and this codebase — e.g. a
size cap with zero slack left in files already near the limit, a lint
cache that doesn't invalidate on config changes, an extraction that
silently widens an inferred type, a shared test fixture with many callers.
A subagent implementing one task sees only its own brief, never this
planning conversation — a pitfall not copied into the brief does not exist
for it.

## 5. Reviewer sign-off
For each wave, name every specialist reviewer required before that wave
counts as done — a domain-risk reviewer for anything security/money/auth-
adjacent, plus whatever language/framework reviewers match the files
changed. Before calling the whole burn-down complete, require a full-diff
pass by every relevant reviewer type, at the same rigor as a normal review,
not a lighter one just because it's "only" a lint fix.

## 6. Final checklist — mark only by re-running
Every box below is checked by an actually-executed command, never by
assertion:
- [ ] `[LINT_COMMAND]` shows 0 warnings for [RULE_NAME] (or the count
      agreed at the decision gate)
- [ ] `[TYPECHECK_COMMAND]` clean
- [ ] `[TEST_COMMAND]` green
- [ ] `[BUILD_COMMAND]` succeeds
- [ ] Every suppression added (`eslint-disable` or equivalent) is listed
      with its justification — or the list is empty
- [ ] Every non-mechanical fix pulled out under step 2 is listed and
      signed off — or the list is empty
- [ ] All reviewer sign-offs from step 5 are complete

Codebase: [STACK/FRAMEWORK]. Rule(s) in scope: [RULE_NAME].
```


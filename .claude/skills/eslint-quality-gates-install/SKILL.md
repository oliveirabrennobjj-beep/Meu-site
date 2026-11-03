---
name: eslint-quality-gates-install
description: Instala no projeto JavaScript/TypeScript as três regras de qualidade do ESLint do vibe-coding-toolkit (teto de linhas por arquivo, proibição de console direto e proibição de a camada de tela importar o cliente do banco), copiando arquivos de regras já testados, e mede quantas violações existem, sem corrigir nenhuma. Use quando o Brenno pedir "instalar e medir", "instalar as regras de lint/ESLint", "quality gates", "limite de linhas por arquivo" ou "/eslint-quality-gates-install". Passo 1 de 3; depois vem file-size-refactor e por último eslint-warning-burndown.
---

# Instalar e medir (ESLint quality gates)

Fonte: prompt `docs/prompts/08-eslint-quality-gates-install.md` de
soumatheusgomes/vibe-coding-toolkit (commit `21b71b6`, licença MIT).

Valores padrão desta instalação, a menos que o pedido diga outra coisa:

- `[MAX_LINES]` = `350`
- `[PACKAGE_MANAGER]` = o que o repositório usa (descubra pelo lockfile)
- `[SOURCE_URL]` = `https://raw.githubusercontent.com/soumatheusgomes/vibe-coding-toolkit/21b71b6/templates/eslint`
  (fixado no mesmo commit desta skill para os seis arquivos virem da mesma revisão)

Se o projeto não tiver `package.json` (site só em HTML/CSS/JS solto), diga isso
e pergunte antes de criar um `package.json` só para instalar o ESLint.

Execute o prompt abaixo, substituindo os marcadores pelos valores acima.
Depois, o próximo passo natural é a skill `file-size-refactor`.

## The prompt

```
Install this project's ESLint quality gates by COPYING pre-written rule
files, not by writing rules from scratch. The rules already exist and are
already tested; your job is to place them and adapt the configuration to
this project's real shape.

## 0. Get the files

Fetch these six files into a temporary location from the same revision of
[SOURCE_URL] (default:
https://raw.githubusercontent.com/soumatheusgomes/vibe-coding-toolkit/main/templates/eslint):

  eslint-rules/utils.cjs
  eslint-rules/core-rules.cjs
  eslint-rules/index.cjs
  eslint.config.mjs.example
  eslint.typed.config.mjs.example
  verify.mjs

After inspecting the project in step 1, place or merge them like this;
preserve existing configuration, scripts, and protections:

  ./eslint-rules/utils.cjs
  ./eslint-rules/core-rules.cjs
  ./eslint-rules/index.cjs
  ./eslint.config.mjs          (from eslint.config.mjs.example)
  ./eslint.typed.config.mjs    (from eslint.typed.config.mjs.example, TypeScript only)
  ./verify.mjs                 (temporary; delete after step 5)

Copy the .cjs files byte for byte. Do not reformat them, do not convert
them to ESM, do not merge them into one file, do not "improve" them. They
are CommonJS on purpose so ESLint loads them with no build step. If you
rewrite them, this prompt has failed.

## 1. Read the project before changing anything

Report what you found before continuing:

- package manager, existing lint script, existing ESLint version
- whether this is TypeScript, and what path aliases tsconfig.json defines
- the source root: src/, app/, lib/, or the repository root
- the presentation layer: which directories hold UI or route entrypoints
- the data module: which file exports the database/ORM client, and under
  what name
- the log adapter: the module the project already logs through, if any

If the project is on ESLint 8 or older, stop and say so. The config uses
defineConfig and globalIgnores from eslint/config, which do not exist
before ESLint 9.

If there is no data module, say so and remove the
quality/no-direct-data-access rule instead of inventing a boundary this
project does not have.

## 2. Install dependencies

  [PACKAGE_MANAGER] i -D eslint@^9 @eslint/js@^9
  # TypeScript projects:
  [PACKAGE_MANAGER] i -D typescript-eslint
  # Only if enforcing import boundaries:
  [PACKAGE_MANAGER] i -D eslint-plugin-import-x eslint-import-resolver-typescript

Pin @eslint/js to the same major as eslint. Unpinned, the installer picks
@eslint/js@10, whose peer range demands eslint@10, and the install fails
with ERESOLVE.

## 3. Adapt eslint.config.mjs

Every item here is a real edit against what step 1 found, not a review:

- the `files` globs, if the source root is not src/
- quality/max-lines: set `max` to [MAX_LINES]
- quality/no-direct-data-access: set `modules` to the real import
  specifiers of the data module, `bindings` to the real exported client
  name, `layers` to the real presentation directories, `extensions` to
  the component file extension (drop `extensions` entirely on a
  non-React project)
- the import-x zones: rewrite them for this project's real layers, or
  delete the whole import-x block if the project has no layering yet. If
  you delete it, also delete its two imports at the top of the file and
  its two entries in the test-file block, or ESLint fails on an unknown
  rule id
- the quality/no-direct-console "off" block: point it at the real log
  adapter, or delete the block if there is none
- the `globals` list: add what this project's runtime actually provides
- globalIgnores: add this project's build output directories

Two failure modes that are completely silent when you get them wrong.
First, a block that turns a rule `off` must come AFTER the block that
turns it on — for a file matched by both, flat config applies the later
block last, so an `off` placed earlier is overridden without any warning.
Second, `except` inside a no-restricted-paths zone is relative to `from`;
it carves files out of `from` and cannot exempt an importer. To exempt an
importer, narrow `target`.

## 4. Wire the scripts

  "lint": "eslint ."
  "lint:fix": "eslint . --fix"
  "lint:typed": "eslint --config eslint.typed.config.mjs ."

Omit lint:typed on a JavaScript project; preserve an equivalent existing
script name. Keep the type-aware tier separate from the fast lint command
and measure its runtime/memory on the actual runner before selecting its
CI scope. Preserve an existing typed gate. Do not add Git hooks.

## 5. Verify the copy survived

  node verify.mjs

Expected: three lines ending in ": ok", exit code 0. Anything else means
the copy is broken — fix it before going further. Delete verify.mjs
afterwards, or keep it and wire it into the test script; do not leave it
lying around unexplained.

## 6. Run the linter and MEASURE

  [PACKAGE_MANAGER] run lint

Report the count per newly introduced rule. Preserve existing severities;
do not downgrade an established protection or add ignores to hide violations.
For the new rules, set severities from the count:

- zero violations for a rule: leave it at "error"
- violations exist: drop that rule to "warn" and write the count in a
  comment next to it. That count is the baseline, and the migration is
  finished when it reaches zero and the rule goes back to "error"
- keep existing exceptions scoped and documented; do not add generic
  exclusions or increase ceilings to manufacture a passing result

## 7. Report

State: which rules were installed, which were skipped and why, the
violation count per rule, which rules are at "warn" with a baseline, the
list of files over the [MAX_LINES]-line budget sorted by size, and the
exact commands to run the linter.

## Rules for you, the agent

Do NOT fix any violation you found. Installing the gate and measuring what
it catches is the entire job. Refactoring is separate work with its own
review.

Do NOT raise [MAX_LINES] to make a file pass. Leave existing offenders
reported with the measured adoption baseline.

Do NOT enable a framework preset because it exists. Uncomment a block only
for a framework this project actually uses.
```


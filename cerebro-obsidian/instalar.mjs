#!/usr/bin/env node
// Instalador do segundo cérebro (Obsidian + Claude Code + Codex).
//
//   node instalar.mjs                      instala, perguntando o que faltar
//   node instalar.mjs --cofre "<pasta>"    usa esta pasta como cofre
//   node instalar.mjs --semear "<pasta>"   procura projetos Git nesta pasta (pode repetir)
//   node instalar.mjs --sem-semear         não procura projetos antigos
//   node instalar.mjs --sim                não pergunta nada (usa o que detectar)
//   node instalar.mjs --desinstalar        tira hooks e instruções (não apaga notas)
//
// Pode rodar de novo quantas vezes quiser: ele atualiza sem duplicar nada.

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import readline from 'node:readline/promises';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const ORIGEM_COFRE = path.join(AQUI, 'cofre');
const ORIGEM_MOTOR = path.join(AQUI, 'motor', 'cerebro.mjs');
const HOME = process.env.CEREBRO_TESTE_HOME || os.homedir();
const DESTINO_MOTOR = process.env.CEREBRO_HOME || path.join(HOME, '.cerebro');
const CLAUDE_DIR = process.env.CLAUDE_CONFIG_DIR || path.join(HOME, '.claude');
const CODEX_DIR = process.env.CODEX_HOME || path.join(HOME, '.codex');
const MARCA_INI = '<!-- cerebro:inicio -->';
const MARCA_FIM = '<!-- cerebro:fim -->';
const PASTAS = ['00 Início', '01 Projetos', '02 Padrões', '03 Decisões', '04 Preferências', '05 Stack', '06 Aprendizados', '07 Sessões', '99 Sistema'];

// ---------------------------------------------------------------------------

const args = process.argv.slice(2);
const flag = (n) => args.includes(n);
const valores = (n) => args.flatMap((a, i) => (a === n && args[i + 1] ? [args[i + 1]] : []));
const SIM = flag('--sim') || !process.stdin.isTTY;

const ok = (m) => console.log(`  ✅ ${m}`);
const info = (m) => console.log(`  ·  ${m}`);
const aviso = (m) => console.log(`  ⚠️  ${m}`);

let rl = null;
async function perguntar(texto, padrao = '') {
  if (SIM) return padrao;
  rl ||= readline.createInterface({ input: process.stdin, output: process.stdout });
  const r = (await rl.question(`  ❓ ${texto}${padrao ? ` [${padrao}]` : ''}: `)).trim();
  return r || padrao;
}

const semAcento = (s) => String(s).normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
const expandir = (p) => path.resolve(String(p).replace(/^~(?=$|[\\/])/, HOME).replace(/^["']|["']$/g, ''));

function lerJson(arq, padrao) {
  try { return JSON.parse(fs.readFileSync(arq, 'utf8')); } catch { return padrao; }
}

const carimbo = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
function backup(arq) {
  if (!fs.existsSync(arq)) return;
  const b = `${arq}.bak-cerebro-${carimbo}`;
  if (!fs.existsSync(b)) fs.copyFileSync(arq, b);
}

function gravar(arq, conteudo) {
  const atual = fs.existsSync(arq) ? fs.readFileSync(arq, 'utf8') : null;
  if (atual === conteudo) return false;
  backup(arq);
  fs.mkdirSync(path.dirname(arq), { recursive: true });
  fs.writeFileSync(arq, conteudo, 'utf8');
  return true;
}

// ---------------------------------------------------------------------------
// 1. Encontrar o cofre
// ---------------------------------------------------------------------------

function cofresDoObsidian() {
  const lugares = [
    process.env.APPDATA && path.join(process.env.APPDATA, 'obsidian', 'obsidian.json'),
    path.join(HOME, 'Library', 'Application Support', 'obsidian', 'obsidian.json'),
    path.join(HOME, '.config', 'obsidian', 'obsidian.json'),
    path.join(HOME, '.var', 'app', 'md.obsidian.Obsidian', 'config', 'obsidian', 'obsidian.json'),
    path.join(HOME, 'snap', 'obsidian', 'current', '.config', 'obsidian', 'obsidian.json'),
  ].filter(Boolean);
  const cofres = [];
  for (const l of lugares) {
    const j = lerJson(l, null);
    if (j && j.vaults) for (const v of Object.values(j.vaults)) if (v && v.path && fs.existsSync(v.path)) cofres.push(v.path);
  }
  return [...new Set(cofres)];
}

async function acharCofre() {
  const dado = valores('--cofre')[0];
  if (dado) return expandir(dado);

  const registrados = cofresDoObsidian();
  const parecidos = registrados.filter((p) => semAcento(path.basename(p)).includes('cerebro'));
  if (parecidos.length === 1) {
    info(`Cofre encontrado no Obsidian: ${parecidos[0]}`);
    return parecidos[0];
  }
  if (parecidos.length > 1) {
    console.log('  Encontrei mais de um cofre com "cérebro" no nome:');
    parecidos.forEach((p, i) => console.log(`     ${i + 1}) ${p}`));
    const r = await perguntar('Qual deles? (número)', '1');
    return parecidos[Math.max(0, Math.min(parecidos.length - 1, Number(r) - 1 || 0))];
  }
  // Procura em lugares comuns.
  const bases = [HOME, path.join(HOME, 'Documents'), path.join(HOME, 'Documentos'), path.join(HOME, 'OneDrive', 'Documentos'),
    path.join(HOME, 'OneDrive', 'Documents'), path.join(HOME, 'Desktop'), path.join(HOME, 'Área de Trabalho'), path.join(HOME, 'Obsidian'),
    path.join(HOME, 'Documents', 'Obsidian'), path.join(HOME, 'Library', 'Mobile Documents', 'iCloud~md~obsidian', 'Documents')];
  for (const b of bases) {
    let itens = [];
    try { itens = fs.readdirSync(b, { withFileTypes: true }); } catch { continue; }
    for (const it of itens) {
      if (it.isDirectory() && semAcento(it.name) === 'cerebro') {
        const p = path.join(b, it.name);
        info(`Cofre encontrado: ${p}`);
        return p;
      }
    }
  }
  if (registrados.length) {
    console.log('  Cofres que o Obsidian conhece:');
    registrados.forEach((p, i) => console.log(`     ${i + 1}) ${p}`));
  }
  const r = await perguntar('Caminho completo da pasta do cofre "cérebro" (ou o número acima)', '');
  if (/^\d+$/.test(r) && registrados[Number(r) - 1]) return registrados[Number(r) - 1];
  if (r) return expandir(r);
  const padrao = path.join(HOME, 'Documents', 'cérebro');
  aviso(`Não achei o cofre. Vou criar em ${padrao} (depois abra essa pasta no Obsidian: "Abrir pasta como cofre").`);
  return padrao;
}

// ---------------------------------------------------------------------------
// 2. Estrutura e cores do cofre
// ---------------------------------------------------------------------------

function mesclarGraph(destino, nosso) {
  const atual = lerJson(destino, null);
  if (!atual) return gravar(destino, JSON.stringify(nosso, null, 2));
  const nossas = new Set(nosso.colorGroups.map((g) => g.query));
  atual.colorGroups = [...nosso.colorGroups, ...(atual.colorGroups || []).filter((g) => !nossas.has(g.query))];
  if (!atual.search) atual.search = nosso.search;
  if (atual.hideUnresolved === undefined) atual.hideUnresolved = true;
  return gravar(destino, JSON.stringify(atual, null, 2));
}

function mesclarAppearance(destino) {
  const atual = lerJson(destino, {});
  const lista = new Set(atual.enabledCssSnippets || []);
  lista.add('cerebro');
  atual.enabledCssSnippets = [...lista];
  return gravar(destino, JSON.stringify(atual, null, 2));
}

function mesclarTemplates(destino, nosso) {
  const atual = lerJson(destino, {});
  if (!atual.folder) atual.folder = nosso.folder;
  if (!atual.dateFormat) atual.dateFormat = nosso.dateFormat;
  return gravar(destino, JSON.stringify(atual, null, 2));
}

function instalarCofre(cofre) {
  fs.mkdirSync(cofre, { recursive: true });
  for (const p of PASTAS) fs.mkdirSync(path.join(cofre, p), { recursive: true });
  let novos = 0;
  const andar = (dirOrigem, rel) => {
    for (const it of fs.readdirSync(dirOrigem, { withFileTypes: true })) {
      const o = path.join(dirOrigem, it.name);
      const r = rel ? path.join(rel, it.name) : it.name;
      const d = path.join(cofre, r);
      if (it.isDirectory()) { fs.mkdirSync(d, { recursive: true }); andar(o, r); continue; }
      const relPosix = r.split(path.sep).join('/');
      if (relPosix === '.obsidian/graph.json') { mesclarGraph(d, lerJson(o, {})); continue; }
      if (relPosix === '.obsidian/appearance.json') { mesclarAppearance(d); continue; }
      if (relPosix === '.obsidian/templates.json') { mesclarTemplates(d, lerJson(o, {})); continue; }
      const sempreAtualizar = relPosix === '.obsidian/snippets/cerebro.css' || relPosix === '99 Sistema/Como funciona.md' || relPosix.startsWith('99 Sistema/Modelos/');
      if (fs.existsSync(d) && !sempreAtualizar) continue;
      if (fs.existsSync(d) && fs.readFileSync(d, 'utf8') === fs.readFileSync(o, 'utf8')) continue;
      fs.copyFileSync(o, d);
      novos++;
    }
  };
  andar(ORIGEM_COFRE, '');
  return novos;
}

// ---------------------------------------------------------------------------
// 3. Motor
// ---------------------------------------------------------------------------

function instalarMotor(cofre) {
  fs.mkdirSync(DESTINO_MOTOR, { recursive: true });
  fs.copyFileSync(ORIGEM_MOTOR, path.join(DESTINO_MOTOR, 'cerebro.mjs'));
  const cfgArq = path.join(DESTINO_MOTOR, 'config.json');
  const cfg = lerJson(cfgArq, {});
  cfg.cofre = cofre;
  cfg.instaladoEm = cfg.instaladoEm || new Date().toISOString();
  cfg.atualizadoEm = new Date().toISOString();
  fs.writeFileSync(cfgArq, JSON.stringify(cfg, null, 2), 'utf8');
}

const motorPosix = () => path.join(DESTINO_MOTOR, 'cerebro.mjs').replace(/\\/g, '/');
const comando = (evento, ferramenta) => `node "${motorPosix()}" hook ${evento} --ferramenta ${ferramenta}`;
const ehNosso = (h) => h && typeof h.command === 'string' && h.command.includes('cerebro.mjs') && h.command.includes(' hook ');

function semNossosHooks(hooks) {
  const out = {};
  for (const [evento, grupos] of Object.entries(hooks || {})) {
    const filtrados = (Array.isArray(grupos) ? grupos : [])
      .map((g) => ({ ...g, hooks: (g.hooks || []).filter((h) => !ehNosso(h)) }))
      .filter((g) => g.hooks.length);
    if (filtrados.length) out[evento] = filtrados;
  }
  return out;
}

function nossosHooks(ferramenta) {
  const status = ferramenta === 'codex';
  const h = (evento, extra = {}) => ({ type: 'command', command: comando(evento, ferramenta), ...extra });
  const matcherTool = ferramenta === 'codex' ? 'Bash|apply_patch|Edit|Write' : 'Edit|Write|MultiEdit|NotebookEdit|Bash';
  return {
    SessionStart: [{ matcher: 'startup|resume|clear|compact', hooks: [h('session-start', { timeout: 20, ...(status ? { statusMessage: '🧠 Abrindo o segundo cérebro', additionalContextLimit: 4000 } : {}) })] }],
    UserPromptSubmit: [{ hooks: [h('prompt', { timeout: 20, ...(status ? { statusMessage: '🧠 Buscando no segundo cérebro', additionalContextLimit: 3000 } : {}) })] }],
    PostToolUse: [{ matcher: matcherTool, hooks: [h('tool', { timeout: 10 })] }],
    Stop: [{ hooks: [h('stop', { timeout: 30, ...(status ? { statusMessage: '🧠 Registrando no segundo cérebro' } : {}) })] }],
  };
}

function juntarHooks(base, novos) {
  const out = { ...base };
  for (const [evento, grupos] of Object.entries(novos)) out[evento] = [...(out[evento] || []), ...grupos];
  return out;
}

// Regras de permissão do Claude Code usam // + caminho POSIX (no Windows, C:\x vira //c/x).
function caminhoRegra(p) {
  let s = p.replace(/\\/g, '/');
  const m = s.match(/^([A-Za-z]):\/(.*)$/);
  if (m) s = `/${m[1].toLowerCase()}/${m[2]}`;
  return `/${s.startsWith('/') ? s : '/' + s}`;
}

// ---------------------------------------------------------------------------
// 4. Claude Code
// ---------------------------------------------------------------------------

function configurarClaude(cofre, remover = false) {
  const arq = path.join(CLAUDE_DIR, 'settings.json');
  const s = lerJson(arq, fs.existsSync(arq) ? null : {});
  if (s === null) { aviso(`Não consegui ler ${arq} (JSON inválido). Pulei o Claude Code.`); return false; }
  s.hooks = semNossosHooks(s.hooks);
  const regra = caminhoRegra(cofre);
  const regras = [`Read(${regra}/**)`, `Edit(${regra}/**)`, `Bash(node "${motorPosix()}":*)`];
  s.permissions ||= {};
  s.permissions.allow = (s.permissions.allow || []).filter((r) => !regras.includes(r));
  s.permissions.additionalDirectories = (s.permissions.additionalDirectories || []).filter((d) => d !== cofre);
  if (!remover) {
    s.hooks = juntarHooks(s.hooks, nossosHooks('claude'));
    s.permissions.allow.push(...regras);
    s.permissions.additionalDirectories.push(cofre);
  }
  if (!Object.keys(s.hooks).length) delete s.hooks;
  if (!s.permissions.allow.length) delete s.permissions.allow;
  if (!s.permissions.additionalDirectories.length) delete s.permissions.additionalDirectories;
  if (!Object.keys(s.permissions).length) delete s.permissions;
  gravar(arq, JSON.stringify(s, null, 2) + '\n');
  return true;
}

// ---------------------------------------------------------------------------
// 5. Codex
// ---------------------------------------------------------------------------

function configurarCodex(cofre, remover = false) {
  const arq = path.join(CODEX_DIR, 'hooks.json');
  const j = lerJson(arq, fs.existsSync(arq) ? null : {});
  if (j === null) { aviso(`Não consegui ler ${arq} (JSON inválido). Pulei os hooks do Codex.`); return false; }
  j.hooks = semNossosHooks(j.hooks);
  if (!remover) {
    j.hooks = juntarHooks(j.hooks, nossosHooks('codex'));
    j.description ||= 'Hooks do usuário (inclui o segundo cérebro no Obsidian).';
  }
  if (!Object.keys(j.hooks).length) delete j.hooks;
  gravar(arq, JSON.stringify(j, null, 2) + '\n');
  configurarTomlCodex(cofre, remover);
  return true;
}

// Coloca o cofre em [sandbox_workspace_write].writable_roots para o Codex poder gravar nele.
function configurarTomlCodex(cofre, remover) {
  const arq = path.join(CODEX_DIR, 'config.toml');
  let t = fs.existsSync(arq) ? fs.readFileSync(arq, 'utf8') : '';
  const literal = `'${cofre}'`;
  const linhas = t.split(/\r?\n/);
  const ini = linhas.findIndex((l) => /^\s*\[sandbox_workspace_write\]\s*(#.*)?$/.test(l));
  if (ini === -1) {
    if (remover) return;
    t = t.replace(/\s*$/, '') + `${t.trim() ? '\n\n' : ''}[sandbox_workspace_write]\n# cerebro-obsidian: deixa o Codex gravar no segundo cérebro\nwritable_roots = [${literal}]\n`;
    gravar(arq, t);
    return;
  }
  let fim = linhas.findIndex((l, i) => i > ini && /^\s*\[/.test(l));
  if (fim === -1) fim = linhas.length;
  const iw = linhas.findIndex((l, i) => i > ini && i < fim && /^\s*writable_roots\s*=/.test(l));
  if (iw === -1) {
    if (remover) return;
    linhas.splice(ini + 1, 0, '# cerebro-obsidian: deixa o Codex gravar no segundo cérebro', `writable_roots = [${literal}]`);
  } else {
    const m = linhas[iw].match(/^(\s*writable_roots\s*=\s*)\[(.*)\]\s*(#.*)?$/);
    if (!m) { aviso(`writable_roots em várias linhas em ${arq}: acrescente ${literal} à mão.`); return; }
    const itens = m[2].split(',').map((x) => x.trim()).filter(Boolean);
    const mesmo = (x) => x.replace(/^['"]|['"]$/g, '').replace(/\\\\/g, '\\') === cofre;
    const novos = remover ? itens.filter((x) => !mesmo(x)) : itens.some(mesmo) ? itens : [...itens, literal];
    linhas[iw] = `${m[1]}[${novos.join(', ')}]`;
    if (remover && !novos.length) linhas.splice(iw, 1);
  }
  let saida = linhas;
  if (remover) {
    saida = linhas.filter((l) => !l.startsWith('# cerebro-obsidian:'));
    // Se a seção ficou vazia (só existia por nossa causa), tira o cabeçalho também.
    const h = saida.findIndex((l) => /^\s*\[sandbox_workspace_write\]\s*$/.test(l));
    if (h !== -1) {
      let f = saida.findIndex((l, i) => i > h && /^\s*\[/.test(l));
      if (f === -1) f = saida.length;
      if (saida.slice(h + 1, f).every((l) => !l.trim())) saida.splice(h, f - h);
    }
  }
  gravar(arq, saida.join('\n').replace(/\n{3,}/g, '\n\n').replace(/\s*$/, '\n'));
}

// ---------------------------------------------------------------------------
// 6. Instruções globais (CLAUDE.md e AGENTS.md)
// ---------------------------------------------------------------------------

function blocoInstrucoes(cofre, motor) {
  return `${MARCA_INI}
## 🧠 Segundo cérebro (Obsidian) — automático em todo projeto

O usuário mantém um segundo cérebro no Obsidian em \`${cofre}\`. Hooks instalados no Claude Code e no Codex entregam as notas relacionadas a cada pedido e lembram de registrar ao fim de cada entrega. O usuário não vai pedir: isso faz parte de toda tarefa.

${motor.protocolo(cofre, `node "${motorPosix()}" buscar`)}
${MARCA_FIM}`;
}

function escreverBloco(arq, bloco) {
  let t = fs.existsSync(arq) ? fs.readFileSync(arq, 'utf8') : '';
  const re = new RegExp(`\\n*${MARCA_INI}[\\s\\S]*?${MARCA_FIM}\\n*`, 'g');
  t = t.replace(re, '\n\n').replace(/^\s+|\s+$/g, '');
  if (bloco) t = (t ? `${t}\n\n` : '') + bloco;
  gravar(arq, t ? t + '\n' : '');
}

// ---------------------------------------------------------------------------
// 7. Projetos antigos
// ---------------------------------------------------------------------------

function pastasDeProjetoProvaveis() {
  const nomes = ['projetos', 'Projetos', 'projects', 'Projects', 'dev', 'Dev', 'code', 'Code', 'repos', 'git', 'GitHub', 'workspace', 'www', 'sites',
    path.join('Documents', 'GitHub'), path.join('Documentos', 'GitHub'), path.join('Documents', 'Projetos'), path.join('Documentos', 'Projetos'),
    path.join('source', 'repos'), 'Desktop', 'Área de Trabalho', 'Documents', 'Documentos'];
  return nomes.map((n) => path.join(HOME, n)).filter((p) => fs.existsSync(p));
}

// ---------------------------------------------------------------------------

async function principal() {
  console.log('\n🧠 Segundo cérebro · Obsidian + Claude Code + Codex\n');
  const [maior] = process.versions.node.split('.').map(Number);
  if (maior < 18) { console.log(`  ❌ Precisa do Node.js 18 ou mais novo (você tem ${process.versions.node}). Baixe em https://nodejs.org`); return 1; }
  const temNode = spawnSync('node', ['-v'], { encoding: 'utf8', shell: process.platform === 'win32' });
  if (temNode.status !== 0) aviso('O comando "node" não está no PATH. Os hooks chamam "node": instale o Node.js pelo site oficial (ele já põe no PATH).');

  if (flag('--desinstalar')) {
    const cfg = lerJson(path.join(DESTINO_MOTOR, 'config.json'), {});
    const cofre = cfg.cofre || '';
    configurarClaude(cofre, true); ok('Hooks e permissões do Claude Code removidos');
    configurarCodex(cofre, true); ok('Hooks e pasta liberada do Codex removidos');
    escreverBloco(path.join(CLAUDE_DIR, 'CLAUDE.md'), '');
    escreverBloco(path.join(CODEX_DIR, 'AGENTS.md'), ''); ok('Instruções globais removidas');
    fs.rmSync(path.join(DESTINO_MOTOR, 'cerebro.mjs'), { force: true });
    fs.rmSync(path.join(DESTINO_MOTOR, 'estado'), { recursive: true, force: true }); ok(`Motor removido de ${DESTINO_MOTOR}`);
    console.log(`\n  As notas continuam em ${cofre || 'seu cofre'}. Nada foi apagado.\n`);
    return 0;
  }

  console.log('1) Cofre do Obsidian');
  const cofre = await acharCofre();
  const novos = instalarCofre(cofre);
  ok(`Estrutura, cores e modelos no cofre (${novos} arquivo(s) novo(s); notas existentes preservadas)`);

  console.log('2) Motor');
  instalarMotor(cofre);
  ok(`Motor em ${DESTINO_MOTOR}`);
  process.env.CEREBRO_HOME = DESTINO_MOTOR;
  const motor = await import(pathToFileURL(path.join(DESTINO_MOTOR, 'cerebro.mjs')).href + `?v=${Date.now()}`);

  console.log('3) Claude Code');
  if (configurarClaude(cofre)) ok(`Hooks + permissão no cofre em ${path.join(CLAUDE_DIR, 'settings.json')}`);
  escreverBloco(path.join(CLAUDE_DIR, 'CLAUDE.md'), blocoInstrucoes(cofre, motor));
  ok(`Instruções globais em ${path.join(CLAUDE_DIR, 'CLAUDE.md')}`);

  console.log('4) Codex');
  if (configurarCodex(cofre)) ok(`Hooks em ${path.join(CODEX_DIR, 'hooks.json')} e cofre liberado em config.toml`);
  escreverBloco(path.join(CODEX_DIR, 'AGENTS.md'), blocoInstrucoes(cofre, motor));
  ok(`Instruções globais em ${path.join(CODEX_DIR, 'AGENTS.md')}`);

  console.log('5) Projetos que já existem no computador');
  if (!flag('--sem-semear')) {
    let raizes = valores('--semear').map(expandir);
    if (!raizes.length) {
      const sugestao = pastasDeProjetoProvaveis();
      const r = await perguntar('Pastas onde ficam seus projetos (separe com ;)', sugestao.join(';'));
      raizes = r.split(';').map((x) => x.trim()).filter(Boolean).map(expandir);
    }
    if (raizes.length) {
      const res = motor.semear(cofre, raizes);
      ok(`${res.encontrados} repositório(s) Git encontrados · ${res.criados.length} nota(s) de projeto criada(s)`);
    } else info('Nenhuma pasta informada. Os projetos entram no cérebro na primeira vez que você abrir cada um.');
  } else info('Pulado (--sem-semear).');

  // Notas de stack para os projetos que já existem e índice inicial.
  for (const n of motor.lerNotas(cofre).filter((x) => x.tipo === 'projeto')) {
    for (const t of [].concat(n.dados.stack || [])) if (t) motor.garantirNotaStack(cofre, t);
  }
  motor.reindexar(cofre);
  ok('Índice criado em 00 Início/Índice.md');

  if (rl) rl.close();
  console.log(`
✅ Pronto! A partir de agora é tudo automático.

Falta só 1 passo, uma vez:
  • Codex: abra o Codex e digite /hooks → confie ("trust") nos 4 hooks do cérebro.
    (O Codex exige essa revisão para hooks novos. O Claude Code não precisa.)
  • Obsidian: se ele estava aberto, feche e abra de novo para carregar as cores.

Teste: abra qualquer projeto no Claude Code ou no Codex e peça algo. Depois veja
${path.join(cofre, '07 Sessões')} e ${path.join(cofre, '00 Início', 'Índice.md')}.
`);
  return 0;
}

principal().then((c) => { process.exitCode = c; }).catch((e) => { console.error('\n❌ Erro:', e && e.stack || e); process.exitCode = 1; });

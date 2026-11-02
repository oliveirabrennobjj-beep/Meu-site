// Testes de ponta a ponta do kit, numa pasta pessoal falsa (não mexe na sua).
// Rodar: node --test cerebro-obsidian/teste/teste.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync, execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const KIT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const casa = fs.mkdtempSync(path.join(os.tmpdir(), 'cerebro-teste-'));
const cofre = path.join(casa, 'Documents', 'cérebro');
const projetos = path.join(casa, 'projetos');
const loja = path.join(projetos, 'loja-do-ze');
const env = {
  ...process.env,
  HOME: casa, USERPROFILE: casa, CEREBRO_TESTE_HOME: casa,
  CEREBRO_HOME: path.join(casa, '.cerebro'),
  CLAUDE_CONFIG_DIR: path.join(casa, '.claude'),
  CODEX_HOME: path.join(casa, '.codex'),
};

fs.mkdirSync(cofre, { recursive: true });
fs.mkdirSync(path.join(loja, 'src'), { recursive: true });
fs.writeFileSync(path.join(loja, 'package.json'), JSON.stringify({ dependencies: { react: '19', vite: '6', tailwindcss: '4' } }));
fs.writeFileSync(path.join(loja, 'README.md'), '# Loja do Zé\n\nLoja virtual de roupas com checkout pelo WhatsApp.\n');
execFileSync('git', ['init', '-q', loja]);
// Codex já configurado antes, para garantir que nada é apagado.
fs.mkdirSync(env.CODEX_HOME, { recursive: true });
fs.writeFileSync(path.join(env.CODEX_HOME, 'config.toml'), 'model = "gpt-5"\n\n[sandbox_workspace_write]\nnetwork_access = true\n');
fs.mkdirSync(env.CLAUDE_CONFIG_DIR, { recursive: true });
fs.writeFileSync(path.join(env.CLAUDE_CONFIG_DIR, 'settings.json'), JSON.stringify({ theme: 'dark', hooks: { Stop: [{ hooks: [{ type: 'command', command: 'echo outro-hook' }] }] } }));
fs.writeFileSync(path.join(env.CLAUDE_CONFIG_DIR, 'CLAUDE.md'), '# Minhas regras\n\nSempre responder em português.\n');

const instalar = (...a) => {
  const r = spawnSync(process.execPath, [path.join(KIT, 'instalar.mjs'), '--sim', ...a], { env, encoding: 'utf8' });
  assert.equal(r.status, 0, r.stdout + r.stderr);
  return r.stdout;
};
const motor = path.join(env.CEREBRO_HOME, 'cerebro.mjs');
const hook = (evento, ferramenta, entrada) => {
  const r = spawnSync(process.execPath, [motor, 'hook', evento, '--ferramenta', ferramenta], { env, input: JSON.stringify(entrada), encoding: 'utf8', cwd: entrada.cwd });
  assert.equal(r.status, 0, r.stderr);
  return r.stdout ? JSON.parse(r.stdout) : null;
};
const ler = (p) => fs.readFileSync(p, 'utf8');
const json = (p) => JSON.parse(ler(p));

test('instala estrutura, cores, motor e configs sem apagar o que existia', () => {
  instalar('--cofre', cofre, '--semear', projetos);
  for (const p of ['00 Início/Início.md', '00 Início/Índice.md', '99 Sistema/Como funciona.md', '.obsidian/snippets/cerebro.css', '04 Preferências/Como falar com o Brenno.md']) {
    assert.ok(fs.existsSync(path.join(cofre, p)), p);
  }
  assert.equal(json(path.join(cofre, '.obsidian/graph.json')).colorGroups.length, 8);
  assert.deepEqual(json(path.join(cofre, '.obsidian/appearance.json')).enabledCssSnippets, ['cerebro']);

  const proj = ler(path.join(cofre, '01 Projetos/loja-do-ze.md'));
  assert.match(proj, /React/);
  assert.match(proj, /Loja virtual de roupas/);
  assert.ok(fs.existsSync(path.join(cofre, '05 Stack/Vite.md')));
  assert.ok(fs.existsSync(path.join(cofre, '05 Stack/HTML-CSS-JS estático.md')), 'stack do Meu-site');

  const s = json(path.join(env.CLAUDE_CONFIG_DIR, 'settings.json'));
  assert.equal(s.theme, 'dark');
  assert.equal(s.hooks.Stop.length, 2, 'mantém o hook que já existia');
  for (const ev of ['SessionStart', 'UserPromptSubmit', 'PostToolUse', 'Stop']) assert.ok(JSON.stringify(s.hooks[ev]).includes('cerebro.mjs'), ev);
  assert.ok(s.permissions.additionalDirectories.includes(cofre));
  assert.ok(s.permissions.allow.some((r) => r.startsWith('Edit(//') && r.includes('cérebro')));

  const c = json(path.join(env.CODEX_HOME, 'hooks.json'));
  assert.ok(c.hooks.Stop[0].hooks[0].command.includes('--ferramenta codex'));
  const toml = ler(path.join(env.CODEX_HOME, 'config.toml'));
  assert.match(toml, /model = "gpt-5"/);
  assert.match(toml, /network_access = true/);
  assert.ok(toml.includes(`writable_roots = ['${cofre}']`), toml);
  assert.equal((toml.match(/\[sandbox_workspace_write\]/g) || []).length, 1);

  assert.match(ler(path.join(env.CLAUDE_CONFIG_DIR, 'CLAUDE.md')), /Sempre responder em português[\s\S]*cerebro:inicio/);
  assert.match(ler(path.join(env.CODEX_HOME, 'AGENTS.md')), /Segundo cérebro/);
});

test('reinstalar não duplica nada', () => {
  instalar('--cofre', cofre, '--sem-semear');
  const s = json(path.join(env.CLAUDE_CONFIG_DIR, 'settings.json'));
  assert.equal(s.hooks.Stop.length, 2);
  assert.equal(s.hooks.SessionStart.length, 1);
  assert.equal(s.permissions.additionalDirectories.filter((d) => d === cofre).length, 1);
  assert.equal((ler(path.join(env.CLAUDE_CONFIG_DIR, 'CLAUDE.md')).match(/cerebro:inicio/g) || []).length, 1);
  const toml = ler(path.join(env.CODEX_HOME, 'config.toml'));
  assert.equal(toml.split(cofre).length - 1, 1, toml);
});

test('início de sessão entrega projeto, preferências e o combinado', () => {
  const r = hook('session-start', 'claude', { session_id: 's1', cwd: path.join(loja, 'src'), source: 'startup' });
  const ctx = r.hookSpecificOutput.additionalContext;
  assert.match(ctx, /Projeto atual: loja-do-ze/);
  assert.match(ctx, /Como falar com o Brenno/);
  assert.match(ctx, /02 Padrões/);
});

test('cada pedido recebe as notas relacionadas de outros projetos', () => {
  const r = hook('prompt', 'claude', { session_id: 's1', cwd: loja, prompt: 'coloca um botão de WhatsApp e otimiza as fotos do site' });
  const ctx = r.hookSpecificOutput.additionalContext;
  assert.match(ctx, /Fotos em WebP/);
  assert.match(ctx, /Site de cliente em HTML puro/);
  const nada = hook('prompt', 'claude', { session_id: 's1', cwd: loja, prompt: 'oi' });
  assert.equal(nada, null);
});

test('pergunta sem mudar arquivos não pede registro', () => {
  hook('prompt', 'claude', { session_id: 's2', cwd: loja, prompt: 'o que esse projeto faz?' });
  hook('tool', 'claude', { session_id: 's2', cwd: loja, tool_name: 'Bash', tool_input: { command: 'ls -la src 2>/dev/null' } });
  assert.deepEqual(hook('stop', 'claude', { session_id: 's2', cwd: loja, stop_hook_active: false }), {});
});

test('entrega no Claude Code: pede registro uma vez, depois grava diário, linha do tempo e índice', () => {
  hook('prompt', 'claude', { session_id: 's3', cwd: loja, prompt: 'cria a página de checkout com token sk-abcdefghijklmnopqrstuvwxyz' });
  hook('tool', 'claude', { session_id: 's3', cwd: loja, tool_name: 'Write', tool_input: { file_path: path.join(loja, 'src/checkout.jsx') } });
  const r1 = hook('stop', 'claude', { session_id: 's3', cwd: loja, stop_hook_active: false });
  assert.equal(r1.decision, 'block');
  assert.match(r1.reason, /src\/checkout\.jsx/);
  // O agente registra uma nota no cofre e para de novo.
  const nota = path.join(cofre, '03 Decisões', 'Checkout pelo WhatsApp.md');
  fs.writeFileSync(nota, '---\ntipo: decisao\nprojetos: ["[[loja-do-ze]]"]\ntags: ["cerebro/decisao"]\nresumo: "Checkout manda o pedido pronto no WhatsApp"\n---\n# Checkout pelo WhatsApp\n');
  hook('tool', 'claude', { session_id: 's3', cwd: loja, tool_name: 'Write', tool_input: { file_path: nota } });
  const r2 = hook('stop', 'claude', { session_id: 's3', cwd: loja, stop_hook_active: true, last_assistant_message: 'Registrei a decisão do checkout.' });
  assert.deepEqual(r2, {});

  const dia = fs.readdirSync(path.join(cofre, '07 Sessões')).flatMap((a) => fs.readdirSync(path.join(cofre, '07 Sessões', a)).map((f) => path.join(cofre, '07 Sessões', a, f)));
  const diario = ler(dia[0]);
  assert.match(diario, /\[\[loja-do-ze\]\] · Claude Code/);
  assert.match(diario, /src\/checkout\.jsx/);
  assert.doesNotMatch(diario, /sk-abcdef/, 'segredo removido');
  assert.match(ler(path.join(cofre, '01 Projetos/loja-do-ze.md')), /## Linha do tempo[\s\S]*Claude Code · cria a página de checkout/);
  const indice = ler(path.join(cofre, '00 Início/Índice.md'));
  assert.match(indice, /\[\[Checkout pelo WhatsApp\]\]/);
  assert.match(indice, /### \[\[loja-do-ze\]\]/);
  // Próxima turno sem trabalho: não pede nada.
  hook('prompt', 'claude', { session_id: 's3', cwd: loja, prompt: 'valeu' });
  assert.deepEqual(hook('stop', 'claude', { session_id: 's3', cwd: loja, stop_hook_active: false }), {});
});

test('entrega no Codex (apply_patch) também pede registro', () => {
  hook('prompt', 'codex', { session_id: 'c1', cwd: loja, prompt: 'adiciona tema escuro' });
  hook('tool', 'codex', { session_id: 'c1', cwd: loja, tool_name: 'apply_patch', tool_input: { command: '*** Begin Patch\n*** Update File: src/tema.css\n@@\n-a\n+b\n*** End Patch' } });
  const r = hook('stop', 'codex', { session_id: 'c1', cwd: loja, stop_hook_active: false, turn_id: 't1' });
  assert.equal(r.decision, 'block');
  assert.match(r.reason, /src\/tema\.css/);
  assert.deepEqual(hook('stop', 'codex', { session_id: 'c1', cwd: loja, stop_hook_active: true, last_assistant_message: 'Cérebro: nada novo para registrar.' }), {});
});

test('comando de shell que instala algo conta como entrega', () => {
  hook('prompt', 'codex', { session_id: 'c2', cwd: loja, prompt: 'instala o zod' });
  hook('tool', 'codex', { session_id: 'c2', cwd: loja, tool_name: 'Bash', tool_input: { command: ['bash', '-lc', 'npm install zod'] } });
  assert.equal(hook('stop', 'codex', { session_id: 'c2', cwd: loja, stop_hook_active: false }).decision, 'block');
});

test('busca pela linha de comando', () => {
  const r = spawnSync(process.execPath, [motor, 'buscar', 'publicar github pages'], { env, encoding: 'utf8' });
  assert.match(r.stdout, /Publicar site novo no GitHub Pages/);
});

test('hook nunca quebra o agente, mesmo com entrada ruim', () => {
  const r = spawnSync(process.execPath, [motor, 'hook', 'stop', '--ferramenta', 'claude'], { env, input: 'isso não é json', encoding: 'utf8' });
  assert.equal(r.status, 0);
  assert.equal(r.stdout, '{}');
});

test('desinstalar tira hooks e instruções e preserva notas e o resto', () => {
  instalar('--desinstalar');
  const s = json(path.join(env.CLAUDE_CONFIG_DIR, 'settings.json'));
  assert.ok(!JSON.stringify(s).includes('cerebro.mjs'));
  assert.equal(s.hooks.Stop[0].hooks[0].command, 'echo outro-hook');
  assert.equal(s.permissions, undefined);
  assert.ok(!ler(path.join(env.CLAUDE_CONFIG_DIR, 'CLAUDE.md')).includes('cerebro:inicio'));
  assert.match(ler(path.join(env.CLAUDE_CONFIG_DIR, 'CLAUDE.md')), /Sempre responder em português/);
  const toml = ler(path.join(env.CODEX_HOME, 'config.toml'));
  assert.ok(!toml.includes('cérebro') && !toml.includes('cerebro'), toml);
  assert.match(toml, /\[sandbox_workspace_write\]\nnetwork_access = true/, 'seção do usuário fica');
  assert.ok(!JSON.stringify(json(path.join(env.CODEX_HOME, 'hooks.json'))).includes('cerebro.mjs'));
  assert.ok(fs.existsSync(path.join(cofre, '03 Decisões', 'Checkout pelo WhatsApp.md')));
  fs.rmSync(casa, { recursive: true, force: true });
});

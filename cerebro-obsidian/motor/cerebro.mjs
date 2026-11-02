#!/usr/bin/env node
// Segundo cérebro no Obsidian para Claude Code e Codex.
//
// Um único arquivo, sem dependências (Node 18+). É chamado pelos hooks das duas ferramentas:
//   node cerebro.mjs hook <evento> --ferramenta claude|codex   (lê o JSON do hook no stdin)
// e também serve como linha de comando:
//   node cerebro.mjs buscar "termos"     procura no cofre
//   node cerebro.mjs reindexar           refaz 00 Início/Índice.md
//   node cerebro.mjs semear <pasta>...   cria notas para os projetos Git encontrados
//   node cerebro.mjs status              mostra a configuração
//
// Regra de ouro: um hook nunca pode travar o agente. Qualquer erro vira silêncio (exit 0).

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

export const VERSAO = '1.0.0';

// ---------------------------------------------------------------------------
// Configuração
// ---------------------------------------------------------------------------

export function pastaMotor() {
  return process.env.CEREBRO_HOME || path.join(os.homedir(), '.cerebro');
}

export function lerConfig() {
  try {
    const cfg = JSON.parse(fs.readFileSync(path.join(pastaMotor(), 'config.json'), 'utf8'));
    if (cfg && cfg.cofre && fs.existsSync(cfg.cofre)) return cfg;
  } catch {}
  return null;
}

export const TIPOS = {
  projeto: { pasta: '01 Projetos', rotulo: 'Projeto' },
  padrao: { pasta: '02 Padrões', rotulo: 'Padrão' },
  decisao: { pasta: '03 Decisões', rotulo: 'Decisão' },
  preferencia: { pasta: '04 Preferências', rotulo: 'Preferência' },
  stack: { pasta: '05 Stack', rotulo: 'Stack' },
  aprendizado: { pasta: '06 Aprendizados', rotulo: 'Aprendizado' },
  sessao: { pasta: '07 Sessões', rotulo: 'Sessão' },
};
const PASTA_INICIO = '00 Início';
const PASTA_SISTEMA = '99 Sistema';
const ORDEM_INDICE = ['projeto', 'preferencia', 'padrao', 'decisao', 'stack', 'aprendizado'];
const EMOJI = { projeto: '🟦', padrao: '🟩', decisao: '🟧', preferencia: '🟪', stack: '🟨', aprendizado: '🟥', sessao: '⬜' };

const NOME_FERRAMENTA = { claude: 'Claude Code', codex: 'Codex' };

// ---------------------------------------------------------------------------
// Utilidades
// ---------------------------------------------------------------------------

const hoje = (d = new Date()) => {
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
};
const hora = (d = new Date()) => `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;

export function normalizarCaminho(p) {
  if (!p) return '';
  let s = String(p).normalize('NFC').replace(/\\/g, '/');
  // Git Bash no Windows: /c/Users/... -> c:/Users/...
  const m = s.match(/^\/([a-zA-Z])\/(.*)$/);
  if (m && process.platform === 'win32') s = `${m[1]}:/${m[2]}`;
  s = s.replace(/\/+$/, '');
  return process.platform === 'win32' || process.platform === 'darwin' ? s.toLowerCase() : s;
}

function dentroDe(arquivo, pasta) {
  const a = normalizarCaminho(arquivo);
  const b = normalizarCaminho(pasta);
  return !!a && !!b && (a === b || a.startsWith(b + '/'));
}

function escreverSeMudou(arquivo, conteudo) {
  try {
    if (fs.existsSync(arquivo) && fs.readFileSync(arquivo, 'utf8') === conteudo) return false;
  } catch {}
  fs.mkdirSync(path.dirname(arquivo), { recursive: true });
  fs.writeFileSync(arquivo, conteudo, 'utf8');
  return true;
}

export function nomeArquivoSeguro(nome) {
  return String(nome).replace(/[\\/:*?"<>|#^[\]]/g, '-').replace(/\s+/g, ' ').trim().slice(0, 120) || 'sem-nome';
}

const cortar = (s, n) => {
  s = String(s || '').replace(/\s+/g, ' ').trim();
  return s.length > n ? s.slice(0, n - 1).trimEnd() + '…' : s;
};

// Remove segredos óbvios antes de gravar qualquer texto no cofre.
export function ocultarSegredos(texto) {
  return String(texto || '')
    .replace(/\b(sk|pk|rk)-[A-Za-z0-9_-]{16,}/g, '[segredo removido]')
    .replace(/\b(ghp|gho|ghu|ghs|github_pat)_[A-Za-z0-9_]{20,}/g, '[segredo removido]')
    .replace(/\bAKIA[0-9A-Z]{16}\b/g, '[segredo removido]')
    .replace(/\bxox[abprs]-[A-Za-z0-9-]{10,}/g, '[segredo removido]')
    .replace(/\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/g, '[segredo removido]')
    .replace(/((?:senha|password|passwd|token|secret|api[_-]?key)\s*[:=]\s*)\S+/gi, '$1[segredo removido]');
}

// ---------------------------------------------------------------------------
// Frontmatter (subconjunto simples de YAML, suficiente para as notas do cofre)
// ---------------------------------------------------------------------------

function valorYaml(v) {
  v = v.trim();
  if (v === '') return '';
  if (v.startsWith('[') && v.endsWith(']')) {
    const dentro = v.slice(1, -1).trim();
    if (!dentro) return [];
    const itens = [];
    let atual = '';
    let aspas = null;
    let colchetes = 0;
    for (const c of dentro) {
      if (aspas) {
        if (c === aspas) aspas = null;
        else atual += c;
      } else if (c === '"' || c === "'") aspas = c;
      else if (c === '[') { colchetes++; atual += c; }
      else if (c === ']') { colchetes--; atual += c; }
      else if (c === ',' && colchetes === 0) { itens.push(atual.trim()); atual = ''; }
      else atual += c;
    }
    if (atual.trim()) itens.push(atual.trim());
    return itens;
  }
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) return v.slice(1, -1);
  return v;
}

export function lerFrontmatter(texto) {
  const dados = {};
  if (!texto.startsWith('---')) return { dados, corpo: texto };
  const fim = texto.indexOf('\n---', 3);
  if (fim === -1) return { dados, corpo: texto };
  const bloco = texto.slice(3, fim).split(/\r?\n/);
  let chave = null;
  for (const linha of bloco) {
    const item = linha.match(/^\s+-\s+(.*)$/);
    if (item && chave) {
      if (!Array.isArray(dados[chave])) dados[chave] = [];
      dados[chave].push(valorYaml(item[1]));
      continue;
    }
    const m = linha.match(/^([A-Za-zÀ-ú0-9_-]+):\s*(.*)$/);
    if (m) {
      chave = m[1];
      dados[chave] = valorYaml(m[2]);
    }
  }
  const corpo = texto.slice(fim + 4).replace(/^\r?\n/, '');
  return { dados, corpo };
}

const lista = (v) => (Array.isArray(v) ? v : v ? [v] : []).map((x) => String(x)).filter(Boolean);
const semLink = (s) => String(s).replace(/^\[\[|\]\]$/g, '').split('|')[0].trim();
const yamlTexto = (s) => JSON.stringify(String(s));
const yamlLista = (arr) => `[${arr.map((x) => JSON.stringify(String(x))).join(', ')}]`;

// ---------------------------------------------------------------------------
// Leitura do cofre
// ---------------------------------------------------------------------------

export function lerNotas(cofre) {
  const notas = [];
  const andar = (dir, rel) => {
    let itens = [];
    try { itens = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
    for (const it of itens) {
      if (it.name.startsWith('.')) continue;
      const abs = path.join(dir, it.name);
      const r = rel ? `${rel}/${it.name}` : it.name;
      if (it.isDirectory()) {
        if (!rel && (it.name === PASTA_INICIO || it.name === PASTA_SISTEMA)) continue;
        andar(abs, r);
      } else if (it.name.toLowerCase().endsWith('.md')) {
        let texto = '';
        try { texto = fs.readFileSync(abs, 'utf8'); } catch { continue; }
        const { dados, corpo: bruto } = lerFrontmatter(texto);
        const corpo = bruto.replace(/<!--[\s\S]*?-->/g, '');
        const pastaRaiz = r.split('/')[0];
        let tipo = String(dados.tipo || '').toLowerCase();
        if (!TIPOS[tipo]) tipo = Object.keys(TIPOS).find((t) => TIPOS[t].pasta === pastaRaiz) || 'outro';
        const titulo = it.name.replace(/\.md$/i, '');
        notas.push({
          abs, rel: r, titulo, tipo, dados, corpo,
          resumo: String(dados.resumo || '').trim() || primeiraFrase(corpo),
          projetos: lista(dados.projetos || dados.projeto).map(semLink),
          tags: lista(dados.tags).map((t) => t.replace(/^#/, '')),
        });
      }
    }
  };
  andar(cofre, '');
  return notas;
}

function primeiraFrase(corpo) {
  for (const linha of corpo.split(/\r?\n/)) {
    const l = linha.trim();
    if (!l || l.startsWith('#') || l.startsWith('>') || l.startsWith('---') || l.startsWith('```') || l.startsWith('|')) continue;
    return cortar(l.replace(/^[-*]\s+(\[.\]\s+)?/, '').replace(/\[\[([^\]|]+)(\|[^\]]+)?\]\]/g, '$1'), 160);
  }
  return '';
}

// ---------------------------------------------------------------------------
// Busca (BM25 simplificado com pesos por campo, sem acentos, PT + EN)
// ---------------------------------------------------------------------------

const PARADAS = new Set(`
a o as os um uma uns umas de do da dos das no na nos nas em por para pra pro com sem sob sobre entre ate
e ou mas se que qual quais quando como onde porque pois entao tambem ja ainda so mais menos muito muita
eu tu ele ela nos vos eles elas voce voces meu minha meus minhas seu sua seus suas nosso nossa isso isto aquilo
esse essa este esta aquele aquela ser estar ter haver fazer faz fez feito fazendo vai vou ir foi era sao sera
tem tinha temos quero queria preciso precisa pode poder deve deveria agora aqui ali la todo toda todos todas
cada outro outra mesmo mesma coisa coisas favor obrigado ok sim nao bem bom boa algo alguma algum nada tudo
the a an of to in on for with without by from at as is are was were be been being it this that these those
and or but if then so not no yes do does did done can could should would will just also please thanks you your
my our we they them he she its into about make made using use used need want get got have has had
`.split(/\s+/).filter(Boolean));

export function semAcento(s) {
  return String(s || '').normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
}

function radical(t) {
  if (t.length > 5 && t.endsWith('coes')) return t.slice(0, -4) + 'cao';
  if (t.length > 5 && t.endsWith('oes')) return t.slice(0, -3) + 'ao';
  if (t.length > 5 && t.endsWith('ais')) return t.slice(0, -3) + 'al';
  if (t.length > 4 && t.endsWith('s') && !t.endsWith('ss')) return t.slice(0, -1);
  return t;
}

const CURTAS = new Set(['js', 'ts', 'ui', 'ux', 'db', 'go', 'ia', 'ai', 'qa', 'ci', 'cd', 'pr', 'css', 'api', 'seo', 'sql', 'pwa', 'cli', 'mcp', 'jwt', 'svg', 'pdf']);

export function tokens(texto) {
  const out = [];
  for (const bruto of semAcento(texto).split(/[^a-z0-9+#]+/)) {
    if (!bruto) continue;
    if (bruto.length < 3 && !CURTAS.has(bruto)) continue;
    if (PARADAS.has(bruto)) continue;
    if (/^\d+$/.test(bruto) && bruto.length < 4) continue;
    out.push(radical(bruto));
  }
  return out;
}

function contar(arr) {
  const m = new Map();
  for (const t of arr) m.set(t, (m.get(t) || 0) + 1);
  return m;
}

export function buscar(notas, consulta, { projeto = '', limite = 6, incluirSessoes = true } = {}) {
  const termos = [...new Set(tokens(consulta))];
  if (!termos.length) return [];
  const docs = notas
    .filter((n) => incluirSessoes || n.tipo !== 'sessao')
    .map((n) => ({
      nota: n,
      titulo: contar(tokens(n.titulo)),
      meta: contar(tokens([n.tags.join(' '), n.projetos.join(' '), lista(n.dados.stack).join(' '), lista(n.dados.aliases).join(' ')].join(' '))),
      resumo: contar(tokens(n.resumo)),
      corpo: contar(tokens(n.corpo)),
    }));
  const N = docs.length || 1;
  const df = new Map();
  for (const d of docs) {
    for (const t of termos) {
      if (d.titulo.has(t) || d.meta.has(t) || d.resumo.has(t) || d.corpo.has(t)) df.set(t, (df.get(t) || 0) + 1);
    }
  }
  const projetoNorm = semAcento(projeto);
  const res = [];
  for (const d of docs) {
    let score = 0;
    let acertos = 0;
    for (const t of termos) {
      const tf = 4 * (d.titulo.get(t) || 0) + 3 * (d.meta.get(t) || 0) + 2 * (d.resumo.get(t) || 0) + Math.min(d.corpo.get(t) || 0, 6);
      if (!tf) continue;
      acertos++;
      const idf = Math.log(1 + N / (df.get(t) || 1));
      score += idf * (tf / (tf + 1.5));
    }
    if (!acertos) continue;
    score *= 1 + 0.25 * (acertos - 1); // cobrir vários termos vale mais
    if (d.nota.tipo === 'sessao') score *= 0.55;
    if (projetoNorm && d.nota.projetos.some((p) => semAcento(p) === projetoNorm)) score *= 1.3;
    res.push({ nota: d.nota, score, termos: termos.filter((t) => d.corpo.has(t) || d.resumo.has(t) || d.titulo.has(t)) });
  }
  res.sort((a, b) => b.score - a.score);
  if (!res.length) return [];
  const corte = Math.max(0.35, res[0].score * 0.25);
  return res.filter((r) => r.score >= corte).slice(0, limite);
}

function trecho(nota, termos) {
  const linhas = nota.corpo.split(/\r?\n/).map((l) => l.trim()).filter((l) => l && !l.startsWith('#') && !l.startsWith('---'));
  for (const l of linhas) {
    const tk = new Set(tokens(l));
    if (termos.some((t) => tk.has(t))) return cortar(l.replace(/^[-*]\s+/, ''), 180);
  }
  return '';
}

// ---------------------------------------------------------------------------
// Projeto atual e detecção de stack
// ---------------------------------------------------------------------------

export function raizProjeto(cwd) {
  let dir = path.resolve(cwd || process.cwd());
  for (let i = 0; i < 40; i++) {
    if (fs.existsSync(path.join(dir, '.git'))) return dir;
    const pai = path.dirname(dir);
    if (pai === dir) break;
    dir = pai;
  }
  return path.resolve(cwd || process.cwd());
}

export function nomeProjeto(raiz) {
  const base = path.basename(raiz);
  if (!base || normalizarCaminho(raiz) === normalizarCaminho(os.homedir())) return '';
  return nomeArquivoSeguro(base);
}

const MAPA_PACOTES = {
  react: 'React', 'react-dom': 'React', next: 'Next.js', vue: 'Vue', nuxt: 'Nuxt', svelte: 'Svelte', '@sveltejs/kit': 'SvelteKit',
  astro: 'Astro', vite: 'Vite', tailwindcss: 'Tailwind CSS', typescript: 'TypeScript', express: 'Express', fastify: 'Fastify',
  '@nestjs/core': 'NestJS', '@supabase/supabase-js': 'Supabase', firebase: 'Firebase', prisma: 'Prisma', '@prisma/client': 'Prisma',
  'drizzle-orm': 'Drizzle', mongoose: 'MongoDB', pg: 'PostgreSQL', mysql2: 'MySQL', '@playwright/test': 'Playwright', playwright: 'Playwright',
  jest: 'Jest', vitest: 'Vitest', remotion: 'Remotion', electron: 'Electron', 'react-native': 'React Native', expo: 'Expo',
  stripe: 'Stripe', three: 'Three.js', gsap: 'GSAP', 'framer-motion': 'Framer Motion', 'motion': 'Motion', '@radix-ui/react-slot': 'shadcn/ui',
  'socket.io': 'Socket.IO', openai: 'OpenAI API', '@anthropic-ai/sdk': 'Claude API', zod: 'Zod', redux: 'Redux', zustand: 'Zustand',
  '@tanstack/react-query': 'TanStack Query', axios: 'Axios', 'chart.js': 'Chart.js', d3: 'D3', 'discord.js': 'Discord.js',
  'whatsapp-web.js': 'WhatsApp Web.js', '@whiskeysockets/baileys': 'Baileys', puppeteer: 'Puppeteer', sass: 'Sass',
};
const MAPA_PYTHON = { django: 'Django', flask: 'Flask', fastapi: 'FastAPI', playwright: 'Playwright', pandas: 'pandas', streamlit: 'Streamlit', selenium: 'Selenium', openai: 'OpenAI API', anthropic: 'Claude API', langchain: 'LangChain', pytest: 'pytest' };

export function detectarStack(raiz) {
  const s = new Set();
  const existe = (f) => fs.existsSync(path.join(raiz, f));
  const ler = (f) => { try { return fs.readFileSync(path.join(raiz, f), 'utf8'); } catch { return ''; } };
  if (existe('package.json')) {
    s.add('Node.js');
    try {
      const pkg = JSON.parse(ler('package.json'));
      const deps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
      for (const d of Object.keys(deps)) if (MAPA_PACOTES[d]) s.add(MAPA_PACOTES[d]);
    } catch {}
  }
  const py = ler('requirements.txt') + ler('pyproject.toml') + ler('Pipfile');
  if (py || existe('setup.py')) {
    s.add('Python');
    const low = py.toLowerCase();
    for (const [k, v] of Object.entries(MAPA_PYTHON)) if (new RegExp(`(^|[^a-z])${k}([^a-z]|$)`, 'm').test(low)) s.add(v);
  }
  if (existe('go.mod')) s.add('Go');
  if (existe('Cargo.toml')) s.add('Rust');
  if (existe('composer.json')) { s.add('PHP'); if (/laravel/.test(ler('composer.json'))) s.add('Laravel'); }
  if (existe('Gemfile')) { s.add('Ruby'); if (/rails/.test(ler('Gemfile'))) s.add('Rails'); }
  if (existe('pubspec.yaml')) s.add('Flutter');
  if (existe('Dockerfile') || existe('docker-compose.yml') || existe('compose.yaml')) s.add('Docker');
  if (existe('vercel.json') || existe('.vercel')) s.add('Vercel');
  if (existe('netlify.toml')) s.add('Netlify');
  if (existe('supabase')) s.add('Supabase');
  if (existe('.github/workflows')) s.add('GitHub Actions');
  if (existe('tsconfig.json')) s.add('TypeScript');
  if (existe('index.html') && !existe('package.json')) s.add('HTML/CSS/JS estático');
  return [...s];
}

// ---------------------------------------------------------------------------
// Notas automáticas: projeto, stack, sessões, índice
// ---------------------------------------------------------------------------

export function caminhoProjeto(cofre, nome) {
  return path.join(cofre, TIPOS.projeto.pasta, `${nomeArquivoSeguro(nome)}.md`);
}

export function garantirNotaStack(cofre, tech) {
  const arq = path.join(cofre, TIPOS.stack.pasta, `${nomeArquivoSeguro(tech)}.md`);
  if (fs.existsSync(arq)) return false;
  const d = hoje();
  escreverSeMudou(arq, `---
tipo: stack
tags: ["cerebro/stack"]
criado: ${d}
atualizado: ${d}
resumo: ""
---
# ${tech}

## Como uso
<!-- Versões, configuração preferida, comandos que sempre uso. -->

## Pegadinhas
<!-- Erros que já aconteceram e como resolver. -->

## Projetos
<!-- Os projetos que usam ${tech} aparecem nos backlinks desta nota. -->
`);
  return true;
}

export function garantirNotaProjeto(cofre, raiz, nome, extras = {}) {
  const arq = caminhoProjeto(cofre, nome);
  if (fs.existsSync(arq)) {
    // Nota criada à mão (ou pelo kit) sem caminho: completa com a pasta real do projeto.
    try {
      const t = fs.readFileSync(arq, 'utf8');
      if (/^caminho:\s*("")?\s*$/m.test(t)) fs.writeFileSync(arq, t.replace(/^caminho:.*$/m, `caminho: ${yamlTexto(raiz.replace(/\\/g, '/'))}`), 'utf8');
    } catch {}
    return { arq, criada: false };
  }
  const stack = extras.stack || detectarStack(raiz);
  for (const t of stack) garantirNotaStack(cofre, t);
  const d = hoje();
  const corpo = [
    '---',
    'tipo: projeto',
    `caminho: ${yamlTexto(raiz.replace(/\\/g, '/'))}`,
    `stack: ${yamlLista(stack)}`,
    'tags: ["cerebro/projeto"]',
    `criado: ${d}`,
    `atualizado: ${d}`,
    `resumo: ${yamlTexto(extras.resumo || '')}`,
    '---',
    `# ${nome}`,
    '',
    '## O que é',
    extras.resumo ? extras.resumo : '<!-- O agente completa ao trabalhar aqui: objetivo, cliente, público, onde está publicado. -->',
    '',
    '## Stack',
    stack.length ? stack.map((t) => `- [[${nomeArquivoSeguro(t)}]]`).join('\n') : '<!-- Detectada automaticamente quando houver package.json, requirements.txt etc. -->',
    '',
    '## Como rodar',
    '<!-- Comandos para instalar, rodar, testar e publicar. -->',
    '',
    '## Decisões, padrões e aprendizados',
    '<!-- Links para as notas de 02 Padrões, 03 Decisões e 06 Aprendizados deste projeto. -->',
    '',
    extras.convencoes ? `## Convenções do projeto (importado)\n${extras.convencoes}\n` : '',
    '## Linha do tempo',
    extras.ultimaData ? `- ${extras.ultimaData} · último commit encontrado ao semear o cérebro` : '',
    '',
  ].join('\n');
  escreverSeMudou(arq, corpo.replace(/\n{3,}/g, '\n\n'));
  return { arq, criada: true };
}

function adicionarLinhaDoTempo(arqProjeto, linha) {
  try {
    let t = fs.readFileSync(arqProjeto, 'utf8');
    if (t.includes(linha)) return;
    if (!/^## Linha do tempo\s*$/m.test(t)) t = t.replace(/\s*$/, '\n\n## Linha do tempo\n');
    t = t.replace(/\s*$/, '\n') + linha + '\n';
    t = t.replace(/^atualizado:.*$/m, `atualizado: ${hoje()}`);
    fs.writeFileSync(arqProjeto, t, 'utf8');
  } catch {}
}

export function registrarSessao(cofre, { projeto, ferramenta, pedido, resposta, arquivos }) {
  const agora = new Date();
  const d = hoje(agora);
  const arq = path.join(cofre, TIPOS.sessao.pasta, d.slice(0, 4), `${d}.md`);
  if (!fs.existsSync(arq)) {
    escreverSeMudou(arq, `---\ntipo: sessao\ndata: ${d}\ntags: ["cerebro/sessao"]\nresumo: "Diário automático de ${d}"\n---\n# Sessões de ${d}\n`);
  }
  const nomeFerr = NOME_FERRAMENTA[ferramenta] || ferramenta || 'agente';
  const linhas = [
    '',
    `## ${hora(agora)} · ${projeto ? `[[${projeto}]]` : 'sem projeto'} · ${nomeFerr}`,
    `**Pedido:** ${cortar(ocultarSegredos(pedido), 400) || '—'}`,
  ];
  if (arquivos && arquivos.length) {
    const mostrar = arquivos.slice(0, 12).map((a) => `\`${a}\``).join(', ');
    linhas.push(`**Arquivos:** ${mostrar}${arquivos.length > 12 ? ` e mais ${arquivos.length - 12}` : ''}`);
  }
  if (resposta) linhas.push(`**Resultado:** ${cortar(ocultarSegredos(resposta), 700)}`);
  fs.appendFileSync(arq, linhas.join('\n') + '\n', 'utf8');
  if (projeto) {
    const arqProj = caminhoProjeto(cofre, projeto);
    if (fs.existsSync(arqProj)) adicionarLinhaDoTempo(arqProj, `- ${d} · ${nomeFerr} · ${cortar(ocultarSegredos(pedido), 110)} → [[${d}]]`);
  }
  return arq;
}

export function reindexar(cofre) {
  const notas = lerNotas(cofre).filter((n) => n.tipo !== 'sessao' && n.tipo !== 'outro');
  const porTipo = {};
  for (const n of notas) (porTipo[n.tipo] ||= []).push(n);
  for (const t of Object.keys(porTipo)) porTipo[t].sort((a, b) => a.titulo.localeCompare(b.titulo, 'pt-BR'));

  const L = [
    '---',
    'tipo: indice',
    'tags: ["cerebro/indice"]',
    'cssclasses: ["cerebro-indice"]',
    '---',
    '# 🗂️ Índice do cérebro',
    '',
    `> [!info] Gerado automaticamente pelos hooks a cada entrega (última vez em ${hoje()}). Não edite este arquivo: edite as notas.`,
    `> ${notas.length} notas · ${(porTipo.projeto || []).length} projeto(s) · voltar para [[Início]]`,
    '',
  ];
  for (const tipo of ORDEM_INDICE) {
    const grupo = porTipo[tipo] || [];
    L.push(`## ${EMOJI[tipo]} ${TIPOS[tipo].pasta.replace(/^\d+\s+/, '')} (${grupo.length})`);
    if (!grupo.length) L.push('_Ainda vazio._');
    for (const n of grupo) {
      const extra = tipo === 'projeto' && lista(n.dados.stack).length ? ` · ${lista(n.dados.stack).slice(0, 5).join(', ')}` : '';
      const projs = tipo !== 'projeto' && n.projetos.length ? ` · ${n.projetos.slice(0, 3).map((p) => `[[${p}]]`).join(', ')}` : '';
      L.push(`- [[${n.titulo}]]${n.resumo ? ` — ${cortar(n.resumo, 140)}` : ''}${extra}${projs}`);
    }
    L.push('');
  }
  // Mapa por projeto: o que foi aprendido em cada um.
  const porProjeto = {};
  for (const n of notas) if (n.tipo !== 'projeto') for (const p of n.projetos) (porProjeto[p] ||= []).push(n);
  const nomes = Object.keys(porProjeto).sort((a, b) => a.localeCompare(b, 'pt-BR'));
  if (nomes.length) {
    L.push('## 🧭 Conhecimento por projeto');
    for (const p of nomes) {
      L.push(`### [[${p}]]`);
      for (const n of porProjeto[p]) L.push(`- ${EMOJI[n.tipo] || ''} [[${n.titulo}]] (${TIPOS[n.tipo]?.rotulo || n.tipo})`);
    }
    L.push('');
  }
  return escreverSeMudou(path.join(cofre, PASTA_INICIO, 'Índice.md'), L.join('\n'));
}

// ---------------------------------------------------------------------------
// Textos entregues ao agente
// ---------------------------------------------------------------------------

export function protocolo(cofre, cmdBusca, git = false) {
  return `Como o segundo cérebro funciona (combinado com o usuário, vale para qualquer projeto):
- Antes de começar uma tarefa, leia as notas relacionadas que o hook anexar ao pedido e use o que já foi decidido/aprendido. Para buscar mais: ${cmdBusca} "termos" (ou procure direto nos arquivos .md do cofre).
- Ao terminar uma entrega (arquivos criados/alterados, problema resolvido, decisão tomada), registre no cofre ${cofre} o que vale reaproveitar em OUTROS projetos, sem esperar o usuário pedir:
  • 02 Padrões: um jeito de fazer que deu certo · 03 Decisões: escolha + motivo + alternativas descartadas · 04 Preferências: gostos e jeito de trabalhar do usuário · 05 Stack: ferramenta/biblioteca (uso, versão, pegadinhas) · 06 Aprendizados: erro/bug e a solução.
  • Uma nota por ideia, curta (5–25 linhas), em português, com título claro. Se já existir nota parecida, atualize-a em vez de duplicar.
  • Frontmatter: tipo (padrao|decisao|preferencia|stack|aprendizado), projetos: ["[[nome-do-projeto]]"], tags, criado, atualizado (AAAA-MM-DD) e resumo (1 linha). Use [[wikilinks]] entre notas.
  • Atualize também 01 Projetos/<projeto>.md (O que é, Stack, Como rodar, links das notas novas).
  • Nunca grave senhas, tokens, chaves de API ou dados pessoais de clientes.
- O índice (00 Início/Índice.md), a linha do tempo dos projetos e o diário de sessões (07 Sessões) são atualizados automaticamente pelos hooks.${git ? '\n- O cofre é um repositório Git: o hook baixa as notas no início e faz commit e push sozinho no fim de cada entrega. Não precisa commitar o cofre à mão.' : ''}`;
}

function comandoBusca() {
  const motor = path.join(pastaMotor(), 'cerebro.mjs').replace(/\\/g, '/');
  return `node "${motor}" buscar`;
}

// ---------------------------------------------------------------------------
// Estado por sessão (para saber se houve trabalho no turno)
// ---------------------------------------------------------------------------

function arqEstado(sessao) {
  return path.join(pastaMotor(), 'estado', `${nomeArquivoSeguro(sessao || 'sem-sessao')}.json`);
}
function lerEstado(sessao) {
  try { return JSON.parse(fs.readFileSync(arqEstado(sessao), 'utf8')); } catch { return {}; }
}
function salvarEstado(sessao, st) {
  try {
    const arq = arqEstado(sessao);
    fs.mkdirSync(path.dirname(arq), { recursive: true });
    fs.writeFileSync(arq, JSON.stringify(st), 'utf8');
  } catch {}
}
function limparEstadosAntigos() {
  try {
    const dir = path.join(pastaMotor(), 'estado');
    const limite = Date.now() - 7 * 864e5;
    for (const f of fs.readdirSync(dir)) {
      const p = path.join(dir, f);
      if (fs.statSync(p).mtimeMs < limite) fs.rmSync(p, { force: true });
    }
  } catch {}
}

// Comandos de shell que normalmente mudam algo (instalar, gerar, mover, commitar, publicar...).
const SHELL_MUDA = /(^|[\s;&|(])(git\s+(commit|push|merge|rebase|apply|am|cherry-pick|tag|init|clone|mv|rm)|npm\s+(i|install|ci|uninstall|run\s+build|publish|init)|pnpm\s+(i|install|add|remove|build)|yarn\s+(add|remove|install|build)|bun\s+(add|install|run\s+build)|npx\s+\S+|pip3?\s+install|uv\s+(add|pip)|poetry\s+add|cargo\s+(add|build)|go\s+(get|build|mod)|mkdir|touch|cp|mv|rm|rmdir|ln|chmod|sed\s+-i|perl\s+-pi|tee|unzip|tar\s+-?x|curl\s+[^|]*-o|wget|docker\s+(build|compose|run)|vercel|netlify|supabase|prisma\s+(migrate|db)|New-Item|Remove-Item|Copy-Item|Move-Item|Set-Content|Add-Content|Out-File)(\s|$)|[^<>=!-]>{1,2}\s*(?!&|\/dev\/null|\$null|nul\b)[^&\s]/i;

function arquivosDoPatch(texto) {
  const out = [];
  for (const m of String(texto).matchAll(/^\*\*\*\s+(?:Add|Update|Delete)\s+File:\s+(.+)$/gm)) out.push(m[1].trim());
  for (const m of String(texto).matchAll(/^\*\*\*\s+Move\s+to:\s+(.+)$/gm)) out.push(m[1].trim());
  return out;
}

function textoComando(c) {
  if (Array.isArray(c)) return c.join(' ');
  return String(c || '');
}

// ---------------------------------------------------------------------------
// Cofre guardado num repositório Git (ex.: GitHub privado): baixa no início, envia no fim
// ---------------------------------------------------------------------------

function git(cofre, args, timeout = 20000) {
  return execFileSync('git', ['-C', cofre, ...args], { encoding: 'utf8', timeout, stdio: ['ignore', 'pipe', 'ignore'] });
}

export function sincronizar(cfg, modo) {
  if (!cfg || !cfg.git || !fs.existsSync(path.join(cfg.cofre, '.git'))) return false;
  try {
    if (modo === 'baixar') {
      git(cfg.cofre, ['pull', '--ff-only', '--quiet'], 15000);
      return true;
    }
    git(cfg.cofre, ['add', '-A']);
    if (!git(cfg.cofre, ['status', '--porcelain']).trim()) return false;
    git(cfg.cofre, ['-c', 'user.name=Cérebro', '-c', 'user.email=cerebro@local', 'commit', '-q', '-m', `Cérebro: registro automático ${hoje()} ${hora()}`]);
    try { git(cfg.cofre, ['push', '-q', 'origin', 'HEAD']); } catch {
      try { git(cfg.cofre, ['pull', '--rebase', '--quiet']); git(cfg.cofre, ['push', '-q', 'origin', 'HEAD']); } catch {}
    }
    return true;
  } catch { return false; }
}

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

function hookInicioSessao(entrada, cfg, ferramenta) {
  limparEstadosAntigos();
  sincronizar(cfg, 'baixar');
  const cofre = cfg.cofre;
  const raiz = raizProjeto(entrada.cwd);
  const projeto = nomeProjeto(raiz);
  let notaProjeto = '';
  if (projeto) {
    const { arq } = garantirNotaProjeto(cofre, raiz, projeto);
    try {
      const { corpo } = lerFrontmatter(fs.readFileSync(arq, 'utf8'));
      const limpo = corpo.replace(/<!--[\s\S]*?-->/g, '').replace(/[ \t]+$/gm, '').replace(/\n{2,}/g, '\n').trim();
      notaProjeto = limpo.length > 2500 ? limpo.slice(0, 2500) + '\n…' : limpo;
    } catch {}
  }
  const notas = lerNotas(cofre);
  const prefs = notas.filter((n) => n.tipo === 'preferencia').slice(0, 15);
  const partes = [
    `[Segundo cérebro · Obsidian] O usuário mantém um segundo cérebro no Obsidian em ${cofre} e quer que ele seja consultado e alimentado automaticamente em todo projeto, sem precisar pedir.`,
    projeto ? `Projeto atual: ${projeto} (nota: ${TIPOS.projeto.pasta}/${projeto}.md).` : 'Sessão fora de um projeto (pasta pessoal).',
  ];
  if (notaProjeto) partes.push(`Conteúdo da nota do projeto:\n${notaProjeto}`);
  if (prefs.length) {
    partes.push('Preferências registradas do usuário (04 Preferências):\n' + prefs.map((n) => `- ${n.titulo}${n.resumo ? `: ${cortar(n.resumo, 160)}` : ''}`).join('\n'));
  }
  partes.push(protocolo(cofre, comandoBusca(), !!cfg.git));
  return { hookSpecificOutput: { hookEventName: 'SessionStart', additionalContext: partes.join('\n\n') } };
}

function hookPedido(entrada, cfg) {
  const pedido = String(entrada.prompt || '');
  const sessao = entrada.session_id;
  const st = lerEstado(sessao);
  salvarEstado(sessao, { inicio: Date.now(), pedido: cortar(pedido, 1200), sujo: false, cofreTocado: false, bloqueado: false, arquivos: [], projeto: st.projeto });
  if (pedido.trim().startsWith('/') && pedido.trim().split(/\s+/).length === 1) return null;
  const raiz = raizProjeto(entrada.cwd);
  const projeto = nomeProjeto(raiz);
  const notas = lerNotas(cfg.cofre);
  // Inclui o nome do projeto na consulta para puxar o que já existe dele.
  const achados = buscar(notas, pedido, { projeto, limite: 6 });
  if (!achados.length) return null;
  const linhas = achados.map((r, i) => {
    const n = r.nota;
    const t = trecho(n, r.termos);
    const projs = n.projetos.length && n.tipo !== 'projeto' ? ` · de ${n.projetos.slice(0, 2).join(', ')}` : '';
    return `${i + 1}. [${TIPOS[n.tipo]?.rotulo || 'Nota'}] ${n.titulo}${projs} — ${path.join(cfg.cofre, n.rel).replace(/\\/g, '/')}` +
      (n.resumo ? `\n   ${cortar(n.resumo, 180)}` : '') + (t && t !== cortar(n.resumo, 180) ? `\n   “${t}”` : '');
  });
  const texto = `[Segundo cérebro · Obsidian] Notas já registradas pelo usuário em outros trabalhos que têm relação com este pedido${projeto ? ` (projeto atual: ${projeto})` : ''}. Leia as que forem relevantes antes de executar e siga as decisões/preferências registradas:\n${linhas.join('\n')}`;
  return { hookSpecificOutput: { hookEventName: 'UserPromptSubmit', additionalContext: texto } };
}

function hookFerramenta(entrada, cfg) {
  const sessao = entrada.session_id;
  const st = lerEstado(sessao);
  const nome = String(entrada.tool_name || '');
  const inp = entrada.tool_input || {};
  const raiz = raizProjeto(entrada.cwd);
  const arquivos = [];
  let mudou = false;
  let tocouCofre = false;

  if (/^(Edit|Write|MultiEdit|NotebookEdit)$/.test(nome)) {
    const f = inp.file_path || inp.notebook_path || inp.path;
    if (f) arquivos.push(f);
    mudou = true;
  } else if (nome === 'apply_patch') {
    const texto = textoComando(inp.command || inp.patch || inp.input);
    arquivos.push(...arquivosDoPatch(texto));
    mudou = true;
  } else if (nome === 'Bash' || nome === 'exec_command' || nome === 'shell') {
    const cmd = textoComando(inp.command || inp.cmd);
    if (SHELL_MUDA.test(cmd)) {
      // Comando que escreve no próprio cofre conta como registro feito, não como trabalho no projeto.
      if (normalizarCaminho(cmd).includes(normalizarCaminho(cfg.cofre))) tocouCofre = true;
      else mudou = true;
    }
  }

  for (const f of arquivos) {
    const abs = path.isAbsolute(f) ? f : path.join(entrada.cwd || raiz, f);
    if (dentroDe(abs, cfg.cofre)) { tocouCofre = true; continue; }
    const rel = path.relative(raiz, abs).replace(/\\/g, '/');
    const mostrar = rel && !rel.startsWith('..') ? rel : abs.replace(/\\/g, '/');
    st.arquivos = [...new Set([...(st.arquivos || []), mostrar])].slice(0, 60);
    st.sujo = true;
  }
  if (mudou && !arquivos.length && !tocouCofre) st.sujo = true;
  if (tocouCofre) st.cofreTocado = true;
  salvarEstado(sessao, st);
  return null;
}

function finalizarTurno(entrada, cfg, ferramenta, st) {
  const raiz = raizProjeto(entrada.cwd);
  const projeto = nomeProjeto(raiz);
  if (projeto) garantirNotaProjeto(cfg.cofre, raiz, projeto);
  registrarSessao(cfg.cofre, {
    projeto, ferramenta,
    pedido: st.pedido || '',
    resposta: entrada.last_assistant_message || '',
    arquivos: st.arquivos || [],
  });
  reindexar(cfg.cofre);
  sincronizar(cfg, 'enviar');
  salvarEstado(entrada.session_id, { ...st, sujo: false, cofreTocado: false, bloqueado: false, arquivos: [] });
}

function hookFim(entrada, cfg, ferramenta) {
  const st = lerEstado(entrada.session_id);
  if (!st.sujo && !st.cofreTocado) return {};
  if (st.cofreTocado || entrada.stop_hook_active || st.bloqueado) {
    finalizarTurno(entrada, cfg, ferramenta, st);
    return {};
  }
  st.bloqueado = true;
  salvarEstado(entrada.session_id, st);
  const projeto = nomeProjeto(raizProjeto(entrada.cwd)) || 'sem projeto';
  const lista = (st.arquivos || []).slice(0, 8).join(', ');
  return {
    decision: 'block',
    reason:
      `Registro automático no segundo cérebro (combinado com o usuário): este turno mudou arquivos no projeto ${projeto}${lista ? ` (${lista})` : ''}. ` +
      `Antes de encerrar, grave no cofre ${cfg.cofre} o que vale reaproveitar em outros projetos: padrões (02 Padrões), decisões com motivo (03 Decisões), preferências do usuário percebidas (04 Preferências), stack/ferramentas e pegadinhas (05 Stack), erros e soluções (06 Aprendizados), e atualize ${TIPOS.projeto.pasta}/${projeto}.md. ` +
      'Atualize notas parecidas em vez de duplicar, use o frontmatter do modelo (tipo, projetos, tags, criado, atualizado, resumo) e nunca grave segredos. ' +
      'Se não houver nada novo que valha registrar, apenas responda "Cérebro: nada novo para registrar." Não repita a resposta anterior ao usuário; no fim, diga em uma linha o que foi registrado.',
  };
}

export function executarHook(evento, entrada, ferramenta) {
  const cfg = lerConfig();
  if (!cfg) return null;
  switch (evento) {
    case 'session-start': return hookInicioSessao(entrada, cfg, ferramenta);
    case 'prompt': return hookPedido(entrada, cfg, ferramenta);
    case 'tool': return hookFerramenta(entrada, cfg, ferramenta);
    case 'stop': return hookFim(entrada, cfg, ferramenta);
    default: return null;
  }
}

function lerStdin() {
  try { return fs.readFileSync(0, 'utf8'); } catch { return ''; }
}

// ---------------------------------------------------------------------------
// Semear: cria notas para os projetos que já existem no computador
// ---------------------------------------------------------------------------

const PULAR = new Set(['node_modules', '.git', 'vendor', 'dist', 'build', '.next', '.venv', 'venv', '__pycache__', 'AppData', 'Library', '.cache', 'target', '.Trash', 'Applications', 'Program Files', 'Windows']);

export function encontrarRepos(raizes, profundidade = 4) {
  const achados = [];
  const andar = (dir, nivel) => {
    if (achados.length >= 300) return;
    if (fs.existsSync(path.join(dir, '.git'))) { achados.push(dir); return; }
    if (nivel >= profundidade) return;
    let itens = [];
    try { itens = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
    for (const it of itens) {
      if (!it.isDirectory() || it.name.startsWith('.') || PULAR.has(it.name)) continue;
      andar(path.join(dir, it.name), nivel + 1);
    }
  };
  for (const r of raizes) if (r && fs.existsSync(r)) andar(path.resolve(r), 0);
  return [...new Set(achados)];
}

function resumoReadme(raiz) {
  for (const f of ['README.md', 'readme.md', 'README.MD', 'Readme.md']) {
    try {
      const t = fs.readFileSync(path.join(raiz, f), 'utf8');
      const p = primeiraFrase(t.replace(/<[^>]+>/g, '').replace(/!\[[^\]]*\]\([^)]*\)/g, ''));
      if (p) return p;
    } catch {}
  }
  return '';
}

function convencoes(raiz) {
  for (const f of ['CLAUDE.md', 'AGENTS.md', '.cursorrules']) {
    try {
      const t = fs.readFileSync(path.join(raiz, f), 'utf8').split(/\r?\n/).slice(0, 40).join('\n').trim();
      if (t) return `De \`${f}\`:\n\n` + t.split('\n').map((l) => `> ${l}`).join('\n');
    } catch {}
  }
  return '';
}

function ultimaDataCommit(raiz) {
  try {
    return execFileSync('git', ['-C', raiz, 'log', '-1', '--format=%cs'], { encoding: 'utf8', timeout: 4000, stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  } catch { return ''; }
}

export function semear(cofre, raizes) {
  const repos = encontrarRepos(raizes);
  const criados = [];
  for (const raiz of repos) {
    const nome = nomeProjeto(raiz);
    if (!nome || dentroDe(raiz, cofre)) continue;
    const { criada } = garantirNotaProjeto(cofre, raiz, nome, {
      resumo: resumoReadme(raiz),
      convencoes: convencoes(raiz),
      ultimaData: ultimaDataCommit(raiz),
    });
    if (criada) criados.push(nome);
  }
  reindexar(cofre);
  return { encontrados: repos.length, criados };
}

// ---------------------------------------------------------------------------
// Linha de comando
// ---------------------------------------------------------------------------

function principal(argv) {
  const [cmd, ...resto] = argv;
  if (cmd === 'hook') {
    const evento = resto[0];
    const i = resto.indexOf('--ferramenta');
    const ferramenta = i >= 0 ? resto[i + 1] : 'claude';
    let entrada = {};
    try { entrada = JSON.parse(lerStdin() || '{}'); } catch {}
    let saida = null;
    try { saida = executarHook(evento, entrada, ferramenta); } catch (e) {
      try { fs.appendFileSync(path.join(pastaMotor(), 'erros.log'), `${new Date().toISOString()} ${evento}: ${e && e.stack || e}\n`); } catch {}
      saida = evento === 'stop' ? {} : null;
    }
    if (saida) process.stdout.write(JSON.stringify(saida));
    else if (evento === 'stop') process.stdout.write('{}');
    return 0;
  }
  const cfg = lerConfig();
  if (cmd === 'status') {
    console.log(`Cérebro ${VERSAO}`);
    console.log(`Motor: ${pastaMotor()}`);
    console.log(cfg ? `Cofre: ${cfg.cofre}` : 'Cofre: não configurado (rode o instalador).');
    if (cfg) {
      const n = lerNotas(cfg.cofre);
      const c = {};
      for (const x of n) c[x.tipo] = (c[x.tipo] || 0) + 1;
      console.log('Notas:', Object.entries(c).map(([k, v]) => `${k}=${v}`).join(' ') || 'nenhuma');
    }
    return 0;
  }
  if (!cfg) { console.error('Cérebro não configurado. Rode o instalador primeiro.'); return 1; }
  if (cmd === 'buscar') {
    const consulta = resto.join(' ');
    const projeto = nomeProjeto(raizProjeto(process.cwd()));
    const achados = buscar(lerNotas(cfg.cofre), consulta, { projeto, limite: 12 });
    if (!achados.length) { console.log('Nada encontrado no cérebro para:', consulta); return 0; }
    for (const r of achados) {
      console.log(`- [${TIPOS[r.nota.tipo]?.rotulo || 'Nota'}] ${r.nota.titulo} (${r.score.toFixed(2)})`);
      console.log(`  ${path.join(cfg.cofre, r.nota.rel).replace(/\\/g, '/')}`);
      if (r.nota.resumo) console.log(`  ${cortar(r.nota.resumo, 200)}`);
    }
    return 0;
  }
  if (cmd === 'reindexar') { reindexar(cfg.cofre); console.log('Índice atualizado.'); return 0; }
  if (cmd === 'semear') {
    const r = semear(cfg.cofre, resto.length ? resto : [os.homedir()]);
    console.log(`Repositórios encontrados: ${r.encontrados}. Notas de projeto criadas: ${r.criados.length}.`);
    if (r.criados.length) console.log(r.criados.map((x) => `  + ${x}`).join('\n'));
    return 0;
  }
  console.log('Uso: node cerebro.mjs buscar "termos" | reindexar | semear <pastas...> | status');
  return cmd ? 1 : 0;
}

const executandoDireto = (() => {
  try { return path.resolve(process.argv[1] || '') === fileURLToPath(import.meta.url); } catch { return false; }
})();
if (executandoDireto) process.exitCode = principal(process.argv.slice(2));

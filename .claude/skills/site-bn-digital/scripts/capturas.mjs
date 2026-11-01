// Tira capturas de um site estático no celular e no computador e lista erros do console.
// Uso: node .claude/skills/site-bn-digital/scripts/capturas.mjs <pasta-do-site>
// Saída: docs/capturas/<pasta>/celular.png, computador.png e celular-inteiro.png
import { createServer } from "node:http";
import { readFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { extname, join, resolve, basename } from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const pasta = process.argv[2];
if (!pasta || !existsSync(join(pasta, "index.html"))) {
  console.error("Uso: node capturas.mjs <pasta-com-index.html>");
  process.exit(1);
}
const raiz = resolve(pasta);
const saida = resolve("docs/capturas", basename(raiz));
await mkdir(saida, { recursive: true });

const tipos = {
  ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript",
  ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png",
  ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp",
  ".avif": "image/avif", ".gif": "image/gif", ".ico": "image/x-icon",
  ".woff2": "font/woff2", ".mp4": "video/mp4", ".webm": "video/webm",
};

const servidor = createServer(async (req, res) => {
  let caminho = decodeURIComponent(new URL(req.url, "http://x").pathname);
  if (caminho.endsWith("/")) caminho += "index.html";
  const arquivo = join(raiz, caminho);
  if (!arquivo.startsWith(raiz)) { res.writeHead(403).end(); return; }
  try {
    const corpo = await readFile(arquivo);
    res.writeHead(200, { "content-type": tipos[extname(arquivo).toLowerCase()] || "application/octet-stream" });
    res.end(corpo);
  } catch {
    res.writeHead(404).end();
  }
});
await new Promise((ok) => servidor.listen(0, "127.0.0.1", ok));
const url = `http://127.0.0.1:${servidor.address().port}/`;

const navegador = await chromium.launch();
const problemas = [];

async function capturar(nome, opcoes, inteira = false) {
  const contexto = await navegador.newContext(opcoes);
  const pagina = await contexto.newPage();
  pagina.on("console", (m) => { if (m.type() === "error") problemas.push(`[${nome}] console: ${m.text()}`); });
  pagina.on("pageerror", (e) => problemas.push(`[${nome}] erro: ${e.message}`));
  pagina.on("requestfailed", (r) => problemas.push(`[${nome}] falhou: ${r.url()}`));
  pagina.on("response", (r) => { if (r.status() >= 400) problemas.push(`[${nome}] ${r.status()}: ${r.url()}`); });
  await pagina.goto(url, { waitUntil: "networkidle" });
  await pagina.waitForTimeout(800);
  const largura = await pagina.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  if (largura > 1) problemas.push(`[${nome}] rolagem lateral de ${largura}px`);
  await pagina.screenshot({ path: join(saida, `${nome}.png`) });
  if (inteira) await pagina.screenshot({ path: join(saida, `${nome}-inteiro.png`), fullPage: true });
  await contexto.close();
}

await capturar("celular", { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true }, true);
await capturar("computador", { viewport: { width: 1440, height: 900 } });

await navegador.close();
servidor.close();

console.log(`Capturas em ${saida}`);
console.log(problemas.length ? `Problemas:\n- ${problemas.join("\n- ")}` : "Nenhum erro encontrado.");

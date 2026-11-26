// Escreve categorias, produtos e combos dentro do index.html, para a página
// já abrir completa (sem esperar o JavaScript).
// Uso: node deposito-do-gordinho/montar.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const aqui = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const LOJA = require(join(aqui, "assets/js/config.js"));
const { CATEGORIAS, PRODUTOS, COMBOS } = require(join(aqui, "assets/js/produtos.js"));
const M = require(join(aqui, "assets/js/modelos.js"));

const html = join(aqui, "index.html");
let s = readFileSync(html, "utf8");

function trocar(nome, conteudo) {
  const re = new RegExp(`(<!-- montar:${nome} -->)[\\s\\S]*?(<!-- /montar:${nome} -->)`);
  if (!re.test(s)) throw new Error(`marcador ${nome} não achado`);
  s = s.replace(re, `$1\n${conteudo}\n$2`);
}

trocar("categorias", CATEGORIAS.map((c) => "          " + M.circulo(c, PRODUTOS.filter((p) => p.categoria === c.id).length)).join("\n"));
trocar("produtos", PRODUTOS.map((p) => "          " + M.card(p, LOJA.whatsapp)).join("\n"));
trocar("combos", COMBOS.map((c) => "          " + M.combo(c, LOJA.whatsapp)).join("\n"));

writeFileSync(html, s);
console.log(`ok: ${CATEGORIAS.length} categorias, ${PRODUTOS.length} produtos, ${COMBOS.length} combos`);

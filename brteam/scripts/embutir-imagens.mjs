// Troca os caminhos "./fotos/..." e "./logo..." do HTML único pelas imagens embutidas (data URI).
import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";

const arquivo = "dist-arquivo-unico/index.html";
let html = readFileSync(arquivo, "utf8");
const tipos = { ".webp": "image/webp", ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml" };

function listar(dir) {
  return readdirSync(dir).flatMap((n) => {
    const p = path.join(dir, n);
    return statSync(p).isDirectory() ? listar(p) : [p];
  });
}
let trocas = 0;
for (const f of listar("public")) {
  const tipo = tipos[path.extname(f)];
  if (!tipo) continue;
  const rel = "./" + path.relative("public", f).split(path.sep).join("/");
  if (!html.includes(rel)) continue;
  const uri = `data:${tipo};base64,${readFileSync(f).toString("base64")}`;
  trocas += html.split(rel).length - 1;
  html = html.split(rel).join(uri);
}
writeFileSync(arquivo, html);
console.log(`imagens embutidas: ${trocas}; tamanho: ${(html.length / 1024 / 1024).toFixed(2)} MB`);

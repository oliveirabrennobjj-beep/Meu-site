// Troca os caminhos "./fotos/..." e "./logo..." do HTML único pelas imagens embutidas (data URI).
import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import sharp from "sharp";
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
  // fotos um pouco mais comprimidas no arquivo único, para ele abrir rápido no celular
  const dados = tipo === "image/webp" ? await sharp(f).webp({ quality: 68 }).toBuffer() : readFileSync(f);
  const uri = `data:${tipo};base64,${dados.toString("base64")}`;
  trocas += html.split(rel).length - 1;
  html = html.split(rel).join(uri);
}
// navegadores atuais leem woff2; o woff (versão antiga e maior) sai do arquivo único
html = html.replace(/,\s*url\(data:font\/woff;base64,[A-Za-z0-9+/=]+\)\s*format\("woff"\)/g, "");
writeFileSync(arquivo, html);
console.log(`imagens embutidas: ${trocas}; tamanho: ${(html.length / 1024 / 1024).toFixed(2)} MB`);

// Junta o CSS e o JS do build em um trecho de HTML pronto para publicar como Artifact
// (sem <html>/<head>/<body>: a plataforma coloca essa moldura na publicação).
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const css = readFileSync(path.join(raiz, "dist/painel.css"), "utf8");
const js = readFileSync(path.join(raiz, "dist/painel.js"), "utf8");

if (/<\/style/i.test(css)) throw new Error("O CSS contém </style> e quebraria a página.");

const html = `<title>Prospecção BN Digital</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,400..700;1,700&family=Roboto+Mono:wght@400;500&family=Anton&family=Archivo+Black&family=Bricolage+Grotesque:opsz,wght@12..96,700&family=Cormorant+Garamond:wght@600&family=Fraunces:opsz,wght@9..144,600&family=Oswald:wght@600&display=swap">
<style>${css.trim()}</style>
<div id="root"></div>
<script src="https://cdnjs.cloudflare.com/ajax/libs/react/18.3.1/umd/react.production.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.3.1/umd/react-dom.production.min.js"></script>
<script>${js.trim().replace(/<\/script/gi, "<\\/script")}</script>
`;

const destino = path.join(raiz, "../vendas.html");
writeFileSync(destino, html);
console.log(`vendas.html: ${(html.length / 1024).toFixed(0)} KB`);

// Confere o ramo de lojas de verdade (nome + tipo do Google) contra o que o painel decide.
// Cada linha é um erro que já aconteceu (ou um nome misto que NÃO pode mudar). Roda antes do testar.mjs.
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const aqui = path.dirname(fileURLToPath(import.meta.url));
const { buildSync } = require("esbuild");

const saida = buildSync({
  entryPoints: [path.join(aqui, "../src/painel/leads.ts")],
  bundle: true,
  format: "cjs",
  platform: "node",
  write: false,
  logLevel: "error",
}).outputFiles[0].text;
const arquivo = path.join(mkdtempSync(path.join(tmpdir(), "ramos-")), "leads.cjs");
writeFileSync(arquivo, saida);
const { ramoDe, ramoSuspeito } = require(arquivo);

// [nome, tipo do Google, ramo esperado]
const CASOS = [
  // O nome claro vence o tipo errado do Google
  ["Barão Classic Suplementos", "Festas e eventos", "farmacia"],
  ["Spallace Pizzaria", "Lanchonete", "pizzaria"],
  ["Master Pizza Unamar", "Restaurante", "pizzaria"],
  ["Pizzatruck Terramar", "Restaurante", "pizzaria"],
  ["Duff Duff Deposito de Bebidas & Tabacaria.", "Bar", "mercado"],
  ["DEPOSITO DE AGUA E BEBIDAS IVAN", "Bar", "mercado"],
  ["Deposito de bebidas B.M", "Lanchonete", "mercado"],
  ["Barbearia do Rafael", "Salão de Beleza", "barbearia"],
  ["Kintal Espaço Festa", "Espaço para dança", "festa"],
  ["Pousada Tucunaré", "Imobiliária de aluguéis por temporada", "geral"],
  ["Casa da Sogra Restaurante", "Hamburgueria", "restaurante"],
  ["X-Cyber Informática", "Papelaria", "servicos"],
  ["Clínica de Estética - Iva Costa", "Clínica especializada", "estetica"],
  // Nome misto ou certo como o Google disse: não pode mudar
  ["Restaurante e Pizzaria Tia Aretha", "Restaurante brasileiro", "restaurante"],
  ["Zezé's Lanchonete & Pizzaria", "Lanchonete", "hamburgueria"],
  ["Restaurante e Lanchonete Petisco do Mar", "Lanchonete", "hamburgueria"],
  ["Salah esfiharia e pizzaria", "Lanchonete", "hamburgueria"],
  ["Dr.fitness Loja de Suplementos - Rio das ostras", "Loja de vitaminas e suplementos", "farmacia"],
  ["Savona Odontologia e Estética", "Dentista", "dentista"],
  ["Madame Merlot Adega e Wine Bar - (Rio das Ostras)", "Restaurante", "restaurante"],
  ["Mr Fit Rio das Ostras", "Delivery", "restaurante"],
  ["Salão Capixaba", "Barbearia", "barbearia"],
  ["Bar e Depósito do Maicon", "Distribuidor de bebidas", "mercado"],
];
for (const [nome, tipo, esperado] of CASOS) {
  assert.equal(ramoDe({ nome, tipo }).id, esperado, `${nome} (${tipo}) deveria ser ${esperado}`);
}

// O ramo escolhido à mão sempre ganha das regras
assert.equal(ramoDe({ nome: "Spallace Pizzaria", tipo: "Lanchonete", ramo: "hamburgueria" }).id, "hamburgueria");

// Aviso "o nome parece de…": só quando o nome aponta outro ramo e o Brenno ainda não escolheu
assert.equal(ramoSuspeito({ nome: "Dog House", tipo: "Pet Shop" })?.id, "hamburgueria");
assert.equal(ramoSuspeito({ nome: "Dog House", tipo: "Pet Shop", ramo: "pet" }), null, "escolhido à mão não avisa");
assert.equal(ramoSuspeito({ nome: "Zezé's Lanchonete & Pizzaria", tipo: "Lanchonete" }), null, "nome misto não avisa");
assert.equal(ramoSuspeito({ nome: "Clínica Unamais", tipo: "Cirurgião dentista" }), null, "'Clínica' não decide");
assert.equal(ramoSuspeito({ nome: "Cs beauty studio", tipo: "Esteticista" }), null, "mesma família não avisa");

console.log(`ramos ok: ${CASOS.length} nomes conferidos`);

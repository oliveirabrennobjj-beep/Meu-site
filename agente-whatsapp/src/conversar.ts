// Converse com o agente pelo terminal, sem precisar do WhatsApp: npm run conversar
import { createInterface } from "node:readline/promises";
import { responder } from "./agente.js";

const terminal = createInterface({ input: process.stdin, output: process.stdout });
const telefone = `terminal-${Date.now()}`;

console.log("Você é o cliente. Escreva como se estivesse no WhatsApp (Ctrl+C para sair).\n");
while (true) {
  const texto = (await terminal.question("Você: ")).trim();
  if (!texto) continue;
  console.log(`\nBN Digital: ${await responder(telefone, texto)}\n`);
}

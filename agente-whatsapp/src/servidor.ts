// Servidor do webhook do WhatsApp: recebe as mensagens da Meta e responde com o agente.
import { createServer } from "node:http";
import Anthropic from "@anthropic-ai/sdk";
import { responder } from "./agente.js";
import { assinaturaValida, enviarTexto, lerMensagens, type MensagemRecebida } from "./whatsapp.js";

const PORTA = Number(process.env.PORT ?? 3000);
const TOKEN_VERIFICACAO = process.env.WHATSAPP_VERIFY_TOKEN ?? "";

// A Meta pode mandar a mesma mensagem mais de uma vez: guardamos os IDs já vistos.
const vistas = new Set<string>();
// Uma fila por telefone, para responder na ordem em que as mensagens chegaram.
const filas = new Map<string, Promise<void>>();

async function atender(m: MensagemRecebida) {
  try {
    if (!m.texto) {
      await enviarTexto(m.de, "Por enquanto eu só consigo ler mensagens de texto. Pode me escrever? 🙂");
      return;
    }
    const resposta = await responder(m.de, m.texto, m.nome);
    await enviarTexto(m.de, resposta);
  } catch (erro) {
    if (erro instanceof Anthropic.RateLimitError || erro instanceof Anthropic.InternalServerError) {
      console.error("API do Claude ocupada:", erro.message);
    } else {
      console.error("Erro ao atender", m.de, erro);
    }
    await enviarTexto(m.de, "Tive um probleminha aqui. O Brenno já vai te responder!").catch(() => {});
  }
}

function enfileirar(m: MensagemRecebida) {
  if (vistas.has(m.id)) return;
  vistas.add(m.id);
  if (vistas.size > 5000) vistas.delete(vistas.values().next().value!);

  const anterior = filas.get(m.de) ?? Promise.resolve();
  const proxima = anterior.then(() => atender(m));
  filas.set(m.de, proxima);
  proxima.finally(() => {
    if (filas.get(m.de) === proxima) filas.delete(m.de);
  });
}

const servidor = createServer(async (req, res) => {
  const url = new URL(req.url ?? "/", `http://${req.headers.host}`);

  // Verificação do webhook, feita uma vez pela Meta ao cadastrar a URL.
  if (req.method === "GET" && url.pathname === "/webhook") {
    const ok = url.searchParams.get("hub.mode") === "subscribe" && TOKEN_VERIFICACAO && url.searchParams.get("hub.verify_token") === TOKEN_VERIFICACAO;
    res.writeHead(ok ? 200 : 403).end(ok ? url.searchParams.get("hub.challenge") ?? "" : "");
    return;
  }

  if (req.method === "POST" && url.pathname === "/webhook") {
    const partes: Buffer[] = [];
    for await (const parte of req) partes.push(parte as Buffer);
    const corpo = Buffer.concat(partes);

    if (!assinaturaValida(corpo, req.headers["x-hub-signature-256"] as string | undefined)) {
      res.writeHead(401).end();
      return;
    }
    res.writeHead(200).end(); // responde logo; a Meta reenvia se demorar

    try {
      lerMensagens(JSON.parse(corpo.toString("utf8"))).forEach(enfileirar);
    } catch (erro) {
      console.error("Webhook com corpo inválido:", erro);
    }
    return;
  }

  if (req.method === "GET" && url.pathname === "/") {
    res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" }).end("Agente de WhatsApp da BN Digital no ar.");
    return;
  }

  res.writeHead(404).end();
});

servidor.listen(PORTA, () => console.log(`Agente da BN Digital ouvindo na porta ${PORTA} (webhook em /webhook)`));

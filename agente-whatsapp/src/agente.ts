import Anthropic from "@anthropic-ai/sdk";
import { executarFerramenta, ferramentas } from "./ferramentas.js";
import { promptDoSistema } from "./prompt.js";

const client = new Anthropic();
const MODELO = process.env.MODELO ?? "claude-opus-5-5";

// Histórico por telefone. Guarda só o texto de cada lado (sem os passos internos das ferramentas),
// para a conversa crescer pouco e poder ser cortada sem quebrar nada.
type Conversa = { mensagens: Anthropic.Beta.BetaMessageParam[]; ultimaVez: number };
const conversas = new Map<string, Conversa>();

const MAX_MENSAGENS = 40;
const ESQUECER_DEPOIS_MS = 24 * 60 * 60 * 1000; // conversa parada há 24 h começa do zero
const MAX_PASSOS = 6; // limite de idas e vindas com ferramentas por mensagem recebida

function conversaDe(telefone: string) {
  const agora = Date.now();
  let c = conversas.get(telefone);
  if (!c || agora - c.ultimaVez > ESQUECER_DEPOIS_MS) {
    c = { mensagens: [], ultimaVez: agora };
    conversas.set(telefone, c);
  }
  c.ultimaVez = agora;
  return c;
}

function cortar(mensagens: Anthropic.Beta.BetaMessageParam[]) {
  while (mensagens.length > MAX_MENSAGENS || (mensagens.length > 0 && mensagens[0].role !== "user")) {
    mensagens.shift();
  }
}

// Recebe a mensagem de um cliente e devolve o texto da resposta.
export async function responder(telefone: string, textoDoCliente: string, nomeDoPerfil?: string): Promise<string> {
  const conversa = conversaDe(telefone);
  const primeira = conversa.mensagens.length === 0;
  const entrada = primeira && nomeDoPerfil ? `[Nome no perfil do WhatsApp: ${nomeDoPerfil}]\n${textoDoCliente}` : textoDoCliente;

  // Mensagens deste turno (com os passos das ferramentas); só o texto final vai para o histórico.
  const turno: Anthropic.Beta.BetaMessageParam[] = [...conversa.mensagens, { role: "user", content: entrada }];
  let respostaFinal = "";

  for (let passo = 0; passo < MAX_PASSOS; passo++) {
    const resposta = await client.beta.messages.create({
      model: MODELO,
      max_tokens: 4000,
      output_config: { effort: "low" }, // atendimento de WhatsApp: respostas rápidas e curtas
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default", // se o modelo recusar por engano, outro modelo responde no lugar
      cache_control: { type: "ephemeral" },
      system: promptDoSistema,
      tools: ferramentas,
      messages: turno,
    });

    const textos = resposta.content.flatMap((b) => (b.type === "text" ? [b.text] : []));
    if (textos.length) respostaFinal = textos.join("\n").trim();

    if (resposta.stop_reason === "refusal") {
      respostaFinal = "Essa eu vou deixar pro Brenno responder, tá? Ele te chama aqui em breve.";
      break;
    }
    if (resposta.stop_reason === "pause_turn") {
      turno.push({ role: "assistant", content: resposta.content });
      continue;
    }
    if (resposta.stop_reason !== "tool_use") break;

    turno.push({ role: "assistant", content: resposta.content });
    const resultados: Anthropic.Beta.BetaToolResultBlockParam[] = [];
    for (const bloco of resposta.content) {
      if (bloco.type !== "tool_use") continue;
      try {
        const saida = await executarFerramenta(bloco.name, bloco.input as Record<string, unknown>, telefone);
        resultados.push({ type: "tool_result", tool_use_id: bloco.id, content: saida });
      } catch (erro) {
        console.error(`Erro na ferramenta ${bloco.name}:`, erro);
        resultados.push({ type: "tool_result", tool_use_id: bloco.id, content: "Não deu certo agora.", is_error: true });
      }
    }
    turno.push({ role: "user", content: resultados });
  }

  if (!respostaFinal) respostaFinal = "Recebi sua mensagem! Já te respondo.";

  conversa.mensagens.push({ role: "user", content: entrada }, { role: "assistant", content: respostaFinal });
  cortar(conversa.mensagens);
  return respostaFinal;
}

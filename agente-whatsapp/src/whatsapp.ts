// Envio de mensagens pela API oficial do WhatsApp (WhatsApp Cloud API, da Meta).
import { createHmac, timingSafeEqual } from "node:crypto";

const VERSAO_API = "v23.0";

export async function enviarTexto(para: string, corpo: string) {
  const token = process.env.WHATSAPP_TOKEN;
  const idNumero = process.env.WHATSAPP_PHONE_NUMBER_ID;
  if (!token || !idNumero) {
    console.log(`[sem WhatsApp configurado] para ${para}:\n${corpo}\n`);
    return;
  }
  const resposta = await fetch(`https://graph.facebook.com/${VERSAO_API}/${idNumero}/messages`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ messaging_product: "whatsapp", to: para, type: "text", text: { body: corpo } }),
  });
  if (!resposta.ok) {
    throw new Error(`WhatsApp recusou o envio (${resposta.status}): ${await resposta.text()}`);
  }
}

// Avisa o Brenno no número pessoal dele. Se falhar (por exemplo, fora da janela de 24 h da Meta),
// o aviso continua salvo na pasta dados/ e aparece no log.
export async function avisarDono(corpo: string) {
  const dono = process.env.WHATSAPP_DONO;
  if (!dono) {
    console.log(`[aviso para o Brenno]\n${corpo}\n`);
    return;
  }
  try {
    await enviarTexto(dono, corpo);
  } catch (erro) {
    console.error("Não consegui avisar o Brenno no WhatsApp:", erro);
    console.log(`[aviso para o Brenno]\n${corpo}\n`);
  }
}

// Confere se a requisição veio mesmo da Meta (cabeçalho X-Hub-Signature-256).
export function assinaturaValida(corpoBruto: Buffer, assinatura: string | undefined) {
  const segredo = process.env.WHATSAPP_APP_SECRET;
  if (!segredo) return true; // sem segredo configurado (só para testes)
  if (!assinatura?.startsWith("sha256=")) return false;
  const esperada = Buffer.from("sha256=" + createHmac("sha256", segredo).update(corpoBruto).digest("hex"));
  const recebida = Buffer.from(assinatura);
  return esperada.length === recebida.length && timingSafeEqual(esperada, recebida);
}

export type MensagemRecebida = { id: string; de: string; nome?: string; tipo: string; texto?: string };

// Extrai as mensagens do formato de webhook da Meta.
export function lerMensagens(corpo: any): MensagemRecebida[] {
  const saida: MensagemRecebida[] = [];
  for (const entrada of corpo?.entry ?? []) {
    for (const mudanca of entrada?.changes ?? []) {
      const valor = mudanca?.value;
      const nomes = new Map<string, string>(
        (valor?.contacts ?? []).map((c: any) => [c.wa_id, c.profile?.name]),
      );
      for (const m of valor?.messages ?? []) {
        saida.push({
          id: m.id,
          de: m.from,
          nome: nomes.get(m.from),
          tipo: m.type,
          texto: m.type === "text" ? m.text?.body : m.type === "button" ? m.button?.text : undefined,
        });
      }
    }
  }
  return saida;
}

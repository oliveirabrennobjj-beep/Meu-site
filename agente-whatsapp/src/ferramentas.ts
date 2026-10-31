import type Anthropic from "@anthropic-ai/sdk";
import { appendFile, mkdir } from "node:fs/promises";
import { avisarDono } from "./whatsapp.js";

type Ferramenta = Anthropic.Beta.BetaTool;

export const ferramentas: Ferramenta[] = [
  {
    name: "registrar_orcamento",
    description:
      "Registra um pedido de orçamento de site ou cardápio digital e avisa o Brenno. Use quando já souber pelo menos o nome do negócio, o ramo e a cidade.",
    strict: true,
    input_schema: {
      type: "object",
      additionalProperties: false,
      required: ["nome_cliente", "negocio", "ramo", "cidade", "produto", "detalhes"],
      properties: {
        nome_cliente: { type: "string", description: "Nome da pessoa, ou vazio se ela não disse." },
        negocio: { type: "string", description: "Nome do comércio." },
        ramo: { type: "string", description: "Ex.: lanchonete, barbearia, academia." },
        cidade: { type: "string" },
        produto: { type: "string", enum: ["site", "cardapio", "site_e_placa", "outro"] },
        detalhes: {
          type: "string",
          description: "Resumo do que a pessoa precisa: se tem Instagram/site, quantidade de produtos, carrinho, urgência.",
        },
      },
    },
  },
  {
    name: "agendar_demonstracao",
    description:
      "Marca uma visita do Brenno ao comércio para mostrar a placa NFC funcionando (e configurar na hora, se a pessoa comprar). Use quando a pessoa aceitar a visita e disser o dia e o período.",
    strict: true,
    input_schema: {
      type: "object",
      additionalProperties: false,
      required: ["nome_cliente", "negocio", "endereco", "dia", "periodo", "observacoes"],
      properties: {
        nome_cliente: { type: "string" },
        negocio: { type: "string" },
        endereco: { type: "string", description: "Endereço ou referência do comércio." },
        dia: { type: "string", description: "Dia combinado, como a pessoa disse (ex.: amanhã, sexta 07/11)." },
        periodo: { type: "string", enum: ["manha", "tarde"] },
        observacoes: { type: "string", description: "Quantas placas, quais tipos (Google, WhatsApp, Pix), cor preferida." },
      },
    },
  },
  {
    name: "chamar_brenno",
    description:
      "Avisa o Brenno para assumir a conversa pessoalmente. Use quando a pessoa pedir para falar com ele, for reclamação ou suporte de um trabalho entregue, parceria, ou quando você não souber responder.",
    strict: true,
    input_schema: {
      type: "object",
      additionalProperties: false,
      required: ["motivo", "resumo"],
      properties: {
        motivo: { type: "string", enum: ["pediu_humano", "suporte", "reclamacao", "parceria", "nao_sei_responder", "outro"] },
        resumo: { type: "string", description: "O que a pessoa quer, em uma ou duas frases." },
      },
    },
  },
];

const PASTA_DADOS = new URL("../dados/", import.meta.url);

async function salvar(arquivo: string, registro: object) {
  await mkdir(PASTA_DADOS, { recursive: true });
  await appendFile(new URL(arquivo, PASTA_DADOS), JSON.stringify(registro) + "\n");
}

function texto(v: unknown) {
  return typeof v === "string" ? v.trim() : "";
}

// Executa a ferramenta pedida pelo modelo. `telefone` é o número de quem está conversando.
export async function executarFerramenta(nome: string, entrada: Record<string, unknown>, telefone: string): Promise<string> {
  const quando = new Date().toISOString();
  const conversa = telefone.startsWith("terminal") ? "(teste no terminal)" : `https://wa.me/${telefone}`;

  switch (nome) {
    case "registrar_orcamento": {
      await salvar("orcamentos.jsonl", { quando, telefone, ...entrada });
      await avisarDono(
        `🆕 *Pedido de orçamento* (${texto(entrada.produto)})\n` +
          `${texto(entrada.negocio)} · ${texto(entrada.ramo)} · ${texto(entrada.cidade)}\n` +
          `Contato: ${texto(entrada.nome_cliente) || "sem nome"} ${conversa}\n` +
          `${texto(entrada.detalhes)}`,
      );
      return "Orçamento registrado e Brenno avisado. Ele manda o valor por esta conversa.";
    }
    case "agendar_demonstracao": {
      await salvar("demonstracoes.jsonl", { quando, telefone, ...entrada });
      await avisarDono(
        `📍 *Visita marcada* (placa NFC)\n` +
          `${texto(entrada.negocio)}: ${texto(entrada.endereco)}\n` +
          `${texto(entrada.dia)}, ${entrada.periodo === "manha" ? "manhã" : "tarde"}\n` +
          `Contato: ${texto(entrada.nome_cliente) || "sem nome"} ${conversa}\n` +
          `${texto(entrada.observacoes)}`,
      );
      return "Visita anotada e Brenno avisado. Se ele não puder no horário, ele mesmo avisa por aqui.";
    }
    case "chamar_brenno": {
      await salvar("chamados.jsonl", { quando, telefone, ...entrada });
      await avisarDono(`🙋 *Chamaram você* (${texto(entrada.motivo)})\n${texto(entrada.resumo)}\n${conversa}`);
      return "Brenno avisado. Ele responde assim que puder.";
    }
    default:
      throw new Error(`Ferramenta desconhecida: ${nome}`);
  }
}

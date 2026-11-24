import { STATUS, cidadeDe, statusDe, tipoDe, type Lead, type Status } from "./leads";
import {
  RESULTADOS,
  TIPOS,
  novoId,
  type Compromisso as Horario,
  type ConfigAgenda,
  type Resultado,
  type TipoCompromisso,
} from "./agenda";

/** O que o Brenno combinou com a loja: quando ("AAAA-MM-DD" ou "AAAA-MM-DDTHH:mm", hora local) e o quê. */
export interface Compromisso {
  quando: string;
  oque: string;
}

export interface Nota {
  em: string;
  texto: string;
}

/** O que o assistente entendeu da anotação, para o Brenno conferir antes de salvar. */
export interface Proposta {
  /** Nova situação, ou null para deixar como está. */
  status: Status | null;
  /** Compromisso combinado, ou null se a anotação não marca nada. */
  compromisso: Compromisso | null;
  /** Anotação curta, nas palavras dele. */
  anotacao: string;
}

export type Turno = { role: "user" | "assistant"; content: string };
type SampleJson = (input: string, options?: Record<string, unknown>) => Promise<unknown>;
export type Sample = ((
  input: string | Turno[],
  options?: Record<string, unknown>,
) => Promise<{ text: string; truncated: boolean }>) & {
  json: SampleJson;
  limits?: () => Promise<{ images?: { maxCount: number; maxInputBytes: number; mediaTypes: string[] } }>;
};

let sampleCache: Promise<Sample | null> | null = null;

/** O Claude dentro do painel; null quando não está disponível nesta tela. */
export function usarSample(): Promise<Sample | null> {
  sampleCache ??= (async () => {
    const sample = (await window.claude?.use?.("sample")) as Sample | null | undefined;
    return typeof sample === "function" && typeof sample.json === "function" ? sample : null;
  })();
  return sampleCache;
}

/** Tipos de foto que o assistente aceita nesta tela; vazio quando não dá para mandar foto. */
export async function tiposDeFoto(): Promise<string[]> {
  const sample = await usarSample();
  const limites = await sample?.limits?.().catch(() => null);
  return limites?.images?.mediaTypes ?? [];
}

/** Mudança na agenda (coleção `compromissos`) que o assistente propôs junto com a da loja. */
export type HorarioAcao =
  | { acao: "marcar"; data: string; hora: string; tipo: TipoCompromisso; duracao?: number; obs?: string }
  | { acao: "remarcar"; id: string; data: string; hora: string }
  | { acao: "cancelar" | "confirmado"; id: string }
  | { acao: "realizado"; id: string; resultado: Resultado };

/** Uma mudança no painel que o assistente propôs na conversa. */
export interface Acao extends Proposta {
  loja: string;
  horario?: HorarioAcao | null;
}

const DATA = /^\d{4}-\d{2}-\d{2}$/;
const HORA = /^\d{2}:\d{2}$/;

/** Confere o pedido de agenda do assistente; o que vier fora do formato (ou com id que não existe) é ignorado. */
export function lerHorario(valor: unknown, idsAgenda: Set<string>): HorarioAcao | null {
  if (!valor || typeof valor !== "object") return null;
  const h = valor as Record<string, unknown>;
  const id = String(h.id ?? "");
  const data = String(h.data ?? "");
  const hora = String(h.hora ?? "");
  switch (h.acao) {
    case "marcar": {
      if (!DATA.test(data) || !HORA.test(hora)) return null;
      const tipo = typeof h.tipo === "string" && h.tipo in TIPOS ? (h.tipo as TipoCompromisso) : "visita";
      const duracao = typeof h.duracao === "number" && h.duracao >= 5 && h.duracao <= 600 ? Math.round(h.duracao) : undefined;
      const obs = typeof h.obs === "string" && h.obs.trim() ? h.obs.trim() : undefined;
      return { acao: "marcar", data, hora, tipo, ...(duracao ? { duracao } : {}), ...(obs ? { obs } : {}) };
    }
    case "remarcar":
      return idsAgenda.has(id) && DATA.test(data) && HORA.test(hora) ? { acao: "remarcar", id, data, hora } : null;
    case "cancelar":
    case "confirmado":
      return idsAgenda.has(id) ? { acao: h.acao, id } : null;
    case "realizado":
      return idsAgenda.has(id) && typeof h.resultado === "string" && h.resultado in RESULTADOS
        ? { acao: "realizado", id, resultado: h.resultado as Resultado }
        : null;
    default:
      return null;
  }
}

/** Uma fala da conversa com o assistente, como fica guardada no banco. */
export interface Mensagem {
  papel: "brenno" | "assistente";
  texto: string;
  em: string;
  foto?: boolean;
  acoes?: Acao[];
  /** Posições das ações já salvas no painel. */
  salvas?: number[];
}

const INICIO_BLOCO = "```painel";

/** Texto a mostrar enquanto a resposta chega: o bloco de ações fica escondido. */
export const textoVisivel = (texto: string) => texto.split(INICIO_BLOCO)[0].trimEnd();

/** Separa o texto da resposta do bloco ```painel com as mudanças propostas. */
export function separarAcoes(
  texto: string,
  idsValidos: Set<string>,
  idsAgenda: Set<string> = new Set(),
): { visivel: string; acoes: Acao[] } {
  const visivel = textoVisivel(texto);
  const bloco = texto.split(INICIO_BLOCO)[1]?.split("```")[0];
  if (!bloco) return { visivel, acoes: [] };
  let lista: unknown;
  try {
    lista = JSON.parse(bloco.trim());
  } catch {
    return { visivel, acoes: [] };
  }
  const itens = Array.isArray(lista) ? lista : [lista];
  const acoes: Acao[] = [];
  for (const item of itens) {
    const loja = String((item as { loja?: unknown })?.loja ?? "");
    if (!idsValidos.has(loja)) continue;
    const proposta = lerProposta(item, "");
    const horario = lerHorario((item as { horario?: unknown })?.horario, idsAgenda);
    if (!proposta.anotacao && !proposta.status && !proposta.compromisso && !horario) continue;
    acoes.push({ loja, ...proposta, ...(horario ? { horario } : {}) });
  }
  return { visivel, acoes };
}

const DIAS = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"];
const dois = (n: number) => String(n).padStart(2, "0");
const dataIso = (d: Date) => `${d.getFullYear()}-${dois(d.getMonth() + 1)}-${dois(d.getDate())}`;

const SITUACOES_ACEITAS: Status[] = ["enviado", "respondeu", "fechou", "depois", "nao"];

function montarPergunta(lead: Lead, texto: string, agora: Date) {
  const proximos = Array.from({ length: 8 }, (_, i) => {
    const d = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate() + i);
    const nome = i === 0 ? "hoje" : i === 1 ? "amanhã" : DIAS[d.getDay()];
    return `${nome}: ${dataIso(d)} (${DIAS[d.getDay()]})`;
  }).join("; ");
  return [
    "Você organiza as anotações de vendas do Brenno, que vende site e placa de avaliação do Google para comércio local.",
    "Ele escreveu uma anotação sobre um comércio. Entenda e responda só com um objeto JSON, sem mais nada:",
    '{"status": "enviado" | "respondeu" | "fechou" | "depois" | "nao" | null, "compromisso": {"quando": "AAAA-MM-DD" ou "AAAA-MM-DDTHH:mm", "oque": "texto curto"} | null, "anotacao": "texto"}',
    "",
    "Regras:",
    "- status: respondeu = a loja respondeu, mostrou interesse ou marcou conversa; fechou = ele disse que vendeu/fechou; depois = pediram pra falar mais pra frente; nao = não querem; enviado = mandou mensagem e ninguém respondeu; null = a anotação não muda a situação.",
    "- compromisso: só se a anotação marca um dia (com ou sem hora) para conversar, visitar, ligar ou mandar mensagem. Use o calendário abaixo para entender hoje, amanhã e dias da semana. Meio-dia = 12:00. Sem hora dita, use só a data. Em oque, diga o que fazer e onde, se ele disse (ex.: \"Conversar com o dono pessoalmente no Pôr do Sol\").",
    "- anotacao: 1 ou 2 frases curtas em português, do jeito que ele fala, só com o que ele escreveu. Não invente nada.",
    "",
    `Agora: ${DIAS[agora.getDay()]}, ${dataIso(agora)} ${dois(agora.getHours())}:${dois(agora.getMinutes())} (horário de Brasília).`,
    `Calendário: ${proximos}.`,
    `Comércio: ${lead.nome} (${tipoDe(lead)}, ${cidadeDe(lead)}). Situação atual: ${STATUS[statusDe(lead)].label}.`,
    lead.obs ? `Anotação anterior: ${lead.obs}` : "",
    "",
    `Anotação nova do Brenno: ${texto}`,
  ]
    .filter((linha, i, todas) => linha !== "" || todas[i - 1] !== "")
    .join("\n");
}

const QUANDO = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2})?$/;

/** Confere a resposta do Claude: o que não vier no formato certo é ignorado. */
export function lerProposta(resposta: unknown, textoOriginal: string): Proposta {
  const r = (resposta && typeof resposta === "object" ? resposta : {}) as Record<string, unknown>;
  const status = SITUACOES_ACEITAS.includes(r.status as Status) ? (r.status as Status) : null;
  const c = (r.compromisso && typeof r.compromisso === "object" ? r.compromisso : null) as
    | Record<string, unknown>
    | null;
  const compromisso =
    c && typeof c.quando === "string" && QUANDO.test(c.quando) && typeof c.oque === "string" && c.oque.trim()
      ? { quando: c.quando, oque: c.oque.trim() }
      : null;
  const anotacao =
    typeof r.anotacao === "string" && r.anotacao.trim() ? r.anotacao.trim() : textoOriginal.trim();
  return { status, compromisso, anotacao };
}

export async function entenderNota(lead: Lead, texto: string, agora = new Date()): Promise<Proposta> {
  const sample = await usarSample();
  if (!sample) throw { code: "not_granted" };
  const resposta = await sample.json(montarPergunta(lead, texto, agora), { modelTier: "quick", cache: false });
  return lerProposta(resposta, texto);
}

/** Data do compromisso no horário do aparelho. */
export function dataDoCompromisso(quando: string) {
  const [data, hora] = quando.split("T");
  const [a, m, d] = data.split("-").map(Number);
  const [h, mi] = (hora ?? "00:00").split(":").map(Number);
  return new Date(a, m - 1, d, h, mi);
}

/** "hoje 12:00", "amanhã", "sáb 14/11 12:00"... */
export function quandoCurto(quando: string, agora = new Date()) {
  const data = dataDoCompromisso(quando);
  const hora = quando.includes("T") ? ` ${quando.slice(11, 16)}` : "";
  const hoje = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate());
  const dias = Math.round(
    (new Date(data.getFullYear(), data.getMonth(), data.getDate()).getTime() - hoje.getTime()) / 86_400_000,
  );
  if (dias === 0) return `hoje${hora}`;
  if (dias === 1) return `amanhã${hora}`;
  if (dias === -1) return `ontem${hora}`;
  return `${DIAS[data.getDay()].slice(0, 3)} ${dois(data.getDate())}/${dois(data.getMonth() + 1)}${hora}`;
}

/** O compromisso já passou do dia. */
export function atrasado(quando: string, agora = new Date()) {
  const data = dataDoCompromisso(quando);
  return dataIso(data) < dataIso(agora);
}

/** A mensagem pronta que o assistente pôs entre aspas na resposta (a primeira), ou null. */
export function mensagemPronta(texto: string): string | null {
  const m = texto.match(/["\u201c]([^"\u201c\u201d]{12,})["\u201d]/);
  return m ? m[1].trim() : null;
}

/**
 * Aplica no painel o que o assistente propôs: anotação, situação e lembrete na loja, e o pedido de agenda
 * (marcar, remarcar, cancelar, confirmar, realizado). Usado pelo Assistente e pela ficha do horário.
 */
export function aplicarAcao(
  acao: Acao,
  lead: Lead,
  ctx: {
    agenda: Horario[];
    cfg: ConfigAgenda;
    onSalvar: (id: string, mudanca: Partial<Lead>) => void;
    onCompromisso: (c: Horario) => void;
  },
) {
  const agora = new Date().toISOString();
  ctx.onSalvar(lead.id, {
    ...(acao.anotacao ? { obs: acao.anotacao } : {}),
    historico: [...(lead.historico ?? []), ...(acao.anotacao ? [{ em: agora, texto: acao.anotacao }] : [])].slice(-20),
    ...(acao.status && acao.status !== statusDe(lead) ? { status: acao.status } : {}),
    ...(acao.compromisso ? { compromisso: acao.compromisso } : {}),
  });
  const h = acao.horario;
  if (!h) return;
  if (h.acao === "marcar") {
    ctx.onCompromisso({
      id: novoId(),
      leadId: lead.id,
      tipo: h.tipo,
      servico: "ambos",
      data: h.data,
      hora: h.hora,
      duracao: h.duracao ?? ctx.cfg.duracao,
      local: "",
      obs: h.obs ?? acao.anotacao ?? "",
      prioridade: "media",
      status: "agendado",
      resultado: null,
      historico: [],
      avisos: {},
      criado: agora,
    });
    return;
  }
  const c = ctx.agenda.find((x) => x.id === h.id);
  if (!c) return;
  if (h.acao === "remarcar")
    ctx.onCompromisso({
      ...c,
      data: h.data,
      hora: h.hora,
      status: "remarcado",
      avisos: {},
      historico: [...c.historico, { de: `${c.data} ${c.hora}`, para: `${h.data} ${h.hora}`, em: agora }],
    });
  else if (h.acao === "cancelar") ctx.onCompromisso({ ...c, status: "cancelado" });
  else if (h.acao === "confirmado") ctx.onCompromisso({ ...c, status: "confirmado" });
  else if (h.acao === "realizado") ctx.onCompromisso({ ...c, status: "realizado", resultado: h.resultado });
}

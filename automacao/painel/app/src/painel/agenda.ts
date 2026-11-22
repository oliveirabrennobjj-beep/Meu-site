// Agenda de clientes: horários marcados com cada loja (visita, reunião, ligação…), choques de horário,
// horários livres, lembretes e as mensagens prontas para mandar pelo WhatsApp.
// As datas ficam como "AAAA-MM-DD" e "HH:mm" no horário de Brasília (o celular do Brenno).
import { ENVIOS, statusDe, type Lead } from "./leads";

export type TipoCompromisso = "visita" | "online" | "ligacao" | "proposta" | "retorno" | "instalacao";
export type ServicoCompromisso = "placa" | "site" | "ambos" | "outro";
export type Prioridade = "alta" | "media" | "baixa";
export type StatusCompromisso = "agendado" | "confirmado" | "realizado" | "remarcado" | "cancelado" | "faltou";
export type Resultado = "fechou" | "pensar" | "naofechou";
export type ModeloId =
  | "pedirDias"
  | "pedirAberto"
  | "interesse"
  | "confirmacao"
  | "lembrete"
  | "remarcacao"
  | "pos";

export interface Compromisso {
  id: string;
  /** Loja do painel; "" quando o cliente não está na lista (vai em `cliente`). */
  leadId: string;
  /** Cliente que não está no painel (cliente novo ou exemplo). */
  cliente?: { nome: string; whatsapp: string; endereco?: string } | null;
  tipo: TipoCompromisso;
  servico: ServicoCompromisso;
  /** AAAA-MM-DD */
  data: string;
  /** HH:mm (24h) */
  hora: string;
  /** minutos */
  duracao: number;
  local: string;
  obs: string;
  prioridade: Prioridade;
  status: StatusCompromisso;
  resultado?: Resultado | null;
  /** Remarcações: de onde para onde, e quando foi feita. */
  historico: { de: string; para: string; em: string }[];
  /** Mensagens já mandadas (ou marcadas como "cliente avisado"), com a data. */
  avisos: Partial<Record<ModeloId, string>>;
  criado: string;
  exemplo?: boolean;
  apagado?: boolean;
  /** Combinado antigo (`lead.compromisso`), mostrado na agenda até virar horário marcado. */
  legado?: boolean;
  /** Combinado antigo só com o dia, sem hora. */
  semHora?: boolean;
}

export interface ConfigAgenda {
  /** Dias da semana em que atende (0 = domingo). */
  dias: number[];
  /** Primeira e última hora da grade (ex.: 8 e 20). */
  inicio: number;
  fim: number;
  /** Duração padrão, em minutos. */
  duracao: number;
  /** Folga mínima entre dois compromissos (deslocamento), em minutos. */
  intervalo: number;
  /** Avisar quantos minutos antes (ex.: 1 dia e 1 hora). */
  lembretes: number[];
  cores: Record<TipoCompromisso, string>;
  modelos: Record<ModeloId, string>;
}

export const TIPOS: Record<TipoCompromisso, { nome: string; curto: string }> = {
  visita: { nome: "Visita presencial", curto: "Visita" },
  online: { nome: "Reunião online", curto: "Online" },
  ligacao: { nome: "Ligação", curto: "Ligação" },
  proposta: { nome: "Apresentação de proposta", curto: "Proposta" },
  retorno: { nome: "Retorno / follow-up", curto: "Retorno" },
  instalacao: { nome: "Entrega / instalação", curto: "Instalação" },
};
export const TIPOS_ORDEM = Object.keys(TIPOS) as TipoCompromisso[];

export const SERVICOS: Record<ServicoCompromisso, string> = {
  placa: "Placa NFC",
  site: "Site",
  ambos: "Placa NFC + Site",
  outro: "Outro",
};

export const PRIORIDADES: Record<Prioridade, string> = { alta: "Alta", media: "Média", baixa: "Baixa" };

/** Rótulo e cor da etiqueta de status (verde confirmado, amarelo remarcado, vermelho cancelado/faltou). */
export const STATUS_COMPROMISSO: Record<StatusCompromisso, { nome: string; cor: string; fundo: string }> = {
  agendado: { nome: "Agendado", cor: "#1d4ed8", fundo: "#dbeafe" },
  confirmado: { nome: "Confirmado", cor: "#15803d", fundo: "#dcfce7" },
  realizado: { nome: "Realizado", cor: "#166534", fundo: "#bbf7d0" },
  remarcado: { nome: "Remarcado", cor: "#a16207", fundo: "#fef3c7" },
  cancelado: { nome: "Cancelado", cor: "#b91c1c", fundo: "#fee2e2" },
  faltou: { nome: "Não compareceu", cor: "#b91c1c", fundo: "#fee2e2" },
};
export const STATUS_COMPROMISSO_ORDEM = Object.keys(STATUS_COMPROMISSO) as StatusCompromisso[];

export const RESULTADOS: Record<Resultado, string> = { fechou: "Fechou", pensar: "Vai pensar", naofechou: "Não fechou" };

export const MODELOS_NOMES: Record<ModeloId, string> = {
  pedirDias: "Pedir horário (sugerindo dias)",
  pedirAberto: "Pedir horário (aberto)",
  interesse: "Ainda tem interesse?",
  confirmacao: "Confirmação",
  lembrete: "Lembrete",
  remarcacao: "Remarcação",
  pos: "Pós-reunião",
};

export const CONFIG_PADRAO: ConfigAgenda = {
  dias: [1, 2, 3, 4, 5, 6],
  inicio: 8,
  fim: 20,
  duracao: 30,
  intervalo: 15,
  lembretes: [24 * 60, 60],
  cores: {
    visita: "#2563eb",
    online: "#7c3aed",
    ligacao: "#0891b2",
    proposta: "#ea580c",
    retorno: "#ca8a04",
    instalacao: "#16a34a",
  },
  modelos: {
    pedirDias:
      "Olá, [nome]! Tudo bem? Aqui é o Brenno, da BN Digital.\nConforme conversamos, gostaria de agendar um horário para conversarmos pessoalmente.\nTenho disponibilidade [dias sugeridos]. Qual dia e horário ficam melhores para você?",
    pedirAberto:
      "Olá, [nome]! Tudo bem? Aqui é o Brenno, da BN Digital.\nConforme conversamos, gostaria de agendar um horário para conversarmos pessoalmente sobre a proposta.\nQual dia e horário ficam melhores para você nesta semana?",
    interesse:
      "Olá, [nome]! Tudo bem? Aqui é o Brenno, da BN Digital.\nPassando para saber se você ainda tem interesse em [serviço]. Se fizer sentido, combinamos um horário para eu te mostrar tudo com calma.",
    confirmacao:
      "Oi [nome], tudo bem? Confirmando nossa conversa [dia da semana], [data], às [hora], [local]. Posso contar com você?",
    lembrete: "Oi [nome], passando pra lembrar da nossa conversa hoje às [hora]. Até já!",
    remarcacao: "Oi [nome], precisei ajustar nosso horário. Pode ser [nova data] às [nova hora]?",
    pos: "Oi [nome], obrigado pela conversa de hoje! Qualquer dúvida sobre [serviço], estou à disposição.",
  },
};

/** Junta o que veio do banco com o padrão (campo faltando ou inválido volta ao padrão). */
export function lerConfigAgenda(v: unknown): ConfigAgenda {
  const x = (v && typeof v === "object" ? v : {}) as Partial<ConfigAgenda>;
  const num = (n: unknown, padrao: number, min: number, max: number) =>
    typeof n === "number" && Number.isFinite(n) && n >= min && n <= max ? Math.round(n) : padrao;
  const inicio = num(x.inicio, CONFIG_PADRAO.inicio, 0, 23);
  const fim = Math.max(inicio + 1, num(x.fim, CONFIG_PADRAO.fim, 1, 24));
  const dias = Array.isArray(x.dias) ? x.dias.filter((d) => Number.isInteger(d) && d >= 0 && d <= 6) : CONFIG_PADRAO.dias;
  const lembretes = Array.isArray(x.lembretes)
    ? x.lembretes.filter((m) => typeof m === "number" && m > 0 && m <= 7 * 24 * 60)
    : CONFIG_PADRAO.lembretes;
  const modelos = { ...CONFIG_PADRAO.modelos };
  for (const id of Object.keys(modelos) as ModeloId[]) {
    const t = x.modelos?.[id];
    if (typeof t === "string" && t.trim()) modelos[id] = t;
  }
  const cores = { ...CONFIG_PADRAO.cores };
  for (const id of TIPOS_ORDEM) {
    const c = x.cores?.[id];
    if (typeof c === "string" && /^#[0-9a-f]{6}$/i.test(c)) cores[id] = c;
  }
  return {
    dias: dias.length ? [...new Set(dias)].sort() : CONFIG_PADRAO.dias,
    inicio,
    fim,
    duracao: num(x.duracao, CONFIG_PADRAO.duracao, 5, 600),
    intervalo: num(x.intervalo, CONFIG_PADRAO.intervalo, 0, 240),
    lembretes: lembretes.length ? lembretes : CONFIG_PADRAO.lembretes,
    cores,
    modelos,
  };
}

/** Garante os campos que a tela usa; documento quebrado vira null. */
export function lerCompromisso(id: string, v: unknown): Compromisso | null {
  if (!v || typeof v !== "object") return null;
  const x = v as Partial<Compromisso>;
  const cliente =
    x.cliente && typeof x.cliente === "object" && String(x.cliente.nome ?? "").trim()
      ? {
          nome: String(x.cliente.nome).trim(),
          whatsapp: String(x.cliente.whatsapp ?? "").replace(/\D/g, ""),
          ...(x.cliente.endereco ? { endereco: String(x.cliente.endereco) } : {}),
        }
      : null;
  if ((!x.leadId && !cliente) || !/^\d{4}-\d{2}-\d{2}$/.test(String(x.data)) || !/^\d{2}:\d{2}$/.test(String(x.hora)))
    return null;
  return {
    id,
    leadId: String(x.leadId ?? ""),
    ...(cliente ? { cliente } : {}),
    tipo: x.tipo && x.tipo in TIPOS ? x.tipo : "visita",
    servico: x.servico && x.servico in SERVICOS ? x.servico : "ambos",
    data: String(x.data),
    hora: String(x.hora),
    duracao: typeof x.duracao === "number" && x.duracao > 0 ? x.duracao : 30,
    local: String(x.local ?? ""),
    obs: String(x.obs ?? ""),
    prioridade: x.prioridade && x.prioridade in PRIORIDADES ? x.prioridade : "media",
    status: x.status && x.status in STATUS_COMPROMISSO ? x.status : "agendado",
    resultado: x.resultado && x.resultado in RESULTADOS ? x.resultado : null,
    historico: Array.isArray(x.historico) ? x.historico : [],
    avisos: x.avisos && typeof x.avisos === "object" ? x.avisos : {},
    criado: String(x.criado ?? ""),
    ...(x.exemplo ? { exemplo: true } : {}),
    ...(x.apagado ? { apagado: true } : {}),
  };
}

/* Datas ---------------------------------------------------------------------------------------- */

const RELOGIO_SP = new Intl.DateTimeFormat("en-US", {
  timeZone: "America/Sao_Paulo",
  year: "numeric",
  month: "numeric",
  day: "numeric",
  hour: "numeric",
  minute: "numeric",
  second: "numeric",
  hourCycle: "h23",
});
/**
 * Agora no horário de Brasília, como um Date "de parede": os campos locais (getHours…) são os de
 * São Paulo, qualquer que seja o fuso do aparelho. Os horários marcados também são de parede.
 */
export function agoraSP(base = new Date()) {
  const p = Object.fromEntries(RELOGIO_SP.formatToParts(base).map((x) => [x.type, Number(x.value)]));
  return new Date(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
}

const dois = (n: number) => String(n).padStart(2, "0");
export const chaveDia = (d: Date) => `${d.getFullYear()}-${dois(d.getMonth() + 1)}-${dois(d.getDate())}`;
export const horaDe = (d: Date) => `${dois(d.getHours())}:${dois(d.getMinutes())}`;
export const diaDaChave = (k: string) => {
  const [a, m, d] = k.split("-").map(Number);
  return new Date(a, m - 1, d);
};
export const somarDias = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
export const minutosDe = (hora: string) => {
  const [h, m] = hora.split(":").map(Number);
  return h * 60 + m;
};
export const horaDosMinutos = (min: number) => `${dois(Math.floor(min / 60))}:${dois(min % 60)}`;
export const inicioDe = (c: Pick<Compromisso, "data" | "hora">) => {
  const d = diaDaChave(c.data);
  const m = minutosDe(c.hora);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), Math.floor(m / 60), m % 60);
};
export const fimDe = (c: Pick<Compromisso, "data" | "hora" | "duracao">) =>
  new Date(inicioDe(c).getTime() + c.duracao * 60_000);

/** Segunda-feira da semana do dia (a semana da agenda começa na segunda). */
export const segundaDa = (d: Date) => somarDias(d, -((d.getDay() + 6) % 7));

export const SEMANA_CURTA = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];
export const SEMANA_LONGA = ["domingo", "segunda-feira", "terça-feira", "quarta-feira", "quinta-feira", "sexta-feira", "sábado"];
const SEMANA_FALA = ["no domingo", "na segunda", "na terça", "na quarta", "na quinta", "na sexta", "no sábado"];

/** 24/11/2026 */
export const dataBr = (k: string) => k.split("-").reverse().join("/");
/** 24/11 */
export const dataCurta = (k: string) => k.slice(8, 10) + "/" + k.slice(5, 7);
/** "hoje", "amanhã" ou "terça, 24/11" */
export function diaFalado(k: string, agora = agoraSP()) {
  if (k === chaveDia(agora)) return "hoje";
  if (k === chaveDia(somarDias(agora, 1))) return "amanhã";
  return `${SEMANA_CURTA[diaDaChave(k).getDay()]}, ${dataCurta(k)}`;
}

/** "em 40 min", "em 2 h 10", "agora", "há 15 min" */
export function falta(alvo: Date, agora = agoraSP()) {
  const min = Math.round((alvo.getTime() - agora.getTime()) / 60_000);
  if (Math.abs(min) < 1) return "agora";
  const abs = Math.abs(min);
  const texto =
    abs < 60 ? `${abs} min` : abs < 24 * 60 ? `${Math.floor(abs / 60)} h${abs % 60 ? ` ${dois(abs % 60)}` : ""}` : `${Math.round(abs / 1440)} dia${abs >= 2880 ? "s" : ""}`;
  return min > 0 ? `em ${texto}` : `há ${texto}`;
}

/* Choques e horários livres --------------------------------------------------------------------- */

/** Ocupa a agenda: o que ainda vai acontecer (ou aconteceu) de fato. */
export const ocupa = (c: Compromisso) =>
  !c.apagado && !c.legado && (c.status === "agendado" || c.status === "confirmado" || c.status === "realizado");

/** Compromissos que batem com este (contando a folga de deslocamento antes e depois). */
export function conflitos(
  novo: Pick<Compromisso, "id" | "data" | "hora" | "duracao">,
  todos: Compromisso[],
  intervalo: number,
) {
  const ini = inicioDe(novo).getTime() - intervalo * 60_000;
  const fim = fimDe(novo).getTime() + intervalo * 60_000;
  return todos.filter(
    (c) => c.id !== novo.id && ocupa(c) && c.data === novo.data && inicioDe(c).getTime() < fim && fimDe(c).getTime() > ini,
  );
}

/** Horários (de 15 em 15 min) em que cabe um compromisso dessa duração no dia, sem choque e sem passado. */
export function horariosLivres(
  data: string,
  duracao: number,
  todos: Compromisso[],
  cfg: ConfigAgenda,
  ignorarId = "",
  agora = agoraSP(),
) {
  const livres: string[] = [];
  for (let m = cfg.inicio * 60; m + duracao <= cfg.fim * 60; m += 15) {
    const hora = horaDosMinutos(m);
    const teste = { id: ignorarId, data, hora, duracao };
    if (inicioDe(teste) < agora) continue;
    if (conflitos(teste, todos, cfg.intervalo).length === 0) livres.push(hora);
  }
  return livres;
}

/** Primeiro horário livre a partir do pedido (no mesmo dia ou nos próximos dias de atendimento). */
export function proximoLivre(
  pedido: Pick<Compromisso, "id" | "data" | "hora" | "duracao">,
  todos: Compromisso[],
  cfg: ConfigAgenda,
  agora = agoraSP(),
) {
  let dia = diaDaChave(pedido.data);
  for (let i = 0; i < 21; i++, dia = somarDias(dia, 1)) {
    if (i > 0 && !cfg.dias.includes(dia.getDay())) continue;
    const k = chaveDia(dia);
    const livres = horariosLivres(k, pedido.duracao, todos, cfg, pedido.id, agora);
    const hora = i === 0 ? livres.find((h) => h >= pedido.hora) : livres[0];
    if (hora) return { data: k, hora };
  }
  return null;
}

/** "na segunda (23/11) ou na terça (24/11)": os próximos dias de atendimento com horário livre. */
export function diasSugeridos(todos: Compromisso[], cfg: ConfigAgenda, agora = agoraSP(), quantos = 2) {
  const dias: string[] = [];
  for (let i = 1; i <= 21 && dias.length < quantos; i++) {
    const d = somarDias(agora, i);
    if (!cfg.dias.includes(d.getDay())) continue;
    const k = chaveDia(d);
    if (horariosLivres(k, cfg.duracao, todos, cfg, "", agora).length) dias.push(`${SEMANA_FALA[d.getDay()]} (${dataCurta(k)})`);
  }
  return dias.length ? dias.join(" ou ") : "nos próximos dias";
}

/* Mensagens ------------------------------------------------------------------------------------- */

/** Primeiro nome de quem atende: o dono (quando o CNPJ trouxe) ou o nome da loja. */
const nomeDaConversa = (lead: Lead) => lead.dono?.nome || lead.nome;

/** A loja do compromisso; para cliente fora do painel, uma loja montada com o que foi digitado. */
export function leadDo(c: Compromisso, porId: Map<string, Lead>): Lead | null {
  const lead = c.leadId ? porId.get(c.leadId) : undefined;
  if (lead) return lead;
  if (!c.cliente) return null;
  return {
    id: `cliente-${c.id}`,
    nome: c.cliente.nome,
    whatsapp: c.cliente.whatsapp,
    ...(c.cliente.endereco ? { endereco: c.cliente.endereco } : {}),
    nota: null,
    avaliacoes: null,
  };
}

export function preencherModelo(
  texto: string,
  lead: Lead,
  c: Partial<Compromisso> | null,
  extra: { diasSugeridos?: string; novaData?: string; novaHora?: string } = {},
) {
  const data = c?.data ?? "";
  const local =
    c?.tipo === "online"
      ? c.local
        ? `pelo link ${c.local}`
        : "online"
      : c?.tipo === "ligacao"
        ? "por ligação"
        : c?.local
          ? `no ${c.local}`
          : "aí na loja";
  return texto
    .replaceAll("[nome]", nomeDaConversa(lead))
    .replaceAll("[dia da semana]", data ? SEMANA_LONGA[diaDaChave(data).getDay()] : "")
    .replaceAll("[data]", data ? dataBr(data) : "")
    .replaceAll("[hora]", c?.hora ?? "")
    .replaceAll("[local]", local)
    .replaceAll("[serviço]", c?.servico ? SERVICOS[c.servico].replace("Placa NFC", "a placa de avaliação").replace("Site", "o site") : "o site e a placa de avaliação")
    .replaceAll("[dias sugeridos]", extra.diasSugeridos ?? "nos próximos dias")
    .replaceAll("[nova data]", extra.novaData ? dataBr(extra.novaData) : data ? dataBr(data) : "")
    .replaceAll("[nova hora]", extra.novaHora ?? c?.hora ?? "")
    .replace(/[ ,]+\./g, ".")
    .replace(/ {2,}/g, " ");
}

/* Painel "Hoje" --------------------------------------------------------------------------------- */

const vivo = (c: Compromisso) => !c.apagado && (c.status === "agendado" || c.status === "confirmado");

/** Combinados antigos (`lead.compromisso`) aparecem na agenda como itens de retorno. */
export function combinadosAntigos(leads: Lead[], cfg: ConfigAgenda): Compromisso[] {
  return leads.flatMap((lead) => {
    const q = lead.compromisso?.quando;
    if (!q || !/^\d{4}-\d{2}-\d{2}/.test(q)) return [];
    const temHora = /T\d{2}:\d{2}/.test(q);
    return [
      {
        id: `legado-${lead.id}`,
        leadId: lead.id,
        tipo: "retorno" as const,
        servico: "ambos" as const,
        data: q.slice(0, 10),
        hora: temHora ? q.slice(11, 16) : horaDosMinutos(cfg.inicio * 60),
        duracao: 30,
        local: "",
        obs: lead.compromisso?.oque ?? "",
        prioridade: "media" as const,
        status: "agendado" as const,
        historico: [],
        avisos: {},
        criado: "",
        legado: true,
        ...(temHora ? {} : { semHora: true }),
      },
    ];
  });
}

export function deHoje(todos: Compromisso[], agora = agoraSP()) {
  const k = chaveDia(agora);
  return todos.filter((c) => !c.apagado && c.data === k && c.status !== "cancelado").sort(porHorario);
}

export const porHorario = (a: Compromisso, b: Compromisso) =>
  a.data === b.data ? a.hora.localeCompare(b.hora) : a.data.localeCompare(b.data);

/** O próximo que ainda vai acontecer (ou que está atrasado há menos de 2 h, para avisar o atraso). */
export function proximo(todos: Compromisso[], agora = agoraSP()) {
  const limite = agora.getTime() - 2 * 3_600_000;
  return (
    todos
      .filter((c) => vivo(c) && !c.semHora && fimDe(c).getTime() > limite)
      .sort(porHorario)
      .find((c) => fimDe(c).getTime() > agora.getTime() || inicioDe(c).getTime() > limite) ?? null
  );
}

/** Lembretes a mandar: compromissos dentro da janela do maior lembrete que ainda não receberam lembrete. */
export function lembretesParaEnviar(todos: Compromisso[], cfg: ConfigAgenda, agora = agoraSP()) {
  const janela = Math.max(...cfg.lembretes) * 60_000;
  return todos
    .filter((c) => vivo(c) && !c.legado && !c.avisos.lembrete && !c.avisos.confirmacao)
    .filter((c) => {
      const t = inicioDe(c).getTime() - agora.getTime();
      return t > 0 && t <= janela;
    })
    .sort(porHorario);
}

/** Lojas que responderam ou pediram pra falar depois e não têm nada marcado pra frente. */
export function precisamDeRetorno(leads: Lead[], todos: Compromisso[], agora = agoraSP()) {
  const comFuturo = new Set(
    todos.filter((c) => vivo(c) && inicioDe(c).getTime() >= agora.getTime() - 3_600_000).map((c) => c.leadId),
  );
  const remarcados = new Set(todos.filter((c) => !c.apagado && c.status === "remarcado").map((c) => c.leadId));
  return leads.filter(
    (l) =>
      !comFuturo.has(l.id) &&
      (remarcados.has(l.id) || statusDe(l) === "respondeu" || statusDe(l) === "depois"),
  );
}

/** Contagens da semana (segunda a domingo) e o comparecimento das reuniões que já passaram. */
export function semanaEmNumeros(todos: Compromisso[], agora = agoraSP()) {
  const ini = chaveDia(segundaDa(agora));
  const fim = chaveDia(somarDias(segundaDa(agora), 6));
  const daSemana = todos.filter((c) => !c.apagado && !c.legado && c.data >= ini && c.data <= fim);
  const n = (s: StatusCompromisso) => daSemana.filter((c) => c.status === s).length;
  const realizados = n("realizado");
  const faltas = n("faltou");
  return {
    agendados: n("agendado"),
    confirmados: n("confirmado"),
    realizados,
    cancelados: n("cancelado") + faltas,
    comparecimento: realizados + faltas ? Math.round((realizados / (realizados + faltas)) * 100) : null,
  };
}

export const novoId = () => `c${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

/* Exemplos -------------------------------------------------------------------------------------- */

/** Cinco horários de mentira nesta semana, para ver a agenda funcionando (sem telefone inventado). */
export function exemplos(cfg: ConfigAgenda, agora = agoraSP()): Compromisso[] {
  const base: [string, TipoCompromisso, ServicoCompromisso, string, number][] = [
    ["Floricultura (exemplo)", "visita", "placa", "09:30", 30],
    ["Estética automotiva (exemplo)", "proposta", "site", "11:00", 45],
    ["Loja de móveis (exemplo)", "online", "ambos", "14:00", 30],
    ["Hamburgueria (exemplo)", "visita", "placa", "16:30", 30],
    ["Barbearia (exemplo)", "ligacao", "site", "10:00", 15],
  ];
  const dias: string[] = [];
  for (let i = 0; dias.length < base.length && i < 21; i++) {
    const d = somarDias(agora, i);
    if (cfg.dias.includes(d.getDay())) dias.push(chaveDia(d));
  }
  const criado = new Date().toISOString();
  return base.map(([nome, tipo, servico, hora, duracao], i) => ({
    id: `exemplo-${i + 1}`,
    leadId: "",
    cliente: { nome, whatsapp: "" },
    tipo,
    servico,
    data: dias[Math.floor(i / 2)] ?? dias[0],
    hora,
    duracao,
    local: tipo === "visita" ? "Centro, Casimiro de Abreu" : "",
    obs: "Exemplo: apague quando quiser.",
    prioridade: i === 0 ? "alta" : "media",
    status: i === 1 ? "confirmado" : "agendado",
    historico: [],
    avisos: {},
    criado,
    exemplo: true,
  }));
}

/* Quando as lojas respondem ----------------------------------------------------------------------- */

export const FAIXAS = [
  { nome: "8h–10h", de: 8, ate: 10 },
  { nome: "10h–12h", de: 10, ate: 12 },
  { nome: "12h–14h", de: 12, ate: 14 },
  { nome: "14h–16h", de: 14, ate: 16 },
  { nome: "16h–18h", de: 16, ate: 18 },
  { nome: "18h–20h", de: 18, ate: 20 },
  { nome: "Noite", de: 20, ate: 32 },
];
const faixaDe = (h: number) => FAIXAS.findIndex((f) => (h < 8 ? h + 24 : h) >= f.de && (h < 8 ? h + 24 : h) < f.ate);

export interface Balde {
  nome: string;
  envios: number;
  respostas: number;
}

/** Primeira mensagem de cada loja (por dia da semana e por faixa de horário) e quantas responderam. */
export function quandoRespondem(leads: Lead[]) {
  const porDia: Balde[] = [1, 2, 3, 4, 5, 6, 0].map((d) => ({ nome: SEMANA_CURTA[d], envios: 0, respostas: 0 }));
  const porHora: Balde[] = FAIXAS.map((f) => ({ nome: f.nome, envios: 0, respostas: 0 }));
  let total = 0;
  for (const lead of leads) {
    const datas = [lead.enviadoEm, ...ENVIOS.map((e) => lead.enviados?.[e])]
      .filter((x): x is string => Boolean(x))
      .map((x) => new Date(x))
      .filter((d) => Number.isFinite(d.getTime()));
    if (!datas.length) continue;
    const primeira = agoraSP(new Date(Math.min(...datas.map((d) => d.getTime()))));
    const s = statusDe(lead);
    const respondeu = s === "respondeu" || s === "fechou" || s === "depois" || s === "nao";
    const dia = porDia[(primeira.getDay() + 6) % 7];
    const faixa = porHora[faixaDe(primeira.getHours())];
    for (const b of [dia, faixa]) {
      b.envios += 1;
      if (respondeu) b.respostas += 1;
    }
    total += 1;
  }
  // Só aponta o melhor quando a amostra dá pra confiar (pelo menos 15 mensagens no balde).
  const melhor = (lista: Balde[]) =>
    lista
      .filter((b) => b.envios >= 15)
      .sort((a, b) => b.respostas / b.envios - a.respostas / a.envios)[0] ?? null;
  return { porDia, porHora, total, melhorDia: melhor(porDia), melhorHora: melhor(porHora) };
}

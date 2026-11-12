export type Status = "novo" | "enviado" | "respondeu" | "fechou" | "depois" | "nao";
export type Escopo = "todos" | "casimiro" | "fora";

export interface Lead {
  id: string;
  nome: string;
  tipo?: string;
  cidade?: string;
  whatsapp: string;
  telefone?: string;
  nota?: number | null;
  avaliacoes?: number | null;
  link?: string;
  status?: string;
  enviadoEm?: string;
  atualizado?: string;
  obs?: string;
}

export const STATUS: Record<
  Status,
  { label: string; plural: string; curto: string; ink: string; soft: string }
> = {
  novo: {
    label: "A enviar",
    plural: "A enviar",
    curto: "A enviar",
    ink: "var(--bjork-text-medium)",
    soft: "var(--bjork-surface-active)",
  },
  enviado: {
    label: "Enviado",
    plural: "Enviados",
    curto: "Enviado",
    ink: "var(--blk-warning)",
    soft: "var(--blk-warning-soft)",
  },
  respondeu: {
    label: "Respondeu",
    plural: "Responderam",
    curto: "Respondeu",
    ink: "var(--blk-accent-ink)",
    soft: "var(--bjork-accent-soft)",
  },
  fechou: {
    label: "Fechou",
    plural: "Fecharam",
    curto: "Fechou",
    ink: "var(--blk-success)",
    soft: "var(--blk-success-soft)",
  },
  depois: {
    label: "Mais pra frente",
    plural: "Mais pra frente",
    curto: "Depois",
    ink: "var(--bjork-text-muted)",
    soft: "var(--bjork-surface-active)",
  },
  nao: {
    label: "Não quer",
    plural: "Não querem",
    curto: "Não quer",
    ink: "var(--blk-error)",
    soft: "var(--blk-error-soft)",
  },
};

export const STATUS_ORDEM = Object.keys(STATUS) as Status[];

export const META_DIA = 15;

export const TPL_PADRAO =
  "Oi, tudo bem? Aqui é o Brenno, da BN Digital, da região.\nVi a {nome} no Google Maps ({avaliacoes} avaliações, parabéns!) e notei que vocês ainda não têm um site próprio.\nEu faço sites simples para comércio local: abre rápido no celular, tem botão direto para o WhatsApp e ajuda a aparecer no Google.\nPosso te mandar um exemplo de como ficaria o da {nome}? Se não fizer sentido agora, sem problema, é só me avisar.";

export function statusDe(lead: Lead): Status {
  return lead.status && lead.status in STATUS ? (lead.status as Status) : "novo";
}

export const ehCasimiro = (lead: Lead) => /casimiro/i.test(lead.cidade ?? "");

export function noEscopo(leads: Lead[], escopo: Escopo) {
  if (escopo === "todos") return leads;
  return leads.filter((lead) => ehCasimiro(lead) === (escopo === "casimiro"));
}

export function contar(leads: Lead[]) {
  const n = Object.fromEntries(STATUS_ORDEM.map((s) => [s, 0])) as Record<Status, number>;
  for (const lead of leads) n[statusDe(lead)] += 1;
  return n;
}

export function enviadosHoje(leads: Lead[], agora = new Date()) {
  const hoje = agora.toDateString();
  return leads.filter((l) => l.enviadoEm && new Date(l.enviadoEm).toDateString() === hoje).length;
}

/* Mensagens ---------------------------------------------------------------------------------- */

export function textoMensagem(tpl: string, lead: Lead) {
  return tpl
    .replaceAll("{nome}", lead.nome || "sua empresa")
    .replaceAll("{avaliacoes}", lead.avaliacoes != null ? String(lead.avaliacoes) : "várias");
}

export function linkWhatsApp(lead: Lead, texto: string) {
  const numero = String(lead.whatsapp ?? "").replace(/\D/g, "");
  return `https://wa.me/${numero}?text=${encodeURIComponent(texto)}`;
}

const SITES = "https://oliveirabrennobjj-beep.github.io/Meu-site/";

// Só sites já publicados no GitHub Pages (ver .github/workflows/publicar-bn-digital.yml).
function exemploSite(tipo = "") {
  return /aça|sorvet|padar|latic|café|pizz|restaur|lanch|hamb|horti|merc|frut/i.test(tipo)
    ? `${SITES}acai-do-rei/`
    : SITES;
}

export function textoExemplo(lead: Lead) {
  return `Olha um site que fiz para um negócio parecido: ${exemploSite(lead.tipo)}\nO da ${lead.nome} fica nesse nível, com as fotos e o cardápio de vocês. Quer que eu monte uma prévia?`;
}

export const linkSeguro = (url?: string) => (url && /^https?:\/\//i.test(url) ? url : null);

/* Números ------------------------------------------------------------------------------------ */

const NOTA = new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const INTEIRO = new Intl.NumberFormat("pt-BR");

export const fmtNota = (nota: number | null | undefined) => (nota == null ? "—" : NOTA.format(nota));
export const fmtInt = (n: number | null | undefined) => (n == null ? "—" : INTEIRO.format(n));
export const fmtPct = (parte: number, total: number) =>
  total > 0 ? `${Math.round((parte / total) * 100)}%` : "0%";

export function mediaNota(leads: Lead[]) {
  const notas = leads.map((l) => l.nota).filter((n): n is number => typeof n === "number");
  return notas.length ? notas.reduce((a, b) => a + b, 0) / notas.length : null;
}

export interface PontoNota {
  nota: number;
  /** Parte do grupo (0–100) com essa nota. */
  pctA: number;
  pctB: number;
  qtdA: number;
  qtdB: number;
}

/** Quantos comércios de cada grupo têm cada nota, em passos de 0,1, de 4,0 (ou menos) até 5,0. */
export function distribuicaoNotas(grupoA: Lead[], grupoB: Lead[]): PontoNota[] {
  const decimos = (leads: Lead[]) =>
    leads
      .map((l) => l.nota)
      .filter((n): n is number => typeof n === "number")
      .map((n) => Math.round(n * 10));
  const a = decimos(grupoA);
  const b = decimos(grupoB);
  if (a.length + b.length === 0) return [];
  const inicio = Math.min(40, ...a, ...b);
  const pontos: PontoNota[] = [];
  for (let d = inicio; d <= 50; d += 1) {
    const qtdA = a.filter((n) => n === d).length;
    const qtdB = b.filter((n) => n === d).length;
    pontos.push({
      nota: d / 10,
      qtdA,
      qtdB,
      pctA: a.length ? (qtdA / a.length) * 100 : 0,
      pctB: b.length ? (qtdB / b.length) * 100 : 0,
    });
  }
  return pontos;
}

export function porTipo(leads: Lead[], limite = 5) {
  const mapa = new Map<string, number>();
  for (const lead of leads) {
    const tipo = lead.tipo?.trim() || "Sem tipo";
    mapa.set(tipo, (mapa.get(tipo) ?? 0) + 1);
  }
  const linhas: { label: string; value: number; muted?: boolean }[] = [...mapa]
    .map(([label, value]) => ({ label, value }))
    .sort((x, y) => y.value - x.value || x.label.localeCompare(y.label, "pt-BR"));
  if (linhas.length <= limite + 1) return linhas;
  const resto = linhas.slice(limite).reduce((soma, linha) => soma + linha.value, 0);
  return [...linhas.slice(0, limite), { label: "Outros", value: resto, muted: true }];
}

/* Importação --------------------------------------------------------------------------------- */

export type LeadNovo = Omit<Lead, "id"> & { criado: string };

/** Lê a lista JSON da pesquisa diária e devolve só empresas válidas e ainda não cadastradas. */
export function lerImportacao(texto: string, existentes: Iterable<string>): LeadNovo[] {
  let lista: unknown;
  try {
    lista = JSON.parse(texto);
  } catch {
    throw new Error("Isso não é uma lista JSON válida. Copie de novo o bloco que o resumo diário manda.");
  }
  if (!Array.isArray(lista)) {
    throw new Error("A lista precisa começar com [ e terminar com ].");
  }
  const vistos = new Set(existentes);
  const novos: LeadNovo[] = [];
  const agora = new Date().toISOString();
  for (const item of lista) {
    if (!item || typeof item !== "object") continue;
    const x = item as Record<string, unknown>;
    const whatsapp = String(x.whatsapp ?? "").replace(/\D/g, "");
    if (!x.nome || whatsapp.length < 12 || vistos.has(whatsapp)) continue;
    vistos.add(whatsapp);
    novos.push({
      nome: String(x.nome),
      tipo: String(x.tipo ?? ""),
      cidade: String(x.cidade ?? ""),
      whatsapp,
      telefone: String(x.telefone ?? ""),
      nota: typeof x.nota === "number" ? x.nota : null,
      avaliacoes: typeof x.avaliacoes === "number" ? x.avaliacoes : null,
      link: String(x.link ?? ""),
      status: "novo",
      criado: agora,
    });
  }
  return novos;
}

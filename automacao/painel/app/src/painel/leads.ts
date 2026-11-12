export type Status = "novo" | "enviado" | "respondeu" | "fechou" | "depois" | "nao";
export type Escopo = "todos" | "casimiro" | "fora";
export type Produto = "site" | "placa";

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
  /** O que foi oferecido no primeiro contato. */
  produto?: string;
  /** Por onde foi o primeiro contato. */
  canal?: "whatsapp" | "pessoal";
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

export function statusDe(lead: Lead): Status {
  return lead.status && lead.status in STATUS ? (lead.status as Status) : "novo";
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

/* Lugar ---------------------------------------------------------------------------------------- */

const CASIMIRO = "Casimiro de Abreu";
const BARRA = "Barra de São João";
const EM_BARRA = /barra de s[aã]o jo[aã]o/i;

// Barra de São João é distrito de Casimiro, mas fica longe do centro: para o Brenno conta como fora.
const emBarra = (lead: Lead) => EM_BARRA.test(lead.cidade ?? "") || EM_BARRA.test(lead.nome);

/** Comércio do centro de Casimiro, onde dá para ir falar com o dono pessoalmente. */
export const ehCasimiro = (lead: Lead) => /casimiro/i.test(lead.cidade ?? "") && !emBarra(lead);

export const cidadeDe = (lead: Lead) =>
  emBarra(lead) ? BARRA : ehCasimiro(lead) ? CASIMIRO : lead.cidade?.trim() || "Sem cidade";

export function noEscopo(leads: Lead[], escopo: Escopo) {
  if (escopo === "todos") return leads;
  return leads.filter((lead) => ehCasimiro(lead) === (escopo === "casimiro"));
}

// Da mais perto de Casimiro para a mais longe; cidade nova entra no fim, em ordem alfabética.
const ORDEM_CIDADES = [CASIMIRO, BARRA, "Rio das Ostras", "Macaé"];

export function porCidade(leads: Lead[]) {
  const mapa = new Map<string, Lead[]>();
  for (const lead of leads) {
    const cidade = cidadeDe(lead);
    mapa.set(cidade, [...(mapa.get(cidade) ?? []), lead]);
  }
  const posicao = (cidade: string) => {
    const i = ORDEM_CIDADES.indexOf(cidade);
    return i === -1 ? ORDEM_CIDADES.length : i;
  };
  return [...mapa]
    .map(([cidade, doGrupo]) => ({ cidade, leads: doGrupo, casimiro: cidade === CASIMIRO }))
    .sort((a, b) => posicao(a.cidade) - posicao(b.cidade) || a.cidade.localeCompare(b.cidade, "pt-BR"));
}

/* Nicho ---------------------------------------------------------------------------------------- */

// O Google Maps dá nomes diferentes para o mesmo nicho; aqui eles viram um só.
const MESMO_NICHO: Record<string, string> = { café: "Cafeteria", "delivery de pizza": "Pizzaria" };

export function tipoDe(lead: Lead) {
  const tipo = lead.tipo?.trim() || "Sem tipo";
  return MESMO_NICHO[tipo.toLowerCase()] ?? tipo;
}

/** Todos os nichos da lista, do que tem mais comércios para o que tem menos. */
export function porTipo(leads: Lead[]) {
  const mapa = new Map<string, number>();
  for (const lead of leads) mapa.set(tipoDe(lead), (mapa.get(tipoDe(lead)) ?? 0) + 1);
  return [...mapa]
    .map(([label, value]) => ({ label, value }))
    .sort((x, y) => y.value - x.value || x.label.localeCompare(y.label, "pt-BR"));
}

type Ramo = "comida" | "padaria" | "beleza" | "pet" | "geral";

function ramoDe(tipo = ""): Ramo {
  if (/pizz|hamb|lanch|restaur|aça|sorvet/i.test(tipo)) return "comida";
  if (/padar|caf[eé]|latic|confeit/i.test(tipo)) return "padaria";
  if (/barb|sal[aã]o|beleza|est[eé]tic/i.test(tipo)) return "beleza";
  if (/pet|veterin/i.test(tipo)) return "pet";
  return "geral";
}

const NO_SITE: Record<Ramo, string> = {
  comida: "o cardápio com fotos e um botão que já abre o pedido no WhatsApp",
  padaria: "os produtos, o horário e um botão para encomendar pelo WhatsApp",
  beleza: "os serviços com foto, os horários e um botão para marcar pelo WhatsApp",
  pet: "os serviços, os horários e um botão para agendar pelo WhatsApp",
  geral: "o que vocês vendem, o horário, o mapa e um botão que já abre o WhatsApp",
};

const NA_PLACA: Record<Ramo, string> = {
  comida: "O cliente encosta o celular nela enquanto espera o pedido e avalia vocês no Google em 10 segundos.",
  padaria: "O cliente encosta o celular nela no caixa e avalia vocês no Google em 10 segundos.",
  beleza: "O cliente encosta o celular nela ainda na cadeira e avalia vocês no Google em 10 segundos.",
  pet: "O cliente encosta o celular nela quando busca o bichinho e avalia vocês no Google em 10 segundos.",
  geral: "O cliente encosta o celular nela e avalia vocês no Google em 10 segundos.",
};

/** Frase da mensagem que muda conforme o ramo do comércio e o que está sendo oferecido. */
export function fraseNicho(lead: Lead, produto: Produto) {
  const ramo = ramoDe(lead.tipo);
  if (produto === "placa") return NA_PLACA[ramo];
  const tipo = lead.tipo?.trim();
  return tipo && ramo !== "geral"
    ? `Para ${tipo.toLowerCase()}, eu coloco ${NO_SITE[ramo]}.`
    : `Eu coloco ${NO_SITE.geral}.`;
}

/* Mensagens ------------------------------------------------------------------------------------ */

export type ChaveTexto = "fora" | "casimiroPlaca" | "casimiroSite";
export type Textos = Record<ChaveTexto, string>;

export const TEXTOS_INFO: Record<ChaveTexto, { curto: string; longo: string }> = {
  fora: { curto: "FORA · SITE", longo: "Fora de Casimiro, oferta de site" },
  casimiroPlaca: { curto: "CASIMIRO · PLACA", longo: "Casimiro, oferta de placa" },
  casimiroSite: { curto: "CASIMIRO · SITE", longo: "Casimiro, oferta de site" },
};

// Nenhum texto fala de preço: o Brenno só passa valor depois que a pessoa mostra interesse.
export const TEXTOS_PADRAO: Textos = {
  fora: "Oi, tudo bem? Aqui é o Brenno, da BN Digital. Sou de Casimiro de Abreu, pertinho de {cidade}.\nVi a {nome} no Google Maps{elogio} e notei que vocês ainda não têm um site próprio.\n{nicho}\nPosso te mandar um exemplo de como ficaria o da {nome}? Se não fizer sentido agora, sem problema, é só me avisar.",
  casimiroPlaca:
    "Oi, tudo bem? Aqui é o Brenno, da BN Digital. Sou daqui de Casimiro mesmo.\nFaço uma plaquinha com chip para deixar no balcão. {nicho}\nMais avaliação é mais gente achando a {nome} quando procura por perto.\nPosso passar aí para mostrar funcionando? Leva 2 minutos. Se der, queria falar direto com o dono ou a dona. Qual o melhor horário?",
  casimiroSite:
    "Oi, tudo bem? Aqui é o Brenno, da BN Digital. Sou daqui de Casimiro mesmo.\nVi a {nome} no Google Maps{elogio} e notei que vocês ainda não têm um site próprio.\n{nicho}\nPosso passar aí para mostrar um exemplo no celular? Leva 2 minutos. Se der, queria falar direto com o dono ou a dona. Qual o melhor horário?",
};

/** Em Casimiro, placa para quem ainda tem poucas avaliações (é quem mais ganha com ela); senão, site. */
export function produtoSugerido(lead: Lead): Produto {
  if (!ehCasimiro(lead)) return "site";
  return lead.avaliacoes == null || lead.avaliacoes < 50 ? "placa" : "site";
}

export function chaveTexto(lead: Lead, produto: Produto): ChaveTexto {
  if (!ehCasimiro(lead)) return "fora";
  return produto === "placa" ? "casimiroPlaca" : "casimiroSite";
}

const ELOGIO_A_PARTIR_DE = 30;

export function textoMensagem(textos: Textos, lead: Lead, produto: Produto) {
  const chave = chaveTexto(lead, produto);
  const elogio =
    lead.avaliacoes != null && lead.avaliacoes >= ELOGIO_A_PARTIR_DE
      ? ` (${lead.avaliacoes} avaliações, parabéns!)`
      : "";
  return (textos[chave]?.trim() || TEXTOS_PADRAO[chave])
    .replaceAll("{nome}", lead.nome || "sua empresa")
    .replaceAll("{cidade}", cidadeDe(lead))
    .replaceAll("{nicho}", fraseNicho(lead, chave === "casimiroPlaca" ? "placa" : "site"))
    .replaceAll("{elogio}", elogio)
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

/* Números -------------------------------------------------------------------------------------- */

const NOTA = new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const INTEIRO = new Intl.NumberFormat("pt-BR");

export const fmtNota = (nota: number | null | undefined) => (nota == null ? "—" : NOTA.format(nota));
export const fmtInt = (n: number | null | undefined) => (n == null ? "—" : INTEIRO.format(n));
export const fmtPct = (parte: number, total: number) =>
  total > 0 ? `${Math.round((parte / total) * 100)}%` : "0%";

/* Importação ----------------------------------------------------------------------------------- */

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

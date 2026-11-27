export type Status = "novo" | "enviado" | "respondeu" | "fechou" | "depois" | "nao";
export type Escopo = "todos" | "casimiro" | "fora";
export type Produto = "site" | "placa";
/** Cada mensagem que fica registrada na loja: as ofertas (site, placa, horário marcado) e o pedido para falar com o dono. */
export type Envio = Produto | "agenda" | "dono";

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
  /** O que foi oferecido no contato mais recente. */
  produto?: string;
  /** O Brenno marcou que dá para ir pessoalmente (só lojas do centro de Casimiro). */
  visita?: boolean;
  /** Mandou uma mensagem que pedia visita (registrado a partir de 13/11/2026). */
  pediuVisita?: boolean;
  /** Quando mandou a correção avisando que a conversa segue pelo WhatsApp. */
  corrigidoEm?: string;
  /** Próximo passo combinado com a loja (ver assistente.ts); null quando já foi feito. */
  compromisso?: { quando: string; oque: string } | null;
  /** O que o Brenno anotou, do mais antigo ao mais novo. */
  historico?: { em: string; texto: string }[];
  /** Quando cada oferta foi feita; a mesma loja pode receber site e placa. */
  enviados?: Partial<Record<Envio, string>>;
  /** Por onde foi o primeiro contato. */
  canal?: "whatsapp" | "pessoal";
  /** Ramo que o Brenno escolheu na ficha (id de RAMOS); vale mais que o tipo vindo do Google. */
  ramo?: string;
  /** Sub-nicho escolhido na prévia: id de SUBNICHOS, "" para usar o estilo geral do ramo, null/ausente para detectar sozinho. */
  subnicho?: string | null;
  /** Foto principal da ficha da loja no Google Maps (lh3.googleusercontent.com, sem o sufixo de tamanho). */
  foto?: string;
  /** Loja tirada da lista porque não dá para falar com ela; null quando o Brenno traz de volta. */
  tirada?: { motivo: MotivoTirada; em: string } | null;
  /** Outro celular que o Google mostra para a loja, para tentar quando o principal não dá certo. */
  outroWhatsapp?: string;
  /** Quando a loja entrou no painel (pesquisa diária ou importação). */
  criado?: string;
  /** Endereço da ficha do Google Maps (rua, bairro, cidade). */
  endereco?: string;
  /** Link da ficha exata da loja no Google Maps. */
  maps?: string;
  /** De onde veio a loja (Google Maps, Instagram…). */
  fonte?: string;
  /**
   * Conferência do número na página pública do WhatsApp Business: `nome` é o nome da conta ("" quando
   * o número não tem WhatsApp Business) e `confere` diz se esse nome bate com o da loja.
   */
  zap?: { nome: string; confere: boolean; em: string };
  /**
   * Dono achado no cadastro público do CNPJ (dados abertos da Receita): primeiro nome (só de empresário
   * individual/MEI), celular do cadastro quando é outro número e `mesmo` quando o WhatsApp da loja já é o dele.
   */
  dono?: { nome?: string; whatsapp?: string; mesmo?: boolean; em: string };
  /** Para quem foi a última mensagem quando a loja tem o celular do dono. */
  enviadoPara?: "dono" | "loja";
  /** Quando a situação virou "respondeu" pela primeira vez (para saber em que dia e hora respondem). */
  respostaEm?: string;
  /** Número certo que o Brenno achou (Instagram, cliente) quando o do Google estava errado; vale para todo envio. */
  whatsappCerto?: string | null;
  /** O WhatsApp da loja é um dos telefones do CNPJ dela (cadastro público da Receita). */
  telNoCnpj?: boolean;
  /** WhatsApp que a própria loja publica no perfil do Instagram (pode ser outro que o do Google). */
  whatsappInsta?: string;
}

/* Conferência do WhatsApp ---------------------------------------------------------------------- */

/**
 * - corrigido: o Brenno trocou pelo número certo;
 * - conferido: a conta do WhatsApp Business tem o nome da loja;
 * - confirmado: o número está no link de WhatsApp da própria loja (ficha do Maps) ou no CNPJ dela;
 * - outroNome: a conta do WhatsApp Business tem outro nome (pode ser de outra pessoa);
 * - semBusiness: sem conta Business e sem outra confirmação (pode não ter WhatsApp).
 */
export type SituacaoZap = "corrigido" | "conferido" | "confirmado" | "outroNome" | "semBusiness";

/** Número que a própria loja pôs no link de WhatsApp da ficha do Maps (wa.me ou api.whatsapp.com). */
export function zapDoLink(lead: Lead) {
  const m = (lead.link ?? "").match(/(?:wa\.me\/|whatsapp\.com\/send\/?\?phone=)\+?(\d{10,13})/i);
  if (!m) return null;
  const n = m[1].startsWith("55") ? m[1] : `55${m[1]}`;
  return /^55\d{10,11}$/.test(n) ? n : null;
}

/** Celular ou fixo do Brasil digitado de qualquer jeito → 55DDXXXXXXXXX; null se faltar o DDD. */
export function lerNumero(texto: string) {
  let n = texto.replace(/\D/g, "").replace(/^0+/, "");
  if (n.length === 10 || n.length === 11) n = `55${n}`;
  return /^55[1-9]\d(9\d{8}|[2-5]\d{7})$/.test(n) ? n : null;
}

/** Número da loja para mandar mensagem: o que o Brenno corrigiu, o do link da loja ou o do Google. */
export const numeroDaLoja = (lead: Lead) =>
  lead.whatsappCerto ||
  lead.whatsappInsta ||
  (lead.zap?.confere ? lead.whatsapp : zapDoLink(lead) || lead.whatsapp);

/** (22) 99743-1349 */
export function numeroVisivel(n: string) {
  const d = n.replace(/\D/g, "").replace(/^55/, "");
  return d.length >= 10 ? `(${d.slice(0, 2)}) ${d.slice(2, -4)}-${d.slice(-4)}` : d;
}

export function situacaoZap(lead: Lead): SituacaoZap | null {
  if (lead.whatsappCerto) return "corrigido";
  if (lead.zap?.nome && lead.zap.confere) return "conferido";
  if (lead.whatsappInsta || zapDoLink(lead) || lead.telNoCnpj) return "confirmado";
  if (!lead.zap) return null;
  return lead.zap.nome ? "outroNome" : "semBusiness";
}

/** Na fila, número conferido vem antes; número com nome de outra conta vai pro fim. */
const PESO_ZAP: Record<SituacaoZap | "naoConferido", number> = {
  corrigido: 0,
  conferido: 0,
  confirmado: 0,
  naoConferido: 1,
  semBusiness: 2,
  outroNome: 3,
};
export const pesoZap = (lead: Lead) => PESO_ZAP[situacaoZap(lead) ?? "naoConferido"];

/** Valida a conferência vinda de fora (lote da pesquisa). */
export function lerZap(valor: unknown): Lead["zap"] | null {
  if (!valor || typeof valor !== "object") return null;
  const z = valor as Record<string, unknown>;
  if (typeof z.nome !== "string" || typeof z.confere !== "boolean" || typeof z.em !== "string") return null;
  return { nome: z.nome, confere: z.confere, em: z.em };
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

/** Comércios contatados por dia. */
export const META_DIA = 30;

export function statusDe(lead: Lead): Status {
  return lead.status && lead.status in STATUS ? (lead.status as Status) : "novo";
}

export function contar(leads: Lead[]) {
  const n = Object.fromEntries(STATUS_ORDEM.map((s) => [s, 0])) as Record<Status, number>;
  for (const lead of leads) n[statusDe(lead)] += 1;
  return n;
}

/** Quando a oferta foi feita a essa loja, ou `null` se ainda não foi. */
export function dataEnvio(lead: Lead, produto: Envio): string | null {
  if (lead.enviados) return lead.enviados[produto] || null;
  // Contatos antigos guardavam um envio só por loja.
  const antigo = statusDe(lead) !== "novo" && (lead.produto || "site") === produto;
  return antigo && lead.enviadoEm ? lead.enviadoEm : null;
}

export const ENVIOS: Envio[] = ["site", "placa", "agenda", "dono"];

/** Comércios contatados hoje: a mesma loja conta uma vez, mesmo com site, placa e dono no mesmo dia. */
export function contatosHoje(leads: Lead[], agora = new Date()) {
  const hoje = agora.toDateString();
  const ehHoje = (data?: string | null) => Boolean(data) && new Date(data!).toDateString() === hoje;
  return leads.filter(
    (lead) => ehHoje(lead.enviadoEm) || ENVIOS.some((envio) => ehHoje(dataEnvio(lead, envio))),
  ).length;
}

/* Fora da lista -------------------------------------------------------------------------------- */

export type MotivoTirada = "semWhatsApp" | "numeroErrado" | "naoExiste";

export const MOTIVO_TIRADA: Record<MotivoTirada, { botao: string; frase: string }> = {
  semWhatsApp: { botao: "Número sem WhatsApp", frase: "número sem WhatsApp" },
  numeroErrado: { botao: "Número de outra pessoa", frase: "o número é de outra pessoa" },
  naoExiste: { botao: "Loja não existe mais", frase: "a loja não existe mais" },
};

/** Por que a loja saiu da lista, ou null se ela continua nela. */
export const motivoTirada = (lead: Lead): MotivoTirada | null =>
  lead.tirada && lead.tirada.motivo in MOTIVO_TIRADA ? lead.tirada.motivo : null;

/**
 * A loja aparece nas listas e nas contagens. A tirada continua no banco: assim a importação
 * reconhece o número e não traz a mesma loja de volta.
 */
export const naLista = (lead: Lead) => motivoTirada(lead) === null;

/* Lugar ---------------------------------------------------------------------------------------- */

const CASIMIRO = "Casimiro de Abreu";

// Distritos de Casimiro longe do centro: para o Brenno contam como fora (só WhatsApp).
const DISTRITOS: [string, RegExp][] = [
  ["Barra de São João", /barra de s[aã]o jo[aã]o/i],
  ["Rio Dourado", /rio dourado/i],
  ["Professor Souza", /professor souza/i],
];

/** Loja que o Google põe em Casimiro mas fica longe do centro (Palmital, Cidade Praiana, Jardim Miramar…). */
export const LONGE_DO_CENTRO = "Casimiro, longe do centro";
const CENTRO: [number, number] = [-22.4806, -42.2045];
const RAIO_KM = 8;

/** Latitude e longitude do link da ficha do Maps (`!3d-22.55!4d-41.98`). */
export function coordenadasDe(lead: Lead): [number, number] | null {
  const m = (lead.maps ?? "").match(/!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/);
  return m ? [Number(m[1]), Number(m[2])] : null;
}

/** Distância em km do centro de Casimiro (null sem coordenadas). */
export function kmDoCentro(lead: Lead) {
  const c = coordenadasDe(lead);
  if (!c) return null;
  const rad = (g: number) => (g * Math.PI) / 180;
  const [la1, lo1, la2, lo2] = [CENTRO[0], CENTRO[1], c[0], c[1]].map(rad);
  const h = Math.sin((la2 - la1) / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin((lo2 - lo1) / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
}

const distritoDe = (lead: Lead) =>
  DISTRITOS.find(([, padrao]) => padrao.test(lead.cidade ?? "") || padrao.test(lead.nome))?.[0] ??
  (/casimiro/i.test(lead.cidade ?? "") && (kmDoCentro(lead) ?? 0) > RAIO_KM ? LONGE_DO_CENTRO : null);

/** Comércio da cidade de Casimiro (sem os distritos), onde dá para ir falar com o dono pessoalmente. */
export const ehCasimiro = (lead: Lead) => /casimiro/i.test(lead.cidade ?? "") && !distritoDe(lead);

/**
 * Dá para ir lá falar com o dono: loja da cidade de Casimiro, a não ser que o Brenno marque que fica
 * longe (o cadastro do Google às vezes diz "Casimiro de Abreu" para loja de distrito).
 */
export const podeVisitar = (lead: Lead) => ehCasimiro(lead) && lead.visita !== false;

/** A loja recebeu uma mensagem pedindo visita (as de placa e de dono só existem no fluxo de visita). */
export const recebeuPedidoDeVisita = (lead: Lead) =>
  lead.pediuVisita === true || Boolean(dataEnvio(lead, "placa")) || Boolean(dataEnvio(lead, "dono"));

export const cidadeDe = (lead: Lead) =>
  distritoDe(lead) ?? (ehCasimiro(lead) ? CASIMIRO : lead.cidade?.trim() || "Sem cidade");

/** Bairro do endereço do Google: "R. X, 12 - Jardim Miramar, Casimiro de Abreu - RJ" → "Jardim Miramar". */
function bairroDe(lead: Lead) {
  const b = (lead.endereco ?? "").match(/-\s*([^,\-]{3,40}),\s*[^,]+ - RJ\b/)?.[1]?.trim() ?? "";
  // Só nome de bairro de verdade: sem número, sem "casa/lote/quadra", e "Centro" não diz onde fica.
  if (!b || /\d|^(centro|casimiro)|\b(casa|lote|lt|quadra|qd|loja|de souza)\b/i.test(b)) return null;
  return b.toLowerCase() === b || b.toUpperCase() === b ? b.toLowerCase().replace(/(^|\s)\p{L}/gu, (x) => x.toUpperCase()) : b;
}

/**
 * Lugar para mostrar ao cliente (mensagem e prévias): o bairro quando a loja fica longe do centro de
 * Casimiro, senão a cidade.
 */
export const lugarDe = (lead: Lead) =>
  distritoDe(lead) === LONGE_DO_CENTRO ? bairroDe(lead) ?? CASIMIRO : cidadeDe(lead);

export function noEscopo(leads: Lead[], escopo: Escopo) {
  if (escopo === "todos") return leads;
  return leads.filter((lead) => ehCasimiro(lead) === (escopo === "casimiro"));
}

// Da mais perto de Casimiro para a mais longe; cidade nova entra no fim, em ordem alfabética.
const ORDEM_CIDADES = [
  CASIMIRO,
  ...DISTRITOS.map(([nome]) => nome),
  LONGE_DO_CENTRO,
  "Rio das Ostras",
  "Silva Jardim",
  "Unamar",
  "Macaé",
  "Cabo Frio",
];

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

/* Ramo ----------------------------------------------------------------------------------------- */

export type RamoId =
  | "crossfit"
  | "luta"
  | "pilates"
  | "yoga"
  | "danca"
  | "natacao"
  | "academia"
  | "fisioterapia"
  | "lavajato"
  | "moda"
  | "papelaria"
  | "otica"
  | "construcao"
  | "mercado"
  | "farmacia"
  | "barbearia"
  | "massagem"
  | "salao"
  | "estetica"
  | "acai"
  | "pizzaria"
  | "hamburgueria"
  | "padaria"
  | "restaurante"
  | "pet"
  | "oficina"
  | "dentista"
  | "saude"
  | "escola"
  | "escritorio"
  | "servicos"
  | "festa"
  | "geral";

export interface Ramo {
  id: RamoId;
  /** Vira o `tipo` da loja quando o Brenno escolhe este ramo. */
  nome: string;
  /** Texto na lista de escolha, quando o ramo junta mais de um tipo de loja. */
  opcao?: string;
  /** Reconhece o ramo pelo tipo que veio do Google. */
  tipo: RegExp;
  /** Reconhece pelo nome da loja quando o tipo não diz nada (palavra inteira: "Barbosa" não é barbearia). */
  nomeLoja?: RegExp;
  /** O nome da loja corrige o tipo do Google, mas só quando o tipo caiu num dos ramos de `corrige`. */
  certeza?: { padrao: RegExp; corrige: RamoId[] };
  /** "Pra {quem} eu monto o site com {noSite}." Sem `quem`, usa o tipo da loja. */
  quem?: string;
  noSite: string;
  /** Onde o cliente está quando encosta o celular na placa. */
  ondePlaca: string;
}

const CARDAPIO = "o cardápio com foto e um botão que já abre o pedido no WhatsApp";
const SERVICOS = "os serviços com foto, os horários e um botão pra marcar pelo WhatsApp";

const GERAL: Ramo = {
  id: "geral",
  nome: "Outro comércio",
  tipo: /$^/,
  noSite: "o que vocês vendem, o horário, o mapa e um botão que já abre o WhatsApp",
  ondePlaca: "",
};

// Modalidades de treino: só reconhecem pelo nome quando o Google cadastrou como academia (ou nada).
const MODALIDADE: RamoId[] = ["academia", "geral"];
const AULA_EXPERIMENTAL = "os horários das turmas, os planos e um botão pra marcar aula experimental pelo WhatsApp";

// A ordem importa: o primeiro ramo que reconhece o tipo ganha ("Academia de luta" é luta, não academia;
// "Pilates e fisioterapia" é pilates; "Estética automotiva" é lava-jato, não clínica de estética).
export const RAMOS: Ramo[] = [
  {
    id: "crossfit",
    nome: "Box de CrossFit e funcional",
    opcao: "CrossFit e treino funcional",
    tipo: /cross ?fit|cross ?training|funcional|\bhiit\b/i,
    nomeLoja: /\bcross ?fit|\bcross\b|\bcross ?training|\bfuncional/i,
    certeza: { padrao: /\bcross ?fit|\bcross\b|\bcross ?training|\bfuncional|\bhiit\b|\bbox\b/i, corrige: MODALIDADE },
    noSite: AULA_EXPERIMENTAL,
    ondePlaca: " depois do treino",
  },
  {
    id: "luta",
    nome: "Academia de luta",
    opcao: "Luta (muay thai, jiu-jitsu, boxe)",
    tipo: /luta|muay|jiu|boxe|kickbox|artes marciais|karat|jud[oô]|capoeira|taekwondo/i,
    nomeLoja: /\bmuay|\bjiu|\blutas?\b|\bboxe\b|\bkarat|\bjud[oô](?![\wà-ú])|\bcapoeira|\btaekwondo/i,
    certeza: {
      padrao: /\bmuay|\bjiu|\bbjj\b|\blutas?\b|\bboxe\b|\bkarat|\bjud[oô](?![\wà-ú])|\btaekwondo|\bcapoeira|\bfight|\bct\b|centro de treinamento|\bteam\b/i,
      corrige: ["academia", "geral"],
    },
    quem: "academia de luta",
    noSite: "as modalidades, os horários das turmas e um botão pra marcar aula experimental pelo WhatsApp",
    ondePlaca: " depois do treino",
  },
  {
    id: "pilates",
    nome: "Studio de pilates",
    tipo: /pilates/i,
    nomeLoja: /\bpilates/i,
    certeza: { padrao: /\bpilates/i, corrige: ["academia", "fisioterapia", "estetica", "geral"] },
    noSite: AULA_EXPERIMENTAL,
    ondePlaca: " depois da aula",
  },
  {
    id: "yoga",
    nome: "Studio de yoga",
    tipo: /\byoga|\bioga|medita/i,
    nomeLoja: /\byoga|\bioga/i,
    certeza: { padrao: /\byoga|\bioga/i, corrige: MODALIDADE },
    noSite: AULA_EXPERIMENTAL,
    ondePlaca: " depois da aula",
  },
  {
    id: "danca",
    nome: "Escola de dança",
    opcao: "Dança (balé, zumba, ritmos)",
    tipo: /(?<![a-zà-ú])dan[cç]a|\bdance|ballet|\bbal[eé](?![\wà-ú])|zumba|forr[oó]|\bsamba|hip.?hop|\bjazz/i,
    nomeLoja: /\bdan[cç]a|\bdance|\bballet|\bbal[eé](?![\wà-ú])|\bzumba/i,
    certeza: { padrao: /\bdan[cç]a|\bdance|\bballet|\bbal[eé](?![\wà-ú])|\bzumba|\britmos\b/i, corrige: MODALIDADE },
    noSite: "as modalidades, os horários das turmas e um botão pra marcar aula experimental pelo WhatsApp",
    ondePlaca: " depois da aula",
  },
  {
    id: "natacao",
    nome: "Escola de natação",
    opcao: "Natação e hidroginástica",
    tipo: /nata[cç]|hidrogin|aqu[aá]tic/i,
    nomeLoja: /\bnata[cç][aã]o|\bhidrogin[aá]stica|\bswim/i,
    certeza: { padrao: /\bnata[cç][aã]o|\bhidrogin[aá]stica|\bswim/i, corrige: MODALIDADE },
    noSite: "as turmas por idade, os horários e um botão pra marcar aula experimental pelo WhatsApp",
    ondePlaca: " depois da aula",
  },
  {
    id: "escola",
    nome: "Escola e cursos",
    opcao: "Escola e cursos (idiomas, música, autoescola)",
    tipo: /escola|curso|idioma|ingl[eê]s|aulas? particular|refor[cç]o escolar|creche|jardim de inf|(?:escola|aulas?|cursos?) de m[uú]sica|educa[cç][aã]o/i,
    nomeLoja: /\bescola|\bcol[eé]gio|\bcursos?\b|\bidiomas?|\bingl[eê]s|\benglish|\bcreche|\bm[uú]sica/i,
    noSite: "os cursos, os horários das turmas e um botão pra fazer a matrícula pelo WhatsApp",
    ondePlaca: " depois da aula",
  },
  {
    id: "festa",
    nome: "Festas e eventos",
    opcao: "Festas, eventos e fotografia",
    tipo: /festa|evento|buffet|cerimon|fot[oó]gr[aá]f|decora[cç][aã]o|entretenimento|casamento|\bdj\b/i,
    nomeLoja: /\bfestas?\b|\beventos?\b|\bbuffet|\bfotografia|\bdecora/i,
    certeza: { padrao: /\bfestas?\b|\beventos?\b|\bbuffet\b/i, corrige: ["salao"] },
    noSite: "as fotos das festas, os pacotes e um botão pra pedir orçamento pelo WhatsApp",
    ondePlaca: " no fim da festa",
  },
  {
    id: "lavajato",
    nome: "Lava-jato",
    opcao: "Lava-jato e estética automotiva",
    tipo: /lava.?jato|lava.?r[aá]pido|est[eé]tica (automotiva|auto|veicular)|detail|polimento|lavagem|insulfilm|envelopamento/i,
    nomeLoja: /lava.?jato|\bdetail|\bcar ?wash|est[eé]tica (automotiva|auto)/i,
    certeza: {
      padrao: /lava.?jato|\bdetail|\bcar ?wash|est[eé]tica (automotiva|auto)|polimento/i,
      corrige: ["estetica", "oficina", "servicos", "geral"],
    },
    noSite: "os serviços com foto, o horário e um botão pra agendar a lavagem pelo WhatsApp",
    ondePlaca: " na hora de buscar o carro",
  },
  {
    id: "academia",
    nome: "Academia",
    tipo: /academ|gym|fitness|crossfit|muscula|pilates|funcional/i,
    nomeLoja: /\bacademia|\bgym\b|\bfit(ness)?\b|\bcrossfit|\bpilates/i,
    noSite: "os planos, os horários e um botão pra marcar aula experimental pelo WhatsApp",
    ondePlaca: " depois do treino",
  },
  {
    id: "barbearia",
    nome: "Barbearia",
    tipo: /barb/i,
    nomeLoja: /\bbarbe(aria|r)/i,
    noSite: SERVICOS,
    ondePlaca: " ainda na cadeira",
  },
  {
    id: "fisioterapia",
    nome: "Clínica de fisioterapia",
    tipo: /fisiot|quiropr|osteop|reabilita/i,
    nomeLoja: /\bfisio/i,
    certeza: { padrao: /\bfisio/i, corrige: ["salao", "estetica", "massagem", "academia", "saude", "geral"] },
    noSite: "os tratamentos, os horários e um botão pra agendar avaliação pelo WhatsApp",
    ondePlaca: " depois da sessão",
  },
  {
    id: "massagem",
    nome: "Massoterapia",
    opcao: "Massagem e massoterapia",
    tipo: /massot|massag|\bspa\b/i,
    nomeLoja: /\bmassoterap|\bmassag|\bspa\b/i,
    certeza: { padrao: /\bmassoterap|\bmassag|\bspa\b/i, corrige: ["salao", "estetica", "geral"] },
    noSite: "os atendimentos, os horários e um botão pra agendar pelo WhatsApp",
    ondePlaca: " depois do atendimento",
  },
  {
    id: "salao",
    nome: "Salão de beleza",
    tipo: /sal[aã]o|(?<!produtos de )beleza|cabel|manicure|nail|unhas?\b|sobrancel|c[ií]lios|maquia|tatu|piercing/i,
    nomeLoja: /\bsal[aã]o|\bbeleza|\bbeauty|\bcabel|\bhair|\bnails?\b|\bunhas?\b/i,
    noSite: SERVICOS,
    ondePlaca: " ainda na cadeira",
  },
  {
    id: "estetica",
    nome: "Clínica de estética",
    tipo: /est[eé]tic|depila|harmoniza|dermat|micropigment/i,
    nomeLoja: /\best[eé]tica\b/i,
    certeza: {
      padrao: /cl[ií]nica[^|]*est[eé]tica|centro de [^|]*est[eé]tica|harmoniza|\best[eé]tica\b(?! (automotiva|auto|veicular))/i,
      corrige: ["salao", "geral"],
    },
    noSite: "os procedimentos, os horários e um botão pra agendar pelo WhatsApp",
    ondePlaca: " depois do atendimento",
  },
  {
    id: "acai",
    nome: "Açaiteria",
    opcao: "Açaí e sorvete",
    tipo: /a[cç]a[ií]|sorvet|gelat/i,
    nomeLoja: /a[cç]a[ií]|\bsorvet/i,
    certeza: { padrao: /a[cç]a[ií]/i, corrige: ["padaria", "hamburgueria", "restaurante", "geral"] },
    noSite: CARDAPIO,
    ondePlaca: " enquanto espera o pedido",
  },
  {
    id: "pizzaria",
    nome: "Pizzaria",
    tipo: /pizz/i,
    nomeLoja: /pizz/i,
    noSite: CARDAPIO,
    ondePlaca: " enquanto espera o pedido",
  },
  {
    id: "hamburgueria",
    nome: "Lanchonete",
    opcao: "Lanchonete e hamburgueria",
    tipo: /hamb|burg|lanch|hot ?dog|pastel|salgad|pipoca/i,
    nomeLoja: /hamb[uú]rg|\bburg|\blanch|\bsmash/i,
    noSite: CARDAPIO,
    ondePlaca: " enquanto espera o pedido",
  },
  {
    id: "padaria",
    nome: "Padaria",
    opcao: "Padaria e cafeteria",
    tipo: /padar|confeit|latic|leiteria|caf[eé]|doceria|\bbolo/i,
    nomeLoja: /\bpadaria|\bconfeitaria|\bcafeteria|\bdoceria|\bp[aã]o\b/i,
    noSite: "os produtos, o horário e um botão pra encomendar pelo WhatsApp",
    ondePlaca: " no caixa",
  },
  {
    id: "restaurante",
    nome: "Restaurante",
    tipo: /restaur|churras|grill|marmit|gastronom|steak|self.?service|\bbar\b|\bbares\b|boteco|petisc|quiosque|kiosque|crep|esfi[hr]|catering|frango|comida|\bdelivery\b|casa noturna/i,
    nomeLoja: /\brestaurante|\bchurrasc|\bgrill\b|\bmarmit|\bgastronomia|\bsteak/i,
    noSite: CARDAPIO,
    ondePlaca: " enquanto espera o pedido",
  },
  {
    id: "pet",
    nome: "Pet shop",
    opcao: "Pet shop e veterinária",
    tipo: /\bpet|veterin|ra[cç](?:[oõ]es|[aã]o)|fazenda|\baves\b|rancho|agropecu|pecu[aá]ri|agr[ií]col|criador|cria[cç][aã]o de/i,
    nomeLoja: /\bpet\b|\bpetshop|\bveterin|\bra[cç](?:[oõ]es|[aã]o)/i,
    certeza: { padrao: /\bpet\b|\bpetshop|banho e tosa|\btosa\b/i, corrige: ["salao", "massagem", "estetica", "geral"] },
    noSite: "os serviços, os horários e um botão pra agendar pelo WhatsApp",
    ondePlaca: " quando busca o bichinho",
  },
  {
    id: "oficina",
    nome: "Oficina mecânica",
    tipo: /oficina(?! de (?:reparos?|conserto) de (?:celular|eletr))|mec[aâ]nic|auto(?!.?escola|ma[cçt])|diesel|motor|lanterna|funilaria|radiador|pneu|borrach|moto|lava.?jato|reboque|guincho|som (para|pra) carro|som automotivo|bicicleta|\bbikes?\b/i,
    nomeLoja: /\boficina(?! d[ao] pesca)|\bmec[aâ]nica|\bauto\b|\bautomotiv|\bdiesel|\bmotos?\b|\bpneus?\b|lava.?jato|lanternagem/i,
    noSite: "os serviços, o horário, o mapa e um botão pra pedir orçamento pelo WhatsApp",
    ondePlaca: " na hora de buscar o carro",
  },
  {
    id: "dentista",
    nome: "Dentista",
    tipo: /dent|odonto/i,
    nomeLoja: /\bdentista|\bodonto|\bsorriso/i,
    noSite: "os tratamentos, os horários e um botão pra marcar consulta pelo WhatsApp",
    ondePlaca: " na recepção",
  },
  {
    id: "saude",
    nome: "Consultório",
    opcao: "Consultório (psicólogo, nutricionista, médico)",
    tipo: /psic|nutri|terapeut|terapia|m[eé]dic(?!amento)|cl[ií]nic[ao]|consult[oó]rio|psiquiat|psican|fonoaud|oftalm|ginec|pediatr|cardiol|ortoped|pod[oó]log|laborat|diagn[oó]stico|sa[uú]de|acupunt/i,
    nomeLoja: /\bpsic[oó]log|\bnutri|\bconsult[oó]rio|\bcl[ií]nica\b|\bterapia|\bterapeut|podolog/i,
    certeza: { padrao: /podolog/i, corrige: ["salao", "estetica"] },
    noSite: "as especialidades, os horários e um botão pra marcar consulta pelo WhatsApp",
    ondePlaca: " depois da consulta",
  },
  {
    id: "escritorio",
    nome: "Escritório",
    opcao: "Escritório (contabilidade, advocacia, imóveis)",
    tipo: /contab|contador|advoga|advocacia|jur[ií]dic|imobili|im[oó]ve|corretor|despachante|seguro|arquitet|engenhar|consultor|certificad/i,
    nomeLoja: /\bcontab|\badvoga|\badvocacia|\bim[oó]veis|\bimobili|\bcorretor|\bdespachante|\bseguros/i,
    noSite: "os serviços, quem atende e um botão pra marcar uma conversa pelo WhatsApp",
    ondePlaca: " depois do atendimento",
  },
  {
    id: "moda",
    nome: "Loja de roupas",
    opcao: "Roupas, calçados e acessórios",
    tipo: /roupa|\bmoda\b|vestu[aá]rio|boutique|cal[cç]ados?\b|sapat|lingerie|\bnoivas?\b|bijuter|acess[oó]rios femininos|loja infantil|moda infantil|confec[cç]|joalh|\bjoias?\b|rel[oó]gio|relojoar|tecido|brech[oó]|bazar|artigos esportivos|costur|vestimenta|\bbolsas?\b/i,
    nomeLoja: /\bmodas?\b|\bboutique|\bcal[cç]ados|\bconfec[cç]/i,
    noSite: "as novidades com foto, os tamanhos e um botão que já abre o WhatsApp pra reservar a peça",
    ondePlaca: " no caixa",
  },
  {
    id: "papelaria",
    nome: "Papelaria",
    tipo: /papelar|livrar|armarinho|gr[aá]fic|c[oó]pias?(?! de chave)\b|impress|presente|personalizad|carimbo|moldura|artesanato/i,
    nomeLoja: /\bpapelaria|\bpapel\b|\blivraria/i,
    noSite: "os produtos, a lista de material escolar e um botão pra pedir pelo WhatsApp",
    ondePlaca: " no caixa",
  },
  {
    id: "otica",
    nome: "Ótica",
    // Sem \b: em JS o "Ó" não conta como letra, e "robótica" não é ótica.
    tipo: /(?<![a-zà-ü])[oó]ticas?\b|[oó]culos|optic/i,
    nomeLoja: /(?<![a-zà-ü])[oó]ticas?\b|[oó]culos/i,
    noSite: "as armações com foto, o horário e um botão pra pedir orçamento das lentes pelo WhatsApp",
    ondePlaca: " na hora de buscar os óculos",
  },
  {
    id: "construcao",
    nome: "Material de construção",
    opcao: "Construção, tintas e vidraçaria",
    tipo: /constru|\btintas?\b|madeireir|ferragen|ferrament|el[eé]tric[oa] e hidr|hidr[aá]ulic|vidra[cç]|marmor|serralher|serralhar|home ?center|gesso|drywall|esquadria|janelas|vidros|madeiras|marcen|carpint|moveleir|serrari|reforma|empreiteir|materia(?:l|is) el[eé]tric|andaime|alvenaria|pedreiro/i,
    nomeLoja: /\bconstru|\btintas\b|\bmadeireira|\bferragens|\bvidra[cç]aria|\bmateriais|\bmaterial\b|\bgesso\b/i,
    certeza: { padrao: /materia(?:l|is) de constru/i, corrige: ["servicos", "geral"] },
    noSite: "os produtos, o horário, o mapa e um botão pra pedir orçamento pelo WhatsApp",
    ondePlaca: " no balcão",
  },
  {
    id: "servicos",
    nome: "Assistência e serviços",
    opcao: "Assistência técnica e serviços (celular, elétrica, ar)",
    tipo: /celular|dispositivos m[oó]veis|eletr[oô]nic|inform[aá]tic|assist[eê]ncia t[eé]cnica|conserto|eletricista|chaveir|chaves|ar condicionado|climatiza|refrigera|desentup|dedetiz|limpeza|televis|faz.tudo|pedreiro|jardineir|energia solar|piscina|mudan[cç]|transporte|equipamentos el[eé]tricos|internet|saneamento/i,
    nomeLoja: /\bcelular|\bcell\b|\binform[aá]tica|\bassist[eê]ncia|\beletricista|\bchaveiro|\brefrigera|\bclimatiza|\bdesentup|\bdedetiz/i,
    noSite: "os serviços com foto, a região que atende e um botão pra pedir orçamento pelo WhatsApp",
    ondePlaca: " no balcão",
  },
  {
    id: "mercado",
    nome: "Mercado",
    opcao: "Mercado, mercearia e hortifrúti",
    tipo: /mercad|mercearia|hortifr|sacol[aã]o|atacad(?!ista de cosm)|a[cç]ougue|frutar|emp[oó]rio|bebida|cerveja|distribuid|dep[oó]sito|armaz[eé]m|\bg[aá]s\b|butano|peixar|produtos naturais|aliment|queijo|[aá]gua engarrafada|congelad|descart[aá]v|conveni[eê]ncia/i,
    nomeLoja: /\bmercad|\bmercearia|\bhortifr|\bsacol[aã]o|\ba[cç]ougue/i,
    noSite: "as ofertas da semana, o horário e um botão pra fazer o pedido pelo WhatsApp",
    ondePlaca: " no caixa",
  },
  {
    id: "farmacia",
    nome: "Farmácia",
    tipo: /farm[aá]c|drogaria|manipula|suplement|vitamin|fitoter|perfum|cosm[eé]tic|produtos de beleza/i,
    nomeLoja: /\bfarma|\bdrogaria|\bsuplement|nutri[cç][aã]o esportiva/i,
    // "Barão Classic Suplementos" veio do Google como "Festas e eventos": o nome diz o que a loja vende.
    certeza: { padrao: /\bsuplement/i, corrige: ["festa", "geral", "salao", "estetica", "academia", "saude"] },
    noSite: "o horário, a entrega e um botão pra pedir pelo WhatsApp",
    ondePlaca: " no balcão",
  },
  GERAL,
];

/** Os ramos na lista de escolha: em ordem alfabética, com "Outro comércio" no fim. */
export const RAMOS_ESCOLHA = RAMOS.filter((r) => r !== GERAL)
  .sort((a, b) => (a.opcao ?? a.nome).localeCompare(b.opcao ?? b.nome, "pt-BR"))
  .concat(GERAL);

/**
 * Ramo da loja: a escolha do Brenno, senão o tipo do Google, senão o nome. No fim, o nome pode
 * corrigir o tipo (a massoterapeuta cadastrada como salão, o CT cadastrado como academia).
 */
/** Tipo do Google que não diz o que a loja vende ("Loja", "Delivery", "Fabricante"…): aí o nome decide. */
const TIPO_GENERICO =
  /^(loja|delivery|quiosque|caf[eé]|armaz[eé]m|dep[oó]sito|atacadista|fabricante|fabrica[cç][aã]o de alimentos|fabricante de alimentos( congelados)?|fornecedor de produtos aliment[ií]cios|servi[cç]o de distribui[cç][aã]o|centro comercial|mercado tradicional|com[eé]rcio|restaurante fast-food)?$/i;

export function ramoDe(lead: Pick<Lead, "nome" | "tipo" | "ramo">): Ramo {
  const escolhido = RAMOS.find((r) => r.id === lead.ramo);
  if (escolhido) return escolhido;
  const subPeloTipo = lead.tipo ? SUBNICHOS.find((s) => s.tipo?.test(lead.tipo ?? "")) : undefined;
  const base =
    RAMOS.find((r) => r.tipo.test(lead.tipo ?? "")) ??
    RAMOS.find((r) => r.nomeLoja?.test(lead.nome)) ??
    (subPeloTipo && RAMOS.find((r) => r.id === subPeloTipo.ramo)) ??
    GERAL;
  const certo = RAMOS.find((r) => r.certeza?.corrige.includes(base.id) && r.certeza.padrao.test(lead.nome)) ?? base;
  // "Gran Pizza" com tipo "Delivery", "Barriga Doce Tattoo" com tipo "Loja": o nome diz o que vende. Só vale
  // quando o tipo é genérico (ou caiu no geral), o nome não confirma o próprio ramo e não há sub-nicho nele.
  const tipo = (lead.tipo ?? "").trim();
  if ((certo.id === "geral" || TIPO_GENERICO.test(tipo)) && !(certo.id !== "geral" && certo.nomeLoja?.test(lead.nome))) {
    // Sub-nicho do próprio ramo pelo nome segura o ramo; pelo tipo só segura quando o nome não aponta pra outro.
    const doRamo = SUBNICHOS.filter((s) => s.ramo === certo.id || s.outrosRamos?.includes(certo.id));
    if (!doRamo.some((s) => s.nomeLoja?.test(lead.nome))) {
      // Tipo de comida ("Delivery", "Quiosque", "Café") só troca por outro ramo de comida: o Mr Fit é marmita fit, não academia.
      const comida = /^(delivery|quiosque|caf[eé]|restaurante fast-food)$|aliment/i.test(tipo);
      const pode = (id: RamoId) => !comida || ["restaurante", "hamburgueria", "pizzaria", "padaria", "acai", "mercado"].includes(id);
      const sub = SUBNICHOS.find((s) => pode(s.ramo) && s.nomeLoja?.test(lead.nome));
      const peloNome = sub ? RAMOS.find((r) => r.id === sub.ramo) : RAMOS.find((r) => pode(r.id) && r.nomeLoja?.test(lead.nome));
      if (peloNome) return peloNome;
    }
  }
  return certo;
}

/* Sub-nicho ------------------------------------------------------------------------------------ */
// Dentro de um ramo há negócios que não podem ter a mesma prévia: aquário não é banho e tosa, judô
// não é muay thai, tatuagem não é salão de cabelo. O sub-nicho troca fotos, textos, serviços e, quando
// precisa, tira ou troca o sistema. Ele é calculado na hora (nada muda no banco).

export interface Subnicho {
  id: string;
  ramo: RamoId;
  /** Outros ramos onde o mesmo produto aparece ("Churros e batata" cadastrado como restaurante). */
  outrosRamos?: RamoId[];
  /** Nome curto que aparece na ficha. */
  nome: string;
  /** Reconhece pelo tipo do Google. */
  tipo?: RegExp;
  /** Reconhece pelo nome da loja (vale mais que o tipo: "Aquarismo… casa de ração" é aquário). */
  nomeLoja?: RegExp;
  quem?: string;
  noSite?: string;
  ondePlaca?: string;
  /** `null`: este sub-nicho não tem sistema, mesmo que o ramo tenha. */
  sistema?: SistemaId | null;
  sistemaTexto?: { quem?: string; frase?: string; ganho?: string };
}

const PEDIDO_ZAP = "um botão que já abre o pedido no WhatsApp";
const ORCAMENTO = "um botão pra pedir orçamento pelo WhatsApp";

// `\b` do JavaScript não conhece acento: "Spaço" passava por \bspa\b e "Judô" não fechava \bjud[oô]\b.
// Todo \b das regras de ramo e sub-nicho vira uma fronteira que trata letra acentuada como letra.
const LETRA = "\\wÀ-ÖØ-öø-ÿ";
const FRONTEIRA = `(?:(?<![${LETRA}])(?=[${LETRA}])|(?<=[${LETRA}])(?![${LETRA}]))`;
const comAcento = (r: RegExp) => new RegExp(r.source.replaceAll("\\b", FRONTEIRA), r.flags);

export const SUBNICHOS: Subnicho[] = [
  // Pet
  { id: "aquario", ramo: "pet", nome: "Aquarismo", tipo: /aqu[aá]rio|aquaris|peix/i, nomeLoja: /aqu[aá]rio|aquaris|\bpeix|\bfish\b|\breef\b/i,
    quem: "loja de aquarismo", noSite: `os peixes e os aquários com foto, o que chegou na semana e ${PEDIDO_ZAP}`, ondePlaca: " no caixa", sistema: null },
  { id: "veterinario", ramo: "pet", nome: "Veterinária", tipo: /veterin/i, nomeLoja: /\bvet\b|veterin/i,
    quem: "clínica veterinária", noSite: "os atendimentos, os horários e um botão pra marcar a consulta pelo WhatsApp", ondePlaca: " na recepção",
    sistemaTexto: { quem: "clínica veterinária", frase: "o tutor escolhe a consulta ou a vacina e o horário pelo celular, e já fica marcado na sua agenda", ganho: "Você não precisa parar o atendimento pra responder mensagem." } },
  { id: "agro", ramo: "pet", nome: "Agropecuária", tipo: /agropecu|agr[ií]col|pecu[aá]ri|cooperativa|criador|cria[cç][aã]o|cavalo|equin|haras|selaria|fazenda|\baves\b|rancho/i, nomeLoja: /\bagro|agropecu|selaria|\bharas\b|\brural\b|\bfazenda|\bcampo\b/i,
    quem: "agropecuária", noSite: `as rações, os produtos pro campo e ${PEDIDO_ZAP}`, ondePlaca: " no balcão", sistema: null },
  { id: "racao", ramo: "pet", nome: "Loja de ração", tipo: /ra[cç](?:[oõ]es|[aã]o)|suprimentos para animais/i,
    quem: "loja de ração", noSite: `as rações e os acessórios com foto e ${PEDIDO_ZAP}`, ondePlaca: " no caixa", sistema: null },
  // Luta: cada modalidade com a foto dela
  { id: "jiujitsu", ramo: "luta", nome: "Jiu-jitsu", tipo: /jiu|bjj|grappling/i, nomeLoja: /\bjiu|\bbjj\b|gracie|\bjj\b/i, quem: "academia de jiu-jitsu" },
  { id: "muaythai", ramo: "luta", nome: "Muay thai", tipo: /muay|thai|kick ?box/i, nomeLoja: /\bmuay|\bthai\b|kick ?box/i, quem: "academia de muay thai" },
  { id: "judo", ramo: "luta", nome: "Judô", tipo: /jud[oô]/i, nomeLoja: /\bjud[oô](?![\wà-ú])/i, quem: "academia de judô" },
  { id: "taekwondo", ramo: "luta", nome: "Taekwondo", tipo: /taekwon|tae kwon/i, nomeLoja: /taekwon|tae kwon/i, quem: "academia de taekwondo" },
  { id: "karate", ramo: "luta", nome: "Karatê", tipo: /karat|kung ?fu|aikid/i, nomeLoja: /\bkarat|kung ?fu|aikid/i, quem: "academia de karatê" },
  { id: "boxe", ramo: "luta", nome: "Boxe", tipo: /\bbox(e|ing)\b|pugil/i, nomeLoja: /\bbox(e|ing)\b/i, quem: "academia de boxe" },
  { id: "capoeira", ramo: "luta", nome: "Capoeira", tipo: /capoeira/i, nomeLoja: /capoeira/i, quem: "grupo de capoeira" },
  // Salão
  { id: "tatuagem", ramo: "salao", nome: "Tatuagem", tipo: /tatu|tattoo|piercing/i, nomeLoja: /\btatu|tattoo|\bink\b|piercing/i,
    quem: "estúdio de tatuagem", noSite: `os trabalhos com foto, os estilos e ${ORCAMENTO}`, ondePlaca: " depois da sessão",
    sistemaTexto: { quem: "estúdio de tatuagem", frase: "o cliente escolhe o tamanho e o horário da sessão pelo celular, e já fica marcado na sua agenda", ganho: "Você não precisa parar a tatuagem pra responder mensagem." } },
  { id: "unhas", ramo: "salao", nome: "Unhas", tipo: /manicure|pedicure|\bunhas?\b|nail|esmalt/i, nomeLoja: /manicure|\bunhas?\b|\bnails?\b|esmalt/i,
    quem: "manicure", noSite: "os serviços com foto dos trabalhos, os horários e um botão pra marcar pelo WhatsApp",
    sistemaTexto: { quem: "manicure", ganho: "Você não precisa parar a unha pra responder mensagem." } },
  { id: "cilios", ramo: "salao", nome: "Cílios e sobrancelha", tipo: /c[ií]lios|lash|sobrancel|brow/i, nomeLoja: /c[ií]lios|\blash|sobrancel|\bbrows?\b/i,
    quem: "studio de cílios e sobrancelha" },
  // Festas
  { id: "fotografia", ramo: "festa", nome: "Fotografia", tipo: /fot[oó]gr[aá]f|photo|(?<!locadora de )v[ií]deo/i, nomeLoja: /fot[oó]gr[aá]f|photo|\bfoto/i,
    quem: "fotógrafo", noSite: `os ensaios com foto, os pacotes e ${ORCAMENTO}`, ondePlaca: " na entrega das fotos" },
  // Oficina
  { id: "moto", ramo: "oficina", nome: "Motos", tipo: /moto|scooter/i, nomeLoja: /\bmotos?\b|motoca|scooter/i,
    quem: "oficina de motos", noSite: "os serviços, o horário e um botão pra pedir orçamento da moto pelo WhatsApp", ondePlaca: " na hora de buscar a moto" },
  { id: "bicicleta", ramo: "oficina", nome: "Bicicletaria", tipo: /bicicl|\bbikes?\b|ciclo/i, nomeLoja: /bicicl|\bbikes?\b|\bbike\b|\bciclo/i,
    quem: "bicicletaria", noSite: "as bikes, as peças, o conserto e um botão pra pedir orçamento pelo WhatsApp", ondePlaca: " na hora de buscar a bike" },
  { id: "borracharia", ramo: "oficina", nome: "Borracharia", tipo: /borrach|pneu|alinhamento|balanceamento/i, nomeLoja: /borrach|\bpneus?\b/i,
    quem: "borracharia", noSite: "os serviços, o horário e um botão que já chama no WhatsApp quando o pneu fura", ondePlaca: " enquanto troca o pneu" },
  { id: "autoeletrica", ramo: "oficina", nome: "Auto elétrica", tipo: /auto.?el[eé]tric|ar.?condicionado automotivo|bateria/i, nomeLoja: /auto.?el[eé]tric|baterias?\b|ar.?condicionado automotivo/i,
    quem: "auto elétrica", noSite: `os serviços, o horário e ${ORCAMENTO}` },
  { id: "reboque", ramo: "oficina", nome: "Reboque", tipo: /reboque|guincho|socorro/i, nomeLoja: /reboque|guincho|socorro|resgate/i,
    quem: "serviço de reboque", noSite: "a região que atende, o horário e um botão que já chama o guincho pelo WhatsApp", ondePlaca: " no balcão" },
  { id: "funilaria", ramo: "oficina", nome: "Funilaria e pintura", tipo: /funilaria|lanternagem|pintura automotiva|carroceria|polimento/i, nomeLoja: /funilaria|lanternagem|pinturas?\b|polimento/i,
    quem: "funilaria e pintura", noSite: `os serviços com foto de antes e depois e ${ORCAMENTO}` },
  { id: "autopecas", ramo: "oficina", nome: "Autopeças", tipo: /auto.?pe[cç]as|pe[cç]as automotivas/i, nomeLoja: /auto.?pe[cç]as|\bpe[cç]as\b/i,
    quem: "loja de autopeças", noSite: `as peças com foto e ${PEDIDO_ZAP}` },
  { id: "somfilm", ramo: "oficina", nome: "Som e película", tipo: /som (automotivo|para carros|pra carro)|pel[ií]cula|acess[oó]rios automotivos/i, nomeLoja: /films?\b|pel[ií]cula|\bsom\b|\bsound\b/i,
    quem: "loja de som e película", noSite: `os serviços com foto e ${ORCAMENTO}` },
  // Serviços
  { id: "celular", ramo: "servicos", nome: "Celular", tipo: /celular|smartphone|iphone|dispositivos m[oó]veis|telefon/i, nomeLoja: /\bcelular|cell\b|\biphone|\bsmart/i,
    quem: "assistência de celular", noSite: `os consertos com foto, o tempo de reparo e ${ORCAMENTO}`, ondePlaca: " na hora de buscar o celular" },
  { id: "solar", ramo: "servicos", nome: "Energia solar", tipo: /solar|fotovolt/i, nomeLoja: /\bsolar|fotovolt/i,
    quem: "empresa de energia solar", noSite: `as instalações com foto, quanto dá pra economizar e ${ORCAMENTO}` },
  { id: "piscina", ramo: "servicos", nome: "Piscinas", tipo: /piscina/i, nomeLoja: /piscina/i,
    quem: "serviço de piscina", noSite: `os serviços, a região que atende e ${ORCAMENTO}` },
  { id: "chaveiro", ramo: "servicos", nome: "Chaveiro", tipo: /chaveir|c[oó]pia de chave/i, nomeLoja: /chaveir/i,
    quem: "chaveiro", noSite: "os serviços, o horário e um botão que já chama no WhatsApp", ondePlaca: " no balcão" },
  { id: "limpeza", ramo: "servicos", nome: "Limpeza", tipo: /limpeza|higieniza|tape[cç]aria|dedetiz|desentup|fossa|saneamento/i, nomeLoja: /limp|higieniza|dedetiz|desentup|fossa/i,
    quem: "serviço de limpeza", noSite: `os serviços com foto de antes e depois e ${ORCAMENTO}` },
  { id: "refrigeracao", ramo: "servicos", nome: "Ar-condicionado", tipo: /condicionado|climatiza|refrigera|geladeira|lavadora/i, nomeLoja: /refrigera|climatiza|\bar ?condicionado|(?<!cabo )\bfrio\b/i,
    quem: "assistência de ar-condicionado", noSite: `os serviços com foto, a região que atende e ${ORCAMENTO}` },
  { id: "informatica", ramo: "servicos", nome: "Informática", tipo: /inform[aá]tic|computador|notebook|lan house/i, nomeLoja: /inform[aá]tica|\bpc\b|notebook/i,
    quem: "assistência de informática", noSite: `os consertos, os computadores à venda e ${ORCAMENTO}` },
  { id: "eletricista", ramo: "servicos", nome: "Eletricista", tipo: /eletricist|el[eé]tric/i, nomeLoja: /eletricista|\bel[eé]trica\b/i,
    quem: "eletricista", noSite: `os serviços com foto, a região que atende e ${ORCAMENTO}` },
  { id: "eletronica", ramo: "servicos", nome: "Eletrônicos", tipo: /eletr[oô]nic|televis|\btvs?\b|eletrodom/i, nomeLoja: /eletr[oô]nica|\btvs?\b|eletrodom/i,
    quem: "assistência de eletrônicos", noSite: `os aparelhos que conserta e ${ORCAMENTO}` },
  // Construção
  { id: "vidracaria", ramo: "construcao", nome: "Vidraçaria", tipo: /vidra|vidro|esquadria|janela/i, nomeLoja: /vidra[cç]|\bvidros?\b|esquadria/i,
    quem: "vidraçaria", noSite: `os trabalhos com foto, box, janelas e espelhos, e ${ORCAMENTO}`, ondePlaca: " na hora de fechar o orçamento" },
  { id: "serralheria", ramo: "construcao", nome: "Serralheria", tipo: /serralh|serralhar|metal[uú]rg|solda|constru[cç][oõ]es met/i, nomeLoja: /serralh|\bsolda|metal[uú]rg/i,
    quem: "serralheria", noSite: `os portões e grades com foto e ${ORCAMENTO}`, ondePlaca: " na hora de fechar o orçamento" },
  { id: "marcenaria", ramo: "construcao", nome: "Marcenaria", tipo: /marcen|carpint|moveleir|planejad/i, nomeLoja: /marcenaria|carpintaria|planejados/i,
    quem: "marcenaria", noSite: `os móveis com foto e ${ORCAMENTO}`, ondePlaca: " na hora de fechar o orçamento" },
  // Mercado
  { id: "queijaria", ramo: "mercado", nome: "Queijaria", tipo: /queij|latic[ií]n|\bfrios\b/i, nomeLoja: /queij|latic[ií]n|\bfrios\b/i,
    quem: "queijaria", noSite: `os queijos com foto, as encomendas e ${PEDIDO_ZAP}` },
  { id: "naturais", ramo: "mercado", nome: "Produtos naturais", tipo: /produtos naturais|granel|gr[aã]os|cerealista/i, nomeLoja: /natural|\bgr[aã]os?\b|granel|integral/i,
    quem: "loja de produtos naturais", noSite: `os grãos, castanhas e temperos com foto e ${PEDIDO_ZAP}` },
  { id: "descartaveis", ramo: "mercado", nome: "Descartáveis", tipo: /descart[aá]v|embalag/i, nomeLoja: /descart[aá]v|embalag/i,
    quem: "loja de descartáveis", noSite: `os copos, potes e embalagens com foto e ${PEDIDO_ZAP}` },
  { id: "bebidas", ramo: "mercado", nome: "Bebidas", tipo: /bebida|cerveja|adega|chopp|conveni|^dep[oó]sito$/i, nomeLoja: /bebidas|\badega|\bchopp|conveni[eê]ncia|\bgelada/i,
    quem: "distribuidora de bebidas", noSite: "as bebidas geladas, os preços e um botão pra pedir a entrega pelo WhatsApp" },
  { id: "acougue", ramo: "mercado", nome: "Açougue", tipo: /a[cç]ougue|carnes/i, nomeLoja: /a[cç]ougue|\bcarnes\b|\bbeef\b/i,
    quem: "açougue", noSite: `os cortes do dia, as ofertas e ${PEDIDO_ZAP}` },
  { id: "gasagua", ramo: "mercado", nome: "Gás e água", tipo: /\bg[aá]s\b|butano|[aá]gua/i, nomeLoja: /\bg[aá]s\b|(?<![\wà-ú])[aá]gua\b|gal[aã]o/i,
    quem: "depósito de gás e água", noSite: "o preço do gás e da água, a região que entrega e um botão pra pedir pelo WhatsApp", ondePlaca: " na hora da entrega" },
  { id: "peixaria", ramo: "mercado", nome: "Peixaria", tipo: /peixar|pescad|frutos do mar/i, nomeLoja: /peixaria|pescado|frutos do mar/i,
    quem: "peixaria", noSite: `os peixes do dia com foto e ${PEDIDO_ZAP}` },
  // Restaurante: o produto que a loja vende vai na capa (frango assado não leva foto de costela)
  { id: "frango", ramo: "restaurante", outrosRamos: ["hamburgueria"], nome: "Frango assado", tipo: /frango|galeto|galinha|assados/i, nomeLoja: /frango|galeto|\bassad|rotisserie|\bchicken\b/i,
    quem: "casa de frango assado", noSite: `o frango assado, as quentinhas e ${PEDIDO_ZAP}` },
  { id: "crepe", ramo: "restaurante", nome: "Creperia", tipo: /crep/i, nomeLoja: /\bcrep/i, quem: "creperia" },
  { id: "massas", ramo: "restaurante", nome: "Massas", tipo: /massas|italian|cantina/i, nomeLoja: /\bmassas\b|lasanh|\bcantina|\bnonna|trattoria|italian/i, quem: "restaurante de massas" },
  { id: "japones", ramo: "restaurante", nome: "Japonês", tipo: /japon|sushi|temaki|oriental/i, nomeLoja: /sushi|temaki|japon|\bnikkei|oriental/i, quem: "restaurante japonês" },
  { id: "frutosdomar", ramo: "restaurante", nome: "Frutos do mar", tipo: /frutos do mar|peixe|camar|marisc/i, nomeLoja: /frutos do mar|\bcamar[aã]o|peixe|marisc|pescador/i, quem: "restaurante de frutos do mar" },
  { id: "churrascaria", ramo: "restaurante", nome: "Churrascaria", tipo: /churras|steak|carnes|espeto|grill/i, nomeLoja: /churras|steak|\bespeto|\bgrill\b/i, quem: "churrascaria" },
  { id: "marmita", ramo: "restaurante", outrosRamos: ["hamburgueria"], nome: "Quentinha", tipo: /self.?service|marmit|quentinh|comida caseira|comida para viagem|\bpf\b/i, nomeLoja: /quentinh|marmit|self.?service|comida caseira|\bpf\b|prato feito|\bbuffet\b|tempero/i,
    quem: "restaurante de comida caseira", noSite: `as quentinhas do dia com foto, os preços e ${PEDIDO_ZAP}` },
  { id: "bar", ramo: "restaurante", nome: "Bar", tipo: /\bbar\b|\bbares\b|boteco|petisc|\bpub\b|chop|casa noturna|balada/i, nomeLoja: /\bbar\b|boteco|botequim|petiscaria|\bpub\b|choperia/i, quem: "bar" },
  // Lanchonete: só mostra hambúrguer quem vende hambúrguer
  { id: "pipoca", ramo: "hamburgueria", nome: "Pipoca", tipo: /pipoca/i, nomeLoja: /pipoca/i, quem: "pipocaria",
    noSite: `os sabores com foto e ${PEDIDO_ZAP}`, sistema: null },
  { id: "churros", ramo: "hamburgueria", outrosRamos: ["restaurante", "acai"], nome: "Churros", tipo: /churro/i, nomeLoja: /churro/i, quem: "loja de churros",
    noSite: `os sabores de churros com foto e ${PEDIDO_ZAP}` },
  { id: "batatafrita", ramo: "hamburgueria", outrosRamos: ["restaurante"], nome: "Batata frita", tipo: /batata|fritas/i, nomeLoja: /batata|\bfritas\b|\bfries\b/i, quem: "casa de batata frita",
    noSite: `as porções de batata com foto e ${PEDIDO_ZAP}` },
  { id: "pastel", ramo: "hamburgueria", outrosRamos: ["restaurante"], nome: "Pastelaria", tipo: /pastel|pastéis|pasteis|pastelaria/i, nomeLoja: /pastel|past[eé]is/i, quem: "pastelaria",
    noSite: `os sabores de pastel com foto e ${PEDIDO_ZAP}` },
  { id: "cachorroquente", ramo: "hamburgueria", outrosRamos: ["restaurante"], nome: "Cachorro-quente", tipo: /hot ?dog|cachorro/i, nomeLoja: /hot ?dog|cachorr[aã]o|cachorro.quente|\bdog\b/i, quem: "carrinho de cachorro-quente",
    noSite: `os lanches com foto e ${PEDIDO_ZAP}` },
  { id: "hamburguer", ramo: "hamburgueria", nome: "Hamburgueria", tipo: /hamb|burg|smash/i, nomeLoja: /hamb[uú]rg|burg|smash/i, quem: "hamburgueria" },
  { id: "salgados", ramo: "hamburgueria", outrosRamos: ["restaurante", "padaria"], nome: "Salgados", tipo: /salgad|coxinha|esfi/i, nomeLoja: /salgad|coxinha|esfi[hr]|\bkibe/i, quem: "casa de salgados",
    noSite: `os salgados com foto, as encomendas pra festa e ${PEDIDO_ZAP}` },
  // Padaria
  { id: "confeitaria", ramo: "padaria", outrosRamos: ["mercado"], nome: "Confeitaria", tipo: /confeit|doceria|doces|bolo|brigad/i, nomeLoja: /confeitaria|doceria|\bcake|\bbolos\b|brigadeir|\bdoces\b|biscoit/i,
    quem: "confeitaria", noSite: "os bolos e doces com foto e um botão pra encomendar pelo WhatsApp" },
  { id: "cafeteria", ramo: "padaria", nome: "Cafeteria", tipo: /cafeteria|caf[eé](?![\wà-ú])|torrefa/i, nomeLoja: /cafeteria|coffee/i, quem: "cafeteria", noSite: `o cardápio com foto e ${PEDIDO_ZAP}`, ondePlaca: " na mesa" },
  // Açaí
  { id: "sorveteria", ramo: "acai", nome: "Sorveteria", tipo: /sorvet|gelat|picol/i, nomeLoja: /^(?!.*a[cç]a[ií]).*(sorvet|gelat|picol)/i, quem: "sorveteria" },
  { id: "hortifruti", ramo: "mercado", nome: "Hortifrúti", tipo: /hortifr|sacol[aã]o|frutas e vegetais|verdur/i, nomeLoja: /hortifr|sacol[aã]o|\bfeira|verdur|\bfrutas\b/i,
    quem: "hortifrúti", noSite: `as frutas e verduras do dia, as ofertas e ${PEDIDO_ZAP}` },
  // Moda
  { id: "armarinho", ramo: "moda", outrosRamos: ["papelaria", "geral"], nome: "Armarinho e tecidos", tipo: /armarinho|aviamento|tecido/i, nomeLoja: /armarinho|aviamento|tecidos/i,
    quem: "armarinho", noSite: `os tecidos e aviamentos com foto e ${PEDIDO_ZAP}`, ondePlaca: " no caixa" },
  { id: "calcados", ramo: "moda", nome: "Calçados", tipo: /cal[cç]ad|sapat|t[eê]nis/i, nomeLoja: /cal[cç]ados|sapat|\bshoes?\b/i, quem: "loja de calçados",
    noSite: "os modelos novos com foto, a numeração e um botão que já abre o WhatsApp pra reservar o par" },
  { id: "esportiva", ramo: "moda", nome: "Moda esportiva", tipo: /(?<!poli|clube )esportiv|\bsports?\b|fitness|atl[eé]tic/i, nomeLoja: /\bsports?\b|esporte|fitness/i, quem: "loja de artigos esportivos" },
  { id: "joalheria", ramo: "moda", nome: "Joias e relógios", tipo: /joalh|j[oó]ias?|relojo|rel[oó]gio|bijuter|semijoi/i, nomeLoja: /joias|joalheria|relojoaria|semijoias|bijuterias|\bprata\b/i, quem: "joalheria",
    noSite: "as peças com foto, os preços e um botão que já abre o WhatsApp pra reservar" },
  { id: "costura", ramo: "moda", nome: "Costura", tipo: /costur|alfaiat|ajustes/i, nomeLoja: /costura|alfaiat|ajustes/i, quem: "ateliê de costura",
    noSite: "os serviços de costura e ajuste, os prazos e um botão pra pedir orçamento pelo WhatsApp", ondePlaca: " na hora de buscar a peça" },
  // Escola
  { id: "autoescola", ramo: "escola", nome: "Autoescola", tipo: /auto.?escola|cfc|habilita/i, nomeLoja: /auto.?escola|\bcfc\b/i, quem: "autoescola",
    noSite: "as categorias, os pacotes de aula e um botão pra fazer a matrícula pelo WhatsApp", ondePlaca: " depois da aula prática",
    sistemaTexto: { quem: "autoescola", frase: "o aluno marca e remarca a aula prática pelo celular, e você vê quem já fez quantas aulas e quem tá com o pagamento em dia" } },
  { id: "idiomas", ramo: "escola", nome: "Idiomas", tipo: /idioma|ingl[eê]s|english|espanhol|language/i, nomeLoja: /idiomas|ingl[eê]s|english|espanhol|\blanguage/i, quem: "escola de idiomas" },
  { id: "musica", ramo: "escola", nome: "Música", tipo: /m[uú]sica|music|viol[aã]o|piano|canto/i, nomeLoja: /m[uú]sica|\bmusic|viol[aã]o|piano/i, quem: "escola de música" },
  { id: "infantil", ramo: "escola", nome: "Educação infantil", tipo: /creche|infantil|jardim de inf|ber[cç]|pr[eé].?escola/i, nomeLoja: /creche|infantil|\bkids\b|ber[cç][aá]rio|\bbaby/i, quem: "escola infantil",
    noSite: "a estrutura com foto, as turmas por idade e um botão pra marcar uma visita pelo WhatsApp", ondePlaca: " na hora da saída" },
  // Consultório
  { id: "nutricionista", ramo: "saude", nome: "Nutricionista", tipo: /nutri/i, nomeLoja: /\bnutri/i, quem: "nutricionista" },
  { id: "psicologo", ramo: "saude", nome: "Psicologia", tipo: /psic|terapeut|terapia|sa[uú]de mental/i, nomeLoja: /psic[oó]log|psican|terapia|terapeut/i, quem: "consultório de psicologia" },
  // Escritório
  { id: "contabilidade", ramo: "escritorio", nome: "Contabilidade", tipo: /contab|contador/i, nomeLoja: /contab|contador/i, quem: "escritório de contabilidade" },
  { id: "imobiliaria", ramo: "escritorio", nome: "Imobiliária", tipo: /imobili|im[oó]ve|corretor/i, nomeLoja: /im[oó]veis|imobili|corretor/i, quem: "imobiliária",
    noSite: "os imóveis com foto, aluguel e venda separados e um botão pra marcar a visita pelo WhatsApp" },
  { id: "advocacia", ramo: "escritorio", nome: "Advocacia", tipo: /advoga|advocacia|jur[ií]dic/i, nomeLoja: /advoga|advocacia|jur[ií]dic/i, quem: "escritório de advocacia" },
  // Papelaria
  { id: "grafica", ramo: "papelaria", nome: "Gráfica", tipo: /gr[aá]fic|impress|personaliz|camiseta|brinde|carimbo|moldura/i, nomeLoja: /gr[aá]fica|impress|personaliz|\bbrindes|\bprint/i, quem: "gráfica",
    noSite: `os produtos com foto, os prazos e ${ORCAMENTO}`, ondePlaca: " na hora de buscar a encomenda" },
  // Farmácia
  { id: "cosmeticos", ramo: "farmacia", nome: "Cosméticos", tipo: /cosm[eé]tic|perfum|maquiag|beleza/i, nomeLoja: /cosm[eé]tic|perfum|\bmake|maquiag|beauty|\bbeleza/i,
    quem: "loja de cosméticos", noSite: `os produtos com foto, as novidades e ${PEDIDO_ZAP}`, ondePlaca: " no caixa" },
  // Outros comércios
  { id: "pesca", ramo: "geral", nome: "Pesca", tipo: /pesca\b|pescaria/i, nomeLoja: /\bpesca\b|pescaria/i,
    quem: "loja de pesca", noSite: `as iscas, varas e acessórios com foto e ${PEDIDO_ZAP}`, ondePlaca: " no caixa" },
  { id: "pousada", ramo: "geral", nome: "Pousada", tipo: /pousada|hotel|hospedag|hostel|f[eé]rias|alojamento/i, nomeLoja: /pousada|hotel|hostel|su[ií]tes|chal[eé]/i,
    quem: "pousada", noSite: "os quartos com foto, a localização e um botão pra reservar pelo WhatsApp", ondePlaca: " na recepção" },
  { id: "moveis", ramo: "geral", nome: "Móveis", tipo: /m[oó]veis|sof[aá]|colch|estofad|planejad/i, nomeLoja: /m[oó]veis|\bsof[aá]s?\b|colch|estofad/i, quem: "loja de móveis",
    noSite: "os móveis com foto, os preços e um botão que já abre o WhatsApp", ondePlaca: " no caixa" },
  { id: "floricultura", ramo: "geral", nome: "Floricultura", tipo: /flor/i, nomeLoja: /floricultura|\bflores\b|\bflora\b/i, quem: "floricultura",
    noSite: "os buquês e arranjos com foto e um botão pra encomendar pelo WhatsApp", ondePlaca: " no caixa" },
];

for (const r of [...RAMOS, GERAL]) {
  r.tipo = comAcento(r.tipo);
  if (r.nomeLoja) r.nomeLoja = comAcento(r.nomeLoja);
  if (r.certeza) r.certeza.padrao = comAcento(r.certeza.padrao);
}
for (const s of SUBNICHOS) {
  if (s.tipo) s.tipo = comAcento(s.tipo);
  if (s.nomeLoja) s.nomeLoja = comAcento(s.nomeLoja);
}

/** O sub-nicho da loja dentro do ramo dela. O nome da loja vale mais que o tipo do Google. */
export function subnichoDe(lead: Pick<Lead, "nome" | "tipo" | "ramo" | "subnicho">): Subnicho | null {
  const ramo = ramoDe(lead).id;
  const doRamo = SUBNICHOS.filter((s) => s.ramo === ramo || s.outrosRamos?.includes(ramo));
  // A escolha do Brenno na prévia vale mais que a detecção ("" = estilo geral do ramo).
  if (typeof lead.subnicho === "string") return doRamo.find((s) => s.id === lead.subnicho) ?? null;
  return (
    doRamo.find((s) => s.nomeLoja?.test(lead.nome)) ?? doRamo.find((s) => s.tipo?.test(lead.tipo ?? "")) ?? null
  );
}

function fraseSite(lead: Lead) {
  const ramo = ramoDe(lead);
  const sub = subnichoDe(lead);
  if (ramo.id === "geral" && !sub) return `Eu monto o site com ${GERAL.noSite}.`;
  const tipo = lead.tipo?.trim();
  // O tipo do Google só entra na frase quando é do mesmo ramo (a massoterapeuta não é "salão de beleza").
  const quem = sub?.quem ?? ramo.quem ?? (tipo && ramo.tipo.test(tipo) ? tipo : ramo.nome).toLowerCase();
  return `Pra ${quem} eu monto o site com ${sub?.noSite ?? ramo.noSite}.`;
}

/** `nela`: a frase vem logo depois de falar da plaquinha; senão ela se apresenta sozinha. */
function frasePlaca(lead: Lead, nela: boolean) {
  const onde = subnichoDe(lead)?.ondePlaca ?? ramoDe(lead).ondePlaca;
  return nela
    ? `O cliente encosta o celular nela${onde} e avalia vocês no Google em 10 segundos.`
    : `Na plaquinha, o cliente encosta o celular${onde} e avalia vocês no Google em 10 segundos.`;
}

/* Mensagens ------------------------------------------------------------------------------------ */

/** O que vai na mensagem: uma oferta, ou as duas juntas (só em Casimiro, no primeiro contato). */
export type Oferta = Envio | "ambas";

export type ChaveTexto =
  | "fora"
  | "casimiroAmbas"
  | "casimiroPlaca"
  | "casimiroSite"
  | "depoisPlaca"
  | "depoisSite"
  | "casimiroDono"
  | "depoisDono"
  | "casimiroAgenda"
  | "foraAgenda"
  | "depoisAgenda"
  | "gostou";
export type Textos = Record<ChaveTexto, string>;

export const TEXTOS_INFO: Record<ChaveTexto, { curto: string; longo: string }> = {
  fora: { curto: "WhatsApp", longo: "Mensagem de site por WhatsApp, para loja onde não dá pra ir" },
  casimiroAmbas: { curto: "Visita: as duas", longo: "Pedindo visita: site e placa juntos" },
  casimiroPlaca: { curto: "Visita: placa", longo: "Pedindo visita: só placa" },
  casimiroSite: { curto: "Visita: site", longo: "Pedindo visita: só site" },
  depoisPlaca: { curto: "2ª: placa", longo: "Placa depois do site, sem repetir o oi" },
  depoisSite: { curto: "2ª: site", longo: "Site depois da placa, sem repetir o oi" },
  casimiroDono: { curto: "Visita: dono", longo: "Pedindo visita: falar com o dono" },
  depoisDono: { curto: "2ª: dono", longo: "Pedir para falar com o dono depois de já ter mandado mensagem" },
  casimiroAgenda: { curto: "Visita: sistema", longo: "Pedindo visita: sistema (horário marcado ou controle de alunos)" },
  foraAgenda: { curto: "WhatsApp: sistema", longo: "Sistema por WhatsApp, para loja onde não dá pra ir" },
  depoisAgenda: { curto: "2ª: sistema", longo: "Sistema para quem já recebeu mensagem, sem repetir o oi" },
  gostou: { curto: "Gostou", longo: "Quando a pessoa gostou: oferecer a demonstração" },
};

const APRESENTACAO_CASIMIRO = "Oi, {saudacao}, tudo certo? Aqui é o Brenno, sou daqui de Casimiro mesmo.";
const VISITA =
  "Se der, queria falar direto com o dono ou a dona. Qual horário fica melhor? Ou, se preferir, me passa o contato de quem resolve isso.";

// Nenhum texto fala de preço: o Brenno só passa valor depois que a pessoa mostra interesse.
export const TEXTOS_PADRAO: Textos = {
  fora: "Oi, {saudacao}, tudo certo? Aqui é o Brenno, da BN Digital. Sou de Casimiro{pertinho}.\nVi a {nome} no Google Maps{elogio} e reparei que vocês ainda não têm site.\n{nicho}\nQuer que eu te mande um exemplo de como ficaria o de vocês? Se não for a hora, tranquilo, é só falar.",
  casimiroAmbas: `${APRESENTACAO_CASIMIRO}\nTrabalho com duas coisas pro comércio aqui da cidade: site e uma plaquinha de avaliação pro balcão.\n{nichoSite}\n{nichoPlaca}\nPosso passar aí pra te mostrar as duas? É rapidinho. ${VISITA}`,
  casimiroPlaca: `${APRESENTACAO_CASIMIRO}\nTô fazendo uma plaquinha com chip pro balcão. {nicho}\nMais avaliação é mais gente achando a {nome} quando procura no Google.\nPosso passar aí pra te mostrar funcionando? É rapidinho. ${VISITA}`,
  casimiroSite: `${APRESENTACAO_CASIMIRO}\nVi a {nome} no Google Maps{elogio} e reparei que vocês ainda não têm site.\n{nicho}\nPosso passar aí pra te mostrar um exemplo no celular? É rapidinho. ${VISITA}`,
  depoisPlaca:
    "Ah, esqueci de falar: também faço uma plaquinha com chip pro balcão. {nicho}\nQuando eu passar aí, levo ela pra você ver funcionando.",
  depoisSite:
    "Ah, e aproveitando: também faço site pro comércio aqui da cidade. {nicho}\nQuando eu passar aí, já te mostro um exemplo no celular.",
  casimiroDono: `${APRESENTACAO_CASIMIRO}\nQueria mostrar pra {nome} um trabalho que faço pro comércio aqui da cidade: site e uma plaquinha de avaliação pro balcão.\nConsigo falar com o dono ou a dona? É rapidinho. Qual horário costuma ser melhor pra encontrar? Ou, se preferir, me passa o contato.`,
  depoisDono:
    "Ah, e quem eu procuro aí pra conversar sobre isso? Se puder ser o dono ou a dona, melhor, já mostro tudo pessoalmente.\nQual horário costuma ser melhor pra encontrar? Ou, se preferir, me passa o contato.",
  casimiroAgenda: `${APRESENTACAO_CASIMIRO}\nTô começando {sistemaUm} pra {sistemaQuem} aqui da cidade: {sistemaFrase}.\n{sistemaGanho}\nPosso passar aí pra te mostrar como funciona? É rapidinho. ${VISITA}`,
  foraAgenda:
    "Oi, {saudacao}, tudo certo? Aqui é o Brenno, da BN Digital. Sou de Casimiro{pertinho}.\nTô começando {sistemaUm} pra {sistemaQuem}: {sistemaFrase}.\n{sistemaGanho}\nOlha abaixo como ficaria pra {nome}. Se não for a hora, tranquilo, é só falar.",
  depoisAgenda:
    // Sem pergunta no fim: o Brenno manda o print do sistema logo depois.
    "Ah, e aproveitando: tô começando {sistemaUm} pra {sistemaQuem}. {SistemaFrase}.\n{sistemaGanho}\nOlha como ficaria pra {nome}:",
  gostou:
    "Que bom que gostou! Consigo te fazer uma demonstração de design, de como vai ficar o site da {nome}, ainda hoje ou amanhã.\nPara você ter uma ideia, olha um que eu já fiz: {exemplo}\nPosso montar e te mandar por aqui?",
};

/** "bom dia", "boa tarde" ou "boa noite", pelo relógio do celular na hora de mandar. */
export function saudacao(agora = new Date()) {
  const hora = agora.getHours();
  if (hora >= 5 && hora < 12) return "bom dia";
  if (hora >= 12 && hora < 18) return "boa tarde";
  return "boa noite";
}

/** Em Casimiro, placa para quem ainda tem poucas avaliações (é quem mais ganha com ela); senão, site. */
export function produtoSugerido(lead: Lead): Produto {
  if (!podeVisitar(lead)) return "site";
  return lead.avaliacoes == null || lead.avaliacoes < 50 ? "placa" : "site";
}

/* Sistema (oferta "agenda"): horário marcado ou controle de alunos, conforme o ramo -------------- */

export type SistemaId = "agenda" | "alunos";

export const SISTEMAS: Record<SistemaId, { nome: string; um: string; botao: string; oferecer: string; frase: string; ganho: string }> = {
  agenda: {
    nome: "horário marcado",
    um: "um sistema de horário marcado",
    botao: "HORÁRIO",
    oferecer: "Oferecer o sistema de horário marcado",
    frase: "o cliente escolhe o serviço e o horário pelo celular, e já fica marcado na sua agenda",
    ganho: "Você não precisa parar o atendimento pra responder mensagem.",
  },
  alunos: {
    nome: "controle de alunos",
    um: "um sistema de controle de alunos",
    botao: "ALUNOS",
    oferecer: "Oferecer o controle de alunos",
    frase: "você vê quem tá com a mensalidade em dia, as turmas do dia e quem faltou, e o aluno marca ou remarca a aula pelo celular",
    ganho: "Cobrar quem atrasou vira um toque no WhatsApp.",
  },
};

// Ramos em que um sistema faz sentido; o resto fica com site e placa.
const SISTEMA_DO_RAMO: Partial<Record<RamoId, SistemaId>> = {
  barbearia: "agenda", salao: "agenda", estetica: "agenda", massagem: "agenda", pet: "agenda", lavajato: "agenda",
  saude: "agenda",
  pilates: "alunos", yoga: "alunos", escola: "alunos", danca: "alunos", natacao: "alunos", crossfit: "alunos", luta: "alunos", academia: "alunos",
};

// Onde o texto padrão não combina com o ramo.
const SISTEMA_NO_RAMO: Partial<Record<RamoId, { quem?: string; frase?: string; ganho?: string }>> = {
  barbearia: { ganho: "Você não precisa parar o corte pra responder mensagem." },
  pet: { frase: "o tutor escolhe banho ou tosa e o horário pelo celular, e já fica marcado na sua agenda" },
  lavajato: {
    frase: "o cliente escolhe a lavagem e o horário pelo celular, e já fica marcado na sua agenda",
    ganho: "Sem fila na porta e sem ficar respondendo mensagem.",
  },
  massagem: { quem: "espaço de massagem" },
  saude: {
    quem: "consultório",
    frase: "o paciente escolhe o dia e o horário da consulta pelo celular, e já fica marcado na sua agenda",
    ganho: "Você não precisa parar a consulta pra responder mensagem.",
  },
};

export const sistemaDe = (lead: Lead): SistemaId | null => {
  const sub = subnichoDe(lead);
  if (sub && sub.sistema !== undefined) return sub.sistema;
  return SISTEMA_DO_RAMO[ramoDe(lead).id] ?? null;
};

/** O sistema que serve para a loja, com os textos já no ramo (e no sub-nicho) dela. */
export function textosSistema(lead: Lead) {
  const ramo = ramoDe(lead);
  const sub = subnichoDe(lead);
  const id = sistemaDe(lead) ?? "agenda";
  const extra = { ...SISTEMA_NO_RAMO[ramo.id], ...sub?.sistemaTexto };
  return {
    ...SISTEMAS[id],
    id,
    quem: sub?.sistemaTexto?.quem ?? sub?.quem ?? extra.quem ?? ramo.quem ?? ramo.nome.toLowerCase(),
    frase: extra.frase ?? SISTEMAS[id].frase,
    ganho: extra.ganho ?? SISTEMAS[id].ganho,
  };
}

/** Nada mandado ainda para essa loja (nem oferta, nem pedido para falar com o dono). */
export const nadaEnviado = (lead: Lead) => ENVIOS.every((envio) => !dataEnvio(lead, envio));

/**
 * Opção que abre escolhida na ficha. Em Casimiro, sem nada enviado: as duas ofertas numa mensagem só.
 * Depois: a oferta que falta e, com as duas mandadas, o pedido para falar com o dono.
 */
export function ofertaInicial(lead: Lead): Oferta {
  // Barbearia sem contato nenhum começa pelo horário marcado (a novidade de 18/11).
  if (ramoDe(lead).id === "barbearia" && nadaEnviado(lead)) return "agenda";
  // Loja que já recebeu mensagem e ainda não ouviu falar do sistema: a ficha abre nele.
  if (sistemaDe(lead) && !nadaEnviado(lead) && !dataEnvio(lead, "agenda")) return "agenda";
  if (!podeVisitar(lead)) return "site";
  if (nadaEnviado(lead)) return "ambas";
  return proximaOferta(lead, null);
}

/** Próxima opção depois de mandar `acabou`: a oferta que falta e, por último, o pedido para falar com o dono. */
export function proximaOferta(lead: Lead, acabou: Oferta | null): Oferta {
  if (!podeVisitar(lead)) return "site";
  const mandou = (envio: Envio) =>
    Boolean(dataEnvio(lead, envio)) || acabou === envio || (acabou === "ambas" && envio !== "dono");
  const sugerido = produtoSugerido(lead);
  const outro: Produto = sugerido === "placa" ? "site" : "placa";
  // Com o contato do dono em mãos, não precisa pedir pra falar com ele.
  const ordem: Envio[] = donoConhecido(lead) ? [sugerido, outro] : [sugerido, outro, "dono"];
  return ordem.find((envio) => !mandou(envio)) ?? acabou ?? sugerido;
}

const ABERTURA: Record<Envio, Exclude<ChaveTexto, "gostou">> = {
  placa: "casimiroPlaca",
  site: "casimiroSite",
  agenda: "casimiroAgenda",
  dono: "casimiroDono",
};
const CONTINUACAO: Record<Envio, Exclude<ChaveTexto, "gostou">> = {
  placa: "depoisPlaca",
  site: "depoisSite",
  agenda: "depoisAgenda",
  dono: "depoisDono",
};

export function chaveTexto(lead: Lead, oferta: Oferta): Exclude<ChaveTexto, "gostou"> {
  if (!podeVisitar(lead) && oferta !== "agenda") return "fora";
  if (oferta === "ambas") return "casimiroAmbas";
  const dataEsta = dataEnvio(lead, oferta);
  const antes = ENVIOS.filter((envio) => envio !== oferta)
    .map((envio) => dataEnvio(lead, envio))
    .filter((data): data is string => Boolean(data))
    .sort()[0];
  // Outra mensagem já abriu a conversa: esta entra como continuação, sem novo "oi".
  const continua = Boolean(antes && (!dataEsta || antes < dataEsta));
  if (!podeVisitar(lead)) return continua ? "depoisAgenda" : "foraAgenda";
  return continua ? CONTINUACAO[oferta] : ABERTURA[oferta];
}

const ELOGIO_A_PARTIR_DE = 30;
const TEXTOS_DE_PLACA = new Set<ChaveTexto>(["casimiroPlaca", "depoisPlaca"]);

/** Preenche um texto com os dados do comércio. */
export function preencher(textos: Textos, chave: Exclude<ChaveTexto, "gostou">, lead: Lead, agora = new Date()) {
  const elogio =
    lead.avaliacoes != null && lead.avaliacoes >= ELOGIO_A_PARTIR_DE
      ? ` (${lead.avaliacoes} avaliações, parabéns!)`
      : "";
  const sistema = textosSistema(lead);
  return (textos[chave]?.trim() || TEXTOS_PADRAO[chave])
    .replaceAll("{saudacao}", saudacao(agora))
    .replaceAll("{nome}", lead.nome || "sua empresa")
    .replaceAll("{pertinho}", ehCasimiro(lead) || lugarDe(lead) === CASIMIRO ? " também" : `, pertinho de ${lugarDe(lead)}`)
    .replaceAll("{cidade}", lugarDe(lead))
    .replaceAll("{nichoSite}", fraseSite(lead))
    .replaceAll("{nichoPlaca}", frasePlaca(lead, false))
    .replaceAll("{nicho}", TEXTOS_DE_PLACA.has(chave) ? frasePlaca(lead, true) : fraseSite(lead))
    .replaceAll("{elogio}", elogio)
    .replaceAll("{sistemaUm}", sistema.um)
    .replaceAll("{sistemaQuem}", sistema.quem)
    .replaceAll("{sistemaFrase}", sistema.frase)
    .replaceAll("{SistemaFrase}", sistema.frase.charAt(0).toUpperCase() + sistema.frase.slice(1))
    .replaceAll("{sistemaGanho}", sistema.ganho)
    .replaceAll("{avaliacoes}", lead.avaliacoes != null ? String(lead.avaliacoes) : "várias");
}

export function textoMensagem(textos: Textos, lead: Lead, oferta: Oferta, agora = new Date()) {
  return preencher(textos, chaveTexto(lead, oferta), lead, agora);
}

export function linkWhatsApp(lead: Lead, texto: string, para: string = numeroDaLoja(lead)) {
  const numero = String(para ?? "").replace(/\D/g, "");
  return `https://wa.me/${numero}?text=${encodeURIComponent(texto)}`;
}

const SITES = "https://oliveirabrennobjj-beep.github.io/Meu-site/";

// Só sites já publicados no GitHub Pages (ver .github/workflows/publicar-bn-digital.yml).
function exemploSite(tipo = "") {
  return /aça|sorvet|padar|latic|café|pizz|restaur|lanch|hamb|horti|merc|frut/i.test(tipo)
    ? `${SITES}acai-do-rei/`
    : SITES;
}

/** Para loja que recebeu pedido de visita mas fica longe: a conversa continua pelo WhatsApp. */
export function textoCorrecao(lead: Lead) {
  const site = Boolean(dataEnvio(lead, "site")) || Boolean(dataEnvio(lead, "dono"));
  const placa = Boolean(dataEnvio(lead, "placa")) || Boolean(dataEnvio(lead, "dono"));
  const linhas = [
    "Opa, corrigindo o que falei antes: aí fica longe pra eu passar pessoalmente, mas consigo te mostrar tudo por aqui mesmo.",
    site ? `Do site, te mando uma demonstração de como ficaria o da ${lead.nome}.` : "",
    placa ? "Da plaquinha, te mando um vídeo rapidinho dela funcionando." : "",
    "Pode ser?",
  ];
  return linhas.filter(Boolean).join("\n");
}

/** Mensagem para quem respondeu com interesse: oferece a demonstração do site dele. */
export function textoGostou(textos: Textos, lead: Lead) {
  return (textos.gostou?.trim() || TEXTOS_PADRAO.gostou)
    .replaceAll("{nome}", lead.nome || "sua empresa")
    .replaceAll("{exemplo}", exemploSite(lead.tipo));
}

export const linkSeguro = (url?: string) => (url && /^https?:\/\//i.test(url) ? url : null);

/* Sobre a loja --------------------------------------------------------------------------------- */

// Abre a ficha exata quando a pesquisa guardou o link; senão, a busca por nome e cidade.
export const linkMaps = (lead: Lead) =>
  (lead.maps && /^https:\/\/www\.google\.com\/maps\//.test(lead.maps) ? lead.maps : null) ??
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${lead.nome} ${lugarDe(lead)} RJ`)}`;

/** Rua, número e bairro: o Google escreve "R. X, 12 - Bairro, Cidade - RJ, CEP, Brasil". */
export const enderecoCurto = (lead: Lead) => (lead.endereco ?? "").split(/,\s*[^,]+ - RJ\b/)[0].trim();

/** Entrou nos últimos dias e ninguém falou com ela ainda: o lote novo da pesquisa. */
export const DIAS_CHEGADA = 3;
export function chegouAgora(lead: Lead, agora = new Date()) {
  if (!lead.criado || statusDe(lead) !== "novo") return false;
  const quando = new Date(lead.criado).getTime();
  return Number.isFinite(quando) && agora.getTime() - quando < DIAS_CHEGADA * 864e5;
}

const NAO_E_PERFIL = new Set(["p", "reel", "reels", "explore", "stories"]);

/** Perfil do Instagram da loja, quando o link cadastrado é de lá. */
export function instagramDe(lead: Lead) {
  const url = linkSeguro(lead.link);
  const usuario = url?.match(/instagram\.com\/([A-Za-z0-9._]+)/i)?.[1];
  if (!url || !usuario || NAO_E_PERFIL.has(usuario.toLowerCase())) return null;
  return { arroba: `@${usuario}`, url };
}

/** Outra página da loja (Linktree, cardápio, Facebook). Link de WhatsApp não conta: já tem botão. */
export function paginaDe(lead: Lead) {
  const url = linkSeguro(lead.link);
  return url && !/instagram\.com|wa\.me|whatsapp\.com/i.test(url) ? url : null;
}

export const buscaInstagram = (lead: Lead) =>
  `https://www.google.com/search?q=${encodeURIComponent(`${lead.nome} ${lugarDe(lead)} instagram`)}`;

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
/** Só aceita foto do Google (a prévia carrega direto de lá). */
export const lerFoto = (v: unknown) =>
  typeof v === "string" && /^https:\/\/lh\d\.googleusercontent\.com\/[\w/-]+$/.test(v) ? v : null;

/** Só aceita celular brasileiro (55 + DDD + 9 dígitos) e primeiro nome com letras. */
export function lerDono(v: unknown): Lead["dono"] | null {
  if (!v || typeof v !== "object") return null;
  const x = v as Record<string, unknown>;
  const whatsapp = String(x.whatsapp ?? "").replace(/\D/g, "");
  const nomeBruto = String(x.nome ?? "").trim();
  const nome = /^\p{L}{2,20}$/u.test(nomeBruto) ? nomeBruto.charAt(0).toUpperCase() + nomeBruto.slice(1).toLowerCase() : "";
  const dono: NonNullable<Lead["dono"]> = {
    ...(nome ? { nome } : {}),
    ...(/^55\d{2}9\d{8}$/.test(whatsapp) ? { whatsapp } : {}),
    ...(x.mesmo === true ? { mesmo: true } : {}),
    em: typeof x.em === "string" ? x.em : new Date().toISOString(),
  };
  return dono.whatsapp || dono.mesmo ? dono : null;
}

/** Já se sabe como falar com o dono: o celular dele ou o WhatsApp da loja, que é o dele. */
export const donoConhecido = (lead: Lead) => Boolean(lead.dono?.whatsapp || lead.dono?.mesmo);

/** Número da conversa: o do dono quando a última mensagem foi pra ele. */
export const numeroConversa = (lead: Lead) =>
  (lead.enviadoPara === "dono" && lead.dono?.whatsapp) || numeroDaLoja(lead);

/** Mensagem falando com o dono pelo nome: "Oi, Ana, boa tarde…". */
export function paraODono(texto: string, lead: Lead) {
  const nome = lead.dono?.nome;
  return nome ? texto.replace(/^Oi, /, `Oi, ${nome}, `) : texto;
}

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
      ...(x.endereco ? { endereco: String(x.endereco) } : {}),
      ...(x.maps ? { maps: String(x.maps) } : {}),
      ...(x.fonte ? { fonte: String(x.fonte) } : {}),
      ...(lerZap(x.zap) ? { zap: lerZap(x.zap)! } : {}),
      ...(lerFoto(x.foto) ? { foto: lerFoto(x.foto)! } : {}),
      ...(lerDono(x.dono) ? { dono: lerDono(x.dono)! } : {}),
      ...(x.telNoCnpj === true ? { telNoCnpj: true } : {}),
      ...(lerNumero(String(x.whatsappInsta ?? "")) ? { whatsappInsta: lerNumero(String(x.whatsappInsta))! } : {}),
      status: "novo",
      criado: agora,
    });
  }
  return novos;
}

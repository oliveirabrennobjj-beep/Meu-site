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
  /** Loja tirada da lista porque não dá para falar com ela; null quando o Brenno traz de volta. */
  tirada?: { motivo: MotivoTirada; em: string } | null;
  /** Outro celular que o Google mostra para a loja, para tentar quando o principal não dá certo. */
  outroWhatsapp?: string;
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

const distritoDe = (lead: Lead) =>
  DISTRITOS.find(([, padrao]) => padrao.test(lead.cidade ?? "") || padrao.test(lead.nome))?.[0] ?? null;

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

export function noEscopo(leads: Lead[], escopo: Escopo) {
  if (escopo === "todos") return leads;
  return leads.filter((lead) => ehCasimiro(lead) === (escopo === "casimiro"));
}

// Da mais perto de Casimiro para a mais longe; cidade nova entra no fim, em ordem alfabética.
const ORDEM_CIDADES = [CASIMIRO, ...DISTRITOS.map(([nome]) => nome), "Rio das Ostras", "Macaé"];

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
    nomeLoja: /\bmuay|\bjiu|\blutas?\b|\bboxe\b|\bkarat|\bjud[oô]\b|\bcapoeira|\btaekwondo/i,
    certeza: {
      padrao: /\bmuay|\bjiu|\bbjj\b|\blutas?\b|\bboxe\b|\bkarat|\bjud[oô]\b|\btaekwondo|\bcapoeira|\bfight|\bct\b|centro de treinamento|\bteam\b/i,
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
    tipo: /dan[cç]a|\bdance|ballet|\bbal[eé]\b|zumba|forr[oó]|\bsamba|hip.?hop|\bjazz/i,
    nomeLoja: /\bdan[cç]a|\bdance|\bballet|\bbal[eé]\b|\bzumba/i,
    certeza: { padrao: /\bdan[cç]a|\bdance|\bballet|\bbal[eé]\b|\bzumba|\britmos\b/i, corrige: MODALIDADE },
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
    id: "lavajato",
    nome: "Lava-jato",
    opcao: "Lava-jato e estética automotiva",
    tipo: /lava.?jato|lava.?r[aá]pido|est[eé]tica (automotiva|auto|veicular)|detail|polimento|lavagem|insulfilm|envelopamento/i,
    nomeLoja: /lava.?jato|\bdetail|\bcar ?wash|est[eé]tica (automotiva|auto)/i,
    certeza: {
      padrao: /lava.?jato|\bdetail|\bcar ?wash|est[eé]tica (automotiva|auto)|polimento/i,
      corrige: ["estetica", "oficina", "geral"],
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
    certeza: { padrao: /\bfisio/i, corrige: ["salao", "estetica", "massagem", "academia", "geral"] },
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
    tipo: /sal[aã]o|beleza|cabel|manicure|nail|unhas?\b|sobrancel|c[ií]lios|maquia/i,
    nomeLoja: /\bsal[aã]o|\bbeleza|\bbeauty|\bstudio\b|\bcabel|\bhair|\bnails?\b|\bunhas?\b/i,
    noSite: SERVICOS,
    ondePlaca: " ainda na cadeira",
  },
  {
    id: "estetica",
    nome: "Clínica de estética",
    tipo: /est[eé]tic|depila|harmoniza|dermat|micropigment/i,
    nomeLoja: /\best[eé]tica\b/i,
    certeza: {
      padrao: /cl[ií]nica[^|]*est[eé]tica|centro de [^|]*est[eé]tica|harmoniza/i,
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
    tipo: /hamb|burg|lanch|hot ?dog|pastel|salgad/i,
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
    tipo: /restaur|churras|grill|marmit|gastronom|steak|self.?service/i,
    nomeLoja: /\brestaurante|\bchurrasc|\bgrill\b|\bmarmit|\bgastronomia|\bsteak/i,
    noSite: CARDAPIO,
    ondePlaca: " enquanto espera o pedido",
  },
  {
    id: "pet",
    nome: "Pet shop",
    opcao: "Pet shop e veterinária",
    tipo: /\bpet|veterin|ra[cç][oõ]es|agropecu/i,
    nomeLoja: /\bpet\b|\bpetshop|\bveterin|\bra[cç][oõ]es/i,
    noSite: "os serviços, os horários e um botão pra agendar pelo WhatsApp",
    ondePlaca: " quando busca o bichinho",
  },
  {
    id: "oficina",
    nome: "Oficina mecânica",
    tipo: /oficina|mec[aâ]nic|auto|diesel|motor|lanterna|funilaria|radiador|pneu|borrach|moto|lava.?jato/i,
    nomeLoja: /\boficina|\bmec[aâ]nica|\bauto\b|\bautomotiv|\bdiesel|\bmotos?\b|\bpneus?\b|lava.?jato|lanternagem/i,
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
    id: "moda",
    nome: "Loja de roupas",
    opcao: "Roupas, calçados e acessórios",
    tipo: /roupa|\bmoda\b|vestu[aá]rio|boutique|cal[cç]ados?\b|sapat|lingerie|\bnoivas?\b|bijuter|acess[oó]rios femininos|loja infantil|moda infantil|confec[cç]/i,
    nomeLoja: /\bmodas?\b|\bboutique|\bcal[cç]ados|\bconfec[cç]/i,
    noSite: "as novidades com foto, os tamanhos e um botão que já abre o WhatsApp pra reservar a peça",
    ondePlaca: " no caixa",
  },
  {
    id: "papelaria",
    nome: "Papelaria",
    tipo: /papelar|livrar|armarinho/i,
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
    tipo: /constru|\btintas?\b|madeireir|ferragen|ferrament|el[eé]tric[oa] e hidr|hidr[aá]ulic|vidra[cç]|marmor|serralher|home ?center/i,
    nomeLoja: /\bconstru|\btintas\b|\bmadeireira|\bferragens|\bvidra[cç]aria|\bmateriais/i,
    noSite: "os produtos, o horário, o mapa e um botão pra pedir orçamento pelo WhatsApp",
    ondePlaca: " no balcão",
  },
  {
    id: "mercado",
    nome: "Mercado",
    opcao: "Mercado, mercearia e hortifrúti",
    tipo: /mercad|mercearia|hortifr|sacol[aã]o|atacad|a[cç]ougue|frutar|emp[oó]rio/i,
    nomeLoja: /\bmercad|\bmercearia|\bhortifr|\bsacol[aã]o|\ba[cç]ougue/i,
    noSite: "as ofertas da semana, o horário e um botão pra fazer o pedido pelo WhatsApp",
    ondePlaca: " no caixa",
  },
  {
    id: "farmacia",
    nome: "Farmácia",
    tipo: /farm[aá]c|drogaria|manipula/i,
    nomeLoja: /\bfarma|\bdrogaria/i,
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
export function ramoDe(lead: Pick<Lead, "nome" | "tipo" | "ramo">): Ramo {
  const escolhido = RAMOS.find((r) => r.id === lead.ramo);
  if (escolhido) return escolhido;
  const base =
    RAMOS.find((r) => r.tipo.test(lead.tipo ?? "")) ??
    RAMOS.find((r) => r.nomeLoja?.test(lead.nome)) ??
    GERAL;
  return (
    RAMOS.find((r) => r.certeza?.corrige.includes(base.id) && r.certeza.padrao.test(lead.nome)) ?? base
  );
}

function fraseSite(lead: Lead) {
  const ramo = ramoDe(lead);
  if (ramo.id === "geral") return `Eu monto o site com ${GERAL.noSite}.`;
  const tipo = lead.tipo?.trim();
  // O tipo do Google só entra na frase quando é do mesmo ramo (a massoterapeuta não é "salão de beleza").
  const quem = ramo.quem ?? (tipo && ramo.tipo.test(tipo) ? tipo : ramo.nome).toLowerCase();
  return `Pra ${quem} eu monto o site com ${ramo.noSite}.`;
}

/** `nela`: a frase vem logo depois de falar da plaquinha; senão ela se apresenta sozinha. */
function frasePlaca(lead: Lead, nela: boolean) {
  const onde = ramoDe(lead).ondePlaca;
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
  casimiroAgenda: { curto: "Visita: horário", longo: "Pedindo visita: horário marcado online (barbearia)" },
  foraAgenda: { curto: "WhatsApp: horário", longo: "Horário marcado online por WhatsApp, para barbearia onde não dá pra ir" },
  depoisAgenda: { curto: "2ª: horário", longo: "Horário marcado depois de outra mensagem, sem repetir o oi" },
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
  casimiroAgenda: `${APRESENTACAO_CASIMIRO}\nTô começando um sistema de horário marcado pra barbearia aqui da cidade: o cliente escolhe o serviço e o horário pelo celular, e já fica marcado na sua agenda.\nVocê não precisa parar o corte pra responder mensagem.\nPosso passar aí pra te mostrar como funciona? É rapidinho. ${VISITA}`,
  foraAgenda:
    "Oi, {saudacao}, tudo certo? Aqui é o Brenno, da BN Digital. Sou de Casimiro{pertinho}.\nTô começando um sistema de horário marcado pra barbearia: o cliente escolhe o serviço e o horário pelo celular, e já fica marcado na sua agenda, sem você parar o corte pra responder mensagem.\nQuer que eu te mostre como funciona? Se não for a hora, tranquilo, é só falar.",
  depoisAgenda:
    "Ah, e aproveitando: tô começando um sistema de horário marcado pra barbearia. O cliente escolhe o horário pelo celular e já fica marcado na sua agenda.\nSe quiser, te mostro como funciona.",
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

/** Horário marcado online: por enquanto só para barbearia (de Casimiro, dos distritos ou de fora). */
export const ofereceAgenda = (lead: Lead) => ramoDe(lead).id === "barbearia";

/** Nada mandado ainda para essa loja (nem oferta, nem pedido para falar com o dono). */
export const nadaEnviado = (lead: Lead) => ENVIOS.every((envio) => !dataEnvio(lead, envio));

/**
 * Opção que abre escolhida na ficha. Em Casimiro, sem nada enviado: as duas ofertas numa mensagem só.
 * Depois: a oferta que falta e, com as duas mandadas, o pedido para falar com o dono.
 */
export function ofertaInicial(lead: Lead): Oferta {
  // Barbearia sem contato nenhum começa pelo horário marcado (a novidade de 18/11).
  if (ofereceAgenda(lead) && nadaEnviado(lead)) return "agenda";
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
  return ([sugerido, outro, "dono"] as const).find((envio) => !mandou(envio)) ?? acabou ?? sugerido;
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
  return (textos[chave]?.trim() || TEXTOS_PADRAO[chave])
    .replaceAll("{saudacao}", saudacao(agora))
    .replaceAll("{nome}", lead.nome || "sua empresa")
    .replaceAll("{pertinho}", ehCasimiro(lead) ? " também" : `, pertinho de ${cidadeDe(lead)}`)
    .replaceAll("{cidade}", cidadeDe(lead))
    .replaceAll("{nichoSite}", fraseSite(lead))
    .replaceAll("{nichoPlaca}", frasePlaca(lead, false))
    .replaceAll("{nicho}", TEXTOS_DE_PLACA.has(chave) ? frasePlaca(lead, true) : fraseSite(lead))
    .replaceAll("{elogio}", elogio)
    .replaceAll("{avaliacoes}", lead.avaliacoes != null ? String(lead.avaliacoes) : "várias");
}

export function textoMensagem(textos: Textos, lead: Lead, oferta: Oferta, agora = new Date()) {
  return preencher(textos, chaveTexto(lead, oferta), lead, agora);
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

// O painel não guarda endereço: a busca por nome e cidade abre a ficha da loja no Google Maps.
export const linkMaps = (lead: Lead) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${lead.nome} ${cidadeDe(lead)} RJ`)}`;

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
  `https://www.google.com/search?q=${encodeURIComponent(`${lead.nome} ${cidadeDe(lead)} instagram`)}`;

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

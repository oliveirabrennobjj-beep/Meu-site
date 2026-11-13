export type Status = "novo" | "enviado" | "respondeu" | "fechou" | "depois" | "nao";
export type Escopo = "todos" | "casimiro" | "fora";
export type Produto = "site" | "placa";
/** Cada mensagem que fica registrada na loja: as duas ofertas e o pedido para falar com o dono. */
export type Envio = Produto | "dono";

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
  /** Quando cada oferta foi feita; a mesma loja pode receber site e placa. */
  enviados?: Partial<Record<Envio, string>>;
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

export const ENVIOS: Envio[] = ["site", "placa", "dono"];

/** Comércios contatados hoje: a mesma loja conta uma vez, mesmo com site, placa e dono no mesmo dia. */
export function contatosHoje(leads: Lead[], agora = new Date()) {
  const hoje = agora.toDateString();
  const ehHoje = (data?: string | null) => Boolean(data) && new Date(data!).toDateString() === hoje;
  return leads.filter(
    (lead) => ehHoje(lead.enviadoEm) || ENVIOS.some((envio) => ehHoje(dataEnvio(lead, envio))),
  ).length;
}

/* Lugar ---------------------------------------------------------------------------------------- */

const CASIMIRO = "Casimiro de Abreu";
const BARRA = "Barra de São João";
const EM_BARRA = /barra de s[aã]o jo[aã]o/i;

// Barra de São João é distrito de Casimiro, mas fica longe do centro: para o Brenno conta como fora.
const emBarra = (lead: Lead) => EM_BARRA.test(lead.cidade ?? "") || EM_BARRA.test(lead.nome);

/** Comércio do centro de Casimiro, onde dá para ir falar com o dono pessoalmente. */
export const ehCasimiro = (lead: Lead) => /casimiro/i.test(lead.cidade ?? "") && !emBarra(lead);

/**
 * Dá para ir lá falar com o dono. Só vale para loja de Casimiro que o Brenno marcou: o cadastro do
 * Google diz "Casimiro de Abreu" também para lojas longe do centro, perto de Rio das Ostras.
 */
export const podeVisitar = (lead: Lead) => ehCasimiro(lead) && lead.visita === true;

/** A loja recebeu uma mensagem pedindo visita (as de placa e de dono só existem no fluxo de visita). */
export const recebeuPedidoDeVisita = (lead: Lead) =>
  lead.pediuVisita === true || Boolean(dataEnvio(lead, "placa")) || Boolean(dataEnvio(lead, "dono"));

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
  comida: "o cardápio com foto e um botão que já abre o pedido no WhatsApp",
  padaria: "os produtos, o horário e um botão pra encomendar pelo WhatsApp",
  beleza: "os serviços com foto, os horários e um botão pra marcar pelo WhatsApp",
  pet: "os serviços, os horários e um botão pra agendar pelo WhatsApp",
  geral: "o que vocês vendem, o horário, o mapa e um botão que já abre o WhatsApp",
};

// Onde o cliente está quando encosta o celular na placa.
const ONDE_PLACA: Record<Ramo, string> = {
  comida: " enquanto espera o pedido",
  padaria: " no caixa",
  beleza: " ainda na cadeira",
  pet: " quando busca o bichinho",
  geral: "",
};

function fraseSite(lead: Lead) {
  const ramo = ramoDe(lead.tipo);
  const tipo = lead.tipo?.trim();
  return tipo && ramo !== "geral"
    ? `Pra ${tipo.toLowerCase()} eu monto o site com ${NO_SITE[ramo]}.`
    : `Eu monto o site com ${NO_SITE.geral}.`;
}

/** `nela`: a frase vem logo depois de falar da plaquinha; senão ela se apresenta sozinha. */
function frasePlaca(lead: Lead, nela: boolean) {
  const onde = ONDE_PLACA[ramoDe(lead.tipo)];
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
  gostou: { curto: "Gostou", longo: "Quando a pessoa gostou: oferecer a demonstração" },
};

const APRESENTACAO_CASIMIRO = "Oi, {saudacao}, tudo certo? Aqui é o Brenno, sou daqui de Casimiro mesmo.";
const VISITA = "Se der, queria falar direto com o dono ou a dona. Qual horário fica melhor?";

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
  casimiroDono: `${APRESENTACAO_CASIMIRO}\nQueria mostrar pra {nome} um trabalho que faço pro comércio aqui da cidade: site e uma plaquinha de avaliação pro balcão.\nConsigo falar com o dono ou a dona? É rapidinho. Qual horário costuma ser melhor pra encontrar?`,
  depoisDono:
    "Ah, e quem eu procuro aí pra conversar sobre isso? Se puder ser o dono ou a dona, melhor, já mostro tudo pessoalmente.\nQual horário costuma ser melhor pra encontrar?",
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

/** Nada mandado ainda para essa loja (nem oferta, nem pedido para falar com o dono). */
export const nadaEnviado = (lead: Lead) => ENVIOS.every((envio) => !dataEnvio(lead, envio));

/**
 * Opção que abre escolhida na ficha. Em Casimiro, sem nada enviado: as duas ofertas numa mensagem só.
 * Depois: a oferta que falta e, com as duas mandadas, o pedido para falar com o dono.
 */
export function ofertaInicial(lead: Lead): Oferta {
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
  dono: "casimiroDono",
};
const CONTINUACAO: Record<Envio, Exclude<ChaveTexto, "gostou">> = {
  placa: "depoisPlaca",
  site: "depoisSite",
  dono: "depoisDono",
};

export function chaveTexto(lead: Lead, oferta: Oferta): Exclude<ChaveTexto, "gostou"> {
  if (!podeVisitar(lead)) return "fora";
  if (oferta === "ambas") return "casimiroAmbas";
  const dataEsta = dataEnvio(lead, oferta);
  const antes = ENVIOS.filter((envio) => envio !== oferta)
    .map((envio) => dataEnvio(lead, envio))
    .filter((data): data is string => Boolean(data))
    .sort()[0];
  // Outra mensagem já abriu a conversa: esta entra como continuação, sem novo "oi".
  return antes && (!dataEsta || antes < dataEsta) ? CONTINUACAO[oferta] : ABERTURA[oferta];
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

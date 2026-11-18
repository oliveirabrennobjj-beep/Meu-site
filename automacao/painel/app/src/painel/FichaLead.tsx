import { useEffect, useState } from "react";
import {
  ArrowRight,
  Check,
  Copy,
  ExternalLink,
  Handshake,
  Instagram,
  LayoutDashboard,
  MapPin,
  MessageCircle,
  MonitorSmartphone,
  Search,
  Send,
  Star,
  X,
} from "lucide-react";
import {
  BlockButton,
  BlockDrawer,
  IconButton,
  InitialsAvatar,
  buttonClass,
} from "@/components/ui/app-dashboard-shell-utils/app-block-kit";
import { SegmentedControl, type SegmentOption } from "@/components/ui/dashboard-parts";
import { cn } from "@/lib/utils";
import { Anotar } from "./Anotar";
import { Demonstracao } from "./Demonstracao";
import { SistemaPrevia } from "./SistemaPrevia";
import { StatusChip } from "./TabelaLeads";
import {
  MOTIVO_TIRADA,
  RAMOS,
  RAMOS_ESCOLHA,
  STATUS,
  buscaInstagram,
  chaveTexto,
  cidadeDe,
  dataEnvio,
  ehCasimiro,
  podeVisitar,
  ramoDe,
  recebeuPedidoDeVisita,
  textoCorrecao,
  fmtInt,
  fmtNota,
  instagramDe,
  linkMaps,
  linkWhatsApp,
  motivoTirada,
  ENVIOS,
  sistemaDe,
  textosSistema,
  ofertaInicial,
  proximaOferta,
  paginaDe,
  statusDe,
  textoGostou,
  textoMensagem,
  tipoDe,
  type Envio,
  type Lead,
  type MotivoTirada,
  type Oferta,
  type RamoId,
  type Status,
  type Textos,
} from "./leads";

const DESFECHOS: [Status, string][] = [
  ["respondeu", "Respondeu"],
  ["fechou", "Fechou"],
  ["depois", "Mais pra frente"],
  ["nao", "Não quer"],
  ["enviado", "Sem resposta"],
  ["novo", "Não enviei"],
];

const OFERTA: Record<Envio, { nome: string; oferecer: string; enviada: string; feito: string }> = {
  // O sistema da loja (horário marcado ou controle de alunos); o nome no botão vem de textosSistema.
  agenda: {
    nome: "Sistema",
    oferecer: "Oferecer o sistema",
    enviada: "Sistema: mensagem já enviada",
    feito: "Mensagem do sistema enviada",
  },
  placa: {
    nome: "Placa",
    oferecer: "Oferecer a placa de avaliações",
    enviada: "Placa: mensagem já enviada",
    feito: "Mensagem da placa enviada",
  },
  site: {
    nome: "Site",
    oferecer: "Oferecer o site",
    enviada: "Site: mensagem já enviada",
    feito: "Mensagem do site enviada",
  },
  dono: {
    nome: "Dono",
    oferecer: "Pedir para falar com o dono",
    enviada: "Dono: pedido já enviado",
    feito: "Pedido para falar com o dono enviado",
  },
};

const AS_DUAS: SegmentOption<Oferta> = {
  id: "ambas",
  label: "AS DUAS",
  long: "Oferecer site e placa na mesma mensagem",
};

function quando(iso: string) {
  const data = new Date(iso);
  if (data.toDateString() === new Date().toDateString()) return "hoje";
  return `em ${data.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}`;
}

const rotuloCampo = "mb-1.5 text-[12.5px] font-medium text-[color:var(--bjork-text-muted)]";

/** Ficha de um comércio: mensagem pronta, envio pelo WhatsApp e o que aconteceu depois. */
export function FichaLead({
  lead,
  textos,
  proximo,
  onFechar,
  onSalvar,
  onAbrir,
  avisar,
}: {
  lead: Lead | null;
  textos: Textos;
  /** Próximo comércio ainda sem contato, na mesma cidade. */
  proximo: Lead | null;
  onFechar: () => void;
  onSalvar: (id: string, mudanca: Partial<Lead>) => void;
  onAbrir: (lead: Lead) => void;
  avisar: (texto: string) => void;
}) {
  // Guarda o último comércio para o conteúdo não sumir enquanto a ficha desce.
  const [mostrado, setMostrado] = useState(lead);
  useEffect(() => {
    if (lead) setMostrado(lead);
  }, [lead]);
  const atual = lead ?? mostrado;

  return (
    <BlockDrawer
      open={lead !== null}
      onClose={onFechar}
      label={atual ? `Ficha de ${atual.nome}` : "Ficha"}
      side="bottom"
    >
      {atual && (
        <Conteudo
          key={atual.id}
          lead={atual}
          textos={textos}
          proximo={proximo}
          onFechar={onFechar}
          onSalvar={onSalvar}
          onAbrir={onAbrir}
          avisar={avisar}
        />
      )}
    </BlockDrawer>
  );
}

function Conteudo({
  lead,
  textos,
  proximo,
  onFechar,
  onSalvar,
  onAbrir,
  avisar,
}: {
  lead: Lead;
  textos: Textos;
  proximo: Lead | null;
  onFechar: () => void;
  onSalvar: (id: string, mudanca: Partial<Lead>) => void;
  onAbrir: (lead: Lead) => void;
  avisar: (texto: string) => void;
}) {
  const status = statusDe(lead);
  const novo = status === "novo";
  // Só em loja marcada como "dá pra ir" as mensagens pedem visita; o resto vai por WhatsApp.
  const daqui = podeVisitar(lead);
  const corrigir = !daqui && recebeuPedidoDeVisita(lead) && !lead.corrigidoEm;
  const [escolhida, setOferta] = useState<Oferta>(() => ofertaInicial(lead));
  const [demo, setDemo] = useState(false);
  const [verSistema, setVerSistema] = useState(false);
  // Fora de Casimiro a oferta é o site; nos ramos com sistema, também o sistema.
  const agendaOk = sistemaDe(lead) !== null;
  const sis = textosSistema(lead);
  const oferta: Oferta = !daqui ? (agendaOk && escolhida === "agenda" ? "agenda" : "site") : escolhida;
  const site = dataEnvio(lead, "site");
  const placa = dataEnvio(lead, "placa");
  // "As duas" conta como enviada quando site e placa já foram (juntas ou uma de cada vez).
  const ambasEnviada = site && placa ? (site > placa ? site : placa) : null;
  const enviada = oferta === "ambas" ? ambasEnviada : dataEnvio(lead, oferta);
  const chave = chaveTexto(lead, oferta);
  const continuacao =
    chave === "depoisPlaca" || chave === "depoisSite" || chave === "depoisDono" || chave === "depoisAgenda";
  const mensagem = textoMensagem(textos, lead, oferta);
  const opcoes: SegmentOption<Oferta>[] = [
    // Fica sempre na lista: se o WhatsApp não abrir, dá para voltar nela e mandar de novo.
    ambasEnviada ? { id: "ambas", label: "AS DUAS ✓", long: "As duas: mensagem já enviada" } : AS_DUAS,
    ...(["placa", "site", "dono"] as const).map(opcao),
    ...(agendaOk ? [opcao("agenda")] : []),
  ];
  // Loja de distrito ou de fora: só WhatsApp, com site ou sistema.
  const opcoesFora = [opcao("agenda"), opcao("site")];

  function opcao(id: Envio): SegmentOption<Oferta> {
    const feita = dataEnvio(lead, id) !== null;
    if (id === "agenda") return { id, label: `${sis.botao}${feita ? " ✓" : ""}`, long: feita ? OFERTA.agenda.enviada : sis.oferecer };
    return {
      id,
      label: `${OFERTA[id].nome.toUpperCase()}${feita ? " ✓" : ""}`,
      long: feita ? OFERTA[id].enviada : OFERTA[id].oferecer,
    };
  }

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(mensagem);
      avisar("Mensagem copiada");
    } catch {
      avisar("Não deu para copiar. Segure no texto e copie.");
    }
  };

  const registrarContato = (canal: "whatsapp" | "pessoal") => {
    const agora = new Date().toISOString();
    const enviados: Partial<Record<Envio, string>> = {};
    for (const id of ENVIOS) {
      const anterior = dataEnvio(lead, id);
      if ((oferta === "ambas" && (id === "site" || id === "placa")) || oferta === id) enviados[id] = agora;
      else if (anterior) enviados[id] = anterior;
    }
    onSalvar(lead.id, {
      // Mandar a segunda oferta não desfaz o que já foi marcado (respondeu, fechou…).
      ...(novo ? { status: "enviado" } : {}),
      enviadoEm: agora,
      produto: oferta,
      canal,
      enviados,
      ...(daqui ? { pediuVisita: true } : {}),
    });
    // Já deixa escolhida a próxima mensagem (a oferta que falta, depois o pedido para falar com o dono).
    setOferta(proximaOferta(lead, oferta));
  };

  const mudarStatus = (para: Status) => {
    onSalvar(
      lead.id,
      para === "novo"
        ? { status: para, enviadoEm: "", enviados: { site: "", placa: "", agenda: "", dono: "" } }
        : { status: para },
    );
    avisar(`${lead.nome}: ${STATUS[para].label.toLowerCase()}`);
  };

  const ramo = ramoDe(lead);
  const mudarRamo = (id: RamoId) => {
    const novoRamo = RAMOS.find((r) => r.id === id);
    if (!novoRamo || novoRamo.id === ramo.id) return;
    onSalvar(lead.id, {
      ramo: novoRamo.id,
      // O tipo do Google fica quando já é desse ramo (ex.: "Muay Thai" numa academia de luta).
      ...(novoRamo.id === "geral" || novoRamo.tipo.test(lead.tipo ?? "") ? {} : { tipo: novoRamo.nome }),
    });
    avisar(`${lead.nome}: ${(novoRamo.opcao ?? novoRamo.nome).toLowerCase()}`);
  };

  const tirada = motivoTirada(lead);
  const tirar = (motivo: MotivoTirada) => {
    onSalvar(lead.id, { tirada: { motivo, em: new Date().toISOString() } });
    avisar(`${lead.nome} saiu da lista: ${MOTIVO_TIRADA[motivo].frase}`);
    if (proximo) onAbrir(proximo);
    else onFechar();
  };

  return (
    <>
      <div aria-hidden="true" className="mx-auto mt-2 h-1 w-9 shrink-0 rounded-full bg-[var(--bjork-border-strong)]" />
      <header className="flex shrink-0 items-start gap-3 px-5 pb-3 pt-3">
        <InitialsAvatar name={lead.nome} size={42} />
        <div className="min-w-0 flex-1">
          <h2 className="text-[17px] font-semibold leading-tight tracking-[-0.01em] [overflow-wrap:anywhere]">
            {lead.nome}
          </h2>
          <p className="mt-0.5 text-[13px] text-[color:var(--bjork-text-muted)]">
            {tipoDe(lead)} · {cidadeDe(lead)}
          </p>
        </div>
        <IconButton label="Fechar ficha" onClick={onFechar}>
          <X />
        </IconButton>
      </header>

      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto overscroll-contain px-5 pb-6">
        <dl className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px]">
          <div>
            <dt className="sr-only">Situação</dt>
            <dd>
              <StatusChip status={status} longo />
            </dd>
          </div>
          <div className="flex items-baseline gap-1.5">
            <dt className="text-[color:var(--bjork-text-muted)]">Nota</dt>
            <dd className="font-mono font-medium tabular-nums">
              {lead.nota != null && (
                <Star
                  aria-hidden="true"
                  className="mr-1 inline size-3.5 -translate-y-px fill-[var(--bjork-accent)] text-[color:var(--bjork-accent)]"
                />
              )}
              {fmtNota(lead.nota)}
            </dd>
          </div>
          <div className="flex items-baseline gap-1.5">
            <dt className="text-[color:var(--bjork-text-muted)]">Avaliações</dt>
            <dd className="font-mono font-medium tabular-nums">{fmtInt(lead.avaliacoes)}</dd>
          </div>
          {lead.telefone && (
            <div className="flex items-baseline gap-1.5">
              <dt className="text-[color:var(--bjork-text-muted)]">Telefone</dt>
              <dd className="select-all font-mono tabular-nums">{lead.telefone}</dd>
            </div>
          )}
        </dl>

        {tirada && (
          <div className="flex flex-col gap-2 rounded-[12px] border border-[color:var(--bjork-border-strong)] bg-[var(--bjork-surface)] p-3">
            <p className="text-[13px] leading-snug">
              Tirada da lista {lead.tirada?.em ? quando(lead.tirada.em) : ""}: {MOTIVO_TIRADA[tirada].frase}. Não
              aparece nas listas nem conta nos números do painel.
            </p>
            <BlockButton
              variant="secondary"
              className="w-full"
              onClick={() => {
                onSalvar(lead.id, { tirada: null });
                avisar(`${lead.nome} voltou pra lista`);
              }}
            >
              Voltar pra lista
            </BlockButton>
          </div>
        )}

        <SobreALoja lead={lead} />
        <BlockButton variant="secondary" size="lg" className="w-full" onClick={() => setDemo(true)}>
          <MonitorSmartphone aria-hidden="true" />
          Mostrar demonstração do site
        </BlockButton>
        {demo && (
          <Demonstracao lead={lead} mensagem={textoPrevia(lead)} onFechar={() => setDemo(false)} onRamo={mudarRamo} />
        )}
        {agendaOk && (
          <BlockButton variant="secondary" size="lg" className="w-full" onClick={() => setVerSistema(true)}>
            <LayoutDashboard aria-hidden="true" />
            Mostrar o sistema ({sis.nome})
          </BlockButton>
        )}
        {verSistema && (
          <SistemaPrevia
            lead={lead}
            mensagem={`Olha como ficaria o sistema de ${sis.nome} pra ${lead.nome}, no notebook e no celular. Posso te mostrar como funciona?`}
            onFechar={() => setVerSistema(false)}
          />
        )}
        <label className="-mt-1 flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5">
          <span className="text-[13px] font-medium">
            Ramo da loja
            <span className="block text-[12px] font-normal text-[color:var(--bjork-text-muted)]">
              Muda a prévia e o texto da mensagem
            </span>
          </span>
          <select
            value={ramo.id}
            onChange={(e) => mudarRamo(e.target.value as RamoId)}
            className="h-10 min-w-0 max-w-full cursor-pointer rounded-[10px] border border-[color:var(--bjork-border-strong)] bg-[var(--bjork-field)] px-3 text-[13.5px] font-medium text-[color:var(--bjork-text)] focus-visible:border-[color:var(--bjork-accent)] focus-visible:outline-none"
          >
            {RAMOS_ESCOLHA.map((r) => (
              <option key={r.id} value={r.id}>
                {r.opcao ?? r.nome}
              </option>
            ))}
          </select>
        </label>

        {ehCasimiro(lead) && (
          <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
            <p className="text-[13px] font-medium">Dá pra ir lá pessoalmente?</p>
            <SegmentedControl
              value={daqui ? "sim" : "nao"}
              onChange={(valor) => {
                const visita = valor === "sim";
                onSalvar(lead.id, { visita });
                setOferta(ofertaInicial({ ...lead, visita }));
              }}
              options={[
                { id: "nao", label: "NÃO", long: "Não dá pra ir: mensagem só por WhatsApp" },
                { id: "sim", label: "SIM", long: "Dá pra ir: mensagem pedindo visita" },
              ]}
              label="Dá pra ir lá pessoalmente"
            />
          </div>
        )}

        {corrigir && (
          <div className="flex flex-col gap-2 rounded-[12px] border border-[color:var(--bjork-border-strong)] bg-[var(--bjork-accent-soft)] p-3">
            <p className="text-[13px] leading-snug">
              Essa loja recebeu mensagem pedindo visita. Avise que a conversa segue por aqui:
            </p>
            <p className="whitespace-pre-wrap text-[13px] leading-relaxed text-[color:var(--bjork-text-medium)]">
              {textoCorrecao(lead)}
            </p>
            <a
              href={linkWhatsApp(lead, textoCorrecao(lead))}
              target="_blank"
              rel="noopener noreferrer"
              // Depois do toque: salvar tira este link da tela, e link fora da tela pode não abrir.
              onClick={() => window.setTimeout(() => onSalvar(lead.id, { corrigidoEm: new Date().toISOString() }), 0)}
              className={buttonClass("primary", "lg", "w-full")}
            >
              <Send aria-hidden="true" />
              Mandar a correção
            </a>
          </div>
        )}

        {(novo || daqui || status === "enviado") && (
          <>
            {daqui && (
              <div className="flex flex-col gap-2">
                <p className="text-[13px] text-[color:var(--bjork-text-medium)]">
                  {novo
                    ? "É daqui: vale ir falar com o dono."
                    : (["placa", "site", "agenda", "dono"] as const)
                        .flatMap((id) => {
                          const data = dataEnvio(lead, id);
                          if (id === "dono") return data ? [`Dono: pedido ${quando(data)}`] : [];
                          if (id === "agenda" && !agendaOk) return [];
                          return [`${OFERTA[id].nome}: ${data ? `enviada ${quando(data)}` : "falta enviar"}`];
                        })
                        .join(" · ")}
                </p>
                <SegmentedControl
                  value={oferta}
                  onChange={setOferta}
                  options={opcoes}
                  label="O que oferecer"
                />
              </div>
            )}
            {!daqui && agendaOk && (
              <SegmentedControl value={oferta} onChange={setOferta} options={opcoesFora} label="O que oferecer" />
            )}
            <div>
              <h3 className={rotuloCampo}>
                {!daqui
                  ? continuacao
                    ? `Continuação da conversa, sem repetir o oi (${sis.nome})`
                    : `Mensagem pronta (${oferta === "agenda" ? sis.nome : "site"})`
                  : continuacao
                    ? `Continuação da conversa, sem repetir o oi (${OFERTA[oferta === "ambas" ? "site" : oferta].nome.toLowerCase()})`
                    : oferta === "dono"
                      ? "Mensagem pedindo para falar com o dono"
                      : `Mensagem para marcar a visita (${oferta === "ambas" ? "site e placa" : oferta === "agenda" ? sis.nome : oferta})`}
              </h3>
              <p className="max-h-[210px] select-text overflow-y-auto whitespace-pre-wrap rounded-[12px] border border-[color:var(--bjork-border)] bg-[var(--bjork-field-inset)] p-3 text-[13.5px] leading-relaxed text-[color:var(--bjork-text-medium)] [overflow-wrap:anywhere]">
                {mensagem}
              </p>
            </div>
            {enviada && (
              <p
                className="-mt-1 flex items-center gap-1.5 text-[13px] font-medium"
                style={{ color: "var(--blk-success)" }}
              >
                <Check aria-hidden="true" className="size-4" />
                {oferta === "ambas" ? "Mensagem das duas ofertas enviada" : OFERTA[oferta].feito} {quando(enviada)}.
              </p>
            )}
            <a
              href={linkWhatsApp(lead, mensagem)}
              target="_blank"
              rel="noopener noreferrer"
              // Registrar troca a mensagem da tela, e com ela o endereço deste link. Fica para depois
              // do toque: assim o WhatsApp abre com o texto que o Brenno viu, não com o próximo.
              onClick={() => window.setTimeout(() => registrarContato("whatsapp"), 0)}
              className={buttonClass(enviada ? "secondary" : "primary", "lg", "w-full")}
            >
              <Send aria-hidden="true" />
              {enviada ? "Enviar de novo" : "Enviar no WhatsApp"}
            </a>
            <div className="flex flex-wrap gap-2">
              {daqui && !enviada && (
                <BlockButton
                  variant="secondary"
                  className="flex-1"
                  onClick={() => {
                    registrarContato("pessoal");
                    avisar("Anotado. Agora marque o que aconteceu.");
                  }}
                >
                  <Handshake aria-hidden="true" />
                  Falei pessoalmente
                </BlockButton>
              )}
              <BlockButton variant="secondary" className="flex-1" onClick={copiar}>
                <Copy aria-hidden="true" />
                Copiar mensagem
              </BlockButton>
            </div>
            {daqui && novo && <RoteiroPresencial placa={oferta !== "site"} />}
          </>
        )}

        {!novo && (
          <>
            {status === "enviado" && proximo && (
              <BlockButton
                size="lg"
                // Com oferta ainda por mandar nesta loja, o destaque fica no botão de enviar.
                variant={daqui && !enviada ? "secondary" : "primary"}
                className="w-full"
                onClick={() => onAbrir(proximo)}
              >
                <span className="truncate">Próximo: {proximo.nome}</span>
                <ArrowRight aria-hidden="true" />
              </BlockButton>
            )}
            {status === "respondeu" && (
              <BlockButton
                size="lg"
                variant={corrigir ? "secondary" : "primary"}
                className="w-full"
                onClick={() => setDemo(true)}
              >
                <Send aria-hidden="true" />
                Mandar prévia do site com foto
              </BlockButton>
            )}
            {status === "respondeu" && (
              <a
                href={linkWhatsApp(lead, textoGostou(textos, lead))}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonClass("ghost", "md", "w-full")}
              >
                Só oferecer a demonstração por texto
              </a>
            )}
            <fieldset>
              <legend className={rotuloCampo}>O que aconteceu?</legend>
              <div className="flex flex-wrap gap-2">
                {DESFECHOS.filter(([para]) => para !== status).map(([para, rotulo]) => (
                  <BlockButton
                    key={para}
                    variant={para === "novo" ? "ghost" : "secondary"}
                    onClick={() => mudarStatus(para)}
                  >
                    {rotulo}
                  </BlockButton>
                ))}
              </div>
            </fieldset>
          </>
        )}

        {!tirada && (
          <fieldset>
            <legend className={rotuloCampo}>Não dá pra falar com essa loja? Tira da lista:</legend>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(MOTIVO_TIRADA) as MotivoTirada[]).map((motivo) => (
                <BlockButton key={motivo} variant="secondary" onClick={() => tirar(motivo)}>
                  {MOTIVO_TIRADA[motivo].botao}
                </BlockButton>
              ))}
            </div>
          </fieldset>
        )}

        <Anotar lead={lead} onSalvar={onSalvar} avisar={avisar} />
      </div>
    </>
  );
}

/** Vai junto com a foto da prévia: sem preço e sem prometer visita. */
function textoPrevia(lead: Lead) {
  return `Fiz uma prévia de como ficaria o site da ${lead.nome}. Dá uma olhada na foto! Se gostar, eu monto a versão completa com as fotos, os produtos e os horários de vocês.`;
}

/** Lembrete curto da abordagem presencial (roteiro completo em bn-digital/prospeccao). */
function RoteiroPresencial({ placa }: { placa: boolean }) {
  return (
    <details className="rounded-[12px] border border-[color:var(--bjork-border)] bg-[var(--bjork-surface)] px-3.5 py-2.5 text-[13px]">
      <summary className="cursor-pointer font-medium">Roteiro para falar pessoalmente</summary>
      <ol className="mt-2 list-decimal space-y-1.5 pl-5 leading-snug text-[color:var(--bjork-text-medium)]">
        <li>Chegue com o balcão vazio e peça para falar com o dono.</li>
        <li>
          Abra com: “Você concorda que comércio bem avaliado no Google atrai mais cliente?”
        </li>
        <li>
          {placa
            ? "Encoste o celular na plaquinha e deixe o dono testar na mão dele."
            : "Mostre no celular um site que você já fez e onde fica o botão do WhatsApp."}
        </li>
        <li>Preço só depois que ele disser que faz sentido.</li>
      </ol>
    </details>
  );
}

/** Atalhos para conhecer a loja antes de falar com ela: mapa, Instagram e WhatsApp. */
function SobreALoja({ lead }: { lead: Lead }) {
  const instagram = instagramDe(lead);
  const pagina = paginaDe(lead);
  const temWhatsApp = /\d/.test(lead.whatsapp);
  const outro = (lead.outroWhatsapp ?? "").replace(/\D/g, "");
  const quantos = 2 + (pagina ? 1 : 0) + (temWhatsApp ? 1 : 0) + (outro ? 1 : 0);
  const atalho = buttonClass("secondary", "md", "min-w-0 px-2.5 text-[13px]");
  const nova = { target: "_blank", rel: "noopener noreferrer" };
  return (
    <div>
      <h3 className={rotuloCampo}>Sobre a loja</h3>
      <div className={cn("grid gap-2", quantos === 3 ? "grid-cols-3" : "grid-cols-2")}>
        <a href={linkMaps(lead)} {...nova} aria-label="Ver no Google Maps" className={atalho}>
          <MapPin aria-hidden="true" />
          <span className="truncate">Google Maps</span>
        </a>
        {instagram ? (
          <a
            href={instagram.url}
            {...nova}
            aria-label={`Ver o Instagram ${instagram.arroba}`}
            className={atalho}
          >
            <Instagram aria-hidden="true" />
            <span className="truncate">{instagram.arroba}</span>
          </a>
        ) : (
          <a
            href={buscaInstagram(lead)}
            {...nova}
            aria-label="Buscar Instagram da loja no Google"
            className={atalho}
          >
            <Search aria-hidden="true" />
            <span className="truncate">Buscar Instagram</span>
          </a>
        )}
        {pagina && (
          <a href={pagina} {...nova} aria-label="Ver a página da loja" className={atalho}>
            <ExternalLink aria-hidden="true" />
            <span className="truncate">Página da loja</span>
          </a>
        )}
        {temWhatsApp && (
          <a
            href={linkWhatsApp(lead, "")}
            {...nova}
            aria-label="Abrir o WhatsApp da loja"
            className={atalho}
          >
            <MessageCircle aria-hidden="true" />
            <span className="truncate">WhatsApp</span>
          </a>
        )}
        {outro && (
          <a
            href={`https://wa.me/${outro}`}
            {...nova}
            aria-label={`Abrir o outro número que o Google mostra: ${outro.slice(2)}`}
            className={atalho}
          >
            <MessageCircle aria-hidden="true" />
            <span className="truncate">Outro número</span>
          </a>
        )}
      </div>
    </div>
  );
}

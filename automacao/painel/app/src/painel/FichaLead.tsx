import { useEffect, useState } from "react";
import {
  ArrowRight,
  Check,
  Copy,
  ExternalLink,
  Handshake,
  Instagram,
  MapPin,
  MessageCircle,
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
  fieldClass,
} from "@/components/ui/app-dashboard-shell-utils/app-block-kit";
import { SegmentedControl, type SegmentOption } from "@/components/ui/dashboard-parts";
import { cn } from "@/lib/utils";
import { StatusChip } from "./TabelaLeads";
import {
  STATUS,
  buscaInstagram,
  chaveTexto,
  cidadeDe,
  dataEnvio,
  ehCasimiro,
  podeVisitar,
  recebeuPedidoDeVisita,
  textoCorrecao,
  fmtInt,
  fmtNota,
  instagramDe,
  linkMaps,
  linkWhatsApp,
  nadaEnviado as semEnvios,
  ofertaInicial,
  proximaOferta,
  paginaDe,
  statusDe,
  textoGostou,
  textoMensagem,
  tipoDe,
  type Envio,
  type Lead,
  type Oferta,
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
  const nadaEnviado = semEnvios(lead);
  // Fora de Casimiro a oferta é sempre o site; "as duas" só vale antes do primeiro envio.
  const oferta: Oferta = !daqui ? "site" : escolhida === "ambas" && !nadaEnviado ? ofertaInicial(lead) : escolhida;
  const enviada = oferta === "ambas" ? null : dataEnvio(lead, oferta);
  const chave = chaveTexto(lead, oferta);
  const continuacao = chave === "depoisPlaca" || chave === "depoisSite" || chave === "depoisDono";
  const mensagem = textoMensagem(textos, lead, oferta);
  const [obs, setObs] = useState(lead.obs ?? "");
  const opcoes: SegmentOption<Oferta>[] = [
    ...(nadaEnviado ? [AS_DUAS] : []),
    ...(["placa", "site", "dono"] as const).map((id) => {
      const feita = dataEnvio(lead, id) !== null;
      return {
        id,
        label: `${OFERTA[id].nome.toUpperCase()}${feita ? " ✓" : ""}`,
        long: feita ? OFERTA[id].enviada : OFERTA[id].oferecer,
      };
    }),
  ];

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
    for (const id of ["site", "placa", "dono"] as const) {
      const anterior = dataEnvio(lead, id);
      if ((oferta === "ambas" && id !== "dono") || oferta === id) enviados[id] = agora;
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
        ? { status: para, enviadoEm: "", enviados: { site: "", placa: "", dono: "" } }
        : { status: para },
    );
    avisar(`${lead.nome}: ${STATUS[para].label.toLowerCase()}`);
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

        <SobreALoja lead={lead} />

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
              onClick={() => onSalvar(lead.id, { corrigidoEm: new Date().toISOString() })}
              className={buttonClass("primary", "lg", "w-full")}
            >
              <Send aria-hidden="true" />
              Mandar a correção
            </a>
          </div>
        )}

        {(novo || daqui) && (
          <>
            {daqui && (
              <div className="flex flex-col gap-2">
                <p className="text-[13px] text-[color:var(--bjork-text-medium)]">
                  {novo
                    ? "É daqui: vale ir falar com o dono."
                    : (["placa", "site", "dono"] as const)
                        .flatMap((id) => {
                          const data = dataEnvio(lead, id);
                          if (id === "dono") return data ? [`Dono: pedido ${quando(data)}`] : [];
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
            <div>
              <h3 className={rotuloCampo}>
                {!daqui
                  ? "Mensagem pronta (site)"
                  : continuacao
                    ? `Continuação da conversa, sem repetir o oi (${OFERTA[oferta === "ambas" ? "site" : oferta].nome.toLowerCase()})`
                    : oferta === "dono"
                      ? "Mensagem pedindo para falar com o dono"
                      : `Mensagem para marcar a visita (${oferta === "ambas" ? "site e placa" : oferta})`}
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
                {OFERTA[oferta === "ambas" ? "site" : oferta].feito} {quando(enviada)}.
              </p>
            )}
            <a
              href={linkWhatsApp(lead, mensagem)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => registrarContato("whatsapp")}
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
              <a
                href={linkWhatsApp(lead, textoGostou(textos, lead))}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonClass(corrigir ? "secondary" : "primary", "lg", "w-full")}
              >
                <Send aria-hidden="true" />
                Oferecer demonstração do site
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

            <div>
              <label htmlFor={`obs-${lead.id}`} className={cn(rotuloCampo, "block")}>
                Anotação
              </label>
              <input
                id={`obs-${lead.id}`}
                value={obs}
                onChange={(event) => setObs(event.target.value)}
                onBlur={() => {
                  if (obs.trim() !== (lead.obs ?? "")) onSalvar(lead.id, { obs: obs.trim() });
                }}
                placeholder="Ex.: volta a falar em janeiro"
                autoComplete="off"
                className={cn(fieldClass, "h-11")}
              />
            </div>
          </>
        )}
      </div>
    </>
  );
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
  const quantos = 2 + (pagina ? 1 : 0) + (temWhatsApp ? 1 : 0);
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
      </div>
    </div>
  );
}

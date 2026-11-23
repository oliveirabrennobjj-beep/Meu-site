import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Bell,
  CalendarDays,
  Download,
  LayoutDashboard,
  MapPin,
  MapPinned,
  MessageSquareText,
  Sparkles,
  Search,
  Workflow,
  X,
} from "lucide-react";
import AppDashboardShell, { type ShellNavGroup } from "@/components/ui/app-dashboard-shell";
import {
  BlockButton,
  IconButton,
  cardSurface,
  fieldClass,
  focusRing,
  useAnnouncer,
} from "@/components/ui/app-dashboard-shell-utils/app-block-kit";
import {
  KpiCard,
  PickList,
  SegmentedControl,
  type KpiData,
  type SegmentOption,
} from "@/components/ui/dashboard-parts";
import { cn } from "@/lib/utils";
import { FichaLead } from "./FichaLead";
import { Importar, Mensagens } from "./Ferramentas";
import { Agenda } from "./Agenda";
import { combinadosAntigos, deHoje, leadDo, vivo, type Compromisso, type ModeloId } from "./agenda";
import { AgendaDaLoja, CompromissoFicha } from "./CompromissoFicha";
import { CompromissoForm, type Rascunho } from "./CompromissoForm";
import { ConfigAgendaFolha } from "./ConfigAgendaFolha";
import { HojeAgenda } from "./HojeAgenda";
import { QuandoRespondem } from "./QuandoRespondem";
import { Assistente } from "./Assistente";
import { Funil } from "./Funil";
import { TabelaLeads } from "./TabelaLeads";
import {
  META_DIA,
  STATUS,
  STATUS_ORDEM,
  chegouAgora,
  cidadeDe,
  contar,
  DIAS_CHEGADA,
  ehCasimiro,
  contatosHoje,
  fmtInt,
  fmtPct,
  naLista,
  dataEnvio,
  sistemaDe,
  noEscopo,
  porCidade,
  porTipo,
  statusDe,
  tipoDe,
  type Escopo,
  type Lead,
  type Status,
} from "./leads";
import { usePainel } from "./usePainel";

type Vista = "geral" | "agenda" | "funil" | "assistente" | "mensagens" | "importar";
type Filtro = Status | "todos" | "tiradas" | "sistema" | "chegaram";

const ESCOPOS: SegmentOption<Escopo>[] = [
  { id: "todos", label: "TODOS", long: "Todos os comércios" },
  { id: "casimiro", label: "CASIMIRO", long: "Só Casimiro de Abreu" },
  { id: "fora", label: "FORA", long: "Só fora de Casimiro" },
];

const TITULO: Record<Escopo | Exclude<Vista, "geral">, string> = {
  todos: "Visão geral",
  casimiro: "Casimiro de Abreu",
  fora: "Fora de Casimiro",
  agenda: "Agenda",
  funil: "Funil",
  assistente: "Assistente",
  mensagens: "Mensagens",
  importar: "Importar empresas",
};

export function PainelVendas() {
  const [aviso, setAviso] = useState<{ texto: string; n: number } | null>(null);
  const avisar = useCallback(
    (texto: string) => setAviso((anterior) => ({ texto, n: (anterior?.n ?? 0) + 1 })),
    [],
  );
  useEffect(() => {
    if (!aviso) return;
    const timer = window.setTimeout(() => setAviso(null), 2600);
    return () => window.clearTimeout(timer);
  }, [aviso]);

  const {
    leads: todos,
    textos,
    conversa,
    fase,
    lento,
    erro,
    salvar,
    salvarMensagens,
    salvarConversa,
    importar,
    compromissos,
    configAgenda,
    salvarCompromisso,
    salvarConfigAgenda,
    exemplosAgenda,
  } = usePainel(avisar);
  // Loja tirada da lista (número sem WhatsApp, loja que não existe mais) some das telas e das contagens.
  const leads = useMemo(() => todos.filter(naLista), [todos]);
  const tiradas = useMemo(() => todos.filter((l) => !naLista(l)), [todos]);
  const { announce, region } = useAnnouncer();

  const [vista, setVista] = useState<Vista>("geral");
  const [escopo, setEscopo] = useState<Escopo>("todos");
  const [filtro, setFiltro] = useState<Filtro>("todos");
  const [nichoEscolhido, setNichoEscolhido] = useState<string | null>(null);
  const [consulta, setConsulta] = useState("");
  const [fichaId, setFichaId] = useState<string | null>(null);
  const [rascunho, setRascunho] = useState<Rascunho | null>(null);
  const [compromissoId, setCompromissoId] = useState<string | null>(null);
  const [ajustesAgenda, setAjustesAgenda] = useState(false);
  const mainRef = useRef<HTMLElement>(null);

  const carregando = fase === "carregando";
  const casimiro = useMemo(() => leads.filter(ehCasimiro), [leads]);
  const fora = useMemo(() => leads.filter((l) => !ehCasimiro(l)), [leads]);
  const doEscopo = useMemo(() => noEscopo(leads, escopo), [leads, escopo]);
  const responderam = useMemo(() => leads.filter((l) => statusDe(l) === "respondeu").length, [leads]);
  const hojeTotal = useMemo(() => contatosHoje(leads), [leads]);

  const nichos = useMemo(() => porTipo(doEscopo), [doEscopo]);
  // O nicho escolhido só vale enquanto existir no grupo que está na tela.
  const nicho = nichos.some((linha) => linha.label === nichoEscolhido) ? nichoEscolhido : null;
  const doNicho = useMemo(
    () => (nicho ? doEscopo.filter((l) => tipoDe(l) === nicho) : doEscopo),
    [doEscopo, nicho],
  );

  const buscados = useMemo(() => {
    const q = consulta.trim().toLowerCase();
    if (!q) return doNicho;
    return doNicho.filter((l) =>
      [l.nome, l.tipo, cidadeDe(l), l.endereco].some((campo) => campo?.toLowerCase().includes(q)),
    );
  }, [doNicho, consulta]);
  const porSituacao = useMemo(() => contar(buscados), [buscados]);
  const chegaram = useMemo(() => buscados.filter((l) => chegouAgora(l)), [buscados]);
  // Já receberam mensagem, são de ramo com sistema e ainda não ouviram falar dele.
  const paraSistema = useMemo(
    () => buscados.filter((l) => sistemaDe(l) && statusDe(l) !== "novo" && !dataEnvio(l, "agenda")),
    [buscados],
  );
  const cidades = useMemo(
    () =>
      porCidade(
        filtro === "tiradas"
          ? noEscopo(tiradas, escopo)
          : filtro === "sistema"
            ? paraSistema
          : filtro === "chegaram"
            ? chegaram
          : filtro === "todos"
            ? buscados
            : buscados.filter((l) => statusDe(l) === filtro),
      ),
    [buscados, filtro, tiradas, escopo, paraSistema, chegaram],
  );

  const kpis = useMemo<KpiData[]>(() => {
    const n = contar(doNicho);
    const total = doNicho.length;
    const contatados = total - n.novo;
    const comResposta = n.respondeu + n.fechou + n.depois + n.nao;
    const hoje = contatosHoje(doNicho);
    const v = (valor: number) => (carregando ? "—" : fmtInt(valor));
    return [
      {
        id: "novo",
        label: "A enviar",
        value: v(n.novo),
        chip: fmtPct(n.novo, total),
        trend: "none",
        tone: "neutral",
        hint: "da lista",
      },
      {
        id: "enviado",
        label: "Enviados",
        // Todo mundo que já recebeu mensagem, inclusive quem respondeu depois.
        value: v(contatados),
        chip: `${hoje > 0 ? "+" : ""}${hoje} hoje`,
        trend: hoje > 0 ? "up" : "none",
        tone: hoje > 0 ? "good" : "neutral",
        hint: `meta ${META_DIA}`,
      },
      {
        id: "respondeu",
        label: "Responderam",
        // Qualquer resposta (interesse, fechou, depois ou não): o mesmo grupo da porcentagem.
        value: v(comResposta),
        chip: fmtPct(comResposta, contatados),
        trend: comResposta > 0 ? "up" : "none",
        tone: comResposta > 0 ? "good" : "neutral",
        hint: "de resposta",
      },
      {
        id: "fechou",
        label: "Fecharam",
        value: v(n.fechou),
        chip: fmtPct(n.fechou, contatados),
        trend: n.fechou > 0 ? "up" : "none",
        tone: n.fechou > 0 ? "good" : "neutral",
        hint: "dos contatos",
      },
    ];
  }, [doNicho, carregando]);

  const ficha = useMemo(() => todos.find((l) => l.id === fichaId) ?? null, [todos, fichaId]);
  const proximo = useMemo(() => {
    if (!ficha) return null;
    const cidade = cidadeDe(ficha);
    // Mesma ordem das tabelas: em Casimiro, quem tem menos avaliações vem primeiro.
    const sentido = ehCasimiro(ficha) ? 1 : -1;
    return (
      leads
        .filter(
          (l) =>
            l.id !== ficha.id &&
            cidadeDe(l) === cidade &&
            statusDe(l) === "novo" &&
            (!nicho || tipoDe(l) === nicho),
        )
        .sort((a, b) => {
          if (a.avaliacoes == null || b.avaliacoes == null)
            return a.avaliacoes == null ? (b.avaliacoes == null ? 0 : 1) : -1;
          return (a.avaliacoes - b.avaliacoes) * sentido;
        })[0] ?? null
    );
  }, [leads, ficha, nicho]);

  const irParaTabelas = (depois?: (main: HTMLElement) => void) => {
    setVista("geral");
    window.requestAnimationFrame(() => {
      const main = mainRef.current;
      if (!main) return;
      main.querySelector("[data-tabelas]")?.scrollIntoView({ block: "start" });
      depois?.(main);
    });
  };

  const navegar = (id: string) => {
    if (["agenda", "funil", "assistente", "mensagens", "importar"].includes(id)) setVista(id as Vista);
    else {
      setVista("geral");
      setEscopo(id as Escopo);
    }
    mainRef.current?.scrollTo({ top: 0 });
  };

  const mudarEscopo = (novo: Escopo) => {
    setEscopo(novo);
    announce(`Mostrando ${ESCOPOS.find((e) => e.id === novo)?.long.toLowerCase()}`);
  };

  const limparFiltros = () => {
    setFiltro("todos");
    setNichoEscolhido(null);
    setConsulta("");
  };

  // Agenda: horários marcados mais os combinados antigos anotados nas lojas.
  const agenda = useMemo(
    () => [...compromissos, ...combinadosAntigos(todos, configAgenda)],
    [compromissos, todos, configAgenda],
  );
  const porId = useMemo(() => new Map(todos.map((l) => [l.id, l])), [todos]);

  /**
   * A loja não quer mais: fica em "Não quer", com a anotação no histórico, e os horários que ainda iam
   * acontecer são cancelados (resultado "não fechou"). Vale para o botão da agenda, da ficha e do assistente.
   */
  const naoQuerMais = (leadId: string, motivo = "") => {
    const lead = porId.get(leadId);
    if (!lead) return;
    const agora = new Date().toISOString();
    const texto = `Não quer mais${motivo.trim() ? `: ${motivo.trim()}` : "."}`;
    salvar(leadId, {
      status: "nao",
      obs: texto,
      compromisso: null,
      historico: [...(lead.historico ?? []), { em: agora, texto }].slice(-20),
    });
    const futuros = compromissos.filter((c) => c.leadId === leadId && vivo(c));
    for (const c of futuros) salvarCompromisso({ ...c, status: "cancelado", resultado: "naofechou" });
    avisar(`${lead.nome}: não quer mais${futuros.length ? ". Saiu da agenda." : "."}`);
  };
  /** Toda gravação na loja passa por aqui: "Não quer" também tira os horários dela da agenda. */
  const salvarLoja = (id: string, mudanca: Partial<Lead>) => {
    salvar(id, mudanca);
    if (mudanca.status === "nao") {
      for (const c of compromissos.filter((x) => x.leadId === id && vivo(x)))
        salvarCompromisso({ ...c, status: "cancelado", resultado: "naofechou" });
    }
  };
  const deHojeN = deHoje(agenda).length;
  const compromisso = useMemo(() => agenda.find((c) => c.id === compromissoId) ?? null, [agenda, compromissoId]);
  const abrirCompromisso = (c: Compromisso) => {
    setFichaId(null);
    setCompromissoId(c.id);
  };
  const novoHorario = (r: Rascunho) => {
    setFichaId(null);
    setCompromissoId(null);
    setRascunho(r);
  };
  const avisado = (c: Compromisso, modelo: ModeloId) =>
    salvarCompromisso({ ...c, avisos: { ...c.avisos, [modelo]: new Date().toISOString() } });

  const nav: ShellNavGroup[] = [
    {
      items: [
        { id: "todos", label: "Visão geral", icon: LayoutDashboard },
        {
          id: "casimiro",
          label: "Casimiro de Abreu",
          icon: MapPin,
          badge: carregando ? undefined : String(casimiro.length),
        },
        {
          id: "fora",
          label: "Fora de Casimiro",
          icon: MapPinned,
          badge: carregando ? undefined : String(fora.length),
        },
        {
          id: "agenda",
          label: "Agenda",
          icon: CalendarDays,
          badge: deHojeN ? String(deHojeN) : undefined,
        },
        { id: "funil", label: "Funil", icon: Workflow },
      ],
    },
    {
      label: "Ferramentas",
      items: [
        { id: "assistente", label: "Assistente", icon: Sparkles },
        { id: "mensagens", label: "Mensagens", icon: MessageSquareText },
        { id: "importar", label: "Importar empresas", icon: Download },
      ],
    },
  ];

  const ativo = vista === "geral" ? escopo : vista;
  const subtitulo = carregando
    ? "Carregando os comércios…"
    : escopo === "todos"
      ? `${leads.length} comércios sem site · ${casimiro.length} em Casimiro e ${fora.length} fora`
      : escopo === "casimiro"
        ? `${casimiro.length} comércios · dá pra conversar pessoalmente`
        : `${fora.length} comércios · oferta de site pelo WhatsApp`;

  const estado =
    fase === "sem-conta"
      ? "Entre na sua conta do Claude para ver e salvar as empresas."
      : fase === "erro"
        ? `Não consegui ler as empresas: ${erro}. Abra o painel de novo.`
        : lento
          ? leads.length
            ? "Sem resposta do painel há um tempo: os dados podem estar desatualizados."
            : "O painel está demorando para responder. Se não carregar, abra de novo em instantes."
          : null;

  const chip = (ativa: boolean) =>
    cn(
      "inline-flex h-7 shrink-0 cursor-pointer items-center gap-1.5 rounded-full border px-2.5 text-[12px] transition-colors duration-150",
      ativa
        ? "border-[color:var(--bjork-accent-line)] bg-[var(--bjork-accent-soft)] text-[color:var(--blk-accent-ink)]"
        : "border-transparent text-[color:var(--bjork-text-muted)] hover:bg-[var(--bjork-surface-hover)] hover:text-[color:var(--bjork-text)]",
      focusRing,
    );

  return (
    <AppDashboardShell
      workspace={{
        name: "BN Digital",
        plan: "Sites e placas",
        mark: (
          <span
            aria-hidden="true"
            className="grid size-8 shrink-0 place-items-center rounded-[9px] bjork-fill text-[12px] font-bold tracking-[-0.02em] text-[color:var(--blk-accent-fill-ink)] shadow-[inset_0_1px_0_rgba(255,255,255,0.28),0_1px_2px_rgba(0,0,0,0.2)]"
          >
            BN
          </span>
        ),
      }}
      user={{ name: "Brenno", detail: "BN Digital" }}
      nav={nav}
      active={ativo}
      onNavigate={navegar}
      title={TITULO[ativo]}
      mainRef={mainRef}
      sidebarFooter={
        <div className="mb-2.5 rounded-[12px] border border-[color:var(--bjork-border)] bg-[var(--bjork-surface)] p-3 shadow-[var(--bjork-shadow-soft)]">
          <div className="flex items-baseline justify-between text-[12px]">
            <span className="font-medium">Meta de hoje</span>
            <span className="font-mono tabular-nums text-[color:var(--bjork-text-muted)]">
              {hojeTotal} / {META_DIA}
            </span>
          </div>
          <div
            role="meter"
            aria-label="Comércios contatados hoje"
            aria-valuemin={0}
            aria-valuemax={META_DIA}
            aria-valuenow={Math.min(hojeTotal, META_DIA)}
            aria-valuetext={`${hojeTotal} de ${META_DIA} comércios`}
            className="mt-2 h-1.5 overflow-hidden rounded-full bg-[var(--bjork-surface-active)]"
          >
            <div
              className="bjork-fill h-full rounded-full transition-[width] duration-300 motion-reduce:transition-none"
              style={{ width: `${Math.min(100, (hojeTotal / META_DIA) * 100)}%` }}
            />
          </div>
          <p className="mt-2 text-[11.5px] leading-snug text-[color:var(--bjork-text-muted)]">
            Espalhe as mensagens ao longo do dia: evita bloqueio do número.
          </p>
        </div>
      }
      headerActions={
        <>
          <label className="relative hidden items-center @2xl:flex">
            <span className="sr-only">Buscar comércio</span>
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-2.5 size-[15px] text-[color:var(--bjork-text-soft)]"
            />
            <input
              type="search"
              value={consulta}
              onChange={(event) => {
                setConsulta(event.target.value);
                setVista("geral");
              }}
              placeholder="Buscar comércio"
              className={cn(fieldClass, "h-8 w-[230px] rounded-[9px] pl-8 text-[13px]")}
            />
          </label>
          <IconButton
            label="Buscar comércio"
            className="@2xl:hidden"
            onClick={() =>
              irParaTabelas((main) => main.querySelector<HTMLInputElement>("[data-busca]")?.focus())
            }
          >
            <Search />
          </IconButton>
          <IconButton
            label={
              responderam > 0
                ? `Ver quem respondeu: ${responderam} para mandar exemplo`
                : "Ver quem respondeu: ninguém ainda"
            }
            onClick={() => {
              setEscopo("todos");
              setNichoEscolhido(null);
              setConsulta("");
              setFiltro("respondeu");
              irParaTabelas();
            }}
          >
            <Bell />
            {responderam > 0 && (
              <span
                aria-hidden="true"
                className="absolute right-2 top-2 size-1.5 rounded-full bg-[var(--bjork-accent)] ring-2 ring-[color:var(--bjork-bg)]"
              />
            )}
          </IconButton>
          <BlockButton
            variant="secondary"
            size="sm"
            className="hidden @md:inline-flex"
            onClick={() => navegar("importar")}
          >
            <Download aria-hidden="true" />
            Importar
          </BlockButton>
        </>
      }
      overlay={
        <>
          <FichaLead
            lead={ficha}
            textos={textos}
            proximo={proximo}
            onFechar={() => setFichaId(null)}
            onSalvar={salvarLoja}
            onAbrir={(lead) => setFichaId(lead.id)}
            avisar={avisar}
            agenda={(lead) => (
              <AgendaDaLoja
                lead={lead}
                lista={agenda.filter((c) => c.leadId === lead.id && !c.legado)}
                cfg={configAgenda}
                compromissos={agenda}
                onAgendar={() => novoHorario({ leadId: lead.id })}
                onAbrir={abrirCompromisso}
                avisar={avisar}
              />
            )}
          />
          <CompromissoForm
            rascunho={rascunho}
            leads={todos}
            compromissos={agenda}
            cfg={configAgenda}
            onFechar={() => setRascunho(null)}
            onNaoQuer={(c, motivo) => {
              if (c.leadId && porId.has(c.leadId)) naoQuerMais(c.leadId, motivo);
              else {
                salvarCompromisso({ ...c, status: "cancelado", resultado: "naofechou" });
                avisar("Não quer mais: horário cancelado.");
              }
              setRascunho(null);
            }}
            onSalvar={(c, deLegado) => {
              salvarCompromisso(c);
              // Combinado antigo que virou horário marcado sai da loja, para não aparecer duas vezes.
              if (deLegado) salvar(deLegado, { compromisso: null });
              setRascunho(null);
              setCompromissoId(c.id);
              avisar(`Marcado: ${leadDo(c, porId)?.nome ?? "cliente"}, ${c.data.split("-").reverse().join("/")} às ${c.hora}`);
            }}
          />
          <CompromissoFicha
            compromisso={compromisso}
            lead={compromisso ? leadDo(compromisso, porId) : null}
            compromissos={agenda}
            cfg={configAgenda}
            onFechar={() => setCompromissoId(null)}
            onSalvar={salvarCompromisso}
            onFormulario={novoHorario}
            onAbrirLead={
              compromisso && porId.has(compromisso.leadId)
                ? (lead) => {
                    setCompromissoId(null);
                    setFichaId(lead.id);
                  }
                : null
            }
            onDesmarcarLegado={(id) => salvar(id, { compromisso: null })}
            onNaoQuer={(c, motivo) => {
              if (c.leadId && porId.has(c.leadId)) naoQuerMais(c.leadId, motivo);
              else {
                salvarCompromisso({ ...c, status: "cancelado", resultado: "naofechou" });
                avisar("Não quer mais: horário cancelado.");
              }
              setCompromissoId(null);
            }}
            avisar={avisar}
          />
          <ConfigAgendaFolha
            aberta={ajustesAgenda}
            cfg={configAgenda}
            onFechar={() => setAjustesAgenda(false)}
            onSalvar={salvarConfigAgenda}
          />
          <div role="status" aria-live="polite" className="pointer-events-none absolute inset-x-0 bottom-6 z-50">
            {aviso && (
              <p
                key={aviso.n}
                className="absolute bottom-0 left-1/2 max-w-[88%] -translate-x-1/2 rounded-[12px] border border-[color:var(--bjork-border-strong)] bg-[var(--bjork-menu)] px-4 py-2.5 text-center text-[13.5px] font-medium shadow-[var(--bjork-shadow-menu)] motion-safe:animate-[blk-toast-in_180ms_ease-out]"
              >
                {aviso.texto}
              </p>
            )}
          </div>
          {region}
        </>
      }
    >
      <div
        className={cn(
          "mx-auto flex w-full max-w-[1280px] flex-col gap-4 px-5 pt-5 @3xl:gap-5 @3xl:px-6 @3xl:pt-6",
          // No chat, a área ocupa a tela toda para a caixa de escrever ficar no rodapé.
          vista === "assistente" ? "min-h-full pb-0" : "pb-10",
        )}
      >
        <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
          <div className="min-w-0">
            <h1 className="font-bjork-display text-[24px] font-bold italic leading-none tracking-[-0.02em] @3xl:text-[28px]">
              {TITULO[ativo]}
            </h1>
            <p className="mt-2 text-[13px] text-[color:var(--bjork-text-muted)]">
              {vista === "agenda"
                ? "Visitas, reuniões e ligações marcadas com cada cliente"
                : vista === "funil"
                ? "Em que etapa cada loja está agora"
                : vista === "assistente"
                ? "Pergunte, peça mensagem pronta ou mande o print da conversa"
                : vista === "mensagens"
                ? "Um texto para cada lugar e cada oferta"
                : vista === "importar"
                  ? "Traga os comércios novos da pesquisa diária"
                  : subtitulo}
            </p>
          </div>
          {vista === "geral" && (
            <SegmentedControl
              value={escopo}
              onChange={mudarEscopo}
              options={ESCOPOS}
              label="Quais comércios mostrar"
            />
          )}
        </div>

        {estado && (
          <p
            role="status"
            className={cn(cardSurface, "px-4 py-3 text-[13px] text-[color:var(--bjork-text-medium)]")}
          >
            {estado}
          </p>
        )}

        {vista === "assistente" && (
          <Assistente
            leads={leads}
            conversa={conversa}
            onConversa={salvarConversa}
            onSalvar={salvarLoja}
            onAbrir={(lead) => setFichaId(lead.id)}
            avisar={avisar}
            agenda={agenda}
            cfg={configAgenda}
            onCompromisso={salvarCompromisso}
          />
        )}

        {vista === "agenda" && (
          <Agenda
            leads={todos}
            agenda={agenda}
            cfg={configAgenda}
            onNovo={novoHorario}
            onAbrir={abrirCompromisso}
            onConfig={() => setAjustesAgenda(true)}
            onExemplos={exemplosAgenda}
          />
        )}

        {vista === "funil" && (
          <Funil
            leads={leads}
            onEtapa={(status) => {
              setFiltro(status);
              setNichoEscolhido(null);
              setConsulta("");
              irParaTabelas();
              announce(`Mostrando ${STATUS[status].plural.toLowerCase()}`);
            }}
          />
        )}

        {vista === "funil" && <QuandoRespondem leads={leads} />}

        {vista === "mensagens" && (
          <Mensagens textos={textos} leads={leads} onSalvar={salvarMensagens} />
        )}

        {vista === "importar" && <Importar onImportar={importar} />}

        {vista === "geral" && (
          <>
            <HojeAgenda
              leads={leads}
              agenda={agenda}
              cfg={configAgenda}
              onNovo={novoHorario}
              onAbrir={abrirCompromisso}
              onVerAgenda={() => navegar("agenda")}
              onAbrirLead={(lead) => setFichaId(lead.id)}
              onAvisado={avisado}
              avisar={avisar}
            />

            <section
              aria-label="Indicadores"
              className="grid grid-cols-2 gap-2.5 @3xl/main:gap-3 @5xl/main:grid-cols-4"
            >
              {kpis.map((kpi) => (
                <KpiCard key={kpi.id} kpi={kpi} />
              ))}
            </section>

            <div className="grid grid-cols-1 items-start gap-4 @5xl/main:grid-cols-[300px_minmax(0,1fr)] @3xl:gap-5">
              <PickList
                title="Nichos"
                totalText={carregando ? "—" : nicho ? "toque de novo para ver todos" : "toque para filtrar"}
                rows={nichos}
                selected={nicho}
                onSelect={(escolhido) => {
                  setNichoEscolhido(escolhido);
                  announce(escolhido ? `Mostrando só ${escolhido}` : "Mostrando todos os nichos");
                }}
                emptyText={carregando ? "Carregando…" : "Nenhum comércio neste grupo."}
              />

              <div data-tabelas className="flex min-w-0 scroll-mt-3 flex-col gap-4 @3xl:gap-5">
                <section
                  aria-label="Filtros"
                  className={cn(cardSurface, "flex flex-col gap-2.5 p-3")}
                >
                  <label className="relative flex items-center @2xl/main:hidden">
                    <span className="sr-only">Buscar comércio</span>
                    <Search
                      aria-hidden="true"
                      className="pointer-events-none absolute left-2.5 size-[15px] text-[color:var(--bjork-text-soft)]"
                    />
                    <input
                      data-busca
                      type="search"
                      value={consulta}
                      onChange={(event) => setConsulta(event.target.value)}
                      placeholder="Buscar por nome, nicho ou cidade"
                      className={cn(fieldClass, "h-9 rounded-[9px] pl-8 text-[13px]")}
                    />
                  </label>
                  <div
                    className="hide-scrollbar flex items-center gap-1 overflow-x-auto"
                    role="group"
                    aria-label="Filtrar por situação"
                  >
                    {nicho && (
                      <button
                        type="button"
                        onClick={() => setNichoEscolhido(null)}
                        aria-label={`Tirar o filtro de ${nicho}`}
                        className={cn(chip(true), "text-[color:var(--blk-accent-ink)]")}
                      >
                        {nicho}
                        <X aria-hidden="true" className="size-3" />
                      </button>
                    )}
                    {(["todos", ...STATUS_ORDEM] as const).map((s) => (
                      <button
                        key={s}
                        type="button"
                        aria-pressed={filtro === s}
                        onClick={() => setFiltro(s)}
                        className={chip(filtro === s)}
                      >
                        {s !== "todos" && (
                          <span
                            aria-hidden="true"
                            className="size-1.5 rounded-full"
                            style={{ background: STATUS[s].ink }}
                          />
                        )}
                        {s === "todos" ? "Todos" : STATUS[s].plural}
                        <span className="font-mono text-[11px] tabular-nums text-[color:var(--bjork-text-soft)]">
                          {s === "todos" ? buscados.length : porSituacao[s]}
                        </span>
                      </button>
                    ))}
                    {(chegaram.length > 0 || filtro === "chegaram") && (
                      <button
                        type="button"
                        aria-pressed={filtro === "chegaram"}
                        aria-label={`Chegaram nos últimos ${DIAS_CHEGADA} dias e ainda não receberam mensagem: ${chegaram.length}`}
                        onClick={() => setFiltro("chegaram")}
                        className={chip(filtro === "chegaram")}
                      >
                        <Sparkles aria-hidden="true" className="size-3 text-[color:var(--bjork-accent)]" />
                        Chegaram agora
                        <span className="font-mono text-[11px] tabular-nums text-[color:var(--bjork-text-soft)]">
                          {chegaram.length}
                        </span>
                      </button>
                    )}
                    {(paraSistema.length > 0 || filtro === "sistema") && (
                      <button
                        type="button"
                        aria-pressed={filtro === "sistema"}
                        aria-label={`Oferecer o sistema a quem já recebeu mensagem: ${paraSistema.length}`}
                        onClick={() => setFiltro("sistema")}
                        className={chip(filtro === "sistema")}
                      >
                        Oferecer sistema
                        <span className="font-mono text-[11px] tabular-nums text-[color:var(--bjork-text-soft)]">
                          {paraSistema.length}
                        </span>
                      </button>
                    )}
                    {(tiradas.length > 0 || filtro === "tiradas") && (
                      <button
                        type="button"
                        aria-pressed={filtro === "tiradas"}
                        aria-label={`Tiradas da lista: ${tiradas.length}`}
                        onClick={() => setFiltro("tiradas")}
                        className={chip(filtro === "tiradas")}
                      >
                        Tiradas
                        <span className="font-mono text-[11px] tabular-nums text-[color:var(--bjork-text-soft)]">
                          {tiradas.length}
                        </span>
                      </button>
                    )}
                  </div>
                </section>

                {cidades.map((grupo) => (
                  <TabelaLeads
                    key={grupo.cidade}
                    titulo={grupo.cidade}
                    detalhe={
                      filtro === "tiradas"
                        ? "Fora da lista: abra a loja para trazer de volta"
                        : filtro === "sistema"
                          ? "Já receberam mensagem: abra e ofereça o sistema"
                        : filtro === "chegaram"
                          ? "Lote novo da pesquisa, ainda sem mensagem"
                        : grupo.casimiro
                          ? "Pessoalmente ou contato do dono"
                          : "WhatsApp · site"
                    }
                    leads={grupo.leads}
                    menosAvaliadosPrimeiro={grupo.casimiro}
                    onAbrir={(lead) => setFichaId(lead.id)}
                    anunciar={announce}
                  />
                ))}

                {cidades.length === 0 && (
                  <div className={cn(cardSurface, "px-4 py-10 text-center")}>
                    {carregando ? (
                      <p className="text-[13px] text-[color:var(--bjork-text-muted)]">
                        Carregando as empresas…
                      </p>
                    ) : doEscopo.length === 0 ? (
                      <>
                        <p className="text-[13px] font-medium">Nenhuma empresa aqui ainda</p>
                        <p className="mt-1 text-[12.5px] text-[color:var(--bjork-text-muted)]">
                          Use “Importar” para trazer a lista da pesquisa diária.
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="text-[13px] font-medium">Nenhuma empresa nesse filtro</p>
                        <p className="mt-1 text-[12.5px] text-[color:var(--bjork-text-muted)]">
                          Tente outro nome, outro nicho ou veja todas.
                        </p>
                        <BlockButton
                          size="sm"
                          variant="secondary"
                          className="mt-3"
                          onClick={limparFiltros}
                        >
                          Ver todas
                        </BlockButton>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </AppDashboardShell>
  );
}

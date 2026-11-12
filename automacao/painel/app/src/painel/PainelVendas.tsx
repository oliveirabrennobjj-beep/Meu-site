import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Bell,
  Download,
  LayoutDashboard,
  MapPin,
  MapPinned,
  MessageSquareText,
  Search,
} from "lucide-react";
import AppDashboardShell, { type ShellNavGroup } from "@/components/ui/app-dashboard-shell";
import {
  BlockButton,
  IconButton,
  cardSurface,
  fieldClass,
  useAnnouncer,
} from "@/components/ui/app-dashboard-shell-utils/app-block-kit";
import {
  Breakdown,
  CompareChart,
  KpiCard,
  SegmentedControl,
  type ComparePoint,
  type KpiData,
  type SegmentOption,
} from "@/components/ui/dashboard-parts";
import { cn } from "@/lib/utils";
import { FichaLead } from "./FichaLead";
import { Importar, MensagemPadrao } from "./Ferramentas";
import { TabelaLeads, type Filtro } from "./TabelaLeads";
import {
  META_DIA,
  contar,
  distribuicaoNotas,
  ehCasimiro,
  enviadosHoje,
  fmtInt,
  fmtNota,
  fmtPct,
  mediaNota,
  noEscopo,
  porTipo,
  statusDe,
  type Escopo,
  type Lead,
} from "./leads";
import { usePainel } from "./usePainel";

type Vista = "geral" | "mensagem" | "importar";

const ESCOPOS: SegmentOption<Escopo>[] = [
  { id: "todos", label: "TODOS", long: "Todos os comércios" },
  { id: "casimiro", label: "CASIMIRO", long: "Só Casimiro de Abreu" },
  { id: "fora", label: "FORA", long: "Só fora de Casimiro" },
];

const TITULO: Record<Escopo | Exclude<Vista, "geral">, string> = {
  todos: "Visão geral",
  casimiro: "Casimiro de Abreu",
  fora: "Fora de Casimiro",
  mensagem: "Mensagem padrão",
  importar: "Importar empresas",
};

const eixoPct = (valor: number) => `${Math.round(valor)}%`;
const tetoPct = (pico: number) => Math.max(20, Math.ceil((pico * 1.08) / 20) * 20);

function diferenca(a: number | null, b: number | null) {
  if (a == null || b == null) return null;
  const d = Math.round((a - b) * 10) / 10;
  if (d === 0) return "igual";
  return `${d > 0 ? "+" : "−"}${fmtNota(Math.abs(d))}`;
}

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

  const { leads, tpl, fase, lento, erro, salvar, salvarMensagem, importar } = usePainel(avisar);
  const { announce, region } = useAnnouncer();

  const [vista, setVista] = useState<Vista>("geral");
  const [escopo, setEscopo] = useState<Escopo>("todos");
  const [filtro, setFiltro] = useState<Filtro>("todos");
  const [consulta, setConsulta] = useState("");
  const [fichaId, setFichaId] = useState<string | null>(null);
  const mainRef = useRef<HTMLElement>(null);

  const carregando = fase === "carregando";
  const casimiro = useMemo(() => leads.filter(ehCasimiro), [leads]);
  const fora = useMemo(() => leads.filter((l) => !ehCasimiro(l)), [leads]);
  const doEscopo = useMemo(() => noEscopo(leads, escopo), [leads, escopo]);
  const responderam = useMemo(() => leads.filter((l) => statusDe(l) === "respondeu").length, [leads]);
  const hojeTotal = useMemo(() => enviadosHoje(leads), [leads]);

  const kpis = useMemo<KpiData[]>(() => {
    const n = contar(doEscopo);
    const total = doEscopo.length;
    const contatados = total - n.novo;
    const comResposta = n.respondeu + n.fechou + n.depois + n.nao;
    const hoje = enviadosHoje(doEscopo);
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
        value: v(n.enviado),
        chip: `${hoje > 0 ? "+" : ""}${hoje} hoje`,
        trend: hoje > 0 ? "up" : "none",
        tone: hoje > 0 ? "good" : "neutral",
        hint: `meta ${META_DIA}`,
      },
      {
        id: "respondeu",
        label: "Responderam",
        value: v(n.respondeu),
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
  }, [doEscopo, carregando]);

  const grafico = useMemo(() => {
    const foraNaFrente = escopo === "fora";
    const principal = foraNaFrente ? fora : casimiro;
    const comparado = foraNaFrente ? casimiro : fora;
    const nomes = foraNaFrente ? (["Fora", "Casimiro"] as const) : (["Casimiro", "Fora"] as const);
    const pontos: ComparePoint[] = distribuicaoNotas(principal, comparado).map((p) => ({
      label: `Nota ${fmtNota(p.nota)}`,
      tick: fmtNota(p.nota),
      current: p.pctA,
      previous: p.pctB,
      currentText: `${Math.round(p.pctA)}% · ${p.qtdA}`,
      previousText: `${Math.round(p.pctB)}% · ${p.qtdB}`,
    }));
    const mCas = mediaNota(casimiro);
    const mFora = mediaNota(fora);
    const nota =
      escopo === "todos"
        ? `nota média · Casimiro ${fmtNota(mCas)} e fora ${fmtNota(mFora)}`
        : escopo === "casimiro"
          ? `nota média · ${diferenca(mCas, mFora) ?? "sem comparação"} vs fora`
          : `nota média · ${diferenca(mFora, mCas) ?? "sem comparação"} vs Casimiro`;
    return {
      pontos,
      nomes,
      titulo: fmtNota(mediaNota(doEscopo)),
      nota,
      resumo: `Notas no Google. Casimiro de Abreu: média ${fmtNota(mCas)} em ${casimiro.length} comércios. Fora de Casimiro: média ${fmtNota(mFora)} em ${fora.length} comércios.`,
    };
  }, [escopo, casimiro, fora, doEscopo]);

  const tipos = useMemo(() => porTipo(doEscopo), [doEscopo]);

  const ficha = useMemo(() => leads.find((l) => l.id === fichaId) ?? null, [leads, fichaId]);
  const proximo = useMemo(() => {
    if (!ficha) return null;
    const doGrupo = ehCasimiro(ficha);
    return (
      leads
        .filter((l) => l.id !== ficha.id && ehCasimiro(l) === doGrupo && statusDe(l) === "novo")
        .sort((a, b) => (b.avaliacoes ?? -1) - (a.avaliacoes ?? -1))[0] ?? null
    );
  }, [leads, ficha]);

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
    if (id === "mensagem" || id === "importar") setVista(id);
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
      ],
    },
    {
      label: "Ferramentas",
      items: [
        { id: "mensagem", label: "Mensagem padrão", icon: MessageSquareText },
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
        ? `${casimiro.length} comércios sem site · comparados com os de fora`
        : `${fora.length} comércios sem site · comparados com os de Casimiro`;

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

  const tabela = (titulo: string, grupo: Lead[]) => (
    <TabelaLeads
      titulo={titulo}
      leads={grupo}
      consulta={consulta}
      onConsulta={setConsulta}
      filtro={filtro}
      onFiltro={setFiltro}
      onAbrir={(lead) => setFichaId(lead.id)}
      avisar={announce}
      carregando={carregando}
    />
  );

  return (
    <AppDashboardShell
      workspace={{
        name: "BN Digital",
        plan: "Prospecção",
        mark: (
          <span
            aria-hidden="true"
            className="grid size-8 shrink-0 place-items-center rounded-[9px] bg-[var(--blk-accent-fill)] text-[12px] font-bold tracking-[-0.02em] text-[color:var(--blk-accent-fill-ink)] shadow-[inset_0_1px_0_rgba(255,255,255,0.28),0_1px_2px_rgba(0,0,0,0.2)]"
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
            aria-label="Mensagens enviadas hoje"
            aria-valuemin={0}
            aria-valuemax={META_DIA}
            aria-valuenow={Math.min(hojeTotal, META_DIA)}
            aria-valuetext={`${hojeTotal} de ${META_DIA} mensagens`}
            className="mt-2 h-1.5 overflow-hidden rounded-full bg-[var(--bjork-surface-active)]"
          >
            <div
              className="h-full rounded-full bg-[var(--bjork-accent)] transition-[width] duration-300 motion-reduce:transition-none"
              style={{ width: `${Math.min(100, (hojeTotal / META_DIA) * 100)}%` }}
            />
          </div>
          <p className="mt-2 text-[11.5px] leading-snug text-[color:var(--bjork-text-muted)]">
            Mandar aos poucos evita bloqueio do número.
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
            tpl={tpl}
            proximo={proximo}
            onFechar={() => setFichaId(null)}
            onSalvar={salvar}
            onAbrir={(lead) => setFichaId(lead.id)}
            avisar={avisar}
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
      <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-4 px-5 pb-10 pt-5 @3xl:gap-5 @3xl:px-6 @3xl:pt-6">
        <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
          <div className="min-w-0">
            <h1 className="font-bjork-display text-[24px] font-bold italic leading-none tracking-[-0.02em] @3xl:text-[28px]">
              {TITULO[ativo]}
            </h1>
            <p className="mt-2 text-[13px] text-[color:var(--bjork-text-muted)]">
              {vista === "mensagem"
                ? "O texto que abre a conversa no WhatsApp"
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

        {vista === "mensagem" && (
          <MensagemPadrao
            tpl={tpl}
            exemplo={leads.find((l) => statusDe(l) === "novo") ?? leads[0] ?? null}
            onSalvar={salvarMensagem}
          />
        )}

        {vista === "importar" && <Importar onImportar={importar} />}

        {vista === "geral" && (
          <>
            <section
              aria-label="Indicadores"
              className="grid grid-cols-2 gap-2.5 @3xl/main:gap-3 @5xl/main:grid-cols-4"
            >
              {kpis.map((kpi) => (
                <KpiCard key={kpi.id} kpi={kpi} />
              ))}
            </section>

            <div className="grid grid-cols-1 gap-3 @5xl/main:grid-cols-[minmax(0,1fr)_300px]">
              <CompareChart
                key={`${escopo}-${leads.length > 0}`}
                title="Notas no Google"
                headline={carregando ? "—" : grafico.titulo}
                headlineNote={carregando ? "carregando" : grafico.nota}
                points={grafico.pontos}
                currentLabel={grafico.nomes[0]}
                previousLabel={grafico.nomes[1]}
                axis={eixoPct}
                ceiling={tetoPct}
                summary={grafico.resumo}
                pointHeader="Nota"
                emptyText={
                  carregando ? "Carregando as notas…" : "Ainda não há comércios com nota no Google."
                }
              />
              <Breakdown
                title="Comércios por tipo"
                totalText={carregando ? "—" : fmtInt(doEscopo.length)}
                rows={tipos}
                emptyText={carregando ? "Carregando…" : "Nenhum comércio neste grupo."}
              />
            </div>

            <div data-tabelas className="flex scroll-mt-3 flex-col gap-4 @3xl:gap-5">
              {escopo !== "fora" && tabela("Casimiro de Abreu", casimiro)}
              {escopo !== "casimiro" && tabela("Fora de Casimiro", fora)}
            </div>
          </>
        )}
      </div>
    </AppDashboardShell>
  );
}

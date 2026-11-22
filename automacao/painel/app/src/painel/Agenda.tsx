import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Plus, Search, Settings2 } from "lucide-react";
import {
  BlockButton,
  IconButton,
  cardSurface,
  fieldClass,
  focusRing,
} from "@/components/ui/app-dashboard-shell-utils/app-block-kit";
import { SegmentedControl, type SegmentOption } from "@/components/ui/dashboard-parts";
import { cn } from "@/lib/utils";
import {
  SEMANA_CURTA,
  SEMANA_LONGA,
  SERVICOS,
  STATUS_COMPROMISSO,
  STATUS_COMPROMISSO_ORDEM,
  TIPOS,
  TIPOS_ORDEM,
  agoraSP,
  chaveDia,
  diaDaChave,
  fimDe,
  horaDosMinutos,
  horariosLivres,
  leadDo,
  minutosDe,
  porHorario,
  segundaDa,
  somarDias,
  type Compromisso,
  type ConfigAgenda,
  type ServicoCompromisso,
  type StatusCompromisso,
  type TipoCompromisso,
} from "./agenda";
import { LinhaCompromisso } from "./CompromissoFicha";
import type { Rascunho } from "./CompromissoForm";
import { Pilula, TIPO_ICONE, faixaHorario } from "./agendaUi";
import type { Lead } from "./leads";

type Vista = "semana" | "dia" | "mes" | "lista";
const VISTAS: SegmentOption<Vista>[] = [
  { id: "semana", label: "SEMANA", long: "Semana" },
  { id: "dia", label: "DIA", long: "Dia" },
  { id: "mes", label: "MÊS", long: "Mês" },
  { id: "lista", label: "LISTA", long: "Lista" },
];
const MESES = [
  "janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
];
const HORA_PX = 52;
const GUARDA = "agenda.vista";

function vistaGuardada(): Vista {
  try {
    const v = window.localStorage.getItem(GUARDA);
    if (v === "semana" || v === "dia" || v === "mes" || v === "lista") return v;
  } catch {
    /* sem armazenamento: usa o padrão */
  }
  return window.innerWidth < 640 ? "dia" : "semana";
}

export function Agenda({
  leads,
  agenda,
  cfg,
  onNovo,
  onAbrir,
  onConfig,
  onExemplos,
}: {
  leads: Lead[];
  /** Horários marcados mais os combinados antigos das lojas. */
  agenda: Compromisso[];
  cfg: ConfigAgenda;
  onNovo: (r: Rascunho) => void;
  onAbrir: (c: Compromisso) => void;
  onConfig: () => void;
  onExemplos: (por: boolean) => void;
}) {
  const agora = agoraSP();
  const hoje = chaveDia(agora);
  const [vista, setVistaBruta] = useState<Vista>(vistaGuardada);
  const setVista = (v: Vista) => {
    setVistaBruta(v);
    try {
      window.localStorage.setItem(GUARDA, v);
    } catch {
      /* ignora */
    }
  };
  const [ref, setRef] = useState(() => agora);
  const [tipo, setTipo] = useState<TipoCompromisso | "">("");
  const [servico, setServico] = useState<ServicoCompromisso | "">("");
  const [status, setStatus] = useState<StatusCompromisso | "ativos" | "todos">("ativos");
  const [busca, setBusca] = useState("");

  const porId = useMemo(() => new Map(leads.map((l) => [l.id, l])), [leads]);
  const nomeDe = (c: Compromisso) => leadDo(c, porId)?.nome ?? "Cliente";

  const filtrados = useMemo(
    () =>
      agenda
        .filter((c) => !c.apagado)
        .filter((c) => !tipo || c.tipo === tipo)
        .filter((c) => !servico || c.servico === servico)
        .filter((c) =>
          status === "todos" ? true : status === "ativos" ? c.status !== "cancelado" && c.status !== "faltou" : c.status === status,
        )
        .sort(porHorario),
    [agenda, tipo, servico, status],
  );
  const porDia = useMemo(() => {
    const m = new Map<string, Compromisso[]>();
    for (const c of filtrados) m.set(c.data, [...(m.get(c.data) ?? []), c]);
    return m;
  }, [filtrados]);

  const passo = (n: number) => {
    if (vista === "semana") setRef(somarDias(ref, 7 * n));
    else if (vista === "dia") setRef(somarDias(ref, n));
    else setRef(new Date(ref.getFullYear(), ref.getMonth() + n, 1));
  };
  const segunda = segundaDa(ref);
  const titulo =
    vista === "semana"
      ? (() => {
          const fim = somarDias(segunda, 6);
          return segunda.getMonth() === fim.getMonth()
            ? `${segunda.getDate()}–${fim.getDate()} de ${MESES[fim.getMonth()]}`
            : `${segunda.getDate()} de ${MESES[segunda.getMonth()].slice(0, 3)} – ${fim.getDate()} de ${MESES[fim.getMonth()].slice(0, 3)}`;
        })()
      : vista === "dia"
        ? `${SEMANA_LONGA[ref.getDay()].replace(/^./, (x) => x.toUpperCase())}, ${ref.getDate()} de ${MESES[ref.getMonth()]}`
        : vista === "mes"
          ? `${MESES[ref.getMonth()]} ${ref.getFullYear()}`
          : "Próximos horários";
  const temExemplos = agenda.some((c) => c.exemplo);

  const select = cn(fieldClass, "h-9 w-auto min-w-0 flex-1 rounded-[9px] pr-7 text-[13px] @md:flex-none");

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <SegmentedControl value={vista} onChange={setVista} options={VISTAS} label="Como ver a agenda" />
        <div className="ml-auto flex items-center gap-1.5">
          <BlockButton variant="secondary" size="sm" onClick={onConfig} aria-label="Configurações da agenda">
            <Settings2 aria-hidden="true" />
            <span className="hidden @md:inline">Ajustes</span>
          </BlockButton>
          <BlockButton size="sm" onClick={() => onNovo(vista === "dia" ? { data: chaveDia(ref) } : {})}>
            <Plus aria-hidden="true" />
            Novo horário
          </BlockButton>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {vista !== "lista" ? (
          <div className="flex items-center gap-1">
            <IconButton label="Anterior" onClick={() => passo(-1)}>
              <ChevronLeft />
            </IconButton>
            <BlockButton variant="secondary" size="sm" onClick={() => setRef(agoraSP())}>
              Hoje
            </BlockButton>
            <IconButton label="Próximo" onClick={() => passo(1)}>
              <ChevronRight />
            </IconButton>
            <h2 className="ml-1 text-[14px] font-semibold first-letter:uppercase" aria-live="polite">
              {titulo}
            </h2>
          </div>
        ) : (
          <label className="relative flex min-w-[200px] flex-1 items-center">
            <span className="sr-only">Buscar cliente</span>
            <Search aria-hidden="true" className="pointer-events-none absolute left-2.5 size-[15px] text-[color:var(--bjork-text-soft)]" />
            <input
              type="search"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar cliente"
              className={cn(fieldClass, "h-9 rounded-[9px] pl-8 text-[13px]")}
            />
          </label>
        )}
        <div className="flex w-full gap-1.5 @3xl:ml-auto @3xl:w-auto">
          <select aria-label="Filtrar por tipo" value={tipo} onChange={(e) => setTipo(e.target.value as TipoCompromisso | "")} className={select}>
            <option value="">Todos os tipos</option>
            {TIPOS_ORDEM.map((t) => (
              <option key={t} value={t}>
                {TIPOS[t].curto}
              </option>
            ))}
          </select>
          <select aria-label="Filtrar por serviço" value={servico} onChange={(e) => setServico(e.target.value as ServicoCompromisso | "")} className={select}>
            <option value="">Todos os serviços</option>
            {(Object.keys(SERVICOS) as ServicoCompromisso[]).map((s) => (
              <option key={s} value={s}>
                {SERVICOS[s]}
              </option>
            ))}
          </select>
          <select aria-label="Filtrar por situação" value={status} onChange={(e) => setStatus(e.target.value as typeof status)} className={select}>
            <option value="ativos">Sem cancelados</option>
            <option value="todos">Todas as situações</option>
            {STATUS_COMPROMISSO_ORDEM.map((s) => (
              <option key={s} value={s}>
                {STATUS_COMPROMISSO[s].nome}
              </option>
            ))}
          </select>
        </div>
      </div>

      {vista === "semana" && (
        <Semana segunda={segunda} porDia={porDia} cfg={cfg} agora={agora} nomeDe={nomeDe} onNovo={onNovo} onAbrir={onAbrir} />
      )}
      {vista === "dia" && (
        <Dia dia={chaveDia(ref)} lista={porDia.get(chaveDia(ref)) ?? []} todos={agenda} cfg={cfg} agora={agora} nomeDe={nomeDe} onNovo={onNovo} onAbrir={onAbrir} />
      )}
      {vista === "mes" && (
        <Mes
          mes={new Date(ref.getFullYear(), ref.getMonth(), 1)}
          porDia={porDia}
          hoje={hoje}
          onDia={(k) => {
            setRef(diaDaChave(k));
            setVista("dia");
          }}
        />
      )}
      {vista === "lista" && (
        <Lista
          lista={filtrados.filter((c) => {
            const q = busca.trim().toLowerCase();
            return (q ? nomeDe(c).toLowerCase().includes(q) : c.data >= hoje) || false;
          })}
          cfg={cfg}
          agora={agora}
          nomeDe={nomeDe}
          onAbrir={onAbrir}
        />
      )}

      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[12px] text-[color:var(--bjork-text-muted)]">
        <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
          {TIPOS_ORDEM.map((t) => (
            <span key={t} className="inline-flex items-center gap-1">
              <span aria-hidden="true" className="size-2 rounded-full" style={{ background: cfg.cores[t] }} />
              {TIPOS[t].curto}
            </span>
          ))}
        </span>
        <BlockButton variant="ghost" size="sm" onClick={() => onExemplos(!temExemplos)}>
          {temExemplos ? "Apagar exemplos" : "Pôr 5 exemplos"}
        </BlockButton>
      </div>
    </div>
  );
}

/** Colunas lado a lado para horários que se sobrepõem no mesmo dia. */
function faixas(lista: Compromisso[]) {
  const fins: number[] = [];
  const lane = new Map<string, number>();
  for (const c of lista.filter((x) => !x.semHora)) {
    const ini = minutosDe(c.hora);
    let i = fins.findIndex((f) => f <= ini);
    if (i < 0) i = fins.push(0) - 1;
    fins[i] = ini + c.duracao;
    lane.set(c.id, i);
  }
  return { lane, total: Math.max(1, fins.length) };
}

function Semana({
  segunda,
  porDia,
  cfg,
  agora,
  nomeDe,
  onNovo,
  onAbrir,
}: {
  segunda: Date;
  porDia: Map<string, Compromisso[]>;
  cfg: ConfigAgenda;
  agora: Date;
  nomeDe: (c: Compromisso) => string;
  onNovo: (r: Rascunho) => void;
  onAbrir: (c: Compromisso) => void;
}) {
  const dias = Array.from({ length: 7 }, (_, i) => somarDias(segunda, i));
  const chaves = dias.map(chaveDia);
  const daSemana = chaves.flatMap((k) => porDia.get(k) ?? []).filter((c) => !c.semHora);
  // A grade cresce se algo ficou fora do horário de atendimento.
  const ini = Math.min(cfg.inicio, ...daSemana.map((c) => Math.floor(minutosDe(c.hora) / 60)));
  const fim = Math.max(cfg.fim, ...daSemana.map((c) => Math.ceil((minutosDe(c.hora) + c.duracao) / 60)));
  const horas = Array.from({ length: fim - ini }, (_, i) => ini + i);
  const hoje = chaveDia(agora);
  const agoraMin = agora.getHours() * 60 + agora.getMinutes();

  return (
    <section aria-label="Semana" className={cn(cardSurface, "overflow-x-auto overscroll-x-contain")}>
      <div className="grid min-w-[700px]" style={{ gridTemplateColumns: "46px repeat(7, minmax(92px, 1fr))" }}>
        <div className="sticky left-0 z-20 border-b border-[color:var(--bjork-border)] bg-[var(--bjork-surface)]" />
        {dias.map((d, i) => {
          const k = chaves[i];
          const semHora = (porDia.get(k) ?? []).filter((c) => c.semHora);
          return (
            <div key={k} className="flex flex-col gap-1 border-b border-l border-[color:var(--bjork-border)] px-1.5 py-2">
              <span
                className={cn(
                  "text-center text-[12px] font-medium",
                  k === hoje ? "text-[color:var(--blk-accent-ink)]" : "text-[color:var(--bjork-text-muted)]",
                  !cfg.dias.includes(d.getDay()) && "opacity-60",
                )}
              >
                {SEMANA_CURTA[d.getDay()]}{" "}
                <span
                  className={cn(
                    "inline-grid size-6 place-items-center rounded-full font-mono tabular-nums",
                    k === hoje && "bg-[var(--bjork-text)] text-[color:var(--bjork-bg)]",
                  )}
                >
                  {d.getDate()}
                </span>
              </span>
              {semHora.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => onAbrir(c)}
                  className={cn("truncate rounded-[6px] px-1.5 py-0.5 text-left text-[11px] font-medium", focusRing)}
                  style={{ background: `${cfg.cores[c.tipo]}1f`, color: cfg.cores[c.tipo] }}
                >
                  {nomeDe(c)}
                </button>
              ))}
            </div>
          );
        })}

        {/* Coluna das horas, fixa ao rolar para o lado */}
        <div className="sticky left-0 z-20 bg-[var(--bjork-surface)]">
          {horas.map((h) => (
            <div key={h} className="relative font-mono text-[10.5px] tabular-nums text-[color:var(--bjork-text-soft)]" style={{ height: HORA_PX }}>
              <span className="absolute -top-[7px] right-1.5">{String(h).padStart(2, "0")}:00</span>
            </div>
          ))}
        </div>
        {dias.map((d, i) => {
          const k = chaves[i];
          const lista = (porDia.get(k) ?? []).filter((c) => !c.semHora);
          const { lane, total } = faixas(lista);
          return (
            <div
              key={k}
              className={cn(
                "relative cursor-copy border-l border-[color:var(--bjork-border)]",
                !cfg.dias.includes(d.getDay()) && "bg-[var(--bjork-surface-active)]/40",
              )}
              style={{
                height: horas.length * HORA_PX,
                backgroundImage: `repeating-linear-gradient(to bottom, var(--bjork-border) 0 1px, transparent 1px ${HORA_PX}px)`,
              }}
              onClick={(e) => {
                if (e.target !== e.currentTarget) return;
                const y = e.nativeEvent.offsetY;
                const min = ini * 60 + Math.floor(y / (HORA_PX / 2)) * 30;
                onNovo({ data: k, hora: horaDosMinutos(min) });
              }}
            >
              {lista.map((c) => {
                const top = ((minutosDe(c.hora) - ini * 60) / 60) * HORA_PX;
                const altura = Math.max((c.duracao / 60) * HORA_PX - 2, 24);
                const l = lane.get(c.id) ?? 0;
                const cor = cfg.cores[c.tipo];
                const caiu = c.status === "cancelado" || c.status === "faltou";
                const Icone = TIPO_ICONE[c.tipo];
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => onAbrir(c)}
                    aria-label={`${c.hora}, ${nomeDe(c)}, ${TIPOS[c.tipo].curto}, ${c.legado ? "combinado" : STATUS_COMPROMISSO[c.status].nome}`}
                    className={cn(
                      "absolute overflow-hidden rounded-[7px] border-l-[3px] px-1.5 py-1 text-left leading-tight shadow-[var(--bjork-shadow-soft)] transition-[filter] hover:brightness-95",
                      focusRing,
                      caiu && "opacity-50 line-through",
                    )}
                    style={{
                      top: top + 1,
                      height: altura,
                      left: `calc(${(l / total) * 100}% + 2px)`,
                      width: `calc(${100 / total}% - 4px)`,
                      borderLeftColor: cor,
                      background: `color-mix(in srgb, ${cor} 14%, var(--bjork-surface))`,
                    }}
                  >
                    <span className="flex items-center gap-1 font-mono text-[10.5px] font-semibold tabular-nums" style={{ color: cor }}>
                      <Icone aria-hidden="true" className="size-3 shrink-0" />
                      {c.hora}
                      {c.status === "confirmado" && <span aria-hidden="true" className="ml-auto size-1.5 rounded-full bg-[var(--blk-success)]" />}
                      {c.status === "remarcado" && <span aria-hidden="true" className="ml-auto size-1.5 rounded-full bg-[var(--blk-warning)]" />}
                    </span>
                    <span className="block truncate text-[11.5px] font-medium text-[color:var(--bjork-text)]">{nomeDe(c)}</span>
                  </button>
                );
              })}
              {k === hoje && agoraMin >= ini * 60 && agoraMin <= fim * 60 && (
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 z-10 h-0.5 bg-[var(--blk-error)]"
                  style={{ top: ((agoraMin - ini * 60) / 60) * HORA_PX }}
                >
                  <span className="absolute -left-1 -top-[3px] size-2 rounded-full bg-[var(--blk-error)]" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function Dia({
  dia,
  lista,
  todos,
  cfg,
  agora,
  nomeDe,
  onNovo,
  onAbrir,
}: {
  dia: string;
  lista: Compromisso[];
  todos: Compromisso[];
  cfg: ConfigAgenda;
  agora: Date;
  nomeDe: (c: Compromisso) => string;
  onNovo: (r: Rascunho) => void;
  onAbrir: (c: Compromisso) => void;
}) {
  const livres = horariosLivres(dia, cfg.duracao, todos, cfg, "", agora);
  // Mostra os livres de hora em hora, para a lista não ficar enorme.
  const resumo = livres.filter((h) => h.endsWith(":00")).slice(0, 10);
  return (
    <section aria-label="Dia" className={cn(cardSurface, "flex flex-col gap-1.5 p-2.5")}>
      {lista.length === 0 ? (
        <p className="px-1 py-2 text-[13px] text-[color:var(--bjork-text-muted)]">Nada marcado nesse dia.</p>
      ) : (
        <ol className="flex flex-col gap-1.5">
          {lista.map((c) => {
            const passou = fimDe(c) < agora && c.status !== "realizado";
            return (
              <li key={c.id} className="flex items-stretch gap-2.5">
                <span
                  className="w-[46px] shrink-0 pt-2.5 text-right font-mono text-[12.5px] font-semibold tabular-nums"
                  style={{ color: passou && !c.legado ? "var(--blk-error)" : "var(--bjork-text)" }}
                >
                  {c.semHora ? "—" : c.hora}
                </span>
                <div className="min-w-0 flex-1">
                  <LinhaCompromisso
                    c={c}
                    nome={nomeDe(c)}
                    detalhe={[TIPOS[c.tipo].curto, faixaHorario(c), c.local || (c.legado ? c.obs : "")].filter(Boolean).join(" · ")}
                    cfg={cfg}
                    onAbrir={onAbrir}
                  />
                </div>
              </li>
            );
          })}
        </ol>
      )}
      {resumo.length > 0 && (
        <div className="border-t border-[color:var(--bjork-border)] px-1 pt-2.5">
          <p className="mb-1.5 text-[12px] font-medium text-[color:var(--bjork-text-muted)]">Horários livres (toque para marcar)</p>
          <div className="flex flex-wrap gap-1.5">
            {resumo.map((h) => (
              <Pilula key={h} ativa={false} onClick={() => onNovo({ data: dia, hora: h })} className="h-8 px-2.5 font-mono text-[12.5px]">
                {h}
              </Pilula>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function Mes({
  mes,
  porDia,
  hoje,
  onDia,
}: {
  mes: Date;
  porDia: Map<string, Compromisso[]>;
  hoje: string;
  onDia: (k: string) => void;
}) {
  // Seis semanas a partir da segunda antes do dia 1.
  const inicio = segundaDa(mes);
  const dias = Array.from({ length: 42 }, (_, i) => somarDias(inicio, i));
  return (
    <section aria-label="Mês" className={cn(cardSurface, "p-3")}>
      <div role="grid" className="grid grid-cols-7 gap-1 text-center">
        {[1, 2, 3, 4, 5, 6, 0].map((d) => (
          <span key={d} aria-hidden="true" className="pb-1 text-[11.5px] font-medium text-[color:var(--bjork-text-soft)]">
            {SEMANA_CURTA[d]}
          </span>
        ))}
        {dias.map((d) => {
          const k = chaveDia(d);
          const n = porDia.get(k)?.length ?? 0;
          const fora = d.getMonth() !== mes.getMonth();
          return (
            <button
              key={k}
              type="button"
              onClick={() => onDia(k)}
              aria-label={`${d.getDate()} de ${MESES[d.getMonth()]}${k === hoje ? ", hoje" : ""}${n ? `, ${n} ${n === 1 ? "horário" : "horários"}` : ""}`}
              className={cn(
                "flex h-14 cursor-pointer flex-col items-center justify-center gap-1 rounded-[10px] text-[13.5px] tabular-nums transition-colors hover:bg-[var(--bjork-surface-hover)]",
                focusRing,
                fora && "text-[color:var(--bjork-text-faint)]",
              )}
            >
              <span
                className={cn(
                  "grid size-7 place-items-center rounded-full",
                  k === hoje && "bg-[var(--bjork-text)] font-semibold text-[color:var(--bjork-bg)]",
                )}
              >
                {d.getDate()}
              </span>
              {n > 0 ? (
                <span
                  className="min-w-[18px] rounded-full px-1 text-[10.5px] font-semibold leading-[16px]"
                  style={{
                    background: k < hoje ? "var(--bjork-surface-active)" : "var(--bjork-accent-soft)",
                    color: k < hoje ? "var(--bjork-text-muted)" : "var(--blk-accent-ink)",
                  }}
                >
                  {n}
                </span>
              ) : (
                <span className="h-4" />
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}

function Lista({
  lista,
  cfg,
  agora,
  nomeDe,
  onAbrir,
}: {
  lista: Compromisso[];
  cfg: ConfigAgenda;
  agora: Date;
  nomeDe: (c: Compromisso) => string;
  onAbrir: (c: Compromisso) => void;
}) {
  const grupos = new Map<string, Compromisso[]>();
  for (const c of lista) grupos.set(c.data, [...(grupos.get(c.data) ?? []), c]);
  if (!lista.length)
    return (
      <p className={cn(cardSurface, "px-4 py-3 text-[13px] text-[color:var(--bjork-text-muted)]")}>Nenhum horário daqui pra frente.</p>
    );
  return (
    <section aria-label="Lista" className="flex flex-col gap-3">
      {[...grupos].map(([k, itens]) => {
        const d = diaDaChave(k);
        const nome = k === chaveDia(agora) ? "Hoje" : k === chaveDia(somarDias(agora, 1)) ? "Amanhã" : SEMANA_LONGA[d.getDay()];
        return (
          <div key={k} className={cn(cardSurface, "flex flex-col gap-1.5 p-2.5")}>
            <h3 className="px-1 text-[12.5px] font-semibold first-letter:uppercase">
              {nome} <span className="font-normal text-[color:var(--bjork-text-muted)]">{k.split("-").reverse().join("/")}</span>
            </h3>
            {itens.map((c) => (
              <LinhaCompromisso
                key={c.id}
                c={c}
                nome={nomeDe(c)}
                detalhe={[faixaHorario(c), TIPOS[c.tipo].curto, c.local].filter(Boolean).join(" · ")}
                cfg={cfg}
                onAbrir={onAbrir}
              />
            ))}
          </div>
        );
      })}
    </section>
  );
}

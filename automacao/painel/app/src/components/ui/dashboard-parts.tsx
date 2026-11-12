import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { ArrowDownRight, ArrowUpRight, ChartArea, Table2 } from "lucide-react";
import {
  IconButton,
  cardSurface,
  focusRing,
  useBlockReducedMotion,
  useElementWidth,
} from "@/components/ui/app-dashboard-shell-utils/app-block-kit";
import { cn } from "@/lib/utils";

/* ----------------------------------------------------------------------------------------------
 * Controle segmentado: grupo de rádio com foco itinerante.
 * -------------------------------------------------------------------------------------------- */

export interface SegmentOption<T extends string> {
  id: T;
  label: string;
  /** Nome completo, lido por leitores de tela. */
  long: string;
}

export function SegmentedControl<T extends string>({
  value,
  onChange,
  options,
  label,
}: {
  value: T;
  onChange: (value: T) => void;
  options: SegmentOption<T>[];
  label: string;
}) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const count = options.length;
  const index = Math.max(
    0,
    options.findIndex((option) => option.id === value),
  );
  const onKeyDown = (event: ReactKeyboardEvent) => {
    let next = index;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") next = (index + 1) % count;
    else if (event.key === "ArrowLeft" || event.key === "ArrowUp")
      next = (index - 1 + count) % count;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = count - 1;
    else return;
    event.preventDefault();
    onChange(options[next].id);
    refs.current[next]?.focus();
  };
  return (
    <div
      role="radiogroup"
      aria-label={label}
      onKeyDown={onKeyDown}
      className="relative inline-grid rounded-[11px] border border-[color:var(--bjork-border)] bg-[var(--bjork-field-inset)] p-[3px] shadow-[var(--bjork-shadow-inset)]"
      style={{ gridTemplateColumns: `repeat(${count}, minmax(0, 1fr))` }}
    >
      <span
        aria-hidden="true"
        className="absolute inset-y-[3px] left-[3px] rounded-[8px] bg-[var(--bjork-surface)] shadow-[var(--bjork-shadow-surface),0_0_0_1px_var(--bjork-border)] transition-transform duration-[220ms] ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none"
        style={{
          width: `calc((100% - 6px) / ${count})`,
          transform: `translateX(${index * 100}%)`,
        }}
      />
      {options.map((option, i) => (
        <button
          key={option.id}
          ref={(el) => {
            refs.current[i] = el;
          }}
          type="button"
          role="radio"
          aria-checked={option.id === value}
          aria-label={option.long}
          tabIndex={option.id === value ? 0 : -1}
          onClick={() => onChange(option.id)}
          className={cn(
            "relative z-10 h-7 min-w-[46px] cursor-pointer whitespace-nowrap rounded-[8px] px-2.5 font-mono text-[11.5px] font-medium tabular-nums transition-colors duration-150",
            option.id === value
              ? "text-[color:var(--bjork-text)]"
              : "text-[color:var(--bjork-text-muted)] hover:text-[color:var(--bjork-text)]",
            focusRing,
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

/* ----------------------------------------------------------------------------------------------
 * Cartão de indicador
 * -------------------------------------------------------------------------------------------- */

export interface KpiData {
  id: string;
  label: string;
  value: string;
  /** Texto da etiqueta colorida. */
  chip: string;
  trend: "up" | "down" | "none";
  tone: "good" | "bad" | "neutral";
  /** Texto apagado ao lado da etiqueta. */
  hint: string;
}

const CHIP_TONE: Record<KpiData["tone"], string> = {
  good: "bg-[var(--blk-success-soft)] text-[color:var(--blk-success)]",
  bad: "bg-[var(--blk-error-soft)] text-[color:var(--blk-error)]",
  neutral: "bg-[var(--bjork-surface-active)] text-[color:var(--bjork-text-medium)]",
};

export function KpiCard({ kpi }: { kpi: KpiData }) {
  const Arrow = kpi.trend === "down" ? ArrowDownRight : ArrowUpRight;
  return (
    <article
      className={cn(
        cardSurface,
        "@container/kpi relative flex min-w-0 flex-col overflow-hidden p-3.5 @3xl/main:p-4",
      )}
    >
      <h3 className="text-[12.5px] font-medium text-[color:var(--bjork-text-muted)]">
        {kpi.label}
      </h3>
      <p className="mt-3 truncate text-[21px] font-semibold leading-none tracking-[-0.03em] tabular-nums @[220px]/kpi:text-[26px]">
        {kpi.value}
      </p>
      <p className="mt-2.5 flex items-center gap-1.5 text-[12px]">
        <span
          className={cn(
            "inline-flex items-center gap-0.5 whitespace-nowrap rounded-[6px] px-1.5 py-[2px] font-mono text-[11px] font-medium tabular-nums",
            CHIP_TONE[kpi.tone],
          )}
        >
          {kpi.trend !== "none" && (
            <Arrow aria-hidden="true" className="size-3" strokeWidth={2.25} />
          )}
          {kpi.chip}
        </span>
        <span className="truncate text-[color:var(--bjork-text-soft)]">{kpi.hint}</span>
      </p>
    </article>
  );
}

/* ----------------------------------------------------------------------------------------------
 * Gráfico de comparação: série principal em área, série de comparação tracejada,
 * leitura por toque ou setas, e visão em tabela.
 * -------------------------------------------------------------------------------------------- */

export interface ComparePoint {
  /** Rótulo completo do ponto (dica e tabela). */
  label: string;
  /** Rótulo curto do eixo. */
  tick: string;
  current: number;
  previous: number;
  currentText: string;
  previousText: string;
}

// Interpolação cúbica monótona: a curva nunca passa do valor real.
function smoothPath(pts: number[][]) {
  if (pts.length < 2) return "";
  const n = pts.length;
  const dx: number[] = [];
  const slope: number[] = [];
  for (let i = 0; i < n - 1; i += 1) {
    dx.push(pts[i + 1][0] - pts[i][0]);
    slope.push((pts[i + 1][1] - pts[i][1]) / (dx[i] || 1));
  }
  const m: number[] = [slope[0]];
  for (let i = 1; i < n - 1; i += 1) {
    m.push(
      slope[i - 1] * slope[i] <= 0
        ? 0
        : (3 * (dx[i - 1] + dx[i])) /
            ((2 * dx[i] + dx[i - 1]) / slope[i - 1] + (dx[i] + 2 * dx[i - 1]) / slope[i]),
    );
  }
  m.push(slope[n - 2]);
  let d = `M ${pts[0][0].toFixed(2)} ${pts[0][1].toFixed(2)}`;
  for (let i = 0; i < n - 1; i += 1) {
    const [x0, y0] = pts[i];
    const [x1, y1] = pts[i + 1];
    const h = dx[i] / 3;
    d += ` C ${(x0 + h).toFixed(2)} ${(y0 + m[i] * h).toFixed(2)}, ${(x1 - h).toFixed(2)} ${(y1 - m[i + 1] * h).toFixed(2)}, ${x1.toFixed(2)} ${y1.toFixed(2)}`;
  }
  return d;
}

const CHART_H = 236;
const PAD = { top: 16, right: 12, bottom: 28, left: 52 };
const NICE_STEPS = [1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10];

function niceMax(value: number) {
  const exp = Math.pow(10, Math.floor(Math.log10(value)));
  const fraction = value / exp;
  return (NICE_STEPS.find((step) => fraction <= step) ?? 10) * exp;
}

export function CompareChart({
  title,
  headline,
  headlineNote,
  points,
  currentLabel,
  previousLabel,
  axis,
  ceiling,
  summary,
  pointHeader,
  emptyText,
  animate = true,
}: {
  title: string;
  headline: string;
  headlineNote: string;
  points: ComparePoint[];
  currentLabel: string;
  previousLabel: string;
  /** Formata os valores do eixo vertical. */
  axis: (value: number) => string;
  /** Topo do eixo vertical a partir do maior valor; sem isso, arredonda para um número redondo. */
  ceiling?: (peak: number) => number;
  /** Resumo em texto para leitores de tela. */
  summary: string;
  /** Cabeçalho da primeira coluna na visão em tabela. */
  pointHeader: string;
  emptyText: string;
  animate?: boolean;
}) {
  const [view, setView] = useState<"chart" | "table">("chart");
  const [hover, setHover] = useState<number | null>(null);
  const plotRef = useRef<HTMLDivElement>(null);
  const width = useElementWidth(plotRef);
  const reduce = useBlockReducedMotion();
  const [revealed, setRevealed] = useState(!animate);
  const titleId = useId();
  const descId = useId();
  const gradId = useId();
  const clipId = useId();

  useEffect(() => {
    if (!animate || reduce) return;
    const id = window.requestAnimationFrame(() => setRevealed(true));
    return () => window.cancelAnimationFrame(id);
  }, [animate, reduce]);
  const shown = revealed || reduce;

  const peak = Math.max(0, ...points.map((p) => Math.max(p.current, p.previous)));
  const hasData = points.length > 1 && peak > 0;
  const max = !hasData ? 1 : ceiling ? ceiling(peak) : niceMax(peak * 1.08);
  const w = Math.max(width, 240);
  const innerW = w - PAD.left - PAD.right;
  const innerH = CHART_H - PAD.top - PAD.bottom;
  const x = useCallback(
    (i: number) =>
      PAD.left + (points.length <= 1 ? innerW / 2 : (i / (points.length - 1)) * innerW),
    [innerW, points.length],
  );
  const y = (value: number) => PAD.top + innerH - (value / max) * innerH;

  const curD = smoothPath(points.map((p, i) => [x(i), y(p.current)]));
  const prevD = smoothPath(points.map((p, i) => [x(i), y(p.previous)]));
  const areaD = `${curD} L ${x(points.length - 1)} ${PAD.top + innerH} L ${x(0)} ${PAD.top + innerH} Z`;
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => t * max);
  const labelEvery = Math.ceil(points.length / Math.max(2, Math.floor(innerW / 64)));

  const pickIndex = (clientX: number) => {
    const el = plotRef.current;
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    // O painel pode estar encolhido por `transform: scale`; converte px de tela em px de layout.
    const ratio = rect.width ? el.offsetWidth / rect.width : 1;
    const px = (clientX - rect.left) * ratio - PAD.left;
    return Math.max(
      0,
      Math.min(points.length - 1, Math.round((px / innerW) * (points.length - 1))),
    );
  };

  const onKeyDown = (event: ReactKeyboardEvent) => {
    const last = points.length - 1;
    const at = hover ?? last;
    let next: number | null = null;
    if (event.key === "ArrowRight") next = Math.min(last, hover === null ? last : at + 1);
    else if (event.key === "ArrowLeft") next = Math.max(0, hover === null ? last : at - 1);
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = last;
    else if (event.key === "Escape") {
      setHover(null);
      return;
    } else return;
    event.preventDefault();
    setHover(next);
  };

  const active = hover !== null ? points[hover] : null;
  const tipLeft = hover !== null ? x(hover) : 0;
  const tipFlip = tipLeft > w - 200;

  return (
    <section aria-labelledby={titleId} className={cn(cardSurface, "flex min-w-0 flex-col")}>
      <div className="flex items-center justify-between gap-3 px-4 pt-3.5">
        <h2 id={titleId} className="min-w-0 truncate text-[13.5px] font-semibold">
          {title}
        </h2>
        <div className="flex shrink-0 items-center gap-3">
          <ul
            className="hidden items-center gap-3 text-[11.5px] text-[color:var(--bjork-text-muted)] @md/main:flex"
            aria-label="Legenda"
          >
            <li className="flex items-center gap-1.5">
              <span
                aria-hidden="true"
                className="h-[2px] w-3.5 rounded-full bg-[var(--bjork-accent)]"
              />
              {currentLabel}
            </li>
            <li className="flex items-center gap-1.5">
              <svg aria-hidden="true" width="14" height="2" className="overflow-visible">
                <line
                  x1="0"
                  x2="14"
                  y1="1"
                  y2="1"
                  stroke="var(--blk-chart-ghost)"
                  strokeWidth="1.5"
                  strokeDasharray="3 3"
                />
              </svg>
              {previousLabel}
            </li>
          </ul>
          <div
            className="flex rounded-[9px] border border-[color:var(--bjork-border)] p-[2px]"
            role="group"
            aria-label="Modo de ver"
          >
            <IconButton
              label="Ver gráfico"
              size="sm"
              pressed={view === "chart"}
              onClick={() => setView("chart")}
              className="size-6 rounded-[7px] aria-pressed:bg-[var(--bjork-surface-active)] aria-pressed:text-[color:var(--blk-accent-ink)]"
            >
              <ChartArea />
            </IconButton>
            <IconButton
              label="Ver tabela"
              size="sm"
              pressed={view === "table"}
              onClick={() => setView("table")}
              className="size-6 rounded-[7px] aria-pressed:bg-[var(--bjork-surface-active)] aria-pressed:text-[color:var(--blk-accent-ink)]"
            >
              <Table2 />
            </IconButton>
          </div>
        </div>
      </div>
      <p className="flex flex-wrap items-baseline gap-x-2 px-4 text-[12.5px] text-[color:var(--bjork-text-muted)]">
        <span className="text-[19px] font-semibold tracking-[-0.025em] tabular-nums text-[color:var(--bjork-text)]">
          {headline}
        </span>
        <span className="tabular-nums">{headlineNote}</span>
      </p>

      {!hasData ? (
        <p
          className="mx-1 mb-1 mt-2 grid place-items-center px-4 text-center text-[13px] text-[color:var(--bjork-text-muted)]"
          style={{ height: CHART_H }}
        >
          {emptyText}
        </p>
      ) : view === "chart" ? (
        <div
          ref={plotRef}
          role="img"
          tabIndex={0}
          aria-labelledby={titleId}
          aria-describedby={descId}
          onKeyDown={onKeyDown}
          onPointerDown={(event) => setHover(pickIndex(event.clientX))}
          onPointerMove={(event) => setHover(pickIndex(event.clientX))}
          onPointerLeave={() => setHover(null)}
          onBlur={() => setHover(null)}
          className="relative mx-1 mb-1 mt-2 cursor-crosshair touch-pan-y rounded-[12px] outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--bjork-accent)]"
          style={{ height: CHART_H }}
        >
          <p id={descId} className="sr-only">
            {summary} Use as setas para a esquerda e para a direita para ler cada ponto.
          </p>
          {width > 0 && (
            <svg width={w} height={CHART_H} className="block overflow-visible" aria-hidden="true">
              <defs>
                <linearGradient id={gradId} x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0" stopColor="var(--bjork-accent)" stopOpacity="0.22" />
                  <stop offset="1" stopColor="var(--bjork-accent)" stopOpacity="0" />
                </linearGradient>
                <clipPath id={clipId}>
                  <rect
                    x={0}
                    y={0}
                    width={w}
                    height={CHART_H}
                    style={{
                      transformOrigin: `${PAD.left}px 0`,
                      transform: shown ? "scaleX(1)" : "scaleX(0)",
                      transition:
                        animate && !reduce ? "transform 700ms cubic-bezier(0.23,1,0.32,1)" : "none",
                    }}
                  />
                </clipPath>
              </defs>
              {ticks.map((t) => (
                <g key={t}>
                  <line
                    x1={PAD.left}
                    x2={w - PAD.right}
                    y1={y(t)}
                    y2={y(t)}
                    stroke="var(--bjork-border)"
                    strokeDasharray={t === 0 ? undefined : "2 4"}
                  />
                  <text
                    x={PAD.left - 10}
                    y={y(t)}
                    dy="0.32em"
                    textAnchor="end"
                    className="fill-[color:var(--bjork-text-soft)] font-mono text-[11px] tabular-nums"
                  >
                    {axis(t)}
                  </text>
                </g>
              ))}
              {points.map((p, i) => {
                const last = points.length - 1;
                // Um rótulo a cada n pontos, mais o último; some o que ficaria colado nele.
                const show = i === last || (i % labelEvery === 0 && last - i >= labelEvery * 0.7);
                if (!show) return null;
                return (
                  <text
                    key={p.label}
                    x={x(i)}
                    y={CHART_H - 8}
                    textAnchor={i === 0 ? "start" : i === last ? "end" : "middle"}
                    className="fill-[color:var(--bjork-text-soft)] font-mono text-[11px]"
                  >
                    {p.tick}
                  </text>
                );
              })}
              <g clipPath={`url(#${clipId})`}>
                <path
                  d={prevD}
                  fill="none"
                  stroke="var(--blk-chart-ghost)"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                  strokeLinecap="round"
                />
                <path d={areaD} fill={`url(#${gradId})`} />
                <path
                  d={curD}
                  fill="none"
                  stroke="var(--bjork-accent)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>
              {hover !== null && (
                <g>
                  <line
                    x1={x(hover)}
                    x2={x(hover)}
                    y1={PAD.top}
                    y2={PAD.top + innerH}
                    stroke="var(--bjork-border-strong)"
                  />
                  <circle
                    cx={x(hover)}
                    cy={y(points[hover].previous)}
                    r="3.5"
                    fill="var(--bjork-surface)"
                    stroke="var(--blk-chart-ghost)"
                    strokeWidth="1.5"
                  />
                  <circle
                    cx={x(hover)}
                    cy={y(points[hover].current)}
                    r="4.5"
                    fill="var(--bjork-accent)"
                    stroke="var(--bjork-surface)"
                    strokeWidth="2"
                  />
                </g>
              )}
            </svg>
          )}
          {active && (
            <div
              aria-hidden="true"
              className="pointer-events-none absolute top-2 z-10 w-[188px] rounded-[12px] border border-[color:var(--bjork-border)] bg-[var(--bjork-menu)] p-2.5 shadow-[var(--bjork-shadow-menu)]"
              style={{ left: tipFlip ? tipLeft - 188 - 12 : tipLeft + 12 }}
            >
              <p className="text-[11.5px] font-medium text-[color:var(--bjork-text-muted)]">
                {active.label}
              </p>
              <dl className="mt-1.5 space-y-1 text-[12px]">
                <div className="flex items-center justify-between gap-2">
                  <dt className="flex items-center gap-1.5 text-[color:var(--bjork-text-medium)]">
                    <span className="h-[2px] w-2.5 rounded-full bg-[var(--bjork-accent)]" />
                    {currentLabel}
                  </dt>
                  <dd className="font-mono tabular-nums">{active.currentText}</dd>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <dt className="flex items-center gap-1.5 text-[color:var(--bjork-text-medium)]">
                    <span className="h-[2px] w-2.5 rounded-full bg-[var(--blk-chart-ghost)]" />
                    {previousLabel}
                  </dt>
                  <dd className="font-mono tabular-nums text-[color:var(--bjork-text-muted)]">
                    {active.previousText}
                  </dd>
                </div>
              </dl>
            </div>
          )}
          <span className="sr-only" aria-live="polite">
            {active
              ? `${active.label}: ${currentLabel} ${active.currentText}, ${previousLabel} ${active.previousText}`
              : ""}
          </span>
        </div>
      ) : (
        <div className="mx-1 mb-1 mt-2 max-h-[236px] overflow-auto rounded-[12px]">
          <table className="w-full text-[12.5px]">
            <caption className="sr-only">{title}</caption>
            <thead className="sticky top-0 bg-[var(--bjork-surface)]">
              <tr className="text-left text-[11px] uppercase tracking-[0.06em] text-[color:var(--bjork-text-soft)]">
                <th scope="col" className="px-3 py-2 font-medium">
                  {pointHeader}
                </th>
                <th scope="col" className="px-3 py-2 text-right font-medium">
                  {currentLabel}
                </th>
                <th scope="col" className="px-3 py-2 text-right font-medium">
                  {previousLabel}
                </th>
              </tr>
            </thead>
            <tbody>
              {points.map((p) => (
                <tr key={p.label} className="border-t border-[color:var(--bjork-border)]">
                  <th
                    scope="row"
                    className="px-3 py-1.5 text-left font-normal text-[color:var(--bjork-text-medium)]"
                  >
                    {p.label}
                  </th>
                  <td className="px-3 py-1.5 text-right font-mono tabular-nums">
                    {p.currentText}
                  </td>
                  <td className="px-3 py-1.5 text-right font-mono tabular-nums text-[color:var(--bjork-text-muted)]">
                    {p.previousText}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

/* ----------------------------------------------------------------------------------------------
 * Divisão em barras
 * -------------------------------------------------------------------------------------------- */

export function Breakdown({
  title,
  totalText,
  rows,
  emptyText,
}: {
  title: string;
  totalText: string;
  /** `muted` marca uma linha que junta o resto (ex.: "Outros") e não deve competir com as demais. */
  rows: { label: string; value: number; muted?: boolean }[];
  emptyText: string;
}) {
  const total = rows.reduce((sum, row) => sum + row.value, 0);
  const max = Math.max(1, ...rows.map((row) => row.value));
  const titleId = useId();
  return (
    <section aria-labelledby={titleId} className={cn(cardSurface, "flex min-w-0 flex-col p-4")}>
      <div className="flex items-baseline justify-between">
        <h2 id={titleId} className="text-[13.5px] font-semibold">
          {title}
        </h2>
        <span className="font-mono text-[11.5px] tabular-nums text-[color:var(--bjork-text-muted)]">
          {totalText}
        </span>
      </div>
      {rows.length === 0 ? (
        <p className="mt-4 text-[13px] text-[color:var(--bjork-text-muted)]">{emptyText}</p>
      ) : (
        <ul className="mt-4 flex flex-1 flex-col justify-between gap-3.5">
          {rows.map((row, i) => (
            <li key={row.label}>
              <div className="flex items-baseline justify-between gap-2 text-[12.5px]">
                <span className="truncate text-[color:var(--bjork-text-medium)]">{row.label}</span>
                <span className="shrink-0 font-mono text-[11.5px] tabular-nums">
                  {row.value}
                  <span className="ml-1.5 inline-block w-[3.6ch] text-right text-[color:var(--bjork-text-soft)]">
                    {Math.round((row.value / total) * 100)}%
                  </span>
                </span>
              </div>
              <div
                aria-hidden="true"
                className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[var(--bjork-surface-active)]"
              >
                <div
                  className={cn(
                    "h-full rounded-full",
                    row.muted ? "bg-[var(--bjork-text-faint)]" : "bg-[var(--bjork-accent)]",
                  )}
                  style={{
                    width: `${(row.value / max) * 100}%`,
                    opacity: row.muted ? 1 : Math.max(0.3, 1 - i * 0.14),
                  }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

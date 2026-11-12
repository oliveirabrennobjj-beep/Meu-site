import { useId, useRef, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { cardSurface, focusRing } from "@/components/ui/app-dashboard-shell-utils/app-block-kit";
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
 * Lista de grupos com barra de proporção; tocar em um grupo escolhe só ele.
 * -------------------------------------------------------------------------------------------- */

export function PickList({
  title,
  totalText,
  rows,
  selected,
  onSelect,
  emptyText,
}: {
  title: string;
  /** Texto curto à direita do título (ex.: dica de uso). */
  totalText: string;
  rows: { label: string; value: number }[];
  selected: string | null;
  /** Recebe o grupo tocado, ou `null` quando o toque desfaz a escolha. */
  onSelect: (label: string | null) => void;
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
        <span className="text-[12px] text-[color:var(--bjork-text-muted)]">{totalText}</span>
      </div>
      {rows.length === 0 ? (
        <p className="mt-4 text-[13px] text-[color:var(--bjork-text-muted)]">{emptyText}</p>
      ) : (
        <ul className="-mx-2 mt-2 grid grid-cols-2 gap-x-3 @5xl/main:grid-cols-1">
          {rows.map((row) => {
            const active = selected === row.label;
            const dimmed = selected !== null && !active;
            return (
              <li key={row.label} className="min-w-0">
                <button
                  type="button"
                  aria-pressed={active}
                  onClick={() => onSelect(active ? null : row.label)}
                  className={cn(
                    "block w-full cursor-pointer rounded-[10px] px-2 py-2 text-left transition-[background-color,opacity] duration-150 hover:bg-[var(--bjork-surface-hover)]",
                    active && "bg-[var(--bjork-surface-active)]",
                    dimmed && "opacity-55",
                    focusRing,
                  )}
                >
                  <span className="flex items-baseline justify-between gap-2 text-[12.5px]">
                    <span
                      className={cn(
                        "truncate",
                        active
                          ? "font-medium text-[color:var(--bjork-text)]"
                          : "text-[color:var(--bjork-text-medium)]",
                      )}
                    >
                      {row.label}
                    </span>
                    <span className="shrink-0 font-mono text-[11.5px] tabular-nums">
                      {row.value}
                      <span className="ml-1.5 inline-block w-[3.6ch] text-right text-[color:var(--bjork-text-soft)]">
                        {Math.round((row.value / total) * 100)}%
                      </span>
                    </span>
                  </span>
                  <span
                    aria-hidden="true"
                    className="mt-1.5 block h-1.5 overflow-hidden rounded-full bg-[var(--bjork-surface-active)]"
                  >
                    <span
                      className="block h-full rounded-full bg-[var(--bjork-accent)]"
                      style={{ width: `${(row.value / max) * 100}%` }}
                    />
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

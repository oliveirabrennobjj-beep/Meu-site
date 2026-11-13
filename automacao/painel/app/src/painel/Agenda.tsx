import { useId, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cardSurface, focusRing } from "@/components/ui/app-dashboard-shell-utils/app-block-kit";
import { cn } from "@/lib/utils";
import { atrasado, dataDoCompromisso } from "./assistente";
import type { Lead } from "./leads";

const MESES = [
  "janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
];
const SEMANA = ["D", "S", "T", "Q", "Q", "S", "S"];
const SEMANA_LONGA = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"];

const dois = (n: number) => String(n).padStart(2, "0");
const chave = (d: Date) => `${d.getFullYear()}-${dois(d.getMonth() + 1)}-${dois(d.getDate())}`;

/** Calendário do mês com o que ficou marcado com cada loja; toque num dia para ver a lista. */
export function Agenda({ leads, onAbrir }: { leads: Lead[]; onAbrir: (lead: Lead) => void }) {
  const tituloId = useId();
  const hoje = new Date();
  const [mes, setMes] = useState(() => new Date(hoje.getFullYear(), hoje.getMonth(), 1));
  const [dia, setDia] = useState(() => chave(hoje));

  const porDia = useMemo(() => {
    const mapa = new Map<string, Lead[]>();
    for (const lead of leads) {
      if (!lead.compromisso) continue;
      const k = lead.compromisso.quando.slice(0, 10);
      mapa.set(k, [...(mapa.get(k) ?? []), lead]);
    }
    for (const lista of mapa.values())
      lista.sort(
        (a, b) =>
          dataDoCompromisso(a.compromisso!.quando).getTime() - dataDoCompromisso(b.compromisso!.quando).getTime(),
      );
    return mapa;
  }, [leads]);

  // Seis semanas a partir do domingo antes do dia 1, como num calendário de papel.
  const inicio = new Date(mes.getFullYear(), mes.getMonth(), 1 - mes.getDay());
  const dias = Array.from({ length: 42 }, (_, i) => new Date(inicio.getFullYear(), inicio.getMonth(), inicio.getDate() + i));
  const mudarMes = (passo: number) => setMes(new Date(mes.getFullYear(), mes.getMonth() + passo, 1));

  const escolhido = dataDoCompromisso(dia);
  const doDia = porDia.get(dia) ?? [];
  const atrasados = [...porDia.entries()].filter(([k]) => k < chave(hoje)).reduce((n, [, l]) => n + l.length, 0);
  const nomeDia =
    dia === chave(hoje)
      ? "Hoje"
      : dia === chave(new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() + 1))
        ? "Amanhã"
        : SEMANA_LONGA[escolhido.getDay()].replace(/^./, (c) => c.toUpperCase());

  return (
    <div className="grid grid-cols-1 items-start gap-4 @5xl/main:grid-cols-[360px_minmax(0,1fr)] @3xl:gap-5">
      <section aria-labelledby={tituloId} className={cn(cardSurface, "p-3")}>
        <div className="flex items-center justify-between gap-2 pb-2">
          <button
            type="button"
            onClick={() => mudarMes(-1)}
            aria-label="Mês anterior"
            className={cn("grid size-9 cursor-pointer place-items-center rounded-[9px] hover:bg-[var(--bjork-surface-hover)]", focusRing)}
          >
            <ChevronLeft aria-hidden="true" className="size-4" />
          </button>
          <h2 id={tituloId} className="text-[14px] font-semibold first-letter:uppercase" aria-live="polite">
            {MESES[mes.getMonth()]} <span className="text-[color:var(--bjork-text-muted)]">{mes.getFullYear()}</span>
          </h2>
          <button
            type="button"
            onClick={() => mudarMes(1)}
            aria-label="Próximo mês"
            className={cn("grid size-9 cursor-pointer place-items-center rounded-[9px] hover:bg-[var(--bjork-surface-hover)]", focusRing)}
          >
            <ChevronRight aria-hidden="true" className="size-4" />
          </button>
        </div>

        <div role="grid" aria-labelledby={tituloId} className="grid grid-cols-7 gap-y-1 text-center">
          {SEMANA.map((s, i) => (
            <span key={i} aria-hidden="true" className="pb-1 text-[11.5px] font-medium text-[color:var(--bjork-text-soft)]">
              {s}
            </span>
          ))}
          {dias.map((d) => {
            const k = chave(d);
            const marcados = porDia.get(k)?.length ?? 0;
            const foraDoMes = d.getMonth() !== mes.getMonth();
            const ehHoje = k === chave(hoje);
            const ativo = k === dia;
            const passou = marcados > 0 && k < chave(hoje);
            return (
              <button
                key={k}
                type="button"
                onClick={() => setDia(k)}
                aria-pressed={ativo}
                aria-label={`${d.getDate()} de ${MESES[d.getMonth()]}${ehHoje ? ", hoje" : ""}${
                  marcados ? `, ${marcados} ${marcados === 1 ? "loja marcada" : "lojas marcadas"}` : ""
                }`}
                className={cn(
                  "relative mx-auto grid size-10 cursor-pointer place-items-center rounded-full text-[13.5px] tabular-nums transition-colors",
                  focusRing,
                  foraDoMes && "text-[color:var(--bjork-text-faint)]",
                  !ehHoje && !ativo && "hover:bg-[var(--bjork-surface-hover)]",
                  ehHoje && "bg-[var(--bjork-text)] font-semibold text-[color:var(--bjork-bg)]",
                  ativo && !ehHoje && "bg-[var(--bjork-accent-soft)] font-semibold text-[color:var(--blk-accent-ink)]",
                  ativo && ehHoje && "ring-2 ring-[color:var(--bjork-accent)] ring-offset-2 ring-offset-[color:var(--bjork-surface)]",
                )}
              >
                {d.getDate()}
                {marcados > 0 && (
                  <span
                    aria-hidden="true"
                    className="absolute bottom-1 left-1/2 size-1.5 -translate-x-1/2 rounded-full"
                    style={{ background: passou ? "var(--blk-error)" : "var(--bjork-accent)" }}
                  />
                )}
              </button>
            );
          })}
        </div>
        {atrasados > 0 && (
          <p className="mt-2 px-1 text-[12px] text-[color:var(--blk-error)]">
            {atrasados} {atrasados === 1 ? "combinado ficou" : "combinados ficaram"} para trás (ponto vermelho).
          </p>
        )}
      </section>

      <section aria-live="polite" className={cn(cardSurface, "p-2")}>
        <h2 className="px-2 pb-1 pt-1.5 text-[13.5px] font-semibold">
          {nomeDia}, {escolhido.getDate()} de {MESES[escolhido.getMonth()]}
        </h2>
        {doDia.length === 0 ? (
          <p className="px-2 pb-2 text-[13px] text-[color:var(--bjork-text-muted)]">
            Nada marcado. Para marcar, abra a loja e use Anotar (ex.: "mandar mensagem amanhã às 10h").
          </p>
        ) : (
          <ul className="flex flex-col">
            {doDia.map((lead) => {
              const { quando, oque } = lead.compromisso!;
              return (
                <li key={lead.id}>
                  <button
                    type="button"
                    onClick={() => onAbrir(lead)}
                    className={cn(
                      "flex w-full cursor-pointer items-center gap-3 rounded-[10px] px-2 py-2 text-left transition-colors hover:bg-[var(--bjork-surface-hover)]",
                      focusRing,
                    )}
                  >
                    <span
                      className="w-[52px] shrink-0 font-mono text-[12px] font-medium tabular-nums"
                      style={{ color: atrasado(quando) ? "var(--blk-error)" : "var(--blk-accent-ink)" }}
                    >
                      {quando.includes("T") ? quando.slice(11, 16) : "dia"}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px] font-medium">{lead.nome}</span>
                      <span className="block truncate text-[12px] text-[color:var(--bjork-text-muted)]">{oque}</span>
                    </span>
                    <ChevronRight aria-hidden="true" className="size-4 shrink-0 text-[color:var(--bjork-text-soft)]" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

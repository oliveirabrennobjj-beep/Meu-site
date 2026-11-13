import { useId } from "react";
import { ChevronRight } from "lucide-react";
import { cardSurface, focusRing } from "@/components/ui/app-dashboard-shell-utils/app-block-kit";
import { cn } from "@/lib/utils";
import { atrasado, dataDoCompromisso, quandoCurto } from "./assistente";
import type { Lead } from "./leads";

/** O que ficou combinado com cada loja, do mais próximo ao mais longe (atrasados primeiro). */
export function ProximosPassos({ leads, onAbrir }: { leads: Lead[]; onAbrir: (lead: Lead) => void }) {
  const tituloId = useId();
  const marcados = leads
    .filter((lead) => lead.compromisso)
    .sort(
      (a, b) =>
        dataDoCompromisso(a.compromisso!.quando).getTime() - dataDoCompromisso(b.compromisso!.quando).getTime(),
    );
  if (marcados.length === 0) return null;
  return (
    <section aria-labelledby={tituloId} className={cn(cardSurface, "p-2")}>
      <h2 id={tituloId} className="px-2 pb-1 pt-1.5 text-[13.5px] font-semibold">
        Próximos passos
      </h2>
      <ul className="flex flex-col">
        {marcados.map((lead) => {
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
                  className="w-[86px] shrink-0 font-mono text-[12px] font-medium tabular-nums"
                  style={{ color: atrasado(quando) ? "var(--blk-error)" : "var(--blk-accent-ink)" }}
                >
                  {quandoCurto(quando)}
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
    </section>
  );
}

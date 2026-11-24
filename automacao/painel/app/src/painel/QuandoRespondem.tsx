import { cardSurface } from "@/components/ui/app-dashboard-shell-utils/app-block-kit";
import { cn } from "@/lib/utils";
import { quandoRespondem, type Balde } from "./agenda";
import type { Lead } from "./leads";

const pct = (b: Balde) => (b.envios ? Math.round((b.respostas / b.envios) * 100) : 0);

/** Em que dia da semana e horário a primeira mensagem mais recebe resposta (a ideia de "sazonalidade"). */
export function QuandoRespondem({ leads }: { leads: Lead[] }) {
  const q = quandoRespondem(leads);
  if (q.total < 10) return null;
  return (
    <section aria-labelledby="quando-respondem" className={cn(cardSurface, "flex flex-col gap-3 p-4")}>
      <div>
        <h2 id="quando-respondem" className="text-[14px] font-semibold">
          Quando as lojas respondem
        </h2>
        <p className="mt-1 text-[12.5px] text-[color:var(--bjork-text-muted)]">
          De {q.total} primeiras mensagens: quantas tiveram resposta, pelo dia e pela hora em que você mandou.
          {q.melhorDia && q.melhorHora && (
            <>
              {" "}
              Melhor até agora: <strong className="text-[color:var(--bjork-text)]">{q.melhorDia.nome}</strong>, das{" "}
              <strong className="text-[color:var(--bjork-text)]">{q.melhorHora.nome}</strong>.
            </>
          )}
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 @3xl:grid-cols-2">
        <Barras titulo="Dia da semana" baldes={q.porDia} melhor={q.melhorDia} />
        <Barras titulo="Horário" baldes={q.porHora} melhor={q.melhorHora} />
      </div>
      <p className="text-[11.5px] text-[color:var(--bjork-text-soft)]">
        Barra = % que respondeu. Com menos de 15 mensagens a barra fica clara: ainda é pouco para confiar.
      </p>
    </section>
  );
}

function Barras({ titulo, baldes, melhor }: { titulo: string; baldes: Balde[]; melhor: Balde | null }) {
  const maior = Math.max(1, ...baldes.map(pct));
  return (
    <div>
      <h3 className="mb-2 text-[12.5px] font-semibold">{titulo}</h3>
      <ul className="flex flex-col gap-1.5">
        {baldes.map((b) => {
          const p = pct(b);
          const fraco = b.envios < 15;
          return (
            <li key={b.nome} className="grid grid-cols-[64px_1fr_92px] items-center gap-2 text-[12.5px]">
              <span className="font-medium">{b.nome}</span>
              <span className="h-2.5 overflow-hidden rounded-full bg-[var(--bjork-surface-active)]">
                <span
                  className="block h-full rounded-full"
                  style={{
                    width: `${(p / maior) * 100}%`,
                    background: b === melhor ? "var(--blk-success)" : "var(--bjork-accent)",
                    opacity: fraco ? 0.35 : 1,
                  }}
                />
              </span>
              <span className="text-right font-mono tabular-nums text-[color:var(--bjork-text-muted)]">
                {b.envios ? `${p}% de ${b.envios}` : "—"}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

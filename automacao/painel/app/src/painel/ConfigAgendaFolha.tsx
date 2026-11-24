import { useEffect, useState } from "react";
import { X } from "lucide-react";
import {
  BlockButton,
  BlockDrawer,
  IconButton,
  fieldClass,
} from "@/components/ui/app-dashboard-shell-utils/app-block-kit";
import { cn } from "@/lib/utils";
import {
  CONFIG_PADRAO,
  MODELOS_NOMES,
  SEMANA_CURTA,
  TIPOS,
  TIPOS_ORDEM,
  type ConfigAgenda,
  type ModeloId,
} from "./agenda";
import { Pilula, rotulo } from "./agendaUi";

const AVISOS = [
  { min: 24 * 60, nome: "1 dia antes" },
  { min: 3 * 60, nome: "3 horas antes" },
  { min: 60, nome: "1 hora antes" },
  { min: 30, nome: "30 min antes" },
];

/** Dias e horários de atendimento, duração, intervalo, lembretes, cores e textos das mensagens. */
export function ConfigAgendaFolha({
  aberta,
  cfg,
  onFechar,
  onSalvar,
}: {
  aberta: boolean;
  cfg: ConfigAgenda;
  onFechar: () => void;
  onSalvar: (cfg: ConfigAgenda) => void;
}) {
  const [x, setX] = useState(cfg);
  useEffect(() => {
    if (aberta) setX(cfg);
  }, [aberta, cfg]);
  const numero = (campo: "inicio" | "fim" | "duracao" | "intervalo", v: string) => setX({ ...x, [campo]: Number(v) });
  const horas = Array.from({ length: 25 }, (_, h) => h);

  return (
    <BlockDrawer open={aberta} onClose={onFechar} label="Ajustes da agenda" side="bottom">
      <div aria-hidden="true" className="mx-auto mt-2 h-1 w-9 shrink-0 rounded-full bg-[var(--bjork-border-strong)]" />
      <header className="flex shrink-0 items-center gap-3 px-5 pb-2 pt-3">
        <h2 className="flex-1 text-[17px] font-semibold">Ajustes da agenda</h2>
        <IconButton label="Fechar" onClick={onFechar}>
          <X />
        </IconButton>
      </header>
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto overscroll-contain px-5 pb-6">
        <fieldset>
          <legend className={cn(rotulo, "mb-1.5")}>Dias de atendimento</legend>
          <div className="flex flex-wrap gap-1.5">
            {[1, 2, 3, 4, 5, 6, 0].map((d) => (
              <Pilula
                key={d}
                ativa={x.dias.includes(d)}
                onClick={() =>
                  setX({ ...x, dias: x.dias.includes(d) ? x.dias.filter((y) => y !== d) : [...x.dias, d].sort() })
                }
              >
                {SEMANA_CURTA[d]}
              </Pilula>
            ))}
          </div>
        </fieldset>

        <div className="grid grid-cols-2 gap-2.5">
          <label className="flex flex-col gap-1.5">
            <span className={rotulo}>Começa às</span>
            <select value={x.inicio} onChange={(e) => numero("inicio", e.target.value)} className={cn(fieldClass, "h-11")}>
              {horas.slice(0, 24).map((h) => (
                <option key={h} value={h}>
                  {String(h).padStart(2, "0")}:00
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1.5">
            <span className={rotulo}>Termina às</span>
            <select value={x.fim} onChange={(e) => numero("fim", e.target.value)} className={cn(fieldClass, "h-11")}>
              {horas.slice(1).map((h) => (
                <option key={h} value={h}>
                  {String(h).padStart(2, "0")}:00
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1.5">
            <span className={rotulo}>Duração padrão (min)</span>
            <input type="number" min={5} max={600} step={5} value={x.duracao} onChange={(e) => numero("duracao", e.target.value)} className={cn(fieldClass, "h-11")} />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className={rotulo}>Intervalo entre horários (min)</span>
            <input type="number" min={0} max={240} step={5} value={x.intervalo} onChange={(e) => numero("intervalo", e.target.value)} className={cn(fieldClass, "h-11")} />
          </label>
        </div>

        <fieldset>
          <legend className={cn(rotulo, "mb-1.5")}>Lembrar de avisar o cliente</legend>
          <div className="flex flex-wrap gap-1.5">
            {AVISOS.map((a) => (
              <Pilula
                key={a.min}
                ativa={x.lembretes.includes(a.min)}
                onClick={() =>
                  setX({
                    ...x,
                    lembretes: x.lembretes.includes(a.min) ? x.lembretes.filter((m) => m !== a.min) : [...x.lembretes, a.min],
                  })
                }
              >
                {a.nome}
              </Pilula>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className={cn(rotulo, "mb-1.5")}>Cor de cada tipo</legend>
          <div className="grid grid-cols-2 gap-2 @md:grid-cols-3">
            {TIPOS_ORDEM.map((t) => (
              <label key={t} className="flex items-center gap-2 text-[13px]">
                <input
                  type="color"
                  value={x.cores[t]}
                  onChange={(e) => setX({ ...x, cores: { ...x.cores, [t]: e.target.value } })}
                  className="h-8 w-10 cursor-pointer rounded border border-[color:var(--bjork-border)] bg-transparent"
                />
                {TIPOS[t].curto}
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="flex flex-col gap-3">
          <legend className={cn(rotulo, "mb-1.5")}>
            Mensagens (use [nome], [dia da semana], [data], [hora], [local], [serviço], [dias sugeridos], [nova data], [nova hora])
          </legend>
          {(Object.keys(MODELOS_NOMES) as ModeloId[]).map((m) => (
            <label key={m} className="flex flex-col gap-1.5">
              <span className="flex items-center justify-between text-[13px] font-medium">
                {MODELOS_NOMES[m]}
                {x.modelos[m] !== CONFIG_PADRAO.modelos[m] && (
                  <button
                    type="button"
                    className="cursor-pointer text-[12px] font-normal text-[color:var(--blk-accent-ink)] underline"
                    onClick={() => setX({ ...x, modelos: { ...x.modelos, [m]: CONFIG_PADRAO.modelos[m] } })}
                  >
                    voltar ao padrão
                  </button>
                )}
              </span>
              <textarea
                value={x.modelos[m]}
                onChange={(e) => setX({ ...x, modelos: { ...x.modelos, [m]: e.target.value } })}
                rows={3}
                className={cn(fieldClass, "py-2.5 text-[13px] leading-snug")}
              />
            </label>
          ))}
        </fieldset>

        <BlockButton
          size="lg"
          onClick={() => {
            onSalvar({ ...x, fim: Math.max(x.fim, x.inicio + 1), dias: x.dias.length ? x.dias : CONFIG_PADRAO.dias });
            onFechar();
          }}
        >
          Salvar ajustes
        </BlockButton>
      </div>
    </BlockDrawer>
  );
}

import type { ReactNode } from "react";
import { FileText, MapPin, Phone, RotateCcw, Video, Wrench, type LucideIcon } from "lucide-react";
import { focusRing } from "@/components/ui/app-dashboard-shell-utils/app-block-kit";
import { cn } from "@/lib/utils";
import { STATUS_COMPROMISSO, fimDe, horaDe, type Compromisso, type TipoCompromisso } from "./agenda";

export const TIPO_ICONE: Record<TipoCompromisso, LucideIcon> = {
  visita: MapPin,
  online: Video,
  ligacao: Phone,
  proposta: FileText,
  retorno: RotateCcw,
  instalacao: Wrench,
};

/** Etiqueta de status: verde confirmado/realizado, amarelo remarcado, vermelho cancelado/faltou. */
export function EtiquetaStatus({ c }: { c: Compromisso }) {
  if (c.legado) {
    return (
      <span className="inline-flex h-5 items-center rounded-full bg-[var(--bjork-surface-active)] px-2 text-[11px] font-medium text-[color:var(--bjork-text-muted)]">
        Combinado
      </span>
    );
  }
  const s = STATUS_COMPROMISSO[c.status];
  return (
    <span
      className="inline-flex h-5 shrink-0 items-center rounded-full px-2 text-[11px] font-semibold"
      style={{ color: s.cor, background: s.fundo }}
    >
      {s.nome}
    </span>
  );
}

/** "09:30–10:00" (ou "dia todo" para combinado sem hora). */
export const faixaHorario = (c: Compromisso) => (c.semHora ? "sem hora" : `${c.hora}–${horaDe(fimDe(c))}`);

/** Botão-pílula de escolha (tipo, serviço, duração…). */
export function Pilula({
  ativa,
  onClick,
  children,
  cor,
  className,
}: {
  ativa: boolean;
  onClick: () => void;
  children: ReactNode;
  cor?: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={ativa}
      onClick={onClick}
      className={cn(
        "inline-flex h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-full border px-3 text-[13px] transition-colors duration-150 [&>svg]:size-[15px]",
        ativa
          ? "border-[color:var(--bjork-accent-line)] bg-[var(--bjork-accent-soft)] font-medium text-[color:var(--blk-accent-ink)]"
          : "border-[color:var(--bjork-border)] bg-[var(--bjork-surface)] text-[color:var(--bjork-text-medium)] hover:bg-[var(--bjork-surface-hover)]",
        focusRing,
        className,
      )}
      style={ativa && cor ? { borderColor: cor, color: cor, background: `${cor}14` } : undefined}
    >
      {children}
    </button>
  );
}

export const rotulo = "text-[12px] font-medium text-[color:var(--bjork-text-muted)]";

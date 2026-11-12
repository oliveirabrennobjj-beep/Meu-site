import { useId, useMemo, useState, type ReactNode } from "react";
import {
  ArrowDown,
  ArrowDownWideNarrow,
  ArrowUp,
  ArrowUpDown,
  ArrowUpNarrowWide,
  ChevronLeft,
  ChevronRight,
  Star,
} from "lucide-react";
import {
  IconButton,
  InitialsAvatar,
  buttonClass,
  cardSurface,
  focusRing,
} from "@/components/ui/app-dashboard-shell-utils/app-block-kit";
import { cn } from "@/lib/utils";
import { STATUS, fmtInt, fmtNota, statusDe, tipoDe, type Lead, type Status } from "./leads";

type Chave = "nome" | "nota" | "avaliacoes";
type Ordem = { chave: Chave; dir: "asc" | "desc" };

const POR_PAGINA = 8;

export function StatusChip({ status, longo = false }: { status: Status; longo?: boolean }) {
  const s = STATUS[status];
  return (
    <span
      className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2 py-[3px] text-[11.5px] font-medium"
      style={{ background: s.soft, color: s.ink }}
    >
      <StatusGlyph status={status} />
      {longo ? s.label : s.curto}
    </span>
  );
}

function StatusGlyph({ status }: { status: Status }): ReactNode {
  const base = {
    width: 10,
    height: 10,
    viewBox: "0 0 10 10",
    "aria-hidden": true,
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  switch (status) {
    case "novo":
      return (
        <svg {...base}>
          <circle cx="5" cy="5" r="3.4" />
        </svg>
      );
    case "enviado":
      return (
        <svg {...base}>
          <circle cx="5" cy="5" r="3.6" />
          <path d="M5 3.2V5l1.2.8" />
        </svg>
      );
    case "respondeu":
      return (
        <svg {...base}>
          <path d="M1.6 2.4h6.8v4.4H4.6L2.8 8.4V6.8H1.6z" />
        </svg>
      );
    case "fechou":
      return (
        <svg {...base}>
          <path d="M2 5.2 4.1 7.2 8 2.8" />
        </svg>
      );
    case "depois":
      return (
        <svg {...base}>
          <path d="M2.4 2.6 5.2 5 2.4 7.4M5.6 2.6 8.4 5 5.6 7.4" />
        </svg>
      );
    default:
      return (
        <svg {...base}>
          <path d="M2.8 2.8l4.4 4.4M7.2 2.8 2.8 7.2" />
        </svg>
      );
  }
}

/** Comércios de uma cidade, já filtrados: ordena por avaliações, nota ou nome e divide em páginas. */
export function TabelaLeads({
  titulo,
  detalhe,
  leads,
  menosAvaliadosPrimeiro,
  onAbrir,
  anunciar,
}: {
  titulo: string;
  /** Como abordar os comércios dessa cidade, em poucas palavras. */
  detalhe: string;
  leads: Lead[];
  /** Ordem inicial: quem tem menos avaliações em cima (bom para vender placa). */
  menosAvaliadosPrimeiro: boolean;
  onAbrir: (lead: Lead) => void;
  anunciar: (texto: string) => void;
}) {
  const [ordem, setOrdem] = useState<Ordem>({
    chave: "avaliacoes",
    dir: menosAvaliadosPrimeiro ? "asc" : "desc",
  });
  const [pagina, setPagina] = useState(0);
  const tituloId = useId();

  const linhas = useMemo(() => {
    const dir = ordem.dir === "asc" ? 1 : -1;
    return [...leads].sort((a, b) => {
      if (ordem.chave === "nome") return a.nome.localeCompare(b.nome, "pt-BR") * dir;
      const av = a[ordem.chave];
      const bv = b[ordem.chave];
      // Quem não tem o número fica sempre no fim.
      if (av == null || bv == null) return av == null ? (bv == null ? 0 : 1) : -1;
      return (av - bv) * dir || a.nome.localeCompare(b.nome, "pt-BR");
    });
  }, [leads, ordem]);

  const paginas = Math.max(1, Math.ceil(linhas.length / POR_PAGINA));
  const atual = Math.min(pagina, paginas - 1);
  const visiveis = linhas.slice(atual * POR_PAGINA, atual * POR_PAGINA + POR_PAGINA);

  const ordenar = (chave: Chave, nome: string) => {
    const dir =
      ordem.chave === chave ? (ordem.dir === "desc" ? "asc" : "desc") : chave === "nome" ? "asc" : "desc";
    setOrdem({ chave, dir });
    setPagina(0);
    anunciar(`${titulo}: ordenado por ${nome}, ${dir === "asc" ? "do menor para o maior" : "do maior para o menor"}`);
  };

  const porAvaliacoes = ordem.chave === "avaliacoes";
  const menosPrimeiro = porAvaliacoes && ordem.dir === "asc";
  const IconeOrdem = menosPrimeiro ? ArrowUpNarrowWide : ArrowDownWideNarrow;
  const alternarAvaliacoes = () => {
    if (porAvaliacoes) return ordenar("avaliacoes", "avaliações");
    setOrdem({ chave: "avaliacoes", dir: "desc" });
    setPagina(0);
  };

  const cabecalho = (chave: Chave, rotulo: string, nome: string, className?: string) => {
    const ativo = ordem.chave === chave;
    const Icone = !ativo ? ArrowUpDown : ordem.dir === "asc" ? ArrowUp : ArrowDown;
    return (
      <th
        scope="col"
        aria-sort={ativo ? (ordem.dir === "asc" ? "ascending" : "descending") : "none"}
        className={cn("px-3 py-0 font-medium", className)}
      >
        <button
          type="button"
          onClick={() => ordenar(chave, nome)}
          aria-label={`Ordenar por ${nome}`}
          className={cn(
            "inline-flex h-9 cursor-pointer items-center gap-1 rounded-[6px] uppercase tracking-[0.06em] transition-colors hover:text-[color:var(--bjork-text)]",
            ativo && "text-[color:var(--bjork-text-medium)]",
            focusRing,
          )}
        >
          {rotulo}
          <Icone aria-hidden="true" className={cn("size-3", !ativo && "opacity-50")} />
        </button>
      </th>
    );
  };

  return (
    <section aria-labelledby={tituloId} className={cn(cardSurface, "min-w-0")}>
      <div className="flex items-center justify-between gap-3 px-4 pb-3 pt-3.5">
        <div className="min-w-0">
          <div className="flex items-baseline gap-2">
            <h2 id={tituloId} className="truncate text-[13.5px] font-semibold">
              {titulo}
            </h2>
            <span className="font-mono text-[11.5px] tabular-nums text-[color:var(--bjork-text-soft)]">
              {linhas.length}
            </span>
          </div>
          <p className="mt-0.5 truncate text-[12px] text-[color:var(--bjork-text-muted)]">{detalhe}</p>
        </div>
        <button
          type="button"
          onClick={alternarAvaliacoes}
          className={buttonClass("secondary", "sm", "shrink-0")}
        >
          <IconeOrdem aria-hidden="true" />
          {menosPrimeiro ? "Menos avaliados" : "Mais avaliados"}
        </button>
      </div>

      <table className="w-full table-fixed border-collapse text-[13px]">
        <caption className="sr-only">{titulo}, com ordenação por coluna</caption>
        <colgroup>
          <col />
          <col className="w-[112px]" />
          <col className="hidden w-[150px] @3xl/main:table-column" />
          <col className="w-[70px]" />
          <col className="w-[76px]" />
        </colgroup>
        <thead>
          <tr className="border-y border-[color:var(--bjork-border)] bg-[var(--bjork-panel)] text-left text-[11px] text-[color:var(--bjork-text-soft)]">
            {cabecalho("nome", "Comércio", "nome")}
            <th scope="col" className="px-3 font-medium uppercase tracking-[0.06em]">
              Situação
            </th>
            <th
              scope="col"
              className="hidden px-3 font-medium uppercase tracking-[0.06em] @3xl/main:table-cell"
            >
              Telefone
            </th>
            {cabecalho("nota", "Nota", "nota", "text-right [&>button]:flex-row-reverse")}
            {cabecalho("avaliacoes", "Aval.", "avaliações", "text-right [&>button]:flex-row-reverse")}
          </tr>
        </thead>
        <tbody>
          {visiveis.map((lead) => (
            <tr
              key={lead.id}
              className="relative border-b border-[color:var(--bjork-border)] transition-colors duration-100 last:border-b-0 hover:bg-[var(--bjork-surface-hover)]"
            >
              <td className="px-3 py-2.5">
                <div className="flex min-w-0 items-center gap-2.5">
                  <InitialsAvatar name={lead.nome} size={28} />
                  <div className="min-w-0">
                    <button
                      type="button"
                      onClick={() => onAbrir(lead)}
                      className="block max-w-full cursor-pointer truncate text-left font-medium leading-tight outline-none after:absolute after:inset-0 focus-visible:after:rounded-[8px] focus-visible:after:ring-2 focus-visible:after:ring-inset focus-visible:after:ring-[color:var(--bjork-accent)]"
                    >
                      {lead.nome}
                    </button>
                    <p className="truncate text-[11.5px] leading-tight text-[color:var(--bjork-text-muted)]">
                      {tipoDe(lead)}
                    </p>
                  </div>
                </div>
              </td>
              <td className="px-3 py-2.5">
                <StatusChip status={statusDe(lead)} />
              </td>
              <td className="hidden truncate px-3 py-2.5 tabular-nums text-[color:var(--bjork-text-medium)] @3xl/main:table-cell">
                {lead.telefone || "—"}
              </td>
              <td className="whitespace-nowrap px-3 py-2.5 text-right font-mono tabular-nums">
                {lead.nota != null && (
                  <Star
                    aria-hidden="true"
                    className="mr-1 inline size-3 -translate-y-px fill-[var(--bjork-accent)] text-[color:var(--bjork-accent)]"
                  />
                )}
                {fmtNota(lead.nota)}
              </td>
              <td className="whitespace-nowrap px-3 py-2.5 text-right font-mono tabular-nums text-[color:var(--bjork-text-medium)]">
                {fmtInt(lead.avaliacoes)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {paginas > 1 && (
        <div className="flex items-center justify-between gap-3 border-t border-[color:var(--bjork-border)] px-4 py-2 text-[12px] text-[color:var(--bjork-text-muted)]">
          <span className="tabular-nums">
            {atual * POR_PAGINA + 1}–{Math.min(linhas.length, (atual + 1) * POR_PAGINA)} de{" "}
            {linhas.length}
          </span>
          <div className="flex items-center gap-1">
            <IconButton
              label={`Página anterior de ${titulo}`}
              disabled={atual === 0}
              onClick={() => setPagina(atual - 1)}
            >
              <ChevronLeft />
            </IconButton>
            <span className="min-w-[4.5ch] text-center font-mono tabular-nums" aria-live="polite">
              <span className="sr-only">Página </span>
              {atual + 1}/{paginas}
            </span>
            <IconButton
              label={`Próxima página de ${titulo}`}
              disabled={atual >= paginas - 1}
              onClick={() => setPagina(atual + 1)}
            >
              <ChevronRight />
            </IconButton>
          </div>
        </div>
      )}
    </section>
  );
}

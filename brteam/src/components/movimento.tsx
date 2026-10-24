import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { reduzMovimento } from "@/lib/movimento";

/** Barra vermelha no topo que enche conforme a página é lida (lê --progresso). */
export function BarraProgresso() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-x-0 top-0 z-[45] h-[3px]">
      <div className="h-full origin-left bg-ouro" style={{ transform: "scaleX(var(--progresso, 0))" }} />
    </div>
  );
}

/** Botão de voltar ao topo, aparece depois de rolar um bom pedaço. */
export function VoltarAoTopo() {
  const [mostrar, setMostrar] = useState(false);
  useEffect(() => {
    const ver = () => setMostrar(scrollY > 1400);
    ver();
    addEventListener("scroll", ver, { passive: true });
    return () => removeEventListener("scroll", ver);
  }, []);
  return (
    <button
      type="button"
      onClick={() => {
        scrollTo({ top: 0, behavior: reduzMovimento() ? "auto" : "smooth" });
        document.querySelector<HTMLElement>('header a[href="#inicio"]')?.focus({ preventScroll: true });
      }}
      tabIndex={mostrar ? 0 : -1}
      aria-hidden={!mostrar}
      className={`foco-duplo fixed bottom-6 right-5 z-30 hidden sm:inline-flex size-12 items-center justify-center rounded-full border border-white/15 bg-black/85 text-white backdrop-blur transition-[opacity,transform,border-color] duration-300 hover:-translate-y-1 hover:border-white sm:bottom-6 ${
        mostrar ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"
      }`}
    >
      <ArrowUp className="size-5" aria-hidden="true" />
      <span className="sr-only">Voltar ao topo</span>
    </button>
  );
}

import { useEffect } from "react";

/*
  Movimento do site, num lugar só:
  - revelação ao rolar: blocos das seções sobem e aparecem quando entram na tela, em sequência;
  - parallax leve nas imagens com [data-parallax];
  - onda no toque dos botões (.botao);
  - progresso da rolagem em --progresso (barra vermelha do topo).
  Com "reduzir movimento" ativado no aparelho, nada fica escondido nem se mexe.
*/

const ALVOS = "main section:not(#inicio) :is(h2, p, li, figure, article, blockquote, details, table, form, [data-revelar])";
const IGNORAR = "form, [role=status], [data-sem-revelar]";

export const reduzMovimento = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function useMovimento() {
  useEffect(() => {
    const raiz = document.documentElement;

    // progresso da rolagem (vale mesmo com movimento reduzido: é informação, não enfeite)
    let quadro = 0;
    const pendentes = new Set<HTMLElement>();
    const atualizar = () => {
      quadro = 0;
      // garantia: rolando muito rápido, o que já passou pela tela aparece mesmo assim
      pendentes.forEach((el) => {
        if (el.getBoundingClientRect().top < innerHeight) {
          el.classList.add("visivel");
          pendentes.delete(el);
        }
      });
      const max = raiz.scrollHeight - innerHeight;
      raiz.style.setProperty("--progresso", String(max > 0 ? scrollY / max : 0));
      if (!reduzMovimento()) {
        document.querySelectorAll<HTMLElement>("[data-parallax]").forEach((el) => {
          const fator = Number(el.dataset.parallax) || 0.2;
          const caixa = el.parentElement!.getBoundingClientRect();
          if (caixa.bottom < 0 || caixa.top > innerHeight) return;
          el.style.transform = `translate3d(0, ${(-caixa.top * fator).toFixed(1)}px, 0) scale(1.06)`;
        });
      }
    };
    const aoRolar = () => {
      if (!quadro) quadro = requestAnimationFrame(atualizar);
    };
    atualizar();
    addEventListener("scroll", aoRolar, { passive: true });
    addEventListener("resize", aoRolar);

    // onda no toque
    const onda = (e: PointerEvent) => {
      const botao = (e.target as HTMLElement).closest<HTMLElement>(".botao");
      if (!botao || reduzMovimento()) return;
      const r = botao.getBoundingClientRect();
      const d = Math.max(r.width, r.height) * 2;
      const s = document.createElement("span");
      s.className = "onda";
      s.style.cssText = `width:${d}px;height:${d}px;left:${e.clientX - r.left - d / 2}px;top:${e.clientY - r.top - d / 2}px`;
      botao.appendChild(s);
      s.addEventListener("animationend", () => s.remove());
    };
    document.addEventListener("pointerdown", onda);

    // revelação ao rolar
    let obs: IntersectionObserver | undefined;
    if (!reduzMovimento() && "IntersectionObserver" in window) {
      raiz.classList.add("com-movimento");
      obs = new IntersectionObserver(
        (entradas) =>
          entradas.forEach((en) => {
            if (en.isIntersecting) {
              en.target.classList.add("visivel");
              pendentes.delete(en.target as HTMLElement);
              obs!.unobserve(en.target);
            }
          }),
        { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
      );
      document.querySelectorAll<HTMLElement>(ALVOS).forEach((el) => {
        if (el.closest(IGNORAR) && !el.matches("form")) return;
        if (el.parentElement?.closest("[data-rv]")) return; // o bloco de fora já anima
        el.dataset.rv = "";
        const irmaos = Array.from(el.parentElement?.children ?? []);
        const i = Math.min(irmaos.indexOf(el), 6);
        el.style.setProperty("--atraso", `${i * 70}ms`);
        pendentes.add(el);
        obs!.observe(el);
      });
    }

    return () => {
      removeEventListener("scroll", aoRolar);
      removeEventListener("resize", aoRolar);
      document.removeEventListener("pointerdown", onda);
      obs?.disconnect();
      cancelAnimationFrame(quadro);
    };
  }, []);
}

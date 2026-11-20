import { useEffect, useState, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { PainelVendas } from "./painel/PainelVendas";
import "./index.css";

/** Largura em que o painel é desenhado no celular: a mesma da referência que o Brenno aprovou. */
const LARGURA_BASE = 520;

const medir = () => ({ w: document.body.clientWidth, h: document.body.clientHeight });

/**
 * Em telas mais estreitas que a base, desenha o painel na largura base e encolhe tudo junto,
 * para o celular mostrar a mesma composição da referência em vez de uma versão reduzida.
 */
function Palco({ children }: { children: ReactNode }) {
  const [tela, setTela] = useState(medir);
  useEffect(() => {
    const atualizar = () => setTela(medir());
    const observador = new ResizeObserver(atualizar);
    observador.observe(document.body);
    window.addEventListener("resize", atualizar);
    return () => {
      observador.disconnect();
      window.removeEventListener("resize", atualizar);
    };
  }, []);
  const escala = tela.w > 0 && tela.w < LARGURA_BASE ? tela.w / LARGURA_BASE : 1;
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: tela.w / escala,
        height: tela.h / escala,
        transform: escala === 1 ? undefined : `scale(${escala})`,
        transformOrigin: "0 0",
      }}
    >
      {children}
    </div>
  );
}

createRoot(document.getElementById("root")!).render(
  <Palco>
    <PainelVendas />
  </Palco>,
);

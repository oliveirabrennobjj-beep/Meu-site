import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

/** Desenho de uma faixa de Jiu-Jitsu: cor, ponteira e graus (listras brancas). */
export function Faixa({
  cor = "#141414",
  ponteira = "#d6202b",
  graus = 0,
  altura = 22,
  clara = false,
  amarrar = false,
  bandeira = false,
  listra,
  className,
}: {
  cor?: string;
  ponteira?: string;
  graus?: number;
  altura?: number;
  clara?: boolean;
  amarrar?: boolean;
  /** bandeirinha do Brasil bordada no corpo da faixa (a faixa preta do professor tem uma) */
  bandeira?: boolean;
  /** listra no meio da faixa (faixas infantis "com branco" e "com preto") */
  listra?: string;
  className?: string;
}) {
  const estilo = { "--cor": cor, "--ponta": ponteira, "--altura": `${altura}px` } as CSSProperties;
  // faixa preta: ponteira vermelha fechada por duas listras brancas (regra da IBJJF)
  const preta = ponteira.toLowerCase() === "#d6202b";
  return (
    <div aria-hidden="true" className={cn("faixa", preta && "faixa-preta", clara && "faixa-clara", amarrar && "faixa-amarra", className)} style={estilo}>
      {listra && <div className="faixa__listra" style={{ background: listra }} />}
      <div className="faixa__ponteira">
        {/* dentro da ponteira para ficar sempre a uma distância certa dela, qualquer que seja o tamanho da faixa */}
        {bandeira && (
          <svg className="faixa__bandeira" viewBox="0 0 20 14">
            <rect width="20" height="14" fill="#009c3b" />
            <path d="M10 1.6 18.2 7 10 12.4 1.8 7z" fill="#ffdf00" />
            <circle cx="10" cy="7" r="3.4" fill="#002776" />
            <path d="M6.75 6.1c2.2-.5 4.6-.2 6.5.9" stroke="#fff" strokeWidth="0.7" fill="none" />
          </svg>
        )}
        {Array.from({ length: graus }).map((_, i) => (
          <span key={i} className="faixa__grau" />
        ))}
      </div>
    </div>
  );
}

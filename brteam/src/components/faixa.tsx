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
  listra,
  className,
}: {
  cor?: string;
  ponteira?: string;
  graus?: number;
  altura?: number;
  clara?: boolean;
  amarrar?: boolean;
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
        {Array.from({ length: graus }).map((_, i) => (
          <span key={i} className="faixa__grau" />
        ))}
      </div>
    </div>
  );
}

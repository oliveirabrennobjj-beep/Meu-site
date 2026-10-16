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
  className,
}: {
  cor?: string;
  ponteira?: string;
  graus?: number;
  altura?: number;
  clara?: boolean;
  amarrar?: boolean;
  className?: string;
}) {
  const estilo = { "--cor": cor, "--ponta": ponteira, "--altura": `${altura}px` } as CSSProperties;
  return (
    <div aria-hidden="true" className={cn("faixa", clara && "faixa-clara", amarrar && "faixa-amarra", className)} style={estilo}>
      <div className="faixa__ponteira">
        {Array.from({ length: graus }).map((_, i) => (
          <span key={i} className="faixa__grau" />
        ))}
      </div>
    </div>
  );
}

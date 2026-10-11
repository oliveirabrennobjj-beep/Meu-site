import { Smartphone, Star } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = { variant?: "classic" | "blue"; className?: string; animated?: boolean };

/** Ilustração da placa NFC de avaliação (desenhada em CSS para ficar nítida em qualquer tela). */
export function NfcPlaque({ variant = "classic", className, animated = true }: Props) {
  const blue = variant === "blue";
  return (
    <div
      role="img"
      aria-label={`Placa NFC ${blue ? "azul" : "preta e branca"} com o texto: nos avalie no Google, aproxime seu celular`}
      className={cn(
        "@container relative aspect-[3/4] w-full overflow-hidden rounded-[22px] bg-white shadow-[0_40px_80px_-30px_rgba(0,113,227,0.55),0_0_0_1px_rgba(255,255,255,0.15)]",
        className,
      )}
    >
      {/* faixa superior */}
      <div
        className={cn(
          "flex h-[38%] flex-col items-center justify-center gap-[6%] px-[8%] text-center",
          blue ? "bg-gradient-to-b from-[#1677ff] to-[#0050c8]" : "bg-[#111]",
        )}
      >
        <div className="flex gap-[3%] text-[#fbbc05]" aria-hidden="true">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className="size-[8cqw] fill-current" strokeWidth={0} />
          ))}
        </div>
        <p className="text-[7cqw] font-bold uppercase leading-tight tracking-wide text-white">
          Nos avalie
          <br />
          no Google
        </p>
      </div>
      {/* corpo */}
      <div className="flex h-[62%] flex-col items-center justify-center gap-[7%] text-[#111]">
        <span
          aria-hidden="true"
          className="text-[19cqw] leading-none font-bold tracking-tight"
          style={{
            background: "conic-gradient(from -45deg, #ea4335 0 25%, #4285f4 0 50%, #34a853 0 75%, #fbbc05 0)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
          }}
        >
          G
        </span>
        <p className="text-[5.6cqw] font-semibold uppercase tracking-wider">Aproxime seu celular</p>
        <div className="relative grid size-[34%] place-items-center rounded-full border-[2.5px] border-[#111]">
          {animated && (
            <>
              <span className="nfc-wave absolute inset-0 rounded-full border-2 border-[#1677ff]" />
              <span className="nfc-wave absolute inset-0 rounded-full border-2 border-[#1677ff] [animation-delay:1.2s]" />
            </>
          )}
          <Smartphone aria-hidden="true" className="size-[45%]" strokeWidth={2} />
        </div>
      </div>
    </div>
  );
}

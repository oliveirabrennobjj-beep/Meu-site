import { Check, ChevronRight } from "lucide-react";
import { NfcPlaque } from "@/components/nfc-plaque";
import { Reveal } from "@/components/reveal";
import { Button } from "@/components/ui/button";
import { linkWhatsApp, mensagens } from "@/data/site";

const passos = [
  { n: "1", titulo: "Aproxime", texto: "O cliente encosta o celular na placa, no balcão ou na mesa." },
  { n: "2", titulo: "Avalie", texto: "A página de avaliação do seu negócio no Google abre na hora." },
  { n: "3", titulo: "Pronto", texto: "Em poucos segundos a avaliação está publicada." },
];

const vantagens = [
  "Sem baixar aplicativo",
  "Abre direto na página de avaliação do seu negócio",
  "Mais avaliações ajudam você a aparecer no Google Maps",
  "Duas versões: preta e branca ou azul",
];

export function Nfc() {
  return (
    <section id="nfc" aria-labelledby="nfc-titulo" className="relative overflow-hidden py-24 md:py-32">
      <div className="container-page">
        <Reveal className="text-center">
          <p className="eyebrow">Placas NFC para avaliações no Google</p>
          <h2 id="nfc-titulo" className="mx-auto mt-3 max-w-3xl text-[40px] font-semibold leading-[1.04] md:text-[72px]">
            Aproxime.
            <br />
            Avalie. <span className="text-gradient">Pronto.</span>
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-[17px] leading-relaxed text-muted md:text-[19px]">
            Quem gostou do atendimento quer ajudar, mas não acha onde avaliar. A placa resolve isso com um toque.
          </p>
        </Reveal>

        <Reveal delay={0.1} className="relative mx-auto mt-14 flex max-w-[620px] items-end justify-center gap-5 md:mt-20 md:gap-10">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-1/2 h-[70%] -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(0,113,227,0.35),transparent)] blur-xl"
          />
          <NfcPlaque variant="classic" animated={false} className="relative w-[44%] max-w-[240px] -rotate-[4deg]" />
          <NfcPlaque variant="blue" className="relative w-[44%] max-w-[240px] translate-y-[-6%] rotate-[4deg]" />
        </Reveal>

        <ol className="mx-auto mt-20 grid max-w-4xl gap-4 md:grid-cols-3">
          {passos.map((p, i) => (
            <Reveal as="li" key={p.n} delay={i * 0.08} className="tile h-full p-7">
                <span className="grid size-9 place-items-center rounded-full bg-primary text-[15px] font-semibold text-white">{p.n}</span>
                <h3 className="mt-5 text-[22px] font-semibold">{p.titulo}</h3>
                <p className="mt-1.5 text-[15px] leading-relaxed text-muted">{p.texto}</p>
            </Reveal>
          ))}
        </ol>

        <Reveal className="mx-auto mt-14 flex max-w-4xl flex-col gap-8 md:flex-row md:items-center md:justify-between">
          <ul className="grid gap-3">
            {vantagens.map((v) => (
              <li key={v} className="flex items-start gap-3 text-[16px] text-white/90">
                <Check aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-link" />
                {v}
              </li>
            ))}
          </ul>
          <div className="flex flex-col items-start gap-2 md:items-end">
            <Button asChild size="lg">
              <a href={linkWhatsApp(mensagens.nfc)} target="_blank" rel="noopener noreferrer">
                Quero minha placa
              </a>
            </Button>
            <a href="#duvidas" className="inline-flex items-center gap-1 rounded-md py-2 text-[15px] text-link hover:underline">
              Funciona no meu celular? <ChevronRight aria-hidden="true" className="size-4" />
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

import { Check, ChevronRight } from "lucide-react";
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
    <section id="nfc" aria-labelledby="nfc-titulo" className="theme-dark relative overflow-hidden py-24 md:py-32">
      <div className="container-page">
        <Reveal className="text-center">
          <p className="eyebrow">Placas NFC para avaliações no Google</p>
          <h2 id="nfc-titulo" className="display mx-auto mt-4 max-w-3xl text-[48px] md:text-[84px]">
            Aproxime. Avalie. <span className="italic text-accent">Pronto.</span>
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-[17px] leading-relaxed text-soft md:text-[19px]">
            Quem gostou do atendimento quer ajudar, mas não acha onde avaliar. A placa resolve isso com um toque.
          </p>
        </Reveal>

        {/* foto principal: as duas versões da placa */}
        <Reveal delay={0.08} className="mx-auto mt-14 max-w-4xl md:mt-16">
          <figure className="overflow-hidden rounded-[var(--radius-tile)] bg-[#e9eaee]">
            <img
              src="nfc/placas-nfc-preta-e-azul.webp"
              alt="As duas versões da placa NFC, preta e azul, com o texto: nós gostaríamos da sua opinião no Google, aproxime seu celular"
              width={900}
              height={897}
              loading="lazy"
              className="aspect-[4/3] w-full object-cover object-center md:aspect-[16/10]"
            />
          </figure>
          <p className="mt-3 text-center text-[13px] text-soft">Versão preta e branca e versão azul.</p>
        </Reveal>

        {/* passos em cartões brancos */}
        <ol className="mx-auto mt-14 grid max-w-4xl gap-4 md:grid-cols-3">
          {passos.map((p, i) => (
            <Reveal as="li" key={p.n} delay={i * 0.08} className="rounded-[24px] bg-card p-7 text-card-fg">
              <span className="display text-[44px] leading-none text-primary">{p.n}</span>
              <h3 className="display mt-4 text-[28px]">{p.titulo}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-[#55555e]">{p.texto}</p>
            </Reveal>
          ))}
        </ol>

        {/* fotos no balcão + vantagens */}
        <div className="mx-auto mt-14 grid max-w-4xl gap-4 md:grid-cols-2">
          <Reveal>
            <img
              src="nfc/placa-nfc-preta-no-balcao.webp"
              alt="Placa NFC preta colada no balcão de uma cafeteria e um cliente aproximando o celular"
              width={900}
              height={897}
              loading="lazy"
              className="aspect-square w-full rounded-[24px] object-cover"
            />
          </Reveal>
          <Reveal delay={0.08} className="flex flex-col justify-between gap-8 rounded-[24px] border border-line p-7 md:p-9">
            <div>
              <h3 className="display text-[30px] leading-tight">Feita para ficar no balcão, na mesa ou no caixa.</h3>
              <ul className="mt-6 grid gap-3">
                {vantagens.map((v) => (
                  <li key={v} className="flex items-start gap-3 text-[16px]">
                    <Check aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-accent" />
                    {v}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col items-start gap-2">
              <Button asChild variant="contrast" size="lg">
                <a href={linkWhatsApp(mensagens.nfc)} target="_blank" rel="noopener noreferrer">
                  Quero minha placa
                </a>
              </Button>
              <a href="#duvidas" className="inline-flex items-center gap-1 rounded-md py-2 text-[15px] text-accent hover:underline">
                Funciona no meu celular? <ChevronRight aria-hidden="true" className="size-4" />
              </a>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

import { MessageCircle, PenTool, Rocket, SlidersHorizontal } from "lucide-react";
import { Reveal } from "@/components/reveal";

const etapas = [
  { icon: MessageCircle, titulo: "Conversa", texto: "Você conta sobre o seu negócio pelo WhatsApp e recebe o orçamento." },
  { icon: PenTool, titulo: "Criação", texto: "Montamos o visual com as suas cores, fotos, produtos e preços." },
  { icon: SlidersHorizontal, titulo: "Ajustes", texto: "Você vê no seu celular e pede as mudanças que quiser." },
  { icon: Rocket, titulo: "No ar", texto: "Site publicado e link pronto para a bio do Instagram e o Google." },
];

export function Process() {
  return (
    <section id="como-funciona" aria-labelledby="processo-titulo" className="border-y border-white/[0.08] bg-surface py-24 md:py-32">
      <div className="container-page">
        <Reveal className="max-w-2xl">
          <p className="eyebrow">Como funciona</p>
          <h2 id="processo-titulo" className="mt-3 text-[34px] font-semibold leading-[1.08] md:text-[52px]">
            Do primeiro "oi" ao site no ar.
          </h2>
        </Reveal>
        <ol className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {etapas.map(({ icon: Icon, titulo, texto }, i) => (
            <Reveal as="li" key={titulo} delay={i * 0.06} className="relative border-t border-hairline pt-6">
              <span className="text-[13px] font-semibold tabular-nums text-muted">0{i + 1}</span>
              <Icon aria-hidden="true" className="mt-4 size-7 text-link" />
              <h3 className="mt-4 text-[21px] font-semibold">{titulo}</h3>
              <p className="mt-1.5 text-[15px] leading-relaxed text-muted">{texto}</p>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}

import { Reveal } from "@/components/reveal";

const etapas = [
  { titulo: "Conversa", texto: "Você conta sobre o seu negócio pelo WhatsApp e recebe o orçamento." },
  { titulo: "Criação", texto: "Montamos o visual com as suas cores, fotos, produtos e preços." },
  { titulo: "Ajustes", texto: "Você vê no seu celular e pede as mudanças que quiser." },
  { titulo: "No ar", texto: "Site publicado e link pronto para a bio do Instagram e o Google." },
];

export function Process() {
  return (
    <section id="como-funciona" aria-labelledby="processo-titulo" className="theme-light py-24 md:py-32">
      <div className="container-page">
        <Reveal className="mx-auto max-w-3xl text-center">
          <p className="eyebrow">Como funciona</p>
          <h2 id="processo-titulo" className="display mt-4 text-[42px] md:text-[64px]">
            Do primeiro “oi” ao site <span className="italic text-primary">no ar.</span>
          </h2>
        </Reveal>

        <ol className="mt-16 grid gap-px overflow-hidden rounded-[var(--radius-tile)] bg-line ring-1 ring-line sm:grid-cols-2 lg:grid-cols-4">
          {etapas.map(({ titulo, texto }, i) => (
            <Reveal as="li" key={titulo} delay={i * 0.06} className="flex flex-col bg-bg p-7 md:p-8">
              <span className="display text-[64px] leading-none text-primary md:text-[72px]">{i + 1}</span>
              <h3 className="display mt-6 text-[28px]">{titulo}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-soft">{texto}</p>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}

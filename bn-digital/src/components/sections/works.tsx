import { Reveal } from "@/components/reveal";
import { Carousel_003 } from "@/components/ui/skiper49";
import { trabalhos } from "@/data/site";

export function Works() {
  return (
    <section id="trabalhos" aria-labelledby="trabalhos-titulo" className="relative py-24 md:py-32">
      <Reveal className="container-page text-center">
        <p className="eyebrow">Últimos trabalhos</p>
        <h2 id="trabalhos-titulo" className="mt-3 text-[36px] font-semibold leading-[1.08] md:text-[56px]">
          Cada negócio com
          <br />a sua identidade.
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-[17px] leading-relaxed text-muted md:text-[19px]">
          Lanchonete, barbearia, ótica, cafeteria. Arraste para o lado e veja alguns sites que já saíram daqui.
        </p>
      </Reveal>

      <div className="portfolio mt-12 flex justify-center overflow-hidden">
        <Carousel_003 images={trabalhos} showPagination showNavigation loop className="max-w-6xl px-0" />
      </div>
    </section>
  );
}

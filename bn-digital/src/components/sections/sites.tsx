import {
  Clock,
  Dumbbell,
  Glasses,
  Hammer,
  IceCreamBowl,
  MapPin,
  Pizza,
  Scissors,
  ShoppingBag,
  Smartphone,
  Coffee,
  Sandwich,
  Swords,
  type LucideIcon,
} from "lucide-react";
import { WhatsAppIcon } from "@/components/brand-icons";
import { Reveal } from "@/components/reveal";
import { Button } from "@/components/ui/button";
import { linkWhatsApp, mensagens } from "@/data/site";

const recursos: { icon: LucideIcon | typeof WhatsAppIcon; titulo: string; texto: string }[] = [
  { icon: ShoppingBag, titulo: "Pedido com carrinho", texto: "O cliente escolhe os itens no cardápio e manda o pedido pronto." },
  { icon: WhatsAppIcon, titulo: "Direto no WhatsApp", texto: "Pedidos e agendamentos chegam no WhatsApp do seu negócio." },
  { icon: Clock, titulo: "Aberto ou fechado", texto: "O site mostra o horário de funcionamento e avisa se está aberto agora." },
  { icon: Smartphone, titulo: "Feito para o celular", texto: "Pensado primeiro para a tela onde seus clientes realmente estão." },
  { icon: MapPin, titulo: "Fácil de achar", texto: "Endereço, rota no mapa e link para o Instagram em um só lugar." },
];

const segmentos: { icon: LucideIcon; nome: string }[] = [
  { icon: Pizza, nome: "Pizzarias" },
  { icon: Sandwich, nome: "Hamburguerias" },
  { icon: IceCreamBowl, nome: "Açaíterias" },
  { icon: Coffee, nome: "Cafeterias" },
  { icon: Scissors, nome: "Barbearias" },
  { icon: Glasses, nome: "Óticas" },
  { icon: Hammer, nome: "Materiais de construção" },
  { icon: Dumbbell, nome: "Academias" },
  { icon: Swords, nome: "Academias de jiu-jitsu" },
];

export function Sites() {
  return (
    <section id="sites" aria-labelledby="sites-titulo" className="py-8 md:py-12">
      <div className="container-page">
        <Reveal className="tile relative overflow-hidden px-6 py-14 md:px-14 md:py-20">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-40 -top-40 size-[520px] rounded-full bg-[radial-gradient(closest-side,rgba(41,151,255,0.22),transparent)]"
          />
          <p className="eyebrow">Sites personalizados e cardápios digitais</p>
          <h2 id="sites-titulo" className="mt-3 max-w-2xl text-[34px] font-semibold leading-[1.08] md:text-[52px]">
            Um site que vende enquanto você trabalha.
          </h2>
          <p className="mt-5 max-w-xl text-[17px] leading-relaxed text-muted md:text-[19px]">
            Nada de modelo pronto. Cada projeto nasce das cores, das fotos e do jeito de falar do seu negócio.
          </p>

          <ul className="mt-12 grid gap-px overflow-hidden rounded-[20px] border border-hairline bg-hairline sm:grid-cols-2 lg:grid-cols-3">
            {recursos.map(({ icon: Icon, titulo, texto }) => (
              <li key={titulo} className="bg-surface p-6 md:p-7">
                <Icon aria-hidden="true" className="size-7 text-link" />
                <h3 className="mt-4 text-[19px] font-semibold">{titulo}</h3>
                <p className="mt-1.5 text-[15px] leading-relaxed text-muted">{texto}</p>
              </li>
            ))}
            <li className="flex flex-col justify-between gap-6 bg-surface p-6 md:p-7">
              <p className="text-[19px] font-semibold leading-snug">Quer ver como ficaria o seu?</p>
              <Button asChild className="self-start">
                <a href={linkWhatsApp(mensagens.site)} target="_blank" rel="noopener noreferrer">
                  Pedir orçamento do site
                </a>
              </Button>
            </li>
          </ul>

          <div className="mt-14">
            <h3 className="text-[15px] font-semibold text-white/90">Para todo tipo de negócio</h3>
            <ul className="mt-4 flex flex-wrap gap-2.5">
              {segmentos.map(({ icon: Icon, nome }) => (
                <li
                  key={nome}
                  className="inline-flex items-center gap-2 rounded-full border border-hairline bg-surface-2 px-4 py-2 text-[14px] text-white/85"
                >
                  <Icon aria-hidden="true" className="size-4 text-link" />
                  {nome}
                </li>
              ))}
              <li className="inline-flex items-center rounded-full px-2 py-2 text-[14px] text-muted">e muitos outros.</li>
            </ul>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

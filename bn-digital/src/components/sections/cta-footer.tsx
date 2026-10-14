import { InstagramIcon, Logo, WhatsAppIcon } from "@/components/brand-icons";
import { Reveal } from "@/components/reveal";
import { Button } from "@/components/ui/button";
import { empresa, linkInstagram, linkWhatsApp, mensagens } from "@/data/site";

export function FinalCta() {
  return (
    <section aria-labelledby="cta-titulo" className="theme-light pb-24 md:pb-32">
      <div className="container-page">
        <Reveal className="theme-dark relative overflow-hidden rounded-[var(--radius-tile)] !bg-[linear-gradient(180deg,#0b3aa8_0%,#06215f_55%,#020a1f_100%)] px-6 py-20 text-center md:py-28">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-0 h-[360px] w-[720px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(77,163,255,0.6),transparent)]"
          />
          <img src="logo-bn-digital.webp" alt="" width={72} height={72} className="relative mx-auto size-[72px] rounded-full ring-4 ring-white/15" />
          <h2 id="cta-titulo" className="display relative mx-auto mt-8 max-w-2xl text-[42px] text-white md:text-[68px]">
            Vamos colocar o seu negócio no <span className="italic">topo?</span>
          </h2>
          <p className="relative mx-auto mt-5 max-w-lg text-[17px] leading-relaxed text-white/80 md:text-[19px]">
            Mande uma mensagem e conte o que você precisa. Orçamento e preços pelo próprio WhatsApp.
          </p>
          <div className="relative mt-9 flex flex-col items-center gap-3">
            <Button asChild variant="contrast" size="lg" className="w-full sm:w-auto">
              <a href={linkWhatsApp(mensagens.geral)} target="_blank" rel="noopener noreferrer">
                <WhatsAppIcon className="text-whatsapp" />
                Chamar no WhatsApp
              </a>
            </Button>
            <span className="text-[15px] tabular-nums text-white/70">{empresa.whatsappExibicao}</span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="theme-dark">
      <div className="container-page flex flex-col gap-8 py-12 md:flex-row md:items-start md:justify-between">
        <div>
          <Logo size={48} />
          <p className="mt-4 max-w-xs text-[14px] leading-relaxed text-soft">
            Soluções digitais para empresas. Sites, cardápios digitais e placas NFC para avaliações no Google.
          </p>
          <p className="mt-2 text-[14px] text-soft">{empresa.cidade}</p>
        </div>
        <ul className="flex flex-col gap-1 text-[15px]">
          <li>
            <a href={linkWhatsApp(mensagens.geral)} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2.5 rounded-md text-fg/85 hover:text-fg">
              <WhatsAppIcon className="size-5 text-whatsapp" /> WhatsApp {empresa.whatsappExibicao}
            </a>
          </li>
          <li>
            <a href={linkInstagram} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2.5 rounded-md text-fg/85 hover:text-fg">
              <InstagramIcon className="size-5" /> @{empresa.instagram}
            </a>
          </li>
        </ul>
      </div>
      <div className="container-page flex flex-col gap-2 border-t border-line py-6 text-[12px] text-soft sm:flex-row sm:justify-between">
        <p>© {new Date().getFullYear()} BN Digital. Todos os direitos reservados.</p>
        <p>
          Carrossel por{" "}
          <a href="https://skiper-ui.com" target="_blank" rel="noopener noreferrer" className="underline-offset-2 hover:underline">
            Skiper UI
          </a>
        </p>
      </div>
    </footer>
  );
}

/** Botão flutuante do WhatsApp (aparece depois que o visitante rola a página). */
export function FloatingWhatsApp({ visible }: { visible: boolean }) {
  return (
    <a
      href={linkWhatsApp(mensagens.geral)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Conversar no WhatsApp"
      className={`fixed bottom-[calc(20px+env(safe-area-inset-bottom,0px))] right-5 z-30 grid size-14 place-items-center rounded-full bg-whatsapp text-white shadow-[0_12px_30px_-8px_rgba(37,211,102,0.6)] transition-[opacity,transform] duration-300 ease-[var(--ease-apple)] hover:scale-105 ${
        visible ? "opacity-100" : "pointer-events-none translate-y-4 opacity-0"
      }`}
      tabIndex={visible ? 0 : -1}
    >
      <WhatsAppIcon className="size-7" />
    </a>
  );
}

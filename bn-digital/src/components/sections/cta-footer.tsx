import { InstagramIcon, Logo, WhatsAppIcon } from "@/components/brand-icons";
import { Reveal } from "@/components/reveal";
import { Button } from "@/components/ui/button";
import { empresa, linkInstagram, linkWhatsApp, mensagens } from "@/data/site";

export function FinalCta() {
  return (
    <section aria-labelledby="cta-titulo" className="pb-24 md:pb-32">
      <div className="container-page">
        <Reveal className="relative overflow-hidden rounded-[var(--radius-tile)] bg-gradient-to-b from-[#0a2a5c] via-[#06142e] to-[#030712] px-6 py-20 text-center ring-1 ring-white/10 md:py-28">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-0 h-[360px] w-[720px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(41,151,255,0.55),transparent)]"
          />
          <h2 id="cta-titulo" className="relative mx-auto max-w-2xl text-[36px] font-semibold leading-[1.06] md:text-[60px]">
            Vamos colocar o seu negócio no topo?
          </h2>
          <p className="relative mx-auto mt-5 max-w-lg text-[17px] leading-relaxed text-white/75 md:text-[19px]">
            Mande uma mensagem e conte o que você precisa. A resposta vem pelo próprio WhatsApp.
          </p>
          <div className="relative mt-9 flex flex-col items-center gap-3">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <a href={linkWhatsApp(mensagens.geral)} target="_blank" rel="noopener noreferrer">
                <WhatsAppIcon />
                Chamar no WhatsApp
              </a>
            </Button>
            <span className="text-[15px] tabular-nums text-white/60">{empresa.whatsappExibicao}</span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-white/[0.08] bg-surface">
      <div className="container-page flex flex-col gap-8 py-12 md:flex-row md:items-start md:justify-between">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-[14px] leading-relaxed text-muted">
            Soluções digitais para empresas. Sites, cardápios digitais e placas NFC para avaliações no Google.
          </p>
          <p className="mt-2 text-[14px] text-muted">{empresa.cidade}</p>
        </div>
        <ul className="flex flex-col gap-1 text-[15px]">
          <li>
            <a href={linkWhatsApp(mensagens.geral)} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2.5 rounded-md text-white/85 hover:text-white">
              <WhatsAppIcon className="size-5 text-whatsapp" /> WhatsApp {empresa.whatsappExibicao}
            </a>
          </li>
          <li>
            <a href={linkInstagram} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2.5 rounded-md text-white/85 hover:text-white">
              <InstagramIcon className="size-5" /> @{empresa.instagram}
            </a>
          </li>
        </ul>
      </div>
      <div className="container-page flex flex-col gap-2 border-t border-white/[0.08] py-6 text-[12px] text-white/50 sm:flex-row sm:justify-between">
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
      className={`fixed bottom-5 right-5 z-30 grid size-14 place-items-center rounded-full bg-whatsapp text-white shadow-[0_12px_30px_-8px_rgba(37,211,102,0.6)] transition-[opacity,transform] duration-300 ease-[var(--ease-apple)] hover:scale-105 ${
        visible ? "opacity-100" : "pointer-events-none translate-y-4 opacity-0"
      }`}
      tabIndex={visible ? 0 : -1}
    >
      <WhatsAppIcon className="size-7" />
    </a>
  );
}

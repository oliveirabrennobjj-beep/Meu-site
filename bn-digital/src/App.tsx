import { MotionConfig } from "framer-motion";
import { useEffect, useState } from "react";
import { FinalCta, FloatingWhatsApp, Footer } from "@/components/sections/cta-footer";
import { Faq } from "@/components/sections/faq";
import { Header } from "@/components/sections/header";
import { Hero } from "@/components/sections/hero";
import { Nfc } from "@/components/sections/nfc";
import { Pricing } from "@/components/sections/pricing";
import { Process } from "@/components/sections/process";
import { Sites } from "@/components/sections/sites";
import { Works } from "@/components/sections/works";

export default function App() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 600);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-3 focus:z-50 focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:text-black"
      >
        Pular para o conteúdo
      </a>
      <Header />
      <main id="conteudo">
        <Hero />
        <Works />
        <Sites />
        <Nfc />
        <Process />
        <Pricing />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
      <FloatingWhatsApp visible={scrolled} />
    </MotionConfig>
  );
}

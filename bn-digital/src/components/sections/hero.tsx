import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { WhatsAppIcon } from "@/components/brand-icons";
import { NfcPlaque } from "@/components/nfc-plaque";
import { PhoneFrame } from "@/components/phone-frame";
import { Button } from "@/components/ui/button";
import { empresa, linkWhatsApp, mensagens } from "@/data/site";

const ease = [0.28, 0.11, 0.32, 1] as const;

export function Hero() {
  return (
    <section id="inicio" className="relative overflow-hidden pt-16 md:pt-24">
      {/* brilho azul de fundo */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-[38%] h-[620px] w-[900px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(0,113,227,0.38),transparent)] blur-2xl"
      />

      <div className="container-page relative text-center">
        <motion.p
          className="eyebrow"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease }}
        >
          Sites · Cardápios digitais · Placas NFC
        </motion.p>
        <motion.h1
          className="mx-auto mt-4 max-w-4xl text-[44px] font-semibold leading-[1.04] md:text-[80px]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.08, ease }}
        >
          Seu negócio merece
          <br />
          <span className="text-gradient">ser encontrado.</span>
        </motion.h1>
        <motion.p
          className="mx-auto mt-6 max-w-[34rem] text-[18px] leading-relaxed text-muted md:text-[21px]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.16, ease }}
        >
          Criamos sites e cardápios digitais com a cara da sua marca, e placas NFC que levam o cliente direto para a
          avaliação no Google.
        </motion.p>
        <motion.div
          className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.24, ease }}
        >
          <Button asChild size="lg" className="w-full sm:w-auto">
            <a href={linkWhatsApp(mensagens.geral)} target="_blank" rel="noopener noreferrer">
              <WhatsAppIcon />
              Pedir orçamento
            </a>
          </Button>
          <Button asChild variant="link" size="lg">
            <a href="#trabalhos">
              Ver trabalhos <ChevronRight />
            </a>
          </Button>
        </motion.div>
      </div>

      {/* vitrine: celular com site + placa NFC */}
      <motion.div
        className="container-page relative mt-16 md:mt-20"
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.1, delay: 0.3, ease }}
      >
        <div className="relative mx-auto flex h-[440px] max-w-[760px] items-end justify-center md:h-[620px]">
          <PhoneFrame
            eager
            src="trabalhos/parada-do-pastel.webp"
            alt="Site da Parada do Pastel aberto no celular"
            className="absolute bottom-0 left-[4%] hidden w-[230px] -rotate-[8deg] opacity-80 sm:block md:left-[6%] md:w-[270px]"
          />
          <PhoneFrame
            eager
            src="trabalhos/x-coco-lanches.webp"
            alt="Cardápio digital do X Cocó Lanches aberto no celular"
            className="relative z-10 w-[220px] md:w-[300px]"
          />
          <div className="absolute bottom-6 right-[2%] z-20 w-[150px] rotate-[7deg] sm:right-[6%] md:bottom-10 md:w-[210px]">
            <NfcPlaque variant="blue" />
          </div>
        </div>
        {/* fade inferior */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black to-transparent" />
      </motion.div>

      <p className="sr-only">BN Digital fica em {empresa.cidade}.</p>
    </section>
  );
}

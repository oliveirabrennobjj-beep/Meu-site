import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { WhatsAppIcon } from "@/components/brand-icons";
import { PhoneFrame } from "@/components/phone-frame";
import { Button } from "@/components/ui/button";
import { linkWhatsApp, mensagens } from "@/data/site";

const ease = [0.28, 0.11, 0.32, 1] as const;

export function Hero() {
  return (
    <section id="inicio" className="theme-light relative overflow-hidden pt-14 md:pt-20">
      {/* brilho azul suave no fundo branco */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[70%] bg-[radial-gradient(60%_60%_at_50%_70%,rgba(10,102,232,0.16),transparent)]"
      />

      <div className="container-page relative text-center">
        <motion.p className="eyebrow" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease }}>
          Sites · Cardápios digitais · Placas NFC
        </motion.p>
        <motion.h1
          className="display mx-auto mt-5 max-w-4xl text-[54px] text-fg sm:text-[72px] md:text-[96px]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.08, ease }}
        >
          Seu negócio merece ser <span className="text-primary">encontrado.</span>
        </motion.h1>
        <motion.p
          className="mx-auto mt-6 max-w-[34rem] text-[18px] leading-relaxed text-soft md:text-[21px]"
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

      {/* vitrine: celular com um site + foto real da placa NFC */}
      <motion.div
        className="container-page relative mt-14 md:mt-20"
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.1, delay: 0.3, ease }}
      >
        <div className="relative mx-auto flex h-[430px] max-w-[760px] items-end justify-center md:h-[600px]">
          <PhoneFrame
            eager
            src="trabalhos/parada-do-pastel.webp"
            alt="Site da Parada do Pastel aberto no celular"
            className="absolute bottom-0 left-[4%] hidden w-[230px] -rotate-[8deg] sm:block md:left-[6%] md:w-[270px]"
          />
          <PhoneFrame
            eager
            src="trabalhos/x-coco-lanches.webp"
            alt="Cardápio digital do X Cocó Lanches aberto no celular"
            className="relative z-10 w-[220px] md:w-[300px]"
          />
          <figure className="absolute bottom-6 right-0 z-20 w-[150px] rotate-[5deg] overflow-hidden rounded-[22px] bg-white p-1.5 shadow-[0_30px_60px_-20px_rgba(10,40,100,0.45)] ring-1 ring-black/5 sm:right-[4%] md:bottom-12 md:w-[220px]">
            <img
              src="nfc/placa-nfc-azul-no-balcao.webp"
              alt="Placa NFC azul no balcão e um cliente aproximando o celular para avaliar no Google"
              width={900}
              height={897}
              className="aspect-square w-full rounded-[17px] object-cover"
            />
          </figure>
        </div>
      </motion.div>
    </section>
  );
}

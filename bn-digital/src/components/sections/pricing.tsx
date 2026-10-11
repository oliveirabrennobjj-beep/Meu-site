import { Check } from "lucide-react";
import { WhatsAppIcon } from "@/components/brand-icons";
import { Reveal } from "@/components/reveal";
import { Button } from "@/components/ui/button";
import { linkWhatsApp } from "@/data/site";

const planos = [
  {
    nome: "Site personalizado",
    para: "Para quem quer ser encontrado e passar confiança.",
    itens: ["Visual com a identidade do seu negócio", "Botões de WhatsApp e Instagram", "Endereço e rota no mapa", "Feito primeiro para o celular"],
    mensagem: "Olá! Vim pelo site da BN Digital e quero saber o preço de um site personalizado.",
  },
  {
    nome: "Cardápio digital",
    para: "Para lanchonetes, pizzarias, açaíterias e cafeterias.",
    itens: ["Produtos por categoria, com fotos e preços", "Carrinho com pedido direto no WhatsApp", "Aviso de aberto ou fechado", "Link para a bio do Instagram"],
    mensagem: "Olá! Vim pelo site da BN Digital e quero saber o preço de um cardápio digital.",
  },
  {
    nome: "Placa NFC",
    para: "Para receber mais avaliações no Google.",
    itens: ["Configurada com o link de avaliação do seu negócio", "Versão preta e branca ou azul", "O cliente não precisa baixar aplicativo"],
    mensagem: "Olá! Vim pelo site da BN Digital e quero saber o preço das placas NFC.",
  },
];

export function Pricing() {
  return (
    <section id="precos" aria-labelledby="precos-titulo" className="theme-dark py-24 md:py-32">
      <div className="container-page">
        <Reveal className="mx-auto max-w-3xl text-center">
          <p className="eyebrow">Preços</p>
          <h2 id="precos-titulo" className="display mt-4 text-[42px] md:text-[64px]">
            Preço justo, combinado com <span className="italic text-accent">você.</span>
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-[17px] leading-relaxed text-soft md:text-[19px]">
            Cada negócio precisa de uma coisa diferente. Por isso os valores são passados e combinados pelo WhatsApp, de
            acordo com o que você precisa.
          </p>
        </Reveal>

        <ul className="mt-14 grid gap-4 lg:grid-cols-3">
          {planos.map((p, i) => (
            <Reveal
              as="li"
              key={p.nome}
              delay={i * 0.08}
              className="flex flex-col rounded-[var(--radius-tile)] bg-card p-7 text-card-fg md:p-8"
            >
              <h3 className="display text-[30px]">{p.nome}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-[#55555e]">{p.para}</p>

              <div className="mt-6 border-y border-[#e3e3e8] py-5">
                <p className="display text-[34px] leading-none">Sob consulta</p>
                <p className="mt-2 text-[14px] text-[#55555e]">Valor combinado pelo WhatsApp</p>
              </div>

              <ul className="mt-6 grid gap-3">
                {p.itens.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-[15px]">
                    <Check aria-hidden="true" className="mt-0.5 size-[18px] shrink-0 text-primary" />
                    {item}
                  </li>
                ))}
              </ul>

              <Button asChild className="mt-8 w-full" size="lg">
                <a href={linkWhatsApp(p.mensagem)} target="_blank" rel="noopener noreferrer">
                  <WhatsAppIcon />
                  Consultar preço
                </a>
              </Button>
            </Reveal>
          ))}
        </ul>

        <p className="mt-8 text-center text-[14px] text-soft">Orçamento sem compromisso. Pode pedir site e placa juntos.</p>
      </div>
    </section>
  );
}

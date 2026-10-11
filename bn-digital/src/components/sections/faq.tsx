import { Reveal } from "@/components/reveal";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const perguntas = [
  {
    p: "Quanto custa um site ou uma placa NFC?",
    r: "Depende do que o seu negócio precisa: quantidade de páginas, cardápio, carrinho de pedidos, quantidade de placas. Chame no WhatsApp e mandamos um orçamento sem compromisso.",
  },
  {
    p: "A placa NFC funciona em qualquer celular?",
    r: "Funciona na maioria dos celulares atuais com NFC, iPhone e Android. Não precisa instalar nada: é só aproximar o celular da placa e a página de avaliação abre.",
  },
  {
    p: "Para onde vão os pedidos do cardápio digital?",
    r: "O cliente monta o pedido no site e envia pronto para o WhatsApp do seu negócio, com os itens e o valor. Você só confirma e prepara.",
  },
  {
    p: "O site funciona bem no celular?",
    r: "Sim. Todos os projetos são pensados primeiro para o celular, que é onde a maioria dos clientes vai abrir o seu link.",
  },
  {
    p: "Posso usar o link do site no Instagram e no Google?",
    r: "Pode e deve. O link vai na bio do Instagram, no seu perfil do Google e em qualquer lugar onde você divulga o negócio.",
  },
];

export function Faq() {
  return (
    <section id="duvidas" aria-labelledby="duvidas-titulo" className="py-24 md:py-32">
      <div className="container-page grid gap-10 md:grid-cols-[1fr_1.6fr] md:gap-16">
        <Reveal>
          <p className="eyebrow">Dúvidas</p>
          <h2 id="duvidas-titulo" className="mt-3 text-[34px] font-semibold leading-[1.08] md:text-[48px]">
            Perguntas frequentes.
          </h2>
        </Reveal>
        <Reveal delay={0.08}>
          <Accordion type="single" collapsible className="border-t border-hairline">
            {perguntas.map((item, i) => (
              <AccordionItem key={i} value={`q${i}`}>
                <AccordionTrigger>{item.p}</AccordionTrigger>
                <AccordionContent>{item.r}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>
      </div>
    </section>
  );
}

import { useEffect } from "react";
import { useMovimento } from "@/lib/movimento";
import { BarraProgresso, VoltarAoTopo } from "@/components/movimento";
import { Header } from "@/components/sections/header";
import { Academia, Adultos, Hero, Kids, Professor } from "@/components/sections/abertura";
import { Horarios, Mensalidade, TrocaDeFaixa } from "@/components/sections/treinos";
import { AgendarAula, Duvidas } from "@/components/sections/interacoes";
import { Loja } from "@/components/sections/loja";
import { Contato, Galeria, Parceiros, Rodape, WhatsAppFlutuante } from "@/components/sections/final";

export default function App() {
  useMovimento();
  // links diretos (ex.: …/#planos): a página é montada pelo React depois do carregamento,
  // então o navegador não acha a seção sozinho; rolamos até ela aqui.
  useEffect(() => {
    let id = location.hash.slice(1);
    try {
      id = decodeURIComponent(id);
    } catch {
      // link com "%" quebrado: usa o texto como veio, em vez de derrubar a página
    }
    if (!id) return;
    // "instant": com a rolagem suave do CSS, a animação longa terminava centenas de pixels depois da seção
    const ir = () => document.getElementById(id)?.scrollIntoView({ behavior: "instant" });
    ir();
    // enquanto fotos e fontes carregam, a altura da página muda e a seção sai do lugar: acompanhamos por
    // alguns segundos, até a pessoa tocar, rolar ou usar o teclado (aí a rolagem é dela)
    const eventos = ["wheel", "touchstart", "keydown", "pointerdown"] as const;
    const acompanhar = new ResizeObserver(() => ir());
    let limite = 0;
    const parar = () => {
      acompanhar.disconnect();
      clearTimeout(limite);
      eventos.forEach((ev) => removeEventListener(ev, parar));
    };
    acompanhar.observe(document.body);
    eventos.forEach((ev) => addEventListener(ev, parar, { passive: true }));
    limite = window.setTimeout(parar, 4000);
    return parar;
  }, []);

  return (
    <>
      <BarraProgresso />
      <Header />
      <main id="conteudo">
        <Hero />
        <Academia />
        <Professor />
        <Kids />
        <Adultos />
        <Horarios />
        <Mensalidade />
        <TrocaDeFaixa />
        <Loja />
        <Galeria />
        <AgendarAula />
        <Duvidas />
        <Parceiros />
        <Contato />
      </main>
      <Rodape />
      <WhatsAppFlutuante />
      <VoltarAoTopo />
    </>
  );
}

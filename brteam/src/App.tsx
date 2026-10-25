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
    const id = decodeURIComponent(location.hash.slice(1));
    if (!id) return;
    const ir = () => document.getElementById(id)?.scrollIntoView();
    ir();
    // de novo quando fontes e imagens terminam de carregar e a altura da página assenta
    window.addEventListener("load", ir, { once: true });
    return () => window.removeEventListener("load", ir);
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

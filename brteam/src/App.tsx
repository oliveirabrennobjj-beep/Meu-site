import { Header } from "@/components/sections/header";
import { Academia, Hero, Kids, Professor } from "@/components/sections/abertura";
import { Horarios, TrocaDeFaixa } from "@/components/sections/treinos";
import { Contato, Galeria, Parceiros, Rodape, WhatsAppFlutuante } from "@/components/sections/final";

export default function App() {
  return (
    <>
      <Header />
      <main id="conteudo">
        <Hero />
        <Academia />
        <Professor />
        <Kids />
        <Horarios />
        <TrocaDeFaixa />
        <Galeria />
        <Parceiros />
        <Contato />
      </main>
      <Rodape />
      <WhatsAppFlutuante />
    </>
  );
}

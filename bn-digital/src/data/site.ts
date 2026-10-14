// DADOS DA EMPRESA — altere aqui contatos, textos de WhatsApp e trabalhos do carrossel.
import type { CarouselImage } from "@/components/ui/skiper49";

export const empresa = {
  nome: "BN Digital",
  cidade: "Casimiro de Abreu · RJ",
  whatsapp: "5522997052912",
  whatsappExibicao: "(22) 99705-2912",
  instagram: "bn_digital__sites_e_nfc",
};

export function linkWhatsApp(mensagem: string) {
  return `https://wa.me/${empresa.whatsapp}?text=${encodeURIComponent(mensagem)}`;
}

export const mensagens = {
  geral: "Olá! Vim pelo site da BN Digital e quero um orçamento.",
  site: "Olá! Vim pelo site da BN Digital e quero um orçamento de site / cardápio digital.",
  nfc: "Olá! Vim pelo site da BN Digital e quero saber das placas NFC para avaliações no Google.",
};

export const linkInstagram = `https://www.instagram.com/${empresa.instagram}/`;

// Prints dos últimos trabalhos (pasta public/trabalhos). A ordem aqui é a ordem do carrossel.
export const trabalhos: CarouselImage[] = [
  {
    src: "trabalhos/x-coco-lanches.webp",
    alt: "Site do X Cocó Lanches no celular: cardápio por categorias com botão de pedido",
    title: "X Cocó Lanches",
    subtitle: "Lanchonete · Cardápio com pedidos",
  },
  {
    src: "trabalhos/kitanda-hortifruti.webp",
    alt: "Site da Kitanda Hortifruti com o título Fruta madura, verdura fresquinha, pertinho de você, e botão de pedir pelo WhatsApp",
    title: "Kitanda Hortifruti",
    subtitle: "Hortifruti · Delivery pelo WhatsApp",
  },
  {
    src: "trabalhos/vertice-barbearia-entrada.webp",
    alt: "Tela de entrada do site da Vértice Barbearia com um poste de barbeiro dourado",
    title: "Vértice Barbearia",
    subtitle: "Barbearia · Tela de entrada animada",
  },
  {
    src: "trabalhos/otica-lumera.webp",
    alt: "Site da Ótica Lumera com foto de modelo usando óculos e menu de armações",
    title: "Ótica Lumera",
    subtitle: "Ótica · Vitrine de armações",
  },
  {
    src: "trabalhos/parada-do-pastel.webp",
    alt: "Site da Parada do Pastel com cardápio de mais de 100 sabores e carrinho",
    title: "Parada do Pastel",
    subtitle: "Pastelaria · Cardápio com carrinho",
  },
  {
    src: "trabalhos/grao-e-prosa.webp",
    alt: "Site da cafeteria Grão & Prosa com ilustração de café e categorias do cardápio",
    title: "Grão & Prosa",
    subtitle: "Cafeteria · Cardápio e doces",
  },
  {
    src: "trabalhos/vertice-barbearia.webp",
    alt: "Página inicial da Barbearia Vértice com botão de agendar horário",
    title: "Barbearia Vértice",
    subtitle: "Barbearia · Agendamento pelo WhatsApp",
  },
];

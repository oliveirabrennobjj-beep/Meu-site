/*
  DADOS DA LOJA — Rede Kitanda Hortifruti
  Quase tudo que aparece no site sai daqui. Campos vazios ("") não aparecem.
  Preços, carrinho e pagamento ficam para a próxima fase.
*/
window.KITANDA = {
  instagram: "https://www.instagram.com/redekitandahortifruti/",
  instagramUser: "@redekitandahortifruti",
  facebook: "https://www.facebook.com/search/top?q=Kitanda%20Hortifruti",

  mensagemWhatsApp: "Olá, Kitanda! Gostaria de fazer um pedido.",

  // WhatsApp de cada loja (do post "Peça delivery", maio/2023). Confirme antes de publicar.
  lojas: [
    {
      cidade: "Casimiro de Abreu",
      whatsapp: "5522988583752",
      telefone: "(22) 98858-3752",
      endereco: "",   // ex.: "Rua X, 123 – Centro"
      mapaUrl: "",
      horario: ""
    },
    {
      cidade: "Arraial do Cabo",
      whatsapp: "5522997375913",
      telefone: "(22) 99737-5913",
      endereco: "",
      mapaUrl: "",
      horario: ""
    },
    {
      cidade: "Rio das Ostras",
      whatsapp: "5522999374841",
      telefone: "(22) 99937-4841",
      endereco: "",
      mapaUrl: "",
      horario: ""
    }
  ],

  // img: nome do arquivo em assets/img (sem extensão). pos: enquadramento da foto.
  categorias: [
    { nome: "Frutas", desc: "Da estação e tropicais", img: "laranja", pos: "50% 60%" },
    { nome: "Legumes", desc: "Tomate, berinjela, chuchu", img: "berinjela-540", pos: "50% 55%" },
    { nome: "Verduras", desc: "Folhas e repolho", img: "batata-doce-540", pos: "50% 100%" },
    { nome: "Raízes", desc: "Aipim e batata-doce", img: "aipim", pos: "50% 50%" },
    { nome: "Frutas nobres", desc: "Kiwi, ameixa, pera", img: "kiwi-540", pos: "40% 70%" }
  ],

  // Vitrine. "unidade" é como o produto costuma ser vendido; o preço entra na próxima fase.
  produtos: [
    { nome: "Mamão papaia", unidade: "por unidade", img: "mamao", pos: "50% 60%" },
    { nome: "Aipim", unidade: "por kg", img: "aipim", pos: "50% 50%" },
    { nome: "Laranja pera", unidade: "por kg", img: "laranja", pos: "50% 60%" },
    { nome: "Uva Thompson", unidade: "por bandeja", img: "uva", pos: "50% 50%" },
    { nome: "Manga", unidade: "por kg", img: "mangas-540", pos: "40% 92%" },
    { nome: "Kiwi", unidade: "por kg", img: "kiwi-540", pos: "35% 80%" },
    { nome: "Batata-doce roxa", unidade: "por kg", img: "batata-doce-540", pos: "60% 58%" },
    { nome: "Berinjela", unidade: "por kg", img: "berinjela-540", pos: "40% 78%" }
  ]
};

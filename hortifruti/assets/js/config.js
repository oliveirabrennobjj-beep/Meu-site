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

  // Lista oficial de WhatsApps (página do Instagram): instabio.cc/Kitandahortifruti
  // Loja sem número: o botão abre essa lista. Para ligar direto, preencha
  // "whatsapp" só com números e o 55 na frente (ex.: "5522988583752") e "telefone".
  listaWhatsApp: "https://instabio.cc/Kitandahortifruti",

  // Lojas que aparecem no site: as de Casimiro de Abreu.
  // foto/fotoPos: foto do cartão da loja (arquivo em assets/img, sem extensão).
  lojas: [
    {
      cidade: "Casimiro de Abreu",
      unidade: "Centro",
      whatsapp: "",   // só números, com 55 + DDD: ex. "5522988583752"
      telefone: "",   // como aparece no site: ex. "(22) 98858-3752"
      endereco: "Rua Pastor Luis Laurentino da Silva, 196, lojas 03 e 04 – Pessoinha, Casimiro de Abreu – RJ",
      mapaUrl: "https://www.google.com/maps/search/?api=1&query=Rua%20Pastor%20Luis%20Laurentino%20da%20Silva%2C%20196%2C%20Casimiro%20de%20Abreu%20-%20RJ",
      horario: "",    // ex.: "Seg. a sáb., 7h às 20h"
      foto: "batata-doce-960",
      fotoPos: "50% 70%"
    },
    {
      cidade: "Casimiro de Abreu",
      unidade: "Mataruna",
      whatsapp: "",
      telefone: "",
      endereco: "Rua Pastor Luis Laurentino da Silva, 1262, loja A – Santa Ely, Casimiro de Abreu – RJ",
      mapaUrl: "https://www.google.com/maps/search/?api=1&query=Rua%20Pastor%20Luis%20Laurentino%20da%20Silva%2C%201262%2C%20Casimiro%20de%20Abreu%20-%20RJ",
      horario: "",
      foto: "mangas-960",
      fotoPos: "50% 80%"
    }
  ],

  // Outras cidades da rede, guardadas para depois (não aparecem no site).
  // Para mostrar uma delas, mova o bloco para "lojas" acima.
  outrasLojas: [
    { cidade: "Arraial do Cabo", unidade: "Em frente ao Sanduba", whatsapp: "", telefone: "", endereco: "", mapaUrl: "", horario: "" },
    { cidade: "Arraial do Cabo", unidade: "Ao lado do Bradesco", whatsapp: "", telefone: "", endereco: "", mapaUrl: "", horario: "" },
    { cidade: "Rio das Ostras", unidade: "", whatsapp: "", telefone: "", endereco: "", mapaUrl: "", horario: "" }
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

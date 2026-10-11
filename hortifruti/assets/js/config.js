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
      // Sem WhatsApp por enquanto: o link da lista abria o número de outra pessoa.
      // Quando tiver o número certo, apague esta linha e preencha "whatsapp" e "telefone".
      semWhatsApp: true,
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

  // Posts do Instagram da loja do Centro (seção "Receitas e dicas").
  // img: arquivo em assets/img/posts, sem o final "-540"/"-1080". O primeiro aparece maior.
  posts: [
    { img: "semana-das-saladas", titulo: "Semana das Saladas", alt: "Post Semana das Saladas: mais cor, mais sabor, mais saúde" },
    { img: "salada-verde", titulo: "Dia 1: Salada Verde", alt: "Receita Salada Verde: alface, pepino, rúcula, agrião, cebolinha e salsinha" },
    { img: "salada-colorida", titulo: "Dia 2: Salada Colorida", alt: "Receita Salada Colorida: alface, cenoura ralada, repolho roxo, milho, tomate cereja e cheiro-verde" },
    { img: "salada-tropical", titulo: "Dia 3: Salada Tropical", alt: "Receita Salada Tropical: alface, manga, kiwi, tomate cereja, abacaxi e milho" },
    { img: "salada-mediterranea", titulo: "Dia 5: Salada Mediterrânea", alt: "Receita Salada Mediterrânea: folhas verdes, tomate cereja, pepino, cebola roxa, azeitonas, queijo feta e grão-de-bico" },
    { img: "salada-refrescante", titulo: "Dia 6: Salada Refrescante", alt: "Receita Salada Refrescante: alface, pepino, tomate cereja, cebola roxa, melancia, queijo feta e hortelã" },
    { img: "salada-completa", titulo: "Dia 7: Salada Completa", alt: "Receita Salada Completa: folhas, legumes, milho, grão-de-bico, ovo cozido e frango grelhado" },
    { img: "receitas-laranja", titulo: "Receitas com laranja pera", alt: "Cinco receitas com laranja pera: suco, bolo, salada, doce de casca e vitamina com banana" },
    { img: "conservar-laranja", titulo: "Como conservar a laranja", alt: "Dicas para conservar a laranja por mais tempo", alto: true }
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

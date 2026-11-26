/*
  DADOS DO SITE — Depósito do Gordinho (Casimiro de Abreu, RJ)
  Quase tudo que aparece no site sai daqui. Para mudar um texto, um produto
  ou um horário, mude aqui e salve. Campo vazio ("") não aparece no site.

  Fontes: Google Maps, perfil do WhatsApp Business e Instagram @depositodogordinho7
  (prints enviados pelo Brenno em 26/11/2026).
*/
window.SITE = {
  nome: "Depósito do Gordinho",
  desde: "2019",

  whatsapp: "5522988388935",           // só números, com 55 + DDD
  telefone: "(22) 98838-8935",
  telefoneLink: "+5522988388935",
  mensagemWhatsApp: "Olá, Depósito do Gordinho! Quero fazer um pedido.",

  instagram: "https://www.instagram.com/depositodogordinho7/",
  instagramUser: "@depositodogordinho7",

  // Sem número da casa: o Google mostra 1197 e o WhatsApp mostra 962. Confirmar com o dono.
  endereco: "Rua Padre Francisco Maria Tales, Vila Mataruna",
  cidade: "Casimiro de Abreu, RJ",
  mapaUrl: "https://www.google.com/maps/search/?api=1&query=Dep%C3%B3sito%20do%20Gordinho%20Vila%20Mataruna%20Casimiro%20de%20Abreu",
  avaliacoesUrl: "https://www.google.com/maps/search/?api=1&query=Dep%C3%B3sito%20do%20Gordinho%20Casimiro%20de%20Abreu",

  horario: [
    { dias: "Terça a domingo", horas: "10h às 22h" },
    { dias: "Segunda", horas: "Fechado" }
  ],

  pagamento: ["Pix", "Cartão de crédito e débito", "QR Code"],

  notaGoogle: "4,7",
  totalAvaliacoes: "18",

  // Avaliações reais do Google (print de 26/11/2026). Só primeiro nome + inicial.
  avaliacoes: [
    { texto: "Melhor depósito de Casimiro de Abreu, atendimento de extrema qualidade, 100% humanizado, entrega ultra rápida.", nome: "Fernando J." },
    { texto: "Entrega rápida, atendimento nota 1000 e cerveja bem gelada!", nome: "Alessandra G." },
    { texto: "O melhor depósito de Casimiro de Abreu, nota 10.", nome: "Mayara B." },
    { texto: "Bebidas super geladas, e excelente atendimento!", nome: "Mauricio D." },
    { texto: "Entrega rápida e tudo gelado.", nome: "Juliara S." },
    { texto: "Ótimo preço e atendimento.", nome: "Victor E." }
  ],

  /*
    GELADEIRA (produtos)
    LISTA DE EXEMPLO para a prévia: as cervejas e refrigerantes de garrafa aparecem
    nas fotos da loja; o Breez Cooler está no catálogo do WhatsApp; o resto é
    sugestão comum de depósito. Trocar pela lista real que o dono mandar.

    tipo: garrafa | longneck | lata | latao | pet | vinho | quadrada | alta | agua
    cor: cor do vidro/lata · rotulo: cor do rótulo · letra: cor do texto do rótulo
    preco: "" mostra "Preço no WhatsApp"
  */
  categorias: [
    { id: "cervejas", nome: "Cervejas" },
    { id: "destilados", nome: "Destilados" },
    { id: "vinhos", nome: "Vinhos e drinks" },
    { id: "sem-alcool", nome: "Sem álcool" },
    { id: "petiscos", nome: "Doces e petiscos" }   // confirmar com o dono o que ele vende
  ],

  produtos: [
    { cat: "cervejas", nome: "Brahma Chopp", tamanho: "Garrafa 600 ml", tipo: "garrafa", cor: "#4a2a10", rotulo: "#c8262c", letra: "#f6d36b", tampa: "#d9b24a", preco: "" },
    { cat: "cervejas", nome: "Antarctica Pilsen", tamanho: "Garrafa 600 ml", tipo: "garrafa", cor: "#3c2410", rotulo: "#1f4fa3", letra: "#ffffff", tampa: "#1f4fa3", preco: "" },
    { cat: "cervejas", nome: "Bohemia", tamanho: "Garrafa 600 ml", tipo: "garrafa", cor: "#3a2412", rotulo: "#efe6cf", letra: "#5a3a12", tampa: "#c7a04a", preco: "" },
    { cat: "cervejas", nome: "Heineken", tamanho: "Long neck 330 ml", tipo: "longneck", cor: "#0f5a2a", rotulo: "#0f5a2a", letra: "#ffffff", tampa: "#14612f", preco: "" },
    { cat: "cervejas", nome: "Skol", tamanho: "Lata 350 ml", tipo: "lata", cor: "#f2c318", rotulo: "#f2c318", letra: "#16357a", preco: "" },
    { cat: "cervejas", nome: "Brahma Duplo Malte", tamanho: "Latão 473 ml", tipo: "latao", cor: "#9a1c20", rotulo: "#9a1c20", letra: "#f3d27a", preco: "" },
    { cat: "cervejas", nome: "Amstel", tamanho: "Lata 350 ml", tipo: "lata", cor: "#b3121b", rotulo: "#b3121b", letra: "#ffffff", preco: "" },
    { cat: "cervejas", nome: "Spaten", tamanho: "Long neck 355 ml", tipo: "longneck", cor: "#16452a", rotulo: "#e9e1cc", letra: "#16452a", tampa: "#c9a54c", preco: "" },

    { cat: "destilados", nome: "Cachaça 51", tamanho: "Garrafa 965 ml", tipo: "alta", cor: "#e9eef0", rotulo: "#f4c430", letra: "#b3121b", tampa: "#b3121b", preco: "" },
    { cat: "destilados", nome: "Vodka Smirnoff", tamanho: "Garrafa 998 ml", tipo: "alta", cor: "#e6edf2", rotulo: "#c8202f", letra: "#ffffff", tampa: "#c8202f", preco: "" },
    { cat: "destilados", nome: "Whisky Red Label", tamanho: "Garrafa 1 L", tipo: "quadrada", cor: "#a0561a", rotulo: "#f1e6cc", letra: "#8a1c1c", tampa: "#2a2a2a", preco: "" },
    { cat: "destilados", nome: "Gin Rocks", tamanho: "Garrafa 1 L", tipo: "quadrada", cor: "#dfe9ee", rotulo: "#1d3b5c", letra: "#ffffff", tampa: "#1d3b5c", preco: "" },
    { cat: "destilados", nome: "Conhaque Dreher", tamanho: "Garrafa 900 ml", tipo: "garrafa", cor: "#7a3d12", rotulo: "#f2e3b6", letra: "#7a1f14", tampa: "#d6b45a", preco: "" },

    { cat: "vinhos", nome: "Breez Cooler", tamanho: "Garrafa 275 ml", tipo: "longneck", cor: "#c23a5c", rotulo: "#f5d9e0", letra: "#8a1f3c", tampa: "#e8e8e8", preco: "" },
    { cat: "vinhos", nome: "Vinho tinto suave", tamanho: "Garrafa 750 ml", tipo: "vinho", cor: "#2a0f16", rotulo: "#efe4cc", letra: "#6d1424", tampa: "#6d1424", preco: "" },
    { cat: "vinhos", nome: "Catuaba Selvagem", tamanho: "Garrafa 900 ml", tipo: "garrafa", cor: "#3a120e", rotulo: "#1c1c1c", letra: "#f2c318", tampa: "#c49a3a", preco: "" },
    { cat: "vinhos", nome: "Smirnoff Ice", tamanho: "Long neck 275 ml", tipo: "longneck", cor: "#d9e4ea", rotulo: "#c8202f", letra: "#ffffff", tampa: "#b9c3c9", preco: "" },

    { cat: "sem-alcool", nome: "Coca-Cola", tamanho: "Garrafa 2 L", tipo: "pet", cor: "#2a1208", rotulo: "#d0121b", letra: "#ffffff", tampa: "#d0121b", preco: "" },
    { cat: "sem-alcool", nome: "Guaraná Antarctica", tamanho: "Garrafa 2 L", tipo: "pet", cor: "#1f5a1a", rotulo: "#167a2e", letra: "#ffffff", tampa: "#167a2e", preco: "" },
    { cat: "sem-alcool", nome: "Energético", tamanho: "Lata 250 ml", tipo: "lata", cor: "#22457a", rotulo: "#22457a", letra: "#e9eef5", preco: "" },
    { cat: "sem-alcool", nome: "Água mineral", tamanho: "Garrafa 500 ml", tipo: "agua", cor: "#cfe6f2", rotulo: "#2f7fc0", letra: "#ffffff", tampa: "#2f7fc0", preco: "" },

    // tipo saco = pacote; caixa = pote/caixinha
    { cat: "petiscos", nome: "Amendoim", tamanho: "Pacote", tipo: "saco", cor: "#b5432a", rotulo: "#f3d27a", letra: "#5a1e10", preco: "" },
    { cat: "petiscos", nome: "Salgadinho", tamanho: "Pacote", tipo: "saco", cor: "#e2a521", rotulo: "#1f4fa3", letra: "#ffffff", preco: "" },
    { cat: "petiscos", nome: "Paçoca", tamanho: "Unidade ou pote", tipo: "caixa", cor: "#c98a3c", rotulo: "#fff4dc", letra: "#7a3d12", preco: "" },
    { cat: "petiscos", nome: "Balas", tamanho: "Pacote", tipo: "saco", cor: "#d23a74", rotulo: "#ffe36b", letra: "#7a1240", preco: "" }
  ]
};

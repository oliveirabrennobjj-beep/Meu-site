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
    VITRINE (produtos)
    LISTA DE EXEMPLO para a prévia: cervejas e refrigerantes vistos nas fotos da loja,
    Breez Cooler do catálogo do WhatsApp, o resto é sugestão comum de depósito.
    Trocar pela lista real que o dono mandar.

    img: arquivo em assets/img/produtos (.webp sem fundo)
    cm: altura real da embalagem, para as garrafas aparecerem no tamanho certo
    preco: "" mostra "Preço no WhatsApp"
    capa: true = aparece no círculo da categoria
  */
  categorias: [
    { id: "cervejas", nome: "Cervejas", capa: "brahma" },
    { id: "destilados", nome: "Destilados", capa: "redlabel" },
    { id: "vinhos", nome: "Vinhos e drinks", capa: "pergola" },
    { id: "sem-alcool", nome: "Sem álcool", capa: "coca" },
    { id: "petiscos", nome: "Doces e petiscos", capa: "ruffles" }   // confirmar com o dono o que ele vende
  ],

  produtos: [
    { cat: "cervejas", nome: "Brahma Chopp", tamanho: "Garrafa 600 ml", img: "brahma", cm: 29, preco: "" },
    { cat: "cervejas", nome: "Antarctica Pilsen", tamanho: "Garrafa 600 ml", img: "antarctica", cm: 29, preco: "" },
    { cat: "cervejas", nome: "Bohemia Puro Malte", tamanho: "Garrafa 600 ml", img: "bohemia", cm: 29, preco: "" },
    { cat: "cervejas", nome: "Heineken", tamanho: "Long neck 330 ml", img: "heineken", cm: 23, preco: "" },
    { cat: "cervejas", nome: "Spaten", tamanho: "Long neck 355 ml", img: "spaten", cm: 23, preco: "" },
    { cat: "cervejas", nome: "Brahma Duplo Malte", tamanho: "Latão 473 ml", img: "duplomalte", cm: 16.5, preco: "" },
    { cat: "cervejas", nome: "Skol", tamanho: "Lata 350 ml", img: "skol", cm: 12.5, preco: "" },
    { cat: "cervejas", nome: "Amstel", tamanho: "Lata 350 ml", img: "amstel", cm: 14, preco: "" },

    { cat: "destilados", nome: "Johnnie Walker Red Label", tamanho: "Garrafa 1 L", img: "redlabel", cm: 30, preco: "" },
    { cat: "destilados", nome: "Vodka Smirnoff", tamanho: "Garrafa 998 ml", img: "smirnoff", cm: 30, preco: "" },
    { cat: "destilados", nome: "Cachaça 51", tamanho: "Garrafa 965 ml", img: "cachaca51", cm: 30, preco: "" },
    { cat: "destilados", nome: "Conhaque Dreher", tamanho: "Garrafa 900 ml", img: "dreher", cm: 28, preco: "" },

    { cat: "vinhos", nome: "Vinho Pérgola Tinto Suave", tamanho: "Garrafa 1 L", img: "pergola", cm: 31, preco: "" },
    { cat: "vinhos", nome: "Breez Cooler", tamanho: "Garrafa 275 ml", img: "breez", cm: 24, preco: "" },
    { cat: "vinhos", nome: "Smirnoff Ice", tamanho: "Long neck 275 ml", img: "ice", cm: 23, preco: "" },

    { cat: "sem-alcool", nome: "Coca-Cola", tamanho: "Garrafa 2 L", img: "coca", cm: 33, preco: "" },
    { cat: "sem-alcool", nome: "Guaraná Antarctica", tamanho: "Garrafa 2 L", img: "guarana", cm: 33, preco: "" },
    { cat: "sem-alcool", nome: "Red Bull", tamanho: "Lata 250 ml", img: "redbull", cm: 13.5, preco: "" },
    { cat: "sem-alcool", nome: "Água Crystal", tamanho: "Garrafa 500 ml", img: "agua", cm: 21, preco: "" },

    { cat: "petiscos", nome: "Ruffles Original", tamanho: "Pacote", img: "ruffles", cm: 21, preco: "" },
    { cat: "petiscos", nome: "Amendoim Japonês Dori", tamanho: "Pacote", img: "amendoim", cm: 22, preco: "" },
    { cat: "petiscos", nome: "Paçoquita", tamanho: "Pote", img: "pacoca", cm: 15, preco: "" },
    { cat: "petiscos", nome: "Balas Fini", tamanho: "Pacote", img: "bala", cm: 17, preco: "" }
  ]
};

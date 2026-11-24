// Tudo que é da loja fica aqui. Campo vazio = a parte some ou mostra "consulte pelo WhatsApp".
window.SITE = {
  nome: "Best Bull SteakHouse",
  cidade: "Casimiro de Abreu",
  uf: "RJ",

  // DDI + DDD + número, só dígitos (WhatsApp da loja no Google Maps).
  whatsapp: "5522997152701",
  whatsappVisivel: "(22) 99715-2701",

  instagram: "bestbull_steakhouse",

  // Nota do Google Maps (conferida em 24/11/2026). Atualize quando mudar.
  nota: 4.9,
  avaliacoes: 50,

  // Ainda não confirmados com o dono. Deixe vazio para esconder.
  endereco: "",
  horarios: "",
  areaEntrega: "",
  linkAnotaAi: "",

  mensagens: {
    geral: "Olá! Vim pelo site da Best Bull SteakHouse e quero fazer um pedido.",
    lanches: "Olá! Quero pedir um lanche. Pode me mandar o cardápio?",
    shake: "Olá! Quero pedir um milk shake. Pode me mandar os sabores?",
    acompanhamentos: "Olá! Quero pedir um acompanhamento. Pode me mandar as opções?",
    kids: "Olá! Queria saber mais sobre o Espaço Kids da Best Bull."
  },

  // Itens do cardápio por categoria: { nome, descricao, preco }. Vazio = "Peça o cardápio pelo WhatsApp".
  cardapio: {
    lanches: [],
    shake: [],
    acompanhamentos: []
  }
};

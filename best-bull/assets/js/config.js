// Tudo que é da loja fica aqui. Campo vazio = a parte some ou mostra "consulte pelo WhatsApp".
window.SITE = {
  nome: "Best Bull SteakHouse",
  cidade: "Casimiro de Abreu",
  uf: "RJ",

  // DDI + DDD + número, só dígitos (WhatsApp da loja no Google Maps).
  whatsapp: "5522997152701",
  whatsappVisivel: "(22) 99715-2701",

  instagram: "bestbull_steakhouse",
  email: "",

  // Nota do Google Maps (conferida em 24/11/2026). Atualize quando mudar.
  nota: 4.9,
  avaliacoes: 50,

  // Rua informada pelo Brenno (sem número). Ainda sem confirmação do dono: horários e Anota Aí.
  endereco: "R. Ten. João dos Santos Pessoa, Casimiro de Abreu, RJ",
  horarios: "",
  linkAnotaAi: "",

  // Itens em destaque. Preencha `descricao` e `preco` (ex.: "R$ 0,00") quando o dono passar. Vazio = esconde.
  itens: {
    xbacon: { nome: "X-Bacon sabor picanha", descricao: "", preco: "" },
    supreme: { nome: "Supreme", descricao: "", preco: "" },
    acomp: { nome: "Acompanhamentos", descricao: "", preco: "" },
    shake: { nome: "Milk shake", descricao: "", preco: "" }
  },

  mensagens: {
    geral: "Olá! Vim pelo site da Best Bull SteakHouse e quero fazer um pedido.",
    kids: "Olá! Queria saber mais sobre o Espaço Kids da Best Bull.",
    pedido: "Olá! Quero fazer um pedido pelo site da Best Bull:"
  }
};

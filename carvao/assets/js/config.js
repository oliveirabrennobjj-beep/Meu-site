// Todos os dados editáveis do site. Campo vazio = a parte some do site.
// CARVÃO é um modelo: nome, endereço, horários, cardápio e preços abaixo são de EXEMPLO.
window.SITE = {
  nome: "Carvão",
  bairro: "Vila Madalena",
  cidade: "São Paulo, SP",

  // WhatsApp: DDI + DDD + número, só dígitos (ex.: "5511999990000").
  // Vazio = os botões abrem o WhatsApp com a mensagem pronta e a pessoa escolhe o contato.
  whatsapp: "",
  whatsappVisivel: "",   // ex.: "(11) 99999-0000". Vazio = não mostra o número
  mensagens: {
    pedido: "Olá! Quero fazer um pedido no Carvão.",
    reserva: "Olá! Quero reservar uma mesa no Carvão.",
    item: "Olá! Quero pedir o {nome} ({preco})."
  },

  instagram: "",         // ex.: "https://instagram.com/perfil"
  tiktok: "",
  email: "",

  endereco: "Rua da Brasa, 128",
  horarios: { dias: "Terça a domingo", horas: "18h às 00h" },
  delivery: "Só até 22h30",
  // O que o botão "Abrir no Google Maps" procura. Troque pelo endereço real da loja.
  mapaBusca: "Vila Madalena, São Paulo, SP",

  // foto = nome do arquivo em assets/img, sem o tamanho (carvao-300.webp e carvao-600.webp).
  cardapio: [
    { nome: "Carvão", descricao: "Blend 180g, comté maturado, cebola caramelizada em cerveja preta, maionese de brasa.", preco: "46", foto: "carvao", alt: "Cheeseburger duplo com queijo derretido, cebola e picles sobre grelha preta" },
    { nome: "Fumo", descricao: "Costela desfiada 12h, provolone defumado, picles de cebola roxa, pão brioche.", preco: "52", foto: "fumo", alt: "Hambúrguer alto com queijo derretido e cobertura crocante sobre tábua de madeira" },
    { nome: "Brasa", descricao: "Blend 180g, cheddar maturado, bacon artesanal, geleia de pimenta malagueta.", preco: "49", foto: "brasa", alt: "Hambúrguer duplo com cheddar derretido e bacon em fundo escuro" },
    { nome: "Cinza", descricao: "Cogumelos salteados, gruyère, creme de trufa negra, rúcula selvagem.", preco: "48", foto: "cinza", alt: "Hambúrguer em pão escuro com folhas verdes e molho sobre mesa preta" },
    { nome: "Origem", descricao: "Smash duplo 90g, queijo americano, cebola na chapa, pão de batata.", preco: "38", foto: "origem", alt: "Smash burger duplo com queijo americano e anéis de cebola roxa" }
  ]
};

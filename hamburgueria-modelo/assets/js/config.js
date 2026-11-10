// Todos os dados editáveis do site. Campo vazio = a parte some ou vira "Consulte pelo WhatsApp".
// Itens marcados com assumido: true são exemplo e precisam ser confirmados pelo cliente.
window.SITE = {
  nome: "Burgeria",
  cidade: "",
  frase: { a: "O melhor", b: "burger", c: "da região" },
  lead: "Smash e artesanal, ao ponto ou malpassado, como você gosta.",
  whatsapp: "",        // ex.: "5513999999999" (DDI + DDD + número). Vazio = botões sem link
  mensagemWhatsapp: "Oi! Quero fazer um pedido.",
  instagram: "",       // ex.: "https://instagram.com/perfil"
  endereco: "",        // só rua e bairro, nada de número
  horarios: "",        // ex.: "Ter a dom, 18h às 23h"
  mapa: "",            // link do Google Maps quando houver endereço confirmado
  entrega: "Entregamos na sua região. Peça pelo WhatsApp.",
  cardapio: [
    { nome: "Burger clássico", descricao: "Carne smash, queijo, alface, tomate e molho da casa.", preco: "", assumido: true, destaque: "Mais pedido" },
    { nome: "Burger bacon", descricao: "Carne smash, queijo cheddar, bacon crocante e cebola caramelizada.", preco: "", assumido: true },
    { nome: "Burger duplo", descricao: "Duas carnes smash, dobro de queijo e molho defumado.", preco: "", assumido: true },
    { nome: "Batata rústica", descricao: "Porção com alecrim e maionese da casa.", preco: "", assumido: true }
  ]
};

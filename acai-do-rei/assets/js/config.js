/*
 * DADOS DO AÇAÍ DO REI — edite aqui. Campos vazios ("") somem do site.
 * Tudo veio do Instagram @acaidoreideliverycasimiro (print de 01/11/2026).
 * Preço vazio aparece como "Consulte no WhatsApp".
 */
window.SITE = {
  nome: "Açaí do Rei Delivery",
  slogan: "Sabor que coroa seu dia!",

  contato: {
    // Só números, com 55 + DDD.
    whatsapp: "5522999388847",
    mensagemWhatsapp: "Olá, Açaí do Rei! Quero fazer um pedido 👑",
    instagram: "acaidoreideliverycasimiro",
  },

  local: {
    texto: "Praça do Skate, Casimiro de Abreu (RJ)",
    mapaUrl: "https://www.google.com/maps/search/?api=1&query=Pra%C3%A7a+do+Skate+Casimiro+de+Abreu+RJ",
  },

  // Lista vazia = mostra "Consulte no WhatsApp".
  horarios: [
    { dias: "Delivery", horas: "14h às 23h" },
  ],

  // "Os queridinhos". Os nomes descrevem o que aparece na foto; troque pelos nomes do cardápio.
  destaques: [
    { nome: "Ninho com creme de avelã", desc: "Camadas cremosas, Leite Ninho por cima e creme de avelã à vontade.", preco: "", img: "nutella-ninho", selo: "Mais visto" },
    { nome: "Açaí com brownie", desc: "Açaí, creme e pedaços de brownie no topo.", preco: "", img: "brownie" },
    { nome: "Creme com Oreo", desc: "Creme branquinho batido com Oreo e mais Oreo por cima.", preco: "", img: "oreo-creme", selo: "Novo" },
    { nome: "Açaí com Oreo", desc: "Açaí e creme misturados, coberto de Oreo triturado.", preco: "", img: "oreo-acai" },
  ],

  // Promoções do Instagram. aviso aparece embaixo (confirme se ainda valem).
  promocoes: [
    { nome: "Ninhotella", tamanho: "300 ml", preco: "13,00" },
    { nome: "Maracutella", tamanho: "500 ml", preco: "22,00" },
  ],
  avisoPromocoes: "Promoções vistas no nosso Instagram. Confirme no WhatsApp se ainda estão valendo.",

  // Adicionais que aparecem nos posts. A lista completa é passada no WhatsApp.
  adicionais: ["Leite Ninho", "Creme de avelã", "Oreo", "Brownie", "Morango", "Creme branco"],
};

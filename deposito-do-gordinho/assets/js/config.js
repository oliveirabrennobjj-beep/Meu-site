/*
  DADOS DA LOJA — Depósito do Gordinho (Casimiro de Abreu, RJ)
  Telefone, endereço e horário. Os PRODUTOS ficam em produtos.js.
*/
var LOJA = {
  // PRÉVIA: true = os botões de WhatsApp e Ligar não chamam o dono (só mostram um aviso).
  // Quando ele aprovar o site, trocar para false.
  previa: true,

  nome: "Depósito do Gordinho",
  whatsapp: "5522988388935",           // só números: 55 + DDD + número
  telefoneLink: "+5522988388935",
  mensagemWhatsApp: "Olá, Depósito do Gordinho! Quero fazer um pedido.",

  // Horário (0 = domingo ... 6 = sábado). null = fechado.
  horario: { 0: [10, 22], 1: null, 2: [10, 22], 3: [10, 22], 4: [10, 22], 5: [10, 22], 6: [10, 22] }
};

if (typeof module !== "undefined") module.exports = LOJA;

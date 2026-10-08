/*
 * DADOS DA PADARIA — edite aqui. Campos vazios ("") somem do site.
 * Os preços preenchidos vieram dos posts da padaria; os vazios aparecem como "consulte".
 */
window.PADARIA = {
  nome: "Padaria BNH",

  contato: {
    // Link de pedidos (ex.: o link do anota.ai que aparece nos stories). Vazio = usa o Instagram.
    pedidoUrl: "https://app.anota.ai/m/4hqEzopNw",
    // WhatsApp só com números, com DDI e DDD (ex.: "5522999999999").
    whatsapp: "",
    mensagemWhatsapp: "Olá, Padaria BNH! Gostaria de fazer um pedido.",
    instagram: "bnh.padaria",
  },

  endereco: {
    texto: "R. Maria José Marmelo dos Santos, 430, Casimiro de Abreu (RJ)",
    mapaUrl: "https://www.google.com/maps/search/?api=1&query=R.+Maria+Jos%C3%A9+Marmelo+dos+Santos,+430,+Casimiro+de+Abreu,+RJ",
  },

  // Deixe a lista vazia para mostrar "Consulte pelo WhatsApp ou Instagram".
  horarios: [
    { dias: "Segunda a sábado", horas: "6h às 21h30" },
    { dias: "Domingo", horas: "6h às 20h" },
  ],
  // Aviso de entrega (aparece abaixo dos horários). Vazio = some.
  avisoEntrega: "Não fazemos entregas às quartas-feiras nem no quarto domingo do mês.",

  // Vitrine "Mais pedidos". preco vazio = mostra "Sob consulta".
  destaques: [
    { nome: "Croissant recheado", desc: "Massa folhada, morango e chocolate, finalizado com açúcar de confeiteiro.", preco: "11,99", img: "croissant", selo: "Lançamento" },
    { nome: "Rabanada com cobertura", desc: "Pão dourado na canela, com creme maçaricado ou morango fresco.", preco: "7,00", img: "rabanada-cobertura" },
    { nome: "Bolo crocante", desc: "Bolo de chocolate coberto de flocos crocantes e chocolate ao leite.", preco: "8,50", img: "bolo-crocante" },
    { nome: "Banoff", desc: "Biscoito moído, doce de leite, banana, chantilly e canela.", preco: "", img: "banoff" },
    { nome: "Delícia de uva", desc: "Creme de ninho, uvas em pedaços, ganache e chocolate meio amargo.", preco: "", img: "delicia-de-uva" },
    { nome: "Rosca doce tradicional", desc: "Fofinha, passada no açúcar com canela. A de sempre.", preco: "", img: "rosca-doce" },
    { nome: "Cupcake de chocolate", desc: "Massa de chocolate, ganache cremosa e confeitos crocantes.", preco: "", img: "cupcake-chocolate" },
    { nome: "Pão francês quentinho", desc: "Sai do forno várias vezes ao dia, casquinha crocante e miolo macio.", preco: "", img: "pao-frances" },
  ],

  // Cardápio completo, por aba. preco vazio = "consulte".
  cardapio: [
    {
      aba: "Pães",
      itens: [
        { nome: "Pão francês", desc: "Saindo do forno várias vezes ao dia", preco: "" },
        { nome: "Pão de alho com queijo", desc: "Recheado e gratinado com batata palha", preco: "" },
        { nome: "Rosca de calabresa", desc: "Calabresa, queijo, azeitona e cebolinha", preco: "" },
        { nome: "Pão de forma caseiro", desc: "Macio, fatiado na hora", preco: "" },
        { nome: "Pão integral", desc: "Com grãos e sementes", preco: "" },
      ],
    },
    {
      aba: "Doces",
      itens: [
        { nome: "Croissant recheado", desc: "Morango e chocolate", preco: "11,99" },
        { nome: "Rabanada com cobertura", desc: "Creme maçaricado ou morango", preco: "7,00" },
        { nome: "Rabanada clássica", desc: "Açúcar e canela", preco: "" },
        { nome: "Bolo crocante", desc: "Chocolate com flocos", preco: "8,50" },
        { nome: "Banoff no pote", desc: "Doce de leite, banana e chantilly", preco: "" },
        { nome: "Delícia de uva no pote", desc: "Creme de ninho e ganache", preco: "" },
        { nome: "Rosca doce", desc: "Açúcar e canela", preco: "" },
      ],
    },
    {
      aba: "Salgados",
      itens: [
        { nome: "Enroladinho de salsicha", desc: "Massa de pão com gergelim preto", preco: "" },
        { nome: "Pão de alho com queijo", desc: "Individual", preco: "" },
        { nome: "Salgados de festa", desc: "Cento sob encomenda", preco: "" },
        { nome: "Misto quente", desc: "Na chapa, com pão francês", preco: "" },
      ],
    },
    {
      aba: "Bebidas",
      itens: [
        { nome: "Café coado", desc: "Copo pequeno ou grande", preco: "" },
        { nome: "Café com leite", desc: "Tradicional", preco: "" },
        { nome: "Achocolatado", desc: "Quente ou gelado", preco: "" },
        { nome: "Suco natural", desc: "Frutas da estação", preco: "" },
      ],
    },
  ],
};

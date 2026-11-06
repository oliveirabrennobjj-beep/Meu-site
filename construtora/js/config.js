/* =====================================================================
   DADOS DA CONSTRUTORA — edite só este arquivo.
   Campo vazio ("") = o site mostra o aviso [PREENCHER] ou esconde a parte.
   ===================================================================== */

/* Atalho para montar o link de uma foto do Unsplash em vários tamanhos.
   Troque por "assets/img/minha-foto.webp" quando tiver as fotos reais. */
function foto(id, largura) {
  return "https://images.unsplash.com/photo-" + id +
    "?auto=format&fit=crop&w=" + (largura || 1400) + "&q=72";
}

window.SITE = {
  empresa: {
    nome: "Prumo Construtora",        // nome provisório: troque pelo nome real
    cidade: "",                        // ex.: "Macaé, RJ"
    anos: "",                          // ex.: "12"
    obrasEntregues: "",                // ex.: "140"
    m2Construidos: "",                 // ex.: "38.000"
    cnpj: ""                           // ex.: "00.000.000/0001-00"
  },

  contato: {
    whatsapp: "",                      // só números com DDI e DDD, ex.: "5522999999999"
    instagram: "",                     // sem @, ex.: "prumoconstrutora"
    email: "",                         // ex.: "contato@prumo.com.br"
    endereco: "",                      // ex.: "Av. Atlântica, 1200, Centro, Macaé - RJ"
    horario: ""                        // ex.: "Seg. a sex., 8h às 18h"
  },

  /* Portfólio. categoria: "residencial" | "comercial" | "reforma"
     formato controla o tamanho na galeria: "largo", "alto" ou "normal". */
  obras: [
    {
      titulo: "Casa Lago Azul",
      categoria: "residencial",
      formato: "largo",
      local: "", area: "", prazo: "",
      fotos: [
        { src: foto("1757356657991-c3fd6e2e812e"), alt: "Casa térrea moderna com piscina iluminada ao entardecer" },
        { src: foto("1774516534049-b5b61d2275d8"), alt: "Sala de concreto aparente com janelas do piso ao teto" },
        { src: foto("1755316388093-faff473ffdfb"), alt: "Cozinha integrada com ilha de mármore" }
      ]
    },
    {
      titulo: "Edifício Vidraça",
      categoria: "comercial",
      formato: "normal",
      local: "", area: "", prazo: "",
      fotos: [
        { src: foto("1776941251083-caddb016c90f"), alt: "Prédio comercial com fachada de vidro ondulada e luzes acesas" },
        { src: foto("1783412853654-40f7abb41dea"), alt: "Fachada de vidro refletindo as nuvens" }
      ]
    },
    {
      titulo: "Residência Mirante",
      categoria: "residencial",
      formato: "normal",
      local: "", area: "", prazo: "",
      fotos: [
        { src: foto("1757359056339-22968344cce6"), alt: "Casa de alto padrão com grandes janelas iluminadas ao anoitecer" },
        { src: foto("1762545078318-8443881c2d83"), alt: "Sala com lareira e vista para a mata" }
      ]
    },
    {
      titulo: "Cozinha Jardim Europa",
      categoria: "reforma",
      formato: "normal",
      local: "", area: "", prazo: "",
      fotos: [
        { src: foto("1762529716215-afd7400d7bd4"), alt: "Cozinha branca reformada com ilha de mármore" },
        { src: foto("1682888813913-e13f18692019"), alt: "Cozinha ampla com armários brancos e bancada de mármore" }
      ]
    },
    {
      titulo: "Villa Cascata",
      categoria: "residencial",
      formato: "normal",
      local: "", area: "", prazo: "",
      fotos: [
        { src: foto("1760067537204-fe9b55b2f1b0"), alt: "Casa moderna com piscina e cascata" },
        { src: foto("1759372945658-1e9f56e751bd"), alt: "Casa com piscina cercada de vegetação ao crepúsculo" }
      ]
    },
    {
      titulo: "Apartamento Vista Verde",
      categoria: "reforma",
      formato: "normal",
      local: "", area: "", prazo: "",
      fotos: [
        { src: foto("1774199616762-31d947dc7d35"), alt: "Sala reformada com janelas amplas para o jardim" },
        { src: foto("1721222203357-098e3672276c"), alt: "Ambiente com janela grande e mesa de madeira" }
      ]
    },
    {
      titulo: "Sede Corporativa Atlântica",
      categoria: "comercial",
      formato: "largo",
      local: "", area: "", prazo: "",
      fotos: [
        { src: foto("1776941251168-e8343b30786f"), alt: "Prédio comercial com fachada de vidro e escada externa" },
        { src: foto("1787297867475-b9f644119143"), alt: "Fachada de vidro de prédio de escritórios" }
      ]
    }
  ],

  /* Depoimentos: só textos reais, com autorização do cliente. */
  depoimentos: [
    { texto: "", nome: "", cidade: "", foto: foto("1757359056339-22968344cce6", 900), alt: "Casa do cliente ao entardecer" },
    { texto: "", nome: "", cidade: "", foto: foto("1762529716215-afd7400d7bd4", 900), alt: "Cozinha reformada do cliente" },
    { texto: "", nome: "", cidade: "", foto: foto("1776941251083-caddb016c90f", 900), alt: "Prédio comercial do cliente" }
  ],

  /* Mensagem que abre no WhatsApp. {nome}, {telefone}, {tipo}, {cidade}, {mensagem} são trocados. */
  mensagemWhatsapp:
    "Olá! Vim pelo site e quero um orçamento.\n\n" +
    "Nome: {nome}\nTelefone: {telefone}\nTipo de obra: {tipo}\nCidade: {cidade}\n\n{mensagem}"
};

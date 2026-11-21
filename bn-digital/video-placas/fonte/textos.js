// TEXTOS DO VÍDEO DAS PLACAS: troque aqui e gere de novo (ver README.md).
// A locução (o que a voz fala) fica em locucao.json.
// "|" quebra a linha. *palavras* entre asteriscos ficam em itálico colorido.
window.TEXTOS = {
  marca: "BN DIGITAL",
  cidade: "Casimiro de Abreu · RJ",
  whatsapp: "(22) 99705-2912",
  instagram: "@bn_digital__sites_e_nfc",

  // gancho: cardápio de papel
  gancho: "Seu cliente ainda espera|o *cardápio* chegar?",
  cardapioPapel: [["X-Burguer", "18,00"], ["X-Salada", "20,00"], ["X-Bacon", "24,00"], ["Batata frita", "15,00"], ["Refrigerante", "6,00"]],

  // a placa de mesa
  placaSobretitulo: "BN DIGITAL",
  placaTitulo: "Placa de mesa com|*cardápio digital.*",
  restaurante: "Burgeria",
  mesa: "04",
  aproxime: "Aproxime o celular",

  // demonstração do cardápio (fotos em assets/)
  demoLegenda1: "Encostou o celular,|*o cardápio abre.*",
  demoLegenda2: "Foto e preço de|*cada prato.*",
  destaque: { foto: "hero-700", nome: "Smash duplo", preco: "R$ 34,90" },
  pratos: [
    { foto: "carvao-600", nome: "Clássico", desc: "Smash, queijo e picles", preco: "R$ 28,90" },
    { foto: "brasa-600", nome: "Cheddar bacon", desc: "Dois smash, cheddar e bacon", preco: "R$ 36,90" },
    { foto: "fumo-600", nome: "Crispy onion", desc: "Cebola crocante e cheddar", preco: "R$ 32,90" },
    { foto: "g-triplo-840", nome: "Smash triplo", desc: "Três carnes e muito queijo", preco: "R$ 42,90" },
  ],

  // vantagens
  vantagem1: "Sem esperar|*o garçom.*",
  vantagem2: "Sem baixar|*aplicativo.*",
  atualizaTitulo: "Mudou o preço?|Chegou *produto novo?*",
  atualizaSub: "A gente atualiza pra você.|Sem reimprimir nada.",
  precoAntes: "R$ 34,90",
  precoDepois: "R$ 36,90",
  produtoNovo: { foto: "cinza-600", nome: "Burger da casa", preco: "R$ 38,90" },
  avisoAtualizado: "Cardápio atualizado",

  // uma cena por placa
  wifi: { nome: "Wi-Fi", titulo: "Wi-Fi sem|*ditar senha.*", sub: "Encostou, conectou.", rede: "Burgeria Clientes" },
  pix: { nome: "Pix", titulo: "Pix sem|*ditar chave.*", sub: "A chave aparece pronta pra copiar.", chave: "pix@seunegocio.com.br" },
  insta: { nome: "Instagram", titulo: "Mais|*seguidores.*", sub: "O perfil abre, o cliente segue.", perfil: "burgeria", seguidores: 2430 },
  whats: { nome: "WhatsApp", titulo: "Conversa|*direto com você.*", sub: "Pedido, reserva ou dúvida.", msg: "Olá! Vim pela placa da mesa 04. Quero fazer um pedido.", resposta: "Oi! Pode mandar o seu pedido." },
  google: { nome: "Google", titulo: "Mais avaliações|*no Google.*", sub: "A avaliação abre com um toque." },

  // outras placas (6)
  outrasTitulo: "Tem placa|*pra tudo.*",
  outras: [
    ["Localização", "Abre o mapa até você"],
    ["Site", "Abre o seu site"],
    ["TikTok", "Abre o seu perfil"],
    ["Facebook", "Abre a sua página"],
    ["Contato", "Salva o seu número"],
    ["Qualquer link", "Promoção, delivery, o que quiser"],
  ],

  // placa personalizada (3 exemplos de marca fictícios)
  personalizadaTitulo: "Com a cor, a logo e|a *cara do seu negócio.*",
  personalizadaEtapas: ["Cor", "Logo", "Identidade"],
  marcas: [
    { nome: "Burgeria", letra: "B", fundo: "linear-gradient(160deg,#23272f,#07080b)", destaque: "#ff8a1f", texto: "#ffffff" },
    { nome: "Navalha", letra: "N", fundo: "linear-gradient(160deg,#1d1a14,#0a0907)", destaque: "#d4a94e", texto: "#f3e6c8" },
    { nome: "Açaí da Orla", letra: "A", fundo: "linear-gradient(160deg,#7c3aed,#3b0f80)", destaque: "#f2e33b", texto: "#ffffff" },
  ],

  // valor
  valor1: "Pode parecer só|uma *plaquinha.*",
  valor2: "Ela trabalha pra você|*o dia inteiro.*",
  valorChip: "Manutenção por nossa conta",

  // prova e chamada final
  provaTitulo: "Feitas pela BN Digital,|*aqui em Casimiro.*",
  finalPre: "Placas personalizadas para o seu negócio.",
  finalChamada: "Quer as placas no|seu *negócio?*",
  botao: "Pedir orçamento",
};

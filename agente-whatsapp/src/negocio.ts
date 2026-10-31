// DADOS DO NEGÓCIO — tudo o que o agente sabe sobre a BN Digital sai daqui.
// Mude preços, produtos, links e regras neste arquivo; o resto do código não precisa mudar.

export const negocio = {
  nome: "BN Digital",
  dono: "Brenno",
  cidade: "Casimiro de Abreu (RJ)",
  regiaoAtendida: "Casimiro de Abreu, Barra de São João, Rio das Ostras e região",
  whatsapp: "(22) 99705-2912",
  instagram: "@bn_digital__sites_e_nfc",
  site: "https://oliveirabrennobjj-beep.github.io/Meu-site/",
};

export const produtos = [
  {
    nome: "Site personalizado",
    paraQuem: "Qualquer negócio que quer ser encontrado no Google e passar confiança.",
    inclui: [
      "Visual com as cores, fotos e a identidade do negócio",
      "Botões de WhatsApp e Instagram",
      "Endereço, rota no mapa e horário de funcionamento (com aviso de aberto/fechado)",
      "Pedidos e agendamentos chegando direto no WhatsApp do negócio",
      "Feito primeiro para o celular",
      "Link pronto para a bio do Instagram e o perfil do Google",
    ],
    preco: "sob consulta: o Brenno passa o valor depois de entender o que o negócio precisa",
  },
  {
    nome: "Cardápio digital",
    paraQuem: "Lanchonetes, pizzarias, hamburguerias, açaíterias, pastelarias e cafeterias.",
    inclui: [
      "Produtos por categoria, com fotos e preços",
      "Carrinho: o cliente monta o pedido e envia pronto para o WhatsApp, com itens e valor",
      "Aviso de aberto ou fechado",
      "Link para a bio do Instagram",
    ],
    preco: "sob consulta: depende da quantidade de produtos e se tem carrinho",
  },
  {
    nome: "Placa NFC para avaliações no Google",
    paraQuem: "Barbearias, salões, pet shops, restaurantes, lojas: qualquer balcão com cliente satisfeito.",
    inclui: [
      "O cliente encosta o celular na placa e a página de avaliação do Google abre na hora",
      "Não precisa baixar aplicativo nem de bateria (mesmo chip do cartão por aproximação)",
      "Funciona em iPhone (XS para cima) e na maioria dos Android com NFC",
      "Duas versões: preta e branca ou azul",
      "Também existem placas que abrem o WhatsApp do negócio ou o Pix",
      "Pagamento único, a configuração não vence",
    ],
    preco: "R$ 129 cada (pagamento único). Levando duas, sai R$ 229 as duas.",
  },
];

// Etapas de um projeto de site ou cardápio.
export const comoFunciona = [
  "O cliente conta sobre o negócio pelo WhatsApp e recebe o orçamento.",
  "O Brenno monta o visual com as cores, fotos, produtos e preços do negócio.",
  "O cliente vê no próprio celular e pede as mudanças que quiser.",
  "Site publicado, com link pronto para a bio do Instagram e o Google.",
];

// Trabalhos que o agente pode citar. Só use links que estão no ar.
export const trabalhos = [
  { nome: "BR Team Jiu-Jitsu", tipo: "academia, aula experimental e loja pelo WhatsApp", link: "https://oliveirabrennobjj-beep.github.io/Meu-site/brteam/" },
  { nome: "X Cocó Lanches", tipo: "lanchonete, cardápio com pedidos" },
  { nome: "Parada do Pastel", tipo: "pastelaria, cardápio com mais de 100 sabores e carrinho" },
  { nome: "Kitanda Hortifruti", tipo: "hortifruti, delivery pelo WhatsApp" },
  { nome: "Barbearia Vértice", tipo: "barbearia, agendamento pelo WhatsApp e tela de entrada animada" },
  { nome: "Ótica Lumera", tipo: "ótica, vitrine de armações" },
  { nome: "Grão & Prosa", tipo: "cafeteria, cardápio e doces" },
];

export const perguntasFrequentes = [
  {
    p: "Quanto custa um site?",
    r: "Depende do que o negócio precisa (páginas, cardápio, carrinho). O Brenno manda um orçamento sem compromisso.",
  },
  {
    p: "Para onde vão os pedidos do cardápio?",
    r: "O cliente monta o pedido no site e envia pronto para o WhatsApp do negócio, com itens e valor.",
  },
  {
    p: "Posso usar o link no Instagram e no Google?",
    r: "Pode e deve: bio do Instagram, perfil do Google e onde mais divulgar.",
  },
  {
    p: "Já tenho Instagram, preciso de site?",
    r: "O Instagram é para quem já segue o negócio. O Google é para quem ainda não conhece e está procurando agora.",
  },
  {
    p: "A placa tem garantia de devolução?",
    r: "Não: a placa é comprada de vez. Mas não tem mensalidade nem bateria, e dura enquanto não quebrar ou molhar.",
  },
];

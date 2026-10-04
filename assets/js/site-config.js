/*
 * Dados editáveis da Barber Club.
 *
 * Este é o único arquivo que precisa mudar para atualizar contatos, serviços,
 * fotos, horários, endereço e avaliações. O restante do site lê tudo daqui.
 *
 * Regras usadas no site:
 * - Campos vazios ("", null ou []) não aparecem para o visitante.
 * - Nada marcado como "pendente" é exibido como se estivesse confirmado.
 */
window.BARBER_CLUB = {
  nome: "Barber Club",
  cidade: "Casimiro de Abreu",
  uf: "RJ",
  desde: 2019,

  contato: {
    // Telefone exibido no Instagram/Google. Não é tratado como WhatsApp.
    telefone: {
      exibicao: "(31) 99780-3143",
      link: "+5531997803143",
    },

    // PENDENTE: número de WhatsApp para agendamento, só dígitos com DDI e DDD
    // (ex.: "5522999999999"). Enquanto estiver vazio, os botões de agendamento
    // levam à seção de contato e oferecem o Instagram.
    whatsappAgendamento: "",

    // {servico} é trocado pelo serviço escolhido pelo visitante.
    mensagemAgendamento: "Olá, Barber Club! Gostaria de consultar um horário para {servico}.",
    servicoGenerico: "um atendimento",

    instagram: {
      usuario: "barber_club.oficial_",
      url: "https://www.instagram.com/barber_club.oficial_/",
    },
    linkBio: "https://linktr.ee/barber_club_123",
  },

  endereco: {
    // PENDENTE: mude para true só depois de conferir o endereço com a barbearia.
    confirmado: false,
    // Endereço definitivo, exibido quando confirmado = true.
    texto: "",
    // Texto que aparece na captura do Google. Fica guardado apenas como referência
    // e NÃO é exibido no site.
    referenciaDaCaptura:
      "Rua pastor Luiz Laurentino da Silva, R. Rodolfo Motta, Casimiro de Abreu - RJ, 28860-000",
    // URL de incorporação do Google Maps (Compartilhar > Incorporar um mapa > src).
    mapaEmbedUrl: "",
    // Destino do botão "Como chegar": link do Google Maps do local confirmado.
    rotaUrl: "",
  },

  // PENDENTE: horários completos. Exemplo:
  // [{ dias: "Terça a sexta", horas: "9h às 19h" }, { dias: "Sábado", horas: "8h às 17h" }]
  horarios: [],

  google: {
    nota: 4.9,
    totalAvaliacoes: 33,
    // Quando os números foram vistos no perfil. O site não atualiza sozinho.
    registradoEm: "outubro de 2026",
    // PENDENTE: link do perfil da Barber Club no Google.
    perfilUrl: "",
  },

  // Depoimentos reais, copiados exatamente como aparecem no Google.
  // Formato: { nome: "Nome exibido", texto: "Texto do depoimento", nota: 5 }
  avaliacoes: [],

  // preco e duracao são opcionais: só aparecem quando preenchidos.
  // Exemplo: preco: "R$ 00,00", duracao: "30 min"
  servicos: [
    {
      id: "corte",
      nome: "Corte de cabelo",
      descricao: "Corte masculino para quem quer manter o visual em dia, do clássico ao mais atual.",
      mensagem: "um corte de cabelo",
      preco: "",
      duracao: "",
    },
    {
      id: "barba",
      nome: "Barba",
      descricao: "Aparo e acabamento da barba para completar o visual.",
      mensagem: "fazer a barba",
      preco: "",
      duracao: "",
    },
    {
      id: "infantil",
      nome: "Corte infantil",
      descricao: "Corte de cabelo para as crianças da família.",
      mensagem: "um corte infantil",
      preco: "",
      duracao: "",
    },
  ],

  // Fotos originais. Coloque os arquivos em assets/img/ e preencha "src".
  // Enquanto "src" estiver vazio, o site mostra um espaço reservado.
  imagens: {
    // Logo em boa resolução (SVG ou PNG transparente). Vazio = nome em texto.
    logo: "",
    hero: {
      src: "",
      alt: "Interior da Barber Club em Casimiro de Abreu",
      reservado: "Foto principal do salão",
    },
    espaco: [
      { src: "", alt: "", reservado: "Fachada" },
      { src: "", alt: "", reservado: "Cadeiras e bancada" },
      { src: "", alt: "", reservado: "Detalhes do ambiente" },
    ],
    resultados: [
      { src: "", alt: "", reservado: "Corte" },
      { src: "", alt: "", reservado: "Barba" },
      { src: "", alt: "", reservado: "Corte infantil" },
      { src: "", alt: "", reservado: "Corte" },
      { src: "", alt: "", reservado: "Acabamento" },
      { src: "", alt: "", reservado: "Corte" },
    ],
  },
};

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
    // Confirmado pelo responsável a partir do Street View e do perfil no Google.
    // O número 957 vem do Street View, que é aproximado: confira na fachada.
    confirmado: true,
    texto: "R. Pastor Luís Laurentino da Silva, 957, Casimiro de Abreu, RJ, 28860-000",
    // Mapa incorporado, buscando pelo nome do lugar no Google Maps. Para fixar o ponto
    // exato, troque pelo "src" de Google Maps > Compartilhar > Incorporar um mapa.
    mapaEmbedUrl:
      "https://www.google.com/maps?q=Barber+Club+-+Rua+pastor+Luiz+Laurentino+da+Silva%2C+R.+Rodolfo+Motta%2C+Casimiro+de+Abreu+-+RJ&output=embed",
    // Destino do botão "Como chegar": perfil da Barber Club no Google Maps.
    rotaUrl: "https://maps.app.goo.gl/kbnvWGg5mPYj4y746",
  },

  // PENDENTE: horários completos (o perfil do Google mostra só "abre seg. às 08:00").
  // Exemplo: [{ dias: "Segunda a sexta", horas: "8h às 19h" }, { dias: "Sábado", horas: "8h às 17h" }]
  horarios: [],

  google: {
    nota: 4.9,
    totalAvaliacoes: 33,
    // Quando os números foram vistos no perfil. O site não atualiza sozinho.
    registradoEm: "outubro de 2026",
    perfilUrl: "https://maps.app.goo.gl/kbnvWGg5mPYj4y746",
  },

  // Depoimentos reais, copiados exatamente como aparecem no Google.
  // Formato: { nome: "Nome exibido", texto: "Texto do depoimento", nota: 5 }
  avaliacoes: [
    {
      nome: "Marcos Cesar",
      texto: "Espaço incrível com profissionais super qualificados e um tratamento nota 1000 !! Recomendo e sou cliente constante",
      nota: 5,
    },
    {
      nome: "Jim Torres",
      texto: "Melhor barbearia da cidade, qualidade e talento no atendimento.",
      nota: 5,
    },
  ],

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

  // Fotos. Coloque os arquivos em assets/img/ e preencha "src".
  // "srcset" é opcional (versões menores para celular).
  // Enquanto "src" estiver vazio, o site mostra um espaço reservado.
  imagens: {
    // Logo recortada da foto de perfil do Instagram. Troque pelo arquivo original
    // em alta resolução (SVG ou PNG transparente) quando tiver.
    logo: "assets/img/logo-barber-club.webp",
    // Fundo da seção principal.
    hero: {
      src: "assets/img/barba-navalha-1122.webp",
      srcset: "assets/img/barba-navalha-640.webp 640w, assets/img/barba-navalha-1122.webp 1122w",
      alt: "",
      posicao: "50% 38%",
    },
    // Foto da seção "Nosso espaço".
    sobre: {
      src: "assets/img/barbeiro-1122.webp",
      srcset: "assets/img/barbeiro-640.webp 640w, assets/img/barbeiro-1122.webp 1122w",
      alt: "Barbeiro de avental de couro apoiado no encosto de uma cadeira de barbearia",
      reservado: "Foto do espaço",
    },
    // Fotos extras de "Nosso espaço": toque para ampliar.
    espaco: [
      {
        src: "assets/img/barbeiro-tesoura-1122.webp",
        srcset: "assets/img/barbeiro-tesoura-640.webp 640w, assets/img/barbeiro-tesoura-1122.webp 1122w",
        alt: "Barbeiro de avental de couro segurando tesoura e pente",
      },
      {
        src: "assets/img/barbeiro-maquinas-1122.webp",
        srcset: "assets/img/barbeiro-maquinas-640.webp 640w, assets/img/barbeiro-maquinas-1122.webp 1122w",
        alt: "Barbeiro de óculos com os braços cruzados segurando duas máquinas de corte",
      },
    ],
    // Galeria "Cortes recentes": toque para ampliar.
    resultados: [
      {
        src: "assets/img/corte-degrade-1122.webp",
        srcset: "assets/img/corte-degrade-640.webp 640w, assets/img/corte-degrade-1122.webp 1122w",
        alt: "Degradê sendo acertado com máquina e pente na lateral da cabeça",
      },
      {
        src: "assets/img/barba-navalha-1122.webp",
        srcset: "assets/img/barba-navalha-640.webp 640w, assets/img/barba-navalha-1122.webp 1122w",
        alt: "Barba sendo feita com navalha e espuma",
      },
    ],
  },
};

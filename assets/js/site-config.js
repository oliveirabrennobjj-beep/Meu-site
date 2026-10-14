/*
 * Dados editáveis da Barbearia Vértice.
 *
 * Este é o único arquivo que precisa mudar para atualizar contatos, serviços,
 * fotos, horários, endereço e avaliações. O restante do site lê tudo daqui.
 *
 * Regras usadas no site:
 * - Campos vazios ("", null ou []) não aparecem para o visitante.
 * - Nada marcado como "pendente" é exibido como se estivesse confirmado.
 */
window.BARBER_CLUB = {
  nome: "Barbearia Vértice",
  cidade: "Casimiro de Abreu",
  uf: "RJ",
  desde: 2019,

  contato: {
    // Telefone exibido no Instagram/Google. Não é tratado como WhatsApp.
    // PENDENTE: telefone da barbearia. Ex.: { exibicao: "(22) 99999-9999", link: "+5522999999999" }
    telefone: null,

    // PENDENTE: número de WhatsApp para agendamento, só dígitos com DDI e DDD
    // (ex.: "5522999999999"). Enquanto estiver vazio, os botões de agendamento
    // levam à seção de contato e oferecem o Instagram.
    whatsappAgendamento: "",

    // {servico} é trocado pelo serviço escolhido pelo visitante.
    mensagemAgendamento: "Olá, Barbearia Vértice! Gostaria de consultar um horário para {servico}.",
    servicoGenerico: "um atendimento",

    // PENDENTE: Instagram da barbearia. Ex.: { usuario: "perfil", url: "https://www.instagram.com/perfil/" }
    instagram: null,
    linkBio: "",
  },

  endereco: {
    // PENDENTE: mude para true só depois de conferir o endereço com a barbearia.
    confirmado: false,
    // Endereço definitivo, exibido quando confirmado = true.
    texto: "",
    // URL de incorporação do Google Maps (Compartilhar > Incorporar um mapa > src).
    mapaEmbedUrl: "",
    // Destino do botão "Como chegar": link do Google Maps do local confirmado.
    rotaUrl: "",
  },

  // PENDENTE: horários completos. Exemplo:
  // [{ dias: "Terça a sexta", horas: "9h às 19h" }, { dias: "Sábado", horas: "8h às 17h" }]
  horarios: [],

  google: {
    // PENDENTE: preencha com os números reais do perfil no Google (ex.: nota: 4.9, totalAvaliacoes: 33).
    // Enquanto nota estiver vazia, a seção de avaliações não aparece.
    nota: null,
    totalAvaliacoes: null,
    // Quando os números foram vistos no perfil. O site não atualiza sozinho.
    registradoEm: "",
    // PENDENTE: link do perfil da barbearia no Google.
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

  // Fotos. Coloque os arquivos em assets/img/ e preencha "src".
  // "srcset" é opcional (versões menores para celular).
  // Enquanto "src" estiver vazio, o site mostra um espaço reservado.
  imagens: {
    // Logo em boa resolução (SVG ou PNG transparente). Vazio = nome em texto.
    logo: "",
    // Fundo da seção principal.
    hero: {
      src: "assets/img/corte-reflexo-1122.webp",
      srcset: "assets/img/corte-reflexo-640.webp 640w, assets/img/corte-reflexo-1122.webp 1122w",
      alt: "",
      posicao: "45% 32%",
    },
    // Foto da seção "Nosso espaço".
    sobre: {
      src: "assets/img/barbeiro-1122.webp",
      srcset: "assets/img/barbeiro-640.webp 640w, assets/img/barbeiro-1122.webp 1122w",
      alt: "Barbeiro de avental de couro apoiado no encosto de uma cadeira de barbearia",
      reservado: "Foto do espaço",
    },
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

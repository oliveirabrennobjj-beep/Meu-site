/*
  DADOS DA ACADEMIA — quase tudo que muda no site está aqui.
  Preços e horários com valor `null` aparecem como "A confirmar" no site.
  Quando tiver os valores, troque `null` pelo texto (ex.: "R$ 120").
*/

export const academia = {
  nome: "BR Team",
  nomeCompleto: "BR Team Brazilian Jiu-Jitsu",
  desde: 2018,
  lema: "Jiu-Jitsu como filosofia de vida.",
  pilares: ["Corpo", "Mente", "Alma"],
  cidade: "Casimiro de Abreu (RJ)",
};

export const contato = {
  whatsapp: "5522999968108",
  whatsappExibicao: "(22) 99996-8108",
  mensagemPadrao: "Olá, BR Team! Quero agendar uma aula experimental de Jiu-Jitsu.",
  instagramAcademia: "brteambjj",
  instagramProfessor: "bjjbrunoramos",
  linktree: "https://linktr.ee/brteamjiu",
};

export const endereco = {
  rua: "Rua Pastor Luiz Laurentino, 886",
  bairro: "Santa Ely",
  cidade: "Casimiro de Abreu – RJ",
  cep: "28860-000",
};

export const enderecoCompleto = `${endereco.rua}, ${endereco.bairro}, ${endereco.cidade}, ${endereco.cep}`;
export const mapaEmbed = `https://maps.google.com/maps?q=${encodeURIComponent(enderecoCompleto)}&output=embed`;
export const mapaRota = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(enderecoCompleto)}`;

export function linkWhatsApp(mensagem: string = contato.mensagemPadrao) {
  return `https://wa.me/${contato.whatsapp}?text=${encodeURIComponent(mensagem)}`;
}
export const instagram = (usuario: string) => `https://instagram.com/${usuario}`;

/* Grade de horários. `horario: null` aparece como "A confirmar". */
export type Turma = { turma: string; publico: string; dias: string | null; horario: string | null };
export const horarios: Turma[] = [
  { turma: "Kids I", publico: "Crianças menores", dias: null, horario: null },
  { turma: "Kids II", publico: "Crianças maiores", dias: null, horario: null },
  { turma: "Juvenil", publico: "Adolescentes", dias: null, horario: null },
  { turma: "Adulto", publico: "A partir de 16 anos", dias: null, horario: null },
];

/* Mensalidades. `preco: null` aparece como "A confirmar". */
export type Plano = { nome: string; para: string; preco: string | null; periodo: string; inclui: string[]; destaque?: boolean };
export const planos: Plano[] = [
  {
    nome: "Kids",
    para: "Turmas infantis",
    preco: null,
    periodo: "por mês",
    inclui: ["Aulas da turma da idade", "Acompanhamento de graus e faixas", "Participação nas colações de grau"],
  },
  {
    nome: "Adulto",
    para: "Treino completo",
    preco: null,
    periodo: "por mês",
    inclui: ["Aulas de Jiu-Jitsu com kimono", "Preparação para campeonatos", "Acompanhamento de graus e faixas"],
    destaque: true,
  },
  {
    nome: "Família",
    para: "Irmãos ou pais e filhos",
    preco: null,
    periodo: "por mês",
    inclui: ["Condição para mais de um aluno da mesma família", "Cada um treina na sua turma"],
  },
];

/*
  Troca de faixa. Cada faixa tem as cores do desenho (cor da faixa e da ponteira).
  Faixas infantis: um preço único para todas. Faixas adultas: um preço por faixa.
*/
export type Faixa = { nome: string; cor: string; ponteira: string; texto?: "claro" | "escuro" };
export const trocaDeFaixa = {
  infantil: {
    titulo: "Faixas infantis",
    descricao: "Da branca à verde, incluindo as variações com branco e preto. O valor é o mesmo para todas.",
    preco: null as string | null,
    faixas: [
      { nome: "Branca", cor: "#f2f2f0", ponteira: "#111111", texto: "escuro" },
      { nome: "Cinza", cor: "#8d8f93", ponteira: "#111111" },
      { nome: "Amarela", cor: "#f2c21b", ponteira: "#111111", texto: "escuro" },
      { nome: "Laranja", cor: "#ec7a1c", ponteira: "#111111" },
      { nome: "Verde", cor: "#1f8a4c", ponteira: "#111111" },
    ] as Faixa[],
  },
  adulto: {
    titulo: "Faixas adultas",
    descricao: "A partir dos 16 anos. Cada faixa tem o seu valor.",
    faixas: [
      { nome: "Azul", cor: "#1d4fb8", ponteira: "#111111", preco: null },
      { nome: "Roxa", cor: "#5b2a86", ponteira: "#111111", preco: null },
      { nome: "Marrom", cor: "#5a3a22", ponteira: "#111111", preco: null },
      { nome: "Preta", cor: "#0a0a0a", ponteira: "#d6202b", preco: null },
    ] as (Faixa & { preco: string | null })[],
  },
};

export const parceiros = [
  { nome: "Patropi", ramo: "Lanchonete, hotel e churrascaria" },
  { nome: "Patropi Garage Training", ramo: "Treinamento" },
  { nome: "RG Estúdio", ramo: "Comunicação e assessoria esportiva" },
  { nome: "Zé Bigode", ramo: "Barba, cabelo e estilo" },
  { nome: "Vesúvio", ramo: "Hamburgueria artesanal" },
];

export const fotos = {
  hero: { src: "./fotos/turma-kids.webp", alt: "Turma infantil da BR Team, de kimono, sorrindo no tatame da academia", w: 1080, h: 702 },
  professor: { src: "./fotos/professor-bruno.webp", alt: "Professor Bruno Ramos, de kimono branco e faixa preta, de braços cruzados", w: 550, h: 981 },
  professorFilha: { src: "./fotos/bruno-e-marina.webp", alt: "Bruno Ramos ajoelhado no tatame ao lado da filha Marina, os dois de kimono", w: 356, h: 418 },
  cumprimento: { src: "./fotos/professor-cumprimento.webp", alt: "Professor Bruno cumprimentando o tatame com uma reverência", w: 300, h: 457 },
  kids: [
    { src: "./fotos/aluno-faixa-branca.webp", alt: "Aluno faixa branca em posição de guarda, sorrindo", w: 440, h: 955 },
    { src: "./fotos/treino-meninas.webp", alt: "Duas alunas treinando uma posição de guarda", w: 429, h: 450 },
    { src: "./fotos/amigos-kids.webp", alt: "Dois alunos abraçados, de kimono preto e faixa cinza", w: 300, h: 368 },
  ],
  galeria: [
    { src: "./fotos/podio-rio-winter-open.webp", alt: "Alunos no pódio do Rio Winter International Open 2026 da IBJJF", legenda: "Rio Winter International Open 2026 (IBJJF)", w: 356, h: 474 },
    { src: "./fotos/troca-de-faixa-kids-ii.webp", alt: "Colação de grau e troca de faixa da Turma Kids II", legenda: "Troca de faixa, Turma Kids II", w: 356, h: 474 },
    { src: "./fotos/graduacao-adultos.webp", alt: "Alunos adultos de kimono branco na graduação, com certificado", legenda: "Graduação dos adultos", w: 356, h: 417 },
    { src: "./fotos/competicao.webp", alt: "Professor Bruno na arquibancada de um campeonato", legenda: "Dia de campeonato", w: 356, h: 473 },
    { src: "./fotos/troca-de-faixa-turma.webp", alt: "Colação de grau e troca de faixa de uma turma infantil", legenda: "Colação de grau", w: 355, h: 474 },
    { src: "./fotos/turma-tatame.webp", alt: "Turma infantil reunida no tatame com o professor", legenda: "Turma no tatame", w: 356, h: 418 },
    { src: "./fotos/turma-geral.webp", alt: "Todas as turmas reunidas no tatame", legenda: "A família BR Team", w: 356, h: 417 },
  ],
};

/*
  Turma indicada no formulário de aula experimental, pela idade do aluno.
  As idades de corte são uma sugestão: ajuste quando a academia confirmar.
*/
export const faixasEtarias = [
  { ate: 12, turma: "Kids", detalhe: "O professor indica Kids I ou Kids II pela idade e pela experiência." },
  { ate: 15, turma: "Juvenil", detalhe: "Turma para adolescentes, com treino na medida da idade." },
  { ate: 120, turma: "Adulto", detalhe: "Treino completo, do básico à preparação para campeonatos." },
];
export function turmaPorIdade(idade: number) {
  return faixasEtarias.find((f) => idade <= f.ate) ?? faixasEtarias[faixasEtarias.length - 1];
}

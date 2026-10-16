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
  idadeMinima: 4,
  comodidades: ["Aceitamos Pix", "Estacionamento", "Estacionamento na rua"],
};

export const professor = { anosComoProfessor: 6, anosNoJiuJitsu: 15 };

export const contato = {
  whatsapp: "5522999968108",
  whatsappExibicao: "(22) 99996-8108",
  mensagemPadrao: "Olá, BR Team! Quero agendar uma aula experimental de Jiu-Jitsu.",
  instagramAcademia: "brteambjj",
  instagramProfessor: "bjjbrunoramos",
  linktree: "https://linktr.ee/brteamjiu",
  email: "brunoramosjiujitsu13@gmail.com",
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

/*
  Grade de horários (informada pela academia).
  Adulto: 6h, 13h e 20h. Kids: 18h e 19h.
  `diasDeAula: null` aparece como "A confirmar"; troque pelo texto (ex.: "Segunda a sexta").
*/
export type TurmaChave = "Kids" | "Adulto";
export type Aula = { turma: TurmaChave; nome: string; horario: string; periodo: "Manhã" | "Tarde" | "Noite" };
export const diasDeAula: string | null = null;
export const aulas: Aula[] = [
  { turma: "Adulto", nome: "Adulto", horario: "6h às 7h", periodo: "Manhã" },
  { turma: "Adulto", nome: "Adulto", horario: "13h às 14h", periodo: "Tarde" },
  { turma: "Kids", nome: "Kids I", horario: "18h às 19h", periodo: "Noite" },
  { turma: "Kids", nome: "Kids II", horario: "19h às 20h", periodo: "Noite" },
  { turma: "Adulto", nome: "Adulto", horario: "20h às 21h", periodo: "Noite" },
];
export const aulasDaTurma = (t: TurmaChave) => aulas.filter((a) => a.turma === t);
export const rotuloAula = (a: Aula) => `${a.nome}, ${a.horario}`;

/*
  Mensalidade: um valor só para todo mundo (crianças, adultos, mulheres e melhor idade).
  Para mudar o preço, troque `mensalidade.valor`.
*/
export const mensalidade = { valor: "R$ 125", periodo: "por mês" };

export type Plano = { nome: string; para: string; preco: string | null; periodo: string; inclui: string[]; destaque?: boolean };
export const planos: Plano[] = [
  {
    nome: "Crianças",
    para: "Turmas Kids I e Kids II",
    preco: mensalidade.valor,
    periodo: mensalidade.periodo,
    inclui: ["Aulas na turma da idade", "Acompanhamento de graus e faixas", "Participação nas colações de grau"],
  },
  {
    nome: "Adultos",
    para: "Adolescentes e adultos, do iniciante ao graduado",
    preco: mensalidade.valor,
    periodo: mensalidade.periodo,
    inclui: ["Aulas de Jiu-Jitsu com kimono", "Preparação para campeonatos", "Acompanhamento de graus e faixas"],
    destaque: true,
  },
  {
    nome: "Mulheres e melhor idade",
    para: "Treino no seu ritmo",
    preco: mensalidade.valor,
    periodo: mensalidade.periodo,
    inclui: ["Mesmo valor de todos os alunos", "Treino adaptado ao seu ritmo pelo professor", "Acompanhamento de graus e faixas"],
  },
];

/*
  Troca de faixa: tabela de preços da branca até a preta, separada para crianças e adultos.
  Preço `null` aparece como "A confirmar". Para preencher, troque por texto, ex.: "R$ 80".
  Idades mínimas conforme a tabela de graduação da IBJJF.
  Nas faixas infantis (menos a branca) existem 3 versões: com branco, pura e com preto;
  as três têm o mesmo valor da cor.
*/
export type Faixa = { nome: string; cor: string; ponteira: string; idade: string; preco: string | null; variacoes?: boolean };
export const trocaDeFaixa = {
  infantil: {
    titulo: "Faixas infantis",
    descricao: "De 4 a 15 anos. Cinza, amarela, laranja e verde têm três versões: com branco, pura e com preto.",
    faixas: [
      { nome: "Branca", cor: "#f2f2f0", ponteira: "#111111", idade: "a partir de 4 anos", preco: null },
      { nome: "Cinza", cor: "#8d8f93", ponteira: "#111111", idade: "4 a 15 anos", preco: null, variacoes: true },
      { nome: "Amarela", cor: "#f2c21b", ponteira: "#111111", idade: "7 a 15 anos", preco: null, variacoes: true },
      { nome: "Laranja", cor: "#ec7a1c", ponteira: "#111111", idade: "10 a 15 anos", preco: null, variacoes: true },
      { nome: "Verde", cor: "#1f8a4c", ponteira: "#111111", idade: "13 a 15 anos", preco: null, variacoes: true },
    ] as Faixa[],
  },
  adulto: {
    titulo: "Faixas adultas",
    descricao: "A partir de 16 anos: branca, azul, roxa, marrom e preta. Cada faixa tem o seu valor.",
    faixas: [
      { nome: "Branca", cor: "#f2f2f0", ponteira: "#111111", idade: "a partir de 16 anos", preco: null },
      { nome: "Azul", cor: "#1d4fb8", ponteira: "#111111", idade: "a partir de 16 anos", preco: null },
      { nome: "Roxa", cor: "#5b2a86", ponteira: "#111111", idade: "a partir de 16 anos", preco: null },
      { nome: "Marrom", cor: "#5a3a22", ponteira: "#111111", idade: "a partir de 18 anos", preco: null },
      { nome: "Preta", cor: "#0a0a0a", ponteira: "#d6202b", idade: "a partir de 19 anos", preco: null },
    ] as Faixa[],
  },
};

/*
  Loja: encomenda de kimono com o professor. O pedido chega no WhatsApp da academia
  com nome, idade e horário do aluno; o professor cuida do tamanho.
  `preco: null` aparece como "Consulte".
*/
export const loja = {
  cores: ["Branco", "Preto", "Azul"],
  produtos: {
    infantil: { nome: "Kimono infantil", preco: null as string | null },
    adulto: { nome: "Kimono adulto", preco: null as string | null },
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
  espaco: { src: "./fotos/espaco-tatame.webp", alt: "O tatame da BR Team: salão branco com a bandeira do Brasil, diplomas na parede e o quadro com a marca da academia", w: 904, h: 236 },
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
  Turma indicada pela idade (formulário de aula experimental e loja).
  Ajuste `ate` se a idade de corte das turmas Kids for outra.
*/
export const faixasEtarias: { ate: number; turma: TurmaChave; detalhe: string }[] = [
  { ate: 12, turma: "Kids", detalhe: "Crianças a partir de 4 anos, turmas às 18h e às 19h. O professor indica Kids I ou Kids II pela idade." },
  { ate: 120, turma: "Adulto", detalhe: "Turmas às 6h, às 13h e às 20h. Escolha o horário que encaixa na sua rotina." },
];
export function turmaPorIdade(idade: number) {
  return faixasEtarias.find((f) => idade <= f.ate) ?? faixasEtarias[faixasEtarias.length - 1];
}

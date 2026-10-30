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
  idadeMinima: 5,
  comodidades: ["Aceitamos Pix", "Lugar para bicicletas"],
};

export const professor = { anosComoProfessor: 6, anosNoJiuJitsu: 15 };

/* Aula experimental: grátis, uma semana de aulas (o pai e o professor veem se a criança gostou). */
export const experimental = { aulas: 3, resumo: "uma semana, com 3 aulas" };

export const contato = {
  whatsapp: "5522999968108",
  whatsappExibicao: "(22) 99996-8108",
  mensagemPadrao: "Olá, BR Team! Quero agendar a semana de aula experimental grátis de Jiu-Jitsu.",
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
/*
  Posição da academia (em frente à fachada, tirada do pino que a academia compartilhou no Google Maps).
  A BR Team ainda não tem cadastro no Google, então pelo nome ela não aparece; o mapa e a rota usam estas coordenadas.
*/
export const coordenadas = { lat: -22.4887943, lng: -42.2023354 };
export const mapaEmbed = `https://maps.google.com/maps?q=${coordenadas.lat},${coordenadas.lng}&z=18&hl=pt-BR&output=embed`;
/** Pino da academia no Google Maps (link de compartilhar do próprio Maps). */
export const mapaBusca = "https://maps.app.goo.gl/BvQoizGjWBc1fTGF9";
export const mapaRota = `https://www.google.com/maps/dir/?api=1&destination=${coordenadas.lat},${coordenadas.lng}`;

export function linkWhatsApp(mensagem: string = contato.mensagemPadrao) {
  return `https://wa.me/${contato.whatsapp}?text=${encodeURIComponent(mensagem)}`;
}
export const instagram = (usuario: string) => `https://instagram.com/${usuario}`;

/*
  Preço da troca de faixa e do kimono: não fica no site. O botão abre o WhatsApp do professor Bruno com a
  mensagem já escrita, dizendo o que a pessoa quer; dali a conversa continua com ele.
*/
export const mensagemPreco = {
  // a branca é a primeira faixa (não é troca): "preço da faixa branca"
  faixa: (faixa: string, infantil: boolean) =>
    `Olá, professor Bruno! Vim pelo site da BR Team e quero saber o preço ${faixa === "Branca" ? "da faixa branca" : `da troca para a faixa ${faixa.toLowerCase()}`}${infantil ? " do meu filho(a)" : ""}.`,
  duvidaTroca: "Olá, professor Bruno! Vim pelo site da BR Team e tenho uma dúvida sobre a troca de faixa.",
  trocaDeFaixa: "Olá, professor Bruno! Vim pelo site da BR Team e quero saber o preço da troca de faixa.",
  kimono: "Olá, professor Bruno! Vim pelo site da BR Team e quero saber o preço do kimono.",
  kimonoAluno: "Olá, professor Bruno! Sou aluno da BR Team e quero saber o preço do kimono.",
};

/*
  Grade de horários (informada pela academia). Treinos às segundas, quartas e quintas.
  Kids 1 das 18h às 18h50 (5 a 7 anos), Kids 2 das 19h às 19h50 (8 a 12 anos).
  Adulto às 6h, 13h (turma mista, a partir de 13 anos) e 20h.
*/
export type TurmaChave = "Kids" | "Adulto";
export type Aula = {
  turma: TurmaChave;
  nome: string;
  horario: string;
  periodo: "Manhã" | "Tarde" | "Noite";
  publico: string;
  idadeMin: number;
  idadeMax?: number;
};
export const diasDeAula: string | null = "Segunda, quarta e quinta";
export const aulas: Aula[] = [
  { turma: "Adulto", nome: "Adulto", horario: "6h às 7h", periodo: "Manhã", publico: "a partir de 13 anos", idadeMin: 13 },
  { turma: "Adulto", nome: "Turma mista", horario: "13h às 14h", periodo: "Tarde", publico: "a partir de 13 anos", idadeMin: 13 },
  { turma: "Kids", nome: "Kids 1", horario: "18h às 18h50", periodo: "Noite", publico: "crianças de 5 a 7 anos", idadeMin: 5, idadeMax: 7 },
  { turma: "Kids", nome: "Kids 2", horario: "19h às 19h50", periodo: "Noite", publico: "crianças de 8 a 12 anos", idadeMin: 8, idadeMax: 12 },
  { turma: "Adulto", nome: "Adulto", horario: "20h às 21h", periodo: "Noite", publico: "a partir de 13 anos", idadeMin: 13 },
];
export const aulasDaTurma = (t: TurmaChave) => aulas.filter((a) => a.turma === t);
/** Horários que a pessoa pode escolher pela idade (cada criança vê só a turma Kids da idade dela). */
export const aulasParaIdade = (idade: number) =>
  aulasDaTurma(turmaPorIdade(idade).turma).filter((a) => idade >= a.idadeMin && idade <= (a.idadeMax ?? Infinity));
export const rotuloAula = (a: Aula) => `${a.nome}, ${a.horario}`;
/* Textos tirados da grade acima, para nunca ficarem diferentes dela */
const inicio = (a: Aula) => a.horario.split(" às ")[0];
const lista = (itens: string[]) => (itens.length < 2 ? itens.join("") : `${itens.slice(0, -1).join(", ")} e ${itens[itens.length - 1]}`);
const idades = (a: Aula) => (a.idadeMax ? `${a.idadeMin} a ${a.idadeMax} anos` : `a partir de ${a.idadeMin} anos`);
const kids = aulasDaTurma("Kids");
const adultos = aulasDaTurma("Adulto");
/** "Kids 1 das 18h às 18h50 (5 a 7 anos) e Kids 2 das 19h às 19h50 (8 a 12 anos)" */
export const resumoKids = lista(kids.map((a) => `${a.nome} das ${a.horario} (${idades(a)})`));
/** idade em que o aluno passa para as turmas de adultos (13) */
export const idadeAdulto = Math.min(...adultos.map((a) => a.idadeMin));
/** "Crianças às 18h e às 19h. Adultos às 6h, às 13h e às 20h." */
export const resumoHorarios =
  `Crianças ${lista(kids.map((a) => `às ${inicio(a)}`))}. Adultos ${lista(adultos.map((a) => `às ${inicio(a)}`))}.`;
/** "às 6h, às 13h (turma mista) e às 20h" */
const horariosAdultos = lista(adultos.map((a) => `às ${inicio(a)}${a.nome === "Adulto" ? "" : ` (${a.nome.toLowerCase()})`}`));

/*
  Mensalidade: um valor só para todo mundo (crianças, adultos, mulheres e melhor idade).
  Para mudar o preço, troque `mensalidade.valor`.
*/
export const mensalidade = { valor: "R$ 125", periodo: "por mês" };

export type Plano = { nome: string; para: string; preco: string | null; periodo: string; inclui: string[]; destaque?: boolean };
export const planos: Plano[] = [
  {
    nome: "Crianças",
    para: "Turmas Kids 1 e Kids 2",
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
    descricao: "Até 15 anos. Cinza, amarela, laranja e verde têm três versões: com branco, pura e com preto.",
    faixas: [
      { nome: "Branca", cor: "#f2f2f0", ponteira: "#111111", idade: "a partir de 5 anos", preco: null },
      { nome: "Cinza", cor: "#8d8f93", ponteira: "#111111", idade: "5 a 15 anos", preco: null, variacoes: true },
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
  Loja: kimono encomendado com o professor. O preço de quem vai fazer a aula experimental vai junto
  no formulário de agendamento; quem já é aluno pede direto pelo WhatsApp.
  `preco: null` aparece como "Consulte".
*/
export const loja = {
  cores: ["Branco", "Preto"],
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
  professor: { src: "./fotos/professor-bruno.webp", alt: "Professor Bruno Ramos, de kimono branco e faixa preta, de braços cruzados", w: 601, h: 1170 },
  professorFilha: { src: "./fotos/bruno-e-marina.webp", alt: "Bruno Ramos ajoelhado no tatame ao lado da filha Marina, os dois de kimono", w: 356, h: 418 },
  espaco: { src: "./fotos/espaco-tatame.webp", alt: "O tatame da BR Team: salão branco com a bandeira do Brasil, diplomas na parede e o quadro com a marca da academia", w: 904, h: 236 },
  cumprimento: { src: "./fotos/professor-cumprimento.webp", alt: "Professor Bruno cumprimentando o tatame com uma reverência", w: 520, h: 833 },
  adultos: [
    { src: "./fotos/turma-mista.webp", alt: "Turma mista de adultos com faixas branca, azul, roxa e marrom no tatame da BR Team", w: 1080, h: 799 },
    { src: "./fotos/treino-passagem.webp", alt: "Dois alunos treinando passagem de guarda no tatame", w: 685, h: 369 },
    { src: "./fotos/familia-br-team.webp", alt: "Alunos e professores de todas as turmas reunidos na academia", w: 780, h: 416 },
  ],
  kids: [
    { src: "./fotos/aluno-faixa-branca.webp", alt: "Aluno faixa branca em posição de guarda, sorrindo", w: 596, h: 1103 },
    { src: "./fotos/treino-meninas.webp", alt: "Duas alunas treinando uma posição de guarda", w: 640, h: 653 },
    { src: "./fotos/amigos-kids.webp", alt: "Dois alunos abraçados, de kimono preto e faixa cinza", w: 560, h: 692 },
  ],
  galeria: [
    { src: "./fotos/tatame-cheio.webp", alt: "Tatame lotado: alunos e professores de kimono branco e preto, com faixas de várias cores, reunidos na academia", legenda: "Tatame cheio", w: 1080, h: 728 },
    { src: "./fotos/turma-kids-1.webp", alt: "Turma Kids 1 reunida no tatame, crianças de kimono preto e branco sorrindo em frente aos quadros da academia", legenda: "Turma Kids 1", w: 1080, h: 700 },
    { src: "./fotos/podio-rio-winter-open.webp", alt: "Alunos no pódio do Rio Winter International Open 2026 da IBJJF", legenda: "Rio Winter International Open 2026 (IBJJF)", w: 356, h: 474 },
    { src: "./fotos/troca-de-faixa-kids-ii.webp", alt: "Colação de grau e troca de faixa da Turma Kids II", legenda: "Troca de faixa, Turma Kids II", w: 356, h: 474 },
    { src: "./fotos/turma-mista.webp", alt: "Turma mista de adultos com faixas branca, azul, roxa e marrom no tatame da BR Team", legenda: "Turma mista", w: 1080, h: 799 },
    { src: "./fotos/graduacao-adultos.webp", alt: "Alunos adultos de kimono branco na graduação, com certificado", legenda: "Graduação dos adultos", w: 356, h: 417 },
    { src: "./fotos/competicao.webp", alt: "Professor Bruno na arquibancada de um campeonato", legenda: "Dia de campeonato", w: 356, h: 473 },
    { src: "./fotos/turma-kids-2.webp", alt: "Crianças pequenas em fila encostadas na parede, de kimono e faixas branca, cinza e amarela", legenda: "Os pequenos da turma kids", w: 1080, h: 716 },
    { src: "./fotos/troca-de-faixa-turma.webp", alt: "Colação de grau e troca de faixa de uma turma infantil", legenda: "Colação de grau", w: 355, h: 474 },
    { src: "./fotos/turma-tatame.webp", alt: "Turma infantil reunida no tatame com o professor", legenda: "Turma no tatame", w: 356, h: 418 },
    { src: "./fotos/familia-br-team.webp", alt: "Alunos e professores de todas as turmas reunidos na academia", legenda: "Todas as turmas juntas", w: 780, h: 416 },
    { src: "./fotos/professores-e-alunos.webp", alt: "Professores e alunos de kimono reunidos no tatame da BR Team", legenda: "Professores e alunos", w: 355, h: 474 },
    { src: "./fotos/aula-no-tatame.webp", alt: "Alunos enfileirados no tatame, com o professor sentado à frente", legenda: "Aula no tatame", w: 355, h: 472 },
    { src: "./fotos/pequenos-gigantes.webp", alt: "Crianças maiores da turma kids, em pé e sentadas no tatame, sorrindo", legenda: "Pequenos no tamanho, gigantes na vontade", w: 1080, h: 622 },
    { src: "./fotos/kids-kimono-azul.webp", alt: "Turma infantil com kimonos azuis e brancos sentada no tatame", legenda: "Turma kids", w: 356, h: 472 },
    { src: "./fotos/turma-feminina-kids.webp", alt: "Meninas e meninos da turma kids reunidos na academia", legenda: "Turma kids no tatame", w: 356, h: 474 },
    { src: "./fotos/treino-passagem.webp", alt: "Dois alunos treinando passagem de guarda no tatame", legenda: "Treino de passagem de guarda", w: 685, h: 369 },
    { src: "./fotos/adultos-kimono-azul.webp", alt: "Alunos adultos de kimono azul e branco no tatame", legenda: "Turma adulta", w: 356, h: 474 },
    { src: "./fotos/kids-kimono-branco.webp", alt: "Crianças de kimono branco em pé no tatame com o professor", legenda: "Pequenos no tatame", w: 356, h: 474 },
    { src: "./fotos/turma-geral.webp", alt: "Todas as turmas reunidas no tatame", legenda: "A família BR Team", w: 356, h: 417 },
  ],
};

/*
  Turma indicada pela idade (formulário de aula experimental e loja).
  A idade de corte (Kids até 12, adultos a partir de 13) sai das idades em `aulas`.
*/
export const faixasEtarias: { ate: number; turma: TurmaChave; detalhe: string }[] = [
  { ate: idadeAdulto - 1, turma: "Kids", detalhe: `${resumoKids}. Se a criança for grande, o professor pode indicar a turma dos adultos.` },
  { ate: 120, turma: "Adulto", detalhe: `Turmas ${horariosAdultos}. Escolha o horário que encaixa na sua rotina.` },
];
export function turmaPorIdade(idade: number) {
  return faixasEtarias.find((f) => idade <= f.ate) ?? faixasEtarias[faixasEtarias.length - 1];
}

/*
  Como funciona a graduação (texto da seção Troca de faixa).
  Base: Sistema Geral de Graduação da IBJJF (versão 2.3, 2022) e a prática da BR Team
  (cerca de 1 ano por faixa nas crianças; frequência de 70% a 80% das aulas do ano).
*/
export const graduacao = {
  frequenciaMinima: "70% a 80%",
  tempoMinimoAdulto: [
    { faixa: "Branca", cor: "#f2f2f0", tempo: "sem tempo mínimo", obs: "costuma levar de 1 a 2 anos até a azul" },
    { faixa: "Azul", cor: "#1d4fb8", tempo: "2 anos", obs: "antes da roxa" },
    { faixa: "Roxa", cor: "#5b2a86", tempo: "1 ano e meio", obs: "antes da marrom" },
    { faixa: "Marrom", cor: "#5a3a22", tempo: "1 ano", obs: "antes da preta, que exige 19 anos" },
  ],
};

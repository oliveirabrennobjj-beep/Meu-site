// Conteúdo do sistema de cada loja (horário marcado ou controle de alunos): serviços, profissionais,
// aulas, títulos e foto por ramo e sub-nicho. Usado na imagem do sistema e na demonstração de clicar.
import { Check } from "lucide-react";
import { temaDe } from "./Demonstracao";
import { ramoDe, subnichoDe, textosSistema, type Lead, type RamoId } from "./leads";
import { SUB_SISTEMA } from "./subtemas";

export const reais = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

/* Conteúdo da página por ramo ----------------------------------------------------------------- */

export type Item = [nome: string, preco: number, tempo: string];
export type Pessoa = [nome: string, faz: string, foto?: string];

export const SERVICOS: Partial<Record<RamoId, Item[]>> = {
  barbearia: [["Corte", 35, "30 min"], ["Barba", 25, "30 min"], ["Corte + barba", 55, "1 hora"], ["Sobrancelha", 10, "15 min"]],
  salao: [["Escova", 45, "45 min"], ["Corte feminino", 60, "1 hora"], ["Manicure", 30, "40 min"], ["Coloração", 120, "2 horas"]],
  estetica: [["Limpeza de pele", 120, "1 hora"], ["Drenagem", 90, "50 min"], ["Design de sobrancelha", 40, "30 min"], ["Peeling", 150, "1 hora"]],
  massagem: [["Relaxante", 100, "1 hora"], ["Terapêutica", 120, "1 hora"], ["Drenagem", 90, "50 min"], ["Pedras quentes", 140, "1h15"]],
  pet: [["Banho", 50, "1 hora"], ["Banho e tosa", 80, "2 horas"], ["Tosa higiênica", 40, "40 min"], ["Hidratação", 35, "30 min"]],
  saude: [["Primeira consulta", 180, "50 min"], ["Retorno", 150, "50 min"], ["Consulta online", 150, "50 min"], ["Avaliação", 120, "40 min"]],
  lavajato: [["Lavagem simples", 40, "40 min"], ["Lavagem completa", 70, "1h30"], ["Polimento", 180, "3 horas"], ["Higienização", 150, "2 horas"]],
};
export const PROFISSIONAIS: Partial<Record<RamoId, Pessoa[]>> = {
  barbearia: [["Rafa Souza", "Degradê e navalhado", "img/demo/barbeiro-1.webp"], ["Thiago Lima", "Barba e bigode", "img/demo/barbeiro-2.webp"], ["Diego Alves", "Corte social e infantil", "img/demo/barbeiro-3.webp"]],
  salao: [["Carla Mendes", "Corte e coloração"], ["Bia Rocha", "Unhas"], ["Juliana Paz", "Escova e penteado"]],
  estetica: [["Ana Lima", "Pele e limpeza"], ["Paula Reis", "Corporal"], ["Bruna Dias", "Sobrancelha"]],
  massagem: [["Renata Costa", "Relaxante"], ["Marcos Silva", "Terapêutica"], ["Lívia Prado", "Drenagem"]],
  pet: [["Camila", "Banho e secagem"], ["Rodrigo", "Tosa na tesoura"], ["Patrícia", "Tosa na máquina"]],
  saude: [["Dra. Ana", "Adultos"], ["Dr. Bruno", "Crianças e adolescentes"], ["Dra. Carla", "Atendimento online"]],
  lavajato: [["Box 1", "Lavagem rápida"], ["Box 2", "Lavagem completa"], ["Box 3", "Polimento e cera"]],
};
export const AULAS: Partial<Record<RamoId, [aula: string, linha: string][]>> = {
  pilates: [["Reformer", "50 min · até 4 alunos"], ["Solo", "50 min · até 8 alunos"], ["Cadillac", "50 min · individual"], ["Aula experimental", "Primeira aula"]],
  yoga: [["Hatha", "1 hora · todos os níveis"], ["Vinyasa", "1 hora · intermediário"], ["Meditação", "30 min"], ["Aula experimental", "Primeira aula"]],
  danca: [["Balé infantil", "50 min · 4 a 10 anos"], ["Ritmos", "1 hora · adulto"], ["Jazz", "1 hora · teen"], ["Aula experimental", "Primeira aula"]],
  natacao: [["Infantil", "45 min · 4 a 12 anos"], ["Adultos", "45 min · iniciante"], ["Hidroginástica", "45 min"], ["Aula experimental", "Primeira aula"]],
  crossfit: [["CrossFit", "1 hora · todos os níveis"], ["Funcional", "50 min"], ["Iniciantes", "1 hora"], ["Aula experimental", "Primeira aula"]],
  luta: [["Muay thai", "1 hora · adulto"], ["Jiu-jitsu", "1h30 · adulto"], ["Kids", "50 min · 6 a 12 anos"], ["Aula experimental", "Primeira aula"]],
  escola: [["Turma da manhã", "1 hora · iniciante"], ["Turma da tarde", "1 hora · intermediário"], ["Turma da noite", "1 hora · adulto"], ["Aula experimental", "Primeira aula"]],
  academia: [["Funcional", "50 min"], ["Spinning", "45 min"], ["Musculação", "Livre, com professor"], ["Aula experimental", "Primeira aula"]],
};
export const MENSALIDADE: Partial<Record<RamoId, number>> = { pilates: 260, yoga: 180, danca: 150, natacao: 190, crossfit: 220, luta: 160, academia: 110, escola: 200 };
export const PROFESSORES: Pessoa[] = [["Prof. Ana", "Turmas da manhã"], ["Prof. Bruno", "Turmas da noite"], ["Prof. Carla", "Iniciantes"]];

export function conteudo(lead: Lead) {
  const sis = textosSistema(lead);
  const ramo = ramoDe(lead).id;
  const t = temaDe(lead);
  const sub = SUB_SISTEMA[subnichoDe(lead)?.id ?? ""] ?? {};
  const nota = typeof lead.nota === "number" && lead.nota > 0 ? lead.nota.toLocaleString("pt-BR", { minimumFractionDigits: 1 }) : "4,9";
  const selo = lead.avaliacoes ? `${nota} · ${lead.avaliacoes} avaliações no Google` : `${nota} no Google`;
  const foto = ramo === "barbearia" ? "img/demo/sistema-barbearia.webp" : `img/demo/${t.foto}-2.webp`;
  if (sis.id === "alunos") {
    const aulas = sub.aulas ?? AULAS[ramo] ?? AULAS.academia!;
    const preco = sub.preco ?? MENSALIDADE[ramo] ?? 150;
    return {
      sis, t, foto, selo,
      titulo: sub.titulo ?? (["Sua aula,", "do seu jeito."] as const),
      chamada: "Veja as turmas, marque e remarque a aula pelo celular. A mensalidade fica em dia sem ninguém precisar cobrar.",
      agendar: "Agende sua aula",
      passos: [["Aula", "Escolha a turma"], ["Professor", "Quem dá a aula"], ["Data e hora", "Dia e horário"], ["Confirmar", "Revise e confirme"]],
      colunas: ["Escolha a aula", "Escolha o professor", "Escolha a data"],
      itens: aulas.map(([nome, linha]) => ({ nome, linha })),
      pessoas: PROFESSORES,
      resumo: [["Aula", aulas[0][0]], ["Professor", "Prof. Ana"], ["Data", "quinta, 19 de novembro"], ["Horário", "18:00"], ["Plano", "2x por semana"]] as [string, string][],
      total: sub.total ?? ([`${reais(preco)}/mês`, "Mensalidade"] as const),
      botao: "Confirmar aula",
      recursos: [["Aula marcada pelo celular", "O aluno escolhe e remarca sozinho."], ["Mensalidade em dia", "Quem atrasou aparece na hora."], ["Cobrança no WhatsApp", "Um toque e a mensagem vai."], ["Turmas cheias", "Vaga sobrando vira aviso."]] as [string, string][],
      horario: "Seg a sex 6h às 21h · sáb 8h às 12h",
    };
  }
  const servicos = sub.servicos ?? SERVICOS[ramo] ?? SERVICOS.barbearia!;
  const pessoas = sub.pessoas ?? PROFISSIONAIS[ramo] ?? PROFISSIONAIS.salao!;
  const titulos: Partial<Record<RamoId, readonly [string, string]>> = {
    barbearia: ["Corte na régua,", "hora marcada."],
    salao: ["Beleza com", "hora marcada."],
    pet: ["Banho e tosa", "com hora marcada."],
    lavajato: ["Carro limpo,", "sem fila na porta."],
    saude: ["Sua consulta,", "com hora marcada."],
  };
  return {
    sis, t, foto, selo,
    titulo: sub.titulo ?? titulos[ramo] ?? (["Seu momento,", "com hora marcada."] as const),
    chamada: "Escolha o serviço, o profissional e o horário pelo celular. A gente te espera na hora certa, sem fila.",
    agendar: "Agende seu horário",
    passos: [["Serviço", "Escolha o serviço"], [ramo === "barbearia" ? "Barbeiro" : "Profissional", "Quem vai atender"], ["Data e hora", "Dia e horário"], ["Confirmar", "Revise e confirme"]],
    colunas: ["Escolha o serviço", ramo === "barbearia" ? "Escolha o barbeiro" : "Escolha o profissional", "Escolha a data"],
    itens: servicos.map(([nome, preco, tempo]) => ({ nome, linha: `${reais(preco)} · ${tempo}` })),
    pessoas,
    resumo: [["Serviço", servicos[0][0]], [ramo === "barbearia" ? "Barbeiro" : "Profissional", pessoas[0][0]], ["Data", "quinta, 19 de novembro"], ["Horário", "16:00"], ["Duração", servicos[0][2]]] as [string, string][],
    total: [reais(servicos[0][1]), "Total"] as const,
    botao: "Confirmar agendamento",
    recursos: [["Agenda em 1 minuto", "Sem ligar e sem esperar resposta."], ["Confirmação no WhatsApp", "Com dia, hora e profissional."], ["Profissionais avaliados", "Nota de quem já foi atendido."], ["Paga na hora", "Pix, cartão ou dinheiro."]] as [string, string][],
    horario: "Seg a sáb · 9h às 20h",
  };
}

export const SERIF_SISTEMA = `"Fraunces", Georgia, serif`;
export const iniciais = (nome: string) => nome.replace(/^Prof\.\s*/, "").split(/\s+/).map((p) => p[0]).slice(0, 2).join("").toUpperCase();

export function Avatar({ pessoa, tamanho, t }: { pessoa: Pessoa; tamanho: number; t: ReturnType<typeof temaDe> }) {
  const [nome, , foto] = pessoa;
  return foto ? (
    <img src={foto} alt="" width={tamanho} height={tamanho} className="shrink-0 rounded-full object-cover" style={{ width: tamanho, height: tamanho, boxShadow: `0 0 0 1px ${t.destaque}55` }} />
  ) : (
    <span className="grid shrink-0 place-items-center rounded-full font-bold" style={{ width: tamanho, height: tamanho, background: t.mancha, color: t.escuro ? t.destaque : t.tinta, fontSize: tamanho * 0.36 }}>
      {iniciais(nome)}
    </span>
  );
}

export function Marcado({ t, tamanho = 20 }: { t: ReturnType<typeof temaDe>; tamanho?: number }) {
  return (
    <span className="grid shrink-0 place-items-center rounded-full" style={{ width: tamanho, height: tamanho, background: t.destaque, color: t.noDestaque }}>
      <Check className="size-[60%]" strokeWidth={3} />
    </span>
  );
}


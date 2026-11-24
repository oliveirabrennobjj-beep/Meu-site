import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { toJpeg } from "html-to-image";
import {
  Activity,
  Baby,
  Backpack,
  BadgeCheck,
  Bike,
  BookOpen,
  CakeSlice,
  Car,
  Carrot,
  CircleGauge,
  Clock,
  Croissant,
  CupSoda,
  Droplets,
  Dumbbell,
  Eye,
  Flame,
  Gift,
  Glasses,
  Hammer,
  HeartPulse,
  IceCreamCone,
  Leaf,
  Loader2,
  MessageCircle,
  Music,
  PaintBucket,
  PawPrint,
  Pencil,
  Percent,
  PersonStanding,
  Pill,
  Pizza,
  Ruler,
  ScanFace,
  Scissors,
  Send,
  ShieldCheck,
  Shirt,
  ShoppingBag,
  ShoppingCart,
  Smile,
  Sparkles,
  SprayCan,
  Star,
  Stethoscope,
  Store,
  Sun,
  Swords,
  Tag,
  Truck,
  Users,
  Utensils,
  Waves,
  Wind,
  Wrench,
  X,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { RAMOS_ESCOLHA, SUBNICHOS, lugarDe, ramoDe, subnichoDe, type Lead, type RamoId, numeroConversa } from "./leads";
import { SUBTEMAS } from "./subtemas";
import { ESCRITA, PaginaPremium, familiaDe } from "./SitePremium";

// Prévia de como ficaria o site da loja, no nível de um site pronto (referência: shots do
// Pinterest que o Brenno mandou). Só usa o que é verdade (nome, ramo, cidade, nota do Google);
// fotos são de banco livre (Unsplash e Pexels) por ramo, e produtos, preços e horários ficam como espaço
// para os da loja. O botão "Mandar foto" gera uma imagem da página para mandar no WhatsApp.

type Servico = [nome: string, linha: string, icone: LucideIcon];

export interface Tema {
  foto: string;
  escuro?: boolean;
  fundo: string;
  cartao: string;
  tinta: string;
  suave: string;
  destaque: string;
  noDestaque: string;
  mancha: string;
  /** Com capa, a foto ocupa o topo inteiro e o texto vai por cima (cor do véu sobre a foto). */
  capa?: string;
  /** Cor de destaque por cima da capa; sem ela, usa `destaque`. */
  noCapa?: string;
  /** Dois cartões com foto (fotos 3 e 4 do ramo). */
  destaques?: [nome: string, linha: string][];
  fonte: string;
  italico?: boolean;
  maiusculo?: boolean;
  roteiro: string;
  titulo: [string, string];
  chamada: string;
  botao: string;
  servicos: Servico[];
  sobre: [string, string];
  cta: [string, string];
}

const SERIF = `"Fraunces", Georgia, serif`;

const TEMAS: Record<RamoId, Tema> = {
  barbearia: {
    foto: "barbearia", escuro: true, fundo: "#121110", cartao: "#1c1a18", tinta: "#f2ece3", suave: "#f2ece3a8",
    destaque: "#c9a24a", noDestaque: "#121110", mancha: "#c9a24a2e", capa: "#121110", fonte: `"Oswald", sans-serif`, maiusculo: true,
    destaques: [["Barba", "Desenho e acabamento"], ["Corte", "Tesoura ou máquina"]],
    roteiro: "Hora marcada", titulo: ["Corte na régua,", "visual no ponto"],
    chamada: "Escolha o serviço, marque o horário pelo WhatsApp e chegue na hora certa.", botao: "Agendar horário",
    servicos: [["Corte", "Do clássico ao degradê", Scissors], ["Barba", "Desenho e acabamento", Sparkles],
      ["Corte e barba", "O combo completo", BadgeCheck], ["Hora marcada", "Sem esperar na fila", Clock]],
    sobre: ["Seu lugar", "de confiança"], cta: ["Bora marcar seu horário?", "Escolha o dia e confirme pelo WhatsApp."],
  },
  salao: {
    foto: "salao", fundo: "#fbf4f1", cartao: "#ffffff", tinta: "#2b2424", suave: "#2b2424a8",
    destaque: "#a8645a", noDestaque: "#ffffff", mancha: "#eccbc1", fonte: `"Cormorant Garamond", serif`, italico: true,
    destaques: [["Cabelo", "Corte, cor e tratamento"], ["Unhas", "Mãos e pés"]],
    roteiro: "Feito com carinho", titulo: ["Sua beleza,", "no seu tempo"],
    chamada: "Escolha o serviço e marque seu horário pelo WhatsApp, sem precisar ligar.", botao: "Marcar horário",
    servicos: [["Cabelo", "Corte, cor e tratamento", Scissors], ["Unhas", "Mãos e pés", Sparkles],
      ["Sobrancelha", "Design e acabamento", Smile], ["Estética", "Cuidados com a pele", HeartPulse]],
    sobre: ["Um cantinho", "pra você se cuidar"], cta: ["Pronta pra se cuidar?", "Marque seu horário em poucos toques."],
  },
  academia: {
    foto: "academia", escuro: true, fundo: "#0d0f14", cartao: "#161a22", tinta: "#f5f7fa", suave: "#f5f7faa8",
    destaque: "#4b84f5", noDestaque: "#ffffff", mancha: "#4b84f533", capa: "#0d0f14", fonte: `"Archivo Black", sans-serif`, maiusculo: true,
    destaques: [["Musculação", "Força e resultado"], ["Aula experimental", "Conheça antes de fechar"]],
    roteiro: "Bora treinar", titulo: ["Treino forte,", "perto de casa"],
    chamada: "Conheça os planos e agende sua aula experimental pelo WhatsApp.", botao: "Aula experimental",
    servicos: [["Musculação", "Força e resultado", Dumbbell], ["Planos", "Escolha o que cabe", BadgeCheck],
      ["Aula experimental", "Conheça antes de fechar", Zap], ["Horários", "A grade da semana", Clock]],
    sobre: ["Seu treino", "no seu ritmo"], cta: ["Primeira aula, bora?", "Agende pelo WhatsApp e venha conhecer."],
  },
  acai: {
    foto: "acai", fundo: "#f8f2fb", cartao: "#ffffff", tinta: "#2b0e36", suave: "#2b0e36a8",
    destaque: "#6a1f86", noDestaque: "#ffffff", mancha: "#e7d2f1", fonte: `"Bricolage Grotesque", sans-serif`,
    destaques: [["Açaí no copo", "Do seu tamanho"], ["Sorvetes", "Pra refrescar"]],
    roteiro: "Geladinho!", titulo: ["Monte o seu,", "do seu jeito"],
    chamada: "Escolha o tamanho, os adicionais e peça pelo WhatsApp.", botao: "Pedir agora",
    servicos: [["Açaí no copo", "Do seu tamanho", IceCreamCone], ["Adicionais", "Frutas, cremes e mais", Sparkles],
      ["Sorvetes", "Pra refrescar", IceCreamCone], ["Bebidas", "Geladas", CupSoda]],
    sobre: ["Feito na hora,", "do jeito que você gosta"], cta: ["Bateu a vontade?", "Monte seu pedido e mande pelo WhatsApp."],
  },
  pizzaria: {
    foto: "pizzaria", fundo: "#faf3ea", cartao: "#ffffff", tinta: "#2a1a14", suave: "#2a1a14a8",
    destaque: "#b8322a", noDestaque: "#ffffff", mancha: "#f1d3c1", fonte: SERIF, italico: true,
    destaques: [["Salgadas", "Os clássicos da casa"], ["Especiais", "Sabores diferentes"]],
    roteiro: "Hoje tem pizza", titulo: ["Pizza quentinha,", "do forno pra você"],
    chamada: "Escolha os sabores no cardápio e peça pelo WhatsApp.", botao: "Pedir pizza",
    servicos: [["Salgadas", "Os clássicos da casa", Pizza], ["Especiais", "Sabores diferentes", Pizza],
      ["Doces", "Pra fechar a noite", CakeSlice], ["Bebidas", "Pra acompanhar", CupSoda]],
    sobre: ["Sabor de casa,", "toda noite"], cta: ["Bateu a fome?", "Escolha os sabores e peça em poucos toques."],
  },
  hamburgueria: {
    foto: "hamburgueria", fundo: "#fffaf5", cartao: "#ffffff", tinta: "#2a1310", suave: "#2a1310a8",
    destaque: "#d62828", noDestaque: "#ffffff", mancha: "#fbdcd5", capa: "#9c1212", noCapa: "#ffd23f", fonte: `"Anton", sans-serif`, maiusculo: true,
    destaques: [["Salgados", "Saindo agora"], ["Lanches", "Feitos na hora"]],
    roteiro: "Feito na hora", titulo: ["Lanche gostoso,", "suco geladinho"],
    chamada: "Escolha no cardápio e peça pelo WhatsApp.", botao: "Pedir agora",
    servicos: [["Lanches", "Misto, natural e mais", Utensils], ["Salgados", "Fritos e assados", Croissant],
      ["Sucos", "Da fruta", CupSoda], ["Combos", "Pra matar a fome", BadgeCheck]],
    sobre: ["Lanche feito", "na hora"], cta: ["Bateu a fome?", "Escolha no cardápio e peça pelo WhatsApp."],
  },
  padaria: {
    foto: "padaria", fundo: "#faf4ea", cartao: "#ffffff", tinta: "#2e1b10", suave: "#2e1b10a8",
    destaque: "#9a5b1f", noDestaque: "#ffffff", mancha: "#efd9bd", fonte: SERIF, italico: true,
    destaques: [["Pães", "Saindo do forno"], ["Doces e bolos", "Pra adoçar o dia"]],
    roteiro: "Feito com carinho", titulo: ["Pão quentinho,", "café passado"],
    chamada: "Veja os produtos e encomende pelo WhatsApp.", botao: "Encomendar",
    servicos: [["Pães", "Saindo do forno", Croissant], ["Doces e bolos", "Pra adoçar o dia", CakeSlice],
      ["Salgados", "Pro lanche", Utensils], ["Encomendas", "Bolos e festas", Store]],
    sobre: ["A padaria", "do seu bairro"], cta: ["Vai uma encomenda?", "Mande o pedido pelo WhatsApp e retire no balcão."],
  },
  restaurante: {
    foto: "restaurante", escuro: true, fundo: "#14100c", cartao: "#1f1913", tinta: "#f4ead9", suave: "#f4ead9a8",
    destaque: "#d39a3d", noDestaque: "#14100c", mancha: "#d39a3d2b", capa: "#14100c", fonte: SERIF, maiusculo: true,
    destaques: [["Prato do dia", "Comida caseira"], ["Feijão fresquinho", "Feito todo dia"]],
    roteiro: "Seja bem-vindo", titulo: ["Comida boa,", "clima melhor"],
    chamada: "Veja o cardápio do dia e peça pelo WhatsApp.", botao: "Ver cardápio",
    servicos: [["Pratos do dia", "O cardápio de hoje", Utensils], ["Quentinhas", "Pra levar", Store],
      ["Sobremesas", "Pra fechar", CakeSlice], ["Bebidas", "Pra acompanhar", CupSoda]],
    sobre: ["Mesa posta,", "comida no ponto"], cta: ["Bora almoçar?", "Veja o cardápio e peça pelo WhatsApp."],
  },
  pet: {
    foto: "pet", fundo: "#f2f7f3", cartao: "#ffffff", tinta: "#17352a", suave: "#17352aa8",
    destaque: "#2f7d52", noDestaque: "#ffffff", mancha: "#cfe5d6", fonte: `"Bricolage Grotesque", sans-serif`,
    destaques: [["Banho e tosa", "Cheiroso e feliz"], ["Saúde", "Cuidado em dia"]],
    roteiro: "Au au!", titulo: ["Carinho de verdade", "pro seu pet"],
    chamada: "Escolha o serviço e marque pelo WhatsApp.", botao: "Agendar",
    servicos: [["Banho e tosa", "Cheiroso e feliz", PawPrint], ["Saúde", "Cuidado em dia", HeartPulse],
      ["Rações", "Para cada fase", Store], ["Acessórios", "Coleiras e brinquedos", Sparkles]],
    sobre: ["Cuidado com", "quem você ama"], cta: ["Bora cuidar do seu pet?", "Marque pelo WhatsApp em poucos toques."],
  },
  oficina: {
    foto: "oficina", escuro: true, fundo: "#14161a", cartao: "#1d2026", tinta: "#f1f1ee", suave: "#f1f1eea8",
    destaque: "#f28c28", noDestaque: "#14161a", mancha: "#f28c282b", capa: "#14161a", fonte: `"Archivo Black", sans-serif`, maiusculo: true,
    destaques: [["Troca de óleo", "Motor protegido"], ["Revisão", "Antes da viagem"]],
    roteiro: "Orçamento rápido", titulo: ["Seu carro", "em boas mãos"],
    chamada: "Mande o modelo e o problema. A resposta vem pelo WhatsApp.", botao: "Pedir orçamento",
    servicos: [["Troca de óleo", "Motor protegido", Car], ["Revisão", "Antes da viagem", Wrench],
      ["Freios", "Segurança em dia", CircleGauge], ["Elétrica", "Bateria e luzes", Zap]],
    sobre: ["Serviço bem feito,", "preço combinado"], cta: ["Carro dando sinal?", "Mande uma mensagem e peça seu orçamento."],
  },
  dentista: {
    foto: "dentista", fundo: "#f3f8f6", cartao: "#ffffff", tinta: "#13332e", suave: "#13332ea8",
    destaque: "#1f6b5c", noDestaque: "#ffffff", mancha: "#cfe3dc", fonte: SERIF, italico: true,
    destaques: [["Ortodontia", "Aparelho e alinhadores"], ["Clínico geral", "Prevenção e limpeza"]],
    roteiro: "Sorria com confiança", titulo: ["Sorriso saudável,", "vida mais leve"],
    chamada: "Marque sua consulta pelo WhatsApp, sem esperar ligação.", botao: "Marcar consulta",
    servicos: [["Clínico geral", "Prevenção e limpeza", Smile], ["Ortodontia", "Aparelho e alinhamento", Sparkles],
      ["Implantes", "Recupere o sorriso", ShieldCheck], ["Estética", "Clareamento e lentes", Star]],
    sobre: ["Sua clínica", "de confiança"], cta: ["Pronto pro seu sorriso?", "Marque sua avaliação pelo WhatsApp."],
  },
  saude: {
    foto: "saude", fundo: "#f5f6f2", cartao: "#ffffff", tinta: "#22302b", suave: "#22302ba8",
    destaque: "#3f7a68", noDestaque: "#ffffff", mancha: "#d5e4dc", fonte: SERIF, italico: true,
    destaques: [["Primeira consulta", "Pra gente se conhecer"], ["Atendimento online", "De onde você estiver"]],
    roteiro: "Cuidado de verdade", titulo: ["Um espaço", "pra cuidar de você"],
    chamada: "Escolha o melhor horário e marque sua consulta pelo WhatsApp.", botao: "Marcar consulta",
    servicos: [["Consulta", "Atendimento individual", Stethoscope], ["Acompanhamento", "No seu ritmo", HeartPulse],
      ["Online", "De onde você estiver", MessageCircle], ["Horários", "Manhã, tarde e noite", Clock]],
    sobre: ["Atendimento", "com escuta e cuidado"], cta: ["Bora dar o primeiro passo?", "Marque sua consulta pelo WhatsApp."],
  },
  escola: {
    foto: "escola", fundo: "#f6f7fb", cartao: "#ffffff", tinta: "#1b2340", suave: "#1b2340a8",
    destaque: "#3557d4", noDestaque: "#ffffff", mancha: "#d9e0fa", fonte: `"Bricolage Grotesque", sans-serif`,
    destaques: [["Turmas pequenas", "Atenção pra cada aluno"], ["Aula experimental", "Conheça antes de fechar"]],
    roteiro: "Aprender de perto", titulo: ["Aprender fica fácil", "com quem ensina bem"],
    chamada: "Veja os cursos e os horários, e faça a matrícula pelo WhatsApp.", botao: "Quero me matricular",
    servicos: [["Cursos", "Pra cada idade e nível", BookOpen], ["Turmas", "Manhã, tarde e noite", Users],
      ["Aula experimental", "Conheça antes de fechar", Zap], ["Matrícula", "Pelo WhatsApp", Pencil]],
    sobre: ["Ensino próximo,", "resultado de verdade"], cta: ["Bora começar?", "Garanta sua vaga pelo WhatsApp."],
  },
  escritorio: {
    foto: "escritorio", fundo: "#f4f5f7", cartao: "#ffffff", tinta: "#16202e", suave: "#16202ea8",
    destaque: "#1f3a63", noDestaque: "#ffffff", mancha: "#d7dee9", fonte: SERIF,
    destaques: [["Atendimento próximo", "Quem cuida conhece você"], ["Sem enrolação", "Tudo explicado"]],
    roteiro: "Resolve pra você", titulo: ["Seu problema resolvido", "por quem entende"],
    chamada: "Conte o que você precisa e marque uma conversa pelo WhatsApp.", botao: "Marcar uma conversa",
    servicos: [["Atendimento", "Pessoal e direto", Users], ["Documentos", "Tudo organizado", BookOpen],
      ["Prazos em dia", "Sem dor de cabeça", ShieldCheck], ["Orçamento", "Pelo WhatsApp", MessageCircle]],
    sobre: ["Confiança de quem", "é daqui da cidade"], cta: ["Precisa de ajuda?", "Mande uma mensagem e a gente conversa."],
  },
  servicos: {
    foto: "servicos", escuro: true, fundo: "#111418", cartao: "#1a1f25", tinta: "#eef2f5", suave: "#eef2f5a8",
    destaque: "#2fb8e6", noDestaque: "#111418", mancha: "#2fb8e62b", capa: "#111418", fonte: `"Archivo Black", sans-serif`, maiusculo: true,
    destaques: [["Orçamento rápido", "Resposta no WhatsApp"], ["Garantia", "Serviço bem feito"]],
    roteiro: "Conserto e instalação", titulo: ["Quebrou?", "A gente resolve"],
    chamada: "Mande uma foto do problema e receba o orçamento pelo WhatsApp.", botao: "Pedir orçamento",
    servicos: [["Conserto", "Rápido e bem feito", Wrench], ["Instalação", "Do jeito certo", Zap],
      ["Atendimento", "Na loja ou em casa", Truck], ["Garantia", "Pra você ficar tranquilo", ShieldCheck]],
    sobre: ["Serviço de confiança,", "preço combinado"], cta: ["Deu problema?", "Mande uma foto e peça seu orçamento."],
  },
  festa: {
    foto: "festa", fundo: "#fbf6f2", cartao: "#ffffff", tinta: "#2e2226", suave: "#2e2226a8",
    destaque: "#b04a6a", noDestaque: "#ffffff", mancha: "#f1d3dc", fonte: `"Cormorant Garamond", serif`, italico: true,
    destaques: [["Decoração", "Do seu jeito"], ["Pacotes", "Pra cada tamanho de festa"]],
    roteiro: "Sua festa do jeito que sonhou", titulo: ["Festa linda,", "sem dor de cabeça"],
    chamada: "Veja as fotos das festas e peça seu orçamento pelo WhatsApp.", botao: "Pedir orçamento",
    servicos: [["Decoração", "Do seu jeito", Sparkles], ["Aniversário", "Infantil e adulto", CakeSlice],
      ["Casamento", "Do sim à festa", Gift], ["Orçamento", "Pelo WhatsApp", MessageCircle]],
    sobre: ["Cada detalhe", "pensado com carinho"], cta: ["Bora planejar sua festa?", "Conte a data e peça seu orçamento."],
  },
  luta: {
    foto: "luta", escuro: true, fundo: "#0f0f10", cartao: "#1b1b1d", tinta: "#f5f3ef", suave: "#f5f3efa8",
    destaque: "#e5383b", noDestaque: "#ffffff", mancha: "#e5383b30", capa: "#0f0f10", fonte: `"Anton", sans-serif`, maiusculo: true,
    destaques: [["Aulas", "Do iniciante ao avançado"], ["Aula experimental", "Venha treinar um dia"]],
    roteiro: "Bora treinar", titulo: ["Treino de luta", "pra todos os níveis"],
    chamada: "Conheça as turmas e marque sua aula experimental pelo WhatsApp.", botao: "Aula experimental",
    servicos: [["Aulas", "Do iniciante ao avançado", Swords], ["Aula experimental", "Venha treinar um dia", Zap],
      ["Turmas", "Os horários da semana", Clock], ["Planos", "Escolha o que cabe", BadgeCheck]],
    sobre: ["Disciplina", "dentro e fora do tatame"], cta: ["Bora pro primeiro treino?", "Marque sua aula experimental pelo WhatsApp."],
  },
  massagem: {
    foto: "massagem", fundo: "#f1f4ef", cartao: "#ffffff", tinta: "#22332b", suave: "#22332ba8",
    destaque: "#3f6b54", noDestaque: "#ffffff", mancha: "#d5e4d8", fonte: `"Cormorant Garamond", serif`,
    destaques: [["Massagem relaxante", "Pra aliviar a tensão"], ["Massagem terapêutica", "Pra dores e contraturas"]],
    roteiro: "Respira fundo", titulo: ["Uma pausa", "pro seu corpo"],
    chamada: "Escolha o atendimento e agende seu horário pelo WhatsApp.", botao: "Agendar horário",
    servicos: [["Massagem relaxante", "Pra aliviar a tensão", Leaf], ["Massagem terapêutica", "Pra dores e contraturas", HeartPulse],
      ["Drenagem linfática", "Leveza pro corpo", Droplets], ["Hora marcada", "Atendimento só seu", Clock]],
    sobre: ["Um tempo", "só pra você"], cta: ["Bora cuidar de você?", "Agende seu horário em poucos toques."],
  },
  estetica: {
    foto: "estetica", fundo: "#faf5f1", cartao: "#ffffff", tinta: "#33261f", suave: "#33261fa8",
    destaque: "#96592f", noDestaque: "#ffffff", mancha: "#f1dccb", fonte: SERIF,
    destaques: [["Limpeza de pele", "Pele limpa e renovada"], ["Tratamentos faciais", "Cuidado feito pra você"]],
    roteiro: "Pele bem cuidada", titulo: ["Cuidado de verdade", "pra sua pele"],
    chamada: "Conheça os procedimentos e agende sua avaliação pelo WhatsApp.", botao: "Agendar avaliação",
    servicos: [["Limpeza de pele", "Pele limpa e renovada", Sparkles], ["Tratamentos faciais", "Cuidado feito pra você", ScanFace],
      ["Tratamentos corporais", "Com acompanhamento", HeartPulse], ["Avaliação", "Antes de qualquer procedimento", ShieldCheck]],
    sobre: ["Atendimento", "com hora marcada"], cta: ["Vamos marcar sua avaliação?", "Agende pelo WhatsApp em poucos toques."],
  },
  crossfit: {
    foto: "crossfit", escuro: true, fundo: "#101112", cartao: "#1a1c1e", tinta: "#f4f4f2", suave: "#f4f4f2a8",
    destaque: "#f5b700", noDestaque: "#111111", mancha: "#f5b7002e", capa: "#101112", fonte: `"Oswald", sans-serif`, maiusculo: true,
    destaques: [["Treino do dia", "Um treino novo a cada aula"], ["Aula experimental", "Venha treinar um dia"]],
    roteiro: "Bora pro box", titulo: ["Treino funcional", "que dá resultado"],
    chamada: "Conheça as turmas e marque sua aula experimental pelo WhatsApp.", botao: "Aula experimental",
    servicos: [["CrossFit", "Turmas por nível", Dumbbell], ["Funcional", "Força e condicionamento", Flame],
      ["Horários", "Turmas a semana toda", Clock], ["Planos", "Escolha o que cabe", BadgeCheck]],
    sobre: ["Comunidade", "que treina junto"], cta: ["Bora pro primeiro treino?", "Marque sua aula experimental pelo WhatsApp."],
  },
  pilates: {
    foto: "pilates", fundo: "#f6f2ee", cartao: "#ffffff", tinta: "#2c2622", suave: "#2c2622a8",
    destaque: "#9a5745", noDestaque: "#ffffff", mancha: "#ecd9cf", fonte: SERIF, italico: true,
    destaques: [["Pilates no aparelho", "Reformer, cadillac e chair"], ["Pilates solo", "No colchonete, em turma"]],
    roteiro: "Movimento com consciência", titulo: ["Pilates pra", "cada fase da vida"],
    chamada: "Veja os horários e agende sua aula experimental pelo WhatsApp.", botao: "Aula experimental",
    servicos: [["Aparelhos", "Reformer e cadillac", Activity], ["Solo", "Em turma, no colchonete", PersonStanding],
      ["Postura", "Alívio de dores", HeartPulse], ["Horários", "Aula com hora marcada", Clock]],
    sobre: ["Turmas pequenas", "e atenção de perto"], cta: ["Vamos marcar sua aula?", "Agende pelo WhatsApp em poucos toques."],
  },
  yoga: {
    foto: "yoga", fundo: "#f4f1e8", cartao: "#ffffff", tinta: "#2a2c22", suave: "#2a2c22a8",
    destaque: "#6b7a3c", noDestaque: "#ffffff", mancha: "#dfe3c9", fonte: `"Cormorant Garamond", serif`, italico: true,
    destaques: [["Aulas em turma", "Do iniciante ao avançado"], ["Meditação", "Respiração e presença"]],
    roteiro: "Respira fundo", titulo: ["Yoga pra", "corpo e mente"],
    chamada: "Veja as turmas e agende sua aula experimental pelo WhatsApp.", botao: "Aula experimental",
    servicos: [["Yoga", "Força e equilíbrio", Sun], ["Meditação", "Respiração e foco", Wind],
      ["Turmas", "Os horários da semana", Users], ["Planos", "Escolha o que cabe", BadgeCheck]],
    sobre: ["Um espaço", "pra desacelerar"], cta: ["Bora pra primeira aula?", "Agende pelo WhatsApp em poucos toques."],
  },
  danca: {
    foto: "danca", fundo: "#fbf4f6", cartao: "#ffffff", tinta: "#2b1a24", suave: "#2b1a24a8",
    destaque: "#c2185b", noDestaque: "#ffffff", mancha: "#f6d3e2", fonte: `"Bricolage Grotesque", sans-serif`,
    destaques: [["Balé", "Postura, leveza e técnica"], ["Ritmos", "Pra suar dançando"]],
    roteiro: "Vem dançar", titulo: ["Dança pra", "todas as idades"],
    chamada: "Conheça as modalidades e marque sua aula experimental pelo WhatsApp.", botao: "Aula experimental",
    servicos: [["Balé", "Postura, leveza e técnica", Sparkles], ["Ritmos", "Pra suar dançando", Music],
      ["Turmas", "Por idade e nível", Users], ["Horários", "Os horários da semana", Clock]],
    sobre: ["Arte, disciplina", "e diversão"], cta: ["Bora dançar?", "Marque sua aula experimental pelo WhatsApp."],
  },
  natacao: {
    foto: "natacao", fundo: "#eef6f9", cartao: "#ffffff", tinta: "#0f2a36", suave: "#0f2a36a8",
    destaque: "#0077b6", noDestaque: "#ffffff", mancha: "#cfe8f3", fonte: `"Bricolage Grotesque", sans-serif`,
    destaques: [["Natação infantil", "Aprender brincando"], ["Adultos", "Do iniciante ao treino"]],
    roteiro: "Bora pra água", titulo: ["Natação pra", "todas as idades"],
    chamada: "Veja as turmas e marque sua aula experimental pelo WhatsApp.", botao: "Aula experimental",
    servicos: [["Infantil", "Aprender brincando", Baby], ["Adultos", "Técnica e condicionamento", Waves],
      ["Hidroginástica", "Exercício leve na água", Droplets], ["Horários", "Turmas a semana toda", Clock]],
    sobre: ["Aula na água", "com segurança"], cta: ["Vamos marcar a primeira aula?", "Chame no WhatsApp e escolha a turma."],
  },
  fisioterapia: {
    foto: "fisioterapia", fundo: "#f2f6f7", cartao: "#ffffff", tinta: "#16303a", suave: "#16303aa8",
    destaque: "#1f7a8c", noDestaque: "#ffffff", mancha: "#cfe6ea", fonte: SERIF,
    roteiro: "Volte a se mexer", titulo: ["Fisioterapia", "pra viver sem dor"],
    chamada: "Conheça os tratamentos e agende sua avaliação pelo WhatsApp.", botao: "Agendar avaliação",
    servicos: [["Ortopédica", "Coluna, joelho e ombro", Activity], ["Esportiva", "Volte a treinar", Dumbbell],
      ["Postura", "Alinhamento do corpo", PersonStanding], ["Avaliação", "Antes de começar", Stethoscope]],
    sobre: ["Tratamento", "com acompanhamento"], cta: ["Vamos cuidar dessa dor?", "Agende sua avaliação pelo WhatsApp."],
  },
  lavajato: {
    foto: "lavajato", escuro: true, fundo: "#0e1116", cartao: "#181c23", tinta: "#eef2f6", suave: "#eef2f6a8",
    destaque: "#2bb3ff", noDestaque: "#0e1116", mancha: "#2bb3ff2e", capa: "#0e1116", fonte: `"Archivo Black", sans-serif`, maiusculo: true,
    destaques: [["Lavagem completa", "Por dentro e por fora"], ["Polimento", "Brilho de carro novo"]],
    roteiro: "Carro brilhando", titulo: ["Seu carro", "limpo e brilhando"],
    chamada: "Veja os serviços e agende a lavagem pelo WhatsApp.", botao: "Agendar lavagem",
    servicos: [["Lavagem", "Por dentro e por fora", Droplets], ["Polimento", "Brilho de carro novo", Sparkles],
      ["Higienização", "Bancos e carpete", SprayCan], ["Hora marcada", "Sem fila", Clock]],
    sobre: ["Cuidado", "em cada detalhe"], cta: ["Bora deixar o carro novo?", "Agende pelo WhatsApp em poucos toques."],
  },
  moda: {
    foto: "moda", fundo: "#f7f3ef", cartao: "#ffffff", tinta: "#211b17", suave: "#211b17a8",
    destaque: "#9c3d52", noDestaque: "#ffffff", mancha: "#efd7da", fonte: `"Cormorant Garamond", serif`, maiusculo: true,
    roteiro: "Novidades na loja", titulo: ["Estilo pra", "todo dia"],
    chamada: "Veja as novidades e reserve a sua peça pelo WhatsApp.", botao: "Reservar pelo WhatsApp",
    servicos: [["Novidades", "Peças que acabaram de chegar", Shirt], ["Calçados e acessórios", "Pra completar o look", ShoppingBag],
      ["Reserva", "Separe pelo WhatsApp", Tag], ["Tamanhos", "Tire a dúvida antes", Ruler]],
    sobre: ["Moda", "pra todo dia"], cta: ["Gostou de alguma peça?", "Chame no WhatsApp que a gente separa."],
  },
  papelaria: {
    foto: "papelaria", fundo: "#fdf8ee", cartao: "#ffffff", tinta: "#24201a", suave: "#24201aa8",
    destaque: "#c4441f", noDestaque: "#ffffff", mancha: "#fbe0c8", fonte: `"Bricolage Grotesque", sans-serif`,
    roteiro: "Lista na mão?", titulo: ["Tudo pra escola", "e pro escritório"],
    chamada: "Mande a lista de material e receba o orçamento pelo WhatsApp.", botao: "Orçamento da lista",
    servicos: [["Material escolar", "Mande a lista pelo WhatsApp", Backpack], ["Escritório", "Papel, caneta e mais", Pencil],
      ["Cadernos", "Pra todos os gostos", BookOpen], ["Presentes", "Pra toda ocasião", Gift]],
    sobre: ["A papelaria", "do seu bairro"], cta: ["Tem uma lista pra fazer?", "Mande pelo WhatsApp que a gente separa."],
  },
  otica: {
    foto: "otica", fundo: "#f3f5f8", cartao: "#ffffff", tinta: "#1b2230", suave: "#1b2230a8",
    destaque: "#2d3a8c", noDestaque: "#ffffff", mancha: "#d9ddf2", fonte: SERIF,
    roteiro: "Enxergue bem", titulo: ["Óculos que", "combinam com você"],
    chamada: "Veja as armações e peça o orçamento das lentes pelo WhatsApp.", botao: "Pedir orçamento",
    servicos: [["Armações", "Pra todos os estilos", Glasses], ["Lentes", "Com a sua receita", Eye],
      ["Óculos de sol", "Proteção com estilo", Sun], ["Ajustes", "Conserto e regulagem", Wrench]],
    sobre: ["Atendimento", "com cuidado"], cta: ["Precisa de óculos novos?", "Mande a receita pelo WhatsApp."],
  },
  construcao: {
    foto: "construcao", fundo: "#f5f3ee", cartao: "#ffffff", tinta: "#1f1d1a", suave: "#1f1d1aa8",
    destaque: "#e8a317", noDestaque: "#1f1d1a", mancha: "#f6e2b3", fonte: `"Archivo Black", sans-serif`, maiusculo: true,
    roteiro: "Sua obra começa aqui", titulo: ["Tudo pra sua obra", "num lugar só"],
    chamada: "Mande a lista e peça o orçamento pelo WhatsApp.", botao: "Pedir orçamento",
    servicos: [["Materiais", "Do básico ao acabamento", Hammer], ["Tintas", "Cores pra cada canto", PaintBucket],
      ["Ferramentas", "Pra obra e pra casa", Wrench], ["Entrega", "Combine pelo WhatsApp", Truck]],
    sobre: ["Atendimento", "de quem entende de obra"], cta: ["Começando uma obra?", "Mande a lista pelo WhatsApp."],
  },
  mercado: {
    foto: "mercado", fundo: "#f6f5ef", cartao: "#ffffff", tinta: "#1f2416", suave: "#1f2416a8",
    destaque: "#d1361f", noDestaque: "#ffffff", mancha: "#f8d6cc", fonte: `"Oswald", sans-serif`, maiusculo: true,
    roteiro: "Ofertas da semana", titulo: ["Tudo pra sua casa", "pertinho de você"],
    chamada: "Veja as ofertas e faça seu pedido pelo WhatsApp.", botao: "Pedir pelo WhatsApp",
    servicos: [["Hortifrúti", "Frutas, verduras e legumes", Carrot], ["Mercearia", "O básico da casa", ShoppingCart],
      ["Ofertas", "Fique de olho", Percent], ["Entrega", "Combine pelo WhatsApp", Bike]],
    sobre: ["O mercado", "do seu bairro"], cta: ["Bora fazer a lista?", "Mande pelo WhatsApp que a gente separa."],
  },
  farmacia: {
    foto: "farmacia", fundo: "#f4f7f6", cartao: "#ffffff", tinta: "#16252a", suave: "#16252aa8",
    destaque: "#c8283a", noDestaque: "#ffffff", mancha: "#f6d3d7", fonte: `"Bricolage Grotesque", sans-serif`,
    roteiro: "Cuidando de você", titulo: ["Sua farmácia", "pertinho de casa"],
    chamada: "Peça seus remédios e produtos pelo WhatsApp.", botao: "Pedir pelo WhatsApp",
    servicos: [["Medicamentos", "Peça pelo WhatsApp", Pill], ["Higiene e beleza", "Tudo pro dia a dia", Sparkles],
      ["Entrega", "Combine pelo WhatsApp", Bike], ["Atendimento", "Tire suas dúvidas", MessageCircle]],
    sobre: ["Atendimento", "de confiança"], cta: ["Precisa de algo?", "Chame no WhatsApp que a gente separa."],
  },
  geral: {
  foto: "geral", fundo: "#f4f6fb", cartao: "#ffffff", tinta: "#18233a", suave: "#18233aa8",
  destaque: "#2457f5", noDestaque: "#ffffff", mancha: "#d6e0fb", fonte: `"Bricolage Grotesque", sans-serif`,
  roteiro: "Vem conferir", titulo: ["Tudo o que você precisa,", "pertinho de casa"],
  chamada: "Veja o que temos e fale direto pelo WhatsApp.", botao: "Falar no WhatsApp",
  servicos: [["Produtos", "Confira as novidades", Store], ["Serviços", "Do jeito que você precisa", Sparkles],
    ["Atendimento", "Rápido pelo WhatsApp", MessageCircle], ["Entrega", "Combine pelo WhatsApp", Bike]],
  sobre: ["O comércio", "do seu bairro"], cta: ["Ficou com alguma dúvida?", "Chame no WhatsApp que a gente responde."],
},
};

/** Tema do ramo; com sub-nicho, as fotos e os textos são os dele (cores e fonte continuam as do ramo). */
export const temaDe = (lead: Lead): Tema => {
  const base = TEMAS[ramoDe(lead).id];
  const sub = subnichoDe(lead);
  const extra = sub && SUBTEMAS[sub.id];
  return extra ? { ...base, ...extra, foto: sub.id } : base;
};

export const arquivo = (nome: string, tipo = "previa") =>
  `${tipo}-${nome.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase() || "site"}.jpg`;

// Fontes da prévia, servidas junto com o painel. A tela e a foto usam os mesmos arquivos:
// a foto não enxerga as fontes do Google, e com letras diferentes o texto quebraria em outro lugar.
export const TEXTO = "Roboto Demo";
const FONTES: Record<string, [arquivo: string, peso: number, estilo?: "italic"][]> = {
  [TEXTO]: [["roboto-400", 400], ["roboto-500", 500], ["roboto-700", 700]],
  Caveat: [["caveat-600", 600]],
  Oswald: [["oswald-600", 600]],
  "Cormorant Garamond": [["cormorant-600", 600], ["cormorant-600-italic", 600, "italic"]],
  Fraunces: [["fraunces-600", 600], ["fraunces-600-italic", 600, "italic"]],
  "Archivo Black": [["archivo-black-400", 400]],
  "Bricolage Grotesque": [["bricolage-700", 700]],
  Anton: [["anton-400", 400]],
  Yellowtail: [["yellowtail-400", 400]],
  "Kaushan Script": [["kaushan-400", 400]],
  Outfit: [["outfit-800", 800]],
};

const face = (familia: string, peso: number, estilo: string | undefined, url: string) =>
  `@font-face{font-family:"${familia}";font-weight:${peso};font-style:${estilo ?? "normal"};font-display:swap;src:url(${url}) format("woff2")}`;

/** As fontes da prévia para a tela (arquivos ao lado do painel). */
export const FONTES_NA_TELA = Object.entries(FONTES)
  .flatMap(([familia, arquivos]) =>
    arquivos.map(([arquivo, peso, estilo]) => face(familia, peso, estilo, `img/demo/fontes/${arquivo}.woff2`)),
  )
  .join("");

const comoDataUrl = (blob: Blob) =>
  new Promise<string>((ok, erro) => {
    const leitor = new FileReader();
    leitor.onload = () => ok(String(leitor.result));
    leitor.onerror = () => erro(leitor.error);
    leitor.readAsDataURL(blob);
  });

/** `@font-face` com os arquivos embutidos; vazio se não conseguir ler (a foto sai com a letra padrão). */
export async function cssDasFontes(familias: string[]) {
  try {
    const faces = await Promise.all(
      familias.flatMap((familia) =>
        (FONTES[familia] ?? []).map(async ([arquivo, peso, estilo]) => {
          const resposta = await fetch(`img/demo/fontes/${arquivo}.woff2`);
          if (!resposta.ok) throw new Error(arquivo);
          const dados = await comoDataUrl(new Blob([await resposta.arrayBuffer()], { type: "font/woff2" }));
          return face(familia, peso, estilo, dados);
        }),
      ),
    );
    return faces.join("");
  } catch {
    return "";
  }
}

type Downloads = { save: (r: { filename: string; data: Blob }) => Promise<unknown> };

/**
 * Manda a foto pro WhatsApp: 1º o compartilhar do celular (foto e texto juntos); 2º salva no celular;
 * 3º devolve a foto para o Brenno segurar e salvar na mão.
 */
export async function compartilharFoto(
  dataUrl: string,
  nome: string,
  mensagem: string,
): Promise<"compartilhou" | "cancelou" | { url: string; salva: boolean }> {
  const blob = await (await fetch(dataUrl)).blob();
  const file = new File([blob], nome, { type: "image/jpeg" });
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], text: mensagem });
      return "compartilhou";
    } catch (e) {
      if ((e as DOMException)?.name === "AbortError") return "cancelou";
    }
  }
  const downloads = (await window.claude?.use?.("downloads").catch(() => null)) as Downloads | null;
  if (downloads) {
    try {
      await downloads.save({ filename: nome, data: blob });
      return { url: dataUrl, salva: true };
    } catch {
      /* recusou ou não deu: mostra a foto para salvar na mão */
    }
  }
  return { url: dataUrl, salva: false };
}

/** Tela cheia com a prévia do site; "Mandar foto" gera a imagem e abre o compartilhar do celular. */
export function Demonstracao({
  lead,
  mensagem,
  onFechar,
  onRamo,
}: {
  lead: Lead;
  /** Texto que vai junto com a foto no WhatsApp. */
  mensagem: string;
  onFechar: () => void;
  /** O Brenno trocou o ramo: muda o estilo e as fotos da prévia (e o texto das mensagens). */
  /** "ramo" ou "ramo/sub-nicho". */
  onRamo: (valor: string) => void;
}) {
  const t = temaDe(lead);
  const familia = familiaDe(ramoDe(lead).id, subnichoDe(lead));
  const [fotoReal, setFotoReal] = useState(true);
  const fechar = useRef<HTMLButtonElement>(null);
  const pagina = useRef<HTMLElement>(null);
  const [aviso, setAviso] = useState("");
  const [gerando, setGerando] = useState(false);
  const [foto, setFoto] = useState<{ url: string; salva: boolean } | null>(null);

  useEffect(() => {
    fechar.current?.focus();
    const tecla = (e: KeyboardEvent) => e.key === "Escape" && onFechar();
    window.addEventListener("keydown", tecla);
    return () => window.removeEventListener("keydown", tecla);
  }, [onFechar]);
  useEffect(() => {
    if (!aviso) return;
    const timer = window.setTimeout(() => setAviso(""), 3200);
    return () => window.clearTimeout(timer);
  }, [aviso]);

  const linkConversa = `https://wa.me/${numeroConversa(lead).replace(/\D/g, "")}?text=${encodeURIComponent(mensagem)}`;

  /** Desenha a página inteira numa foto JPG (sem o botão flutuante). */
  async function gerarFoto() {
    const el = pagina.current!;
    await Promise.all([...el.querySelectorAll("img")].map((img) => img.decode().catch(() => undefined)));
    await document.fonts.ready;
    const doTitulo = /"([^"]+)"/.exec(t.fonte)?.[1];
    return toJpeg(el, {
      pixelRatio: 2,
      quality: 0.9,
      backgroundColor: t.fundo,
      fontEmbedCSS: await cssDasFontes([TEXTO, ESCRITA[familia], ...(doTitulo ? [doTitulo] : [])]),
      filter: (no: HTMLElement) => !(no instanceof HTMLElement && no.dataset.foraDaFoto !== undefined),
    });
  }

  async function mandarFoto() {
    if (gerando) return;
    setGerando(true);
    try {
      const r = await compartilharFoto(await gerarFoto(), arquivo(lead.nome), mensagem);
      if (r === "compartilhou") setAviso("Escolha o WhatsApp e a conversa da loja.");
      else if (r !== "cancelou") setFoto(r);
    } catch {
      setAviso("Não consegui gerar a foto. Tire um print da tela e mande.");
    } finally {
      setGerando(false);
    }
  }

  const cidade = lugarDe(lead);
  // Capa: a foto da própria loja no Google Maps; se não carregar, a foto do sub-nicho.
  const capa = lead.foto && fotoReal ? `${lead.foto}=w720-h900-k-no` : `img/demo/${t.foto}-1.webp`;
  const ramoDaLoja = ramoDe(lead);
  // O tipo do Google só aparece quando é do ramo que está na tela.
  const tipo = lead.tipo?.trim();
  const sub = subnichoDe(lead);
  const ramo = sub?.nome ?? (tipo && (ramoDaLoja.id === "geral" || ramoDaLoja.tipo.test(tipo)) ? tipo : ramoDaLoja.nome);
  const demo = (oque: string) => () => setAviso(`No site de verdade, ${oque}`);

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Demonstração do site de ${lead.nome}`}
      className="fixed inset-0 z-[80] flex flex-col bg-[var(--blk-scrim)] backdrop-blur-sm"
    >
      <div className="flex shrink-0 items-center gap-2.5 border-b border-[color:var(--bjork-border)] bg-[var(--bjork-panel)] px-3 py-2.5 text-[color:var(--bjork-text)]">
        <button
          ref={fechar}
          type="button"
          onClick={onFechar}
          aria-label="Fechar demonstração"
          className="grid size-10 shrink-0 cursor-pointer place-items-center rounded-full bg-[var(--bjork-surface-active)] focus-visible:ring-2 focus-visible:ring-[color:var(--bjork-accent)]"
        >
          <X aria-hidden="true" className="size-5" />
        </button>
        <p className="min-w-0 flex-1 truncate text-[13.5px] font-semibold">Prévia: {lead.nome}</p>
        <button
          type="button"
          onClick={mandarFoto}
          disabled={gerando}
          className="inline-flex h-10 shrink-0 cursor-pointer items-center gap-2 rounded-full bjork-fill px-4 text-[13.5px] font-semibold text-[color:var(--blk-accent-fill-ink)] disabled:opacity-70 focus-visible:ring-2 focus-visible:ring-white"
        >
          {gerando ? <Loader2 aria-hidden="true" className="size-4 animate-spin" /> : <Send aria-hidden="true" className="size-4" />}
          {gerando ? "Gerando foto…" : "Mandar foto"}
        </button>
      </div>

      <label className="flex shrink-0 items-center gap-2.5 border-b border-[color:var(--bjork-border)] bg-[var(--bjork-panel)] px-3 py-2 text-[13px] text-[color:var(--bjork-text-muted)]">
        <span className="shrink-0">Estilo da prévia</span>
        <select
          value={sub ? `${ramoDaLoja.id}/${sub.id}` : ramoDaLoja.id}
          onChange={(e) => onRamo(e.target.value)}
          className="h-9 min-w-0 flex-1 cursor-pointer rounded-[9px] border border-[color:var(--bjork-border-strong)] bg-[var(--bjork-field)] px-2.5 text-[13.5px] font-medium text-[color:var(--bjork-text)] focus-visible:border-[color:var(--bjork-accent)] focus-visible:outline-none"
        >
          {RAMOS_ESCOLHA.map((r) => {
            const subs = SUBNICHOS.filter((x) => x.ramo === r.id || x.outrosRamos?.includes(r.id));
            return subs.length ? (
              <optgroup key={r.id} label={r.opcao ?? r.nome}>
                <option value={r.id}>{r.nome} (geral)</option>
                {subs.map((x) => (
                  <option key={x.id} value={`${r.id}/${x.id}`}>
                    {x.nome}
                  </option>
                ))}
              </optgroup>
            ) : (
              <option key={r.id} value={r.id}>
                {r.opcao ?? r.nome}
              </option>
            );
          })}
        </select>
      </label>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <article
          ref={pagina}
          className="relative mx-auto w-full max-w-[460px] overflow-hidden shadow-[0_0_60px_rgba(0,0,0,.45)]"
          style={{ background: t.fundo, color: t.tinta, fontFamily: `"${TEXTO}", "Roboto", system-ui, sans-serif` }}
        >
          <style>{FONTES_NA_TELA}</style>
          <PaginaPremium
            lead={lead}
            t={t}
            familia={familia}
            capa={capa}
            onCapaErro={() => setFotoReal(false)}
            ramoNome={ramo}
            cidade={cidade}
            demo={demo}
          />

          <button
            type="button"
            data-fora-da-foto=""
            onClick={demo(`este botão abre o WhatsApp da ${lead.nome}.`)}
            aria-label="Botão do WhatsApp"
            className="sticky bottom-4 left-full z-10 -mt-14 mb-4 mr-4 grid size-14 cursor-pointer place-items-center rounded-full shadow-[0_10px_24px_rgba(0,0,0,.35)]"
            style={{ background: "#25d366", color: "#ffffff" }}
          >
            <MessageCircle aria-hidden="true" className="size-7" />
          </button>
        </article>
      </div>

      {foto && (
        <div className="absolute inset-0 z-10 flex flex-col bg-[var(--bjork-bg)]">
          <div className="flex items-center gap-2.5 border-b border-[color:var(--bjork-border)] px-3 py-2.5 text-[color:var(--bjork-text)]">
            <button type="button" onClick={() => setFoto(null)} aria-label="Voltar para a prévia" className="grid size-10 place-items-center rounded-full bg-[var(--bjork-surface-active)]">
              <X aria-hidden="true" className="size-5" />
            </button>
            <p className="min-w-0 flex-1 text-[13px] leading-snug">
              {foto.salva
                ? "Foto salva. Toque em WhatsApp e, na conversa, no clipe para escolher a foto."
                : "Toque e segure a foto para salvar. Depois toque em WhatsApp e mande na conversa."}
            </p>
            <a href={linkConversa} target="_blank" rel="noopener noreferrer" className="inline-flex h-10 items-center gap-2 rounded-full bg-[#25d366] px-4 text-[13.5px] font-semibold text-white">
              <MessageCircle aria-hidden="true" className="size-4" /> WhatsApp
            </a>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto p-4">
            <img src={foto.url} alt={`Foto da prévia do site de ${lead.nome}`} className="mx-auto w-full max-w-[460px] rounded-[12px]" />
          </div>
        </div>
      )}

      {aviso && (
        <p
          role="status"
          className="absolute bottom-6 left-1/2 z-20 max-w-[88%] -translate-x-1/2 rounded-[12px] border border-[color:var(--bjork-border-strong)] bg-[var(--bjork-menu)] px-4 py-2.5 text-center text-[13.5px] font-medium text-[color:var(--bjork-text)] shadow-[var(--bjork-shadow-menu)]"
        >
          {aviso}
        </p>
      )}
    </div>,
    document.body,
  );
}

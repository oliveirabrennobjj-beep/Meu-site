import { Word, findAt } from "./lib";
import raw from "./words.json";

export const WORDS = (raw as Word[]).filter((w) => !w.t.startsWith("["));
export const at = (phrase: string, off = 0) => findAt(WORDS, phrase) + off;
export const DURATION_S = WORDS[WORDS.length - 1].e + 2;

export const T = {
  semEsgoto: 0,
  privada: at("pra onde vai tudo"),
  cava: at("você cava um buraco"),
  cheiro: at("o cheiro sobe"),
  contamina: at("contamina a água"),
  fossa: at("então você constrói"),
  nome: at("a fossa séptica"),
  entra: at("o esgoto entra"),
  pesado: at("o que é pesado"),
  gordura: at("a gordura sobe"),
  meio: at("e no meio"),
  bacterias: at("são bactérias"),
  semOxigenio: at("sem precisar de oxigênio"),
  naoLimpo: at("só que esse líquido"),
  filtro: at("passa por um filtro"),
  sumidouro: at("vai pro sumidouro"),
  terra: at("a própria terra"),
  longe: at("tem que ficar bem longe"),
  caminhao: at("chega o caminhão"),
  tirar: at("pra tirar o lodo"),
  semIsso: at("sem isso"),
  volta: at("o esgoto volta"),
  parabens: at("parabéns"),
  cta: at("comenta aí"),
};

/** Pontos da câmera: [início, posição, alvo]. A câmera desliza até cada um. */
export const CAM: [number, [number, number, number], [number, number, number]][] = [
  [T.semEsgoto, [-3, 4, 19], [-7.5, -0.3, -1.5]],
  [T.privada, [-4, 1.5, 16], [-6, -0.5, 0]],
  [T.cava, [-1, 2.5, 19], [-3.6, -1.2, 0]],
  [T.contamina, [5, 5, 34], [4, -2.4, 0]],
  [T.fossa, [0, 1, 17], [-2, -2.4, 0.6]],
  [T.pesado, [-0.5, -1.5, 13], [-2, -2.8, 0.6]],
  [T.gordura, [-0.5, -0.5, 13], [-2, -2.2, 0.6]],
  [T.bacterias, [-1.2, -1.8, 9.5], [-2, -2.5, 0.6]],
  [T.filtro, [3, 0.5, 17], [1, -2.4, 0.6]],
  [T.sumidouro, [7, 0.5, 17], [4.6, -2.6, 0.8]],
  [T.longe, [6, 6, 44], [4, -2, 0]],
  [T.caminhao, [3.5, 4.5, 22], [0, -0.2, -1]],
  [T.semIsso, [-2, 2, 21], [-4.5, -1.2, 0]],
  [T.parabens, [3, 8, 52], [1.5, -2, 0]],
];

export const LABELS: { text: string; from: number; to: number; p: [number, number, number]; tone?: "red" | "blue" | "green" }[] = [
  { text: "SEM REDE DE ESGOTO", from: 0.6, to: T.privada, p: [-8, 3.4, -2.5], tone: "red" },
  { text: "PRIVADA", from: T.privada + 0.3, to: T.cava, p: [-6.6, 1.4, 0.5] },
  { text: "BURACO", from: T.cava + 0.6, to: T.cheiro, p: [-2, 0.6, 0.6] },
  { text: "CHEIRO", from: T.cheiro + 0.2, to: T.contamina, p: [-2, 2.4, 0.5], tone: "red" },
  { text: "POÇO CONTAMINADO", from: T.contamina + 0.4, to: T.fossa, p: [9.8, 1.8, 0], tone: "red" },
  { text: "FOSSA SÉPTICA", from: T.nome, to: T.entra, p: [-2, -0.3, 0.8] },
  { text: "ENTRADA", from: T.entra + 0.3, to: T.pesado, p: [-4.6, -0.9, 0.6] },
  { text: "LODO", from: T.pesado + 0.6, to: T.gordura, p: [-2, -3.2, 1.4] },
  { text: "CROSTA DE GORDURA", from: T.gordura + 0.5, to: T.meio, p: [-2, -1.25, 1.4] },
  { text: "LÍQUIDO", from: T.meio + 0.3, to: T.bacterias, p: [-2, -2.3, 1.4], tone: "blue" },
  { text: "BACTÉRIAS", from: T.bacterias + 0.2, to: T.semOxigenio, p: [-2, -1.9, 1.4], tone: "green" },
  { text: "SEM OXIGÊNIO", from: T.semOxigenio, to: T.naoLimpo, p: [-2, -1.9, 1.4], tone: "green" },
  { text: "FILTRO DE PEDRAS", from: T.filtro + 0.3, to: T.sumidouro, p: [2, -0.7, 0.8] },
  { text: "SUMIDOURO", from: T.sumidouro + 0.3, to: T.terra, p: [5.8, -0.9, 1.0] },
  { text: "A TERRA FILTRA", from: T.terra, to: T.longe, p: [5.8, -4.7, 1.2], tone: "blue" },
  { text: "BEM LONGE DO POÇO", from: T.longe + 0.4, to: T.caminhao, p: [8, 1.6, 0], tone: "blue" },
  { text: "LIMPA-FOSSA", from: T.caminhao + 0.8, to: T.semIsso, p: [1, 3.4, -2] },
  { text: "TRANSBORDA!", from: T.semIsso + 0.4, to: T.parabens, p: [-2, -0.3, 0.8], tone: "red" },
];

export const SFX: { src: string; at: number; vol: number }[] = [
  { src: "sfx/whoosh.mp3", at: T.privada - 0.2, vol: 0.4 },
  { src: "sfx/snap.mp3", at: T.cava + 0.3, vol: 0.5 },
  { src: "sfx/alarm.mp3", at: T.contamina + 0.3, vol: 0.25 },
  { src: "sfx/whoosh.mp3", at: T.fossa - 0.2, vol: 0.4 },
  { src: "sfx/ding.mp3", at: T.nome, vol: 0.5 },
  { src: "sfx/pop.mp3", at: T.pesado + 0.6, vol: 0.5 },
  { src: "sfx/pop.mp3", at: T.gordura + 0.5, vol: 0.5 },
  { src: "sfx/pop.mp3", at: T.bacterias + 0.2, vol: 0.5 },
  { src: "sfx/whoosh.mp3", at: T.filtro - 0.2, vol: 0.4 },
  { src: "sfx/whoosh.mp3", at: T.sumidouro - 0.2, vol: 0.4 },
  { src: "sfx/air.mp3", at: T.caminhao + 2.5, vol: 0.4 },
  { src: "sfx/alarm.mp3", at: T.semIsso + 0.4, vol: 0.3 },
  { src: "sfx/party.mp3", at: T.parabens, vol: 0.5 },
];

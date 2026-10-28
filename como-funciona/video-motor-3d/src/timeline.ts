import { Easing } from "remotion";
import { Word, findAt } from "./lib";
import raw from "./words.json";
import type { PlanItem } from "./Guy";

export const WORDS = (raw as Word[]).filter((w) => !w.t.startsWith("["));
export const at = (phrase: string, off = 0) => findAt(WORDS, phrase) + off;
export const DURATION_S = WORDS[WORDS.length - 1].e + 2;

export const T = {
  tubo: at("começa com um tubo"),
  combustivel: at("um pouco de combustível"),
  faisca: at("e uma faísca"),
  bum: at("bum"),
  voa: at("só que ela voa"),
  pistao: at("então você troca a tampa"),
  problema: at("problema"),
  roda: at("e a roda do carro"),
  virabrequim: at("então você liga o pistão"),
  pedal: at("igual o pedal"),
  deVez: at("mas a explosão só empurra"),
  volante: at("quem segura o giro"),
  falta: at("agora falta o principal"),
  valvulas: at("você coloca duas portinhas"),
  quatroTempos: at("e o motor passa"),
  um: at("um o pistão desce"),
  dois: at("dois o pistão sobe"),
  tres: at("três a vela"),
  quatro: at("quatro o pistão sobe"),
  soUm: at("só um desses tempos"),
  cilindros: at("então você coloca quatro cilindros"),
  ordem: at("um três quatro dois"),
  liso: at("assim sempre tem"),
  parabens: at("parabéns"),
  cta: at("comenta aí"),
};

/** Medidas do motor: virabrequim em (0, YC) girando em volta do eixo z. */
export const M = {
  yc: 1.9,
  r: 0.5, // raio da manivela
  L: 1.6, // biela
  bore: 0.55, // raio do cilindro
  cylBot: 2.75,
  head: 4.55, // fundo do cabeçote
  gap: 1.5, // distância entre cilindros (em z)
  tire: [2.9, 1.9, 0] as [number, number, number],
};

/** Ordem de ignição 1-3-4-2: atraso (em meio giro) de cada cilindro. */
export const OFFSET = [0, 3, 1, 2].map((k) => k * Math.PI);

const clamp = (x: number) => Math.min(1, Math.max(0, x));
const ease = Easing.inOut(Easing.cubic);
const TAU = Math.PI * 2;
const W_FAST = 2.2 * TAU; // giros por segundo * 2π
const W_SLOW = 0.9 * TAU;

/** Giro que acelera de w0 até w1 em `ramp` segundos (integral da velocidade). */
const spin = (d: number, w0: number, w1: number, ramp: number) => {
  if (d <= 0) return 0;
  const k = Math.min(d, ramp);
  return w0 * d + ((w1 - w0) * k * k) / (2 * ramp) + (d > ramp ? (w1 - w0) * (d - ramp) : 0);
};

/** Ângulo do virabrequim (0 = pistão lá em cima, começo da admissão). */
export const theta = (t: number): number => {
  if (t < T.virabrequim) return 0;
  // 1) liga devagar e gira até as válvulas
  const a0 = spin(T.valvulas - T.virabrequim, 0, W_SLOW, 1);
  if (t < T.valvulas) return spin(t - T.virabrequim, 0, W_SLOW, 1);
  // 2) desacelera até parar no começo de um ciclo
  const stop = Math.ceil(a0 / (2 * TAU)) * 2 * TAU + 2 * TAU;
  if (t < T.um) return a0 + (stop - a0) * Easing.out(Easing.cubic)(clamp((t - T.valvulas) / (T.um - T.valvulas - 0.3)));
  // 3) os 4 tempos, meio giro em cada frase
  const marks = [T.um, T.dois, T.tres, T.quatro, T.soUm];
  for (let k = 0; k < 4; k++) {
    if (t < marks[k + 1]) return stop + k * Math.PI + Math.PI * ease(clamp((t - marks[k]) / Math.min(2.2, marks[k + 1] - marks[k] - 0.2)));
  }
  // 4) volta a girar e acelera quando o motor "fica liso"
  const base = stop + 4 * Math.PI;
  if (t < T.liso) return base + spin(t - T.soUm, 0, W_SLOW * 0.5, 1);
  return base + spin(T.liso - T.soUm, 0, W_SLOW * 0.5, 1) + spin(t - T.liso, W_SLOW * 0.5, W_FAST, 2);
};

/** Fase dentro do ciclo de 4 tempos (0 a 4π) de um cilindro. */
export const phase = (t: number, cyl = 0) => {
  const a = theta(t) - OFFSET[cyl];
  return ((a % (2 * TAU)) + 2 * TAU) % (2 * TAU);
};

/** Altura do pino do pistão para um ângulo a. */
export const pinY = (a: number) => M.yc + M.r * Math.cos(a) + Math.sqrt(M.L * M.L - (M.r * Math.sin(a)) ** 2);

/** Antes do virabrequim o pistão só sobe e desce com as explosões. */
export const pistonPin = (t: number, cyl = 0) => {
  if (t < T.virabrequim) {
    const d = Math.max(0, t - T.pistao - 0.8);
    return M.yc + M.L + Math.cos(d * 4.2) * M.r;
  }
  return pinY(theta(t) - OFFSET[cyl]);
};

export const PLAN: PlanItem[] = [
  [0, -2.2, 1.2, "wave", 0.5],
  [T.tubo, -2.0, 1.0, "point", 1.0],
  [T.bum, -2.6, 1.3, "panic", 0.4],
  [T.voa, -2.4, 1.2, "worried", 0.5],
  [T.pistao, -2.0, 1.0, "thumbs", 0.6],
  [T.problema, -2.0, 1.0, "worried", 0.3],
  [T.virabrequim, -2.0, 1.0, "point", 1.0],
  [T.pedal, -2.0, 1.0, "thumbs", 0.4],
  [T.volante, -2.0, 1.0, "point", 1.1],
  [T.falta, -2.0, 1.0, "nose", 0.3],
  [T.valvulas, -2.0, 1.0, "point", 0.9],
  [T.um, -2.0, 1.0, "point", 0.9],
  [T.soUm, -2.0, 1.0, "thumbs", 0.4],
  [T.cilindros, -2.3, 2.2, "point", 1.2],
  [T.parabens, -2.3, 2.2, "party", 0.5],
];

export const CAM: [number, [number, number, number], [number, number, number]][] = [
  [0, [0.6, 3.4, 14.5], [0.2, 2.9, -0.3]],
  [T.tubo, [0.6, 3.8, 9.5], [0, 3.6, 0]],
  [T.voa, [0.4, 6.0, 12.5], [0, 5.4, 0]],
  [T.pistao, [0.6, 3.8, 9.5], [0, 3.5, 0]],
  [T.problema, [2.0, 3.0, 13.5], [1.2, 2.9, 0]],
  [T.virabrequim, [1.2, 2.6, 12.5], [0.9, 3.3, 0]],
  [T.deVez, [3.6, 3.0, 10.5], [0.6, 3.0, -0.6]],
  [T.falta, [0.4, 4.6, 8.5], [0, 4.4, 0]],
  [T.um, [0.3, 3.9, 8], [0, 3.8, 0]],
  [T.soUm, [0.8, 3.4, 12], [0.4, 3.0, 0]],
  [T.cilindros, [9.5, 5.6, 7.5], [0, 3.9, -2.4]],
  [T.parabens, [8.5, 6.5, 12], [0.4, 3.4, -2.0]],
];

const C = ["ADMISSÃO", "COMPRESSÃO", "EXPLOSÃO", "ESCAPE"];

export const LABELS: { text: string; from: number; to: number; p: [number, number, number]; tone?: "red" | "blue" | "green"; screen?: [number, number] }[] = [
  { text: "TUBO FECHADO", from: T.tubo + 0.3, to: T.combustivel, p: [0, 5.0, 0] },
  { text: "COMBUSTÍVEL", from: T.combustivel + 0.2, to: T.faisca, p: [0, 5.0, 0], tone: "green" },
  { text: "FAÍSCA", from: T.faisca + 0.2, to: T.bum, p: [0.9, 3.2, 0.3], tone: "blue" },
  { text: "NÃO SERVE PRA NADA", from: T.voa + 0.6, to: T.pistao, p: [0, 5.2, 0], tone: "red" },
  { text: "PISTÃO", from: T.pistao + 1.0, to: T.problema, p: [1.3, 3.4, 0.3] },
  { text: "CILINDRO", from: T.pistao + 1.8, to: T.problema, p: [-1.4, 4.2, 0.3] },
  { text: "SÓ SOBE E DESCE", from: T.problema + 0.3, to: T.roda, p: [0, 5.3, 0], tone: "red" },
  { text: "A RODA PRECISA GIRAR", from: T.roda + 0.3, to: T.virabrequim, p: [M.tire[0] - 0.9, 3.4, 0.3], tone: "red" },
  { text: "VIRABREQUIM", from: T.virabrequim + 0.9, to: T.pedal, p: [1.7, 2.3, 0.6] },
  { text: "BIELA", from: T.virabrequim + 1.5, to: T.pedal, p: [-1.0, 2.6, 0.4] },
  { text: "SOBE E DESCE → GIRO", from: T.pedal + 0.2, to: T.deVez, p: [0, 5.3, 0], tone: "blue" },
  { text: "VOLANTE", from: T.volante + 0.6, to: T.falta, p: [-1.1, 3.3, -0.9] },
  { text: "VÁLVULAS", from: T.valvulas + 0.8, to: T.quatroTempos, p: [0, 5.4, 0] },
  { text: "VELA", from: T.valvulas + 1.6, to: T.quatroTempos, p: [0.55, 5.6, 0.2], tone: "blue" },
  { text: "1 · " + C[0], from: T.um, to: T.dois - 0.1, p: [0, 5.5, 0], tone: "blue" },
  { text: "2 · " + C[1], from: T.dois, to: T.tres - 0.1, p: [0, 5.5, 0], tone: "blue" },
  { text: "3 · " + C[2] + " 💥", from: T.tres, to: T.quatro - 0.1, p: [0, 5.5, 0], tone: "red" },
  { text: "4 · " + C[3], from: T.quatro, to: T.soUm, p: [0, 5.5, 0] },
  { text: "SÓ O 3 DÁ FORÇA", from: T.soUm + 0.3, to: T.cilindros, p: [0, 5.5, 0], tone: "green" },
  { text: "ORDEM 1 · 3 · 4 · 2", from: T.ordem, to: T.parabens, p: [0, 0, 0], tone: "red", screen: [540, 1330] },
];

export const SFX: { src: string; at: number; vol: number }[] = [
  { src: "sfx/whoosh.mp3", at: T.tubo - 0.2, vol: 0.35 },
  { src: "sfx/pop.mp3", at: T.combustivel + 0.3, vol: 0.4 },
  { src: "sfx/click.mp3", at: T.faisca + 0.2, vol: 0.5 },
  { src: "sfx/air.mp3", at: T.bum, vol: 0.6 },
  { src: "sfx/whoosh.mp3", at: T.bum + 0.15, vol: 0.5 },
  { src: "sfx/snap.mp3", at: T.pistao + 0.6, vol: 0.5 },
  { src: "sfx/alarm.mp3", at: T.problema + 0.2, vol: 0.2 },
  { src: "sfx/pop.mp3", at: T.virabrequim + 0.5, vol: 0.5 },
  { src: "sfx/pop.mp3", at: T.volante + 0.4, vol: 0.5 },
  { src: "sfx/snap.mp3", at: T.valvulas + 0.6, vol: 0.5 },
  { src: "sfx/air.mp3", at: T.um + 0.2, vol: 0.3 },
  { src: "sfx/air.mp3", at: T.tres + 0.1, vol: 0.55 },
  { src: "sfx/whoosh.mp3", at: T.quatro + 0.2, vol: 0.3 },
  { src: "sfx/whoosh.mp3", at: T.cilindros, vol: 0.4 },
  { src: "sfx/ding.mp3", at: T.ordem, vol: 0.4 },
  { src: "sfx/party.mp3", at: T.parabens, vol: 0.5 },
];

import { Word, appear, findAt, windowed } from "./lib";
import raw from "./words.json";
import type { PlanItem } from "./Guy";

export const WORDS = (raw as Word[]).filter((w) => !w.t.startsWith("["));
export const at = (phrase: string, off = 0) => findAt(WORDS, phrase) + off;
export const DURATION_S = WORDS[WORDS.length - 1].e + 2;

export const T = {
  cavar: 0,
  desaba: at("mas a terra de cima"),
  maquina: at("então você usa uma máquina"),
  roda: at("com uma roda cheia"),
  tatuzao: at("esse é o tatuzão"),
  aneis: at("e logo atrás"),
  revestimento: at("esse é o revestimento"),
  fumaca: at("mas lá dentro"),
  ventiladores: at("então você pendura"),
  ventilacao: at("essa é a ventilação"),
  agua: at("mas a água da chuva"),
  manta: at("então você coloca uma manta"),
  canaletas: at("e canaletas"),
  drenagem: at("essa é a drenagem"),
  fim: at("e é assim"),
  cta: at("comenta aí"),
};

/** Túnel ao longo de x, centro em (y = Y_T, z = Z_T), raio R. O morro vai de -X_P a X_P. */
export const Y_T = 1.35;
export const Z_T = -0.75;
export const R = 1.25;
export const X_P = 7.4;

/** Ponta do buraco no começo (cavado à mão). */
export const furoAte = (t: number) => -X_P - 0.3 + (2 * X_P + 0.6) * appear(t, 0.4, T.desaba - 0.8);
/** A terra que desabou (some quando a máquina passa). */
export const desabou = (t: number) => appear(t, T.desaba + 0.3, 0.9);
/** Posição da frente do tatuzão. */
export const tbmX = (t: number) => {
  const a = T.maquina + 0.4;
  const b = T.fumaca - 0.3;
  if (t < a) return -X_P - 4;
  if (t > b) return X_P + 4.5;
  return -X_P - 4 + (2 * X_P + 8.5) * ((t - a) / (b - a));
};
/** Até onde já tem anel de concreto. */
export const aneisAte = (t: number) => {
  if (t < T.aneis + 0.3) return -X_P - 1;
  return Math.min(X_P + 0.3, Math.max(-X_P - 1, tbmX(t) - 3.4));
};
export const fumaca = (t: number) => windowed(t, T.fumaca + 0.4, T.ventilacao + 1.5, 0.8);
export const ventOn = (t: number) => t > T.ventiladores + 0.8;
export const chuva = (t: number) => windowed(t, T.agua + 0.2, T.fim, 0.4);
export const manta = (t: number) => appear(t, T.manta + 0.4, 0.7);

export const PLAN: PlanItem[] = [
  [0, -8.6, 1.4, "wave", 0.9],
  [0.8, -8.6, 1.4, "dig", 0.9],
  [T.desaba, -8.6, 1.4, "panic", 0.9],
  [T.maquina, -8.6, 1.4, "point", 0.9],
  [T.tatuzao, -8.6, 1.4, "thumbs", 0.9],
  [T.fumaca, -8.6, 1.4, "worried", 0.9],
  [T.ventilacao, -8.6, 1.4, "thumbs", 0.9],
  [T.agua, -8.6, 1.4, "worried", 0.9],
  [T.drenagem, -8.6, 1.4, "thumbs", 0.9],
  [T.fim, -8.6, 1.4, "party", 0.6],
];

export const CAM: [number, [number, number, number], [number, number, number]][] = [
  [0, [-4.5, 3.6, 16], [-2.5, 2.2, Z_T]],
  [T.desaba, [-1, 3.2, 12], [0, 1.6, Z_T]],
  [T.maquina, [-6.5, 3.0, 10.5], [-6.5, 1.5, Z_T]],
  [T.tatuzao, [-2.0, 2.6, 8.5], [-2.0, 1.4, Z_T]],
  [T.aneis, [-4.0, 2.4, 8.5], [-4.0, 1.3, Z_T]],
  [T.fumaca, [0.5, 3.2, 13.5], [0, 1.5, Z_T]],
  [T.ventiladores, [1.8, 2.8, 8.5], [1.8, 1.8, Z_T]],
  [T.agua, [0, 6.5, 19], [0, 3.2, Z_T]],
  [T.manta, [-1.2, 2.2, 7.5], [-1.2, 1.1, Z_T]],
  [T.fim, [0, 6.5, 33], [0, 2.6, Z_T]],
];

type Tone = "red" | "blue" | "green" | "yellow";
const S: [number, number] = [540, 1250];

export const LABELS: { text: string; from: number; to: number; p: [number, number, number]; tone?: Tone; screen?: [number, number] }[] = [
  { text: "MORRO", from: 0.6, to: T.desaba, p: [-2.5, 5.0, 0.4] },
  { text: "DESABOU!", from: T.desaba + 0.8, to: T.maquina, p: [0, Y_T + 1.6, 0.4], tone: "red" },
  { text: "RODA DE LÂMINAS", from: T.roda + 0.8, to: T.tatuzao, p: [0, 0, 0], tone: "yellow", screen: [540, 640] },
  { text: "ANÉIS DE CONCRETO", from: T.aneis + 1.2, to: T.revestimento + 0.6, p: [-5.5, Y_T + 1.6, 0.4], tone: "blue" },
  { text: "FUMAÇA PRESA!", from: T.fumaca + 1.0, to: T.ventiladores, p: [0, Y_T + 1.8, 0.4], tone: "red" },
  { text: "VENTILADOR", from: T.ventiladores + 1.0, to: T.ventilacao + 0.6, p: [1.8, Y_T + 1.5, 0.4] },
  { text: "AR SUJO PRA FORA", from: T.ventiladores + 1.8, to: T.ventilacao + 1.0, p: [0, 0, 0], tone: "green", screen: S },
  { text: "CHUVA", from: T.agua + 0.6, to: T.manta, p: [0, 6.8, 0.4], tone: "blue" },
  { text: "PINGANDO!", from: T.agua + 1.4, to: T.manta, p: [0, Y_T + 1.6, 0.4], tone: "red" },
  { text: "MANTA", from: T.manta + 0.9, to: T.drenagem, p: [-1.2, Y_T + 1.6, 0.4], tone: "blue" },
  { text: "CANALETA", from: T.canaletas + 0.6, to: T.drenagem + 0.6, p: [-1.2, 0.2, 0.5], tone: "green" },
  { text: "TATUZÃO", from: T.fim + 0.3, to: DURATION_S, p: [6.5, Y_T + 1.7, 0.4], tone: "yellow" },
  { text: "VENTILAÇÃO", from: T.fim + 0.45, to: DURATION_S, p: [-3.0, Y_T + 1.7, 0.4] },
  { text: "REVESTIMENTO", from: T.fim + 0.6, to: DURATION_S, p: [0, 0, 0.4], tone: "blue" },
];

export const TERMS: { text: string; at: number; to: number }[] = [
  { text: "TATUZÃO", at: T.tatuzao, to: T.aneis },
  { text: "REVESTIMENTO", at: T.revestimento, to: T.fumaca },
  { text: "VENTILAÇÃO", at: T.ventilacao, to: T.agua },
  { text: "DRENAGEM", at: T.drenagem, to: T.fim },
];

export const SFX: { src: string; at: number; vol: number }[] = [
  { src: "sfx/whoosh.mp3", at: 0.2, vol: 0.4 },
  { src: "sfx/click.mp3", at: 1.0, vol: 0.4 },
  { src: "sfx/snap.mp3", at: T.desaba + 0.3, vol: 0.6 },
  { src: "sfx/alarm.mp3", at: T.desaba + 0.9, vol: 0.25 },
  { src: "sfx/pop.mp3", at: T.maquina + 0.5, vol: 0.5 },
  { src: "sfx/air.mp3", at: T.roda + 0.4, vol: 0.45 },
  { src: "sfx/ding.mp3", at: T.tatuzao, vol: 0.45 },
  { src: "sfx/click.mp3", at: T.aneis + 0.8, vol: 0.5 },
  { src: "sfx/ding.mp3", at: T.revestimento, vol: 0.45 },
  { src: "sfx/alarm.mp3", at: T.fumaca + 1.0, vol: 0.25 },
  { src: "sfx/air.mp3", at: T.ventiladores + 0.8, vol: 0.5 },
  { src: "sfx/ding.mp3", at: T.ventilacao, vol: 0.45 },
  { src: "sfx/air.mp3", at: T.agua + 0.3, vol: 0.35 },
  { src: "sfx/pop.mp3", at: T.manta + 0.6, vol: 0.5 },
  { src: "sfx/ding.mp3", at: T.drenagem, vol: 0.45 },
  { src: "sfx/party.mp3", at: T.fim, vol: 0.5 },
];

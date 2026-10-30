import { Word, appear, findAt, windowed } from "./lib";
import raw from "./words.json";
import type { PlanItem } from "./Guy";

export const WORDS = (raw as Word[]).filter((w) => !w.t.startsWith("["));
export const at = (phrase: string, off = 0) => findAt(WORDS, phrase) + off;
export const DURATION_S = WORDS[WORDS.length - 1].e + 2;

export const T = {
  placa: 0,
  dobra: at("mas se você dobrar"),
  empurra: at("é que a caixa"),
  casco: at("esse é o casco"),
  ondas: at("mas com o vento"),
  peso: at("então você coloca peso"),
  lastro: at("esse é o lastro"),
  furar: at("mas se o casco furar"),
  divide: at("então você divide"),
  enche: at("se uma enche"),
  anteparas: at("essas são as anteparas"),
  remo: at("mas um navio"),
  motor: at("então você coloca um motor"),
  helice: at("essa é a hélice"),
  virar: at("e pra virar"),
  leme: at("esse é o leme"),
  fim: at("e é assim"),
  cta: at("comenta aí"),
};

/** Medidas do casco (origem do navio na linha d'água). */
export const H = { len: 3, half: 1.2, bot: -0.9, top: 0.9, floor: -6, dockTop: 1.2 };

/** Balanço de lado (rad): forte nas ondas, quase nada depois do lastro. */
export const roll = (t: number) => {
  const a = windowed(t, T.ondas + 0.3, T.furar, 0.6);
  if (a <= 0) return 0;
  const big = 0.42 * appear(t, T.ondas + 0.3, 2.0);
  const amp = big * (1 - 0.85 * appear(t, T.peso + 1.4, 1.2));
  return a * amp * Math.sin((t - T.ondas) * 2.2);
};

/** Afundando com o furo (antes das anteparas). 0 a 1. */
export const sinking = (t: number) => appear(t, T.furar + 1.6, 2.0) * (1 - appear(t, T.divide + 0.2, 0.6));

/** Água entrando no casco furado (0 a 1). */
export const floodAll = (t: number) => appear(t, T.furar + 0.6, 1.6) * (1 - appear(t, T.divide + 0.2, 0.4));
export const floodOne = (t: number) => (t > T.divide ? appear(t, T.enche, 1.2) * (1 - appear(t, T.remo, 0.6)) : 0);

/** Velocidade do navio (para a água e o fundo andarem pra trás). */
export const shipSpeed = (t: number) => (t < T.motor + 1.6 ? 0 : 1.4 * Math.min(1, (t - T.motor - 1.6) / 1.5));
const STEP = 1 / 120;
const N = Math.ceil((DURATION_S + 1) / STEP);
const DIST = new Float32Array(N + 1);
const PROP = new Float32Array(N + 1);
for (let i = 0; i < N; i++) {
  const t = i * STEP;
  DIST[i + 1] = DIST[i] + shipSpeed(t) * STEP;
  PROP[i + 1] = PROP[i] + (t < T.motor + 1.0 ? 0 : 9 * Math.min(1, (t - T.motor - 1.0) / 1.2)) * STEP;
}
const look = (arr: Float32Array, t: number) => {
  const x = Math.min(N, Math.max(0, t / STEP));
  const i = Math.floor(x);
  const f = x - i;
  return arr[i] * (1 - f) + arr[Math.min(i + 1, N)] * f;
};
export const travelled = (t: number) => look(DIST, t);
export const propAngle = (t: number) => look(PROP, t);

/** Leme (rad) e curva do navio (rad em volta do eixo vertical). */
export const rudder = (t: number) => 0.5 * windowed(t, T.virar + 1.0, T.fim + 0.5, 0.5);
export const yaw = (t: number) => 0.55 * appear(t, T.virar + 1.6, 3.0);

export const PLAN: PlanItem[] = [
  [0, -6.0, 2.0, "wave", 0.6],
  [1.0, -6.0, 2.0, "point", 0.9],
  [1.8, -6.0, 2.0, "worried", 0.6],
  [T.dobra, -6.0, 2.0, "point", 0.9],
  [T.casco, -6.0, 2.0, "thumbs", 0.6],
  [T.ondas, -6.0, 2.0, "worried", 0.7],
  [T.lastro, -6.0, 2.0, "thumbs", 0.6],
  [T.furar, -6.0, 2.0, "panic", 0.6],
  [T.anteparas, -6.0, 2.0, "thumbs", 0.6],
  [T.remo, -6.0, 2.0, "worried", 0.6],
  [T.helice, -6.0, 2.0, "point", 0.9],
  [T.fim, -6.0, 2.0, "party", 0.5],
];

export const CAM: [number, [number, number, number], [number, number, number]][] = [
  [0, [3, 2.5, 17], [0, -1.6, 0]],
  [T.dobra, [3, 3.6, 13.5], [0, 0.9, 0]],
  [T.empurra, [4, 1.2, 14], [0, -0.9, 0]],
  [T.ondas, [12.5, 2.4, 3.2], [0, 0.3, 0]],
  [T.peso, [10.5, 4.5, 5.5], [0, -0.1, 0]],
  [T.furar, [3, 2.0, 13.5], [0.5, -0.9, 0]],
  [T.divide, [3, 6.0, 11], [0.5, -0.2, 0]],
  [T.remo, [-1, 2.6, 13.5], [-1.2, -0.4, 0]],
  [T.motor, [-6.5, 1.0, 9.5], [-3.2, -0.8, 0]],
  [T.virar, [0.4, 11, 9.5], [-1.7, 0, 0]],
  [T.fim, [-3, 5.5, 19], [-2.0, 0.2, 0]],
];

type Tone = "red" | "blue" | "green" | "yellow";
const S: [number, number] = [540, 1250];

export const LABELS: { text: string; from: number; to: number; p: [number, number, number]; tone?: Tone; screen?: [number, number] }[] = [
  { text: "PLACA DE AÇO", from: 0.4, to: 1.6, p: [0, 3.0, 0.5] },
  { text: "AFUNDOU!", from: 2.0, to: T.dobra, p: [0, -4.4, 1.5], tone: "red" },
  { text: "CAIXA CHEIA DE AR", from: T.dobra + 2.2, to: T.empurra, p: [0, 2.4, 1.2] },
  { text: "A ÁGUA EMPURRA PRA CIMA", from: T.empurra + 0.8, to: T.casco, p: [0, 0, 0], tone: "blue", screen: S },
  { text: "BALANÇA!", from: T.ondas + 1.4, to: T.peso, p: [0, 3.0, 0], tone: "red" },
  { text: "PESO NO FUNDO", from: T.peso + 1.0, to: T.lastro, p: [0, 1.6, 0] },
  { text: "FUROU!", from: T.furar + 0.5, to: T.divide, p: [2.2, 1.4, 1.3], tone: "red" },
  { text: "SALAS FECHADAS", from: T.divide + 1.4, to: T.enche, p: [0, 1.8, 0.4] },
  { text: "SÓ UMA ENCHEU", from: T.enche + 1.0, to: T.anteparas, p: [2.2, 1.6, 0.6], tone: "blue" },
  { text: "REMO? NÃO DÁ", from: T.remo + 0.8, to: T.motor, p: [-1.5, 2.6, 0.6], tone: "red" },
  { text: "MOTOR", from: T.motor + 0.8, to: T.helice, p: [-2.1, 0.5, 0.6] },
  { text: "ÁGUA PRA TRÁS", from: T.motor + 2.6, to: T.helice, p: [-4.4, -1.4, 0.8], tone: "blue" },
  { text: "NAVIO PRA FRENTE", from: T.motor + 3.6, to: T.helice, p: [0, 0, 0], tone: "green", screen: S },
  { text: "LEME", from: T.virar + 1.2, to: T.leme, p: [-4.3, 0.5, 0.6], tone: "yellow" },
  { text: "CASCO", from: T.fim + 0.3, to: DURATION_S, p: [1.2, 1.3, 1.2] },
  { text: "HÉLICE", from: T.fim + 0.45, to: DURATION_S, p: [-3.8, -0.1, 0.8], tone: "blue" },
  { text: "LEME", from: T.fim + 0.6, to: DURATION_S, p: [-4.4, 0.6, 0.6], tone: "yellow" },
];

export const TERMS: { text: string; at: number; to: number }[] = [
  { text: "CASCO", at: T.casco, to: T.ondas },
  { text: "LASTRO", at: T.lastro, to: T.furar },
  { text: "ANTEPARAS", at: T.anteparas, to: T.remo },
  { text: "HÉLICE", at: T.helice, to: T.virar },
  { text: "LEME", at: T.leme, to: T.fim },
];

export const SFX: { src: string; at: number; vol: number }[] = [
  { src: "sfx/whoosh.mp3", at: 0.2, vol: 0.4 },
  { src: "sfx/air.mp3", at: 1.2, vol: 0.45 },
  { src: "sfx/alarm.mp3", at: 2.1, vol: 0.2 },
  { src: "sfx/snap.mp3", at: T.dobra + 0.6, vol: 0.5 },
  { src: "sfx/snap.mp3", at: T.dobra + 1.0, vol: 0.5 },
  { src: "sfx/pop.mp3", at: T.dobra + 2.0, vol: 0.5 },
  { src: "sfx/ding.mp3", at: T.casco, vol: 0.45 },
  { src: "sfx/whoosh.mp3", at: T.ondas + 0.4, vol: 0.4 },
  { src: "sfx/pop.mp3", at: T.peso + 0.6, vol: 0.5 },
  { src: "sfx/ding.mp3", at: T.lastro, vol: 0.45 },
  { src: "sfx/alarm.mp3", at: T.furar + 0.5, vol: 0.3 },
  { src: "sfx/air.mp3", at: T.furar + 0.8, vol: 0.4 },
  { src: "sfx/snap.mp3", at: T.divide + 0.8, vol: 0.5 },
  { src: "sfx/ding.mp3", at: T.anteparas, vol: 0.45 },
  { src: "sfx/pop.mp3", at: T.motor + 0.6, vol: 0.5 },
  { src: "sfx/whoosh.mp3", at: T.motor + 1.6, vol: 0.4 },
  { src: "sfx/ding.mp3", at: T.helice, vol: 0.45 },
  { src: "sfx/click.mp3", at: T.virar + 1.0, vol: 0.5 },
  { src: "sfx/ding.mp3", at: T.leme, vol: 0.45 },
  { src: "sfx/party.mp3", at: T.fim, vol: 0.5 },
];

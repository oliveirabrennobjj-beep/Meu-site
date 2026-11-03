import { Word, findAt, windowed, appear } from "./lib";
import raw from "./words.json";
import type { PlanItem } from "./Guy";

export const WORDS = (raw as Word[]).filter((w) => !w.t.startsWith("["));
export const at = (phrase: string, off = 0) => findAt(WORDS, phrase) + off;
export const DURATION_S = WORDS[WORDS.length - 1].e + 2;

export const T = {
  queima: at("o motor queima"),
  canais: at("então você faz canais"),
  pega: at("a água pega"),
  ferver: at("mas logo a água"),
  leva: at("então você leva"),
  vento: at("o vento esfria"),
  radiador: at("esse é o radiador"),
  empurra: at("mas quem empurra"),
  bomba: at("essa é a bomba"),
  parado: at("mas com o carro parado"),
  ventilador: at("então você coloca um ventilador"),
  ventoinha: at("essa é a ventoinha"),
  manha: at("e de manhã"),
  portinha: at("você coloca uma portinha"),
  valvula: at("essa é a válvula"),
  liquido: at("e pra água não ferver"),
  aditivo: at("esse é o aditivo"),
  parabens: at("parabéns"),
  cta: at("comenta aí"),
  curso: at("você quer aprender"),
};

/** Posições: motor no meio, radiador na frente do carro (x+). */
export const X_RAD = 4.6;
export const X_FAN = 3.95;

const keys = (t: number, ks: [number, number][]) => {
  if (t <= ks[0][0]) return ks[0][1];
  for (let i = 1; i < ks.length; i++) {
    if (t <= ks[i][0]) {
      const [t0, v0] = ks[i - 1];
      const [t1, v1] = ks[i];
      const k = t1 === t0 ? 1 : (t - t0) / (t1 - t0);
      return v0 + (v1 - v0) * (k * k * (3 - 2 * k));
    }
  }
  return ks[ks.length - 1][1];
};

/** Temperatura do motor: 0 frio, 0.5 normal, 1 fervendo. */
export const temp = (t: number) =>
  keys(t, [
    [0, 0.45],
    [T.canais - 0.3, 1.0],
    [T.pega + 0.8, 0.7],
    [T.ferver + 0.6, 0.95],
    [T.leva + 1.5, 0.95],
    [T.vento + 1.5, 0.5],
    [T.parado + 0.6, 0.5],
    [T.ventilador + 0.4, 0.92],
    [T.ventoinha, 0.5],
    [T.manha - 0.2, 0.5],
    [T.manha + 0.8, 0.12],
    [T.portinha + 1.0, 0.15],
    [T.valvula - 0.4, 0.5],
  ]);

export const canais = (t: number) => appear(t, T.canais + 0.3, 0.8);
export const radiador = (t: number) => appear(t, T.leva + 0.4, 0.8);
/** Água indo pro radiador (a válvula termostática fecha com o motor frio). */
export const fluxoRad = (t: number) => {
  if (t < T.leva + 1.2) return 0;
  const fechada = windowed(t, T.portinha + 1.0, T.valvula - 0.6, 0.3);
  return 1 - fechada;
};
export const vento = (t: number) => windowed(t, T.vento - 0.2, T.parado + 0.4, 0.4);
export const ventoinhaLigada = (t: number) => (t > T.ventilador + 1.0 && t < T.manha) || t > T.parabens;
export const ferve = (t: number) => Math.max(0, (temp(t) - 0.85) / 0.15);

export const PLAN: PlanItem[] = [
  [0, -3.6, 2.8, "wave", 0.6],
  [T.queima, -3.6, 2.8, "point", 0.9],
  [T.canais - 1.0, -3.6, 2.8, "worried", 0.6],
  [T.canais, -3.6, 2.8, "point", 0.9],
  [T.ferver, -3.6, 2.8, "panic", 0.6],
  [T.radiador, -3.6, 2.8, "thumbs", 0.6],
  [T.empurra, -3.6, 2.8, "point", 0.9],
  [T.parado, -3.6, 2.8, "worried", 0.6],
  [T.ventoinha, -3.6, 2.8, "thumbs", 0.6],
  [T.manha, -3.6, 2.8, "idle", 0.6],
  [T.valvula, -3.6, 2.8, "thumbs", 0.6],
  [T.liquido, -3.6, 2.8, "point", 0.9],
  [T.parabens, -3.6, 2.8, "party", 0.5],
];

export const CAM: [number, [number, number, number], [number, number, number]][] = [
  [0, [5.5, 5.2, 12], [0.4, 2.0, 0]],
  [T.canais, [3.8, 4.6, 9.5], [0, 2.0, 0]],
  [T.leva, [9, 6.5, 17], [2.0, 2.1, 0]],
  [T.vento, [9.5, 4.8, 10], [4.2, 2.2, 0]],
  [T.empurra, [5.2, 3.2, 8.0], [1.7, 1.7, 0]],
  [T.parado, [9, 6.0, 16], [2.4, 2.1, 0]],
  [T.ventilador, [8.0, 4.4, 9.5], [4.0, 2.2, 0]],
  [T.manha, [9, 6.5, 17], [2.0, 2.1, 0]],
  [T.portinha, [4.8, 4.8, 7.4], [1.8, 3.0, 0]],
  [T.liquido, [7.5, 5.6, 10.5], [2.8, 2.6, 0]],
  [T.parabens, [8, 7, 20], [1.2, 2.0, 0]],
];

type Tone = "red" | "blue" | "green" | "yellow";
const S: [number, number] = [540, 1250];

export const LABELS: { text: string; from: number; to: number; p: [number, number, number]; tone?: Tone; screen?: [number, number] }[] = [
  { text: "MOTOR", from: 0.6, to: T.queima + 2.0, p: [0, 3.9, 0.9] },
  { text: "ESQUENTANDO!", from: T.queima + 2.4, to: T.canais, p: [0, 3.9, 0.9], tone: "red" },
  { text: "CANAIS DE ÁGUA", from: T.canais + 1.2, to: T.pega, p: [0, 3.9, 0.9], tone: "blue" },
  { text: "A ÁGUA PEGA O CALOR", from: T.pega + 0.4, to: T.ferver, p: [0, 0, 0], tone: "green", screen: S },
  { text: "FERVENDO!", from: T.ferver + 0.8, to: T.leva, p: [0, 3.9, 0.9], tone: "red" },
  { text: "ÁGUA QUENTE", from: T.leva + 1.6, to: T.vento, p: [3.0, 3.7, 0.3], tone: "red" },
  { text: "VENTO", from: T.vento + 0.3, to: T.radiador, p: [6.6, 3.4, 0.6], tone: "blue" },
  { text: "ÁGUA FRIA VOLTA", from: T.vento + 1.4, to: T.empurra, p: [3.0, 0.6, 0.6], tone: "blue" },
  { text: "QUEM EMPURRA?", from: T.empurra + 0.4, to: T.bomba - 1.6, p: [0, 0, 0], tone: "red", screen: S },
  { text: "CORREIA DO MOTOR", from: T.empurra + 2.6, to: T.bomba, p: [1.9, 2.4, 0.9] },
  { text: "SEM VENTO", from: T.parado + 0.8, to: T.ventilador, p: [X_RAD, 3.8, 0.4], tone: "red" },
  { text: "LIGA SOZINHO", from: T.ventilador + 1.6, to: T.ventoinha, p: [X_FAN, 3.6, 0.4], tone: "green" },
  { text: "MOTOR FRIO", from: T.manha + 0.6, to: T.portinha, p: [0, 3.9, 0.9], tone: "blue" },
  { text: "FECHADA", from: T.portinha + 1.2, to: T.valvula - 0.6, p: [1.85, 3.75, 0.3], tone: "red" },
  { text: "ABRIU!", from: T.valvula - 0.4, to: T.liquido, p: [1.85, 3.75, 0.3], tone: "green" },
  { text: "NÃO FERVE · NÃO CONGELA", from: T.liquido + 1.6, to: T.parabens, p: [0, 0, 0], tone: "green", screen: S },
  { text: "RADIADOR", from: T.parabens + 0.3, to: DURATION_S, p: [X_RAD, 3.8, 0.4], tone: "blue" },
  { text: "VENTOINHA", from: T.parabens + 0.45, to: DURATION_S, p: [X_FAN, 3.6, -0.6], tone: "yellow" },
  { text: "BOMBA", from: T.parabens + 0.6, to: DURATION_S, p: [1.75, 1.9, 0.6] },
];

export const TERMS: { text: string; at: number; to: number }[] = [
  { text: "RADIADOR", at: T.radiador, to: T.empurra },
  { text: "BOMBA D'ÁGUA", at: T.bomba, to: T.parado },
  { text: "VENTOINHA", at: T.ventoinha, to: T.manha },
  { text: "VÁLVULA TERMOSTÁTICA", at: T.valvula, to: T.liquido },
  { text: "ADITIVO", at: T.aditivo, to: T.parabens },
];

export const SFX: { src: string; at: number; vol: number }[] = [
  { src: "sfx/whoosh.mp3", at: 0.2, vol: 0.35 },
  { src: "sfx/alarm.mp3", at: T.queima + 2.4, vol: 0.25 },
  { src: "sfx/pop.mp3", at: T.canais + 0.4, vol: 0.5 },
  { src: "sfx/air.mp3", at: T.ferver + 0.8, vol: 0.45 },
  { src: "sfx/pop.mp3", at: T.leva + 0.5, vol: 0.5 },
  { src: "sfx/whoosh.mp3", at: T.vento, vol: 0.45 },
  { src: "sfx/ding.mp3", at: T.radiador, vol: 0.45 },
  { src: "sfx/pop.mp3", at: T.empurra + 1.6, vol: 0.5 },
  { src: "sfx/ding.mp3", at: T.bomba, vol: 0.45 },
  { src: "sfx/alarm.mp3", at: T.parado + 0.8, vol: 0.25 },
  { src: "sfx/click.mp3", at: T.ventilador + 1.0, vol: 0.6 },
  { src: "sfx/air.mp3", at: T.ventilador + 1.2, vol: 0.4 },
  { src: "sfx/ding.mp3", at: T.ventoinha, vol: 0.45 },
  { src: "sfx/pop.mp3", at: T.portinha + 0.6, vol: 0.5 },
  { src: "sfx/click.mp3", at: T.valvula - 0.4, vol: 0.6 },
  { src: "sfx/ding.mp3", at: T.valvula, vol: 0.45 },
  { src: "sfx/pop.mp3", at: T.liquido + 0.6, vol: 0.5 },
  { src: "sfx/ding.mp3", at: T.aditivo, vol: 0.45 },
  { src: "sfx/party.mp3", at: T.parabens, vol: 0.5 },
];

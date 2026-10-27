import { Word, findAt } from "./lib";
import raw from "./words.json";
import type { PlanItem } from "./Guy";

export const WORDS = (raw as Word[]).filter((w) => !w.t.startsWith("["));
export const at = (phrase: string, off = 0) => findAt(WORDS, phrase) + off;
export const DURATION_S = WORDS[WORDS.length - 1].e + 2;

export const T = {
  tabua: 0,
  racha: at("mas na primeira carga"),
  vigas: at("então você troca a tábua"),
  chassi: at("esse é o chassi"),
  morre: at("mas o motor gira"),
  engr: at("então você coloca engrenagens"),
  grande: at("uma grande"),
  pequena: at("e outra pequena"),
  cambio: at("esse é o câmbio"),
  pisa: at("mas pra parar"),
  ar: at("então você usa ar"),
  compressor: at("um compressor"),
  freioAr: at("esse é o freio a ar"),
  mola: at("e se o ar vazar"),
  comprido: at("mas pra levar mais carga"),
  corta: at("então você corta ele"),
  cavalo: at("o cavalo"),
  carreta: at("e a carreta"),
  pino: at("presos por um pino"),
  quinta: at("essa é a quinta roda"),
  fim: at("e é assim"),
  cta: at("comenta aí"),
};

const clamp = (x: number) => Math.min(1, Math.max(0, x));

/** Velocidade da estrada (unidades/s): o caminhão "anda" quando a estrada corre embaixo dele. */
export const speed = (t: number) => {
  if (t < T.morre + 0.6) return 0;
  if (t < T.engr) return 1.2 * (1 - clamp((t - T.morre - 1.6) / 1.2));
  if (t < T.grande) return 0;
  if (t < T.pequena) return 1.6 * clamp((t - T.grande) / 1);
  if (t < T.ar) return 1.6 + 5 * clamp((t - T.pequena) / 1.5);
  if (t < T.compressor + 1.5) return 6.6;
  if (t < T.mola) return 6.6 * (1 - clamp((t - T.compressor - 1.5) / 2.2));
  return 0;
};

/** Distância percorrida (integral simples da velocidade). */
const DT = 1 / 30;
const ROAD: number[] = [];
export const road = (t: number) => {
  const i = Math.max(0, Math.floor(t / DT));
  while (ROAD.length <= i) {
    const k = ROAD.length;
    ROAD.push(k === 0 ? 0 : ROAD[k - 1] + speed(k * DT) * DT);
  }
  return ROAD[i];
};

/** Giro do caminhão rígido tentando fazer a curva (radianos). */
export const rigidTurn = (t: number) => (t < T.comprido + 0.8 || t > T.corta ? 0 : 0.42 * clamp((t - T.comprido - 0.8) / 1.8));

/** Giro do cavalo e da carreta na curva, depois da quinta roda. */
export const cabTurn = (t: number) => (t < T.quinta + 0.4 ? 0 : 0.55 * Math.sin(Math.min(Math.PI / 2, (t - T.quinta - 0.4) * 0.9)));
export const trailerTurn = (t: number) => cabTurn(t) * 0.25;

export const PLAN: PlanItem[] = [
  [0, 1.2, 3.0, "wave", 0.9],
  [T.racha, 1.6, 3.3, "panic", 0.9],
  [T.vigas, 1.2, 3.0, "point", 0.2],
  [T.chassi, 1.2, 3.0, "thumbs", 0.9],
  [T.morre, 1.2, 3.0, "worried", 0.9],
  [T.engr, 4.6, 2.6, "point", -0.6],
  [T.cambio, 4.6, 2.6, "thumbs", -0.3],
  [T.pisa, 1.6, 3.3, "panic", 0.9],
  [T.ar, 1.2, 3.0, "point", 0.2],
  [T.freioAr, 1.2, 3.0, "thumbs", 0.9],
  [T.mola, 1.2, 3.0, "point", -0.4],
  [T.comprido, 4.0, 4.0, "worried", 0.9],
  [T.corta, 4.0, 4.0, "point", 0.2],
  [T.quinta, 4.0, 4.0, "thumbs", 0.9],
  [T.fim, 4.0, 4.0, "party", 0.9],
];

export const CAM: [number, [number, number, number], [number, number, number]][] = [
  [0, [11.5, 6.0, 8.0], [0.2, 1.5, 0]],
  [T.vigas, [10.5, 5.5, 7.0], [0.2, 1.5, 0]],
  [T.morre, [9.5, 5.0, 6.5], [1.2, 2.6, 0]],
  [T.engr, [0.9, 5.0, 10.5], [0.9, 4.2, 0]],
  [T.pisa, [11.5, 4.0, 6.5], [0, 1.4, 0]],
  [T.ar, [5.5, 3.0, 8.0], [0.2, 1.2, 0]],
  [T.mola, [-1.0, 2.6, 7.5], [-2.8, 1.0, 0.6]],
  [T.comprido, [13, 29, 6], [-1.8, 0.5, 2.0]],
  [T.corta, [16, 9.5, 9], [-1.5, 2.0, 0]],
  [T.quinta, [13, 29, 6], [-1.8, 0.5, 2.0]],
  [T.cta, [18, 11, 8], [-0.5, 1.8, 0]],
];

export type Tone = "red" | "blue" | "green" | "yellow";
export const LABELS: { text: string; from: number; to: number; p: [number, number, number]; tone?: Tone; screen?: [number, number] }[] = [
  { text: "MOTOR", from: 0.6, to: T.racha, p: [2.9, 2.6, 0] },
  { text: "TÁBUA", from: 1.2, to: T.racha, p: [-1.5, 1.9, 0.9] },
  { text: "RACHOU!", from: T.racha + 1.0, to: T.vigas, p: [0, 3.2, 0], tone: "red" },
  { text: "VIGA", from: T.vigas + 1.0, to: T.chassi, p: [-2.5, 2.1, 0.7] },
  { text: "TRAVESSA", from: T.vigas + 1.6, to: T.chassi, p: [0.6, 2.1, 0.2] },
  { text: "MORREU!", from: T.morre + 1.8, to: T.engr, p: [2.9, 3.6, 0], tone: "red" },
  { text: "MARCHA BAIXA · FORÇA", from: T.grande + 0.2, to: T.pequena, p: [0.6, 6.4, 0], tone: "blue" },
  { text: "MARCHA ALTA · VELOCIDADE", from: T.pequena + 0.2, to: T.cambio, p: [0.6, 6.4, 0], tone: "blue" },
  { text: "NÃO PARA!", from: T.pisa + 1.2, to: T.ar, p: [0, 3.4, 0], tone: "red" },
  { text: "COMPRESSOR", from: T.compressor + 0.2, to: T.freioAr, p: [2.2, 2.4, 1.0] },
  { text: "TANQUES DE AR", from: T.compressor + 1.0, to: T.freioAr, p: [-0.6, 0.3, 1.6], tone: "blue" },
  { text: "MOLA DE EMERGÊNCIA", from: T.mola + 0.8, to: T.comprido, p: [-2.8, 2.4, 1.0], tone: "red" },
  { text: "NÃO FAZ A CURVA!", from: T.comprido + 2.2, to: T.corta, p: [-2, 4, -1], tone: "red" },
  { text: "CAVALO", from: T.cavalo + 0.2, to: T.quinta, p: [3.3, 4.4, 0] },
  { text: "CARRETA", from: T.carreta + 0.2, to: T.quinta, p: [-3.2, 5.4, 0] },
  { text: "PINO", from: T.pino + 0.2, to: T.quinta, p: [1.4, 2.6, 1.2], tone: "yellow" },
];

/** "Esse é o ___!": o nome técnico aparece grande no meio da tela. */
export const TERMS: { text: string; at: number; to: number }[] = [
  { text: "CHASSI", at: T.chassi, to: T.morre },
  { text: "CÂMBIO", at: T.cambio, to: T.pisa },
  { text: "FREIO A AR", at: T.freioAr, to: T.mola },
  { text: "QUINTA RODA", at: T.quinta, to: T.fim },
];

export const SFX: { src: string; at: number; vol: number }[] = [
  { src: "sfx/whoosh.mp3", at: 0.2, vol: 0.4 },
  { src: "sfx/pop.mp3", at: T.racha + 0.4, vol: 0.5 },
  { src: "sfx/snap.mp3", at: T.racha + 1.0, vol: 0.7 },
  { src: "sfx/whoosh.mp3", at: T.vigas + 0.2, vol: 0.4 },
  { src: "sfx/ding.mp3", at: T.chassi, vol: 0.5 },
  { src: "sfx/air.mp3", at: T.morre + 1.6, vol: 0.5 },
  { src: "sfx/pop.mp3", at: T.engr + 0.4, vol: 0.5 },
  { src: "sfx/click.mp3", at: T.pequena + 0.2, vol: 0.6 },
  { src: "sfx/ding.mp3", at: T.cambio, vol: 0.5 },
  { src: "sfx/alarm.mp3", at: T.pisa + 1.0, vol: 0.3 },
  { src: "sfx/air.mp3", at: T.compressor + 0.5, vol: 0.5 },
  { src: "sfx/ding.mp3", at: T.freioAr, vol: 0.5 },
  { src: "sfx/air.mp3", at: T.mola + 0.3, vol: 0.5 },
  { src: "sfx/snap.mp3", at: T.mola + 1.2, vol: 0.6 },
  { src: "sfx/alarm.mp3", at: T.comprido + 2.0, vol: 0.3 },
  { src: "sfx/snap.mp3", at: T.comprido + 2.5, vol: 0.6 },
  { src: "sfx/whoosh.mp3", at: T.corta + 0.3, vol: 0.5 },
  { src: "sfx/click.mp3", at: T.pino + 0.5, vol: 0.6 },
  { src: "sfx/ding.mp3", at: T.quinta, vol: 0.5 },
  { src: "sfx/party.mp3", at: T.fim, vol: 0.5 },
];

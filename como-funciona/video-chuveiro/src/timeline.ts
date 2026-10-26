import words from "./words.json";
import { Easing } from "remotion";

export const FPS = 30;

export const C = {
  bg: "#06090a",
  bg2: "#0b1412",
  grid: "rgba(184,255,60,0.05)",
  lime: "#B8FF3C",
  cyan: "#4FE3FF",
  red: "#FF4D5E",
  amber: "#FFC94D",
  white: "#F2F7F4",
  dim: "#56645f",
  steel: "#9fb3ad",
  ink: "#4D7CFF",
};

type Ease = "inOut" | "in" | "out" | "outBack" | "linear";
const easings: Record<Ease, (x: number) => number> = {
  inOut: Easing.inOut(Easing.cubic),
  in: Easing.in(Easing.quad),
  out: Easing.out(Easing.cubic),
  outBack: Easing.out(Easing.back(1.8)),
  linear: (x) => x,
};

export type KF = [number, number, Ease?];

/** Piecewise keyframes; the easing on a key applies to the segment arriving at it. */
export const kf = (t: number, keys: KF[]): number => {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    const [t1, v1, e] = keys[i];
    const [t0, v0] = keys[i - 1];
    if (t <= t1) {
      const p = t1 === t0 ? 1 : (t - t0) / (t1 - t0);
      return v0 + (v1 - v0) * easings[e ?? "inOut"](p);
    }
  }
  return keys[keys.length - 1][1];
};

export const appear = (t: number, at: number, dur = 0.35) => {
  if (t <= at) return 0;
  if (t >= at + dur) return 1;
  return Easing.out(Easing.cubic)((t - at) / dur);
};

export const pop = (t: number, at: number, dur = 0.4) => {
  if (t <= at) return 0;
  if (t >= at + dur) return 1;
  return Easing.out(Easing.back(2.2))((t - at) / dur);
};

export const windowed = (t: number, from: number, to: number, fade = 0.3) =>
  Math.min(appear(t, from, fade), 1 - appear(t, to - fade, fade));

type W = { t: string; s: number; e: number };
const WORDS = (words as W[]).filter((w) => !w.t.startsWith("["));
const norm = (x: string) => x.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9 ]/g, "");
/** Momento (s) em que a narração começa a falar a frase. */
export const at = (phrase: string, off = 0) => {
  const target = norm(phrase).split(" ").filter(Boolean);
  for (let i = 0; i < WORDS.length; i++) {
    if (target.every((w, k) => WORDS[i + k] && norm(WORDS[i + k].t) === w)) return WORDS[i].s + off;
  }
  throw new Error(`Frase não encontrada: ${phrase}`);
};
export const DURATION_S = WORDS[WORDS.length - 1].e + 1.6;

// Marcos da narração
export const T = {
  balde: 0,
  demora: at("mas esquentar balde"),
  fio: at("então você passa a água"),
  resistencia: at("isso é a resistência"),
  semAgua: at("mas se a energia ligar"),
  queima: at("esquenta demais e queima"),
  borracha: at("então você coloca uma peça"),
  diafragma: at("isso é o diafragma"),
  soEsquenta: at("por isso o chuveiro"),
  menos: at("e por que com menos"),
  calor: at("porque a resistência entrega"),
  poucas: at("com pouca água"),
  verao: at("mas no verão"),
  inteiro: at("então você liga a energia"),
  inverno: at("no inverno"),
  chave: at("isso é a chave"),
  choque: at("mas água e eletricidade"),
  terra: at("então você liga um fio"),
  fioTerra: at("isso é o fio terra"),
  crivo: at("coloca um crivo"),
  parabens: at("parabéns"),
  cta: at("já sabia"),
  cta2: at("não sabia"),
};

export type Beat = { at: number; a: string; b: string; color?: string };
export const BEATS: Beat[] = [
  { at: T.balde, a: "Balde + fogo", b: "= banho quente?", color: C.amber },
  { at: T.demora, a: "Um fio que", b: "esquenta a água.", color: C.lime },
  { at: T.semAgua, a: "Sem água?", b: "Queima.", color: C.red },
  { at: T.borracha, a: "Uma borracha", b: "que liga a energia.", color: C.lime },
  { at: T.menos, a: "Menos água,", b: "mais quente.", color: C.amber },
  { at: T.verao, a: "Verão ou", b: "inverno?", color: C.cyan },
  { at: T.choque, a: "Água + energia", b: "= choque?", color: C.red },
  { at: T.terra, a: "O fio", b: "terra.", color: C.lime },
  { at: T.crivo, a: "E o crivo", b: "cheio de furinhos.", color: C.cyan },
  { at: T.parabens, a: "Parabéns! Você", b: "construiu um chuveiro.", color: C.lime },
];

export const SFX: { src: string; at: number; vol: number }[] = [
  { src: "sfx/whoosh.mp3", at: 0.2, vol: 0.4 },
  { src: "sfx/air.mp3", at: T.fio, vol: 0.4 },
  { src: "sfx/pop.mp3", at: T.resistencia + 0.3, vol: 0.6 },
  { src: "sfx/alarm.mp3", at: T.queima, vol: 0.45 },
  { src: "sfx/snap.mp3", at: T.queima + 0.5, vol: 0.5 },
  { src: "sfx/click.mp3", at: T.borracha + 1.2, vol: 0.6 },
  { src: "sfx/pop.mp3", at: T.diafragma + 0.3, vol: 0.6 },
  { src: "sfx/pop.mp3", at: T.poucas, vol: 0.5 },
  { src: "sfx/click.mp3", at: T.inteiro, vol: 0.6 },
  { src: "sfx/click.mp3", at: T.inverno, vol: 0.6 },
  { src: "sfx/pop.mp3", at: T.chave + 0.3, vol: 0.6 },
  { src: "sfx/snap.mp3", at: T.choque + 0.6, vol: 0.6 },
  { src: "sfx/pop.mp3", at: T.fioTerra + 0.3, vol: 0.6 },
  { src: "sfx/air.mp3", at: T.crivo, vol: 0.4 },
  { src: "sfx/party.mp3", at: T.parabens, vol: 0.55 },
  { src: "sfx/ding.mp3", at: T.parabens + 1.4, vol: 0.6 },
  { src: "sfx/pop.mp3", at: T.cta, vol: 0.6 },
  { src: "sfx/pop.mp3", at: T.cta2, vol: 0.6 },
];

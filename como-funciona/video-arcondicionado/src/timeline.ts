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
  gancho: 0,
  ano: at("em mil novecentos"),
  gelado: at("e o ar saiu gelado"),
  pronto: at("pronto você inventou"),
  como: at("mas como fazer frio"),
  gas: at("então você usa um gás"),
  alcool: at("igual álcool"),
  sala: at("dentro da sala"),
  evaporador: at("isso é o evaporador"),
  cheio: at("mas agora o gás"),
  aperta: at("então você aperta"),
  compressor: at("isso é o compressor"),
  fora: at("lá fora"),
  condensador: at("esse é o condensador"),
  furinho: at("depois o gás passa"),
  agua: at("e a água que pinga"),
  umidade: at("é a umidade"),
  parabens: at("parabéns"),
  cta: at("já sabia"),
  cta2: at("não sabia"),
};

export type Beat = { at: number; a: string; b: string; color?: string };
export const BEATS: Beat[] = [
  { at: T.gancho, a: "Faz frio", b: "ligado na tomada?", color: C.cyan },
  { at: T.ano, a: "1902:", b: "uma gráfica...", color: C.amber },
  { at: T.gelado, a: "...e o ar", b: "saiu gelado.", color: C.cyan },
  { at: T.como, a: "Como fazer", b: "frio?", color: C.red },
  { at: T.gas, a: "Um gás que", b: "rouba o calor.", color: C.cyan },
  { at: T.sala, a: "Puxa o calor", b: "da sala.", color: C.red },
  { at: T.cheio, a: "E esse calor", b: "vai pra onde?", color: C.amber },
  { at: T.aperta, a: "Aperta o gás:", b: "esquenta mais.", color: C.red },
  { at: T.fora, a: "Sopra o calor", b: "pra rua.", color: C.amber },
  { at: T.furinho, a: "Furinho fino:", b: "gela de novo.", color: C.cyan },
  { at: T.agua, a: "E a água", b: "que pinga?", color: C.cyan },
  { at: T.parabens, a: "Parabéns! Você construiu", b: "um ar-condicionado.", color: C.lime },
];

export const SFX: { src: string; at: number; vol: number }[] = [
  { src: "sfx/whoosh.mp3", at: 0.2, vol: 0.4 },
  { src: "sfx/air.mp3", at: T.ano + 0.6, vol: 0.35 },
  { src: "sfx/pop.mp3", at: T.gelado + 0.5, vol: 0.6 },
  { src: "sfx/ding.mp3", at: T.pronto + 0.3, vol: 0.5 },
  { src: "sfx/whoosh.mp3", at: T.gas + 0.2, vol: 0.4 },
  { src: "sfx/air.mp3", at: T.alcool + 0.3, vol: 0.35 },
  { src: "sfx/pop.mp3", at: T.evaporador + 0.1, vol: 0.6 },
  { src: "sfx/click.mp3", at: T.cheio + 0.4, vol: 0.5 },
  { src: "sfx/snap.mp3", at: T.aperta + 0.5, vol: 0.5 },
  { src: "sfx/pop.mp3", at: T.compressor + 0.1, vol: 0.6 },
  { src: "sfx/air.mp3", at: T.fora + 0.6, vol: 0.4 },
  { src: "sfx/pop.mp3", at: T.condensador + 0.1, vol: 0.6 },
  { src: "sfx/click.mp3", at: T.furinho + 0.5, vol: 0.6 },
  { src: "sfx/ding.mp3", at: T.furinho + 1.6, vol: 0.5 },
  { src: "sfx/pop.mp3", at: T.agua + 0.6, vol: 0.5 },
  { src: "sfx/party.mp3", at: T.parabens, vol: 0.55 },
  { src: "sfx/ding.mp3", at: T.parabens + 1.4, vol: 0.6 },
  { src: "sfx/pop.mp3", at: T.cta, vol: 0.6 },
  { src: "sfx/pop.mp3", at: T.cta2, vol: 0.6 },
];

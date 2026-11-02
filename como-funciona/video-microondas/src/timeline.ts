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
  chocolate: at("e a barra de chocolate"),
  pronto: at("pronto você inventou"),
  como: at("mas como esquentar"),
  peca: at("então você coloca na caixa"),
  magnetron: at("isso é o magnetron"),
  giram: at("as ondas fazem as gotinhas"),
  calor: at("vira calor"),
  prato: at("o prato quase"),
  sair: at("mas as ondas não podem"),
  metal: at("então você faz a caixa"),
  porta: at("e na porta"),
  luz: at("a luz passa"),
  blindagem: at("essa é a blindagem"),
  gelado: at("mas tem lugar"),
  girar: at("então você coloca a comida"),
  giratorio: at("esse é o prato giratório"),
  garfo: at("e garfo lá dentro"),
  faisca: at("as ondas fazem faísca"),
  parabens: at("parabéns"),
  cta: at("já sabia"),
  cta2: at("não sabia"),
};

export type Beat = { at: number; a: string; b: string; color?: string };
export const BEATS: Beat[] = [
  { at: T.gancho, a: "Esquenta a comida", b: "e não o prato?", color: C.amber },
  { at: T.ano, a: "1945:", b: "um radar...", color: C.cyan },
  { at: T.chocolate, a: "...e um chocolate", b: "derretido.", color: C.amber },
  { at: T.como, a: "Como esquentar", b: "a comida?", color: C.red },
  { at: T.peca, a: "Ondas", b: "invisíveis.", color: C.lime },
  { at: T.giram, a: "A água", b: "gira e esquenta.", color: C.red },
  { at: T.prato, a: "Prato sem água", b: "= prato frio.", color: C.cyan },
  { at: T.sair, a: "E se a onda", b: "escapar?", color: C.red },
  { at: T.metal, a: "Caixa de metal", b: "rebate tudo.", color: C.lime },
  { at: T.gelado, a: "Um lado quente,", b: "outro gelado.", color: C.amber },
  { at: T.girar, a: "Então", b: "a comida gira.", color: C.lime },
  { at: T.garfo, a: "E o garfo", b: "lá dentro?", color: C.red },
  { at: T.parabens, a: "Parabéns! Você", b: "construiu um micro-ondas.", color: C.lime },
];

export const SFX: { src: string; at: number; vol: number }[] = [
  { src: "sfx/whoosh.mp3", at: 0.2, vol: 0.4 },
  { src: "sfx/alarm.mp3", at: T.ano + 0.3, vol: 0.2 },
  { src: "sfx/pop.mp3", at: T.chocolate + 0.8, vol: 0.6 },
  { src: "sfx/ding.mp3", at: T.pronto + 0.3, vol: 0.5 },
  { src: "sfx/whoosh.mp3", at: T.peca + 0.2, vol: 0.4 },
  { src: "sfx/pop.mp3", at: T.magnetron + 0.1, vol: 0.6 },
  { src: "sfx/air.mp3", at: T.giram + 0.3, vol: 0.4 },
  { src: "sfx/click.mp3", at: T.prato + 0.4, vol: 0.6 },
  { src: "sfx/alarm.mp3", at: T.sair + 0.4, vol: 0.3 },
  { src: "sfx/snap.mp3", at: T.metal + 0.5, vol: 0.5 },
  { src: "sfx/click.mp3", at: T.porta + 0.4, vol: 0.6 },
  { src: "sfx/pop.mp3", at: T.blindagem + 0.1, vol: 0.6 },
  { src: "sfx/whoosh.mp3", at: T.girar + 0.4, vol: 0.4 },
  { src: "sfx/pop.mp3", at: T.giratorio + 0.1, vol: 0.6 },
  { src: "sfx/snap.mp3", at: T.faisca + 0.3, vol: 0.6 },
  { src: "sfx/snap.mp3", at: T.faisca + 0.7, vol: 0.6 },
  { src: "sfx/party.mp3", at: T.parabens, vol: 0.55 },
  { src: "sfx/ding.mp3", at: T.parabens + 1.4, vol: 0.6 },
  { src: "sfx/pop.mp3", at: T.cta, vol: 0.6 },
  { src: "sfx/pop.mp3", at: T.cta2, vol: 0.6 },
];

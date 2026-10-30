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
  tranca: 0,
  dentro: at("mas ela só fecha por dentro"),
  buraco: at("então você faz um buraco"),
  chave: at("isso é a chave"),
  qualquer: at("mas qualquer vara"),
  pinos: at("então você coloca pinos"),
  dentes: at("só uma chave com os dentes"),
  egito: at("os egípcios"),
  iguais: at("mas se os pinos forem iguais"),
  corta: at("então você corta cada pino"),
  certa: at("só a chave certa"),
  gira: at("aí ele gira"),
  linha: at("isso é a linha de corte"),
  cinco: at("com cinco pinos"),
  vizinho: at("por isso a chave do vizinho"),
  yale: at("essa fechadura de pinos"),
  grampo: at("mas tem gente"),
  carretel: at("então você troca alguns"),
  seguranca: at("isso são os pinos"),
  parabens: at("parabéns"),
  cta: at("já sabia"),
  cta2: at("não sabia"),
};

export type Beat = { at: number; a: string; b: string; color?: string };
export const BEATS: Beat[] = [
  { at: T.tranca, a: "Uma tábua", b: "na porta?", color: C.amber },
  { at: T.dentro, a: "Só fecha", b: "por dentro.", color: C.red },
  { at: T.buraco, a: "Um buraco", b: "e uma vara.", color: C.cyan },
  { at: T.qualquer, a: "Qualquer vara", b: "abre.", color: C.red },
  { at: T.pinos, a: "Pinos que", b: "travam a tranca.", color: C.lime },
  { at: T.egito, a: "Egito,", b: "4 mil anos atrás.", color: C.amber },
  { at: T.iguais, a: "Chave parecida", b: "também abre.", color: C.red },
  { at: T.corta, a: "Cada pino", b: "em duas partes.", color: C.cyan },
  { at: T.linha, a: "A linha", b: "de corte.", color: C.lime },
  { at: T.cinco, a: "Milhares de", b: "combinações.", color: C.amber },
  { at: T.yale, a: "Linus Yale Jr.,", b: "anos 1860.", color: C.amber },
  { at: T.grampo, a: "E o grampo", b: "do ladrão?", color: C.red },
  { at: T.carretel, a: "Pinos de", b: "segurança.", color: C.lime },
  { at: T.parabens, a: "Parabéns! Você", b: "fez uma fechadura.", color: C.lime },
];

export const SFX: { src: string; at: number; vol: number }[] = [
  { src: "sfx/whoosh.mp3", at: 0.2, vol: 0.4 },
  { src: "sfx/snap.mp3", at: 0.9, vol: 0.5 },
  { src: "sfx/alarm.mp3", at: T.dentro + 0.3, vol: 0.3 },
  { src: "sfx/whoosh.mp3", at: T.buraco + 0.6, vol: 0.4 },
  { src: "sfx/click.mp3", at: T.chave - 0.2, vol: 0.7 },
  { src: "sfx/alarm.mp3", at: T.qualquer + 0.6, vol: 0.3 },
  { src: "sfx/pop.mp3", at: T.pinos + 0.6, vol: 0.6 },
  { src: "sfx/click.mp3", at: T.dentes + 1.0, vol: 0.7 },
  { src: "sfx/ding.mp3", at: T.egito + 0.2, vol: 0.5 },
  { src: "sfx/alarm.mp3", at: T.iguais + 0.8, vol: 0.3 },
  { src: "sfx/whoosh.mp3", at: T.corta, vol: 0.45 },
  { src: "sfx/click.mp3", at: T.certa + 1.6, vol: 0.7 },
  { src: "sfx/snap.mp3", at: T.gira + 0.2, vol: 0.6 },
  { src: "sfx/pop.mp3", at: T.linha + 0.2, vol: 0.6 },
  { src: "sfx/air.mp3", at: T.cinco + 0.3, vol: 0.4 },
  { src: "sfx/alarm.mp3", at: T.vizinho + 0.6, vol: 0.3 },
  { src: "sfx/ding.mp3", at: T.yale + 0.3, vol: 0.5 },
  { src: "sfx/whoosh.mp3", at: T.grampo + 0.3, vol: 0.4 },
  { src: "sfx/click.mp3", at: T.carretel + 2.2, vol: 0.6 },
  { src: "sfx/pop.mp3", at: T.seguranca + 0.2, vol: 0.6 },
  { src: "sfx/party.mp3", at: T.parabens, vol: 0.55 },
  { src: "sfx/ding.mp3", at: T.parabens + 1.4, vol: 0.6 },
  { src: "sfx/pop.mp3", at: T.cta, vol: 0.6 },
  { src: "sfx/pop.mp3", at: T.cta2, vol: 0.6 },
];

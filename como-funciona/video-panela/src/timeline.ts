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
  tampa: 0,
  pula: at("mas o vapor empurra"),
  encaixes: at("então você faz encaixes"),
  bordas: at("mas o vapor escapa"),
  anel: at("então você coloca um anel"),
  vedacao: at("isso é a vedação"),
  preso: at("agora o vapor fica preso"),
  graus: at("perto de cento e vinte"),
  rapido: at("comida em água"),
  feijao: at("é por isso que o feijão"),
  explode: at("mas se a pressão subir"),
  furinho: at("então você faz um furinho"),
  peso: at("e coloca um peso"),
  levanta: at("quando a pressão passa"),
  valvula: at("isso é a válvula"),
  entupir: at("mas e se esse furo"),
  segundo: at("então você faz um segundo"),
  seguranca: at("isso é a válvula de segurança"),
  papin: at("quem inventou"),
  digestor: at("ele chamava"),
  nunca: at("por isso nunca abra"),
  fogo: at("tire do fogo"),
  parabens: at("parabéns"),
  cta: at("já sabia"),
  cta2: at("não sabia"),
};

export type Beat = { at: number; a: string; b: string; color?: string };
export const BEATS: Beat[] = [
  { at: T.tampa, a: "Uma tampa", b: "bem pesada?", color: C.amber },
  { at: T.pula, a: "O vapor", b: "empurra.", color: C.red },
  { at: T.encaixes, a: "Encaixes que", b: "travam a tampa.", color: C.cyan },
  { at: T.bordas, a: "Vaza pelas", b: "bordas.", color: C.red },
  { at: T.anel, a: "Anel de", b: "borracha.", color: C.lime },
  { at: T.preso, a: "A água ferve", b: "a quase 120 °C.", color: C.amber },
  { at: T.feijao, a: "Feijão na", b: "metade do tempo.", color: C.lime },
  { at: T.explode, a: "Pressão", b: "demais?", color: C.red },
  { at: T.furinho, a: "Um furo", b: "e um peso.", color: C.cyan },
  { at: T.valvula, a: "Isso é", b: "a válvula.", color: C.lime },
  { at: T.entupir, a: "E se", b: "entupir?", color: C.red },
  { at: T.segundo, a: "Válvula de", b: "segurança.", color: C.lime },
  { at: T.papin, a: "Denis Papin,", b: "1679.", color: C.amber },
  { at: T.nunca, a: "Espere o", b: "chiado parar.", color: C.red },
  { at: T.parabens, a: "Parabéns! Você", b: "fez uma panela.", color: C.lime },
];

export const SFX: { src: string; at: number; vol: number }[] = [
  { src: "sfx/whoosh.mp3", at: 0.2, vol: 0.4 },
  { src: "sfx/snap.mp3", at: 0.9, vol: 0.5 },
  { src: "sfx/pop.mp3", at: T.pula + 0.8, vol: 0.7 },
  { src: "sfx/air.mp3", at: T.pula + 0.8, vol: 0.4 },
  { src: "sfx/click.mp3", at: T.encaixes + 1.6, vol: 0.7 },
  { src: "sfx/air.mp3", at: T.bordas + 0.3, vol: 0.35 },
  { src: "sfx/pop.mp3", at: T.anel + 1.2, vol: 0.6 },
  { src: "sfx/ding.mp3", at: T.vedacao + 0.1, vol: 0.5 },
  { src: "sfx/whoosh.mp3", at: T.preso + 0.2, vol: 0.4 },
  { src: "sfx/ding.mp3", at: T.graus + 0.4, vol: 0.5 },
  { src: "sfx/pop.mp3", at: T.feijao + 0.4, vol: 0.6 },
  { src: "sfx/alarm.mp3", at: T.explode + 0.6, vol: 0.35 },
  { src: "sfx/click.mp3", at: T.furinho + 0.8, vol: 0.7 },
  { src: "sfx/snap.mp3", at: T.peso + 0.5, vol: 0.6 },
  { src: "sfx/air.mp3", at: T.levanta + 1.6, vol: 0.55 },
  { src: "sfx/ding.mp3", at: T.valvula + 0.1, vol: 0.5 },
  { src: "sfx/alarm.mp3", at: T.entupir + 1.0, vol: 0.35 },
  { src: "sfx/pop.mp3", at: T.segundo + 2.0, vol: 0.7 },
  { src: "sfx/air.mp3", at: T.segundo + 2.0, vol: 0.55 },
  { src: "sfx/ding.mp3", at: T.seguranca + 0.1, vol: 0.5 },
  { src: "sfx/ding.mp3", at: T.papin + 0.4, vol: 0.5 },
  { src: "sfx/alarm.mp3", at: T.nunca + 0.6, vol: 0.3 },
  { src: "sfx/click.mp3", at: T.fogo + 0.3, vol: 0.6 },
  { src: "sfx/party.mp3", at: T.parabens, vol: 0.55 },
  { src: "sfx/ding.mp3", at: T.parabens + 1.4, vol: 0.6 },
  { src: "sfx/pop.mp3", at: T.cta, vol: 0.6 },
  { src: "sfx/pop.mp3", at: T.cta2, vol: 0.6 },
];

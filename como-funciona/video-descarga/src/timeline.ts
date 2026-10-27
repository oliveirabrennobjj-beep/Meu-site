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
  buraco: 0,
  cheiro: at("mas o cheiro sobe"),
  agua: at("então você joga água"),
  sobe: at("mas pelo mesmo cano"),
  curva: at("então você faz uma curva"),
  tampa: at("a água tampa o cano"),
  sifao: at("isso é o sifão"),
  cumming: at("quem patenteou"),
  balde: at("mas jogar balde"),
  caixa: at("então você guarda a água"),
  aperta: at("quando você aperta"),
  valvula: at("isso é a válvula"),
  puxa: at("e a água descendo"),
  efeito: at("isso é o efeito sifão"),
  ronco: at("é ele que faz"),
  enche: at("mas a caixa precisa"),
  boia: at("então você coloca uma boia"),
  sobeBoia: at("ela sobe junto"),
  destino: at("e pra onde vai tudo"),
  estacao: at("e de lá pra uma estação"),
  metade: at("só que no brasil"),
  parabens: at("parabéns"),
  cta: at("já sabia"),
  cta2: at("não sabia"),
};

export type Beat = { at: number; a: string; b: string; color?: string };
export const BEATS: Beat[] = [
  { at: T.buraco, a: "Um buraco", b: "no quintal?", color: C.amber },
  { at: T.cheiro, a: "Mas o", b: "cheiro sobe.", color: C.red },
  { at: T.agua, a: "Água leva", b: "tudo pelo cano.", color: C.cyan },
  { at: T.sobe, a: "O cheiro", b: "volta pelo cano.", color: C.red },
  { at: T.curva, a: "Uma curva", b: "com água parada.", color: C.lime },
  { at: T.balde, a: "Balde toda vez?", b: "Cansa.", color: C.red },
  { at: T.caixa, a: "Uma caixa", b: "em cima do vaso.", color: C.cyan },
  { at: T.puxa, a: "Puxa tudo", b: "como um canudo.", color: C.lime },
  { at: T.enche, a: "E quem enche", b: "a caixa de novo?", color: C.amber },
  { at: T.destino, a: "E pra onde", b: "vai tudo?", color: C.cyan },
  { at: T.metade, a: "Só metade", b: "é tratado.", color: C.red },
  { at: T.parabens, a: "Parabéns! Você", b: "construiu uma descarga.", color: C.lime },
];

export const SFX: { src: string; at: number; vol: number }[] = [
  { src: "sfx/whoosh.mp3", at: 0.2, vol: 0.4 },
  { src: "sfx/alarm.mp3", at: T.cheiro + 0.2, vol: 0.3 },
  { src: "sfx/air.mp3", at: T.agua + 0.4, vol: 0.45 },
  { src: "sfx/alarm.mp3", at: T.sobe + 0.4, vol: 0.3 },
  { src: "sfx/whoosh.mp3", at: T.curva, vol: 0.4 },
  { src: "sfx/pop.mp3", at: T.sifao + 0.2, vol: 0.6 },
  { src: "sfx/ding.mp3", at: T.cumming + 0.3, vol: 0.5 },
  { src: "sfx/pop.mp3", at: T.caixa + 0.5, vol: 0.6 },
  { src: "sfx/click.mp3", at: T.aperta + 0.3, vol: 0.7 },
  { src: "sfx/air.mp3", at: T.aperta + 0.5, vol: 0.55 },
  { src: "sfx/pop.mp3", at: T.valvula + 0.2, vol: 0.6 },
  { src: "sfx/whoosh.mp3", at: T.puxa + 0.4, vol: 0.5 },
  { src: "sfx/air.mp3", at: T.ronco + 0.3, vol: 0.6 },
  { src: "sfx/pop.mp3", at: T.boia + 0.4, vol: 0.6 },
  { src: "sfx/click.mp3", at: T.sobeBoia + 2.2, vol: 0.6 },
  { src: "sfx/whoosh.mp3", at: T.destino, vol: 0.45 },
  { src: "sfx/alarm.mp3", at: T.metade + 0.3, vol: 0.3 },
  { src: "sfx/party.mp3", at: T.parabens, vol: 0.55 },
  { src: "sfx/ding.mp3", at: T.parabens + 1.4, vol: 0.6 },
  { src: "sfx/pop.mp3", at: T.cta, vol: 0.6 },
  { src: "sfx/pop.mp3", at: T.cta2, vol: 0.6 },
];

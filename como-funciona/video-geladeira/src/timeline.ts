import { Easing } from "remotion";
import rawWords from "./words.json";

export const FPS = 30;

export const C = {
  bg: "#06090a",
  bg2: "#0b1412",
  grid: "rgba(79,227,255,0.05)",
  lime: "#B8FF3C",
  cyan: "#4FE3FF",
  red: "#FF4D5E",
  amber: "#FFC94D",
  orange: "#FF8A3D",
  white: "#F2F7F4",
  dim: "#56645f",
  steel: "#9fb3ad",
  ink: "#4D7CFF",
  frost: "#CFF6FF",
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

// ---------- Narration timing ----------
// Every scene time comes from the word timings of the narration, so a new take only needs a new words.json.
export type W = { t: string; s: number; e: number };
export const WORDS = (rawWords as W[]).filter((w) => w.s >= 0 && !w.t.startsWith("[") && w.t.trim() !== "");

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]/g, "");

/** Start time of the first occurrence of `phrase` (after `after` seconds). */
export const at = (phrase: string, after = 0): number => {
  const target = phrase.split(/\s+/).map(norm).filter(Boolean);
  for (let i = 0; i < WORDS.length; i++) {
    if (WORDS[i].s < after) continue;
    let ok = true;
    for (let k = 0; k < target.length; k++) {
      if (!WORDS[i + k] || norm(WORDS[i + k].t) !== target[k]) {
        ok = false;
        break;
      }
    }
    if (ok) return WORDS[i].s;
  }
  throw new Error(`Frase não encontrada na narração: "${phrase}"`);
};

const lastEnd = WORDS.length ? WORDS[WORDS.length - 1].e : 80;
export const DURATION_S = Math.ceil((lastEnd + 2.2) * 10) / 10;

// Scene marks
export const T = {
  melt: at("Mas o gelo derrete"),
  buy: at("comprar outro"),
  pool: at("Repara quando"),
  pipe: at("Então você passa"),
  steal: at("Ele evapora e rouba"),
  evap: at("Isso é o evaporador"),
  gas: at("E esse líquido"),
  full: at("Mas agora o gás"),
  motor: at("Então você liga"),
  comp: at("Isso é o compressor"),
  noise: at("É ele que faz"),
  hot: at("Espremido"),
  grid: at("Então você passa ele"),
  cond: at("Isso é o condensador"),
  liquid: at("Ali o gás esfria"),
  still: at("Mas ele continua"),
  thin: at("Então você faz ele"),
  drop: at("Do outro lado"),
  cap: at("Isso é o tubo capilar"),
  truth: at("Repara a geladeira"),
  out: at("Ela tira o calor"),
  back: at("Por isso a grade"),
  open: at("E por isso abrir"),
  worse: at("ela acaba esquentando"),
  perkins: at("A primeira máquina"),
  seal: at("Coloca uma borracha"),
  light: at("e uma luz"),
  done: at("Parabéns"),
  cta: at("Já sabia"),
  cta2: at("Não sabia"),
};

// ---------- Geometry (SVG units, 1080 x 1150) ----------
export const G = {
  cabL: 120,
  cabR: 620,
  cabT: 100,
  cabB: 1000,
  wall: 26,
  shelfY: 760,
};

type P = [number, number];
/** The refrigerant loop, starting where the liquid enters the evaporator. */
const LOOP: P[] = [
  // evaporator serpentine (inside, top)
  [180, 190],
  [560, 190],
  [560, 245],
  [180, 245],
  [180, 300],
  [560, 300],
  // suction line out through the back wall and down
  [690, 300],
  [690, 1010],
  // compressor (box 720..880)
  [880, 1010],
  // discharge up to the condenser
  [990, 1010],
  [990, 880],
  // condenser serpentine (on the back, going up)
  [760, 880],
  [760, 800],
  [990, 800],
  [990, 720],
  [760, 720],
  [760, 640],
  [990, 640],
  [990, 560],
  [760, 560],
  [760, 480],
  [990, 480],
  [990, 400],
  [760, 400],
  [760, 320],
  [990, 320],
  [990, 240],
  [760, 240],
  // capillary tube back over the top into the evaporator
  [760, 50],
  [180, 50],
  [180, 190],
];

const seg = LOOP.slice(1).map((p, i) => Math.hypot(p[0] - LOOP[i][0], p[1] - LOOP[i][1]));
const cum = seg.reduce<number[]>((a, l) => [...a, a[a.length - 1] + l], [0]);
export const LOOP_LEN = cum[cum.length - 1];

const idx = (p: P) => LOOP.findIndex((q) => q[0] === p[0] && q[1] === p[1]);
/** Arc length where each part of the loop ends. */
export const PART = {
  evap: cum[idx([560, 300])],
  suction: cum[idx([690, 1010])],
  comp: cum[idx([880, 1010])],
  cond: cum[idx([760, 240])],
  cap: LOOP_LEN,
};

/** Point along the loop at arc length d. */
export const pointAt = (d: number): P => {
  const x = Math.min(Math.max(d, 0), LOOP_LEN);
  for (let i = 0; i < seg.length; i++) {
    if (x <= cum[i + 1]) {
      const p = seg[i] === 0 ? 0 : (x - cum[i]) / seg[i];
      return [LOOP[i][0] + (LOOP[i + 1][0] - LOOP[i][0]) * p, LOOP[i][1] + (LOOP[i + 1][1] - LOOP[i][1]) * p];
    }
  }
  return LOOP[LOOP.length - 1];
};

/** SVG path of the loop between two arc lengths. */
export const pathBetween = (a: number, b: number): string => {
  const pts: P[] = [pointAt(a)];
  for (let i = 1; i < LOOP.length - 1; i++) if (cum[i] > a && cum[i] < b) pts.push(LOOP[i]);
  pts.push(pointAt(b));
  return "M " + pts.map((p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" L ");
};

// ---------- Headlines ----------
export type Beat = { at: number; a: string; b: string; color?: string };
export const BEATS: Beat[] = [
  { at: 0, a: "Caixa + gelo", b: "= geladeira?", color: C.cyan },
  { at: T.melt, a: "Mas o gelo", b: "derrete.", color: C.red },
  { at: T.pool, a: "Saiu da piscina?", b: "Sente frio.", color: C.cyan },
  { at: T.pipe, a: "Um cano com", b: "líquido que evapora.", color: C.lime },
  { at: T.evap, a: "Isso é o", b: "evaporador.", color: C.cyan },
  { at: T.full, a: "Mas o gás", b: "tá cheio de calor.", color: C.red },
  { at: T.motor, a: "Um motorzinho", b: "que espreme.", color: C.lime },
  { at: T.comp, a: "Isso é o", b: "compressor.", color: C.lime },
  { at: T.hot, a: "Espremido,", b: "fica quente.", color: C.orange },
  { at: T.grid, a: "Uma grade", b: "atrás da geladeira.", color: C.lime },
  { at: T.cond, a: "Isso é o", b: "condensador.", color: C.orange },
  { at: T.still, a: "Mas ele continua", b: "espremido.", color: C.red },
  { at: T.thin, a: "Um cano", b: "fininho.", color: C.lime },
  { at: T.cap, a: "Isso é o", b: "tubo capilar.", color: C.cyan },
  { at: T.truth, a: "Ela não faz frio.", b: "Tira o calor.", color: C.amber },
  { at: T.open, a: "Abrir a porta", b: "esquenta a cozinha!", color: C.red },
  { at: T.perkins, a: "Jacob Perkins,", b: "1834.", color: C.amber },
  { at: T.seal, a: "Borracha com ímã", b: "e uma luz.", color: C.lime },
  { at: T.done, a: "Parabéns! Você", b: "construiu uma geladeira.", color: C.lime },
];

// ---------- Sound effects ----------
export const SFX: { src: string; at: number; vol: number }[] = [
  { src: "sfx/pop.mp3", at: 0.6, vol: 0.5 },
  { src: "sfx/pop.mp3", at: 1.6, vol: 0.5 },
  { src: "sfx/drip.mp3", at: T.melt + 0.4, vol: 0.6 },
  { src: "sfx/drip.mp3", at: T.melt + 1.2, vol: 0.6 },
  { src: "sfx/pop.mp3", at: T.buy + 0.3, vol: 0.6 },
  { src: "sfx/whoosh.mp3", at: T.pool - 0.1, vol: 0.5 },
  { src: "sfx/air.mp3", at: T.pool + 2.4, vol: 0.5 },
  { src: "sfx/whoosh.mp3", at: T.pipe - 0.1, vol: 0.45 },
  { src: "sfx/pop.mp3", at: T.pipe + 0.6, vol: 0.6 },
  { src: "sfx/air.mp3", at: T.steal + 0.2, vol: 0.55 },
  { src: "sfx/ding.mp3", at: T.evap + 0.3, vol: 0.4 },
  { src: "sfx/alarm.mp3", at: T.full + 0.2, vol: 0.3 },
  { src: "sfx/pop.mp3", at: T.motor + 0.5, vol: 0.6 },
  { src: "sfx/motor.mp3", at: T.comp, vol: 0.35 },
  { src: "sfx/motor.mp3", at: T.noise, vol: 0.55 },
  { src: "sfx/whoosh.mp3", at: T.hot, vol: 0.4 },
  { src: "sfx/pop.mp3", at: T.grid + 0.6, vol: 0.6 },
  { src: "sfx/air.mp3", at: T.cond + 0.3, vol: 0.5 },
  { src: "sfx/alarm.mp3", at: T.still + 0.1, vol: 0.3 },
  { src: "sfx/pop.mp3", at: T.thin + 0.6, vol: 0.6 },
  { src: "sfx/air.mp3", at: T.drop + 0.4, vol: 0.6 },
  { src: "sfx/ding.mp3", at: T.cap + 0.4, vol: 0.5 },
  { src: "sfx/whoosh.mp3", at: T.truth, vol: 0.45 },
  { src: "sfx/click.mp3", at: T.open + 0.3, vol: 0.7 },
  { src: "sfx/alarm.mp3", at: T.worse, vol: 0.35 },
  { src: "sfx/whoosh.mp3", at: T.perkins - 0.1, vol: 0.5 },
  { src: "sfx/click.mp3", at: T.seal + 0.1, vol: 0.7 },
  { src: "sfx/pop.mp3", at: T.seal + 0.8, vol: 0.6 },
  { src: "sfx/ding.mp3", at: T.light + 0.4, vol: 0.5 },
  { src: "sfx/party.mp3", at: T.done, vol: 0.55 },
  { src: "sfx/ding.mp3", at: T.done + 1.2, vol: 0.6 },
  { src: "sfx/pop.mp3", at: T.cta, vol: 0.6 },
  { src: "sfx/pop.mp3", at: T.cta2, vol: 0.6 },
];

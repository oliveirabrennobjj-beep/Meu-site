import { Easing } from "remotion";

export const FPS = 30;
export const DURATION_S = 85.6;

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

/** 0→1 over `dur` seconds starting at `at`, eased out. */
export const appear = (t: number, at: number, dur = 0.35) => {
  if (t <= at) return 0;
  if (t >= at + dur) return 1;
  return Easing.out(Easing.cubic)((t - at) / dur);
};

/** Pop scale with overshoot. */
export const pop = (t: number, at: number, dur = 0.4) => {
  if (t <= at) return 0;
  if (t >= at + dur) return 1;
  return Easing.out(Easing.back(2.2))((t - at) / dur);
};

/** Visible window with fade in/out. */
export const windowed = (t: number, from: number, to: number, fade = 0.3) =>
  Math.min(appear(t, from, fade), 1 - appear(t, to - fade, fade));

// ---------- Geometry (SVG units, 1080 wide) ----------
export const G = {
  top: 235,
  pit: 1120,
  wallL: 250,
  wallR: 830,
  carX: 480,
  carW: 220,
  carH: 200,
  sheaveX: 590,
  sheaveY: 120,
  sheaveR: 110,
  cwX: 700,
  cwW: 64,
  cwH: 180,
  K: 960,
  govX: 300,
  govR: 30,
  floors: [440, 700, 960],
  springTop: 1040,
};

export const carTop = (t: number): number => {
  let y = kf(t, [
    [0, 520],
    [4.3, 520],
    [5.3, 650, "outBack"],
    [8.6, 650],
    [10.0, 500],
    [22.9, 500],
    [24.0, 280],
    [25.4, 600],
    [26.6, 500],
    [32.5, 500],
    [34.4, 280],
    [38.84, 280],
    [38.95, 305, "out"],
    [39.4, 282],
    [45.4, 282],
    [45.9, 350, "in"],
    [48.5, 350],
    [49.4, 520, "in"],
    [53.2, 600, "out"],
    [62.0, 600],
    [63.9, 840, "in"],
    [64.1, 866, "out"],
    [64.4, 832],
    [64.7, 840],
    [66.9, 840],
    [69.6, 280],
    [70.9, 280],
    [72.4, 500],
  ]);
  if (t < 4.3) y += Math.sin(t * 5) * 8;
  if (t > 26.9 && t < 30) y += Math.sin(t * 90) * 2.5;
  return y;
};

export const cwTop = (t: number): number => {
  const attached = G.K - carTop(t);
  const bottom = G.pit - G.cwH - 4;
  if (t < 45.4) return attached;
  if (t < 66.94) {
    const fallen = kf(t, [
      [45.4, G.K - 282],
      [46.1, bottom, "in"],
    ]);
    return fallen;
  }
  const back = appear(t, 66.94, 0.8);
  return bottom + (attached - bottom) * back;
};

export type RopeMode = "straight" | "single" | "broken" | "cables" | "snapped";
export const ropeMode = (t: number): RopeMode => {
  if (t < 8.6) return "straight";
  if (t < 38.84) return "single";
  if (t < 39.79) return "broken";
  if (t < 45.4) return "cables";
  if (t < 66.94) return "snapped";
  return "cables";
};

// ---------- Headlines ----------
export type Beat = { at: number; a: string; b: string; color?: string };
export const BEATS: Beat[] = [
  { at: 0, a: "Caixa + corda", b: "= elevador?", color: C.lime },
  { at: 4.32, a: "Com gente dentro?", b: "Pesado demais.", color: C.red },
  { at: 7.47, a: "Uma roda", b: "lá em cima.", color: C.lime },
  { at: 11.4, a: "Arquimedes", b: "já fazia isso.", color: C.amber },
  { at: 14.88, a: "Ainda precisa", b: "de muita força.", color: C.red },
  { at: 16.86, a: "Coliseu de Roma:", b: "elevador de leão.", color: C.amber },
  { at: 21.15, a: "Troca os braços", b: "por um motor.", color: C.lime },
  { at: 26.83, a: "Mas gasta", b: "energia demais.", color: C.red },
  { at: 30.03, a: "Um peso", b: "do outro lado.", color: C.lime },
  { at: 38.06, a: "E se a corda", b: "arrebentar?", color: C.red },
  { at: 39.79, a: "Vários cabos", b: "de aço.", color: C.lime },
  { at: 44.59, a: "E se todos", b: "arrebentarem?", color: C.red },
  { at: 46.35, a: "Uma roldana", b: "que trava.", color: C.cyan },
  { at: 50.3, a: "Cunhas que", b: "mordem o trilho.", color: C.lime },
  { at: 55.36, a: "Elisha Otis,", b: "1854.", color: C.amber },
  { at: 61.26, a: "E se chegar", b: "ao fundo?", color: C.red },
  { at: 63.4, a: "Molas no", b: "fundo do poço.", color: C.lime },
  { at: 66.94, a: "Porta aberta", b: "no meio do caminho?", color: C.red },
  { at: 70.08, a: "Porta aberta =", b: "elevador parado.", color: C.lime },
  { at: 73.79, a: "Botões, espelho", b: "e musiquinha.", color: C.cyan },
  { at: 76.75, a: "Parabéns! Você", b: "construiu um elevador.", color: C.lime },
];

// ---------- Sound effects ----------
export const SFX: { src: string; at: number; vol: number }[] = [
  { src: "sfx/pop.mp3", at: 1.0, vol: 0.5 },
  { src: "sfx/pop.mp3", at: 1.6, vol: 0.5 },
  { src: "sfx/spring.mp3", at: 4.9, vol: 0.35 },
  { src: "sfx/pop.mp3", at: 8.6, vol: 0.5 },
  { src: "sfx/pop.mp3", at: 10.64, vol: 0.6 },
  { src: "sfx/whoosh.mp3", at: 11.3, vol: 0.5 },
  { src: "sfx/whoosh.mp3", at: 16.8, vol: 0.5 },
  { src: "sfx/whoosh.mp3", at: 21.0, vol: 0.5 },
  { src: "sfx/motor.mp3", at: 22.8, vol: 0.45 },
  { src: "sfx/pop.mp3", at: 31.0, vol: 0.6 },
  { src: "sfx/pop.mp3", at: 35.1, vol: 0.6 },
  { src: "sfx/snap.mp3", at: 38.8, vol: 0.7 },
  { src: "sfx/pop.mp3", at: 40.2, vol: 0.45 },
  { src: "sfx/pop.mp3", at: 41.2, vol: 0.6 },
  { src: "sfx/snap.mp3", at: 45.35, vol: 0.8 },
  { src: "sfx/pop.mp3", at: 47.7, vol: 0.6 },
  { src: "sfx/screech.mp3", at: 49.4, vol: 0.6 },
  { src: "sfx/pop.mp3", at: 53.9, vol: 0.6 },
  { src: "sfx/whoosh.mp3", at: 55.3, vol: 0.5 },
  { src: "sfx/snap.mp3", at: 59.0, vol: 0.4 },
  { src: "sfx/spring.mp3", at: 63.85, vol: 0.6 },
  { src: "sfx/pop.mp3", at: 65.9, vol: 0.6 },
  { src: "sfx/pop.mp3", at: 70.7, vol: 0.6 },
  { src: "sfx/ding.mp3", at: 72.5, vol: 0.45 },
  { src: "sfx/whoosh.mp3", at: 73.7, vol: 0.45 },
  { src: "sfx/party.mp3", at: 76.8, vol: 0.55 },
  { src: "sfx/ding.mp3", at: 78.3, vol: 0.6 },
  { src: "sfx/pop.mp3", at: 79.4, vol: 0.6 },
  { src: "sfx/pop.mp3", at: 81.5, vol: 0.6 },
];

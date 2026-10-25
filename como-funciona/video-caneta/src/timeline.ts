import { Easing } from "remotion";

export const FPS = 30;
export const DURATION_S = 71.8;

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

// ---------- Geometry (SVG units, 1080 x 1150) ----------
export const G = {
  x: 540,
  tubeW: 34,
  tubeTop: 190,
  tubeBot: 850,
  tipY: 968,
  ballR: 12,
  paperY: 990,
  barrelW: 150,
  barrelTop: 150,
  barrelBot: 790,
  holeY: 430,
};

/** Horizontal offset of the pen while it writes. */
export const penX = (t: number) =>
  kf(t, [
    [0, 0],
    [16.7, 0],
    [17.2, -170],
    [21.2, 170, "linear"],
    [22.0, 0],
    [30.5, -120],
    [31.4, -60, "linear"],
    [32.0, -60],
    [39.4, -60],
    [40.6, 120, "linear"],
    [41.2, 0],
    [60.9, -150],
    [62.6, 150, "linear"],
    [63.2, 0],
  ]);

/** Top of the ink column inside the refill. */
export const inkTop = (t: number) =>
  kf(t, [
    [6.6, G.tubeBot],
    [8.2, 250, "out"],
    [10.5, 250],
    [13.0, 300],
    [21.2, 330, "linear"],
    [31.4, 345, "linear"],
    [37.6, 345],
    [40.6, 400, "linear"],
    [61, 400],
    [62.6, 420, "linear"],
  ]);

// ---------- Headlines ----------
export type Beat = { at: number; a: string; b: string; color?: string };
export const BEATS: Beat[] = [
  { at: 0, a: "Pena + tinta", b: "= caneta?", color: C.lime },
  { at: 4.2, a: "A tinta acaba", b: "a cada palavra.", color: C.red },
  { at: 6.35, a: "Guarda a tinta", b: "num tubo.", color: C.lime },
  { at: 10.51, a: "Mas ela", b: "escorre toda.", color: C.red },
  { at: 13.28, a: "Uma bolinha", b: "na ponta.", color: C.lime },
  { at: 17.2, a: "Ela gira", b: "e passa a tinta.", color: C.cyan },
  { at: 23.26, a: "László Bíró,", b: "1938.", color: C.amber },
  { at: 30.11, a: "Mas a tinta", b: "para de descer.", color: C.red },
  { at: 34.99, a: "Um furinho", b: "no corpo.", color: C.lime },
  { at: 40.78, a: "Mas a ponta", b: "seca.", color: C.red },
  { at: 42.72, a: "Então vem", b: "a tampa.", color: C.lime },
  { at: 44.35, a: "E se alguém", b: "engolir a tampa?", color: C.red },
  { at: 50.27, a: "Um furo", b: "no meio da tampa.", color: C.lime },
  { at: 56.16, a: "Virou norma", b: "de segurança.", color: C.cyan },
  { at: 58.67, a: "Clipe e corpo", b: "transparente.", color: C.lime },
  { at: 63.15, a: "Parabéns! Você", b: "construiu uma caneta.", color: C.lime },
];

// ---------- Sound effects ----------
export const SFX: { src: string; at: number; vol: number }[] = [
  { src: "sfx/write.mp3", at: 2.0, vol: 0.5 },
  { src: "sfx/pop.mp3", at: 4.9, vol: 0.4 },
  { src: "sfx/pop.mp3", at: 7.0, vol: 0.5 },
  { src: "sfx/pop.mp3", at: 9.8, vol: 0.6 },
  { src: "sfx/drip.mp3", at: 11.3, vol: 0.6 },
  { src: "sfx/drip.mp3", at: 12.3, vol: 0.6 },
  { src: "sfx/pop.mp3", at: 14.9, vol: 0.6 },
  { src: "sfx/write.mp3", at: 17.6, vol: 0.55 },
  { src: "sfx/write.mp3", at: 19.6, vol: 0.55 },
  { src: "sfx/pop.mp3", at: 22.0, vol: 0.6 },
  { src: "sfx/whoosh.mp3", at: 23.1, vol: 0.5 },
  { src: "sfx/alarm.mp3", at: 31.5, vol: 0.35 },
  { src: "sfx/pop.mp3", at: 33.1, vol: 0.6 },
  { src: "sfx/pop.mp3", at: 35.9, vol: 0.6 },
  { src: "sfx/air.mp3", at: 37.4, vol: 0.6 },
  { src: "sfx/write.mp3", at: 39.5, vol: 0.5 },
  { src: "sfx/click.mp3", at: 43.75, vol: 0.7 },
  { src: "sfx/whoosh.mp3", at: 44.3, vol: 0.5 },
  { src: "sfx/alarm.mp3", at: 49.2, vol: 0.55 },
  { src: "sfx/pop.mp3", at: 51.1, vol: 0.6 },
  { src: "sfx/air.mp3", at: 52.6, vol: 0.7 },
  { src: "sfx/ding.mp3", at: 56.4, vol: 0.4 },
  { src: "sfx/whoosh.mp3", at: 58.5, vol: 0.45 },
  { src: "sfx/click.mp3", at: 59.1, vol: 0.6 },
  { src: "sfx/write.mp3", at: 61.0, vol: 0.5 },
  { src: "sfx/party.mp3", at: 63.2, vol: 0.55 },
  { src: "sfx/ding.mp3", at: 64.6, vol: 0.6 },
  { src: "sfx/pop.mp3", at: 65.4, vol: 0.6 },
  { src: "sfx/pop.mp3", at: 67.7, vol: 0.6 },
];

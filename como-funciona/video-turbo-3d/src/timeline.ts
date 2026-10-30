import { Easing } from "remotion";
import { Word, findAt, windowed } from "./lib";
import raw from "./words.json";
import type { PlanItem } from "./Guy";

export const WORDS = (raw as Word[]).filter((w) => !w.t.startsWith("["));
export const at = (phrase: string, off = 0) => findAt(WORDS, phrase) + off;
export const DURATION_S = WORDS[WORDS.length - 1].e + 2;

export const T = {
  forca: at("o motor só tem força"),
  ar: at("e pra queimar mais"),
  cabe: at("mas o pistão só consegue"),
  forca2: at("então você empurra ar"),
  fumaca: at("da fumaça que já ia sair"),
  catavento: at("você coloca um cata-vento"),
  turbina: at("esse cata-vento é a turbina"),
  outro: at("do outro lado do mesmo eixo"),
  sopra: at("quando a turbina gira"),
  compressor: at("isso é o compressor"),
  juntos: at("juntos eles são o turbo"),
  quente: at("mas ar apertado esquenta"),
  radiador: at("então você passa o ar"),
  intercooler: at("esse é o intercooler"),
  pressao: at("e se a pressão subir"),
  portinha: at("então você coloca uma portinha"),
  wastegate: at("essa é a wastegate"),
  mil: at("por isso um motor"),
  parabens: at("parabéns"),
  cta: at("comenta aí"),
};

type K = [number, number];
const keys = (t: number, ks: K[]) => {
  if (t <= ks[0][0]) return ks[0][1];
  for (let i = 1; i < ks.length; i++) {
    if (t <= ks[i][0]) {
      const [t0, v0] = ks[i - 1];
      const [t1, v1] = ks[i];
      return v0 + (v1 - v0) * Easing.inOut(Easing.cubic)(t1 === t0 ? 1 : (t - t0) / (t1 - t0));
    }
  }
  return ks[ks.length - 1][1];
};

/** Pressão do turbo (0 sem turbo, ~0.6 normal, >1 perigo). */
export const boost = (t: number) =>
  keys(t, [
    [T.sopra, 0],
    [T.sopra + 1.5, 0.6],
    [T.pressao, 0.65],
    [T.pressao + 1.4, 1.15],
    [T.portinha + 1.4, 1.15],
    [T.portinha + 2.6, 0.7],
  ]);

/** Ar quente (0 a 1) depois de comprimido, até o intercooler esfriar. */
export const hotAir = (t: number) => windowed(t, T.quente + 0.3, T.radiador + 1.6, 0.5);

/** Giro da turbina (rad/s visual). */
export const turboSpin = (t: number) => (t < T.catavento + 0.6 ? 0 : 6 + 10 * Math.min(1, (t - T.catavento - 0.6) / 1.5));

/** Ângulo integrado da turbina (para não pular quando a velocidade muda). */
const STEP = 1 / 120;
const N = Math.ceil((DURATION_S + 1) / STEP);
const ANG = new Float32Array(N + 1);
const ENG = new Float32Array(N + 1);
for (let i = 0; i < N; i++) {
  const t = i * STEP;
  ANG[i + 1] = ANG[i] + turboSpin(t) * STEP;
  ENG[i + 1] = ENG[i] + (7 + 4 * Math.min(1.2, boost(t))) * STEP;
}
const look = (arr: Float32Array, t: number) => {
  const x = Math.min(N, Math.max(0, t / STEP));
  const i = Math.floor(x);
  const f = x - i;
  return arr[i] * (1 - f) + arr[Math.min(i + 1, N)] * f;
};
export const turboAngle = (t: number) => look(ANG, t);
export const engineAngle = (t: number) => look(ENG, t);

export const PLAN: PlanItem[] = [
  [0, -3.0, 1.8, "wave", 0.6],
  [T.forca, -3.0, 1.8, "point", 0.9],
  [T.cabe, -3.0, 1.8, "worried", 0.6],
  [T.fumaca, -3.0, 1.8, "point", 0.9],
  [T.turbina, -3.0, 1.8, "thumbs", 0.6],
  [T.compressor, -3.0, 1.8, "point", 0.9],
  [T.juntos, -3.0, 1.8, "thumbs", 0.5],
  [T.quente, -3.0, 1.8, "worried", 0.7],
  [T.intercooler, -3.0, 1.8, "thumbs", 0.6],
  [T.pressao, -3.0, 1.8, "panic", 0.5],
  [T.wastegate, -3.0, 1.8, "point", 0.9],
  [T.parabens, -3.0, 1.8, "party", 0.5],
];

export const CAM: [number, [number, number, number], [number, number, number]][] = [
  [0, [0, 4.8, 18], [-0.2, 3.4, 0]],
  [T.cabe, [-1.0, 5.0, 10.5], [-1.0, 3.4, 0]],
  [T.fumaca, [5.0, 4.0, 10.5], [3.2, 2.6, 0]],
  [T.catavento, [5.6, 5.6, 8.0], [3.2, 3.8, 0]],
  [T.outro, [3.6, 6.2, 9.5], [2.5, 4.0, 0]],
  [T.sopra, [1.0, 5.6, 12], [0.2, 4.0, 0]],
  [T.juntos, [1.2, 5.6, 14], [0.6, 3.8, 0]],
  [T.radiador, [-0.2, 7.6, 11], [0.0, 5.0, 0]],
  [T.pressao, [1.2, 5.4, 14], [0.6, 3.6, 0]],
  [T.portinha, [5.6, 4.6, 9.0], [3.6, 3.0, 0]],
  [T.parabens, [0.2, 5.8, 18], [0.0, 3.8, 0]],
];

type Tone = "red" | "blue" | "green";
const S: [number, number] = [540, 1250];

export const LABELS: { text: string; from: number; to: number; p: [number, number, number]; tone?: Tone; screen?: [number, number] }[] = [
  { text: "MOTOR", from: 0.8, to: T.forca, p: [0, 3.9, 0.9] },
  { text: "COMBUSTÍVEL + AR = FORÇA", from: T.forca + 0.5, to: T.cabe, p: [0, 0, 0], tone: "green", screen: S },
  { text: "AR", from: T.ar + 0.4, to: T.cabe, p: [-2.9, 4.9, 0.3], tone: "blue" },
  { text: "SÓ CABE ISSO", from: T.cabe + 0.6, to: T.forca2, p: [-0.6, 3.9, 0.9], tone: "red" },
  { text: "EMPURRAR AR À FORÇA?", from: T.forca2 + 0.2, to: T.fumaca, p: [0, 0, 0], tone: "blue", screen: S },
  { text: "FUMAÇA JOGADA FORA", from: T.fumaca + 0.6, to: T.catavento, p: [4.2, 1.2, 0.6], tone: "red" },
  { text: "CATA-VENTO", from: T.catavento + 1.0, to: T.turbina, p: [3.3, 4.9, 0.4] },
  { text: "TURBINA", from: T.turbina, to: T.outro, p: [3.3, 4.9, 0.4], tone: "red" },
  { text: "MESMO EIXO", from: T.outro + 1.6, to: T.sopra, p: [2.6, 4.75, 0.4] },
  { text: "COMPRESSOR", from: T.compressor, to: T.juntos + 0.7, p: [1.9, 4.9, 0.4], tone: "blue" },
  { text: "TURBO", from: T.juntos + 0.7, to: T.quente, p: [2.6, 5.0, 0.4], tone: "green" },
  { text: "+100.000 RPM", from: T.juntos + 1.4, to: T.quente, p: [0, 0, 0], tone: "red", screen: S },
  { text: "AR QUENTE", from: T.quente + 0.6, to: T.radiador, p: [-0.4, 5.9, 0.4], tone: "red" },
  { text: "INTERCOOLER", from: T.intercooler, to: T.pressao, p: [-0.2, 6.1, 0.6], tone: "blue" },
  { text: "PRESSÃO DEMAIS", from: T.pressao + 1.0, to: T.portinha, p: [0, 4.4, 1.0], tone: "red" },
  { text: "PORTINHA", from: T.portinha + 1.2, to: T.wastegate, p: [3.9, 3.35, 0.4] },
  { text: "WASTEGATE", from: T.wastegate, to: T.mil, p: [3.9, 3.35, 0.4], tone: "green" },
  { text: "1.0 TURBO = FORÇA DE MOTOR MAIOR", from: T.mil + 0.4, to: T.parabens, p: [0, 0, 0], tone: "green", screen: S },
  { text: "TURBINA", from: T.parabens + 0.3, to: DURATION_S, p: [3.3, 4.9, 0.4], tone: "red" },
  { text: "COMPRESSOR", from: T.parabens + 0.45, to: DURATION_S, p: [1.5, 5.35, 0.4], tone: "blue" },
  { text: "INTERCOOLER", from: T.parabens + 0.6, to: DURATION_S, p: [-0.2, 6.1, 0.6] },
];

export const SFX: { src: string; at: number; vol: number }[] = [
  { src: "sfx/whoosh.mp3", at: 0.2, vol: 0.35 },
  { src: "sfx/pop.mp3", at: T.forca + 0.5, vol: 0.4 },
  { src: "sfx/alarm.mp3", at: T.cabe + 0.6, vol: 0.2 },
  { src: "sfx/air.mp3", at: T.fumaca + 0.3, vol: 0.45 },
  { src: "sfx/pop.mp3", at: T.catavento + 0.4, vol: 0.5 },
  { src: "sfx/whoosh.mp3", at: T.catavento + 0.8, vol: 0.4 },
  { src: "sfx/pop.mp3", at: T.outro + 0.6, vol: 0.5 },
  { src: "sfx/air.mp3", at: T.sopra + 0.4, vol: 0.45 },
  { src: "sfx/ding.mp3", at: T.juntos + 0.2, vol: 0.45 },
  { src: "sfx/alarm.mp3", at: T.quente + 0.6, vol: 0.2 },
  { src: "sfx/pop.mp3", at: T.radiador + 0.6, vol: 0.5 },
  { src: "sfx/ding.mp3", at: T.intercooler, vol: 0.4 },
  { src: "sfx/alarm.mp3", at: T.pressao + 1.0, vol: 0.3 },
  { src: "sfx/click.mp3", at: T.portinha + 1.2, vol: 0.6 },
  { src: "sfx/air.mp3", at: T.portinha + 1.3, vol: 0.45 },
  { src: "sfx/ding.mp3", at: T.wastegate, vol: 0.4 },
  { src: "sfx/party.mp3", at: T.parabens, vol: 0.5 },
];

import { Easing } from "remotion";
import { FPS, Word, findAt, windowed } from "./lib";
import raw from "./words.json";
import type { PlanItem } from "./Guy";

export const WORDS = (raw as Word[]).filter((w) => !w.t.startsWith("["));
export const at = (phrase: string, off = 0) => findAt(WORDS, phrase) + off;
export const DURATION_S = WORDS[WORDS.length - 1].e + 2;

export const T = {
  anda: at("o carro tá andando"),
  ideia: at("a ideia mais simples"),
  atrito: at("o atrito transforma"),
  gasta: at("mas um bloco"),
  disco: at("então você prende um disco"),
  pastilhas: at("e coloca duas pastilhas"),
  apertam: at("quando elas apertam"),
  pe: at("problema o seu pé"),
  oleo: at("então você enche um cano"),
  espreme: at("líquido não se espreme"),
  fininho: at("e se o pistão"),
  hidraulico: at("isso é o freio hidráulico"),
  trava: at("mas freando forte"),
  sensor: at("então você coloca um sensor"),
  abs: at("isso é o abs"),
  quente: at("e quando o disco esquenta"),
  furos: at("por isso o disco tem furos"),
  parabens: at("parabéns"),
  cta: at("comenta aí"),
};

/** Medidas: roda com centro em (0, Y, 0) girando em volta do eixo z; disco na frente dela. */
export const M = {
  y: 2.2,
  rTire: 1.2, // raio do anel do pneu
  tube: 0.45, // grossura do pneu
  rOut: 1.65,
  rDisc: 0.8,
  dz: 0.75, // centro do disco em z
  calAng: (40 * Math.PI) / 180, // posição da pinça no disco
  pedal: [-2.5, 2.7, 1.15] as [number, number, number], // pivô do pedal
};

const clamp = (x: number) => Math.min(1, Math.max(0, x));
type K = [number, number];
const keys = (t: number, ks: K[]) => {
  if (t <= ks[0][0]) return ks[0][1];
  for (let i = 1; i < ks.length; i++) {
    if (t <= ks[i][0]) {
      const [t0, v0] = ks[i - 1];
      const [t1, v1] = ks[i];
      const p = t1 === t0 ? 1 : (t - t0) / (t1 - t0);
      return v0 + (v1 - v0) * Easing.inOut(Easing.cubic)(p);
    }
  }
  return ks[ks.length - 1][1];
};

/** Velocidade do carro (= da esteira) em unidades por segundo. */
export const speed = (t: number) =>
  keys(t, [
    [0, 3],
    [T.ideia + 1.2, 3],
    [T.ideia + 3.8, 0.3],
    [T.disco + 0.2, 0.3],
    [T.disco + 1.2, 3],
    [T.apertam + 0.3, 3],
    [T.apertam + 2.3, 0.4],
    [T.pe, 0.4],
    [T.pe + 0.8, 3],
    [T.hidraulico + 0.2, 3],
    [T.hidraulico + 2.0, 0],
    [T.trava, 0],
    [T.trava + 0.8, 3.2],
    [T.trava + 1.4, 3.2],
    [T.trava + 4.4, 1.4],
    [T.sensor + 0.2, 1.4],
    [T.sensor + 1.2, 3],
    [T.sensor + 2.6, 3],
    [T.abs + 1.2, 0.5],
    [T.quente, 0.5],
    [T.quente + 0.8, 3],
  ]);

/** Roda travada (não gira) enquanto a esteira continua. */
export const locked = (t: number) => windowed(t, T.trava + 1.4, T.sensor + 0.4, 0.08);

/** ABS: alivia e aperta várias vezes por segundo. */
export const absOn = (t: number) => t > T.sensor + 2.6 && t < T.abs + 1.2;
export const absPulse = (t: number) => (absOn(t) ? (Math.sin(t * Math.PI * 2 * 4) > 0 ? 1 : 0.25) : 0);

/** Aperto das pastilhas (0 solta, 1 aperta tudo). */
export const squeeze = (t: number) => {
  if (absOn(t)) return absPulse(t);
  return Math.max(
    windowed(t, T.apertam + 0.2, T.pe - 0.2, 0.3),
    windowed(t, T.pe + 0.6, T.oleo, 0.3) * 0.22,
    windowed(t, T.espreme + 1.2, T.espreme + 2.4, 0.2),
    windowed(t, T.hidraulico + 0.1, T.trava + 0.5, 0.3),
    windowed(t, T.trava + 1.3, T.sensor + 0.4, 0.08),
    windowed(t, T.quente + 0.5, T.furos + 3.0, 0.3),
  );
};

/** Pedal apertado (0 a 1). */
export const pedalAt = (t: number) => {
  if (t < T.pe) return 0;
  if (absOn(t)) return 0.85 + 0.15 * absPulse(t);
  return Math.max(windowed(t, T.pe + 0.5, T.oleo, 0.3), t > T.espreme ? squeeze(t) : 0);
};

/** Calor do disco (0 a 1). */
export const heatAt = (t: number) =>
  keys(t, [
    [T.apertam + 0.4, 0],
    [T.apertam + 2.0, 0.45],
    [T.pe, 0.45],
    [T.pe + 2.0, 0.08],
    [T.hidraulico + 0.3, 0.08],
    [T.hidraulico + 2.0, 0.55],
    [T.trava, 0.4],
    [T.sensor, 0.25],
    [T.quente + 0.4, 0.25],
    [T.quente + 2.2, 1],
    [T.furos + 0.8, 1],
    [T.furos + 3.6, 0.12],
  ]);

/* Esteira e roda: integra a velocidade uma vez para o vídeo todo. */
const STEP = 1 / (FPS * 4);
const N = Math.ceil((DURATION_S + 1) / STEP);
const ROAD = new Float32Array(N + 1);
const WHEEL = new Float32Array(N + 1);
for (let i = 0; i < N; i++) {
  const t = i * STEP;
  const v = speed(t);
  const lockK = locked(t);
  const abs = absOn(t) ? 1 - 0.35 * absPulse(t) : 1;
  ROAD[i + 1] = ROAD[i] + v * STEP;
  WHEEL[i + 1] = WHEEL[i] - (v / M.rOut) * (1 - lockK) * abs * STEP;
}
const look = (arr: Float32Array, t: number) => {
  const x = clamp(t / STEP / N) * N;
  const i = Math.floor(x);
  const f = x - i;
  return arr[Math.min(i, N)] * (1 - f) + arr[Math.min(i + 1, N)] * f;
};
export const roadAt = (t: number) => look(ROAD, t);
export const wheelAt = (t: number) => look(WHEEL, t);

export const PLAN: PlanItem[] = [
  [0, -3.1, 0.3, "wave", 0.7],
  [T.ideia, -3.1, 0.3, "point", 1.0],
  [T.atrito, -3.1, 0.3, "thumbs", 0.6],
  [T.gasta, -3.1, 0.3, "worried", 0.4],
  [T.disco, -3.1, 0.3, "point", 1.0],
  [T.pe, -3.1, 0.3, "worried", 0.8],
  [T.oleo, -3.1, 0.3, "point", 1.0],
  [T.hidraulico, -3.1, 0.3, "thumbs", 0.6],
  [T.trava, -3.1, 0.3, "panic", 0.4],
  [T.sensor, -3.1, 0.3, "point", 1.0],
  [T.abs, -3.1, 0.3, "thumbs", 0.6],
  [T.quente, -3.1, 0.3, "worried", 0.5],
  [T.furos, -3.1, 0.3, "point", 1.0],
  [T.parabens, -3.1, 0.3, "party", 0.5],
];

export const CAM: [number, [number, number, number], [number, number, number]][] = [
  [0, [0, 3.8, 15.5], [-0.8, 2.6, 0]],
  [T.ideia, [1.0, 4.3, 9.8], [0, 3.2, 0]],
  [T.disco, [2.6, 3.2, 7.6], [0.1, 2.3, 0.6]],
  [T.pastilhas, [2.4, 3.4, 6.2], [0.3, 2.6, 0.8]],
  [T.pe, [0.0, 3.6, 13.0], [-1.2, 2.6, 0.6]],
  [T.fininho, [-0.1, 3.4, 11.5], [-0.6, 2.8, 0.9]],
  [T.trava, [4.2, 2.6, 10.5], [-0.3, 1.9, 0]],
  [T.sensor, [2.2, 3.5, 8.2], [-0.5, 2.8, 0.8]],
  [T.quente, [2.2, 3.1, 6.2], [0.3, 2.4, 0.7]],
  [T.parabens, [0, 4.0, 15.5], [-0.8, 2.6, 0]],
];

const S: [number, number] = [540, 1250];

export const LABELS: { text: string; from: number; to: number; p: [number, number, number]; tone?: "red" | "blue" | "green"; screen?: [number, number] }[] = [
  { text: "RODA GIRANDO", from: T.anda + 0.3, to: T.ideia, p: [0, 4.3, 0.4] },
  { text: "ATRITO → CALOR", from: T.atrito + 0.2, to: T.gasta, p: [0, 4.75, 0.3], tone: "blue" },
  { text: "GASTA O PNEU", from: T.gasta + 0.3, to: T.disco, p: [0, 4.75, 0.3], tone: "red" },
  { text: "DISCO", from: T.disco + 0.8, to: T.pastilhas, p: [-0.55, 2.95, M.dz] },
  { text: "PASTILHAS", from: T.pastilhas + 0.9, to: T.apertam, p: [0.62, 3.15, 1.1] },
  { text: "APERTA E ESQUENTA", from: T.apertam + 0.7, to: T.pe, p: [0.62, 3.15, 1.1], tone: "red" },
  { text: "POUCA FORÇA", from: T.pe + 0.9, to: T.oleo, p: [-2.5, 3.2, 1.15], tone: "red" },
  { text: "ÓLEO DE FREIO", from: T.oleo + 1.0, to: T.espreme, p: [-0.3, 4.3, 1.15], tone: "green" },
  { text: "NÃO SE ESPREME", from: T.espreme + 0.2, to: T.fininho, p: [-0.3, 4.3, 1.15], tone: "blue" },
  { text: "FININHO", from: T.fininho + 0.6, to: T.hidraulico, p: [-1.85, 2.55, 1.15] },
  { text: "GROSSO", from: T.fininho + 1.5, to: T.hidraulico, p: [0.7, 3.1, 1.3] },
  { text: "FORÇA MULTIPLICADA", from: T.fininho + 2.6, to: T.hidraulico, p: [0, 0, 0], tone: "green", screen: S },
  { text: "FREIO HIDRÁULICO", from: T.hidraulico + 0.1, to: T.trava, p: [0, 0, 0], tone: "blue", screen: S },
  { text: "TRAVOU!", from: T.trava + 1.6, to: T.sensor, p: [0, 4.2, 0.5], tone: "red" },
  { text: "DESLIZA SEM VIRAR", from: T.trava + 2.6, to: T.sensor, p: [0, 0, 0], tone: "red", screen: S },
  { text: "SENSOR", from: T.sensor + 0.9, to: T.abs, p: [0, 3.05, 1.0], tone: "blue" },
  { text: "SOLTA · APERTA · SOLTA", from: T.sensor + 2.7, to: T.abs, p: [0, 0, 0], tone: "blue", screen: S },
  { text: "ABS", from: T.abs + 0.1, to: T.quente, p: [-1.1, 3.75, 1.15], tone: "blue" },
  { text: "ESQUENTOU DEMAIS", from: T.quente + 1.2, to: T.furos, p: [0.62, 3.15, 1.1], tone: "red" },
  { text: "PASTILHA ESCORREGA", from: T.quente + 2.4, to: T.furos, p: [0, 0, 0], tone: "red", screen: S },
  { text: "FUROS E ALETAS", from: T.furos + 0.9, to: T.parabens, p: [-0.55, 2.95, M.dz], tone: "green" },
  { text: "O VENTO ESFRIA", from: T.furos + 2.2, to: T.parabens, p: [0, 0, 0], tone: "blue", screen: S },
  { text: "PEDAL", from: T.parabens + 0.3, to: DURATION_S, p: [-2.5, 3.2, 1.15] },
  { text: "ABS", from: T.parabens + 0.45, to: DURATION_S, p: [-1.1, 3.75, 1.15], tone: "blue" },
  { text: "PINÇA", from: T.parabens + 0.6, to: DURATION_S, p: [0.62, 3.15, 1.1], tone: "red" },
];

export const SFX: { src: string; at: number; vol: number }[] = [
  { src: "sfx/whoosh.mp3", at: 0.2, vol: 0.35 },
  { src: "sfx/snap.mp3", at: T.ideia + 1.1, vol: 0.5 },
  { src: "sfx/air.mp3", at: T.ideia + 1.3, vol: 0.35 },
  { src: "sfx/alarm.mp3", at: T.gasta + 0.4, vol: 0.2 },
  { src: "sfx/pop.mp3", at: T.disco + 0.3, vol: 0.5 },
  { src: "sfx/pop.mp3", at: T.pastilhas + 0.3, vol: 0.5 },
  { src: "sfx/click.mp3", at: T.apertam + 0.2, vol: 0.6 },
  { src: "sfx/pop.mp3", at: T.pe + 0.2, vol: 0.5 },
  { src: "sfx/alarm.mp3", at: T.pe + 0.9, vol: 0.2 },
  { src: "sfx/whoosh.mp3", at: T.oleo + 0.3, vol: 0.35 },
  { src: "sfx/click.mp3", at: T.espreme + 1.2, vol: 0.6 },
  { src: "sfx/ding.mp3", at: T.fininho + 2.6, vol: 0.4 },
  { src: "sfx/click.mp3", at: T.hidraulico + 0.1, vol: 0.6 },
  { src: "sfx/air.mp3", at: T.trava + 1.4, vol: 0.55 },
  { src: "sfx/alarm.mp3", at: T.trava + 1.7, vol: 0.25 },
  { src: "sfx/pop.mp3", at: T.sensor + 0.4, vol: 0.5 },
  { src: "sfx/click.mp3", at: T.sensor + 2.7, vol: 0.5 },
  { src: "sfx/click.mp3", at: T.sensor + 3.2, vol: 0.5 },
  { src: "sfx/click.mp3", at: T.sensor + 3.7, vol: 0.5 },
  { src: "sfx/ding.mp3", at: T.abs + 0.1, vol: 0.4 },
  { src: "sfx/alarm.mp3", at: T.quente + 1.3, vol: 0.2 },
  { src: "sfx/whoosh.mp3", at: T.furos + 1.6, vol: 0.4 },
  { src: "sfx/party.mp3", at: T.parabens, vol: 0.5 },
];

import { Easing } from "remotion";
import { Word, findAt, windowed, appear } from "./lib";
import raw from "./words.json";
import type { PlanItem } from "./Guy";

export const WORDS = (raw as Word[]).filter((w) => !w.t.startsWith("["));
export const at = (phrase: string, off = 0) => findAt(WORDS, phrase) + off;
export const DURATION_S = WORDS[WORDS.length - 1].e + 2;

export const T = {
  prende: at("você prende as duas"),
  curva: at("mas na curva"),
  presas: at("presas juntas"),
  corta: at("então você corta"),
  agora: at("mas agora o motor"),
  caixa: at("então você coloca uma caixa"),
  reta: at("na reta"),
  nacurva: at("na curva elas giram"),
  diferencial: at("esse é o diferencial"),
  lama: at("mas se uma roda"),
  trava: at("então você coloca uma trava"),
  bloqueio: at("esse é o bloqueio"),
  parabens: at("parabéns"),
  cta: at("comenta aí"),
};

/** Rodas em x = ±X_RODA, eixo na altura Y_EIXO. O carro anda para -z. */
export const X_RODA = 2.4;
export const Y_EIXO = 0.95;
export const R_RODA = 0.62;

const W0 = 4.0; // rad/s
/** Velocidade-alvo das rodas [esquerda, direita] e do cardã. */
const alvo = (t: number): [number, number, number] => {
  const ligado = t > T.prende + 0.3 ? W0 : 0;
  if (t < T.corta + 0.6) return [ligado, ligado, ligado];
  if (t < T.caixa + 0.9) return [0, 0, ligado];
  if (t < T.nacurva + 0.4) return [W0, W0, W0];
  if (t < T.lama + 0.6) return [W0 * 1.4, W0 * 0.6, W0];
  if (t < T.trava + 1.2) return [0, W0 * 2, W0];
  return [W0, W0, W0];
};
const STEP = 1 / 120;
const N = Math.ceil((DURATION_S + 1) / STEP);
const AL = new Float32Array(N + 1);
const AR = new Float32Array(N + 1);
const AS = new Float32Array(N + 1);
let wl = 0;
let wr = 0;
let ws = 0;
for (let i = 0; i < N; i++) {
  const [l, r, s] = alvo(i * STEP);
  const k = Math.min(1, STEP * 4);
  wl += (l - wl) * k;
  wr += (r - wr) * k;
  ws += (s - ws) * k;
  AL[i + 1] = AL[i] + wl * STEP;
  AR[i + 1] = AR[i] + wr * STEP;
  AS[i + 1] = AS[i] + ws * STEP;
}
const look = (arr: Float32Array, t: number) => {
  const x = Math.min(N, Math.max(0, t / STEP));
  const i = Math.floor(x);
  const f = x - i;
  return arr[i] * (1 - f) + arr[Math.min(i + 1, N)] * f;
};
export const rodaEsq = (t: number) => look(AL, t);
export const rodaDir = (t: number) => look(AR, t);
export const carda = (t: number) => look(AS, t) * 3;
/** Ângulo da caixa = média das rodas; giro das engrenagenzinhas = metade da diferença. */
export const caixaAng = (t: number) => (rodaEsq(t) + rodaDir(t)) / 2;
export const satelite = (t: number) => ((rodaEsq(t) - rodaDir(t)) / 2) * 2.2;
export const ease = Easing.inOut(Easing.cubic);
export const temCaixa = (t: number) => appear(t, T.caixa + 0.3, 0.8);
export const cortado = (t: number) => appear(t, T.corta + 0.3, 0.5);
export const travado = (t: number) => appear(t, T.trava + 0.6, 0.6);
export const lamaVis = (t: number) => windowed(t, T.lama + 0.2, T.parabens, 0.4);

export const PLAN: PlanItem[] = [
  [0, -1.3, 3.6, "wave", 0.6],
  [T.prende, -1.3, 3.6, "point", 0.9],
  [T.curva, -1.3, 3.6, "point", 0.6],
  [T.presas, -1.3, 3.6, "worried", 0.6],
  [T.corta, -1.3, 3.6, "point", 0.9],
  [T.agora, -1.3, 3.6, "worried", 0.6],
  [T.caixa, -1.3, 3.6, "point", 0.9],
  [T.diferencial, -1.3, 3.6, "thumbs", 0.6],
  [T.lama, -1.3, 3.6, "panic", 0.6],
  [T.trava, -1.3, 3.6, "point", 0.9],
  [T.bloqueio, -1.3, 3.6, "thumbs", 0.6],
  [T.parabens, -1.3, 3.6, "party", 0.5],
];

export const CAM: [number, [number, number, number], [number, number, number]][] = [
  [0, [1.2, 7.5, 14], [0, 0.6, -0.6]],
  [T.curva, [-0.5, 19, 2.5], [-0.5, 0, -3.2]],
  [T.corta, [1.4, 4.8, 8.5], [0, 0.9, 0]],
  [T.caixa, [2.6, 3.0, 4.4], [0.2, 0.9, -0.2]],
  [T.nacurva, [1.0, 9, 11], [0, 0.6, -0.8]],
  [T.lama, [5.0, 4.2, 8.0], [1.4, 0.7, 0]],
  [T.trava, [2.4, 2.9, 4.4], [0.4, 0.9, -0.1]],
  [T.parabens, [1.2, 7.5, 14], [0, 0.6, -0.6]],
];

type Tone = "red" | "blue" | "green" | "yellow";
const S: [number, number] = [540, 1250];

export const LABELS: { text: string; from: number; to: number; p: [number, number, number]; tone?: Tone; screen?: [number, number] }[] = [
  { text: "MOTOR", from: 0.8, to: T.curva, p: [0.6, 2.0, -4.6] },
  { text: "EIXO ÚNICO", from: T.prende + 1.0, to: T.curva, p: [0, Y_EIXO + 0.5, 0], tone: "yellow" },
  { text: "CAMINHO MAIOR", from: T.curva + 1.2, to: T.presas, p: [1.2, 0.4, -5.5], tone: "blue" },
  { text: "MENOR", from: T.curva + 1.6, to: T.presas, p: [-2.8, 0.4, -3.0], tone: "green" },
  { text: "ARRASTA!", from: T.presas + 0.9, to: T.corta, p: [-X_RODA, 1.9, 0], tone: "red" },
  { text: "CORTOU", from: T.corta + 0.9, to: T.agora, p: [0, Y_EIXO + 0.5, 0], tone: "yellow" },
  { text: "RODAS PARADAS", from: T.agora + 0.9, to: T.caixa, p: [0, 0, 0], tone: "red", screen: S },
  { text: "CAIXA", from: T.caixa + 1.0, to: T.reta, p: [0, Y_EIXO + 0.9, 0] },
  { text: "ENGRENAGENS", from: T.caixa + 2.6, to: T.reta, p: [0, Y_EIXO + 0.55, 0.35], tone: "yellow" },
  { text: "RETA: PARADAS → JUNTAS", from: T.reta + 0.5, to: T.nacurva, p: [0, 0, 0], tone: "green", screen: S },
  { text: "MAIS RÁPIDA", from: T.nacurva + 1.0, to: T.diferencial + 1, p: [-1.5, 2.1, 0], tone: "blue" },
  { text: "MAIS DEVAGAR", from: T.nacurva + 1.4, to: T.diferencial + 1, p: [1.5, 2.1, 0], tone: "green" },
  { text: "GIRA SOZINHA", from: T.lama + 1.2, to: T.trava, p: [X_RODA, 1.9, 0], tone: "red" },
  { text: "PARADA", from: T.lama + 1.6, to: T.trava, p: [-X_RODA, 1.9, 0], tone: "red" },
  { text: "TRAVA", from: T.trava + 1.0, to: T.bloqueio + 0.4, p: [0.75, Y_EIXO + 0.45, 0], tone: "yellow" },
  { text: "AS DUAS JUNTAS DE NOVO", from: T.trava + 2.0, to: T.parabens, p: [0, 0, 0], tone: "green", screen: S },
  { text: "DIFERENCIAL", from: T.parabens + 0.3, to: DURATION_S, p: [0, Y_EIXO + 0.9, 0], tone: "yellow" },
  { text: "RODA", from: T.parabens + 0.5, to: DURATION_S, p: [-X_RODA, 1.9, 0] },
  { text: "RODA", from: T.parabens + 0.6, to: DURATION_S, p: [X_RODA, 1.9, 0] },
];

export const TERMS: { text: string; at: number; to: number }[] = [
  { text: "DIFERENCIAL", at: T.diferencial, to: T.lama },
  { text: "BLOQUEIO", at: T.bloqueio, to: T.parabens },
];

export const SFX: { src: string; at: number; vol: number }[] = [
  { src: "sfx/whoosh.mp3", at: 0.2, vol: 0.35 },
  { src: "sfx/air.mp3", at: T.prende + 0.3, vol: 0.4 },
  { src: "sfx/whoosh.mp3", at: T.curva + 0.3, vol: 0.4 },
  { src: "sfx/alarm.mp3", at: T.presas + 0.8, vol: 0.25 },
  { src: "sfx/snap.mp3", at: T.corta + 0.3, vol: 0.6 },
  { src: "sfx/click.mp3", at: T.agora + 0.6, vol: 0.5 },
  { src: "sfx/pop.mp3", at: T.caixa + 0.4, vol: 0.5 },
  { src: "sfx/click.mp3", at: T.reta + 0.4, vol: 0.5 },
  { src: "sfx/whoosh.mp3", at: T.nacurva + 0.3, vol: 0.4 },
  { src: "sfx/ding.mp3", at: T.diferencial, vol: 0.45 },
  { src: "sfx/alarm.mp3", at: T.lama + 0.8, vol: 0.25 },
  { src: "sfx/snap.mp3", at: T.trava + 0.7, vol: 0.6 },
  { src: "sfx/ding.mp3", at: T.bloqueio, vol: 0.45 },
  { src: "sfx/party.mp3", at: T.parabens, vol: 0.5 },
];

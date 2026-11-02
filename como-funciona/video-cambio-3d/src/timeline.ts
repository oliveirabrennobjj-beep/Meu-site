import { Easing } from "remotion";
import { Word, findAt, windowed, appear } from "./lib";
import raw from "./words.json";
import type { PlanItem } from "./Guy";

export const WORDS = (raw as Word[]).filter((w) => !w.t.startsWith("["));
export const at = (phrase: string, off = 0) => findAt(WORDS, phrase) + off;
export const DURATION_S = WORDS[WORDS.length - 1].e + 2;

export const T = {
  liga: at("você liga o motor"),
  nunca: at("mas o motor nunca"),
  freia: at("quando você freia"),
  discos: at("então você coloca dois discos"),
  pisa: at("quando você pisa"),
  embreagem: at("essa é a embreagem"),
  sair: at("mas pra sair"),
  pequena: at("então você coloca uma engrenagem pequena"),
  devagar: at("a roda gira devagar"),
  primeira: at("essa é a primeira"),
  estrada: at("mas na estrada"),
  troca: at("então você troca"),
  quinta: at("essa é a quinta"),
  entre: at("e entre elas"),
  arranhar: at("mas trocar de engrenagem"),
  anel: at("então você coloca um anel"),
  sinc: at("esse é o sincronizador"),
  re: at("e pra dar ré"),
  mais: at("você coloca uma engrenagem a mais"),
  parabens: at("parabéns"),
  cta: at("comenta aí"),
};

/** Alturas dos eixos: entrada (motor) e saída (roda). */
export const Y_IN = 2.6;
export const Y_OUT = 1.35;
export const X_WHEEL = 5.6;

/** Pares de engrenagens [x, raio na entrada, raio na saída]. Distância entre eixos = 1.25. */
export const PARES: { nome: string; x: number; rin: number; rout: number }[] = [
  { nome: "1ª", x: 0.9, rin: 0.33, rout: 0.92 },
  { nome: "2ª", x: 1.45, rin: 0.45, rout: 0.8 },
  { nome: "3ª", x: 1.95, rin: 0.57, rout: 0.68 },
  { nome: "4ª", x: 2.45, rin: 0.68, rout: 0.57 },
  { nome: "5ª", x: 2.95, rin: 0.8, rout: 0.45 },
];
export const X_RE = 3.5;

/** Motor girando? (morre quando freia, volta quando aparece a embreagem) */
export const engineOn = (t: number) => (t > T.freia + 0.4 && t < T.discos + 0.6 ? 0 : 1);
/** Embreagem pisada (discos separados). */
export const clutchOpen = (t: number) => windowed(t, T.pisa + 0.3, T.embreagem + 1.2, 0.3);
/** Engrenagem engatada: índice em PARES, -1 = direto (sem câmbio), -2 = ré. */
export const marcha = (t: number) => {
  if (t < T.pequena + 0.6) return -1;
  if (t < T.troca + 1.4) return 0;
  if (t < T.entre) return 4;
  if (t < T.arranhar) {
    const k = Math.floor((t - T.entre) / Math.max(0.6, (T.arranhar - T.entre) / 3));
    return Math.min(3, 1 + k);
  }
  if (t < T.mais + 1.6) return 4;
  if (t < T.parabens + 0.2) return -2;
  return 4;
};
export const ratio = (t: number) => {
  const m = marcha(t);
  if (m === -1) return 1;
  if (m === -2) return -0.55;
  return PARES[m].rin / PARES[m].rout;
};
const W_ENG = 5.5;
const STEP = 1 / 120;
const N = Math.ceil((DURATION_S + 1) / STEP);
const ENG = new Float32Array(N + 1);
const WHL = new Float32Array(N + 1);
// rampa suave da velocidade do motor e da roda
let we = 0;
let ww = 0;
for (let i = 0; i < N; i++) {
  const t = i * STEP;
  const alvoE = t < T.liga ? 0 : W_ENG * engineOn(t);
  we += (alvoE - we) * Math.min(1, STEP * (alvoE > we ? 3 : 6));
  const freio = t > T.freia && t < T.discos + 0.6;
  const alvoW = freio ? 0 : we * ratio(t) * (1 - clutchOpen(t));
  ww += (alvoW - ww) * Math.min(1, STEP * 3.5);
  ENG[i + 1] = ENG[i] + we * STEP;
  WHL[i + 1] = WHL[i] + ww * STEP;
}
const look = (arr: Float32Array, t: number) => {
  const x = Math.min(N, Math.max(0, t / STEP));
  const i = Math.floor(x);
  const f = x - i;
  return arr[i] * (1 - f) + arr[Math.min(i + 1, N)] * f;
};
export const engineAngle = (t: number) => look(ENG, t);
export const wheelAngle = (t: number) => look(WHL, t);
export const ease = Easing.inOut(Easing.cubic);
export const gearbox = (t: number) => appear(t, T.pequena + 0.2, 0.8);

export const PLAN: PlanItem[] = [
  [0, -3.9, 2.9, "wave", 0.6],
  [T.liga, -3.9, 2.9, "point", 0.9],
  [T.nunca, -3.9, 2.9, "worried", 0.6],
  [T.freia + 0.3, -3.9, 2.9, "panic", 0.6],
  [T.discos, -3.9, 2.9, "point", 0.9],
  [T.embreagem, -3.9, 2.9, "thumbs", 0.6],
  [T.sair, -3.9, 2.9, "worried", 0.6],
  [T.primeira, -3.9, 2.9, "thumbs", 0.6],
  [T.estrada, -3.9, 2.9, "point", 0.9],
  [T.quinta, -3.9, 2.9, "thumbs", 0.6],
  [T.arranhar, -3.9, 2.9, "worried", 0.6],
  [T.sinc, -3.9, 2.9, "thumbs", 0.6],
  [T.re, -3.9, 2.9, "point", 0.9],
  [T.parabens, -3.9, 2.9, "party", 0.5],
];

export const CAM: [number, [number, number, number], [number, number, number]][] = [
  [0, [10, 9, 24], [0.2, 1.9, 0]],
  [T.nunca, [1.5, 4.8, 9], [-2.6, 2.4, 0]],
  [T.discos, [2.6, 4.0, 6.2], [-1.2, 2.5, 0]],
  [T.sair, [11, 6.5, 16], [2.4, 2.0, 0]],
  [T.pequena, [4.0, 4.0, 6.8], [1.0, 2.0, 0]],
  [T.estrada, [5.6, 4.0, 6.8], [2.8, 2.0, 0]],
  [T.entre, [6.5, 5.0, 8.5], [2.0, 2.0, 0]],
  [T.anel, [5.0, 3.4, 5.2], [2.7, 1.7, 0]],
  [T.re, [6.4, 3.8, 6.4], [3.5, 2.0, 0]],
  [T.parabens, [10, 9, 24], [0.2, 1.9, 0]],
];

type Tone = "red" | "blue" | "green" | "yellow";
const S: [number, number] = [540, 1250];

export const LABELS: { text: string; from: number; to: number; p: [number, number, number]; tone?: Tone; screen?: [number, number] }[] = [
  { text: "MOTOR", from: 0.8, to: T.nunca, p: [-2.6, 4.0, 0.9] },
  { text: "RODA", from: 1.4, to: T.nunca, p: [X_WHEEL, 2.8, 0.5] },
  { text: "FREOU...", from: T.freia + 0.3, to: T.discos, p: [X_WHEEL, 2.8, 0.5], tone: "red" },
  { text: "O MOTOR MORREU!", from: T.freia + 1.0, to: T.discos, p: [-2.6, 4.0, 0.9], tone: "red" },
  { text: "DOIS DISCOS", from: T.discos + 1.0, to: T.pisa, p: [-1.05, 3.9, 0.3] },
  { text: "SEPAROU!", from: T.pisa + 0.9, to: T.embreagem, p: [-1.05, 3.9, 0.3], tone: "blue" },
  { text: "RODA PARADA, MOTOR LIGADO", from: T.pisa + 1.6, to: T.embreagem + 1.2, p: [0, 0, 0], tone: "green", screen: S },
  { text: "SEM FORÇA PRA SAIR", from: T.sair + 0.8, to: T.pequena, p: [X_WHEEL, 2.8, 0.5], tone: "red" },
  { text: "PEQUENA", from: T.pequena + 1.4, to: T.primeira, p: [0.9, 3.2, 0.4] },
  { text: "GRANDE", from: T.pequena + 1.8, to: T.primeira, p: [0.9, 1.5, 1.2] },
  { text: "DEVAGAR, MAS FORTE", from: T.devagar + 0.3, to: T.primeira + 1.0, p: [0, 0, 0], tone: "green", screen: S },
  { text: "GRANDE", from: T.troca + 1.6, to: T.quinta, p: [2.95, 3.6, 0.4] },
  { text: "PEQUENA", from: T.troca + 2.0, to: T.quinta, p: [2.95, 1.6, 0.9] },
  { text: "RÁPIDO!", from: T.troca + 2.6, to: T.quinta + 1.0, p: [0, 0, 0], tone: "blue", screen: S },
  { text: "2ª · 3ª · 4ª", from: T.entre + 0.5, to: T.arranhar, p: [1.95, 3.6, 0.4] },
  { text: "ARRANHOU!", from: T.arranhar + 1.0, to: T.anel, p: [2.7, 2.6, 1.0], tone: "red" },
  { text: "ANEL", from: T.anel + 1.0, to: T.sinc, p: [2.62, 2.3, 0.6], tone: "yellow" },
  { text: "MESMA VELOCIDADE → ENCAIXA", from: T.anel + 2.2, to: T.sinc + 0.8, p: [0, 0, 0], tone: "green", screen: S },
  { text: "ENGRENAGEM A MAIS", from: T.mais + 1.0, to: T.parabens, p: [X_RE, 2.6, 1.0], tone: "yellow" },
  { text: "GIRA AO CONTRÁRIO", from: T.mais + 2.2, to: T.parabens, p: [0, 0, 0], tone: "red", screen: S },
  { text: "EMBREAGEM", from: T.parabens + 0.3, to: DURATION_S, p: [-1.05, 3.9, 0.3], tone: "blue" },
  { text: "MARCHAS", from: T.parabens + 0.45, to: DURATION_S, p: [1.9, 3.9, 0.4], tone: "yellow" },
  { text: "RODA", from: T.parabens + 0.6, to: DURATION_S, p: [X_WHEEL, 2.8, 0.5] },
];

export const TERMS: { text: string; at: number; to: number }[] = [
  { text: "EMBREAGEM", at: T.embreagem, to: T.sair },
  { text: "PRIMEIRA MARCHA", at: T.primeira, to: T.estrada },
  { text: "QUINTA MARCHA", at: T.quinta, to: T.entre },
  { text: "SINCRONIZADOR", at: T.sinc, to: T.re },
];

export const SFX: { src: string; at: number; vol: number }[] = [
  { src: "sfx/whoosh.mp3", at: 0.2, vol: 0.35 },
  { src: "sfx/air.mp3", at: T.liga + 0.2, vol: 0.4 },
  { src: "sfx/snap.mp3", at: T.freia + 0.3, vol: 0.5 },
  { src: "sfx/alarm.mp3", at: T.freia + 1.0, vol: 0.25 },
  { src: "sfx/pop.mp3", at: T.discos + 0.6, vol: 0.5 },
  { src: "sfx/click.mp3", at: T.pisa + 0.3, vol: 0.6 },
  { src: "sfx/ding.mp3", at: T.embreagem, vol: 0.45 },
  { src: "sfx/pop.mp3", at: T.pequena + 0.6, vol: 0.5 },
  { src: "sfx/ding.mp3", at: T.primeira, vol: 0.45 },
  { src: "sfx/click.mp3", at: T.troca + 1.4, vol: 0.6 },
  { src: "sfx/whoosh.mp3", at: T.troca + 1.8, vol: 0.4 },
  { src: "sfx/ding.mp3", at: T.quinta, vol: 0.45 },
  { src: "sfx/click.mp3", at: T.entre + 0.6, vol: 0.5 },
  { src: "sfx/snap.mp3", at: T.arranhar + 0.9, vol: 0.6 },
  { src: "sfx/snap.mp3", at: T.arranhar + 1.2, vol: 0.6 },
  { src: "sfx/pop.mp3", at: T.anel + 0.6, vol: 0.5 },
  { src: "sfx/click.mp3", at: T.anel + 2.2, vol: 0.6 },
  { src: "sfx/ding.mp3", at: T.sinc, vol: 0.45 },
  { src: "sfx/pop.mp3", at: T.mais + 0.6, vol: 0.5 },
  { src: "sfx/party.mp3", at: T.parabens, vol: 0.5 },
];

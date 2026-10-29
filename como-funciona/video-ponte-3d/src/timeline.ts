import { Easing } from "remotion";
import { Word, appear, findAt } from "./lib";
import raw from "./words.json";
import type { PlanItem } from "./Guy";

export const WORDS = (raw as Word[]).filter((w) => !w.t.startsWith("["));
export const at = (phrase: string, off = 0) => findAt(WORDS, phrase) + off;
export const DURATION_S = WORDS[WORDS.length - 1].e + 2;

export const T = {
  tabua: 0,
  caminhao: at("mas quando o caminhão"),
  enverga: at("a tábua enverga"),
  quebra: at("e quebra no meio"),
  pilares: at("então você coloca pilares"),
  esses: at("esses são os pilares"),
  correnteza: at("mas a correnteza"),
  afunda: at("e o pilar afunda"),
  estacas: at("então você crava estacas"),
  rocha: at("até chegar na rocha"),
  fundacao: at("essa é a fundação"),
  barcos: at("mas os barcos"),
  batem: at("e batem"),
  tira: at("então você tira"),
  torres: at("levanta duas torres"),
  pendura: at("e pendura"),
  estaiada: at("essa é a ponte estaiada"),
  calor: at("mas no calor"),
  frio: at("e no frio"),
  km: at("numa ponte de um"),
  racharia: at("e a pista racharia"),
  deixa: at("então você deixa"),
  junta: at("essa é a junta"),
  fim: at("e é assim"),
  cta: at("comenta aí"),
};

/** Medidas: rio de x = -4 a 4, margens com o topo em y = 3, corte da terra na frente em z = 3. */
export const M = {
  river: 4,
  top: 2.98,
  deck: 3.0,
  bed: -0.5,
  water: 0.6,
  rock: -2.5,
  front: 3,
  pilarX: 1.6,
  towerX: 5.9,
  towerTop: 10.2,
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

/** Quanto a pista esticou (+) ou encolheu (-), exagerado pra dar pra ver. */
export const stretch = (t: number) => {
  if (t > T.deixa + 1.5 && t < T.fim) return 0.22 * Math.sin((t - T.deixa - 1.5) * 1.8);
  return keys(t, [
    [T.calor + 0.3, 0],
    [T.calor + 1.3, 0.25],
    [T.frio + 0.2, 0.25],
    [T.frio + 1.3, -0.25],
    [T.km + 0.2, -0.25],
    [T.km + 1.2, 0],
    [T.racharia, 0],
    [T.racharia + 0.8, 0.3],
    [T.deixa, 0.3],
    [T.deixa + 0.8, 0],
  ]);
};

/** Pilar da direita afundando com a erosão (0 a 1). */
export const sink = (t: number) => appear(t, T.afunda + 0.1, 0.8) * (1 - appear(t, T.estacas + 0.4, 0.8));

export const PLAN: PlanItem[] = [
  [0, -4.6, -1.8, "wave", 0.5],
  [T.caminhao, -4.6, -1.8, "point", 0.9],
  [T.quebra, -4.6, -1.8, "panic", 0.5],
  [T.pilares, -4.6, -1.8, "point", 0.9],
  [T.esses, -4.6, -1.8, "thumbs", 0.5],
  [T.correnteza, -4.6, -1.8, "worried", 0.7],
  [T.estacas, -4.6, -1.8, "point", 0.9],
  [T.fundacao, -4.6, -1.8, "thumbs", 0.5],
  [T.barcos, -4.6, -1.8, "worried", 0.7],
  [T.tira, -4.6, -1.8, "point", 0.9],
  [T.estaiada, -4.6, -1.8, "thumbs", 0.5],
  [T.calor, -4.6, -1.8, "worried", 0.7],
  [T.deixa, -4.6, -1.8, "point", 0.9],
  [T.junta, -4.6, -1.8, "thumbs", 0.5],
  [T.fim, -4.6, -1.8, "party", 0.5],
];

export const CAM: [number, [number, number, number], [number, number, number]][] = [
  [0, [3.5, 6.5, 19], [-0.5, 1.5, 0]],
  [T.caminhao, [3, 5.5, 15], [-0.5, 2.0, 0]],
  [T.pilares, [2.5, 5, 18], [0, 1.5, 0]],
  [T.correnteza, [4, 4.5, 11], [1.2, 0.6, 0]],
  [T.estacas, [1, 0, 16], [0, -1.3, 0]],
  [T.barcos, [-7, 7, 15], [0, 1.5, -2]],
  [T.tira, [4, 6, 25], [0, 5.2, 0]],
  [T.calor, [3.2, 7.8, 6.6], [4.9, 3.0, 0]],
  [T.deixa, [3.6, 6.4, 4.8], [5.0, 3.0, 0.1]],
  [T.fim, [5, 7, 26], [0, 4.5, 0]],
];

type Tone = "red" | "blue" | "green" | "yellow";
const S: [number, number] = [540, 1250];

export const LABELS: { text: string; from: number; to: number; p: [number, number, number]; tone?: Tone; screen?: [number, number] }[] = [
  { text: "TÁBUA", from: 0.8, to: T.caminhao, p: [0, 3.5, 1.0] },
  { text: "RIO", from: 1.4, to: T.caminhao, p: [0, 0.9, 2.6], tone: "blue" },
  { text: "ENVERGOU", from: T.enverga + 0.3, to: T.quebra, p: [0, 4.6, 0.6], tone: "red" },
  { text: "QUEBROU!", from: T.quebra + 0.2, to: T.pilares, p: [0, 4.0, 0.6], tone: "red" },
  { text: "PILAR", from: T.pilares + 1.0, to: T.esses, p: [-1.6, 1.6, 1.0] },
  { text: "CORRENTEZA", from: T.correnteza + 0.3, to: T.afunda, p: [0.3, 1.0, 2.4], tone: "blue" },
  { text: "CAVOU A TERRA", from: T.correnteza + 2.0, to: T.afunda, p: [2.4, 0.2, 1.4], tone: "red" },
  { text: "AFUNDOU!", from: T.afunda + 0.5, to: T.estacas, p: [1.6, 3.6, 0.8], tone: "red" },
  { text: "ESTACAS", from: T.estacas + 1.4, to: T.fundacao, p: [2.6, -1.4, 1.0] },
  { text: "ROCHA FIRME", from: T.rocha + 0.2, to: T.barcos, p: [0, -3.3, 3.0], tone: "yellow" },
  { text: "NÃO PASSA!", from: T.batem + 0.2, to: T.tira, p: [0, 3.0, -2.4], tone: "red" },
  { text: "TORRE", from: T.torres + 1.2, to: T.pendura, p: [M.towerX, 11.4, 1.3] },
  { text: "CABOS DE AÇO", from: T.pendura + 1.2, to: T.estaiada, p: [3.0, 8.2, 1.2], tone: "yellow" },
  { text: "CALOR: ESTICA", from: T.calor + 0.4, to: T.frio, p: [4.3, 3.6, 1.0], tone: "red" },
  { text: "FRIO: ENCOLHE", from: T.frio + 0.3, to: T.km, p: [4.3, 3.6, 1.0], tone: "blue" },
  { text: "1 KM ≈ 30 CM", from: T.km + 0.6, to: T.racharia, p: [0, 0, 0], tone: "yellow", screen: S },
  { text: "RACHOU!", from: T.racharia + 0.9, to: T.deixa, p: [5.1, 3.5, 1.0], tone: "red" },
  { text: "DENTES DE METAL", from: T.deixa + 1.0, to: T.junta, p: [4.9, 3.4, 1.1] },
  { text: "TORRE", from: T.fim + 0.3, to: DURATION_S, p: [M.towerX, 11.4, 1.3] },
  { text: "CABOS", from: T.fim + 0.45, to: DURATION_S, p: [-3.0, 8.2, 1.2], tone: "yellow" },
  { text: "JUNTA", from: T.fim + 0.6, to: DURATION_S, p: [5.0, 3.4, 1.0], tone: "green" },
];

export const TERMS: { text: string; at: number; to: number }[] = [
  { text: "PILARES", at: T.esses, to: T.correnteza },
  { text: "FUNDAÇÃO", at: T.fundacao, to: T.barcos },
  { text: "PONTE ESTAIADA", at: T.estaiada, to: T.calor },
  { text: "JUNTA DE DILATAÇÃO", at: T.junta, to: T.fim },
];

export const SFX: { src: string; at: number; vol: number }[] = [
  { src: "sfx/whoosh.mp3", at: 0.2, vol: 0.4 },
  { src: "sfx/pop.mp3", at: 0.8, vol: 0.4 },
  { src: "sfx/whoosh.mp3", at: T.caminhao, vol: 0.35 },
  { src: "sfx/snap.mp3", at: T.quebra, vol: 0.7 },
  { src: "sfx/air.mp3", at: T.quebra + 0.7, vol: 0.45 },
  { src: "sfx/pop.mp3", at: T.pilares + 0.4, vol: 0.5 },
  { src: "sfx/pop.mp3", at: T.pilares + 0.7, vol: 0.5 },
  { src: "sfx/snap.mp3", at: T.pilares + 2.0, vol: 0.5 },
  { src: "sfx/ding.mp3", at: T.esses, vol: 0.45 },
  { src: "sfx/air.mp3", at: T.correnteza + 0.3, vol: 0.35 },
  { src: "sfx/alarm.mp3", at: T.afunda + 0.4, vol: 0.25 },
  { src: "sfx/snap.mp3", at: T.estacas + 1.0, vol: 0.5 },
  { src: "sfx/snap.mp3", at: T.estacas + 1.45, vol: 0.5 },
  { src: "sfx/snap.mp3", at: T.estacas + 1.9, vol: 0.5 },
  { src: "sfx/snap.mp3", at: T.estacas + 2.35, vol: 0.5 },
  { src: "sfx/ding.mp3", at: T.fundacao, vol: 0.45 },
  { src: "sfx/whoosh.mp3", at: T.barcos + 0.3, vol: 0.35 },
  { src: "sfx/alarm.mp3", at: T.batem + 0.1, vol: 0.3 },
  { src: "sfx/pop.mp3", at: T.torres + 0.2, vol: 0.5 },
  { src: "sfx/pop.mp3", at: T.torres + 0.6, vol: 0.5 },
  { src: "sfx/click.mp3", at: T.pendura + 0.3, vol: 0.5 },
  { src: "sfx/ding.mp3", at: T.estaiada, vol: 0.45 },
  { src: "sfx/whoosh.mp3", at: T.estaiada + 0.4, vol: 0.35 },
  { src: "sfx/alarm.mp3", at: T.racharia + 0.9, vol: 0.25 },
  { src: "sfx/click.mp3", at: T.deixa + 0.6, vol: 0.5 },
  { src: "sfx/ding.mp3", at: T.junta, vol: 0.45 },
  { src: "sfx/party.mp3", at: T.fim, vol: 0.5 },
];

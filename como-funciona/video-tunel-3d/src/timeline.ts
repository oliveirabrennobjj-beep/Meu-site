import { Word, appear, findAt, windowed } from "./lib";
import raw from "./words.json";
import type { PlanItem } from "./Guy";

export const WORDS = (raw as Word[]).filter((w) => !w.t.startsWith("["));
export const at = (phrase: string, off = 0) => findAt(WORDS, phrase) + off;
export const DURATION_S = WORDS[WORDS.length - 1].e + 2;

export const T = {
  buraco: 0,
  terra: at("mas a terra"),
  desaba: at("e o buraco desaba"),
  teto: at("então você faz o teto"),
  revestimento: at("esse é o revestimento"),
  pa: at("mas cavar na pá"),
  maquina: at("então você usa uma máquina"),
  aneis: at("e vai colocando"),
  tuneladora: at("essa é a tuneladora"),
  avanca: at("ela avança"),
  agua: at("mas a água da chuva"),
  manta: at("então você coloca uma manta"),
  drenagem: at("essa é a drenagem"),
  fumaca: at("mas a fumaça"),
  pendura: at("então você pendura"),
  ventilacao: at("essa é a ventilação"),
  luz: at("e pra ninguém"),
  fim: at("e é assim"),
  cta: at("comenta aí"),
};

/** Medidas: boca do túnel em x = X0, fim da montanha em X1; arco com centro em YC e raio R. */
export const M = { X0: -6, X1: 9, YC: 0.9, R: 1.5, road: 0.3, top: 6.5 };

/** Até onde o túnel já foi cavado (x). */
export const cavado = (t: number) => {
  if (t < T.terra) return M.X0 + 2.4 * appear(t, 0.3, 2.8);
  if (t < T.maquina + 0.8) return M.X0 + 2.4;
  return M.X0 + 2.4 + (M.X1 - M.X0 - 2.4 + 2) * Math.min(1, (t - T.maquina - 0.8) / (T.agua - T.maquina - 0.4));
};
/** Frente da tuneladora (x). */
export const tbmX = (t: number) => cavado(t) - 0.1;
export const tbmOn = (t: number) => t > T.maquina + 0.3 && t < T.agua + 0.5;
/** Até onde tem anel de revestimento (x). */
export const aneis = (t: number) => {
  if (t < T.teto + 0.5) return M.X0 - 0.1;
  if (t < T.maquina) return M.X0 + 2.4 * appear(t, T.teto + 0.5, 3.0);
  return Math.max(M.X0 + 2.4, tbmX(t) - 3.2);
};
export const desabou = (t: number) => windowed(t, T.desaba + 0.1, T.teto + 0.6, 0.2);
export const fumaca = (t: number) => appear(t, T.fumaca + 0.6, 2.0) * (1 - appear(t, T.pendura + 1.6, 2.5));

export const PLAN: PlanItem[] = [
  [0, -8.2, 2.0, "dig", 0.9],
  [T.terra, -8.2, 2.0, "worried", 0.9],
  [T.desaba, -8.2, 2.0, "panic", 0.9],
  [T.teto, -8.2, 2.0, "point", 0.9],
  [T.revestimento, -8.2, 2.0, "thumbs", 0.6],
  [T.pa, -8.2, 2.0, "worried", 0.6],
  [T.tuneladora, -8.2, 2.0, "thumbs", 0.6],
  [T.agua, -8.2, 2.0, "worried", 0.7],
  [T.drenagem, -8.2, 2.0, "thumbs", 0.6],
  [T.fumaca, -8.2, 2.0, "panic", 0.6],
  [T.ventilacao, -8.2, 2.0, "thumbs", 0.6],
  [T.luz, -8.2, 2.0, "point", 0.9],
  [T.fim, -8.2, 2.0, "party", 0.5],
];

export const CAM: [number, [number, number, number], [number, number, number]][] = [
  [0, [-14, 5.5, 13], [-5, 2.2, 0]],
  [T.terra, [-10.5, 3.4, 10.5], [-4.4, 1.4, 0]],
  [T.teto, [-10.0, 3.0, 8.5], [-4.6, 1.4, 0]],
  [T.pa, [-5, 6.0, 20], [0.5, 2.2, 0]],
  [T.maquina, [-1, 4.5, 16], [0.8, 1.8, 0]],
  [T.agua, [-3, 9, 17], [1.0, 3.2, 0]],
  [T.manta, [-3.5, 3.0, 8.5], [-1.2, 1.1, 0]],
  [T.fumaca, [-12, 3.4, 9], [-4, 1.6, 0]],
  [T.pendura, [-6, 3.0, 7.5], [-1.5, 2.0, 0]],
  [T.luz, [-12.5, 1.8, 1.6], [-4, 1.2, 0]],
  [T.fim, [-15, 7, 16], [-2.5, 2.6, 0]],
];

type Tone = "red" | "blue" | "green" | "yellow";
const S: [number, number] = [540, 1250];

export const LABELS: { text: string; from: number; to: number; p: [number, number, number]; tone?: Tone; screen?: [number, number] }[] = [
  { text: "BURACO NA MONTANHA", from: 0.6, to: T.terra, p: [-5.0, 3.0, 1.6] },
  { text: "DESABOU!", from: T.desaba + 0.4, to: T.teto, p: [-5.0, 2.8, 1.6], tone: "red" },
  { text: "ARCO", from: T.teto + 1.4, to: T.revestimento, p: [-5.4, 2.8, 1.0], tone: "yellow" },
  { text: "PESO DA MONTANHA", from: T.teto + 2.4, to: T.revestimento, p: [-4.4, 5.0, 1.0], tone: "red" },
  { text: "ANOS NA PÁ...", from: T.pa + 0.6, to: T.maquina, p: [0, 0, 0], tone: "red", screen: S },
  { text: "RODA COM DENTES", from: T.maquina + 1.4, to: T.aneis, p: [0, 3.0, 1.2] },
  { text: "ANÉIS ATRÁS", from: T.aneis + 0.6, to: T.tuneladora, p: [-1.5, 3.0, 1.2], tone: "yellow" },
  { text: "~15 M POR DIA", from: T.avanca + 0.3, to: T.agua, p: [0, 0, 0], tone: "green", screen: S },
  { text: "CHUVA", from: T.agua + 0.4, to: T.manta, p: [1.0, 7.6, 0], tone: "blue" },
  { text: "ENTROU ÁGUA!", from: T.agua + 1.6, to: T.manta, p: [1.0, 2.8, 1.2], tone: "red" },
  { text: "MANTA", from: T.manta + 1.0, to: T.drenagem, p: [-1.5, 2.8, 1.2], tone: "yellow" },
  { text: "CANO DE DRENO", from: T.manta + 2.4, to: T.drenagem, p: [-2.5, 0.5, 1.6], tone: "blue" },
  { text: "SEM AR!", from: T.fumaca + 1.6, to: T.pendura, p: [-3.0, 2.8, 1.2], tone: "red" },
  { text: "VENTILADOR", from: T.pendura + 1.0, to: T.ventilacao, p: [-2.0, 3.0, 0.4] },
  { text: "AR SUJO PRA FORA", from: T.pendura + 2.4, to: T.ventilacao + 0.8, p: [0, 0, 0], tone: "green", screen: S },
  { text: "LUZ FORTE NA ENTRADA", from: T.luz + 1.0, to: T.fim, p: [0, 0, 0], tone: "yellow", screen: S },
  { text: "REVESTIMENTO", from: T.fim + 0.3, to: DURATION_S, p: [-5.4, 2.8, 1.0], tone: "yellow" },
  { text: "VENTILAÇÃO", from: T.fim + 0.45, to: DURATION_S, p: [-1.5, 2.8, 0.4] },
  { text: "DRENAGEM", from: T.fim + 0.6, to: DURATION_S, p: [-3.5, 0.5, 1.6], tone: "blue" },
];

export const TERMS: { text: string; at: number; to: number }[] = [
  { text: "REVESTIMENTO", at: T.revestimento, to: T.pa },
  { text: "TATUZÃO", at: T.tuneladora, to: T.avanca + 0.4 },
  { text: "DRENAGEM", at: T.drenagem, to: T.fumaca },
  { text: "VENTILAÇÃO", at: T.ventilacao, to: T.luz },
];

export const SFX: { src: string; at: number; vol: number }[] = [
  { src: "sfx/whoosh.mp3", at: 0.2, vol: 0.4 },
  { src: "sfx/pop.mp3", at: 1.0, vol: 0.35 },
  { src: "sfx/alarm.mp3", at: T.terra + 0.6, vol: 0.25 },
  { src: "sfx/snap.mp3", at: T.desaba + 0.2, vol: 0.6 },
  { src: "sfx/air.mp3", at: T.desaba + 0.4, vol: 0.4 },
  { src: "sfx/pop.mp3", at: T.teto + 0.6, vol: 0.5 },
  { src: "sfx/ding.mp3", at: T.revestimento, vol: 0.45 },
  { src: "sfx/whoosh.mp3", at: T.maquina + 0.4, vol: 0.4 },
  { src: "sfx/air.mp3", at: T.maquina + 1.2, vol: 0.4 },
  { src: "sfx/ding.mp3", at: T.tuneladora, vol: 0.45 },
  { src: "sfx/alarm.mp3", at: T.agua + 1.6, vol: 0.25 },
  { src: "sfx/pop.mp3", at: T.manta + 0.6, vol: 0.5 },
  { src: "sfx/ding.mp3", at: T.drenagem, vol: 0.45 },
  { src: "sfx/alarm.mp3", at: T.fumaca + 1.6, vol: 0.25 },
  { src: "sfx/pop.mp3", at: T.pendura + 0.6, vol: 0.5 },
  { src: "sfx/air.mp3", at: T.pendura + 1.4, vol: 0.45 },
  { src: "sfx/ding.mp3", at: T.ventilacao, vol: 0.45 },
  { src: "sfx/click.mp3", at: T.luz + 0.8, vol: 0.5 },
  { src: "sfx/party.mp3", at: T.fim, vol: 0.5 },
];

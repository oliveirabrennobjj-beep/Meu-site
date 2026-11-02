import { Word, appear, findAt, windowed } from "./lib";
import raw from "./words.json";
import type { PlanItem } from "./Guy";

export const WORDS = (raw as Word[]).filter((w) => !w.t.startsWith("["));
export const at = (phrase: string, off = 0) => findAt(WORDS, phrase) + off;
export const DURATION_S = WORDS[WORDS.length - 1].e + 2;

export const T = {
  tijolo: 0,
  peso: at("mas o peso"),
  desaba: at("e a parede desaba"),
  esqueleto: at("então você faz um esqueleto"),
  aco: at("com barras de aço"),
  armado: at("esse é o concreto armado"),
  mole: at("mas o chão é mole"),
  crava: at("então você crava"),
  junta: at("e junta todas"),
  fundacao: at("essa é a fundação"),
  escada: at("mas ninguém aguenta"),
  buraco: at("então você deixa um buraco"),
  cabine: at("com uma cabine"),
  poco: at("esse é o poço"),
  paredes: at("e as paredes grossas"),
  vento: at("quando o vento"),
  nucleo: at("esse é o núcleo"),
  agua: at("mas a água da rua"),
  bombeia: at("então você bombeia"),
  desce: at("e ela desce"),
  reservatorio: at("esse é o reservatório"),
  fim: at("e é assim"),
  cta: at("comenta aí"),
};

/** Medidas: andar, metade da planta, chão e rocha. */
export const P = { fh: 0.8, hx: 2.0, hz: 1.5, rock: -6.2, floor: -7.5 };

/** Quantos andares de esqueleto existem (cresce de 1 em 1). */
export const andares = (t: number) => {
  if (t < T.esqueleto + 0.4) return 0;
  const base = Math.min(6, 1 + Math.floor((t - T.esqueleto - 0.4) / 0.45));
  if (t < T.escada + 0.6) return base;
  return Math.min(14, 6 + Math.floor((t - T.escada - 0.6) / 0.22));
};
export const ANDARES_MAX = 14;

/** Afundar e entortar (antes da fundação). */
export const afunda = (t: number) => appear(t, T.mole + 0.5, 2.0) * (1 - appear(t, T.junta + 0.8, 1.2));
/** Balanço com o vento: forte antes do núcleo aparecer, quase nada depois. */
export const sway = (t: number) => {
  const a = windowed(t, T.vento + 0.2, T.agua, 0.5);
  if (a <= 0) return 0;
  const amp = 0.05 * (1 - 0.8 * appear(t, T.nucleo - 0.2, 0.8));
  return a * amp * Math.sin((t - T.vento) * 3.2);
};
/** Cabine do elevador: altura (andar) ao longo do tempo. */
export const cabine = (t: number) => {
  if (t < T.cabine + 0.6) return 0;
  const k = (t - T.cabine - 0.6) * 0.35;
  return (0.5 - 0.5 * Math.cos(k * Math.PI)) * (ANDARES_MAX - 1);
};

export const PLAN: PlanItem[] = [
  [0, -4.4, 2.2, "wave", 0.6],
  [1.0, -4.4, 2.2, "point", 0.9],
  [T.peso, -4.4, 2.2, "worried", 0.6],
  [T.desaba, -4.4, 2.2, "panic", 0.6],
  [T.esqueleto, -4.4, 2.2, "point", 0.9],
  [T.armado, -4.4, 2.2, "thumbs", 0.6],
  [T.mole, -4.4, 2.2, "worried", 0.7],
  [T.fundacao, -4.4, 2.2, "thumbs", 0.6],
  [T.escada, -4.4, 2.2, "worried", 0.6],
  [T.poco, -4.4, 2.2, "point", 0.9],
  [T.vento, -4.4, 2.2, "panic", 0.5],
  [T.nucleo, -4.4, 2.2, "thumbs", 0.6],
  [T.agua, -4.4, 2.2, "worried", 0.6],
  [T.reservatorio, -4.4, 2.2, "point", 0.9],
  [T.fim, -4.4, 2.2, "party", 0.5],
];

export const CAM: [number, [number, number, number], [number, number, number]][] = [
  [0, [3, 3.5, 13], [0, 2.4, 0]],
  [T.desaba, [3, 2.5, 12], [0, 1.4, 0]],
  [T.esqueleto, [5, 4.5, 13], [0, 2.6, 0]],
  [T.aco, [2.4, 2.2, 6.5], [1.9, 1.4, 1.4]],
  [T.mole, [4, 1.0, 15], [0, -1.6, 0]],
  [T.crava, [3, -0.5, 16], [0, -2.8, 0]],
  [T.escada, [6, 6.5, 22], [0, 6.0, 0]],
  [T.buraco, [4, 6.5, 19], [0, 6.6, 0]],
  [T.vento, [9, 7.0, 21], [0, 6.6, 0]],
  [T.agua, [6, 6.0, 23], [0, 5.9, 0]],
  [T.fim, [8, 5.5, 26], [0, 5.4, 0]],
];

type Tone = "red" | "blue" | "green" | "yellow";
const S: [number, number] = [540, 1250];
const TOPO = ANDARES_MAX * P.fh;

export const LABELS: { text: string; from: number; to: number; p: [number, number, number]; tone?: Tone; screen?: [number, number] }[] = [
  { text: "SÓ TIJOLO", from: 0.6, to: T.peso, p: [0, 4.6, 0.5] },
  { text: "PESO DEMAIS!", from: T.peso + 0.8, to: T.desaba, p: [0, 1.0, 1.6], tone: "red" },
  { text: "DESABOU!", from: T.desaba + 0.4, to: T.esqueleto, p: [0, 1.8, 0.5], tone: "red" },
  { text: "COLUNA", from: T.esqueleto + 1.4, to: T.aco, p: [-2.0, 3.0, 1.5] },
  { text: "VIGA", from: T.esqueleto + 1.9, to: T.aco, p: [0, 3.4, 1.5], tone: "yellow" },
  { text: "BARRAS DE AÇO", from: T.aco + 0.9, to: T.armado, p: [2.0, 2.4, 1.5], tone: "blue" },
  { text: "AFUNDANDO!", from: T.mole + 1.0, to: T.crava, p: [0, 0, 0], tone: "red", screen: S },
  { text: "ESTACAS", from: T.crava + 1.2, to: T.junta, p: [-2.6, -3.0, 1.5] },
  { text: "TERRA FIRME", from: T.crava + 2.0, to: T.fundacao, p: [2.6, P.rock - 0.3, 1.6], tone: "green" },
  { text: "BLOCO", from: T.junta + 0.8, to: T.fundacao, p: [2.4, -0.4, 1.6], tone: "yellow" },
  { text: "20 ANDARES DE ESCADA?", from: T.escada + 0.8, to: T.buraco, p: [0, 0, 0], tone: "red", screen: S },
  { text: "POÇO", from: T.buraco + 1.4, to: T.poco, p: [0, TOPO * 0.72, 0.8] },
  { text: "CABINE", from: T.cabine + 1.0, to: T.paredes, p: [0.9, 1.4, 0.8], tone: "blue" },
  { text: "VENTO", from: T.vento + 0.3, to: T.nucleo + 1.0, p: [-5.5, 8.5, 0], tone: "blue" },
  { text: "PAREDES GROSSAS", from: T.paredes + 0.8, to: T.nucleo, p: [0, TOPO * 0.72, 0.8], tone: "yellow" },
  { text: "NÃO SOBE!", from: T.agua + 1.2, to: T.bombeia, p: [2.6, 3.0, 1.6], tone: "red" },
  { text: "BOMBA", from: T.bombeia + 0.6, to: T.reservatorio, p: [3.0, 0.9, 1.4] },
  { text: "CAIXA NO TELHADO", from: T.bombeia + 1.8, to: T.reservatorio, p: [0, TOPO - 0.6, 1.6], tone: "blue" },
  { text: "DESCE SOZINHA", from: T.desce + 0.4, to: T.reservatorio + 1.0, p: [0, 0, 0], tone: "green", screen: S },
  { text: "RESERVATÓRIO", from: T.fim + 0.3, to: DURATION_S, p: [0, TOPO - 0.6, 1.6], tone: "blue" },
  { text: "NÚCLEO", from: T.fim + 0.45, to: DURATION_S, p: [0, TOPO * 0.6, 1.5], tone: "yellow" },
  { text: "FUNDAÇÃO", from: T.fim + 0.6, to: DURATION_S, p: [-2.4, -2.8, 1.5] },
];

export const TERMS: { text: string; at: number; to: number }[] = [
  { text: "CONCRETO ARMADO", at: T.armado, to: T.mole },
  { text: "FUNDAÇÃO", at: T.fundacao, to: T.escada },
  { text: "POÇO DO ELEVADOR", at: T.poco, to: T.paredes },
  { text: "NÚCLEO", at: T.nucleo, to: T.agua },
  { text: "RESERVATÓRIO SUPERIOR", at: T.reservatorio, to: T.fim },
];

export const SFX: { src: string; at: number; vol: number }[] = [
  { src: "sfx/whoosh.mp3", at: 0.2, vol: 0.4 },
  { src: "sfx/pop.mp3", at: 0.8, vol: 0.35 },
  { src: "sfx/alarm.mp3", at: T.peso + 0.8, vol: 0.25 },
  { src: "sfx/snap.mp3", at: T.desaba + 0.2, vol: 0.6 },
  { src: "sfx/air.mp3", at: T.desaba + 0.4, vol: 0.4 },
  { src: "sfx/pop.mp3", at: T.esqueleto + 0.5, vol: 0.5 },
  { src: "sfx/click.mp3", at: T.aco + 0.6, vol: 0.5 },
  { src: "sfx/ding.mp3", at: T.armado, vol: 0.45 },
  { src: "sfx/alarm.mp3", at: T.mole + 1.0, vol: 0.3 },
  { src: "sfx/snap.mp3", at: T.crava + 0.8, vol: 0.5 },
  { src: "sfx/snap.mp3", at: T.crava + 1.4, vol: 0.5 },
  { src: "sfx/pop.mp3", at: T.junta + 0.6, vol: 0.5 },
  { src: "sfx/ding.mp3", at: T.fundacao, vol: 0.45 },
  { src: "sfx/whoosh.mp3", at: T.escada + 0.6, vol: 0.4 },
  { src: "sfx/pop.mp3", at: T.buraco + 0.8, vol: 0.5 },
  { src: "sfx/ding.mp3", at: T.poco, vol: 0.45 },
  { src: "sfx/air.mp3", at: T.vento + 0.2, vol: 0.5 },
  { src: "sfx/ding.mp3", at: T.nucleo, vol: 0.45 },
  { src: "sfx/alarm.mp3", at: T.agua + 1.2, vol: 0.25 },
  { src: "sfx/pop.mp3", at: T.bombeia + 0.5, vol: 0.5 },
  { src: "sfx/air.mp3", at: T.bombeia + 1.0, vol: 0.4 },
  { src: "sfx/ding.mp3", at: T.reservatorio, vol: 0.45 },
  { src: "sfx/party.mp3", at: T.fim, vol: 0.5 },
];

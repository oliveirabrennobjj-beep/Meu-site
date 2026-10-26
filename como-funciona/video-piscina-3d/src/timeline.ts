import { Word, findAt } from "./lib";
import raw from "./words.json";
import type { PlanItem } from "./Guy";

export const WORDS = (raw as Word[]).filter((w) => !w.t.startsWith("["));
export const at = (phrase: string, off = 0) => findAt(WORDS, phrase) + off;
export const DURATION_S = WORDS[WORDS.length - 1].e + 2;

export const T = {
  pa: at("pega a pá"),
  cava: at("cava um buracão"),
  enche: at("enche de água"),
  chupa: at("a terra chupa"),
  lama: at("vira lama"),
  reveste: at("você reveste"),
  manta: at("uma manta"),
  agoraSim: at("agora sim"),
  verde: at("fica verde"),
  algas: at("são algas"),
  ralo: at("um ralo no fundo"),
  bomba: at("até uma bomba"),
  areia: at("cheio de areia"),
  devolve: at("devolve a água"),
  cloro: at("você joga cloro"),
  medir: at("tem que medir"),
  arde: at("arde o olho"),
  deMenos: at("de menos"),
  cheiro: at("aquele cheiro"),
  xixi: at("suor e xixi"),
  parabens: at("parabéns"),
  cta: at("comenta aí"),
};

/** Alturas da piscina. */
export const POOL = { x0: -3.4, x1: 3.4, z0: -4, z1: 0, hole: -2.8, floor: -2.3, water: 0 };

/** Profundidade já cavada (0 → buraco inteiro). */
export const digDepth = (t: number) => {
  if (t < T.cava) return 0;
  return Math.min(1, (t - T.cava - 0.2) / Math.max(1, T.enche - T.cava - 0.4)) * (0.3 - POOL.hole);
};

/** O boneco está sempre no centro da história. */
export const PLAN: PlanItem[] = [
  [0, 0, -1.6, "wave", 0.25],
  [T.pa, 0, -1.6, "thumbs", 0.1],
  [T.cava, 0, -1.6, "dig", -0.4],
  [T.enche, 4.5, -1.2, "point", -1.0],
  [T.chupa, 4.5, -1.2, "worried", -0.3],
  [T.reveste, 4.5, -1.2, "thumbs", -0.5],
  [T.verde, 4.5, -1.2, "nose", -0.3],
  [T.ralo, 4.5, -1.2, "point", -1.0],
  [T.bomba, 6.0, -1.0, "point", 1.1],
  [T.devolve, 4.5, -1.2, "point", -1.0],
  [T.cloro, 4.5, -1.2, "throw", -1.0],
  [T.arde, 4.5, -1.2, "nose", 0.1],
  [T.deMenos, 4.5, -1.2, "worried", -0.2],
  [T.cheiro, 4.5, -1.2, "idle", -0.2],
  [T.parabens, 1.0, -1.8, "party", 0],
  [T.cta, 1.0, -1.8, "wave", 0.15],
];

/** Altura dos pés: desce junto com o buraco, sai dele e pula na água no final. */
export const guyY = (t: number) => {
  if (t < T.enche) return 0.3 - digDepth(t);
  if (t < T.parabens) {
    const k = Math.min(1, (t - T.enche) / 1.4);
    return 0.3 - digDepth(T.enche - 0.01) * (1 - k) + Math.sin(Math.PI * k) * 0.6;
  }
  const k = Math.min(1, (t - T.parabens) / 1.4);
  return 0.3 + (POOL.floor - 0.3) * k + Math.sin(Math.PI * k) * 2.4;
};

export const CAM: [number, [number, number, number], [number, number, number]][] = [
  [0, [3, 3.6, 13], [0, 1.4, -1.6]],
  [T.cava, [3.4, 2.2, 13], [0, -0.4, -1.2]],
  [T.enche, [6, 3, 17], [1.8, -0.4, -1]],
  [T.chupa, [5, 1.5, 18], [2, -0.8, -1]],
  [T.reveste, [5, 1.5, 18], [2, -0.6, -1]],
  [T.agoraSim, [5.5, 2.2, 17], [2.2, -0.4, -1]],
  [T.verde, [6, 2.6, 14], [2.6, 0, -1]],
  [T.ralo, [4, -0.2, 18], [2.4, -1.5, -0.6]],
  [T.bomba, [10, 2.4, 15], [7.2, -0.2, -0.6]],
  [T.devolve, [6, 1, 19], [3.4, -0.8, -0.6]],
  [T.cloro, [6.5, 2.8, 13], [3.2, 0.6, -1]],
  [T.arde, [6.2, 3.2, 9.5], [4.5, 2.0, -1.2]],
  [T.cheiro, [4.5, 2.5, 17], [2.4, 0.4, -1.2]],
  [T.parabens, [3.4, 2.6, 14], [1.2, 0, -1.6]],
  [T.cta, [2.4, 3.2, 16.5], [1.1, 0.2, -1.6]],
];

export const LABELS: { text: string; from: number; to: number; p: [number, number, number]; tone?: "red" | "blue" | "green" }[] = [
  { text: "BURACÃO", from: T.cava + 1.2, to: T.enche, p: [-2.4, 0.9, 0.2] },
  { text: "A TERRA CHUPA", from: T.chupa + 0.2, to: T.lama, p: [0, -1.2, 0.3], tone: "red" },
  { text: "LAMA", from: T.lama + 0.2, to: T.reveste, p: [0, -1.8, 0.3], tone: "red" },
  { text: "CONCRETO", from: T.reveste + 0.4, to: T.manta, p: [-3.15, -0.6, 0.3] },
  { text: "MANTA IMPERMEÁVEL", from: T.manta + 0.3, to: T.agoraSim, p: [0, -1.6, 0.3], tone: "blue" },
  { text: "ALGAS", from: T.algas, to: T.ralo, p: [-1.5, -0.6, 0.3], tone: "green" },
  { text: "RALO", from: T.ralo + 0.3, to: T.bomba, p: [0, -2.0, 0.3] },
  { text: "BOMBA", from: T.bomba + 0.6, to: T.areia, p: [7.5, 1.7, 0.2] },
  { text: "FILTRO DE AREIA", from: T.areia, to: T.devolve, p: [9.3, 3.0, -0.4] },
  { text: "ÁGUA LIMPA", from: T.devolve + 0.3, to: T.cloro, p: [2.6, -0.4, 0.3], tone: "blue" },
  { text: "CLORO", from: T.cloro + 0.6, to: T.medir, p: [1.6, 0.9, -1.2] },
  { text: "ARDE O OLHO!", from: T.arde, to: T.deMenos, p: [4.5, 4.2, -1.2], tone: "red" },
  { text: "VERDE DE NOVO", from: T.deMenos + 0.3, to: T.cheiro, p: [0, 0.6, -1], tone: "green" },
  { text: "SUOR + XIXI", from: T.xixi, to: T.parabens, p: [0, 1.2, -1.6], tone: "red" },
];

export const SFX: { src: string; at: number; vol: number }[] = [
  { src: "sfx/pop.mp3", at: T.pa, vol: 0.5 },
  { src: "sfx/snap.mp3", at: T.cava + 0.4, vol: 0.4 },
  { src: "sfx/snap.mp3", at: T.cava + 1.4, vol: 0.4 },
  { src: "sfx/air.mp3", at: T.enche + 0.2, vol: 0.4 },
  { src: "sfx/alarm.mp3", at: T.chupa + 0.3, vol: 0.25 },
  { src: "sfx/whoosh.mp3", at: T.reveste, vol: 0.4 },
  { src: "sfx/ding.mp3", at: T.agoraSim, vol: 0.5 },
  { src: "sfx/alarm.mp3", at: T.verde + 0.3, vol: 0.2 },
  { src: "sfx/whoosh.mp3", at: T.bomba - 0.2, vol: 0.4 },
  { src: "sfx/click.mp3", at: T.bomba + 0.6, vol: 0.5 },
  { src: "sfx/ding.mp3", at: T.devolve + 0.3, vol: 0.4 },
  { src: "sfx/pop.mp3", at: T.cloro + 0.4, vol: 0.5 },
  { src: "sfx/pop.mp3", at: T.cloro + 0.8, vol: 0.5 },
  { src: "sfx/alarm.mp3", at: T.arde, vol: 0.25 },
  { src: "sfx/whoosh.mp3", at: T.parabens + 0.2, vol: 0.5 },
  { src: "sfx/air.mp3", at: T.parabens + 1.3, vol: 0.6 },
  { src: "sfx/party.mp3", at: T.parabens + 1.4, vol: 0.5 },
];

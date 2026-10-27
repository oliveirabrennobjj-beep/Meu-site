import { Word, findAt } from "./lib";
import raw from "./words.json";
import type { PlanItem } from "./Guy";

export const WORDS = (raw as Word[]).filter((w) => !w.t.startsWith("["));
export const at = (phrase: string, off = 0) => findAt(WORDS, phrase) + off;
export const DURATION_S = WORDS[WORDS.length - 1].e + 2;

export const T = {
  rua: at("a água da rua chega"),
  relogio: at("passa pelo relógio"),
  torneira: at("vai direto pra torneira"),
  problema: at("problema"),
  falta: at("quando falta água"),
  pressao: at("quando a pressão cai"),
  caixa: at("então você coloca uma caixa"),
  enche: at("vai enchendo"),
  parar: at("mas como ela sabe"),
  boia: at("com uma boia"),
  gasta: at("quando você gasta"),
  falhar: at("e se a boia falhar"),
  transborda: at("transborda"),
  ladrao: at("então você coloca um cano extra"),
  gravidade: at("agora pra água chegar"),
  alta: at("quanto mais alta"),
  tampa: at("e tem que ter tampa"),
  dengue: at("mosquito da dengue"),
  lava: at("e a cada seis meses"),
  parabens: at("parabéns"),
  cta: at("comenta aí"),
};

/** Medidas da casa e da caixa. */
export const CASA = { x0: -4, x1: 4, z0: -3, piso: 0.45, laje: 3.7 };
export const CX = { x: 0.8, z: -1.5, r: 1.1, h: 1.6 };

/** Nível da água na caixa (0 a 1). */
export const nivel = (t: number) => {
  const k = (a: number, d: number) => Math.min(1, Math.max(0, (t - a) / d));
  if (t < T.enche) return 0.15 * k(T.caixa + 0.8, 1);
  let n = 0.15 + 0.7 * k(T.enche, 2.2);
  n -= 0.25 * k(T.gasta + 0.2, 1.2) * (1 - k(T.gasta + 1.8, 1.4));
  n += 0.17 * k(T.falhar + 0.3, 1.6);
  n -= 0.17 * k(T.ladrao + 1.0, 1.5);
  n -= 0.85 * k(T.lava + 0.6, 2.2);
  n += 0.85 * k(T.parabens, 1.2);
  return Math.max(0, Math.min(1, n));
};

/** A boia fecha a entrada quando a caixa enche. */
export const entradaAberta = (t: number) =>
  (t > T.caixa + 0.5 && t < T.boia + 1.2) || (t > T.gasta + 0.6 && t < T.gasta + 3.0) || (t > T.falhar && t < T.ladrao + 2.2) || (t > T.lava + 3 && t < T.parabens + 1.2);

export const PLAN: PlanItem[] = [
  [0, -0.8, -1.3, "wave", 0.25],
  [T.relogio, -0.2, -1.3, "point", 1.2],
  [T.torneira, -1.2, -1.6, "thumbs", -0.5],
  [T.falta, -1.2, -1.6, "worried", 0.1],
  [T.pressao, 2.0, -1.7, "nose", 0.1],
  [T.caixa, -2.0, -1.3, "point", 0.9],
  [T.boia, -1.9, -1.3, "point", 0.9],
  [T.falhar, -1.9, -1.3, "worried", 0.4],
  [T.ladrao, -1.9, -1.3, "thumbs", 0.5],
  [T.gravidade, 2.0, -1.7, "party", 0],
  [T.tampa, -1.6, -1.3, "throw", 0.9],
  [T.lava, -1.5, -1.3, "dig", 0.9],
  [T.parabens, -1.8, -1.0, "party", 0.2],
];

/** Altura dos pés: chão da casa ou em cima da laje. */
export const guyY = (t: number) => {
  const piso = CASA.piso, laje = CASA.laje;
  const sobe = (a: number) => Math.min(1, Math.max(0, (t - a) / 1.2));
  const arco = (a: number) => Math.sin(Math.PI * sobe(a)) * 0.8;
  if (t < T.caixa) return piso;
  if (t < T.gravidade) return piso + (laje - piso) * sobe(T.caixa) + arco(T.caixa);
  if (t < T.tampa) return laje + (piso - laje) * sobe(T.gravidade) + arco(T.gravidade);
  return piso + (laje - piso) * sobe(T.tampa) + arco(T.tampa);
};

export const CAM: [number, [number, number, number], [number, number, number]][] = [
  [0, [2.5, 3.2, 15], [-0.6, 1.7, -1.4]],
  [T.rua, [9, 2.4, 15], [5.2, 0.2, -0.5]],
  [T.torneira, [0.5, 2.4, 11], [-1.6, 1.5, -1.8]],
  [T.falta, [7, 3, 19], [3.2, 0.6, -0.8]],
  [T.pressao, [4, 2.8, 10.5], [2, 1.9, -1.8]],
  [T.caixa, [4.5, 6.4, 17], [0.6, 3.6, -1.4]],
  [T.boia, [3.4, 6.2, 9.5], [1.2, 4.7, -1.4]],
  [T.falhar, [5.5, 6.4, 13], [2.2, 4.6, -1.4]],
  [T.gravidade, [4.5, 3.8, 17.5], [0.8, 2.4, -1.4]],
  [T.tampa, [2.8, 6.8, 10.5], [0.6, 4.7, -1.4]],
  [T.lava, [0.5, 6.4, 11], [-0.4, 4.5, -1.4]],
  [T.parabens, [5.5, 6.5, 22], [1.4, 2.7, -1]],
];

export const LABELS: { text: string; from: number; to: number; p: [number, number, number]; tone?: "red" | "blue" | "green" }[] = [
  { text: "REDE DA RUA", from: T.rua + 0.3, to: T.relogio, p: [9.5, -0.6, 0.5], tone: "blue" },
  { text: "HIDRÔMETRO", from: T.relogio + 0.3, to: T.torneira, p: [5.8, 1.3, 0.4] },
  { text: "TORNEIRA", from: T.torneira + 0.3, to: T.problema, p: [-2.4, 2.1, -2.3] },
  { text: "FALTOU ÁGUA", from: T.falta + 0.3, to: T.pressao, p: [8.5, 0.9, 0.5], tone: "red" },
  { text: "CHUVEIRO FRACO", from: T.pressao + 0.4, to: T.caixa, p: [2.3, 3.0, -2.4], tone: "red" },
  { text: "CAIXA NO ALTO", from: T.caixa + 0.8, to: T.parar, p: [CX.x, 5.8, CX.z] },
  { text: "BOIA", from: T.boia + 0.2, to: T.gasta, p: [1.4, 5.3, CX.z + 0.4] },
  { text: "FECHOU A ENTRADA", from: T.boia + 1.4, to: T.gasta, p: [2.6, 5.9, CX.z], tone: "blue" },
  { text: "ABRIU DE NOVO", from: T.gasta + 0.8, to: T.falhar, p: [2.6, 5.9, CX.z], tone: "blue" },
  { text: "TRANSBORDOU!", from: T.transborda, to: T.ladrao, p: [CX.x, 5.8, CX.z], tone: "red" },
  { text: "LADRÃO", from: T.ladrao + 0.6, to: T.gravidade, p: [3.6, 5.6, CX.z] },
  { text: "GRAVIDADE", from: T.gravidade + 0.6, to: T.alta, p: [0, 2.6, -1.2], tone: "blue" },
  { text: "+ ALTURA = + PRESSÃO", from: T.alta, to: T.tampa, p: [0.4, 2.6, -1.2], tone: "blue" },
  { text: "TAMPA", from: T.tampa + 0.8, to: T.dengue, p: [CX.x, 5.9, CX.z] },
  { text: "MOSQUITO DA DENGUE", from: T.dengue, to: T.lava, p: [CX.x, 6.0, CX.z], tone: "red" },
  { text: "A CADA 6 MESES", from: T.lava + 0.4, to: T.parabens, p: [CX.x, 5.9, CX.z], tone: "green" },
];

export const SFX: { src: string; at: number; vol: number }[] = [
  { src: "sfx/whoosh.mp3", at: T.rua - 0.2, vol: 0.35 },
  { src: "sfx/click.mp3", at: T.relogio + 0.3, vol: 0.5 },
  { src: "sfx/alarm.mp3", at: T.falta + 0.3, vol: 0.25 },
  { src: "sfx/whoosh.mp3", at: T.caixa, vol: 0.4 },
  { src: "sfx/pop.mp3", at: T.caixa + 0.6, vol: 0.5 },
  { src: "sfx/click.mp3", at: T.boia + 1.3, vol: 0.5 },
  { src: "sfx/alarm.mp3", at: T.transborda, vol: 0.25 },
  { src: "sfx/pop.mp3", at: T.ladrao + 0.5, vol: 0.5 },
  { src: "sfx/air.mp3", at: T.gravidade + 0.6, vol: 0.35 },
  { src: "sfx/snap.mp3", at: T.tampa + 0.9, vol: 0.5 },
  { src: "sfx/whoosh.mp3", at: T.lava, vol: 0.35 },
  { src: "sfx/party.mp3", at: T.parabens, vol: 0.5 },
];

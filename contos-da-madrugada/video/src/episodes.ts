import { Word } from "./lib";
import w3h33 from "./words/3h33.json";
import wLoira from "./words/loira.json";
import wVarginha from "./words/varginha.json";

export type Scene = { at: string | number; kind: string; title?: string; p?: Record<string, any> };
export type Episode = {
  tag: string;
  audio: string;
  words: Word[];
  scenes: Scene[];
  sfx?: { src: string; at: string | number; vol: number }[];
  cover: { at: string | number; a: string; b: string };
};

export const EPISODES: Record<string, Episode> = {
  "3h33": {
    tag: "O QUE VOCÊ FARIA?",
    audio: "narracao-3h33.mp3",
    words: w3h33 as Word[],
    scenes: [
      { at: 0, kind: "quarto", title: "Você acorda\nàs 3h33.", p: { clock: "03:33", vibrate: ["@celular vibrando"] } },
      {
        at: "@é uma mensagem",
        kind: "celular",
        title: "Do seu próprio\nnúmero.",
        p: { msgs: [{ at: "@não abre a porta", text: "Não abre a porta." }] },
      },
      { at: "@você ri", kind: "quarto", title: "Deve ser golpe…", p: { vibrate: ["@vibra de novo"] } },
      {
        at: "@eu tô falando sério",
        kind: "celular",
        title: "Ele tá no\ncorredor.",
        p: {
          msgs: [
            { at: 0, text: "Não abre a porta." },
            { at: "@eu tô falando sério", text: "Eu tô falando sério. Ele tá no corredor." },
          ],
        },
      },
      { at: "@você levanta devagar", kind: "quarto", title: "Silêncio.", p: { sitAt: "@você levanta devagar" } },
      {
        at: "@até que alguém bate",
        kind: "porta",
        title: "Toc. Toc.\nToc.",
        p: { knocks: ["@três vezes|-0.2", "@três vezes|+0.25", "@três vezes|+0.7"], shadowAt: "@até que alguém bate" },
      },
      { at: "@e uma voz", kind: "porta", title: "\"Filho, abre.\nSou eu.\"", p: { eyesAt: "@sou eu" } },
      { at: "@só que a sua mãe", kind: "vulto", title: "Sua mãe\ntá viajando.", p: {} },
      {
        at: "@o celular vibra uma última",
        kind: "celular",
        title: "Se você abrir,\nele entra.",
        p: {
          msgs: [
            { at: 0, text: "Não abre a porta." },
            { at: 0, text: "Eu tô falando sério. Ele tá no corredor." },
            { at: "@se você abrir", text: "Se você abrir, ele entra. Se não abrir, ele espera." },
          ],
        },
      },
      { at: "@e aí", kind: "escolha", title: "E aí?\nAbre ou responde?", p: { a: "ABRO", b: "RESPONDO" } },
      { at: "@o caminho mais votado", kind: "ceu", title: "Parte 2\namanhã.", p: { eyes: true } },
    ],
    sfx: [
      { src: "sfx/vibrar.mp3", at: "@celular vibrando", vol: 0.7 },
      { src: "sfx/vibrar.mp3", at: "@vibra de novo", vol: 0.7 },
      { src: "sfx/riser.mp3", at: "@até que alguém bate|-1.2", vol: 0.5 },
      { src: "sfx/batidas.mp3", at: "@três vezes|-0.25", vol: 0.9 },
      { src: "sfx/riser.mp3", at: "@só que a sua mãe|-0.8", vol: 0.6 },
      { src: "sfx/vibrar.mp3", at: "@o celular vibra uma última", vol: 0.7 },
      { src: "sfx/coracao.mp3", at: "@e aí", vol: 0.6 },
    ],
    cover: { at: "@sou eu|+0.8", a: "Não abre", b: "a porta." },
  },
  loira: {
    tag: "LENDAS BRASILEIRAS",
    audio: "narracao-loira.mp3",
    words: wLoira as Word[],
    scenes: [
      { at: 0, kind: "corredor", title: "O banheiro\nda escola.", p: {} },
      { at: "@dizem que", kind: "espelho", title: "Dizem que…", p: { ghostAt: "@o espírito dela" } },
      { at: "@as versões mudam", kind: "cartao", title: "Cada cidade\nconta diferente.", p: { tag: "LENDA URBANA", big: "A LOIRA", sub: "algodão no nariz, toda de branco…" } },
      { at: "@o ritual", kind: "espelho", title: "O ritual.", p: { darkAt: "@apagar a luz" } },
      { at: "@e dizem que se você", kind: "espelho", title: "Quando a luz\nacende…", p: { ghostAt: "@ela tá atrás|-0.3" } },
      { at: "@pesquisadores do folclore", kind: "cartao", title: "Lenda\nurbana.", p: { tag: "FOLCLORE", big: "ANOS 70 E 80", sub: "espalhada pelas escolas do Brasil" } },
      { at: "@mas uma coisa nunca", kind: "corredor", title: "Ninguém vai\nsozinho.", p: {} },
      { at: "@na sua escola", kind: "ceu", title: "E na sua\nescola?", p: { eyes: true } },
    ],
    sfx: [
      { src: "sfx/riser.mp3", at: "@dizem que|-0.6", vol: 0.5 },
      { src: "sfx/riser.mp3", at: "@ela tá atrás|-1.0", vol: 0.7 },
      { src: "sfx/coracao.mp3", at: "@ela tá atrás|+0.3", vol: 0.6 },
    ],
    cover: { at: "@ela tá atrás|+0.9", a: "Não fala", b: "o nome dela." },
  },
  varginha: {
    tag: "MISTÉRIOS REAIS",
    audio: "narracao-varginha.mp3",
    words: wVarginha as Word[],
    scenes: [
      { at: 0, kind: "cartao", title: "Varginha,\nMinas Gerais.", p: { tag: "JANEIRO", big: "1996", sub: "três meninas voltando pra casa" } },
      { at: "@no meio do caminho", kind: "terreno", title: "O que era\naquilo?", p: { creatureAt: "@uma criatura", girls: true } },
      { at: "@pele marrom", kind: "terreno", title: "Três calombos\nna cabeça.", p: { creatureAt: 0 } },
      { at: "@elas correram", kind: "manchetes", title: "Virou notícia\nno país.", p: { items: ["CRIATURA EM VARGINHA?", "MENINAS VEEM 'ET'", "MISTÉRIO EM MINAS"] } },
      { at: "@começaram a surgir", kind: "vulto", title: "Militares\nna cidade?", p: {} },
      { at: "@os ufólogos", kind: "cidade", title: "O maior caso\nde ET do Brasil?", p: {} },
      { at: "@só que anos depois", kind: "cartao", title: "A versão do\nExército.", p: { tag: "INVESTIGAÇÃO", big: "UM MORADOR", sub: "agachado no muro, depois da chuva", stamp: "CONCLUÍDO" } },
      { at: "@até hoje", kind: "cidade", title: "A cidade\ndo ET.", p: {} },
      { at: "@e você", kind: "ceu", title: "ET ou\nnão?", p: { eyes: true } },
    ],
    sfx: [
      { src: "sfx/riser.mp3", at: "@uma criatura|-0.8", vol: 0.6 },
      { src: "sfx/coracao.mp3", at: "@e os olhos", vol: 0.6 },
      { src: "sfx/riser.mp3", at: "@só que anos depois|-0.6", vol: 0.4 },
    ],
    cover: { at: "@pele marrom|+1.5", a: "O que elas", b: "viram?" },
  },
};

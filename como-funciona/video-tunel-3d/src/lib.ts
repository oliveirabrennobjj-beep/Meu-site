import { Easing } from "remotion";

export const FPS = 30;

export const H = {
  bg: "#05040c",
  bg2: "#140f2e",
  purple: "#7B5CFF",
  moon: "#FFD58A",
  red: "#FF3B5C",
  white: "#F3EEFF",
  dim: "#4a4370",
  steel: "#8f88b8",
};

export type Word = { t: string; s: number; e: number };

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9 ]/g, "");

/** Start time (s) of the first occurrence of `phrase` in the narration, searching from `after`. */
export const findAt = (words: Word[], phrase: string, after = 0): number => {
  const target = norm(phrase).split(" ").filter(Boolean);
  for (let i = 0; i < words.length; i++) {
    if (words[i].s < after) continue;
    let ok = true;
    for (let k = 0; k < target.length; k++) {
      if (!words[i + k] || norm(words[i + k].t) !== target[k]) {
        ok = false;
        break;
      }
    }
    if (ok) return words[i].s;
  }
  throw new Error(`Frase não encontrada na narração: "${phrase}"`);
};

export const appear = (t: number, at: number, dur = 0.35) => {
  if (t <= at) return 0;
  if (t >= at + dur) return 1;
  return Easing.out(Easing.cubic)((t - at) / dur);
};

export const pop = (t: number, at: number, dur = 0.4) => {
  if (t <= at) return 0;
  if (t >= at + dur) return 1;
  return Easing.out(Easing.back(2))((t - at) / dur);
};

export const windowed = (t: number, from: number, to: number, fade = 0.3) =>
  Math.min(appear(t, from, fade), 1 - appear(t, to - fade, fade));

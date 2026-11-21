import { Easing, interpolate } from "remotion";

export type V3 = [number, number, number];

// Progresso 0→1 da tomada, com saída suave. Tudo depende do quadro, nunca do relógio.
export const progresso = (frame: number, dur: number) =>
  interpolate(frame, [0, Math.max(1, dur - 1)], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.33, 0, 0.2, 1),
  });

export const mistura = (a: V3, b: V3, p: number): V3 => [
  a[0] + (b[0] - a[0]) * p,
  a[1] + (b[1] - a[1]) * p,
  a[2] + (b[2] - a[2]) * p,
];

// Ruído determinístico (seno somado) para tremor de câmera e respiração.
export const ondula = (t: number, semente = 0) =>
  Math.sin(t * 1.7 + semente) * 0.5 + Math.sin(t * 2.9 + semente * 2.3) * 0.3 + Math.sin(t * 5.3 + semente * 0.7) * 0.2;

export const PELE = "#f2c230";

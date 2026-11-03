import { Easing } from "remotion";
import * as THREE from "three";
import { CAM } from "./timeline";

const MOVE = 1.3;
const ease = Easing.inOut(Easing.cubic);
const lerp3 = (a: number[], b: number[], k: number) => a.map((v, i) => v + (b[i] - v) * k) as [number, number, number];

/** Posição e alvo da câmera no tempo t (s), com uma deriva lenta pra nunca ficar parada. */
export const camAt = (t: number) => {
  let i = 0;
  for (let k = 0; k < CAM.length; k++) if (t >= CAM[k][0]) i = k;
  const [s, pos, tgt] = CAM[i];
  const prev = CAM[Math.max(0, i - 1)];
  const k = i === 0 ? 1 : ease(Math.min(1, (t - s) / MOVE));
  const p = lerp3(prev[1], pos, k);
  const g = lerp3(prev[2], tgt, k);
  const drift = t - s;
  p[0] += Math.sin(drift * 0.35) * 0.35;
  p[1] += Math.sin(drift * 0.27 + 1) * 0.15;
  return { pos: p, target: g };
};

export const W = 1080;
export const H = 1920;
export const FOV = 38;

const cam = new THREE.PerspectiveCamera(FOV, W / H, 0.1, 200);
const v = new THREE.Vector3();

/** Ponto 3D -> pixel na tela, para as etiquetas em HTML. */
export const project = (t: number, p: [number, number, number]) => {
  const { pos, target } = camAt(t);
  cam.position.set(...pos);
  cam.lookAt(...target);
  cam.updateMatrixWorld();
  v.set(...p).project(cam);
  return { x: ((v.x + 1) / 2) * W, y: ((1 - v.y) / 2) * H, visible: v.z < 1 };
};

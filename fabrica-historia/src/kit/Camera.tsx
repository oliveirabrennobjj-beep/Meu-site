import { useThree } from "@react-three/fiber";
import { useCurrentFrame, useVideoConfig } from "remotion";
import type { PerspectiveCamera } from "three";
import { mistura, ondula, progresso, type V3 } from "./util";

// Câmera de uma tomada: vai de `de` até `para` olhando de `alvo` até `alvoPara`.
export const Camera: React.FC<{
  dur: number;
  de: V3;
  para?: V3;
  alvo: V3;
  alvoPara?: V3;
  fov?: number;
  tremor?: number;
}> = ({ dur, de, para, alvo, alvoPara, fov = 45, tremor = 0.04 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const camera = useThree((s) => s.camera) as PerspectiveCamera;
  const p = progresso(frame, dur);
  const t = frame / fps;
  const pos = mistura(de, para ?? de, p);
  const tgt = mistura(alvo, alvoPara ?? alvo, p);
  camera.position.set(pos[0] + ondula(t, 1) * tremor, pos[1] + ondula(t, 2) * tremor, pos[2]);
  camera.fov = fov;
  camera.near = 0.1;
  camera.far = 400;
  camera.updateProjectionMatrix();
  camera.lookAt(tgt[0], tgt[1], tgt[2]);
  return null;
};

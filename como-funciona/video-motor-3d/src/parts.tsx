import React from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { camAt } from "./camera";
import { TexName, textura, useRounded } from "./realismo";

export type V3 = [number, number, number];

export const Mat: React.FC<{ c: string; o?: number; e?: string; ei?: number; m?: number; r?: number; tex?: TexName; rep?: [number, number] }> = ({
  c,
  o = 1,
  e,
  ei = 0,
  m = 0,
  r = 0.6,
  tex,
  rep,
}) => (
  <meshStandardMaterial
    color={c}
    map={tex ? textura(tex, rep) : null}
    roughness={r}
    metalness={m}
    transparent={o < 1}
    opacity={o}
    emissive={e ?? "#000"}
    emissiveIntensity={ei}
  />
);

/** Caixa definida pelos cantos (x0..x1, y0..y1, z0..z1). */
export const Box: React.FC<{ a: V3; b: V3; c: string; o?: number; e?: string; ei?: number; m?: number; r?: number; tex?: TexName; rep?: [number, number] }> = ({ a, b, ...m }) => {
  const geo = useRounded(Math.abs(b[0] - a[0]), Math.abs(b[1] - a[1]), Math.abs(b[2] - a[2]));
  return (
    <mesh position={[(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2]} geometry={geo} castShadow receiveShadow>
      <Mat {...m} />
    </mesh>
  );
};

/** Cilindro entre dois pontos (canos, mangueira). */
export const Tube: React.FC<{ a: V3; b: V3; r: number; c: string; o?: number }> = ({ a, b, r, c, o }) => {
  const va = new THREE.Vector3(...a);
  const vb = new THREE.Vector3(...b);
  const len = va.distanceTo(vb);
  if (len < 0.001) return null;
  const mid = va.clone().add(vb).multiplyScalar(0.5);
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), vb.clone().sub(va).normalize());
  return (
    <mesh position={mid} quaternion={q} castShadow>
      <cylinderGeometry args={[r, r, len, 18]} />
      <Mat c={c} o={o} m={0.3} r={0.4} />
    </mesh>
  );
};

export const C = {
  grass: "#7cc35a",
  grassDark: "#5ea142",
  soil1: "#a8743f",
  soil2: "#8a5a32",
  soil3: "#6a4426",
  aquifer: "#4a8fd0",
  concrete: "#c9c6bd",
  concreteDark: "#a09c92",
  pipe: "#eeeeee",
  sewage: "#7a5a2a",
  sludge: "#4f3519",
  liquid: "#9c9a52",
  scum: "#e2c766",
  stone: "#9a9a9a",
  brick: "#c4683c",
  water: "#4aa3ff",
};

/** Partículas andando por uma polilinha (fluxo de esgoto/água). */
export const Flow: React.FC<{ t: number; from: number; to?: number; path: V3[]; n?: number; speed?: number; c: string; r?: number; reverse?: boolean }> = ({
  t,
  from,
  to = 1e9,
  path,
  n = 10,
  speed = 0.35,
  c,
  r = 0.11,
  reverse,
}) => {
  if (t < from || t > to) return null;
  const seg = path.slice(1).map((p, i) => new THREE.Vector3(...p).distanceTo(new THREE.Vector3(...path[i])));
  const total = seg.reduce((x, y) => x + y, 0);
  const pts: THREE.Vector3[] = [];
  const life = t - from;
  for (let k = 0; k < n; k++) {
    let u = (life * speed + k / n) % 1;
    if (reverse) u = 1 - u;
    if (life * speed < k / n) continue; // ainda não saiu do começo
    let d = u * total;
    let i = 0;
    while (i < seg.length - 1 && d > seg[i]) d -= seg[i++];
    const a = new THREE.Vector3(...path[i]);
    const b = new THREE.Vector3(...path[i + 1]);
    pts.push(a.lerp(b, Math.min(1, d / seg[i])));
  }
  return (
    <>
      {pts.map((p, i) => (
        <mesh key={i} position={p}>
          <icosahedronGeometry args={[r, 0]} />
          <Mat c={c} />
        </mesh>
      ))}
    </>
  );
};

export const CameraRig: React.FC<{ t: number }> = ({ t }) => {
  const camera = useThree((s) => s.camera);
  const { pos, target } = camAt(t);
  camera.position.set(...pos);
  camera.lookAt(...target);
  camera.updateMatrixWorld();
  return null;
};


export const Tree: React.FC<{ p: V3; s?: number }> = ({ p, s = 1 }) => (
  <group position={p} scale={s}>
    <Tube a={[0, 0, 0]} b={[0, 1.2, 0]} r={0.16} c="#7a4a2a" />
    {[
      [0, 1.9, 0, 0.85],
      [0.45, 1.65, 0.2, 0.6],
      [-0.4, 1.7, -0.15, 0.62],
      [0.05, 2.45, -0.05, 0.55],
    ].map(([x, y, z, r], k) => (
      <mesh key={k} position={[x, y, z]} castShadow>
        <icosahedronGeometry args={[r, 2]} />
        <Mat c={k % 2 ? "#5aa843" : "#4a923a"} r={0.8} tex="grama" />
      </mesh>
    ))}
  </group>
);

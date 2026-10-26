import React from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { appear, pop } from "./lib";
import { T } from "./timeline";
import { camAt } from "./camera";
import { Guy } from "./Guy";

type V3 = [number, number, number];

const Mat: React.FC<{ c: string; o?: number; e?: string; ei?: number }> = ({ c, o = 1, e, ei = 0 }) => (
  <meshStandardMaterial color={c} flatShading roughness={0.85} transparent={o < 1} opacity={o} emissive={e ?? "#000"} emissiveIntensity={ei} />
);

/** Caixa definida pelos cantos (x0..x1, y0..y1, z0..z1). */
const Box: React.FC<{ a: V3; b: V3; c: string; o?: number; e?: string; ei?: number }> = ({ a, b, ...m }) => (
  <mesh position={[(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2]} castShadow receiveShadow>
    <boxGeometry args={[Math.abs(b[0] - a[0]), Math.abs(b[1] - a[1]), Math.abs(b[2] - a[2])]} />
    <Mat {...m} />
  </mesh>
);

/** Cilindro entre dois pontos (canos, mangueira). */
const Tube: React.FC<{ a: V3; b: V3; r: number; c: string; o?: number }> = ({ a, b, r, c, o }) => {
  const va = new THREE.Vector3(...a);
  const vb = new THREE.Vector3(...b);
  const len = va.distanceTo(vb);
  if (len < 0.001) return null;
  const mid = va.clone().add(vb).multiplyScalar(0.5);
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), vb.clone().sub(va).normalize());
  return (
    <mesh position={mid} quaternion={q} castShadow>
      <cylinderGeometry args={[r, r, len, 8]} />
      <Mat c={c} o={o} />
    </mesh>
  );
};

const C = {
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
const Flow: React.FC<{ t: number; from: number; to?: number; path: V3[]; n?: number; speed?: number; c: string; r?: number; reverse?: boolean }> = ({
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

const CameraRig: React.FC<{ t: number }> = ({ t }) => {
  const camera = useThree((s) => s.camera);
  const { pos, target } = camAt(t);
  camera.position.set(...pos);
  camera.lookAt(...target);
  camera.updateMatrixWorld();
  return null;
};

const House: React.FC<{ t: number }> = ({ t }) => {
  const alarm = t > T.volta && t < T.parabens ? 0.5 + 0.5 * Math.sin(t * 12) : 0;
  return (
    <group position={[-8, 0.3, -2.6]}>
      <Box a={[-1.6, 0, -1.3]} b={[1.6, 2.3, 1.3]} c="#f3e3c3" e="#ff2a2a" ei={alarm * 0.5} />
      <mesh position={[0, 3.0, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <coneGeometry args={[2.55, 1.5, 4]} />
        <Mat c="#d9534f" />
      </mesh>
      <Box a={[-0.4, 0, 1.3]} b={[0.4, 1.4, 1.36]} c="#8a5a32" />
      <Box a={[0.7, 1.0, 1.3]} b={[1.3, 1.6, 1.36]} c="#9fd3ff" />
      <Box a={[-1.3, 1.0, 1.3]} b={[-0.7, 1.6, 1.36]} c="#9fd3ff" />
    </group>
  );
};

const Tree: React.FC<{ p: V3; s?: number }> = ({ p, s = 1 }) => (
  <group position={p} scale={s}>
    <Tube a={[0, 0, 0]} b={[0, 1.2, 0]} r={0.16} c="#7a4a2a" />
    <mesh position={[0, 1.9, 0]} castShadow>
      <icosahedronGeometry args={[0.95, 0]} />
      <Mat c="#4f9a3a" />
    </mesh>
  </group>
);

const Ground: React.FC = () => (
  <>
    <Box a={[-12, 0, -6]} b={[13, 0.3, 0]} c={C.grass} />
    <Box a={[-12, 0.22, -0.02]} b={[13, 0.3, 0.05]} c={C.grassDark} />
    <Box a={[-12, -1.6, -6]} b={[13, 0, 0]} c={C.soil1} />
    <Box a={[-12, -4.6, -6]} b={[13, -1.6, 0]} c={C.soil2} />
    <Box a={[-12, -7, -6]} b={[13, -4.6, 0]} c={C.soil3} />
    <Box a={[-12, -5.8, -6]} b={[13, -5.0, 0.02]} c={C.aquifer} />
    {/* pedrinhas no corte */}
    {[
      [-10, -2.4], [-5.5, -5.3], [0.6, -5.9], [3.8, -0.8], [8.2, -3.6], [11, -2.2], [-9, -4.2], [10.5, -6.4],
    ].map(([x, y], i) => (
      <mesh key={i} position={[x, y, 0.05]}>
        <dodecahedronGeometry args={[0.25 + (i % 3) * 0.08, 0]} />
        <Mat c="#b89a78" />
      </mesh>
    ))}
  </>
);

/** Fase 1: o buraco no quintal. */
const Pit: React.FC<{ t: number }> = ({ t }) => {
  const dig = appear(t, T.cava + 0.2, 0.9);
  const gone = 1 - appear(t, T.fossa, 0.6);
  if (dig <= 0 || gone <= 0) return null;
  const fill = appear(t, T.cava + 1.2, 2.5);
  const depth = 2.6 * dig;
  const stink = t > T.cheiro;
  return (
    <group scale={[1, gone, 1]}>
      <Box a={[-3, -depth, 0]} b={[-1, 0.31, 0.9]} c="#3a2614" />
      {fill > 0 ? <Box a={[-2.9, -depth + 0.05, 0.02]} b={[-1.1, -depth + 0.05 + fill * depth * 0.75, 0.92]} c={C.sewage} /> : null}
      {stink
        ? [0, 1, 2, 3, 4].map((k) => {
            const life = ((t - T.cheiro) * 0.5 + k / 5) % 1;
            return (
              <mesh key={k} position={[-2 + Math.sin(k * 2 + t) * 0.6, 0.6 + life * 2.8, 0.5]} scale={0.3 + life * 0.5}>
                <icosahedronGeometry args={[0.6, 0]} />
                <Mat c="#8fcf4a" o={0.7 * (1 - life)} />
              </mesh>
            );
          })
        : null}
    </group>
  );
};

/** Mancha de contaminação indo do buraco até o poço. */
const Plume: React.FC<{ t: number }> = ({ t }) => {
  const g = appear(t, T.contamina, 2.2);
  const gone = 1 - appear(t, T.fossa, 0.8);
  if (g <= 0 || gone <= 0) return null;
  return (
    <group>
      {[0, 1, 2, 3, 4, 5, 6].map((k) => {
        const x = -1.5 + k * 1.75;
        const show = Math.max(0, Math.min(1, g * 7 - k));
        return (
          <mesh key={k} position={[x, -3.4 - k * 0.22, 0.3]} scale={[1.3 * show, 0.6 * show, 0.3]}>
            <icosahedronGeometry args={[1, 1]} />
            <Mat c="#5a4a1a" o={0.75 * gone} />
          </mesh>
        );
      })}
    </group>
  );
};

/** A fossa séptica em corte. */
const Fossa: React.FC<{ t: number }> = ({ t }) => {
  const s = pop(t, T.fossa + 0.3, 0.7);
  if (s <= 0) return null;
  const x0 = -3.8, x1 = -0.2, yb = -4.0, yt = -1.0, z1 = 1.2;
  const ix0 = x0 + 0.2, ix1 = x1 - 0.2, iyb = yb + 0.2, iyt = yt - 0.2;
  // níveis de enchimento
  const fill = appear(t, T.entra + 0.4, 2.2);
  const full = appear(t, T.semIsso + 0.3, 2.0);
  const sludgeH = 0.75 * appear(t, T.pesado + 0.2, 1.6) * (1 - 0.75 * appear(t, T.tirar, 1.5)) + full * 1.0;
  const scumH = 0.28 * appear(t, T.gordura + 0.2, 1.4);
  const liquidTop = iyb + (iyt - 0.35 - iyb) * fill + full * 0.35;
  const sludgeTop = iyb + Math.min(sludgeH, liquidTop - iyb);
  const red = t > T.semIsso + 0.3 && t < T.parabens ? 0.5 + 0.5 * Math.sin(t * 10) : 0;
  const glowMid = t > T.meio && t < T.bacterias ? 0.35 : 0;
  return (
    <group position={[-2, yb, 0]} scale={[1, s, 1]}>
      <group position={[2, -yb, 0]}>
        <Box a={[x0, yb, 0]} b={[x1, yt, 0.2]} c={C.concreteDark} e="#ff2a2a" ei={red * 0.6} />
        <Box a={[x0, yb, 0]} b={[x1, iyb, z1]} c={C.concrete} e="#ff2a2a" ei={red * 0.6} />
        <Box a={[x0, yb, 0]} b={[ix0, yt, z1]} c={C.concrete} e="#ff2a2a" ei={red * 0.6} />
        <Box a={[ix1, yb, 0]} b={[x1, yt, z1]} c={C.concrete} e="#ff2a2a" ei={red * 0.6} />
        <Box a={[x0 - 0.1, iyt, 0]} b={[x1 + 0.1, yt + 0.15, z1]} c={C.concrete} e="#ff2a2a" ei={red * 0.6} />
        {/* tampa de inspeção até a grama */}
        <Box a={[-2.45, yt + 0.15, 0.25]} b={[-1.55, 0.36, 1.0]} c={C.concreteDark} />
        {/* conteúdo */}
        {fill > 0 ? <Box a={[ix0, iyb, 0.2]} b={[ix1, Math.max(iyb + 0.01, liquidTop), z1 - 0.05]} c={C.liquid} o={0.88} e="#d8ff6a" ei={glowMid} /> : null}
        {sludgeH > 0.01 ? <Box a={[ix0 + 0.01, iyb, 0.21]} b={[ix1 - 0.01, sludgeTop, z1 - 0.04]} c={C.sludge} /> : null}
        {scumH > 0.01 ? <Box a={[ix0 + 0.01, liquidTop - scumH, 0.21]} b={[ix1 - 0.01, liquidTop, z1 - 0.04]} c={C.scum} /> : null}
        {/* bactérias */}
        {t > T.bacterias
          ? Array.from({ length: 14 }).map((_, k) => {
              const b = pop(t, T.bacterias + k * 0.08, 0.4);
              const bx = ix0 + 0.3 + ((k * 0.61) % 1) * (ix1 - ix0 - 0.6);
              const by = sludgeTop + 0.25 + ((k * 0.37) % 1) * Math.max(0.2, liquidTop - scumH - sludgeTop - 0.5);
              return (
                <mesh key={k} position={[bx + Math.sin(t * 2 + k) * 0.08, by + Math.cos(t * 2.4 + k) * 0.06, 0.9]} scale={b} rotation={[t + k, t * 1.3, 0]}>
                  <capsuleGeometry args={[0.07, 0.16, 2, 6]} />
                  <Mat c="#5dff6a" e="#2bd13a" ei={0.6} />
                </mesh>
              );
            })
          : null}
      </group>
    </group>
  );
};

const Filtro: React.FC<{ t: number }> = ({ t }) => {
  const s = pop(t, T.filtro + 0.2, 0.7);
  if (s <= 0) return null;
  const x0 = 0.9, x1 = 3.1, yb = -4.0, yt = -1.2, z1 = 1.2;
  const wl = appear(t, T.filtro + 0.9, 1.6);
  return (
    <group position={[0, yb, 0]} scale={[1, s, 1]}>
      <group position={[0, -yb, 0]}>
        <Box a={[x0, yb, 0]} b={[x1, yt, 0.2]} c={C.concreteDark} />
        <Box a={[x0, yb, 0]} b={[x1, yb + 0.2, z1]} c={C.concrete} />
        <Box a={[x0, yb, 0]} b={[x0 + 0.2, yt, z1]} c={C.concrete} />
        <Box a={[x1 - 0.2, yb, 0]} b={[x1, yt, z1]} c={C.concrete} />
        <Box a={[x0 - 0.1, yt - 0.2, 0]} b={[x1 + 0.1, yt, z1]} c={C.concrete} />
        {wl > 0 ? <Box a={[x0 + 0.2, yb + 0.2, 0.2]} b={[x1 - 0.2, yb + 0.2 + wl * 2.0, z1 - 0.05]} c="#9cc0a0" o={0.6} /> : null}
        {Array.from({ length: 24 }).map((_, k) => {
          const col = k % 6;
          const row = Math.floor(k / 6);
          return (
            <mesh key={k} position={[x0 + 0.42 + col * 0.27 + (row % 2) * 0.1, yb + 0.42 + row * 0.36, 0.75 + (k % 3) * 0.12]} rotation={[k, k * 2, 0]}>
              <dodecahedronGeometry args={[0.19, 0]} />
              <Mat c={k % 4 === 0 ? "#b0aca4" : C.stone} />
            </mesh>
          );
        })}
      </group>
    </group>
  );
};

const Sumidouro: React.FC<{ t: number }> = ({ t }) => {
  const s = pop(t, T.sumidouro + 0.2, 0.7);
  if (s <= 0) return null;
  const cx = 5.8, cz = 1.0, r = 1.05, yb = -4.2;
  const bricks: React.ReactNode[] = [];
  for (let row = 0; row < 7; row++) {
    for (let a = 0; a < 9; a++) {
      if ((row + a) % 3 === 1) continue; // furos
      const th = Math.PI / 2 + (a + 0.5 + (row % 2) * 0.5) * (Math.PI / 9);
      if (th > Math.PI * 1.5) continue;
      const x = cx + Math.sin(th) * r;
      const z = cz + Math.cos(th) * r;
      bricks.push(
        <mesh key={`${row}-${a}`} position={[x, yb + 0.2 + row * 0.38, z]} rotation={[0, th, 0]}>
          <boxGeometry args={[0.32, 0.32, 0.16]} />
          <Mat c={row % 2 ? C.brick : "#b05a33"} />
        </mesh>,
      );
    }
  }
  const seep = t > T.sumidouro + 1.2;
  return (
    <group position={[0, yb, 0]} scale={[1, s, 1]}>
      <group position={[0, -yb, 0]}>
        {bricks}
        <Box a={[cx - 1.1, yb - 0.25, 0]} b={[cx + 1.1, yb, 1.4]} c="#a0927e" />
        <Box a={[cx - 1.2, yb + 2.8, 0]} b={[cx + 1.2, yb + 3.0, 1.5]} c={C.concrete} />
        {seep
          ? Array.from({ length: 16 }).map((_, k) => {
              const life = ((t - T.sumidouro - 1.2) * 0.4 + k / 16) % 1;
              const ang = (k / 16) * Math.PI - Math.PI / 2 + Math.PI;
              const dir = k % 2 ? 1 : -1;
              const x = cx + dir * (0.9 + life * 2.4);
              const y = yb + 0.4 + (k % 8) * 0.3 - life * 0.9;
              return (
                <mesh key={k} position={[x, y, 0.5 + Math.sin(ang) * 0.2]} scale={1 - life * 0.6}>
                  <icosahedronGeometry args={[0.1, 0]} />
                  <Mat c={C.water} o={1 - life} />
                </mesh>
              );
            })
          : null}
      </group>
    </group>
  );
};

const Poco: React.FC<{ t: number }> = ({ t }) => {
  const dirty = appear(t, T.contamina + 1.5, 1.2) * (1 - appear(t, T.fossa + 1, 1));
  const water = new THREE.Color(C.water).lerp(new THREE.Color("#6b5420"), dirty).getStyle();
  return (
    <group>
      <group position={[9.8, 0.3, -1.4]}>
        <mesh position={[0, 0.4, 0]} castShadow>
          <cylinderGeometry args={[0.7, 0.75, 0.8, 10]} />
          <Mat c="#d8d2c4" />
        </mesh>
        <Tube a={[-0.6, 0.8, 0]} b={[-0.6, 1.9, 0]} r={0.06} c="#7a4a2a" />
        <Tube a={[0.6, 0.8, 0]} b={[0.6, 1.9, 0]} r={0.06} c="#7a4a2a" />
        <mesh position={[0, 2.15, 0]} rotation={[0, Math.PI / 4, 0]}>
          <coneGeometry args={[1.05, 0.6, 4]} />
          <Mat c="#d9534f" />
        </mesh>
      </group>
      <Box a={[9.5, -5.4, 0]} b={[10.1, 0.31, 0.55]} c="#8c8c8c" />
      <Box a={[9.6, -5.35, 0.02]} b={[10.0, -4.2, 0.57]} c={water} />
    </group>
  );
};

/** Seta de distância entre sumidouro e poço. */
const Distance: React.FC<{ t: number }> = ({ t }) => {
  const g = appear(t, T.longe + 0.3, 0.9) * (1 - appear(t, T.caminhao, 0.5));
  if (g <= 0) return null;
  const xa = 7.0, xb = 7.0 + (9.4 - 7.0) * g;
  return (
    <group>
      <Tube a={[xa, 0.9, 0.3]} b={[xb, 0.9, 0.3]} r={0.07} c="#2d7dff" />
      <mesh position={[xb, 0.9, 0.3]} rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[0.22, 0.45, 6]} />
        <Mat c="#2d7dff" />
      </mesh>
      <mesh position={[xa, 0.9, 0.3]} rotation={[0, 0, Math.PI / 2]}>
        <coneGeometry args={[0.22, 0.45, 6]} />
        <Mat c="#2d7dff" />
      </mesh>
    </group>
  );
};

const Truck: React.FC<{ t: number }> = ({ t }) => {
  const arrive = appear(t, T.caminhao, 2.2);
  const leave = appear(t, T.semIsso - 0.6, 1.2);
  if (arrive <= 0 || leave >= 1) return null;
  const x = 15 - (15 - 0.6) * arrive - leave * 16;
  const wheel = -(x / 0.45);
  const hose = appear(t, T.caminhao + 2.4, 0.6) * (1 - appear(t, T.semIsso - 0.9, 0.3));
  return (
    <group>
      <group position={[x, 0.3, -1.8]}>
        <Box a={[-2.2, 0.35, -0.9]} b={[2.4, 0.6, 0.9]} c="#4a4a4a" />
        <Box a={[1.4, 0.6, -0.85]} b={[2.4, 2.0, 0.85]} c="#f4f4f4" />
        <Box a={[2.0, 1.25, -0.8]} b={[2.42, 1.85, 0.8]} c="#9fd3ff" />
        <mesh position={[-0.4, 1.35, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.8, 0.8, 3.4, 10]} />
          <Mat c="#f0a030" />
        </mesh>
        {[-1.5, 1.6].map((wx) =>
          [-0.9, 0.9].map((wz) => (
            <mesh key={`${wx}${wz}`} position={[wx, 0.35, wz]} rotation={[Math.PI / 2, wheel, 0]}>
              <cylinderGeometry args={[0.38, 0.38, 0.25, 8]} />
              <Mat c="#222" />
            </mesh>
          )),
        )}
      </group>
      {hose > 0 ? <Tube a={[x - 1.8, 1.5, -1.8]} b={[x - 1.8 + (-2 - x + 1.8) * hose, 0.4, -1.8 + 2.4 * hose]} r={0.09} c="#2b2b2b" /> : null}
    </group>
  );
};

export const Yard: React.FC<{ t: number }> = ({ t }) => {
  const pipeIn: V3[] = [
    [-6.6, 0.9, -1.2],
    [-6.6, 0.9, 0.5],
    [-6.6, -1.5, 0.5],
    [-3.7, -1.5, 0.5],
  ];
  const toPit: V3[] = [
    [-6.6, 0.9, -1.2],
    [-6.6, 0.9, 0.5],
    [-6.6, -0.6, 0.5],
    [-2.6, -0.6, 0.5],
  ];
  const fossaBuilt = t > T.fossa + 0.5;
  return (
    <>
      <CameraRig t={t} />
      <hemisphereLight args={["#fff6e0", "#5a4030", 1.1]} />
      <directionalLight position={[8, 14, 10]} intensity={2.2} castShadow />
      <directionalLight position={[-10, 4, 8]} intensity={0.5} color="#bcd4ff" />
      <Ground />
      <House t={t} />
      <Tree p={[-11, 0.3, -4]} s={1.2} />
      <Tree p={[3.5, 0.3, -4.5]} />
      <Tree p={[12, 0.3, -3.5]} s={1.3} />
      {/* cano da privada */}
      {fossaBuilt ? (
        <>
          <Tube a={pipeIn[0]} b={pipeIn[1]} r={0.17} c={C.pipe} />
          <Tube a={pipeIn[1]} b={pipeIn[2]} r={0.17} c={C.pipe} />
          <Tube a={pipeIn[2]} b={pipeIn[3]} r={0.17} c={C.pipe} />
        </>
      ) : t > T.privada ? (
        <>
          <Tube a={toPit[0]} b={toPit[1]} r={0.17} c={C.pipe} />
          <Tube a={toPit[1]} b={toPit[2]} r={0.17} c={C.pipe} />
          {t > T.cava + 0.6 ? <Tube a={toPit[2]} b={toPit[3]} r={0.17} c={C.pipe} /> : null}
        </>
      ) : null}
      {t > T.filtro + 0.4 ? <Tube a={[-0.3, -1.65, 0.6]} b={[1.0, -1.65, 0.6]} r={0.15} c={C.pipe} /> : null}
      {t > T.sumidouro + 0.4 ? <Tube a={[3.0, -1.75, 0.6]} b={[4.9, -1.75, 0.6]} r={0.15} c={C.pipe} /> : null}
      <Flow t={t} from={T.privada + 0.4} to={T.cava + 0.6} path={toPit.slice(0, 3)} c={C.sewage} />
      <Flow t={t} from={T.cava + 0.6} to={T.fossa} path={toPit} c={C.sewage} />
      <Flow t={t} from={T.entra} to={T.semIsso} path={pipeIn} c={C.sewage} n={12} />
      <Flow t={t} from={T.volta} to={T.parabens} path={pipeIn} c="#5a3a10" n={14} speed={0.5} reverse r={0.14} />
      <Flow t={t} from={T.filtro + 0.6} to={T.semIsso} path={[[-0.3, -1.65, 0.6], [1.0, -1.65, 0.6], [1.6, -2.2, 0.6]]} c="#a8b86a" n={6} />
      <Flow t={t} from={T.sumidouro + 0.6} to={T.semIsso} path={[[3.0, -1.75, 0.6], [4.9, -1.75, 0.6], [5.6, -2.4, 0.8]]} c="#7fc0ff" n={6} />
      <Pit t={t} />
      <Plume t={t} />
      <Fossa t={t} />
      <Filtro t={t} />
      <Sumidouro t={t} />
      <Poco t={t} />
      <Distance t={t} />
      <Truck t={t} />
      <Guy t={t} />
    </>
  );
};

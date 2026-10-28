import React from "react";
import * as THREE from "three";
import { appear, pop } from "./lib";
import { PLAN, POOL, T, digDepth, guyY } from "./timeline";
import { Box, C, CameraRig, Flow, Mat, Tree, Tube, V3 } from "./parts";
import { Guy } from "./Guy";

const { x0, x1, z0, z1, hole, floor } = POOL;

/** Bloco de terra com as camadas de cor. */
const Soil: React.FC<{ a: [number, number]; y: [number, number]; z: [number, number] }> = ({ a, y, z }) => {
  const bands: [number, number, string][] = [
    [-1.6, 0, C.soil1],
    [-4.6, -1.6, C.soil2],
    [-7, -4.6, C.soil3],
  ];
  return (
    <>
      {bands.map(([b0, b1, c]) => {
        const lo = Math.max(b0, y[0]);
        const hi = Math.min(b1, y[1]);
        return hi > lo ? <Box key={c} a={[a[0], lo, z[0]]} b={[a[1], hi, z[1]]} c={c} /> : null;
      })}
      {y[0] < -5.0 ? <Box a={[a[0], -5.8, z[0]]} b={[a[1], -5.0, z[1] + 0.02]} c={C.aquifer} /> : null}
    </>
  );
};

const Ground: React.FC<{ t: number }> = ({ t }) => {
  const d = digDepth(t);
  return (
    <>
      {/* terra em volta do buraco da piscina */}
      <Soil a={[-12, x0]} y={[-7, 0]} z={[-6, 0]} />
      <Soil a={[x1, 13]} y={[-7, 0]} z={[-6, 0]} />
      <Soil a={[x0, x1]} y={[-7, hole]} z={[-6, 0]} />
      <Soil a={[x0, x1]} y={[hole, 0]} z={[-6, z0]} />
      {/* grama */}
      <Box a={[-12, 0, -6]} b={[x0, 0.3, 0]} c={C.grass} />
      <Box a={[x1, 0, -6]} b={[13, 0.3, 0]} c={C.grass} />
      <Box a={[x0, 0, -6]} b={[x1, 0.3, z0]} c={C.grass} />
      <Box a={[-12, 0.22, -0.02]} b={[13, 0.3, 0.05]} c={C.grassDark} />
      {/* terra ainda não cavada */}
      {d < 0.3 - hole - 0.01 ? (
        <>
          <Box a={[x0, hole, z0]} b={[x1, 0.3 - d, z1]} c={d < 0.05 ? C.soil1 : "#7a5130"} />
          {d < 0.05 ? <Box a={[x0, 0, z0]} b={[x1, 0.3, z1]} c={C.grass} /> : null}
        </>
      ) : null}
      {[
        [-10, -2.4], [-5.5, -5.3], [0.6, -5.9], [5.2, -2.2], [8.2, -3.6], [11, -1.4], [-8, -4.2], [10.5, -6.4],
      ].map(([x, y], i) => (
        <mesh key={i} position={[x, y, 0.05]}>
          <dodecahedronGeometry args={[0.25 + (i % 3) * 0.08, 0]} />
          <Mat c="#b89a78" />
        </mesh>
      ))}
    </>
  );
};

/** Terra voando da pá enquanto cava. */
const Dirt: React.FC<{ t: number }> = ({ t }) => {
  if (t < T.cava + 0.3 || t > T.enche) return null;
  const base = 0.3 - digDepth(t);
  return (
    <>
      {Array.from({ length: 8 }).map((_, k) => {
        const life = ((t - T.cava) * 1.4 + k / 8) % 1;
        return (
          <mesh key={k} position={[-0.6 - life * 3.5 + (k % 3) * 0.3, base + 0.5 + Math.sin(Math.PI * life) * (2.4 + base * -0.4), -1.6 + (k % 2) * 0.4]}>
            <dodecahedronGeometry args={[0.16, 0]} />
            <Mat c="#7a5130" />
          </mesh>
        );
      })}
    </>
  );
};

const lerpC = (a: string, b: string, k: number) => new THREE.Color(a).lerp(new THREE.Color(b), Math.max(0, Math.min(1, k))).getStyle();

/** Água: primeiro some na terra; depois, com o concreto, fica. */
const Water: React.FC<{ t: number }> = ({ t }) => {
  if (t > T.enche && t < T.reveste) {
    const fill = appear(t, T.enche + 0.4, 2.0);
    const drain = appear(t, T.chupa + 0.3, 2.2);
    const top = hole + (0 - hole) * fill - (0 - hole - 0.45) * drain;
    const c = lerpC("#3fb7ff", "#6b5a3a", appear(t, T.chupa + 0.5, 2.5));
    return top > hole + 0.02 ? <Box a={[x0 + 0.01, hole, z0 + 0.01]} b={[x1 - 0.01, top, z1 + 0.02]} c={c} o={0.8} /> : null;
  }
  if (t < T.agoraSim - 0.3) return null;
  const fill = appear(t, T.agoraSim - 0.3, 1.8);
  const top = floor + (0 - floor) * fill;
  const green =
    appear(t, T.verde, 2) * (1 - 0.5 * appear(t, T.devolve + 0.4, 2.5)) * (1 - appear(t, T.cloro + 0.6, 1.4)) +
    0.75 * appear(t, T.deMenos + 0.2, 0.7) * (1 - appear(t, T.cheiro, 0.8));
  const c = lerpC("#3fb7ff", "#5fa83a", green);
  const xixi = appear(t, T.xixi, 0.8) * (1 - appear(t, T.parabens, 0.6));
  return (
    <>
      <Box a={[x0 + 0.5, floor, z0 + 0.5]} b={[x1 - 0.5, top, z1 + 0.03]} c={c} o={0.72} e="#3fb7ff" ei={0.12} />
      {/* brilho da superfície */}
      <Box a={[x0 + 0.5, top - 0.04, z0 + 0.5]} b={[x1 - 0.5, top, z1 + 0.04]} c={lerpC("#bfeaff", "#a8d86a", green)} o={0.8} />
      {xixi > 0 ? (
        <mesh position={[0.2, -1.2, -1.6]} scale={[1.4 * xixi, 0.9 * xixi, 1]}>
          <icosahedronGeometry args={[0.8, 1]} />
          <Mat c="#ffe23a" o={0.55} />
        </mesh>
      ) : null}
      {/* algas nas paredes */}
      {green > 0.05
        ? Array.from({ length: 12 }).map((_, k) => (
            <mesh key={k} position={[x0 + 0.65 + ((k * 0.53) % 1) * (x1 - x0 - 1.3), floor + 0.2 + ((k * 0.31) % 1) * 1.8, k % 2 ? 0.1 : z0 + 0.6]} scale={0.12 + green * 0.18}>
              <icosahedronGeometry args={[0.6, 0]} />
              <Mat c="#3f8a2a" o={Math.min(1, green * 1.4)} />
            </mesh>
          ))
        : null}
    </>
  );
};

/** Concreto e azulejo. */
const Shell: React.FC<{ t: number }> = ({ t }) => {
  const s = pop(t, T.reveste + 0.2, 0.8);
  if (s <= 0) return null;
  const tile = appear(t, T.manta + 0.2, 0.8);
  const tc = lerpC("#9a9890", "#7fd6f5", tile);
  const w = 0.5;
  return (
    <group position={[0, hole, 0]} scale={[1, s, 1]}>
      <group position={[0, -hole, 0]}>
        <Box a={[x0, hole, z0]} b={[x1, floor, z1]} c={C.concrete} />
        <Box a={[x0, hole, z0]} b={[x1, 0.32, z0 + w]} c={C.concrete} />
        <Box a={[x0, hole, z0]} b={[x0 + w, 0.32, z1]} c={C.concrete} />
        <Box a={[x1 - w, hole, z0]} b={[x1, 0.32, z1]} c={C.concrete} />
        {/* azulejo por cima da manta */}
        <Box a={[x0 + w, floor, z0 + w]} b={[x1 - w, floor + 0.04, z1]} c={tc} />
        <Box a={[x0 + w, floor, z0 + w]} b={[x1 - w, 0.3, z0 + w + 0.04]} c={tc} />
        <Box a={[x0 + w, floor, z0 + w]} b={[x0 + w + 0.04, 0.3, z1]} c={tc} />
        <Box a={[x1 - w - 0.04, floor, z0 + w]} b={[x1 - w, 0.3, z1]} c={tc} />
        {tile > 0 ? <Box a={[x0 - 0.02, floor - 0.02, z1 - 0.01]} b={[x1 + 0.02, floor, z1 + 0.03]} c="#1d3a5a" /> : null}
        {/* borda */}
        <Box a={[x0 - 0.2, 0.3, z0 - 0.2]} b={[x1 + 0.2, 0.42, z0 + w]} c="#f1ece0" />
        <Box a={[x0 - 0.2, 0.3, z0]} b={[x0 + w, 0.42, z1]} c="#f1ece0" />
        <Box a={[x1 - w, 0.3, z0]} b={[x1 + 0.2, 0.42, z1]} c="#f1ece0" />
      </group>
    </group>
  );
};

/** Casa de máquinas: bomba + filtro de areia, e os canos. */
const Machines: React.FC<{ t: number }> = ({ t }) => {
  const pipes = t > T.ralo + 0.3;
  const pump = pop(t, T.bomba + 0.3, 0.6);
  const filt = pop(t, T.areia - 0.2, 0.6);
  const spin = t > T.bomba + 0.6 ? (t - T.bomba) * 14 : 0;
  const ralo: V3[] = [
    [0, floor, -0.6],
    [0, -3.3, -0.6],
    [0, -3.3, 0.4],
    [7.2, -3.3, 0.4],
    [7.2, 0.8, 0.4],
  ];
  const volta: V3[] = [
    [9.3, 0.6, 0.4],
    [9.3, -0.8, 0.4],
    [x1, -0.8, 0.4],
    [x1 - 0.55, -0.8, -0.6],
  ];
  return (
    <>
      {pipes ? (
        <>
          <mesh position={[0, floor + 0.05, -0.6]}>
            <cylinderGeometry args={[0.35, 0.35, 0.08, 10]} />
            <Mat c="#333" />
          </mesh>
          {ralo.slice(1).map((p, i) => (
            <Tube key={i} a={ralo[i]} b={p} r={0.15} c={C.pipe} />
          ))}
        </>
      ) : null}
      {t > T.devolve - 0.4
        ? volta.slice(1).map((p, i) => <Tube key={i} a={volta[i]} b={p} r={0.15} c={C.pipe} />)
        : null}
      <Box a={[6.4, 0.3, -2.6]} b={[10.6, 0.45, 0.6]} c={C.concreteDark} />
      {pump > 0 ? (
        <group position={[7.4, 0.45, 0]} scale={pump}>
          <Box a={[-0.6, 0, -0.5]} b={[0.6, 0.8, 0.5]} c="#2d7dff" />
          <mesh position={[0.9, 0.4, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.38, 0.38, 0.7, 10]} />
            <Mat c="#1b4fa8" />
          </mesh>
          <mesh position={[1.27, 0.4, 0]} rotation={[spin, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.3, 0.3, 0.05, 5]} />
            <Mat c="#e8e8e8" />
          </mesh>
        </group>
      ) : null}
      {filt > 0 ? (
        <group position={[9.3, 0.45, -0.4]} scale={filt}>
          <mesh position={[0, 1.2, 0]}>
            <cylinderGeometry args={[0.8, 0.8, 2.4, 12]} />
            <Mat c="#9ab8c8" o={0.45} />
          </mesh>
          <mesh position={[0, 0.6, 0]}>
            <cylinderGeometry args={[0.74, 0.74, 1.1, 12]} />
            <Mat c="#e3c78a" />
          </mesh>
          <mesh position={[0, 2.5, 0]}>
            <sphereGeometry args={[0.8, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <Mat c="#7a96a6" />
          </mesh>
        </group>
      ) : null}
      {pump > 0 && filt > 0 ? <Tube a={[8.4, 0.85, 0]} b={[8.9, 2.6, -0.4]} r={0.12} c={C.pipe} /> : null}
      <Flow t={t} from={T.bomba + 0.6} to={T.parabens} path={ralo} c={lerpC("#5fa83a", "#3fb7ff", appear(t, T.cloro, 2))} n={14} speed={0.25} />
      <Flow t={t} from={T.devolve} to={T.parabens} path={volta} c="#7fd6ff" n={8} speed={0.4} />
    </>
  );
};

/** Mangueira enchendo a primeira vez. */
const Hose: React.FC<{ t: number }> = ({ t }) => {
  if (t < T.enche + 0.3 || t > T.chupa + 0.5) return null;
  return (
    <>
      <Tube a={[5.6, 0.3, -2.5]} b={[4.2, 1.6, -1.2]} r={0.08} c="#2bbd52" />
      <Tube a={[4.2, 1.6, -1.2]} b={[3.1, 1.5, -1.2]} r={0.08} c="#2bbd52" />
      <Flow t={t} from={T.enche + 0.3} path={[[3.1, 1.5, -1.2], [2.4, 1.0, -1.2], [2.0, -1.8, -1.2]]} c="#7fd6ff" n={12} speed={0.9} r={0.09} />
    </>
  );
};

/** Pastilhas de cloro voando até a água + brilhos. */
const Chlorine: React.FC<{ t: number }> = ({ t }) => {
  if (t < T.cloro + 0.2 || t > T.arde + 0.5) return null;
  return (
    <>
      {[0, 1, 2].map((k) => {
        const u = Math.min(1, Math.max(0, (t - T.cloro - 0.3 - k * 0.35) / 0.8));
        if (u <= 0) return null;
        const p: V3 = [4.0 + (1.4 + k * 0.5 - 4.0) * u, 2.6 + Math.sin(Math.PI * u) * 1.4 - 2.8 * u * u, -1.2 - k * 0.3];
        return (
          <mesh key={k} position={u < 1 ? p : [p[0], -0.1, p[2]]} scale={u < 1 ? 1 : 1 - Math.min(1, (t - T.cloro - 1.1 - k * 0.35) * 0.8)}>
            <cylinderGeometry args={[0.2, 0.2, 0.1, 8]} />
            <Mat c="#ffffff" e="#ffffff" ei={0.3} />
          </mesh>
        );
      })}
      {Array.from({ length: 10 }).map((_, k) => {
        const life = ((t - T.cloro) * 0.8 + k / 10) % 1;
        return (
          <mesh key={k} position={[x0 + 0.9 + ((k * 0.43) % 1) * 5, -1.8 + life * 1.9, -1 - (k % 3) * 0.6]} scale={0.6 * (1 - life)}>
            <octahedronGeometry args={[0.12, 0]} />
            <Mat c="#ffffff" e="#bff4ff" ei={0.8} />
          </mesh>
        );
      })}
    </>
  );
};

/** Cheiro de piscina subindo. */
const Smell: React.FC<{ t: number }> = ({ t }) => {
  if (t < T.cheiro || t > T.parabens) return null;
  return (
    <>
      {[0, 1, 2, 3, 4].map((k) => {
        const life = ((t - T.cheiro) * 0.45 + k / 5) % 1;
        return (
          <mesh key={k} position={[-1.8 + k * 0.9 + Math.sin(t + k) * 0.3, 0.3 + life * 3, -1.6]} scale={0.3 + life * 0.6}>
            <icosahedronGeometry args={[0.6, 0]} />
            <Mat c="#e8f59a" o={0.65 * (1 - life)} />
          </mesh>
        );
      })}
    </>
  );
};

/** Tchibum! */
const Splash: React.FC<{ t: number }> = ({ t }) => {
  const s0 = T.parabens + 1.15;
  if (t < s0 || t > s0 + 1.6) return null;
  const life = (t - s0) / 1.6;
  return (
    <>
      {Array.from({ length: 22 }).map((_, k) => {
        const a = (k / 22) * Math.PI * 2;
        const v = 1.6 + (k % 4) * 0.5;
        return (
          <mesh key={k} position={[1 + Math.cos(a) * v * life, 0.1 + 3.2 * life - 5.5 * life * life, -1.8 + Math.sin(a) * v * life * 0.6]} scale={1 - life * 0.7}>
            <icosahedronGeometry args={[0.16, 0]} />
            <Mat c="#bfeaff" o={0.9} />
          </mesh>
        );
      })}
    </>
  );
};

const House: React.FC = () => (
  <group position={[-8, 0.3, -2.8]}>
    <Box a={[-1.6, 0, -1.3]} b={[1.6, 2.3, 1.3]} c="#f3e3c3" />
    <mesh position={[0, 3.0, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
      <coneGeometry args={[2.55, 1.5, 4]} />
      <Mat c="#d9534f" />
    </mesh>
    <Box a={[-0.4, 0, 1.3]} b={[0.4, 1.4, 1.36]} c="#8a5a32" />
    <Box a={[0.7, 1.0, 1.3]} b={[1.3, 1.6, 1.36]} c="#9fd3ff" />
  </group>
);

export const PoolScene: React.FC<{ t: number }> = ({ t }) => (
  <>
    <CameraRig t={t} />
    <hemisphereLight args={["#fff6e0", "#5a4030", 1.1]} />
    <directionalLight position={[8, 14, 10]} intensity={2.2} castShadow />
    <directionalLight position={[-10, 4, 8]} intensity={0.5} color="#bcd4ff" />
    <Ground t={t} />
    <House />
    <Tree p={[-11, 0.3, -4]} s={1.2} />
    <Tree p={[4.6, 0.3, -4.6]} />
    <Tree p={[12, 0.3, -3.5]} s={1.3} />
    <Shell t={t} />
    <Water t={t} />
    <Machines t={t} />
    <Hose t={t} />
    <Dirt t={t} />
    <Chlorine t={t} />
    <Smell t={t} />
    <Splash t={t} />
    <Guy t={t} plan={PLAN} yAt={guyY} scale={1.2} />
  </>
);

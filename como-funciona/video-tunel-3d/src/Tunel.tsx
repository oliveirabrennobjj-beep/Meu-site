import React from "react";
import { appear, pop, windowed } from "./lib";
import { M, PLAN, T, aneis, cavado, desabou, fumaca, tbmOn, tbmX } from "./timeline";
import { Box, CameraRig, Flow, Mat, Tube } from "./parts";
import { Guy } from "./Guy";
import { Estudio, Sol } from "./realismo";

const PI = Math.PI;
const { X0, X1, YC, R, road: ROAD, top: TOP } = M;
const rnd = (k: number) => {
  const x = Math.sin(k * 127.1) * 43758.5453;
  return x - Math.floor(x);
};

/** Montanha: fundo opaco, frente transparente pra ver o túnel por dentro. */
const Montanha: React.FC = () => (
  <>
    <Box a={[-30, -0.2, -14]} b={[30, 0, 8]} c="#7cc35a" tex="grama" rep={[16, 8]} r={0.95} />
    <Box a={[-30, 0, 1.0]} b={[X0, 0.05, 3.4]} c="#3d4148" tex="asfalto" rep={[8, 1]} />
    <Box a={[X0, -0.4, -9]} b={[X1, TOP, -1.75]} c="#8a7560" tex="terra" rep={[6, 3]} r={0.95} />
    {/* corte: terra por cima e dos lados do túnel (a metade da frente foi "tirada") */}
    <Box a={[X0, YC + R + 0.25, -1.75]} b={[X1, TOP, 2.25]} c="#9a7e60" tex="terra" rep={[6, 2]} r={0.95} />
    <Box a={[X0, -0.4, -1.75]} b={[X1, ROAD, 2.25]} c="#8a7560" tex="terra" rep={[6, 1]} r={0.95} />
    <Box a={[X0, ROAD, -1.75]} b={[X1, YC + R + 0.25, -R - 0.15]} c="#8a7560" tex="terra" rep={[6, 1]} r={0.95} />
    {/* topo arredondado com mato */}
    {[-3.5, 0, 3.5, 7].map((x, k) => (
      <mesh key={x} position={[x, TOP + 0.2, -3.5]} scale={[3.2, 1.6 + (k % 2) * 0.6, 4.2]}>
        <icosahedronGeometry args={[1, 1]} />
        <Mat c={k % 2 ? "#5ea142" : "#6db24c"} r={0.95} />
      </mesh>
    ))}
    {/* boca do túnel (portal) */}
    <Box a={[X0 - 0.2, 0, -2.2]} b={[X0 + 0.1, 0.35, 2.2]} c="#bdb9ae" tex="concreto" />
  </>
);

/** Anel de revestimento (arco + paredinhas) em x. */
const Anel: React.FC<{ x: number; c?: string; o?: number; s?: number }> = ({ x, c = "#c9c6bd", o = 1, s = 1 }) => (
  <group position={[x, YC, 0]} scale={[1, s, s]}>
    <mesh rotation={[0, PI / 2, 0]} castShadow>
      <torusGeometry args={[R, 0.14, 8, 24, PI]} />
      <Mat c={c} o={o} r={0.85} tex="concreto" />
    </mesh>
    <Box a={[-0.13, ROAD - YC, R - 0.14]} b={[0.13, 0, R + 0.14]} c={c} o={o} />
    <Box a={[-0.13, ROAD - YC, -R - 0.14]} b={[0.13, 0, -R + 0.14]} c={c} o={o} />
  </group>
);

/** Buraco escavado (vazio escuro dentro da terra). */
const Vazio: React.FC<{ ate: number; arco: boolean }> = ({ ate, arco }) => {
  const L = ate - X0;
  if (L <= 0.05) return null;
  return arco ? (
    <group position={[X0 + L / 2, YC, 0]}>
      <mesh rotation={[0, 0, PI / 2]}>
        <cylinderGeometry args={[R, R, L, 28, 1, false, 0, PI]} />
        <meshStandardMaterial color="#1d1a17" side={2} roughness={1} />
      </mesh>
      <Box a={[-L / 2, ROAD - YC, -R]} b={[L / 2, 0, R]} c="#1d1a17" />
    </group>
  ) : (
    <Box a={[X0, ROAD, -1.2]} b={[ate, 2.3, 1.2]} c="#1d1a17" />
  );
};

const Pedras: React.FC<{ t: number }> = ({ t }) => {
  const d = desabou(t);
  if (d <= 0) return null;
  const fall = Math.max(0, t - T.desaba - 0.1);
  return (
    <>
      {Array.from({ length: 16 }).map((_, k) => {
        const x = X0 + 0.2 + rnd(k) * 2.2;
        const z = (rnd(k + 3) - 0.5) * 2.0;
        const y = Math.max(ROAD + 0.25, 2.6 - 4.9 * fall * fall * (0.6 + rnd(k + 5)));
        return (
          <mesh key={k} position={[x, y, z]} scale={0.25 + rnd(k + 9) * 0.25} rotation={[k, k * 2, 0]}>
            <icosahedronGeometry args={[1, 0]} />
            <Mat c="#7d6a55" r={0.95} o={d} />
          </mesh>
        );
      })}
    </>
  );
};

const Tuneladora: React.FC<{ t: number }> = ({ t }) => {
  if (!tbmOn(t)) return null;
  const s = pop(t, T.maquina + 0.3, 0.5) * (1 - appear(t, T.agua + 0.1, 0.4));
  const x = tbmX(t);
  const a = t * 3;
  return (
    <group position={[x, YC + 0.1, 0]} scale={[s, s, s]}>
      <mesh rotation={[0, 0, PI / 2]} position={[-1.8, 0, 0]}>
        <cylinderGeometry args={[1.35, 1.35, 3.4, 28]} />
        <Mat c="#e0b030" m={0.4} r={0.45} />
      </mesh>
      <group rotation={[a, 0, 0]}>
        <mesh rotation={[0, 0, PI / 2]}>
          <cylinderGeometry args={[1.45, 1.45, 0.3, 32]} />
          <Mat c="#5b6370" m={0.6} r={0.35} />
        </mesh>
        {Array.from({ length: 10 }).map((_, k) => {
          const ang = (k / 10) * PI * 2;
          const rr = 0.4 + (k % 3) * 0.35;
          return (
            <mesh key={k} position={[0.22, Math.cos(ang) * rr, Math.sin(ang) * rr]} rotation={[0, 0, -PI / 2]}>
              <coneGeometry args={[0.1, 0.26, 6]} />
              <Mat c="#c9ced6" m={0.8} />
            </mesh>
          );
        })}
      </group>
      {/* pedra moída indo pra trás */}
      {Array.from({ length: 8 }).map((_, k) => {
        const life = (t * 0.9 + k / 8) % 1;
        return (
          <mesh key={k} position={[-0.3 - life * 4.5, -0.6, (k % 2 ? 0.3 : -0.3)]}>
            <icosahedronGeometry args={[0.1, 0]} />
            <Mat c="#7d6a55" />
          </mesh>
        );
      })}
    </group>
  );
};

const Chuva: React.FC<{ t: number }> = ({ t }) => {
  const a = windowed(t, T.agua + 0.1, T.drenagem + 1.0, 0.4);
  if (a <= 0) return null;
  const drena = appear(t, T.manta + 1.6, 0.6);
  return (
    <>
      {Array.from({ length: 24 }).map((_, k) => {
        const life = (t * 1.2 + rnd(k)) % 1;
        const x = -3 + rnd(k + 1) * 8;
        return <Box key={k} a={[x, TOP + 3 - life * 3, 1.3]} b={[x + 0.04, TOP + 3.3 - life * 3, 1.34]} c="#7fc6ff" o={a * 0.9} />;
      })}
      {/* infiltrando pela terra até o túnel */}
      {Array.from({ length: 10 }).map((_, k) => {
        const life = (t * 0.4 + k / 10) % 1;
        const x = -2 + (k % 5) * 1.6;
        const yStop = drena > 0.5 ? YC + R + 0.3 : ROAD + 0.1;
        const y = TOP - life * (TOP - yStop);
        return (
          <mesh key={k} position={[x, y, 2.35]}>
            <sphereGeometry args={[0.08, 8, 6]} />
            <Mat c="#2d9bff" e="#2d9bff" ei={0.4} o={a} />
          </mesh>
        );
      })}
      {/* poça dentro do túnel antes da drenagem */}
      {drena < 0.5 ? <Box a={[-3, ROAD, -1.2]} b={[3, ROAD + 0.05 + 0.08 * appear(t, T.agua + 1.4, 1.5), 1.2]} c="#2d9bff" o={0.7} /> : null}
    </>
  );
};

const Carros: React.FC<{ t: number }> = ({ t }) => {
  if (t < T.fumaca) return null;
  const sujo = fumaca(t);
  return (
    <>
      {[0, 1, 2, 3].map((k) => {
        const ida = k % 2 === 0;
        const u = ((t - T.fumaca) * 0.18 + k / 4) % 1;
        const x = ida ? X0 - 2 + u * 13 : X0 + 11 - u * 13;
        const z = ida ? 0.7 : -0.7;
        return (
          <group key={k} position={[x, ROAD, z]}>
            <Box a={[-0.55, 0.1, -0.3]} b={[0.55, 0.45, 0.3]} c={["#e04a3a", "#2d7dff", "#f2f2f2", "#1fbf4a"][k]} m={0.4} r={0.35} />
            <Box a={[-0.3, 0.45, -0.27]} b={[0.25, 0.7, 0.27]} c="#bcd4ff" o={0.85} />
          </group>
        );
      })}
      {sujo > 0
        ? Array.from({ length: 22 }).map((_, k) => {
            const drift = t > T.pendura + 1.0 ? (t - T.pendura - 1.0) * 2.2 : 0;
            const x = X0 + 0.5 + rnd(k) * 10 - drift;
            if (x < X0 - 2) return null;
            return (
              <mesh key={k} position={[x, YC + 0.3 + rnd(k + 2) * 0.9, (rnd(k + 4) - 0.5) * 1.8]}>
                <sphereGeometry args={[0.3 + rnd(k + 6) * 0.25, 10, 8]} />
                <Mat c="#6b6f76" o={0.55 * sujo} />
              </mesh>
            );
          })
        : null}
    </>
  );
};

const Ventiladores: React.FC<{ t: number }> = ({ t }) => {
  const s = pop(t, T.pendura + 0.4, 0.5);
  if (s <= 0) return null;
  const a = t > T.pendura + 1.0 ? t * 12 : 0;
  return (
    <>
      {[-2.0, 2.5].map((x) => (
        <group key={x} position={[x, YC + R - 0.45, 0]} scale={[s, s, s]}>
          <Tube a={[0, 0.25, 0]} b={[0, 0.45, 0]} r={0.04} c="#30343a" />
          <mesh rotation={[0, 0, PI / 2]}>
            <cylinderGeometry args={[0.32, 0.32, 1.3, 20, 1, true]} />
            <meshStandardMaterial color="#9aa3ad" metalness={0.5} roughness={0.35} side={2} />
          </mesh>
          <group rotation={[a, 0, 0]}>
            {[0, 1, 2, 3].map((k) => (
              <mesh key={k} rotation={[(k * PI) / 2, 0, 0]} position={[0, 0.14, 0]}>
                <boxGeometry args={[0.04, 0.26, 0.1]} />
                <Mat c="#ffd60a" />
              </mesh>
            ))}
          </group>
        </group>
      ))}
      {t > T.pendura + 1.2
        ? <Flow t={t} from={T.pendura + 1.2} path={[[4.5, YC + R - 0.45, 0], [X0 - 3, YC + R - 0.45, 0]]} n={14} speed={0.45} c="#e8f6ff" r={0.06} />
        : null}
    </>
  );
};

const Luzes: React.FC<{ t: number }> = ({ t }) => {
  const on = appear(t, T.luz + 0.6, 0.8);
  if (on <= 0) return null;
  return (
    <>
      {Array.from({ length: 12 }).map((_, k) => {
        const x = X0 + 0.4 + k * 1.1;
        const forca = Math.max(0.15, 1 - k / 6);
        return (
          <group key={k}>
            <Box a={[x - 0.25, YC + R - 0.22, -0.9]} b={[x + 0.25, YC + R - 0.12, -0.7]} c="#fff4c2" e="#ffd27a" ei={3 * forca * on} />
            <Box a={[x - 0.25, YC + R - 0.22, 0.7]} b={[x + 0.25, YC + R - 0.12, 0.9]} c="#fff4c2" e="#ffd27a" ei={3 * forca * on} />
          </group>
        );
      })}
    </>
  );
};

export const TunelScene: React.FC<{ t: number }> = ({ t }) => {
  const ate = cavado(t);
  const arco = t > T.teto + 0.3;
  const ringTo = aneis(t);
  const manta = appear(t, T.manta + 0.6, 0.8);
  const dreno = appear(t, T.manta + 2.0, 0.6);
  const rings: number[] = [];
  for (let x = X0 + 0.2; x <= Math.min(ringTo, X1); x += 0.55) rings.push(x);
  return (
    <>
      <CameraRig t={t} />
      <Estudio />
      <hemisphereLight args={["#e8f4ff", "#5b4a3a", 0.5]} />
      <Sol p={[-6, 20, 14]} i={2.6} area={22} />
      <directionalLight position={[-12, 6, 10]} intensity={0.4} color="#bcd4ff" />
      <Montanha />
      <Vazio ate={t < T.desaba + 0.2 ? ate : arco ? ate : X0 + 0.01} arco={arco} />
      <Pedras t={t} />
      {rings.map((x, k) => (
        <Anel key={k} x={x} s={pop(t, (t < T.maquina ? T.teto + 0.5 + k * 0.6 : 0), 0.3) || 1} />
      ))}
      {manta > 0 ? (
        <group position={[(X0 + X1) / 2, YC, 0]}>
          <mesh rotation={[0, 0, PI / 2]}>
            <cylinderGeometry args={[R + 0.2, R + 0.2, (X1 - X0) * manta, 28, 1, true, 0, PI]} />
            <meshStandardMaterial color="#ff8a1a" transparent opacity={0.55 - 0.42 * appear(t, T.drenagem + 0.8, 1.0)} depthWrite={false} side={2} />
          </mesh>
        </group>
      ) : null}
      {dreno > 0 ? (
        <>
          {[-1.25, 1.25].map((z) => (
            <Tube key={z} a={[X1, ROAD + 0.08, z]} b={[X1 - (X1 - X0 + 2) * dreno, ROAD + 0.08, z]} r={0.08} c="#2d7dff" o={0.85} />
          ))}
          <Flow t={t} from={T.manta + 2.4} path={[[X1, ROAD + 0.08, 1.25], [X0 - 2, ROAD + 0.08, 1.25]]} n={16} speed={0.25} c="#7fc6ff" r={0.07} />
        </>
      ) : null}
      <Tuneladora t={t} />
      <Chuva t={t} />
      <Carros t={t} />
      <Ventiladores t={t} />
      <Luzes t={t} />
      <Guy t={t} plan={PLAN} scale={0.9} />
    </>
  );
};

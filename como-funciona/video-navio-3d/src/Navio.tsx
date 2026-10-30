import React from "react";
import { appear, pop, windowed } from "./lib";
import { H, PLAN, T, floodAll, floodOne, propAngle, roll, rudder, shipSpeed, sinking, travelled, yaw } from "./timeline";
import { Box, CameraRig, Mat, Tube } from "./parts";
import { Guy } from "./Guy";
import { Estudio, Sol } from "./realismo";

const PI = Math.PI;
const { len: L, half: W, bot: B, top: TOP, floor: FLOOR, dockTop: DOCK } = H;
const NAVY = "#2a4d8f";
const RED = "#c8322b";
const STEEL = "#8f98a3";
const SEA = "#2f8fe8";

/* ---------- mar em corte ---------- */
const Mar: React.FC<{ t: number }> = ({ t }) => {
  const d = travelled(t);
  const wave = windowed(t, T.ondas + 0.3, T.furar, 0.6);
  return (
    <>
      <mesh position={[0, FLOOR / 2, -38]}>
        <boxGeometry args={[140, -FLOOR, 84]} />
        <meshStandardMaterial color={SEA} transparent opacity={0.62} roughness={0.15} metalness={0.1} emissive="#0d3a73" emissiveIntensity={0.35} />
      </mesh>
      <Box a={[-70, FLOOR - 1.2, -80]} b={[70, FLOOR, 4]} c="#d8c48a" tex="terra" rep={[20, 10]} r={0.95} />
      {/* pedras e algas no fundo: andam pra trás quando o navio anda */}
      {Array.from({ length: 12 }).map((_, k) => {
        const x = ((((k * 4.3 - d) % 52) + 52) % 52) - 26;
        const z = -3 + ((k * 1.7) % 6);
        return k % 3 === 0 ? (
          <group key={k} position={[x, FLOOR, z]}>
            {[0, 0.25, -0.2].map((dx, j) => (
              <Tube key={j} a={[dx, 0, 0]} b={[dx + Math.sin(t * 1.5 + k + j) * 0.15, 0.9 + j * 0.2, 0]} r={0.05} c="#3f8a3a" />
            ))}
          </group>
        ) : (
          <mesh key={k} position={[x, FLOOR + 0.15, z]} scale={[0.5 + (k % 4) * 0.15, 0.32, 0.4]}>
            <icosahedronGeometry args={[1, 0]} />
            <Mat c="#8d8f94" r={0.9} />
          </mesh>
        );
      })}
      {/* marolas na superfície */}
      {Array.from({ length: 30 }).map((_, k) => {
        const x = ((((k * 3.7 - d * 1.0) % 60) + 60) % 60) - 30;
        const z = -12 + ((k * 2.3) % 16);
        const y = 0.02 + Math.sin(t * 2.2 + k) * (0.04 + wave * 0.2);
        return <Box key={k} a={[x, y, z]} b={[x + 0.9 + wave * 0.6, y + 0.02, z + 0.12]} c="#e8f6ff" o={0.75} />;
      })}
    </>
  );
};

const Cais: React.FC = () => (
  <>
    <Box a={[-30, FLOOR, -12]} b={[-5.6, DOCK, 4]} c="#b5b2a8" tex="concreto" rep={[6, 4]} r={0.9} />
    <Box a={[-30, DOCK, -12]} b={[-5.6, DOCK + 0.05, 4]} c="#9a9da3" tex="concreto" rep={[6, 4]} r={0.9} />
    {[-6.0, -6.0].map((x, k) => (
      <mesh key={k} position={[x, DOCK + 0.25, k ? -3 : 0.6]}>
        <cylinderGeometry args={[0.16, 0.2, 0.5, 12]} />
        <Mat c="#3a3f47" />
      </mesh>
    ))}
    {[-0.5, -2.2].map((z) => (
      <mesh key={z} position={[-5.5, 0.5, z]} rotation={[PI / 2, 0, 0]}>
        <torusGeometry args={[0.35, 0.12, 8, 16]} />
        <Mat c="#1f1f22" />
      </mesh>
    ))}
  </>
);

/** Placa de aço que afunda no começo. */
const Placa: React.FC<{ t: number }> = ({ t }) => {
  if (t > T.casco + 0.6) return null;
  const fall = appear(t, 0.3, 0.6);
  const sinkK = appear(t, 1.0, 1.6);
  const y = 3 - 3 * fall - sinkK * (-FLOOR - 0.1);
  const o = 1 - appear(t, T.casco, 0.5);
  return (
    <group position={[0, y, 0]} rotation={[0, 0, 0.18 * sinkK]} scale={[1, 1, 1]}>
      <Box a={[-2, -0.06, -1.1]} b={[2, 0.06, 1.1]} c={STEEL} m={0.6} r={0.35} tex="metal" o={o} />
      {t > 1.0 && t < 3.0
        ? Array.from({ length: 10 }).map((_, k) => {
            const life = ((t - 1.0) * 1.2 + k / 10) % 1;
            return (
              <mesh key={k} position={[-1.8 + (k * 0.4), 0.2 + life * 2.5, 0.3 * Math.sin(k)]}>
                <sphereGeometry args={[0.07, 8, 6]} />
                <Mat c="#e8f6ff" o={0.8 * (1 - life)} />
              </mesh>
            );
          })
        : null}
    </group>
  );
};

/** Parede do casco com dobradiça: dobra de deitada (fold 0) pra em pé (fold 1). */
const Parede: React.FC<{ side: "z+" | "z-" | "x+" | "x-"; fold: number; c: string }> = ({ side, fold, c }) => {
  const h = TOP - B;
  const open = (1 - fold) * (PI / 2);
  if (side === "z+" || side === "z-") {
    const s = side === "z+" ? 1 : -1;
    return (
      <group position={[0, B, s * W]} rotation={[s * open, 0, 0]}>
        <Box a={[-L, 0, s > 0 ? 0 : -0.1]} b={[L, h, s > 0 ? 0.1 : 0]} c={c} m={0.4} r={0.45} />
      </group>
    );
  }
  const s = side === "x+" ? 1 : -1;
  return (
    <group position={[s * L, B, 0]} rotation={[0, 0, -s * open]}>
      <Box a={[s > 0 ? 0 : -0.1, 0, -W]} b={[s > 0 ? 0.1 : 0, h, W]} c={c} m={0.4} r={0.45} />
    </group>
  );
};

const Navio: React.FC<{ t: number }> = ({ t }) => {
  if (t < T.dobra) return null;
  const s = pop(t, T.dobra + 0.1, 0.5);
  const fold = appear(t, T.dobra + 0.5, 1.4);
  const lower = appear(t, T.dobra + 2.0, 1.0);
  const bob = Math.sin(t * 1.6) * 0.05;
  const y = 2.4 * (1 - lower) + bob - 4.2 * sinking(t) - 0.25 * floodOne(t);
  const navio = pop(t, T.casco - 0.4, 0.6);
  const lastro = t > T.peso + 0.2;
  const drop = appear(t, T.peso + 0.3, 0.8);
  const anteparas = pop(t, T.divide + 0.6, 0.5);
  const motor = pop(t, T.motor + 0.3, 0.5);
  const leme = pop(t, T.virar + 0.3, 0.5);
  const fAll = floodAll(t);
  const fOne = floodOne(t);
  const holeOn = (t > T.furar + 0.3 && t < T.divide) || (t > T.enche - 0.3 && t < T.remo);
  const pa = propAngle(t);
  const spd = shipSpeed(t);
  return (
    <group position={[0, y, 0]} rotation={[roll(t), yaw(t), -0.06 * fOne + 0.08 * sinking(t)]} scale={[s, s, s]}>
      {/* fundo e paredes */}
      <Box a={[-L, B, -W]} b={[L, B + 0.1, W]} c={RED} m={0.3} r={0.5} />
      <Parede side="z+" fold={fold} c={NAVY} />
      <Parede side="z-" fold={fold} c={NAVY} />
      <Parede side="x+" fold={fold} c={NAVY} />
      <Parede side="x-" fold={fold} c={NAVY} />
      {/* faixa vermelha da linha d'água */}
      {fold > 0.98 ? (
        <>
          <Box a={[-L, B, W]} b={[L, -0.1, W + 0.11]} c={RED} m={0.3} r={0.5} />
          <Box a={[-L, B, -W - 0.11]} b={[L, -0.1, -W]} c={RED} m={0.3} r={0.5} />
        </>
      ) : null}
      {/* proa, deck de trás, cabine e chaminé */}
      {navio > 0 ? (
        <group scale={[navio, navio, navio]}>
          {[1, -1].map((sd) => (
            <group key={sd} position={[L + 0.75, B, sd * 0.6]} rotation={[0, sd * 0.675, 0]}>
              <Box a={[-0.98, 0, -0.05]} b={[0.98, TOP - B, 0.05]} c={NAVY} m={0.4} r={0.45} />
              <Box a={[-0.98, 0, sd > 0 ? 0.05 : -0.1]} b={[0.98, 0.8, sd > 0 ? 0.1 : -0.05]} c={RED} m={0.3} r={0.5} />
            </group>
          ))}
          <Box a={[-L, TOP - 0.1, -W]} b={[-1.2, TOP, W]} c="#c9c6bd" />
          <Box a={[-2.7, TOP, -0.9]} b={[-1.4, TOP + 1.3, 0.9]} c="#f2f2f2" r={0.5} />
          {[-0.5, 0, 0.5].map((z) => (
            <Box key={z} a={[-1.42, TOP + 0.8, z - 0.15]} b={[-1.38, TOP + 1.1, z + 0.15]} c="#2d7dff" />
          ))}
          <mesh position={[-2.2, TOP + 1.7, 0]}>
            <cylinderGeometry args={[0.25, 0.3, 0.8, 14]} />
            <Mat c={RED} />
          </mesh>
          <mesh position={[-2.2, TOP + 2.12, 0]}>
            <cylinderGeometry args={[0.26, 0.26, 0.08, 14]} />
            <Mat c="#111" />
          </mesh>
        </group>
      ) : null}
      {/* setas: a água empurra pra cima */}
      {t > T.dobra + 3.0 && t < T.ondas
        ? [-1.8, 0, 1.8].map((x, k) => {
            const o = windowed(t, T.dobra + 3.0 + k * 0.15, T.ondas, 0.3);
            const up = Math.sin(t * 3 + k) * 0.08;
            return (
              <group key={x} position={[x, B - 1.4 + up, W + 0.3]} scale={[o, o, o]}>
                <Tube a={[0, 0, 0]} b={[0, 0.8, 0]} r={0.08} c="#bfe3ff" />
                <mesh position={[0, 0.95, 0]}>
                  <coneGeometry args={[0.2, 0.35, 12]} />
                  <Mat c="#bfe3ff" e="#4fb8ff" ei={0.6} />
                </mesh>
              </group>
            );
          })
        : null}
      {/* lastro */}
      {lastro
        ? [-1.8, 0, 1.8].map((x) => (
            <Box key={x} a={[x - 0.6, B + 0.1 + 3 * (1 - drop), -0.8]} b={[x + 0.6, B + 0.5 + 3 * (1 - drop), 0.8]} c="#3a3f47" m={0.5} r={0.6} />
          ))
        : null}
      {/* água entrando pelo furo */}
      {fAll > 0.01 ? <Box a={[-L + 0.1, B + 0.1, -W + 0.1]} b={[L - 0.1, B + 0.1 + 1.65 * fAll, W - 0.1]} c={SEA} o={0.65} /> : null}
      {fOne > 0.01 ? <Box a={[1.55, B + 0.1, -W + 0.1]} b={[L - 0.1, B + 0.1 + 0.85 * fOne, W - 0.1]} c={SEA} o={0.7} /> : null}
      {holeOn ? (
        <>
          <mesh position={[2.2, -0.45, W + 0.12]} rotation={[PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.18, 0.18, 0.02, 14]} />
            <Mat c="#111" />
          </mesh>
          <mesh position={[2.2, -0.45, W + 0.13]}>
            <torusGeometry args={[0.24, 0.05, 6, 16]} />
            <Mat c="#ff3b3b" e="#ff3b3b" ei={0.6} />
          </mesh>
        </>
      ) : null}
      {/* anteparas */}
      {anteparas > 0
        ? [-1.5, 0, 1.5].map((x) => (
            <group key={x} position={[x, B + 0.1, 0]} scale={[1, anteparas, 1]}>
              <Box a={[-0.05, 0, -W + 0.1]} b={[0.05, TOP - B - 0.2, W - 0.1]} c="#ffd60a" m={0.3} r={0.5} />
            </group>
          ))
        : null}
      {/* motor, eixo e hélice */}
      {motor > 0 ? (
        <group scale={[motor, motor, motor]}>
          <Box a={[-2.85, B + 0.1, -0.5]} b={[-1.9, B + 0.85, 0.5]} c="#8a3a2a" m={0.4} r={0.5} />
          <Tube a={[-2.4, B + 0.35, 0]} b={[-3.75, B + 0.35, 0]} r={0.06} c="#c9ced6" />
          <group position={[-3.8, B + 0.35, 0]} rotation={[pa, 0, 0]}>
            <mesh rotation={[0, 0, PI / 2]}>
              <cylinderGeometry args={[0.1, 0.14, 0.2, 10]} />
              <Mat c="#d9b44a" m={0.6} r={0.3} />
            </mesh>
            {[0, 1, 2, 3].map((k) => (
              <group key={k} rotation={[(k * PI) / 2, 0, 0]}>
                <mesh position={[0, 0.3, 0]} rotation={[0.5, 0, 0]}>
                  <boxGeometry args={[0.08, 0.46, 0.22]} />
                  <Mat c="#d9b44a" m={0.6} r={0.3} />
                </mesh>
              </group>
            ))}
          </group>
          {/* água jogada pra trás */}
          {spd > 0.05
            ? Array.from({ length: 16 }).map((_, k) => {
                const life = (t * 1.4 + k / 16) % 1;
                return (
                  <mesh key={k} position={[-3.9 - life * 3.2, B + 0.35 + Math.sin(k * 2.1) * 0.35 * life, Math.cos(k * 1.7) * 0.35 * life]}>
                    <sphereGeometry args={[0.06 + life * 0.05, 8, 6]} />
                    <Mat c="#e8f6ff" o={0.8 * (1 - life) * Math.min(1, spd)} />
                  </mesh>
                );
              })
            : null}
        </group>
      ) : null}
      {leme > 0 ? (
        <group position={[-4.25, B + 0.3, 0]} rotation={[0, rudder(t), 0]} scale={[leme, leme, leme]}>
          <Tube a={[0, 0.5, 0]} b={[0, 1.2, 0]} r={0.05} c="#3a3f47" />
          <Box a={[-0.35, -0.35, -0.04]} b={[0.35, 0.55, 0.04]} c="#ffd60a" m={0.3} r={0.5} />
        </group>
      ) : null}
    </group>
  );
};

export const NavioScene: React.FC<{ t: number }> = ({ t }) => (
  <>
    <CameraRig t={t} />
    <Estudio />
    <hemisphereLight args={["#e8f4ff", "#1c6fb5", 0.5]} />
    <Sol p={[8, 18, 14]} i={2.6} area={18} />
    <directionalLight position={[-12, 6, 10]} intensity={0.4} color="#bcd4ff" />
    <Mar t={t} />
    <Cais />
    <Placa t={t} />
    <Navio t={t} />
    <Guy t={t} plan={PLAN} scale={0.9} yAt={() => DOCK} />
  </>
);


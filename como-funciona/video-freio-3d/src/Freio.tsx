import React from "react";
import * as THREE from "three";
import { appear, pop, windowed } from "./lib";
import { M, PLAN, T, absOn, absPulse, heatAt, locked, pedalAt, roadAt, speed, squeeze, wheelAt } from "./timeline";
import { Box, CameraRig, Mat, Tube, V3 } from "./parts";
import { Guy } from "./Guy";
import { Estudio, Sol } from "./realismo";

const PI = Math.PI;
const { y: Y, rTire, tube, rOut, rDisc, dz, calAng } = M;
const STEEL = "#c9ced6";
const DARK = "#3d4553";
const RED = "#e0302a";
const OIL = "#f2b632";

const Garage: React.FC = () => (
  <>
    <Box a={[-16, 0, -10]} b={[16, 0.3, 6]} c="#9a9da3" tex="concreto" rep={[8, 4]} r={0.85} />
    <Box a={[-16, 0.3, -10]} b={[16, 10, -9.6]} c="#646d80" tex="tijolo" rep={[8, 3]} r={0.9} />
    <Box a={[-16, 0.3, -9.6]} b={[16, 1.3, -9.5]} c="#3d4553" />
    <Box a={[-8, 0.3, -9.5]} b={[-3.5, 1.8, -8.2]} c="#8a5a32" tex="madeira" />
    <Box a={[-8.1, 1.8, -9.6]} b={[-3.4, 1.95, -8.1]} c="#a8743f" tex="madeira" />
    <Box a={[-7.6, 2.6, -9.58]} b={[-3.9, 4.8, -9.5]} c="#c9b48a" />
    {[-7, -6, -5, -4.5].map((x, k) => (
      <Box key={x} a={[x, 3.0 + (k % 2) * 0.5, -9.5]} b={[x + 0.15, 4.1 + (k % 2) * 0.3, -9.42]} c={["#e04a3a", "#8f98a3", "#2d7dff", "#8f98a3"][k]} />
    ))}
    {[5.5, 7.2].map((x) => (
      <mesh key={x} position={[x, 1.1, -9]} castShadow>
        <torusGeometry args={[0.6, 0.26, 8, 18]} />
        <Mat c="#1f1f22" />
      </mesh>
    ))}
  </>
);

/** Esteira que faz o papel da rua: as faixas andam para trás com a velocidade do carro. */
const Esteira: React.FC<{ t: number }> = ({ t }) => {
  const road = roadAt(t);
  const span = 6;
  // marca de pneu: pintada enquanto a roda está travada e levada pela esteira depois
  const lockStart = T.trava + 1.4;
  const lockEnd = T.sensor + 0.4;
  const slid = Math.max(0, roadAt(Math.min(t, lockEnd)) - roadAt(lockStart));
  const after = t > lockEnd ? roadAt(t) - roadAt(lockEnd) : 0;
  const x1 = Math.max(-2, -after);
  const x0 = Math.max(-2, -after - slid);
  const markO = t > lockStart ? 1 - appear(t, T.sensor + 2.5, 0.6) : 0;
  return (
    <>
      <Box a={[-2, 0.3, -0.8]} b={[4, 0.55, 0.8]} c="#2b2e33" tex="asfalto" rep={[4, 1]} r={0.9} />
      <Box a={[-2.2, 0.3, -0.9]} b={[-2, 0.7, 0.9]} c="#8f98a3" m={0.5} r={0.4} />
      <Box a={[4, 0.3, -0.9]} b={[4.2, 0.7, 0.9]} c="#8f98a3" m={0.5} r={0.4} />
      {Array.from({ length: 4 }).map((_, k) => {
        const x = ((((k * 1.5 - road) % span) + span) % span) - 2;
        return x < 3.95 ? <Box key={k} a={[x, 0.55, -0.08]} b={[Math.min(4, x + 0.75), 0.565, 0.08]} c="#f2f2f2" /> : null;
      })}
      {markO > 0 && x1 - x0 > 0.02 ? <Box a={[x0, 0.556, -0.32]} b={[x1, 0.562, 0.32]} c="#0c0c0e" o={0.85 * markO} /> : null}
    </>
  );
};

/** Fumaça (pneu derrapando, pastilha queimando). */
const Fumaca: React.FC<{ t: number; p: V3; amount: number; dir?: [number, number]; n?: number; c?: string; size?: number }> = ({
  t,
  p,
  amount,
  dir = [-1.6, 1.2],
  n = 8,
  c = "#b9bcc2",
  size = 0.35,
}) => {
  if (amount <= 0.02) return null;
  return (
    <>
      {Array.from({ length: n }).map((_, k) => {
        const life = (t * 1.3 + k / n) % 1;
        return (
          <mesh
            key={k}
            position={[p[0] + life * dir[0] + Math.sin(k * 5) * 0.1, p[1] + life * dir[1], p[2] + Math.cos(k * 3) * 0.3]}
            scale={size * (0.4 + life * 1.4)}
          >
            <icosahedronGeometry args={[1, 0]} />
            <Mat c={c} o={0.7 * amount * (1 - life)} />
          </mesh>
        );
      })}
    </>
  );
};

/** Pneu, roda, disco e anel do sensor: tudo gira junto. */
const Roda: React.FC<{ t: number }> = ({ t }) => {
  const ang = wheelAt(t);
  const disco = pop(t, T.disco + 0.2, 0.6);
  const heat = heatAt(t);
  const furos = pop(t, T.furos + 0.4, 0.6);
  const anel = pop(t, T.sensor + 0.3, 0.5);
  const discColor = new THREE.Color(STEEL).lerp(new THREE.Color("#ff5a1f"), Math.max(0, heat - 0.4) / 0.6).getStyle();
  const glow = heat * heat * 1.6;
  return (
    <>
      {/* suporte e eixo */}
      <Box a={[-0.2, 0.3, -1.75]} b={[0.2, Y + 0.2, -1.45]} c={DARK} m={0.4} r={0.5} />
      <Tube a={[0, Y, -1.6]} b={[0, Y, 0.3]} r={0.12} c="#5b6370" />
      <group position={[0, Y, 0]} rotation={[0, 0, ang]}>
        <mesh castShadow>
          <torusGeometry args={[rTire, tube, 14, 40]} />
          <Mat c="#1f1f22" r={0.85} />
        </mesh>
        {/* sulcos do pneu, para dar para ver o giro */}
        {Array.from({ length: 18 }).map((_, k) => {
          const a = (k / 18) * 2 * PI;
          return (
            <mesh key={k} position={[Math.cos(a) * (rOut - 0.02), Math.sin(a) * (rOut - 0.02), 0]} rotation={[0, 0, a]}>
              <boxGeometry args={[0.06, 0.12, 0.62]} />
              <Mat c="#111" />
            </mesh>
          );
        })}
        <mesh rotation={[PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.8, 0.8, 0.5, 28, 1, true]} />
          <Mat c="#b8bec8" m={0.6} r={0.35} />
        </mesh>
        {[0, 1, 2, 3, 4].map((k) => (
          <mesh key={k} rotation={[0, 0, (k * 2 * PI) / 5]} position={[0, 0, 0.18]}>
            <boxGeometry args={[0.14, 1.55, 0.08]} />
            <Mat c="#8f98a3" m={0.6} r={0.35} />
          </mesh>
        ))}
        <mesh rotation={[PI / 2, 0, 0]} position={[0, 0, 0.2]}>
          <cylinderGeometry args={[0.24, 0.24, 0.12, 16]} />
          <Mat c="#5b6370" />
        </mesh>
        {/* disco */}
        {disco > 0 ? (
          <group scale={[disco, disco, 1]}>
            <Tube a={[0, 0, 0.25]} b={[0, 0, dz + 0.22]} r={0.2} c="#5b6370" />
            {furos < 1 ? (
              <mesh rotation={[PI / 2, 0, 0]} position={[0, 0, dz]}>
                <cylinderGeometry args={[rDisc, rDisc, 0.13, 40]} />
                <Mat c={discColor} m={0.7} r={0.3} tex="metal" e="#ff4a1a" ei={glow} />
              </mesh>
            ) : (
              <>
                {[-0.05, 0.05].map((oz) => (
                  <mesh key={oz} rotation={[PI / 2, 0, 0]} position={[0, 0, dz + oz]}>
                    <cylinderGeometry args={[rDisc, rDisc, 0.035, 40]} />
                    <Mat c={discColor} m={0.7} r={0.3} tex="metal" e="#ff4a1a" ei={glow} />
                  </mesh>
                ))}
                {/* aletas entre as duas faces */}
                {Array.from({ length: 16 }).map((_, k) => {
                  const a = (k / 16) * 2 * PI;
                  return (
                    <mesh key={k} position={[Math.cos(a) * 0.55, Math.sin(a) * 0.55, dz]} rotation={[0, 0, a]}>
                      <boxGeometry args={[0.5, 0.04, 0.07]} />
                      <Mat c="#6b727d" e="#ff4a1a" ei={glow * 0.6} />
                    </mesh>
                  );
                })}
              </>
            )}
            {/* furos */}
            {furos > 0
              ? Array.from({ length: 12 }).map((_, k) => {
                  const a = (k / 12) * 2 * PI;
                  const r = k % 2 ? 0.62 : 0.48;
                  return (
                    <mesh key={k} rotation={[PI / 2, 0, 0]} position={[Math.cos(a) * r, Math.sin(a) * r, dz + 0.071]} scale={[furos, 1, furos]}>
                      <cylinderGeometry args={[0.05, 0.05, 0.01, 10]} />
                      <Mat c="#15171a" />
                    </mesh>
                  );
                })
              : null}
            {/* anel dentado do sensor do ABS */}
            {anel > 0 ? (
              <group position={[0, 0, dz + 0.28]} scale={[anel, anel, anel]}>
                <mesh>
                  <torusGeometry args={[0.3, 0.035, 6, 30]} />
                  <Mat c="#d9b44a" m={0.6} r={0.35} />
                </mesh>
                {Array.from({ length: 14 }).map((_, k) => {
                  const a = (k / 14) * 2 * PI;
                  return (
                    <mesh key={k} position={[Math.cos(a) * 0.36, Math.sin(a) * 0.36, 0]} rotation={[0, 0, a]}>
                      <boxGeometry args={[0.09, 0.06, 0.07]} />
                      <Mat c="#d9b44a" m={0.6} r={0.35} />
                    </mesh>
                  );
                })}
              </group>
            ) : null}
          </group>
        ) : null}
      </group>
    </>
  );
};

/** Vento passando pelas aletas: bolinhas azuis saindo do centro para a borda. */
const Vento: React.FC<{ t: number }> = ({ t }) => {
  const o = windowed(t, T.furos + 1.4, T.parabens + 1.0, 0.4);
  if (o <= 0) return null;
  const ang = wheelAt(t);
  return (
    <group position={[0, Y, dz]}>
      {Array.from({ length: 24 }).map((_, k) => {
        const life = (t * 0.9 + (k * 0.37) % 1) % 1;
        const a = (k / 24) * 2 * PI + ang;
        const r = 0.25 + life * 0.85;
        return (
          <mesh key={k} position={[Math.cos(a) * r, Math.sin(a) * r, 0.12 + life * 0.15]}>
            <sphereGeometry args={[0.045, 8, 6]} />
            <Mat c="#7fd0ff" e="#4fb8ff" ei={1.2} o={o * (1 - life)} />
          </mesh>
        );
      })}
    </group>
  );
};

/** Pinça com duas pastilhas abraçando a borda do disco. Fica parada (não gira com a roda). */
const Pinca: React.FC<{ t: number }> = ({ t }) => {
  const s = pop(t, T.pastilhas + 0.3, 0.6);
  if (s <= 0) return null;
  const sq = squeeze(t);
  const gap = 0.1 * (1 - sq);
  const grosso = appear(t, T.fininho + 1.4, 0.5);
  const heat = heatAt(t);
  const padZ = 0.065 + 0.035 + gap;
  const pad = (side: 1 | -1) => (
    <group position={[0.6, 0, dz + side * padZ]}>
      <mesh>
        <boxGeometry args={[0.3, 0.42, 0.07]} />
        <Mat c="#4a3a2c" r={0.9} e="#ff4a1a" ei={heat * sq * 0.6} />
      </mesh>
      <mesh position={[0, 0, side * 0.055]}>
        <boxGeometry args={[0.34, 0.46, 0.04]} />
        <Mat c="#8f98a3" m={0.6} r={0.35} />
      </mesh>
    </group>
  );
  return (
    <group position={[0, Y, 0]} rotation={[0, 0, calAng]} scale={[s, s, s]}>
      {pad(1)}
      {pad(-1)}
      {/* corpo vermelho em forma de C */}
      <Box a={[0.46, -0.27, dz + 0.33]} b={[0.84, 0.27, dz + 0.45]} c={RED} m={0.3} r={0.4} />
      <Box a={[0.46, -0.27, dz - 0.45]} b={[0.84, 0.27, dz - 0.33]} c={RED} m={0.3} r={0.4} />
      <Box a={[0.78, -0.27, dz - 0.45]} b={[0.88, 0.27, dz + 0.45]} c={RED} m={0.3} r={0.4} />
      {/* pistão grosso da roda */}
      <mesh position={[0.62, 0, dz + (0.175 + gap + 0.33) / 2]} rotation={[PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.15, 0.15, Math.max(0.02, 0.155 - gap), 20]} />
        <Mat c={grosso > 0 ? new THREE.Color(STEEL).lerp(new THREE.Color("#ffd60a"), windowed(t, T.fininho + 1.4, T.hidraulico, 0.3)).getStyle() : STEEL} m={0.7} r={0.3} />
      </mesh>
      <Fumaca t={t} p={[0.75, 0.3, dz]} amount={heat > 0.75 ? sq * (heat - 0.75) * 4 : 0} dir={[0.3, 1.4]} n={6} c="#9a9da3" size={0.18} />
    </group>
  );
};

const PIPE: V3[] = [
  [-1.6, 2.25, 1.15],
  [-1.1, 2.25, 1.15],
  [-1.1, 4.1, 1.15],
  [0.55, 4.1, 1.15],
  [0.55, 2.98, 1.15],
];
const segLen = PIPE.slice(1).map((p, i) => new THREE.Vector3(...p).distanceTo(new THREE.Vector3(...PIPE[i])));
const pipeTotal = segLen.reduce((a, b) => a + b, 0);
const along = (u: number): V3 => {
  let d = u * pipeTotal;
  let i = 0;
  while (i < segLen.length - 1 && d > segLen[i]) d -= segLen[i++];
  const a = new THREE.Vector3(...PIPE[i]);
  const b = new THREE.Vector3(...PIPE[i + 1]);
  const p = a.lerp(b, Math.min(1, d / segLen[i]));
  return [p.x, p.y, p.z];
};

/** Pedal, cilindro fininho, cano com óleo e a caixa do ABS. */
const Pedal: React.FC<{ t: number }> = ({ t }) => {
  const s = pop(t, T.pe, 0.6);
  if (s <= 0) return null;
  const p = pedalAt(t);
  const [px, py, pz] = M.pedal;
  const rot = 0.32 * p;
  const fill = appear(t, T.oleo + 0.4, 1.6);
  const fininho = windowed(t, T.fininho + 0.5, T.hidraulico, 0.3);
  const abs = pop(t, T.sensor + 1.2, 0.5);
  const led = absOn(t) ? absPulse(t) : t > T.sensor + 1.2 ? 0.3 : 0;
  // pedaços do cano já cheios de óleo
  const filled: React.ReactNode[] = [];
  let acc = 0;
  for (let i = 0; i < segLen.length; i++) {
    const startU = acc / pipeTotal;
    acc += segLen[i];
    const endU = acc / pipeTotal;
    if (fill <= startU) break;
    const k = Math.min(1, (fill - startU) / (endU - startU));
    const a = PIPE[i];
    const b = PIPE[i + 1];
    filled.push(<Tube key={i} a={a} b={[a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k]} r={0.075} c={OIL} />);
  }
  // pulso de pressão correndo no cano quando aperta
  const pressing = p > 0.5 && t > T.espreme;
  return (
    <group>
      <group scale={[s, s, s]} position={[px * (1 - s), py * (1 - s), 0]}>
        {/* suporte */}
        <Box a={[px - 0.5, 0.3, pz - 0.3]} b={[px - 0.3, py + 0.3, pz - 0.12]} c={DARK} m={0.4} r={0.5} />
        {/* braço do pedal, pivô em cima */}
        <group position={[px, py, pz]} rotation={[0, 0, -rot]}>
          <Tube a={[0, 0, 0]} b={[0, -1.7, 0]} r={0.06} c="#5b6370" />
          <Box a={[-0.3, -1.85, -0.25]} b={[0.3, -1.7, 0.25]} c="#222" r={0.8} />
          <mesh rotation={[PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.1, 0.1, 0.3, 12]} />
            <Mat c="#8f98a3" m={0.6} r={0.35} />
          </mesh>
        </group>
        {/* haste até o cilindro fininho */}
        <Tube a={[px + Math.sin(rot) * 0.45, py - Math.cos(rot) * 0.45, pz]} b={[-2.15 + p * 0.25, 2.25, pz]} r={0.035} c="#d8d8d8" />
        {/* cilindro mestre (fininho), transparente */}
        <mesh position={[-1.85, 2.25, pz]} rotation={[0, 0, PI / 2]}>
          <cylinderGeometry args={[0.11, 0.11, 0.6, 16, 1, true]} />
          <meshStandardMaterial color="#b8c8de" transparent opacity={0.35} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[-2.1 + p * 0.25, 2.25, pz]} rotation={[0, 0, PI / 2]}>
          <cylinderGeometry args={[0.095, 0.095, 0.12, 14]} />
          <Mat c={fininho > 0 ? new THREE.Color(STEEL).lerp(new THREE.Color("#ffd60a"), fininho).getStyle() : STEEL} m={0.7} r={0.3} />
        </mesh>
        {fill > 0 ? (
          <mesh position={[-1.72 + p * 0.125, 2.25, pz]} rotation={[0, 0, PI / 2]}>
            <cylinderGeometry args={[0.09, 0.09, Math.max(0.05, 0.34 - p * 0.25), 14]} />
            <Mat c={OIL} o={0.9} />
          </mesh>
        ) : null}
      </group>
      {/* cano (vazio) e óleo */}
      {s >= 1 && t > T.oleo
        ? PIPE.slice(1).map((b, i) => {
            const k = appear(t, T.oleo + i * 0.12, 0.3);
            const a = PIPE[i];
            return <Tube key={i} a={a} b={[a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k]} r={0.09} c="#cfd6df" o={0.45} />;
          })
        : null}
      {filled}
      {pressing
        ? Array.from({ length: 10 }).map((_, k) => {
            const u = (t * 1.6 + k / 10) % 1;
            const pos = along(u);
            return (
              <mesh key={k} position={pos}>
                <sphereGeometry args={[0.09, 8, 6]} />
                <Mat c="#fff3c4" e={OIL} ei={1.2} />
              </mesh>
            );
          })
        : null}
      {/* caixa do ABS no meio do cano e sensor com fio */}
      {abs > 0 ? (
        <group>
          <group position={[-1.1, 3.25, 1.15]} scale={[abs, abs, abs]}>
            <Box a={[-0.35, -0.3, -0.3]} b={[0.35, 0.3, 0.3]} c="#2a4d8f" m={0.3} r={0.4} />
            <mesh position={[0, 0.12, 0.31]}>
              <sphereGeometry args={[0.07, 10, 8]} />
              <Mat c="#bfe3ff" e="#3d9bff" ei={0.5 + led * 3} />
            </mesh>
          </group>
          <group position={[0, Y + 0.52, dz + 0.28]} scale={[abs, abs, abs]}>
            <Box a={[-0.09, 0, -0.09]} b={[0.09, 0.32, 0.09]} c="#222" />
            <mesh position={[0, 0.02, 0.1]}>
              <sphereGeometry args={[0.045, 8, 6]} />
              <Mat c="#bfe3ff" e="#3d9bff" ei={0.5 + led * 3} />
            </mesh>
          </group>
          <Tube a={[0, Y + 0.84, dz + 0.28]} b={[0, 3.6, 1.3]} r={0.025} c="#111" />
          <Tube a={[0, 3.6, 1.3]} b={[-0.75, 3.6, 1.3]} r={0.025} c="#111" />
        </group>
      ) : null}
    </group>
  );
};

/** Bloco de madeira que esfrega no pneu (a primeira ideia). */
const Bloco: React.FC<{ t: number }> = ({ t }) => {
  const o = windowed(t, T.ideia + 0.2, T.disco + 0.2, 0.3);
  if (o <= 0) return null;
  const press = windowed(t, T.ideia + 1.1, T.disco - 0.3, 0.3);
  const lift = 0.7 * (1 - press);
  const top = Y + rOut;
  const moving = speed(t) > 0.5 ? 1 : speed(t) / 0.5;
  const hot = press * Math.min(1, Math.max(0, t - T.ideia - 1.2) / 2.5);
  return (
    <group scale={[o, o, o]} position={[0, top * (1 - o), 0]}>
      <Box a={[-0.45, top + lift, -0.35]} b={[0.45, top + lift + 0.4, 0.35]} c={new THREE.Color("#a8743f").lerp(new THREE.Color("#ff5a1f"), hot * 0.6).getStyle()} tex="madeira" e="#ff4a1a" ei={hot * 0.5} />
      <Tube a={[0, top + lift + 0.4, 0]} b={[0, top + lift + 1.4, 0]} r={0.08} c="#8a5a32" />
      <Fumaca t={t} p={[0.3, top, 0]} amount={press * moving} dir={[1.2, 1.0]} n={6} c="#a7a29a" size={0.22} />
    </group>
  );
};

export const FreioScene: React.FC<{ t: number }> = ({ t }) => {
  const skid = locked(t) * Math.min(1, speed(t) / 1.2);
  return (
    <>
      <CameraRig t={t} />
      <Estudio />
      <hemisphereLight args={["#fff6e0", "#3a3f47", 0.4]} />
      <Sol p={[6, 14, 12]} i={2.5} area={10} />
      <directionalLight position={[-10, 5, 8]} intensity={0.4} color="#bcd4ff" />
      <Garage />
      <Esteira t={t} />
      <Roda t={t} />
      <Vento t={t} />
      <Pinca t={t} />
      <Pedal t={t} />
      <Bloco t={t} />
      <Fumaca t={t} p={[-0.2, 0.7, 0]} amount={skid} dir={[-2.2, 1.6]} n={14} size={0.5} c="#eceef2" />
      {heatAt(t) > 0.3 ? <pointLight position={[0.4, Y + 0.6, dz + 0.9]} intensity={8 * (heatAt(t) - 0.3)} distance={4} color="#ff6a1a" /> : null}
      <Guy t={t} plan={PLAN} scale={0.9} />
    </>
  );
};

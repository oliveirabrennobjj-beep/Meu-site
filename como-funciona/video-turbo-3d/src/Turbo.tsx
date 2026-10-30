import React from "react";
import * as THREE from "three";
import { appear, pop, windowed } from "./lib";
import { PLAN, T, boost, engineAngle, hotAir, turboAngle } from "./timeline";
import { Box, CameraRig, Flow, Mat, Tube, V3 } from "./parts";
import { Guy } from "./Guy";
import { Estudio, Sol } from "./realismo";

const PI = Math.PI;
const STEEL = "#c9ced6";
const DARK = "#3d4553";
const AIR = "#6fb6ff";
const SMOKE = "#8d8f94";

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

/** Cano feito de vários trechos retos. */
const Pipe: React.FC<{ path: V3[]; r: number; c: string; o?: number; grow?: number }> = ({ path, r, c, o, grow = 1 }) => {
  const seg = path.slice(1).map((p, i) => new THREE.Vector3(...p).distanceTo(new THREE.Vector3(...path[i])));
  const total = seg.reduce((a, b) => a + b, 0);
  let left = total * grow;
  const out: React.ReactNode[] = [];
  for (let i = 0; i < seg.length && left > 0.001; i++) {
    const k = Math.min(1, left / seg[i]);
    const a = path[i];
    const b = path[i + 1];
    out.push(<Tube key={i} a={a} b={[a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k]} r={r} c={c} o={o} />);
    if (i > 0) {
      out.push(
        <mesh key={`j${i}`} position={a}>
          <sphereGeometry args={[r, 12, 8]} />
          <Mat c={c} o={o} />
        </mesh>,
      );
    }
    left -= seg[i];
  }
  return <>{out}</>;
};

/* ---------- caminhos do ar e da fumaça ---------- */
const XS = [-1.1, -0.37, 0.37, 1.1];
const IN_OLD: V3[] = [[-2.9, 4.0, 0], [-2.2, 4.0, 0], [-2.2, 3.25, 0], [-1.6, 3.25, 0], [1.3, 3.25, 0]];
const IN_NEW: V3[] = [[-2.9, 4.0, 0], [1.62, 4.0, 0]];
const IN_OUT: V3[] = [[1.9, 4.62, 0], [1.9, 5.4, 0], [-2.2, 5.4, 0], [-2.2, 3.25, 0], [-1.6, 3.25, 0], [1.3, 3.25, 0]];
const EX_OLD: V3[] = [[1.6, 2.0, 0], [4.9, 2.0, 0], [4.9, 0.6, 0], [6.4, 0.6, 0]];
const EX_IN: V3[] = [[1.6, 2.0, 0], [3.3, 2.0, 0], [3.3, 3.42, 0]];
const EX_OUT: V3[] = [[3.62, 4.0, 0], [4.9, 4.0, 0], [4.9, 0.6, 0], [6.4, 0.6, 0]];
const BYPASS: V3[] = [[3.3, 2.9, 0], [4.9, 2.9, 0], [4.9, 0.6, 0], [6.4, 0.6, 0]];

/** Roda de pás girando em volta do eixo x. */
const Roda: React.FC<{ x: number; ang: number; c: string; e: string; ei: number }> = ({ x, ang, c, e, ei }) => (
  <group position={[x, 4.0, 0]} rotation={[ang, 0, 0]}>
    <mesh rotation={[0, 0, PI / 2]}>
      <cylinderGeometry args={[0.12, 0.18, 0.34, 12]} />
      <Mat c={c} m={0.7} r={0.3} />
    </mesh>
    {Array.from({ length: 9 }).map((_, k) => (
      <group key={k} rotation={[(k * 2 * PI) / 9, 0, 0]}>
        <mesh position={[0, 0.28, 0]} rotation={[0.45, 0, 0]}>
          <boxGeometry args={[0.3, 0.36, 0.05]} />
          <Mat c={c} m={0.7} r={0.3} e={e} ei={ei} />
        </mesh>
      </group>
    ))}
  </group>
);

/** Caracol transparente em volta de cada roda. */
const Caracol: React.FC<{ x: number; c: string; s: number }> = ({ x, c, s }) => (
  <group position={[x, 4.0, 0]} scale={[s, s, s]}>
    <mesh rotation={[0, 0, PI / 2]}>
      <cylinderGeometry args={[0.58, 0.58, 0.5, 28, 1, true]} />
      <meshStandardMaterial color={c} transparent opacity={0.28} side={THREE.DoubleSide} metalness={0.3} roughness={0.3} />
    </mesh>
    <mesh rotation={[0, PI / 2, 0]}>
      <torusGeometry args={[0.62, 0.12, 8, 28]} />
      <Mat c={c} m={0.6} r={0.35} />
    </mesh>
  </group>
);

const Motor: React.FC<{ t: number }> = ({ t }) => {
  const a = engineAngle(t);
  const b = boost(t);
  const danger = Math.max(0, Math.min(1, (b - 0.9) / 0.2));
  const shake = danger * 0.04;
  const sx = Math.sin(t * 61) * shake;
  const sy = Math.cos(t * 73) * shake;
  return (
    <group position={[sx, sy, 0]}>
      <Box a={[-1.9, 0.3, -1.1]} b={[1.9, 0.9, 1.1]} c={DARK} />
      {/* bloco transparente pra ver os pistões */}
      <mesh position={[0, 1.95, 0]}>
        <boxGeometry args={[3.2, 2.1, 1.8]} />
        <meshStandardMaterial color={danger > 0.1 ? "#ff8a7a" : "#b8c8de"} transparent opacity={0.3} metalness={0.3} roughness={0.4} />
      </mesh>
      <Box a={[-1.65, 2.95, -0.9]} b={[1.65, 3.1, 0.9]} c="#8f98a3" m={0.6} r={0.35} />
      {XS.map((x, k) => {
        const ph = a + k * PI * [0, 1.5, 0.5, 1][k];
        const y = 1.65 + 0.38 * Math.cos(ph);
        const fire = Math.max(0, Math.cos(ph)) ** 12;
        return (
          <group key={k}>
            <mesh position={[x, y, 0]}>
              <cylinderGeometry args={[0.27, 0.27, 0.42, 16]} />
              <Mat c={STEEL} m={0.75} r={0.3} tex="metal" />
            </mesh>
            <Tube a={[x, y - 0.2, 0]} b={[x, 1.0, 0]} r={0.05} c="#7d8590" />
            {fire > 0.05 ? (
              <mesh position={[x, 2.6, 0]} scale={0.18 + 0.18 * (1 + b) * fire}>
                <icosahedronGeometry args={[1, 1]} />
                <Mat c="#ffb02e" o={0.85 * fire} e="#ff6a00" ei={1.5 * fire * (1 + b)} />
              </mesh>
            ) : null}
            <Tube a={[x, 3.1, 0]} b={[x, 3.25, 0]} r={0.09} c="#5b6370" />
          </group>
        );
      })}
    </group>
  );
};

const Fumaca: React.FC<{ t: number; p: V3; n?: number; amount: number; size?: number }> = ({ t, p, n = 7, amount, size = 0.3 }) => {
  if (amount <= 0.02) return null;
  return (
    <>
      {Array.from({ length: n }).map((_, k) => {
        const life = (t * 1.1 + k / n) % 1;
        return (
          <mesh key={k} position={[p[0] + life * 1.8, p[1] + life * 1.2 + Math.sin(k * 5) * 0.12, p[2] + Math.cos(k * 3) * 0.25]} scale={size * (0.5 + life * 1.6)}>
            <icosahedronGeometry args={[1, 0]} />
            <Mat c={SMOKE} o={0.75 * amount * (1 - life)} />
          </mesh>
        );
      })}
    </>
  );
};

export const TurboScene: React.FC<{ t: number }> = ({ t }) => {
  const turbina = pop(t, T.catavento + 0.4, 0.6);
  const compressor = pop(t, T.outro + 1.2, 0.6);
  const eixo = appear(t, T.outro + 0.6, 0.6);
  const viaTurbo = t > T.catavento + 0.5;
  const viaCompressor = t > T.sopra;
  const inter = pop(t, T.radiador + 0.5, 0.6);
  const gate = t > T.portinha + 0.4 ? pop(t, T.portinha + 0.4, 0.5) : 0;
  const gateOpen = appear(t, T.portinha + 1.2, 0.4);
  const b = boost(t);
  const hot = hotAir(t);
  const ang = turboAngle(t);
  const pressureOn = appear(t, T.sopra, 0.5);
  const needle = -2.2 + Math.min(1.25, b) * 3.4;
  const fumacaForte = windowed(t, T.fumaca + 0.2, T.catavento + 0.8, 0.4);
  // cor do ar: azul, laranja quando esquenta, azul de novo depois do intercooler
  const airHot = new THREE.Color(AIR).lerp(new THREE.Color("#ff8a1a"), hot).getStyle();
  const afterCooler = t > T.radiador + 1.0;
  return (
    <>
      <CameraRig t={t} />
      <Estudio />
      <hemisphereLight args={["#fff6e0", "#3a3f47", 0.4]} />
      <Sol p={[6, 14, 12]} i={2.5} area={10} />
      <directionalLight position={[-10, 5, 8]} intensity={0.4} color="#bcd4ff" />
      <Garage />
      <Motor t={t} />

      {/* filtro de ar */}
      <Box a={[-3.6, 3.55, -0.5]} b={[-2.9, 4.45, 0.5]} c="#2a2f38" r={0.6} />
      <Box a={[-3.62, 3.7, -0.35]} b={[-3.58, 4.3, 0.35]} c="#ffd60a" />

      {/* admissão */}
      {!viaCompressor ? (
        <>
          <Pipe path={IN_OLD} r={0.15} c="#2d7dff" o={0.55} />
          <Flow t={t} from={0} path={IN_OLD} n={10} speed={0.55} c={AIR} r={0.08} />
        </>
      ) : (
        <>
          <Pipe path={IN_NEW} r={0.15} c="#2d7dff" o={0.55} />
          <Pipe path={IN_OUT} r={0.17} c="#2d7dff" o={0.55} grow={appear(t, T.sopra - 0.2, 1.0)} />
          <Flow t={t} from={T.sopra} path={IN_NEW} n={14} speed={0.9 + b * 0.5} c={AIR} r={0.08} />
          <Flow t={t} from={T.sopra + 0.8} to={T.radiador + 1.0} path={IN_OUT} n={18} speed={0.6 + b * 0.4} c={airHot} r={0.09} />
          {afterCooler ? (
            <>
              <Flow t={t} from={T.radiador + 1.0} path={IN_OUT.slice(0, 2).concat([[-0.25, 5.4, 0]])} n={6} speed={1.2} c="#ff8a1a" r={0.09} />
              <Flow t={t} from={T.radiador + 1.0} path={([[-0.25, 5.4, 0]] as V3[]).concat(IN_OUT.slice(2))} n={14} speed={0.7 + b * 0.3} c={AIR} r={0.09} />
            </>
          ) : null}
        </>
      )}

      {/* escapamento */}
      {!viaTurbo ? (
        <>
          <Pipe path={EX_OLD} r={0.16} c="#9a4a3a" o={0.6} />
          <Flow t={t} from={0} path={EX_OLD} n={12} speed={0.6 + fumacaForte * 0.4} c={SMOKE} r={0.1 + fumacaForte * 0.04} />
          <Fumaca t={t} p={[6.4, 0.6, 0]} amount={0.5 + fumacaForte * 0.5} size={0.3 + fumacaForte * 0.15} />
        </>
      ) : (
        <>
          <Pipe path={EX_IN} r={0.16} c="#9a4a3a" o={0.6} />
          <Pipe path={EX_OUT} r={0.16} c="#9a4a3a" o={0.6} />
          <Flow t={t} from={T.catavento + 0.5} path={EX_IN} n={9} speed={0.8} c={SMOKE} r={0.1} />
          <Flow t={t} from={T.catavento + 1.0} path={EX_OUT} n={10} speed={0.7 * (1 - gateOpen * 0.4)} c={SMOKE} r={0.1} />
          <Fumaca t={t} p={[6.4, 0.6, 0]} amount={0.6} />
        </>
      )}

      {/* turbo: turbina (fumaça), eixo e compressor (ar) */}
      {turbina > 0 ? (
        <>
          <Caracol x={3.3} c="#e0602a" s={turbina} />
          <group scale={[turbina, turbina, turbina]} position={[3.3 * (1 - turbina), 4.0 * (1 - turbina), 0]}>
            <Roda x={3.3} ang={-ang} c="#c9ced6" e="#ff6a1a" ei={0.25 + 0.35 * Math.min(1, b)} />
          </group>
        </>
      ) : null}
      {eixo > 0 ? (
        <>
          <Tube a={[3.3, 4.0, 0]} b={[3.3 - 1.4 * eixo, 4.0, 0]} r={0.06} c="#ffd60a" />
          <mesh position={[2.6, 4.0, 0]} rotation={[0, 0, PI / 2]} scale={[eixo, 1, eixo]}>
            <cylinderGeometry args={[0.24, 0.24, 0.7, 16]} />
            <Mat c="#5b6370" m={0.6} r={0.35} />
          </mesh>
        </>
      ) : null}
      {compressor > 0 ? (
        <>
          <Caracol x={1.9} c="#2d7dff" s={compressor} />
          <group scale={[compressor, compressor, compressor]} position={[1.9 * (1 - compressor), 4.0 * (1 - compressor), 0]}>
            <Roda x={1.9} ang={-ang} c="#d8dde4" e="#2d7dff" ei={0.15} />
          </group>
        </>
      ) : null}

      {/* intercooler */}
      {inter > 0 ? (
        <group position={[-0.25, 5.4, 0]} scale={[inter, inter, inter]}>
          <Box a={[-1.0, -0.38, -0.55]} b={[1.0, 0.38, 0.55]} c="#8f98a3" m={0.6} r={0.35} />
          {Array.from({ length: 11 }).map((_, k) => (
            <Box key={k} a={[-0.95 + k * 0.18, -0.36, 0.56]} b={[-0.9 + k * 0.18, 0.36, 0.6]} c="#3a3f47" />
          ))}
        </group>
      ) : null}
      {/* ar fresco batendo no intercooler */}
      {inter > 0.9 ? <Flow t={t} from={T.radiador + 1.0} path={[[-0.25, 6.4, 1.6], [-0.25, 5.4, 0.6]]} n={8} speed={1.2} c="#bfe3ff" r={0.06} /> : null}

      {/* wastegate */}
      {gate > 0 ? (
        <group scale={[gate, gate, gate]} position={[3.3 * (1 - gate), 2.9 * (1 - gate), 0]}>
          <Pipe path={BYPASS.slice(0, 2)} r={0.12} c="#c8322b" o={0.7} />
          <group position={[3.55, 2.9, 0]} rotation={[0, 0, -gateOpen * 1.2]}>
            <Box a={[-0.02, -0.15, -0.15]} b={[0.04, 0.15, 0.15]} c="#ffd60a" />
          </group>
        </group>
      ) : null}
      {gateOpen > 0.5 ? <Flow t={t} from={T.portinha + 1.3} path={BYPASS} n={8} speed={0.9} c={SMOKE} r={0.09} /> : null}

      {/* manômetro */}
      {pressureOn > 0 ? (
        <group position={[0, 3.75, 0.95]} scale={[pressureOn, pressureOn, pressureOn]}>
          <mesh rotation={[PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.34, 0.34, 0.08, 24]} />
            <Mat c="#f2f2f2" />
          </mesh>
          <mesh rotation={[PI / 2, 0, 0]} position={[0, 0, 0.045]}>
            <torusGeometry args={[0.34, 0.04, 6, 24]} />
            <Mat c="#3a3f47" />
          </mesh>
          <group position={[0, 0, 0.06]} rotation={[0, 0, -needle]}>
            <Box a={[-0.02, 0, -0.01]} b={[0.02, 0.27, 0.01]} c={b > 0.95 ? "#ff3b3b" : "#111"} />
          </group>
          <Box a={[0.12, 0.12, 0.045]} b={[0.3, 0.17, 0.05]} c="#ff3b3b" />
        </group>
      ) : null}

      <Guy t={t} plan={PLAN} scale={0.9} />
    </>
  );
};

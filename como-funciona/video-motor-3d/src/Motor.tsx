import React from "react";
import * as THREE from "three";
import { appear, pop } from "./lib";
import { M, PLAN, T, phase, pistonPin, theta } from "./timeline";
import { Box, CameraRig, Flow, Mat, Tube, V3 } from "./parts";
import { Guy } from "./Guy";

const PI = Math.PI;
const { yc, r, bore, cylBot, head, gap } = M;
const zOf = (i: number) => -i * gap;
const STEEL = "#c9ced6";
const DARK = "#5b6370";

const Garage: React.FC = () => (
  <>
    <Box a={[-16, 0, -10]} b={[16, 0.3, 6]} c="#8a8d93" />
    {[-6, -2, 2].map((z) => (
      <Box key={z} a={[-16, 0.3, z]} b={[16, 0.31, z + 0.06]} c="#7a7d83" />
    ))}
    <Box a={[-16, 0.3, -10]} b={[16, 10, -9.6]} c="#4b5566" />
    <Box a={[-16, 0.3, -9.6]} b={[16, 1.3, -9.5]} c="#3d4553" />
    {/* bancada e painel de ferramentas */}
    <Box a={[-8, 0.3, -9.5]} b={[-3.5, 1.8, -8.2]} c="#8a5a32" />
    <Box a={[-8.1, 1.8, -9.6]} b={[-3.4, 1.95, -8.1]} c="#a8743f" />
    <Box a={[-7.6, 2.6, -9.58]} b={[-3.9, 4.8, -9.5]} c="#c9b48a" />
    {[-7, -6, -5, -4.5].map((x, k) => (
      <Box key={x} a={[x, 3.0 + (k % 2) * 0.5, -9.5]} b={[x + 0.15, 4.1 + (k % 2) * 0.3, -9.42]} c={["#e04a3a", "#8f98a3", "#2d7dff", "#8f98a3"][k]} />
    ))}
    {/* pneus encostados */}
    {[5.5, 7.2].map((x) => (
      <mesh key={x} position={[x, 1.1, -9]} castShadow>
        <torusGeometry args={[0.6, 0.26, 8, 18]} />
        <Mat c="#1f1f22" />
      </mesh>
    ))}
    {/* base do motor */}
    <Box a={[-1.3, 0.3, -6.4]} b={[1.3, 0.55, 1.0]} c="#3d4553" />
  </>
);

/** Partículas de fumaça que saem do escapamento e somem. */
const Fumaca: React.FC<{ t: number; p: V3; on: boolean; n?: number }> = ({ t, p, on, n = 6 }) => {
  if (!on) return null;
  return (
    <>
      {Array.from({ length: n }).map((_, k) => {
        const life = (t * 1.1 + k / n) % 1;
        return (
          <mesh key={k} position={[p[0] + life * 1.6, p[1] + life * 1.4 + Math.sin(k * 5) * 0.15, p[2] + Math.cos(k * 3) * 0.2]} scale={0.18 + life * 0.45}>
            <icosahedronGeometry args={[1, 0]} />
            <Mat c="#8d8f94" o={0.75 * (1 - life)} />
          </mesh>
        );
      })}
    </>
  );
};

/** Força da explosão (0 a 1) no cilindro i. */
const flashOf = (t: number, i: number) => {
  if (i === 0 && t > T.bum && t < T.pistao) return Math.max(0, 1 - (t - T.bum) / 0.9);
  if (t < T.pistao + 0.8) return 0;
  if (t < T.virabrequim) {
    const a = (((t - T.pistao - 0.8) * 4.2) % (2 * PI)) / 0.9;
    return Math.max(0, 1 - a);
  }
  const ph = phase(t, i);
  return ph >= 2 * PI && ph < 2 * PI + 1.1 ? 1 - (ph - 2 * PI) / 1.1 : 0;
};

/** Um cilindro em corte: paredes, pistão, biela, manivela, cabeçote, válvulas e vela. */
const Cilindro: React.FC<{ t: number; i: number }> = ({ t, i }) => {
  const z = zOf(i);
  const s = i === 0 ? pop(t, T.tubo, 0.6) : pop(t, T.cilindros + 0.3 + i * 0.35, 0.6);
  if (s <= 0) return null;
  const tuboFase = i === 0 && t < T.pistao;
  const pistao = i === 0 ? appear(t, T.pistao + 0.2, 0.8) : 1;
  const cabecote = i === 0 ? pop(t, T.pistao, 0.6) : 1;
  const crank = i === 0 ? pop(t, T.virabrequim, 0.6) : 1;
  const valv = i === 0 ? pop(t, T.valvulas + 0.3, 0.6) : 1;
  const a = theta(t) - [0, 3, 1, 2][i] * PI;
  const pin = pistonPin(t, i) - (1 - pistao) * 2.2;
  const pTop = pin + 0.35;
  const crankPin: V3 = [r * Math.sin(a), yc + r * Math.cos(a), z];
  const flash = flashOf(t, i);
  const ph = phase(t, i);
  const quatroTempos = t > T.valvulas;

  // cor do gás dentro da câmara
  let gas: { c: string; o: number } | null = null;
  if (quatroTempos && !tuboFase) {
    if (ph < PI) gas = { c: "#6fb6ff", o: 0.35 * Math.sin(ph / 2) + 0.05 };
    else if (ph < 2 * PI) gas = { c: "#3f8ef0", o: 0.35 + 0.35 * ((ph - PI) / PI) };
    else if (ph < 3 * PI) gas = { c: new THREE.Color("#ff8a1a").lerp(new THREE.Color("#8d8f94"), (ph - 2 * PI) / PI).getStyle(), o: 0.75 - 0.25 * ((ph - 2 * PI) / PI) };
    else gas = { c: "#8d8f94", o: 0.5 * (1 - (ph - 3 * PI) / PI) };
  }
  const intakeOpen = quatroTempos && ph < PI ? Math.sin(ph) : 0;
  const exhaustOpen = quatroTempos && ph > 3 * PI ? Math.sin(ph - 3 * PI) : 0;
  const spark = quatroTempos && (ph > 2 * PI - 0.12 && ph < 2 * PI + 0.35);
  const top = tuboFase ? head : head;

  // tampa voando
  const dv = Math.max(0, t - T.bum);
  const lidPos: V3 = [dv * 2.4, head + 0.08 + dv * 9 - dv * dv * 3, z];

  return (
    <group position={[0, 0, z]} scale={[s, s, s]}>
      <group position={[0, 0, -z]}>
        {/* paredes transparentes */}
        <mesh position={[0, (cylBot + top) / 2, z]}>
          <cylinderGeometry args={[bore + 0.06, bore + 0.06, top - cylBot, 20, 1, true]} />
          <meshStandardMaterial color="#b8c8de" transparent opacity={0.22} side={THREE.DoubleSide} flatShading />
        </mesh>
        {[cylBot, top].map((y) => (
          <mesh key={y} position={[0, y, z]} rotation={[PI / 2, 0, 0]}>
            <torusGeometry args={[bore + 0.06, 0.05, 6, 24]} />
            <Mat c="#8f98a3" />
          </mesh>
        ))}
        {/* fase do tubo: fundo fechado, combustível, faísca e tampa */}
        {tuboFase ? (
          <>
            <mesh position={[0, cylBot, z]}>
              <cylinderGeometry args={[bore + 0.06, bore + 0.06, 0.08, 20]} />
              <Mat c="#8f98a3" />
            </mesh>
            {t > T.combustivel && t < T.bum + 0.2 ? (
              <>
                <mesh position={[0, cylBot + 0.06 + 0.06 * appear(t, T.combustivel + 0.5, 1), z]}>
                  <cylinderGeometry args={[bore - 0.02, bore - 0.02, 0.04 + 0.12 * appear(t, T.combustivel + 0.5, 1), 20]} />
                  <Mat c="#f2c94c" o={0.85} e="#f2c94c" ei={0.2} />
                </mesh>
                {Array.from({ length: 5 }).map((_, k) => {
                  const life = ((t - T.combustivel) * 1.4 + k / 5) % 1;
                  if (t - T.combustivel > 1.6) return null;
                  return (
                    <mesh key={k} position={[Math.sin(k * 2.3) * 0.2, head - 0.1 - life * (head - cylBot - 0.2), z]}>
                      <sphereGeometry args={[0.07, 8, 6]} />
                      <Mat c="#f2c94c" e="#f2c94c" ei={0.3} />
                    </mesh>
                  );
                })}
              </>
            ) : null}
            {t > T.faisca && t < T.bum
              ? Array.from({ length: 6 }).map((_, k) => (
                  <mesh key={k} position={[0.25 + Math.sin(t * 40 + k * 2) * 0.12, cylBot + 0.35 + Math.cos(t * 33 + k) * 0.12, z + 0.1]}>
                    <icosahedronGeometry args={[0.05, 0]} />
                    <Mat c="#bfe3ff" e="#6fc3ff" ei={2} />
                  </mesh>
                ))
              : null}
            {t < T.pistao ? (
              <mesh position={t < T.bum ? [0, head + 0.08, z] : lidPos} rotation={[dv * 6, 0, dv * 4]}>
                <cylinderGeometry args={[bore + 0.12, bore + 0.12, 0.16, 20]} />
                <Mat c="#e04a3a" />
              </mesh>
            ) : null}
          </>
        ) : null}
        {/* explosão */}
        {flash > 0 ? (
          <>
            <mesh position={[0, tuboFase ? cylBot + 0.6 : (pTop + head) / 2, z]} scale={tuboFase ? 0.4 + (1 - flash) * 1.4 : 1}>
              {tuboFase ? <icosahedronGeometry args={[0.6, 1]} /> : <cylinderGeometry args={[bore - 0.02, bore - 0.02, Math.max(0.05, head - pTop), 20]} />}
              <Mat c="#ffb02e" o={0.9 * flash} e="#ff6a00" ei={1.5 * flash} />
            </mesh>
            <pointLight position={[0, head - 0.4, z + 1.2]} intensity={40 * flash} distance={6} color="#ff8a1a" />
          </>
        ) : null}
        {/* gás dos 4 tempos */}
        {gas && flash < 0.6 ? (
          <mesh position={[0, (pTop + head) / 2, z]}>
            <cylinderGeometry args={[bore - 0.03, bore - 0.03, Math.max(0.05, head - pTop - 0.01), 20]} />
            <Mat c={gas.c} o={gas.o} />
          </mesh>
        ) : null}
        {/* pistão */}
        {!tuboFase && pistao > 0 ? (
          <>
            <mesh position={[0, pin + 0.1, z]} castShadow>
              <cylinderGeometry args={[bore - 0.02, bore - 0.02, 0.5, 20]} />
              <Mat c={STEEL} />
            </mesh>
            {[0.22, 0.08].map((dy) => (
              <mesh key={dy} position={[0, pin + 0.1 + dy, z]} rotation={[PI / 2, 0, 0]}>
                <torusGeometry args={[bore - 0.02, 0.025, 4, 20]} />
                <Mat c="#3a3f47" />
              </mesh>
            ))}
          </>
        ) : null}
        {/* biela e manivela */}
        {crank > 0 && t > T.virabrequim ? (
          <group scale={[1, 1, crank]}>
            <Tube a={[crankPin[0], crankPin[1], z + 0.25]} b={[0, pin, z + 0.25]} r={0.1} c="#7d8590" />
            <Tube a={[0, yc, z + 0.12]} b={[crankPin[0], crankPin[1], z + 0.12]} r={0.17} c={DARK} />
            <Tube a={[0, yc, z + 0.12]} b={[-crankPin[0] * 0.8, yc - (crankPin[1] - yc) * 0.8, z + 0.12]} r={0.26} c={DARK} />
            <mesh position={[crankPin[0], crankPin[1], z + 0.25]} rotation={[PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.13, 0.13, 0.3, 10]} />
              <Mat c="#ffd60a" />
            </mesh>
          </group>
        ) : null}
        {/* cabeçote cortado (só a metade de trás) */}
        {cabecote > 0 && !tuboFase ? (
          <group position={[0, head, z]} scale={[1, cabecote, 1]}>
            <Box a={[-0.8, 0, -0.75]} b={[0.8, 0.5, 0.0]} c="#8f98a3" />
            <Box a={[-0.8, 0, 0.0]} b={[-0.45, 0.5, 0.35]} c="#a5adb8" />
            <Box a={[0.45, 0, 0.0]} b={[0.8, 0.5, 0.35]} c="#a5adb8" />
          </group>
        ) : null}
        {/* válvulas, vela e canos */}
        {valv > 0 && !tuboFase ? (
          <group position={[0, head, z]} scale={[valv, valv, valv]}>
            {[
              { x: -0.28, open: intakeOpen, c: "#2d7dff" },
              { x: 0.28, open: exhaustOpen, c: "#e04a3a" },
            ].map((v) => (
              <group key={v.x} position={[v.x, -v.open * 0.2, 0.2]}>
                <mesh position={[0, -0.02, 0]}>
                  <cylinderGeometry args={[0.17, 0.12, 0.06, 14]} />
                  <Mat c={v.c} />
                </mesh>
                <Tube a={[0, 0, 0]} b={[0, 0.85, 0]} r={0.035} c="#d8d8d8" />
              </group>
            ))}
            <Tube a={[0, 0.0, 0.2]} b={[0, 0.85, 0.2]} r={0.08} c="#f2f2f2" />
            <mesh position={[0, 0.35, 0.2]}>
              <cylinderGeometry args={[0.13, 0.13, 0.14, 6]} />
              <Mat c="#8f98a3" />
            </mesh>
            {spark ? (
              <mesh position={[0, -0.04, 0.2]}>
                <icosahedronGeometry args={[0.12, 0]} />
                <Mat c="#e8f6ff" e="#6fc3ff" ei={3} />
              </mesh>
            ) : null}
            {/* admissão (azul) e escapamento (vermelho) */}
            <Tube a={[-0.75, 0.25, -0.2]} b={[-1.7, 0.25, -0.2]} r={0.17} c="#2d7dff" />
            <Tube a={[0.75, 0.25, -0.2]} b={[1.7, 0.25, -0.2]} r={0.17} c="#9a4a3a" />
          </group>
        ) : null}
        {/* mistura entrando e fumaça saindo */}
        {intakeOpen > 0.05 && valv >= 1 ? (
          <Flow t={t} from={0} path={[[-1.7, head + 0.25, z + 0.1], [-0.28, head + 0.25, z + 0.2], [-0.28, head - 0.3, z + 0.2]]} c="#8fc7ff" n={9} speed={0.9} r={0.08} />
        ) : null}
        <Fumaca t={t} p={[1.75, head + 0.25, z - 0.2]} on={valv >= 1 && t > T.valvulas && (exhaustOpen > 0.05 || t > T.cilindros)} n={i === 0 ? 6 : 3} />
      </group>
    </group>
  );
};

/** Pneu do carro ligado ao virabrequim por uma correia. */
const Roda: React.FC<{ t: number }> = ({ t }) => {
  const s = pop(t, T.roda, 0.6) * (1 - appear(t, T.cilindros, 0.5));
  if (s <= 0) return null;
  const [tx, ty] = M.tire;
  const belt = appear(t, T.virabrequim + 0.6, 0.6);
  const ang = -theta(t);
  return (
    <>
      <group position={M.tire} scale={[s, s, s]}>
        <group rotation={[0, 0, ang]}>
          <mesh castShadow>
            <torusGeometry args={[0.72, 0.3, 10, 22]} />
            <Mat c="#1f1f22" />
          </mesh>
          <mesh rotation={[PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.5, 0.5, 0.3, 16]} />
            <Mat c="#b8bec8" />
          </mesh>
          {[0, 1, 2, 3, 4].map((k) => (
            <mesh key={k} rotation={[0, 0, (k * 2 * PI) / 5]} position={[0, 0, 0.17]}>
              <boxGeometry args={[0.1, 0.85, 0.05]} />
              <Mat c="#5b6370" />
            </mesh>
          ))}
        </group>
        <Box a={[-0.12, -(ty - 0.3), -0.25]} b={[0.12, -0.6, 0.25]} c="#3d4553" />
      </group>
      {belt > 0 && t < T.cilindros + 0.5 ? (
        <>
          {[0, tx].map((x) => (
            <mesh key={x} position={[x, yc, 0.75]} rotation={[PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.36, 0.36, 0.14, 14]} />
              <Mat c="#8f98a3" />
            </mesh>
          ))}
          <Tube a={[0, yc + 0.37, 0.75]} b={[tx * belt, yc + 0.37, 0.75]} r={0.05} c="#222" />
          <Tube a={[0, yc - 0.37, 0.75]} b={[tx * belt, yc - 0.37, 0.75]} r={0.05} c="#222" />
          <Tube a={[0, yc, 0.75]} b={[0, yc, 0.2]} r={0.12} c={DARK} />
        </>
      ) : null}
    </>
  );
};

/** Volante: disco pesado no fim do virabrequim. */
const Volante: React.FC<{ t: number }> = ({ t }) => {
  const s = pop(t, T.volante, 0.7);
  if (s <= 0) return null;
  const vz = -0.9 - appear(t, T.cilindros, 1.2) * 3 * gap;
  return (
    <>
      <Tube a={[0, yc, 0.2]} b={[0, yc, vz]} r={0.12} c={DARK} />
      <group position={[0, yc, vz]} rotation={[0, 0, -theta(t)]} scale={[s, s, s]}>
        <mesh rotation={[PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[1.05, 1.05, 0.28, 24]} />
          <Mat c="#3a3f47" />
        </mesh>
        <mesh>
          <torusGeometry args={[1.05, 0.07, 6, 30]} />
          <Mat c="#8f98a3" />
        </mesh>
        <Box a={[-0.12, 0.55, 0.14]} b={[0.12, 0.98, 0.17]} c="#ffd60a" />
      </group>
    </>
  );
};

export const MotorScene: React.FC<{ t: number }> = ({ t }) => (
  <>
    <CameraRig t={t} />
    <hemisphereLight args={["#fff6e0", "#3a3f47", 1.15]} />
    <directionalLight position={[6, 14, 12]} intensity={2.1} castShadow />
    <directionalLight position={[-10, 5, 8]} intensity={0.55} color="#bcd4ff" />
    <Garage />
    {[0, 1, 2, 3].map((i) => (
      <Cilindro key={i} t={t} i={i} />
    ))}
    {/* eixo do virabrequim ligando os 4 cilindros */}
    {t > T.cilindros + 0.3 ? <Tube a={[0, yc, 0.2]} b={[0, yc, -3 * gap * appear(t, T.cilindros + 0.3, 1.2) - 0.2]} r={0.12} c={DARK} /> : null}
    <Roda t={t} />
    <Volante t={t} />
    <Guy t={t} plan={PLAN} scale={0.9} />
  </>
);

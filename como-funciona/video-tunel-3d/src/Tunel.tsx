import React from "react";
import { appear, pop, windowed } from "./lib";
import { PLAN, R, T, X_P, Y_T, Z_T, aneisAte, chuva, desabou, fumaca, furoAte, manta, tbmX, ventOn } from "./timeline";
import { Box, CameraRig, Flow, Mat } from "./parts";
import { Guy } from "./Guy";
import { Estudio, Sol } from "./realismo";

const PI = Math.PI;
const AGUA = "#4fb4ff";
const AMARELO = "#f2b705";
const CONC = "#c9c6bd";
const rnd = (k: number) => {
  const x = Math.sin(k * 127.1) * 43758.5453;
  return x - Math.floor(x);
};

// morro = cilindro deitado (eixo z), corte na frente transparente
const MR = 9;
const MY = -3.5;

const Morro: React.FC = () => (
  <>
    <Box a={[-60, -0.15, -14]} b={[60, 0, 0.62]} c="#7cc35a" tex="grama" rep={[24, 4]} r={0.95} />
    <Box a={[-60, -0.15, 0.62]} b={[60, 0, 60]} c="#7cc35a" tex="grama" rep={[24, 20]} r={0.95} />
    {/* estrada chegando nas bocas */}
    <Box a={[-30, 0, Z_T - 0.8]} b={[-X_P + 0.2, 0.05, Z_T + 0.8]} c="#4a4d52" tex="asfalto" rep={[8, 1]} />
    <Box a={[X_P - 0.2, 0, Z_T - 0.8]} b={[30, 0.05, Z_T + 0.8]} c="#4a4d52" tex="asfalto" rep={[8, 1]} />
    {/* fundo do morro (opaco) */}
    <mesh position={[0, MY, -3.1]} rotation={[PI / 2, 0, 0]} receiveShadow>
      <cylinderGeometry args={[MR, MR, 2.0, 64]} />
      <Mat c="#8a5a32" tex="terra" rep={[6, 3]} r={0.95} />
    </mesh>
    {/* capa de grama no topo */}
    <mesh position={[0, MY, -0.7]} rotation={[PI / 2, 0, 0]}>
      <cylinderGeometry args={[MR + 0.12, MR + 0.12, 2.8, 64, 1, true, -1.0, 2.0]} />
      <Mat c="#6fb24f" r={0.95} />
    </mesh>
    {/* frente cortada (transparente) */}
    <mesh position={[0, MY, -0.75]} rotation={[PI / 2, 0, 0]}>
      <cylinderGeometry args={[MR, MR, 2.7, 64]} />
      <meshStandardMaterial color="#9a6a3c" transparent opacity={0.32} roughness={0.95} depthWrite={false} />
    </mesh>
  </>
);

/** Buraco: tubo escuro do começo até `ate`. */
const Furo: React.FC<{ ate: number }> = ({ ate }) => {
  const x0 = -X_P - 0.3;
  const len = ate - x0;
  if (len <= 0.05) return null;
  return (
    <mesh position={[x0 + len / 2, Y_T, Z_T]} rotation={[0, 0, PI / 2]}>
      <cylinderGeometry args={[R, R, len, 32, 1, true, PI / 2, PI]} />
      <meshStandardMaterial color="#2a1d14" side={2} roughness={1} />
    </mesh>
  );
};

const Tatuzao: React.FC<{ t: number }> = ({ t }) => {
  const x = tbmX(t);
  if (x < -X_P - 3.9 || x > X_P + 4.4) return null;
  const spin = (t - T.maquina) * 3.5;
  const glow = windowed(t, T.tatuzao, T.aneis, 0.3);
  return (
    <group position={[x, Y_T, Z_T]}>
      {/* corpo */}
      <mesh position={[-1.7, 0, 0]} rotation={[0, 0, PI / 2]} castShadow>
        <cylinderGeometry args={[R - 0.08, R - 0.08, 3.2, 32]} />
        <Mat c={AMARELO} m={0.4} r={0.45} e={AMARELO} ei={glow * 0.3} />
      </mesh>
      {/* faixas pretas */}
      {[-0.6, -2.8].map((dx) => (
        <mesh key={dx} position={[dx, 0, 0]} rotation={[0, 0, PI / 2]}>
          <cylinderGeometry args={[R - 0.05, R - 0.05, 0.14, 32]} />
          <Mat c="#222" />
        </mesh>
      ))}
      {/* roda de lâminas */}
      <group position={[0.05, 0, 0]} rotation={[spin, 0, 0]}>
        <mesh rotation={[0, 0, PI / 2]}>
          <cylinderGeometry args={[R - 0.02, R - 0.02, 0.16, 32]} />
          <Mat c="#5b6370" m={0.7} r={0.3} />
        </mesh>
        {Array.from({ length: 6 }).map((_, k) => (
          <group key={k} rotation={[(k * PI) / 3, 0, 0]}>
            <Box a={[0.06, -0.08, 0.1]} b={[0.2, 0.08, R - 0.1]} c="#c9ced6" m={0.8} r={0.25} />
          </group>
        ))}
        <mesh position={[0.14, 0, 0]} rotation={[0, 0, -PI / 2]}>
          <coneGeometry args={[0.28, 0.3, 16]} />
          <Mat c="#c9ced6" m={0.8} r={0.25} />
        </mesh>
      </group>
      {/* pedrinhas saindo da frente */}
      {Array.from({ length: 8 }).map((_, k) => {
        const life = (t * 1.6 + k / 8) % 1;
        return (
          <mesh key={k} position={[0.3 - life * 2.5, -R + 0.3 + (1 - life) * 0.6 * rnd(k), (rnd(k + 3) - 0.5) * 1.4]}>
            <dodecahedronGeometry args={[0.08 + rnd(k) * 0.06, 0]} />
            <Mat c="#6b4a2e" />
          </mesh>
        );
      })}
    </group>
  );
};

/** Anéis de concreto (revestimento), cada um com juntas marcadas. */
const Aneis: React.FC<{ t: number }> = ({ t }) => {
  const ate = aneisAte(t);
  const out: React.ReactNode[] = [];
  const m = manta(t);
  for (let k = 0; k < 40; k++) {
    const x = -X_P - 0.2 + k * 0.4;
    if (x + 0.38 > ate) break;
    out.push(
      <mesh key={k} position={[x + 0.19, Y_T, Z_T]} rotation={[0, 0, PI / 2]}>
        <cylinderGeometry args={[R - 0.02, R - 0.02, 0.36, 28, 1, true, PI / 2, PI]} />
        <meshStandardMaterial color={k % 2 ? CONC : "#b9b5ab"} side={2} roughness={0.85} />
      </mesh>,
    );
  }
  if (!out.length) return null;
  const len = ate + X_P + 0.2;
  return (
    <>
      {out}
      {/* estrada dentro */}
      <Box a={[-X_P - 0.2, Y_T - R + 0.12, Z_T - 0.78]} b={[-X_P - 0.2 + len, Y_T - R + 0.32, Z_T + 0.78]} c="#4a4d52" />
      {/* manta impermeável por trás do concreto */}
      {m > 0 ? (
        <mesh position={[0, Y_T, Z_T]} rotation={[0, 0, PI / 2]}>
          <cylinderGeometry args={[R + 0.07, R + 0.07, 2 * X_P + 0.4, 32, 1, true, PI / 2, PI]} />
          <meshStandardMaterial color={AGUA} transparent opacity={0.45 * m} side={2} emissive={AGUA} emissiveIntensity={0.25 * m} depthWrite={false} />
        </mesh>
      ) : null}
    </>
  );
};

/** Carros andando no túnel. */
const Carros: React.FC<{ t: number }> = ({ t }) => {
  if (t < T.fumaca) return null;
  const s = appear(t, T.fumaca, 0.5);
  return (
    <>
      {[0, 1, 2].map((k) => {
        const x = -X_P - 1 + ((t - T.fumaca) * 2.6 + k * 5) % (2 * X_P + 2);
        const c = ["#d14b2a", "#2d7dff", "#e8e4d0"][k];
        return (
          <group key={k} position={[x, Y_T - R + 0.32, Z_T + (k % 2 ? 0.35 : -0.35)]} scale={[s, s, s]}>
            <Box a={[-0.55, 0.08, -0.26]} b={[0.55, 0.42, 0.26]} c={c} m={0.3} r={0.4} />
            <Box a={[-0.3, 0.42, -0.22]} b={[0.25, 0.66, 0.22]} c={c} m={0.3} r={0.4} />
            <Box a={[0.26, 0.44, -0.2]} b={[0.3, 0.62, 0.2]} c="#9fd3ff" />
          </group>
        );
      })}
    </>
  );
};

const Fumaca: React.FC<{ t: number }> = ({ t }) => {
  const f = fumaca(t);
  if (f <= 0) return null;
  const vento = ventOn(t) ? (t - T.ventiladores - 0.8) * 2.2 : 0;
  return (
    <>
      {Array.from({ length: 26 }).map((_, k) => {
        const base = -X_P + rnd(k) * 2 * X_P;
        const x = base + vento + Math.sin(t * 0.7 + k) * 0.2;
        if (x > X_P + 1.5) return null;
        const y = Y_T + 0.2 + rnd(k + 9) * 0.7;
        return (
          <mesh key={k} position={[x, y, Z_T + (rnd(k + 4) - 0.5) * 1.2]}>
            <sphereGeometry args={[0.3 + rnd(k + 2) * 0.25, 10, 8]} />
            <Mat c="#6b6f76" o={0.55 * f} />
          </mesh>
        );
      })}
    </>
  );
};

const Ventiladores: React.FC<{ t: number }> = ({ t }) => {
  const s = pop(t, T.ventiladores + 0.4, 0.5);
  if (s <= 0) return null;
  const spin = ventOn(t) ? (t - T.ventiladores) * 18 : 0;
  const glow = windowed(t, T.ventilacao, T.agua, 0.3);
  return (
    <>
      {[-4.2, 0, 4.2].map((x) => (
        <group key={x} position={[x, Y_T + R - 0.42, Z_T]} scale={[s, s, s]}>
          <mesh rotation={[0, 0, PI / 2]}>
            <cylinderGeometry args={[0.28, 0.28, 1.1, 20, 1, true]} />
            <meshStandardMaterial color="#8f98a3" metalness={0.6} roughness={0.35} side={2} emissive="#ffd60a" emissiveIntensity={glow * 0.4} />
          </mesh>
          <group rotation={[spin, 0, 0]}>
            {[0, 1, 2, 3].map((k) => (
              <group key={k} rotation={[(k * PI) / 2, 0, 0]}>
                <Box a={[-0.03, 0, -0.06]} b={[0.03, 0.25, 0.06]} c="#3a3f47" />
              </group>
            ))}
          </group>
          <Box a={[-0.05, 0.25, -0.05]} b={[0.05, 0.42, 0.05]} c="#3a3f47" />
        </group>
      ))}
    </>
  );
};

const Chuva: React.FC<{ t: number }> = ({ t }) => {
  const c = chuva(t);
  if (c <= 0) return null;
  const pingaDentro = t < T.manta + 0.8;
  return (
    <>
      {Array.from({ length: 40 }).map((_, k) => {
        const x = -6 + rnd(k) * 12;
        const top = Math.sqrt(Math.max(0, MR * MR - x * x)) + MY;
        const life = (t * 1.3 + rnd(k + 5)) % 1;
        const y = top + 3.5 - life * 3.5;
        return (
          <mesh key={k} position={[x, y, Z_T + (rnd(k + 1) - 0.5) * 2]}>
            <cylinderGeometry args={[0.025, 0.025, 0.3, 4]} />
            <Mat c={AGUA} o={0.8 * c} />
          </mesh>
        );
      })}
      {/* água escorrendo por dentro do morro até o túnel */}
      {pingaDentro
        ? [-3, -1, 1.5, 3.5].map((x, k) => {
            const life = (t * 0.9 + k / 4) % 1;
            return (
              <mesh key={k} position={[x, Y_T + R - 0.1 - life * (2 * R - 0.4), Z_T + 0.3]}>
                <sphereGeometry args={[0.09, 8, 6]} />
                <Mat c={AGUA} e={AGUA} ei={0.4} o={c} />
              </mesh>
            );
          })
        : null}
    </>
  );
};

/** Terra que desaba dentro do buraco no começo. */
const Desabou: React.FC<{ t: number }> = ({ t }) => {
  const d = desabou(t);
  if (d <= 0 || t > T.maquina + 2.5) return null;
  const limpa = tbmX(t);
  return (
    <>
      {Array.from({ length: 30 }).map((_, k) => {
        const x = -X_P + 0.3 + (k / 30) * (2 * X_P - 0.6);
        if (x < limpa) return null;
        const yEnd = Y_T - R + 0.3 + rnd(k) * 1.2;
        const y = Y_T + R + 0.6 - (Y_T + R + 0.6 - yEnd) * d;
        return (
          <mesh key={k} position={[x, y, Z_T + (rnd(k + 2) - 0.5) * 1.2]} rotation={[rnd(k) * 3, rnd(k + 1) * 3, 0]}>
            <dodecahedronGeometry args={[0.35 + rnd(k + 3) * 0.25, 0]} />
            <Mat c={["#8a5a32", "#6b4a2e", "#7d6a55"][k % 3]} r={0.95} />
          </mesh>
        );
      })}
    </>
  );
};

export const TunelScene: React.FC<{ t: number }> = ({ t }) => {
  const furo = Math.max(furoAte(t), Math.min(X_P + 0.3, tbmX(t)));
  const dreno = appear(t, T.canaletas + 0.3, 0.6);
  return (
    <>
      <CameraRig t={t} />
      <Estudio />
      <hemisphereLight args={["#e8f4ff", "#5b4a3a", 0.5]} />
      <Sol p={[8, 22, 14]} i={2.6} area={22} />
      <directionalLight position={[-12, 6, 10]} intensity={0.4} color="#bcd4ff" />
      <Morro />
      <Furo ate={furo} />
      <Desabou t={t} />
      <Aneis t={t} />
      <Tatuzao t={t} />
      <Carros t={t} />
      <Fumaca t={t} />
      <Ventiladores t={t} />
      <Chuva t={t} />
      {/* canaletas no chão levando a água pra fora */}
      {dreno > 0 ? (
        <>
          {[-0.82, 0.82].map((dz) => (
            <Box key={dz} a={[-X_P, Y_T - R + 0.14, Z_T + dz - 0.07]} b={[X_P, Y_T - R + 0.24, Z_T + dz + 0.07]} c={AGUA} e={AGUA} ei={0.4 * dreno} />
          ))}
          <Flow t={t} from={T.canaletas + 0.5} path={[[-1, Y_T - R + 0.3, Z_T + 0.82], [X_P + 2, Y_T - R + 0.3, Z_T + 0.82]]} n={12} speed={0.35} c={AGUA} r={0.07} />
          <Flow t={t} from={T.canaletas + 0.5} path={[[1, Y_T - R + 0.3, Z_T - 0.82], [-X_P - 2, Y_T - R + 0.3, Z_T - 0.82]]} n={12} speed={0.35} c={AGUA} r={0.07} />
        </>
      ) : null}
      <Guy t={t} plan={PLAN} scale={0.9} />
    </>
  );
};

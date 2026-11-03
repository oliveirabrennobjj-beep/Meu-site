import React from "react";
import * as THREE from "three";
import { appear, pop, windowed } from "./lib";
import { PLAN, T, X_FAN, X_RAD, canais, ferve, fluxoRad, radiador, temp, vento, ventoinhaLigada } from "./timeline";
import { Box, CameraRig, Flow, Mat, Tube, V3 } from "./parts";
import { Guy } from "./Guy";
import { Estudio, Sol } from "./realismo";

const PI = Math.PI;
const STEEL = "#9aa3ad";
const DARK = "#3a3f47";
const AZUL = "#2d9bff";

const corTemp = (k: number) => new THREE.Color("#3aa0ff").lerp(new THREE.Color("#ff3b1a"), Math.min(1, Math.max(0, k))).getStyle();

const Garagem: React.FC = () => (
  <>
    <Box a={[-16, 0, -10]} b={[16, 0.3, 6]} c="#9a9da3" tex="concreto" rep={[8, 4]} r={0.85} />
    <Box a={[-16, 0.3, -10]} b={[16, 10, -9.6]} c="#646d80" tex="tijolo" rep={[8, 3]} r={0.9} />
    <Box a={[-16, 0.3, -9.6]} b={[16, 1.3, -9.5]} c="#3d4553" />
    <Box a={[-9, 0.3, -9.5]} b={[-4.5, 1.8, -8.2]} c="#8a5a32" tex="madeira" />
    <Box a={[-9.1, 1.8, -9.6]} b={[-4.4, 1.95, -8.1]} c="#a8743f" tex="madeira" />
    {[-8.4, -7.4, -6.4, -5.5].map((x, k) => (
      <Box key={x} a={[x, 3.0 + (k % 2) * 0.5, -9.5]} b={[x + 0.15, 4.1 + (k % 2) * 0.3, -9.42]} c={["#e04a3a", "#8f98a3", "#2d7dff", "#8f98a3"][k]} />
    ))}
  </>
);

/** Canais de água por dentro do bloco (serpentina). */
const CANAL: V3[] = [
  [1.45, 1.05, 0.5], [-1.4, 1.05, 0.5], [-1.4, 1.55, 0.5], [1.4, 1.55, 0.5], [1.4, 2.05, 0.5], [-1.4, 2.05, 0.5], [-1.4, 2.55, 0.5], [1.45, 2.55, 0.5], [1.45, 3.15, 0.0],
];
const SUPERIOR: V3[] = [[1.45, 3.15, 0], [2.0, 3.15, 0], [3.0, 3.4, 0], [X_RAD - 0.2, 3.4, 0]];
const RAD_DESCE: V3[] = [[X_RAD, 3.3, 0], [X_RAD, 0.95, 0]];
const INFERIOR: V3[] = [[X_RAD - 0.2, 0.9, 0], [3.0, 0.75, 0], [1.95, 1.2, 0], [1.45, 1.05, 0.5]];
const BYPASS: V3[] = [[1.75, 3.15, 0.2], [1.85, 2.2, 0.35], [1.75, 1.3, 0.4]];

const Motor: React.FC<{ t: number }> = ({ t }) => {
  const k = temp(t);
  const shake = ferve(t) * 0.035;
  const sx = Math.sin(t * 61) * shake;
  const a = t * 8;
  return (
    <group position={[sx, 0, 0]}>
      <Box a={[-1.7, 0.3, -1.0]} b={[1.7, 0.8, 1.0]} c={DARK} />
      <mesh position={[0, 1.95, 0]}>
        <boxGeometry args={[3.2, 2.3, 1.8]} />
        <meshStandardMaterial color={corTemp(k)} transparent opacity={0.28} emissive={k > 0.6 ? "#ff3b1a" : "#000"} emissiveIntensity={Math.max(0, k - 0.6) * 1.2} roughness={0.4} />
      </mesh>
      <Box a={[-1.55, 3.1, -0.85]} b={[1.55, 3.25, 0.85]} c="#8f98a3" m={0.6} r={0.35} />
      {[-1.05, -0.35, 0.35, 1.05].map((x, i) => {
        const y = 1.85 + 0.35 * Math.cos(a + i * PI * [0, 1.5, 0.5, 1][i]);
        return (
          <mesh key={x} position={[x, y, -0.2]}>
            <cylinderGeometry args={[0.24, 0.24, 0.4, 16]} />
            <Mat c={STEEL} m={0.75} r={0.3} tex="metal" />
          </mesh>
        );
      })}
      {/* vapor quando ferve */}
      {ferve(t) > 0.05
        ? Array.from({ length: 8 }).map((_, i) => {
            const life = (t * 0.7 + i / 8) % 1;
            return (
              <mesh key={i} position={[-1.2 + i * 0.35, 3.4 + life * 2.0, Math.sin(i * 2) * 0.4]}>
                <sphereGeometry args={[0.15 + life * 0.3, 10, 8]} />
                <Mat c="#f2f4f7" o={0.55 * (1 - life) * ferve(t)} />
              </mesh>
            );
          })
        : null}
      {/* termômetro */}
      <group position={[-0.9, 2.6, 0.95]}>
        <mesh rotation={[PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.3, 0.3, 0.08, 24]} />
          <Mat c="#f2f2f2" />
        </mesh>
        <group position={[0, 0, 0.05]} rotation={[0, 0, 1.3 - k * 2.6]}>
          <Box a={[-0.02, 0, -0.01]} b={[0.02, 0.24, 0.01]} c={k > 0.85 ? "#ff3b3b" : "#111"} />
        </group>
        <Box a={[0.1, 0.12, 0.045]} b={[0.26, 0.17, 0.05]} c="#ff3b3b" />
        <Box a={[-0.26, 0.12, 0.045]} b={[-0.1, 0.17, 0.05]} c="#2d7dff" />
      </group>
    </group>
  );
};

const Grade: React.FC<{ t: number; s: number }> = ({ t, s }) => (
  <group scale={[s, s, s]} position={[X_RAD * (1 - s), 2.1 * (1 - s), 0]}>
    <Box a={[X_RAD - 0.18, 0.75, -1.25]} b={[X_RAD + 0.18, 3.55, 1.25]} c="#c9ced6" m={0.6} r={0.35} o={0.35} />
    {Array.from({ length: 13 }).map((_, i) => (
      <Tube key={i} a={[X_RAD, 0.9, -1.1 + i * 0.183]} b={[X_RAD, 3.4, -1.1 + i * 0.183]} r={0.035} c={corTemp(0.25 + 0.5 * (1 - fluxoRad(t)))} />
    ))}
    <Box a={[X_RAD - 0.2, 3.35, -1.25]} b={[X_RAD + 0.2, 3.6, 1.25]} c="#4a4f57" m={0.4} />
    <Box a={[X_RAD - 0.2, 0.7, -1.25]} b={[X_RAD + 0.2, 0.95, 1.25]} c="#4a4f57" m={0.4} />
  </group>
);

const Ventoinha: React.FC<{ t: number }> = ({ t }) => {
  const s = pop(t, T.ventilador + 0.4, 0.5);
  if (s <= 0) return null;
  const a = ventoinhaLigada(t) ? t * 14 : 0;
  return (
    <group position={[X_FAN, 2.15, 0]} scale={[s, s, s]}>
      <mesh rotation={[0, 0, PI / 2]}>
        <torusGeometry args={[1.05, 0.06, 8, 40]} />
        <Mat c={DARK} />
      </mesh>
      <group rotation={[a, 0, 0]}>
        {[0, 1, 2, 3, 4].map((i) => (
          <group key={i} rotation={[(i * 2 * PI) / 5, 0, 0]}>
            <mesh position={[0, 0.55, 0]} rotation={[0, 0.5, 0]}>
              <boxGeometry args={[0.04, 0.85, 0.32]} />
              <Mat c="#ffd60a" m={0.3} r={0.5} />
            </mesh>
          </group>
        ))}
        <mesh rotation={[0, 0, PI / 2]}>
          <cylinderGeometry args={[0.16, 0.16, 0.2, 16]} />
          <Mat c={DARK} />
        </mesh>
      </group>
    </group>
  );
};

const Bomba: React.FC<{ t: number }> = ({ t }) => {
  const s = pop(t, T.empurra + 1.4, 0.5);
  if (s <= 0) return null;
  const a = t * 10;
  return (
    <group scale={[s, s, s]} position={[1.75, 1.25, 0.55]}>
      <mesh rotation={[0, 0, PI / 2]}>
        <cylinderGeometry args={[0.32, 0.32, 0.3, 24]} />
        <Mat c="#d14b2a" m={0.4} r={0.45} />
      </mesh>
      {/* polia e correia */}
      <group position={[0.2, 0, 0]} rotation={[a, 0, 0]}>
        <mesh rotation={[0, 0, PI / 2]}>
          <cylinderGeometry args={[0.24, 0.24, 0.08, 20]} />
          <Mat c="#c9ced6" m={0.7} />
        </mesh>
        <Box a={[-0.05, 0.16, -0.03]} b={[0.05, 0.24, 0.03]} c="#ffd60a" />
      </group>
      <Tube a={[0.22, 0.24, 0]} b={[0.22, 1.25, -0.2]} r={0.04} c="#1f1f22" />
      <Tube a={[0.22, -0.24, 0]} b={[0.22, 0.85, -0.55]} r={0.04} c="#1f1f22" />
    </group>
  );
};

const Termostato: React.FC<{ t: number }> = ({ t }) => {
  const s = pop(t, T.portinha + 0.5, 0.5);
  if (s <= 0) return null;
  const aberta = fluxoRad(t);
  return (
    <group position={[1.85, 3.15, 0]} scale={[s, s, s]}>
      <mesh rotation={[0, 0, PI / 2]}>
        <cylinderGeometry args={[0.2, 0.2, 0.18, 20]} />
        <Mat c="#c9ced6" m={0.6} o={0.5} />
      </mesh>
      <group rotation={[0, 0, aberta * 1.3]}>
        <Box a={[-0.02, -0.17, -0.17]} b={[0.02, 0.17, 0.17]} c="#ffd60a" />
      </group>
    </group>
  );
};

const Aditivo: React.FC<{ t: number }> = ({ t }) => {
  const s = pop(t, T.liquido + 0.4, 0.5);
  if (s <= 0) return null;
  const pour = windowed(t, T.liquido + 1.0, T.parabens, 0.4);
  return (
    <group scale={[s, s, s]}>
      <group position={[3.2, 4.1 + 0.3 * (1 - pour), 0]} rotation={[0, 0, -1.1 * pour]}>
        <Box a={[-0.22, -0.35, -0.18]} b={[0.22, 0.35, 0.18]} c="#ff5fa2" o={0.75} />
        <Box a={[-0.07, 0.35, -0.07]} b={[0.07, 0.5, 0.07]} c="#ffffff" />
      </group>
      {pour > 0.5 ? <Flow t={t} from={T.liquido + 1.4} path={[[3.55, 4.25, 0], [3.4, 3.45, 0]]} n={6} speed={1.4} c="#ff5fa2" r={0.06} /> : null}
    </group>
  );
};

export const RadiadorScene: React.FC<{ t: number }> = ({ t }) => {
  const c = canais(t);
  const r = radiador(t);
  const fr = fluxoRad(t);
  const k = temp(t);
  const rosa = appear(t, T.liquido + 1.8, 1.0);
  const quente = new THREE.Color(corTemp(Math.max(0.6, k))).lerp(new THREE.Color("#ff5fa2"), rosa * 0.4).getStyle();
  const fria = new THREE.Color(AZUL).lerp(new THREE.Color("#ff5fa2"), rosa * 0.4).getStyle();
  return (
    <>
      <CameraRig t={t} />
      <Estudio />
      <hemisphereLight args={["#fff6e0", "#3a3f47", 0.4]} />
      <Sol p={[6, 14, 12]} i={2.5} area={10} />
      <directionalLight position={[-10, 5, 8]} intensity={0.4} color="#bcd4ff" />
      <Garagem />
      <Motor t={t} />

      {/* canais internos */}
      {c > 0 ? (
        <>
          {CANAL.slice(1).map((p, i) => (
            <Tube key={i} a={CANAL[i]} b={p} r={0.07 * c} c="#5fb8ff" o={0.6} />
          ))}
          <Flow t={t} from={T.canais + 0.8} path={CANAL} n={22} speed={0.25} c={t < T.pega + 0.5 ? AZUL : quente} r={0.07} />
        </>
      ) : null}

      {/* radiador e mangueiras */}
      {r > 0 ? (
        <>
          <Grade t={t} s={r} />
          {SUPERIOR.slice(1).map((p, i) => (
            <Tube key={`s${i}`} a={SUPERIOR[i]} b={p} r={0.11 * r} c="#1f1f22" o={0.85} />
          ))}
          {INFERIOR.slice(1).map((p, i) => (
            <Tube key={`i${i}`} a={INFERIOR[i]} b={p} r={0.11 * r} c="#1f1f22" o={0.85} />
          ))}
          {fr > 0.5 ? (
            <>
              <Flow t={t} from={T.leva + 1.2} path={SUPERIOR} n={10} speed={0.5} c={quente} r={0.09} />
              {[-0.9, -0.3, 0.3, 0.9].map((z, i) => (
                <Flow key={i} t={t} from={T.leva + 1.6} path={RAD_DESCE.map((p) => [p[0], p[1], z] as V3)} n={6} speed={0.45} c={i % 2 ? fria : new THREE.Color(quente).lerp(new THREE.Color(fria), 0.5).getStyle()} r={0.07} />
              ))}
              <Flow t={t} from={T.leva + 2.0} path={INFERIOR} n={10} speed={0.5} c={fria} r={0.09} />
            </>
          ) : (
            t > T.portinha + 1.0 ? <Flow t={t} from={T.portinha + 1.0} path={BYPASS} n={6} speed={0.6} c={AZUL} r={0.07} /> : null
          )}
        </>
      ) : null}

      {/* vento batendo no radiador */}
      {vento(t) > 0
        ? Array.from({ length: 14 }).map((_, i) => {
            const life = (t * 0.9 + i / 14) % 1;
            const y = 1.0 + (i % 5) * 0.55;
            const z = -1.0 + (i % 3) * 1.0;
            return <Box key={i} a={[8.5 - life * 3.6, y, z]} b={[9.2 - life * 3.6, y + 0.04, z + 0.04]} c="#e8f6ff" o={vento(t) * (1 - life) * 0.9} />;
          })
        : null}
      {/* ar puxado pela ventoinha */}
      {ventoinhaLigada(t) && t > T.ventilador + 1.0
        ? Array.from({ length: 10 }).map((_, i) => {
            const life = (t * 1.1 + i / 10) % 1;
            const y = 1.2 + (i % 4) * 0.6;
            return <Box key={i} a={[6.0 - life * 3.0, y, -0.6 + (i % 3) * 0.6]} b={[6.5 - life * 3.0, y + 0.04, -0.56 + (i % 3) * 0.6]} c="#e8f6ff" o={(1 - life) * 0.8} />;
          })
        : null}

      <Ventoinha t={t} />
      <Bomba t={t} />
      <Termostato t={t} />
      <Aditivo t={t} />
      <Guy t={t} plan={PLAN} scale={0.9} />
    </>
  );
};

import React from "react";
import { appear, pop } from "./lib";
import { PLAN, T, cabTurn, rigidTurn, road, speed, trailerTurn } from "./timeline";
import { Box, CameraRig, Flow, Mat, Tree, Tube, V3 } from "./parts";
import { Guy } from "./Guy";

const PI = Math.PI;
const WR = 0.55; // raio da roda
const WY = 0.3 + WR;
const AX = 2.8; // eixos em x = ±AX
const WZ = 1.15;
const RED = "#c8322b";
const ORANGE = "#ff8a1a";

/** Roda com um raio amarelo pra dar pra ver girando. */
const Roda: React.FC<{ p: V3; spin: number; brake?: number; lock?: boolean }> = ({ p, spin, brake = 0, lock }) => (
  <group position={p} rotation={[0, 0, spin]}>
    <mesh rotation={[PI / 2, 0, 0]} castShadow>
      <cylinderGeometry args={[WR, WR, 0.42, 16]} />
      <Mat c="#1f1f22" />
    </mesh>
    <mesh rotation={[PI / 2, 0, 0]}>
      <cylinderGeometry args={[WR * 0.55, WR * 0.55, 0.44, 12]} />
      <Mat c={lock ? "#ff3b3b" : brake > 0 ? ORANGE : "#b8bec8"} e={lock ? "#ff3b3b" : ORANGE} ei={lock ? 0.8 : brake * 1.2} />
    </mesh>
    <Box a={[-0.05, 0, -0.23]} b={[0.05, WR * 0.9, 0.23]} c="#ffd60a" />
  </group>
);

/** Engrenagem de pé (eixo em z). */
const Engrenagem: React.FC<{ p: V3; r: number; ang: number; c: string }> = ({ p, r, ang, c }) => {
  const n = Math.max(8, Math.round(r * 14));
  return (
    <group position={p} rotation={[0, 0, ang]}>
      <mesh rotation={[PI / 2, 0, 0]}>
        <cylinderGeometry args={[r, r, 0.3, 24]} />
        <Mat c={c} />
      </mesh>
      <mesh rotation={[PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.12, 0.12, 0.34, 8]} />
        <Mat c="#3a3f47" />
      </mesh>
      {Array.from({ length: n }).map((_, k) => (
        <group key={k} rotation={[0, 0, (k * 2 * PI) / n]}>
          <Box a={[-0.07, r - 0.02, -0.15]} b={[0.07, r + 0.15, 0.15]} c={c} />
        </group>
      ))}
    </group>
  );
};

const Fumaca: React.FC<{ t: number; p: V3; c?: string; n?: number }> = ({ t, p, c = "#2a2a2e", n = 7 }) => (
  <>
    {Array.from({ length: n }).map((_, k) => {
      const life = (t * 0.9 + k / n) % 1;
      return (
        <mesh key={k} position={[p[0] - life * 0.6, p[1] + life * 2.2, p[2] + Math.sin(k * 4) * 0.3]} scale={0.2 + life * 0.6}>
          <icosahedronGeometry args={[1, 0]} />
          <Mat c={c} o={0.8 * (1 - life)} />
        </mesh>
      );
    })}
  </>
);

const Chao: React.FC<{ t: number }> = ({ t }) => {
  const d = road(t);
  return (
    <>
      <Box a={[-40, 0, -30]} b={[40, 0.28, 30]} c="#7cb35a" />
      <Box a={[-40, 0.28, -2.3]} b={[40, 0.3, 2.3]} c="#4a4a4f" />
      {Array.from({ length: 20 }).map((_, k) => {
        const x = ((((k * 4 - d) % 80) + 80) % 80) - 40;
        return <Box key={k} a={[x, 0.3, -0.08]} b={[x + 2, 0.31, 0.08]} c="#f2f2f2" />;
      })}
      {Array.from({ length: 8 }).map((_, k) => {
        const x = ((((k * 10 + 3 - d) % 80) + 80) % 80) - 40;
        return <Tree key={k} p={[x, 0.28, -6 - (k % 3) * 2]} s={1.2} />;
      })}
    </>
  );
};

/** Poste que o caminhão comprido derruba na curva. */
const POSTE: V3 = [-6.4, 0.28, 5.4];
const Poste: React.FC<{ t: number }> = ({ t }) => {
  if (t < T.comprido - 0.5) return null;
  const cai = appear(t, T.comprido + 2.4, 0.7);
  return (
    <group position={POSTE} rotation={[cai * 1.4, 0, 0]} scale={pop(t, T.comprido - 0.5, 0.5)}>
      <Tube a={[0, 0, 0]} b={[0, 4.5, 0]} r={0.14} c="#9aa3ad" />
      <Tube a={[0, 4.4, 0]} b={[0.8, 4.4, 0]} r={0.08} c="#9aa3ad" />
      <mesh position={[0.85, 4.3, 0]}>
        <boxGeometry args={[0.4, 0.15, 0.25]} />
        <Mat c="#fff4c2" e="#fff4c2" ei={0.4} />
      </mesh>
    </group>
  );
};

/** O caminhão "inteiriço": tábua, chassi, câmbio e freio a ar. Some quando é cortado em dois. */
const Inteiro: React.FC<{ t: number; spin: number }> = ({ t, spin }) => {
  const sai = 1 - appear(t, T.corta + 0.2, 0.4);
  if (sai <= 0) return null;
  const tabua = 1 - appear(t, T.vigas + 0.3, 0.4);
  const crack = appear(t, T.racha + 1.0, 0.5);
  const vigas = appear(t, T.vigas + 0.3, 0.8);
  const longo = appear(t, T.comprido + 0.2, 0.8);
  const rear = -4.3 - 4 * longo;
  const ar = pop(t, T.compressor, 0.6);
  const braking = t > T.compressor + 1.5 && t < T.comprido ? appear(t, T.compressor + 1.5, 0.4) : 0;
  const lock = t > T.mola + 1.2 && t < T.comprido;
  const caixa = pop(t, T.engr + 0.2, 0.5);
  const ang = rigidTurn(t);

  return (
    <group position={[AX, 0, 0]} rotation={[0, ang, 0]} scale={[1, sai, 1]}>
      <group position={[-AX, 0, 0]}>
        {/* rodas */}
        {[AX, -AX].map((x) =>
          [WZ, -WZ].map((z) => <Roda key={`${x}${z}`} p={[x, WY, z]} spin={spin} brake={braking} lock={lock && x < 0} />),
        )}
        {longo > 0
          ? [WZ, -WZ].map((z) => (
              <group key={z} scale={[longo, longo, longo]} position={[-6.8 * (1 - longo), 0, 0]}>
                <Roda p={[-6.8, WY, z]} spin={spin} />
              </group>
            ))
          : null}
        {/* motor */}
        <Box a={[2.3, 1.6, -0.6]} b={[3.5, 2.5, 0.6]} c="#6f7782" />
        {[2.5, 2.8, 3.1, 3.4].map((x) => (
          <mesh key={x} position={[x - 0.05, 2.6, 0]}>
            <cylinderGeometry args={[0.13, 0.13, 0.2, 8]} />
            <Mat c="#3a3f47" />
          </mesh>
        ))}
        <Tube a={[2.2, 1.6, -0.75]} b={[2.2, 3.2, -0.75]} r={0.09} c="#8f98a3" />
        {t > T.morre + 1.4 && t < T.engr + 0.5 ? <Fumaca t={t} p={[2.2, 3.3, -0.75]} /> : null}
        {/* tábua que racha */}
        {tabua > 0 ? (
          <group scale={[tabua, tabua, tabua]}>
            <group position={[0, 1.5, 0]} rotation={[0, 0, crack * 0.22]}>
              <Box a={[-4.2, -0.1, -1.0]} b={[0, 0.1, 1.0]} c="#b07a45" />
            </group>
            <group position={[0, 1.5, 0]} rotation={[0, 0, -crack * 0.22]}>
              <Box a={[0, -0.1, -1.0]} b={[4.2, 0.1, 1.0]} c="#b07a45" />
            </group>
            {/* caixas caindo em cima */}
            {[-2.6, -1.2, 0.2].map((x, k) => {
              const drop = appear(t, T.racha + 0.1 + k * 0.15, 0.4);
              if (drop <= 0) return null;
              const y = 1.6 + 0.55 + (1 - drop) * 5 - crack * (0.5 - Math.abs(x + 1.2) * 0.2);
              return (
                <group key={k} position={[x, y, 0]} rotation={[0, 0, crack * (k - 1) * 0.3]}>
                  <Box a={[-0.55, -0.55, -0.55]} b={[0.55, 0.55, 0.55]} c="#c98b4a" />
                  <Box a={[-0.56, -0.08, -0.56]} b={[0.56, 0.08, 0.56]} c="#8a5a32" />
                </group>
              );
            })}
          </group>
        ) : null}
        {/* chassi em escada */}
        {vigas > 0 ? (
          <group position={[0, (1 - vigas) * 4, 0]}>
            {[0.55, -0.55].map((z) => (
              <Box key={z} a={[rear, 1.4, z - 0.12]} b={[4.3, 1.62, z + 0.12]} c={RED} />
            ))}
            {[-3.6, -2.2, -0.8, 0.6, 2.0, 3.4, ...(longo > 0.5 ? [-5, -6.4, -7.8] : [])].map((x) => (
              <Box key={x} a={[x - 0.08, 1.43, -0.5]} b={[x + 0.08, 1.58, 0.5]} c="#9a2620" />
            ))}
          </group>
        ) : null}
        {/* câmbio e cardã */}
        {caixa > 0 ? (
          <group scale={[caixa, caixa, caixa]} position={[1.9 * (1 - caixa), 0, 0]}>
            <Box a={[1.6, 1.62, -0.35]} b={[2.3, 2.25, 0.35]} c="#4b5566" />
            <Tube a={[1.6, 1.8, 0]} b={[-AX, WY, 0]} r={0.08} c="#8f98a3" />
            <Tube a={[-AX, WY, -WZ]} b={[-AX, WY, WZ]} r={0.1} c="#5b6370" />
          </group>
        ) : null}
        {/* freio a ar */}
        {ar > 0 ? (
          <group scale={[ar, ar, ar]}>
            <mesh position={[2.0, 1.25, 0.85]} rotation={[0, 0, PI / 2]}>
              <cylinderGeometry args={[0.22, 0.22, 0.5, 10]} />
              <Mat c="#2d7dff" />
            </mesh>
            {[0.95, -0.95].map((z) => (
              <mesh key={z} position={[-0.5, 1.1, z]} rotation={[0, 0, PI / 2]}>
                <cylinderGeometry args={[0.26, 0.26, 1.8, 12]} />
                <Mat c="#9fc3e8" />
              </mesh>
            ))}
            <Tube a={[1.75, 1.25, 0.85]} b={[0.4, 1.1, 0.95]} r={0.04} c="#2d7dff" />
            {[AX, -AX].map((x) =>
              [WZ, -WZ].map((z) => <Tube key={`${x}${z}`} a={[x > 0 ? 0.4 : -1.4, 1.1, z > 0 ? 0.95 : -0.95]} b={[x, WY + 0.2, z * 0.75]} r={0.035} c="#2d7dff" />),
            )}
            {t > T.ar && t < T.mola
              ? [AX, -AX].map((x) =>
                  [WZ, -WZ].map((z) => (
                    <Flow
                      key={`${x}${z}`}
                      t={t}
                      from={T.compressor + 0.4}
                      path={[[1.75, 1.25, 0.85], [-0.5, 1.1, z > 0 ? 0.95 : -0.95], [x, WY + 0.2, z * 0.75]]}
                      c="#6fc3ff"
                      n={6}
                      speed={0.6}
                      r={0.07}
                    />
                  )),
                )
              : null}
          </group>
        ) : null}
        {/* mola de emergência na roda de trás */}
        {t > T.mola ? (
          <group position={[-AX + 0.9, 1.15, WZ - 0.25]} scale={pop(t, T.mola + 0.2, 0.5)}>
            <mesh rotation={[0, 0, PI / 2]}>
              <cylinderGeometry args={[0.24, 0.24, 0.7, 12]} />
              <Mat c="#ff3b3b" o={0.45} />
            </mesh>
            {Array.from({ length: 6 }).map((_, k) => {
              const len = 0.25 + 0.5 * appear(t, T.mola + 1.0, 0.3);
              return (
                <mesh key={k} position={[-0.35 + (k / 5) * len - (len - 0.25), 0, 0]} rotation={[0, PI / 2, 0]}>
                  <torusGeometry args={[0.17, 0.035, 5, 12]} />
                  <Mat c="#ffd60a" />
                </mesh>
              );
            })}
            {t < T.mola + 1.6 ? <Fumaca t={t} p={[-1.4, 0, 0.5]} c="#bfe3ff" n={5} /> : null}
          </group>
        ) : null}
        {/* carga comprida */}
        {longo > 0 ? (
          <group scale={[1, longo, 1]}>
            <Box a={[-8.0, 1.65, -1.2]} b={[1.4, 4.0, 1.2]} c="#e8e8e8" />
            <Box a={[-8.0, 3.7, -1.22]} b={[1.4, 3.85, 1.22]} c="#2d7dff" />
          </group>
        ) : null}
      </group>
    </group>
  );
};

/** Cavalo e carreta, presos pela quinta roda. */
const Articulado: React.FC<{ t: number }> = ({ t }) => {
  const s = pop(t, T.corta + 0.5, 0.6);
  if (s <= 0) return null;
  const PIN = 1.4;
  const afasta = appear(t, T.corta + 0.7, 0.8) * (1 - appear(t, T.pino + 0.2, 0.8));
  const pino = appear(t, T.pino + 0.3, 0.4);
  return (
    <group scale={[s, s, s]}>
      {/* cavalo */}
      <group position={[PIN, 0, 0]} rotation={[0, cabTurn(t), 0]}>
        <group position={[-PIN, 0, 0]}>
          {[3.7, PIN - 0.1].map((x) => [WZ, -WZ].map((z) => <Roda key={`${x}${z}`} p={[x, WY, z]} spin={0} />))}
          {[0.55, -0.55].map((z) => (
            <Box key={z} a={[0.2, 1.4, z - 0.12]} b={[4.6, 1.62, z + 0.12]} c={RED} />
          ))}
          <Box a={[3.0, 1.62, -1.15]} b={[4.7, 3.8, 1.15]} c={ORANGE} />
          <Box a={[4.68, 2.6, -0.95]} b={[4.74, 3.5, 0.95]} c="#1d3b66" />
          <Box a={[3.4, 2.7, 1.13]} b={[4.3, 3.5, 1.17]} c="#1d3b66" />
          <Box a={[4.7, 1.62, -1.1]} b={[4.85, 2.2, 1.1]} c="#c9ced6" />
          <Tube a={[2.85, 1.7, -1.0]} b={[2.85, 4.4, -1.0]} r={0.09} c="#c9ced6" />
          {/* quinta roda */}
          <mesh position={[PIN, 1.72, 0]}>
            <cylinderGeometry args={[0.65, 0.65, 0.12, 20]} />
            <Mat c={pino > 0 ? "#ffd60a" : "#2a2a2e"} e="#ffd60a" ei={0.5 * pino * (t < T.quinta + 2 ? 1 : 0.3)} />
          </mesh>
        </group>
      </group>
      {/* carreta */}
      <group position={[PIN, 0, 0]} rotation={[0, trailerTurn(t), 0]}>
        <group position={[-PIN - afasta * 1.6, 0, 0]}>
          {[-6.8, -5.6].map((x) => [WZ, -WZ].map((z) => <Roda key={`${x}${z}`} p={[x, WY, z]} spin={0} />))}
          <Box a={[-8.0, 1.75, -1.2]} b={[2.0, 1.95, 1.2]} c="#3a3f47" />
          <Box a={[-8.0, 1.95, -1.2]} b={[2.0, 4.3, 1.2]} c="#e8e8e8" />
          <Box a={[-8.0, 4.0, -1.22]} b={[2.0, 4.15, 1.22]} c="#2d7dff" />
          {[0.8, -0.8].map((z) => (
            <Tube key={z} a={[-0.5, 1.75, z]} b={[-0.5, 0.3 + afasta * 0, z]} r={0.07} c="#5b6370" />
          ))}
          <Tube a={[PIN, 1.75, 0]} b={[PIN, 1.55, 0]} r={0.12} c="#ffd60a" />
        </group>
      </group>
    </group>
  );
};

export const CaminhaoScene: React.FC<{ t: number }> = ({ t }) => {
  const spin = -road(t) / WR;
  const engineAng = t * (speed(t) > 0 || (t > T.engr && t < T.pisa) ? 6 : 0);
  const gear = t > T.engr && t < T.pisa + 0.5 ? pop(t, T.engr + 0.3, 0.6) * (1 - appear(t, T.pisa, 0.4)) : 0;
  const pequena = t > T.pequena + 0.2;
  const Rd = pequena ? 0.4 : 1.15;
  const xd = -0.9 + 0.55 + Rd + 0.1;
  return (
    <>
      <CameraRig t={t} />
      <hemisphereLight args={["#fff6e0", "#5a4030", 1.15]} />
      <directionalLight position={[8, 14, 10]} intensity={2.1} castShadow />
      <directionalLight position={[-10, 4, 8]} intensity={0.5} color="#bcd4ff" />
      <Chao t={t} />
      <Poste t={t} />
      <Inteiro t={t} spin={spin} />
      <Articulado t={t} />
      {gear > 0 ? (
        <group position={[0.6, 4.6, 0]} scale={[gear, gear, gear]}>
          <Engrenagem p={[-0.9, 0, 0]} r={0.55} ang={engineAng} c="#ffd60a" />
          <Engrenagem p={[xd, 0, 0]} r={Rd} ang={(-engineAng * 0.55) / Rd + 0.2} c="#2d7dff" />
          <mesh position={[-0.9, -0.85, 0]}>
            <boxGeometry args={[0.7, 0.3, 0.3]} />
            <Mat c="#6f7782" />
          </mesh>
        </group>
      ) : null}
      <Guy t={t} plan={PLAN} scale={0.9} />
    </>
  );
};

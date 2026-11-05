import React from "react";
import { pop, windowed } from "./lib";
import {
  PLAN,
  R_RODA,
  T,
  X_RODA,
  Y_EIXO,
  caixaAng,
  carda,
  cortado,
  lamaVis,
  rodaDir,
  rodaEsq,
  satelite,
  temCaixa,
  travado,
} from "./timeline";
import { Box, CameraRig, Mat, Tube } from "./parts";
import { Guy } from "./Guy";
import { Estudio, Sol } from "./realismo";

const PI = Math.PI;
const STEEL = "#9aa3ad";
const DARK = "#3a3f47";
const GOLD = "#ffd60a";

const Garagem: React.FC = () => (
  <>
    <Box a={[-16, 0, -12]} b={[16, 0.3, 8]} c="#5b5f66" tex="asfalto" rep={[8, 5]} r={0.9} />
    <Box a={[-16, 0.3, -12]} b={[16, 10, -11.6]} c="#646d80" tex="tijolo" rep={[8, 3]} r={0.9} />
    {/* faixas do chão */}
    {[-9, -6, -3, 3, 6].map((z) => (
      <Box key={z} a={[-0.08, 0.3, z]} b={[0.08, 0.31, z + 1.4]} c="#e8e4d0" />
    ))}
  </>
);

/** Engrenagem de dentes retos em volta do eixo x. */
const Engrenagem: React.FC<{ r: number; ang: number; c: string; glow?: number; w?: number }> = ({ r, ang, c, glow = 0, w = 0.18 }) => {
  const n = Math.max(8, Math.round(r * 24));
  return (
    <group rotation={[ang, 0, 0]}>
      <mesh rotation={[0, 0, PI / 2]} castShadow>
        <cylinderGeometry args={[r, r, w, 32]} />
        <Mat c={c} m={0.6} r={0.35} e={GOLD} ei={glow * 0.6} />
      </mesh>
      {Array.from({ length: n }).map((_, k) => {
        const a = (k / n) * PI * 2;
        return (
          <mesh key={k} position={[0, Math.cos(a) * (r + 0.04), Math.sin(a) * (r + 0.04)]} rotation={[a, 0, 0]}>
            <boxGeometry args={[w, 0.1, 0.07]} />
            <Mat c={c} m={0.6} r={0.35} e={GOLD} ei={glow * 0.6} />
          </mesh>
        );
      })}
    </group>
  );
};

const Roda: React.FC<{ x: number; a: number; skid?: number }> = ({ x, a, skid = 0 }) => (
  <group position={[x, Y_EIXO, 0]} rotation={[a, 0, 0]}>
    <mesh rotation={[0, PI / 2, 0]} castShadow>
      <torusGeometry args={[R_RODA, 0.25, 14, 32]} />
      <Mat c="#1c1c1f" r={0.9} e="#ff3b3b" ei={skid * 0.4} />
    </mesh>
    <mesh rotation={[0, 0, PI / 2]}>
      <cylinderGeometry args={[0.48, 0.48, 0.32, 24]} />
      <Mat c="#c9ced6" m={0.8} r={0.25} />
    </mesh>
    {[0, 1, 2, 3, 4].map((k) => (
      <group key={k} rotation={[(k * 2 * PI) / 5, 0, 0]}>
        <Box a={[-0.2, 0.1, -0.06]} b={[0.2, 0.44, 0.06]} c="#5b6370" />
      </group>
    ))}
  </group>
);

/** Arcos da curva no chão (centro à esquerda): a roda de fora anda mais. */
const Arcos: React.FC<{ o: number }> = ({ o }) =>
  o <= 0 ? null : (
    <group position={[-10, 0.33, 0]} rotation={[-PI / 2, 0, 0]}>
      <mesh>
        <torusGeometry args={[10 - X_RODA, 0.07, 6, 80, 0.62]} />
        <Mat c="#1fbf4a" e="#1fbf4a" ei={0.6} o={o} />
      </mesh>
      <mesh>
        <torusGeometry args={[10 + X_RODA, 0.07, 6, 80, 0.62]} />
        <Mat c="#2d7dff" e="#2d7dff" ei={0.6} o={o} />
      </mesh>
    </group>
  );

const Fumaca: React.FC<{ t: number; x: number; from: number; to: number; c?: string; up?: number }> = ({ t, x, from, to, c = "#8a8d93", up = 1.4 }) => {
  const o = windowed(t, from, to, 0.3);
  if (o <= 0) return null;
  return (
    <>
      {Array.from({ length: 9 }).map((_, k) => {
        const life = ((t - from) * 0.9 + k / 9) % 1;
        return (
          <mesh key={k} position={[x + Math.sin(k * 2.3) * 0.5 * life, 0.4 + life * up, 0.5 + life * 0.9 + Math.cos(k) * 0.2]}>
            <sphereGeometry args={[0.12 + life * 0.25, 10, 8]} />
            <Mat c={c} o={0.7 * (1 - life) * o} />
          </mesh>
        );
      })}
    </>
  );
};

export const DiferencialScene: React.FC<{ t: number }> = ({ t }) => {
  const l = rodaEsq(t);
  const r = rodaDir(t);
  const ca = caixaAng(t);
  const sat = satelite(t);
  const box = temCaixa(t);
  const cut = cortado(t);
  const lock = travado(t);
  const mud = lamaVis(t);
  const glowDif = windowed(t, T.diferencial, T.lama, 0.3);
  const glowLock = windowed(t, T.bloqueio, T.parabens, 0.3);
  const arcos = windowed(t, T.curva + 0.6, T.corta, 0.4) + windowed(t, T.nacurva + 0.4, T.lama, 0.4);
  const gap = cut * 0.35 * (1 - box);
  const motor = pop(t, 0.2, 0.6);
  const sx = t > T.prende ? Math.sin(t * 61) * 0.012 : 0;
  return (
    <>
      <CameraRig t={t} />
      <Estudio />
      <hemisphereLight args={["#fff6e0", "#3a3f47", 0.4]} />
      <Sol p={[6, 14, 12]} i={2.5} area={10} />
      <directionalLight position={[-10, 5, 8]} intensity={0.4} color="#bcd4ff" />
      <Garagem />
      <Arcos o={Math.min(1, arcos)} />

      {/* motor lá na frente (o carro anda para -z) */}
      <group position={[0.62 + sx, 0, -4.6]} scale={[motor, motor, motor]}>
        <Box a={[-1.0, 0.3, -0.9]} b={[1.0, 1.0, 0.9]} c={DARK} />
        <mesh position={[0, 1.8, 0]}>
          <boxGeometry args={[1.8, 1.6, 1.6]} />
          <meshStandardMaterial color="#b8c8de" transparent opacity={0.4} metalness={0.3} roughness={0.4} />
        </mesh>
        <Box a={[-0.9, 2.6, -0.8]} b={[0.9, 2.75, 0.8]} c="#8f98a3" m={0.6} r={0.35} />
      </group>
      {/* cardã: do motor até o meio do eixo */}
      <group position={[0.62, Y_EIXO, -2.35]} rotation={[0, PI / 2, 0]}>
        <group rotation={[carda(t), 0, 0]}>
          <mesh rotation={[0, 0, PI / 2]}>
            <cylinderGeometry args={[0.09, 0.09, 3.9, 14]} />
            <Mat c="#c9ced6" m={0.7} r={0.3} />
          </mesh>
          <Box a={[-0.4, 0.05, -0.05]} b={[0.4, 0.14, 0.05]} c="#2d7dff" />
        </group>
      </group>

      {/* eixo inteiro (antes de cortar) / duas metades */}
      <group position={[0, Y_EIXO, 0]}>
        <group position={[-gap, 0, 0]} rotation={[l, 0, 0]}>
          <Tube a={[-X_RODA, 0, 0]} b={[-0.05, 0, 0]} r={0.08} c={cut > 0.5 ? "#2d7dff" : GOLD} />
          <Box a={[-1.3, 0.06, -0.03]} b={[-0.9, 0.14, 0.03]} c="#d14b2a" />
        </group>
        <group position={[gap, 0, 0]} rotation={[r, 0, 0]}>
          <Tube a={[0.05, 0, 0]} b={[X_RODA, 0, 0]} r={0.08} c={cut > 0.5 ? "#1fbf4a" : GOLD} />
          <Box a={[0.9, 0.06, -0.03]} b={[1.3, 0.14, 0.03]} c="#d14b2a" />
        </group>
        {/* faísca do corte */}
        {windowed(t, T.corta + 0.2, T.corta + 1.0, 0.15) > 0
          ? Array.from({ length: 10 }).map((_, k) => {
              const life = (t * 2.5 + k / 10) % 1;
              return (
                <mesh key={k} position={[Math.sin(k * 3.1) * 0.6 * life, life * 0.9, Math.cos(k * 1.7) * 0.6 * life]}>
                  <sphereGeometry args={[0.04, 6, 4]} />
                  <Mat c="#ffe08a" e="#ffb02e" ei={2} />
                </mesh>
              );
            })
          : null}
      </group>

      {/* a caixa do diferencial */}
      {box > 0 ? (
        <group position={[0, Y_EIXO, 0]} scale={[box, box, box]}>
          {/* coroa (gira com a caixa) */}
          <group position={[0.42, 0, 0]}>
            <Engrenagem r={0.66} ang={ca} c="#b8742e" glow={glowDif * 0.5} w={0.14} />
          </group>
          {/* caixa transparente girando */}
          <group rotation={[ca, 0, 0]}>
            <mesh rotation={[0, 0, PI / 2]}>
              <cylinderGeometry args={[0.52, 0.52, 0.72, 28, 1, true]} />
              <meshStandardMaterial color="#b8c8de" transparent opacity={0.22} metalness={0.3} roughness={0.4} side={2} />
            </mesh>
            {/* engrenagens satélites (pequenas, presas na caixa) */}
            {[1, -1].map((s) => (
              <group key={s} position={[0, s * 0.3, 0]} rotation={[0, 0, PI / 2]}>
                <Engrenagem r={0.16} ang={s * sat} c={GOLD} glow={0.4 + glowDif * 0.6} w={0.12} />
              </group>
            ))}
            <Tube a={[0, -0.32, 0]} b={[0, 0.32, 0]} r={0.035} c={DARK} />
          </group>
          {/* engrenagens das metades */}
          <group position={[-0.24, 0, 0]}>
            <Engrenagem r={0.24} ang={l} c="#2d7dff" w={0.1} />
          </group>
          <group position={[0.24, 0, 0]}>
            <Engrenagem r={0.24} ang={r} c="#1fbf4a" w={0.1} />
          </group>
          {/* pinhão do cardã */}
          <group position={[0.62, 0, -0.78]} rotation={[0, PI / 2, 0]}>
            <Engrenagem r={0.2} ang={carda(t)} c={STEEL} w={0.16} />
          </group>
        </group>
      ) : null}

      {/* trava (luva que prende as duas metades) */}
      {pop(t, T.trava + 0.3, 0.5) > 0 ? (
        <group position={[0.95 - lock * 0.32, Y_EIXO, 0]} rotation={[r, 0, 0]} scale={pop(t, T.trava + 0.3, 0.5)}>
          <mesh rotation={[0, 0, PI / 2]}>
            <cylinderGeometry args={[0.17, 0.17, 0.32, 18]} />
            <Mat c={GOLD} m={0.6} r={0.3} e={GOLD} ei={0.3 + glowLock * 0.7} />
          </mesh>
        </group>
      ) : null}

      {/* lama debaixo da roda direita */}
      {mud > 0 ? (
        <>
          <mesh position={[X_RODA, 0.31, 0.1]} rotation={[-PI / 2, 0, 0]} scale={[mud, mud, mud]}>
            <circleGeometry args={[1.25, 32]} />
            <Mat c="#5a3a1e" r={0.3} m={0.1} />
          </mesh>
          <Fumaca t={t} x={X_RODA} from={T.lama + 0.7} to={T.trava + 1.6} c="#6b4423" up={1.0} />
        </>
      ) : null}
      {/* pneu arrastando na curva */}
      <Fumaca t={t} x={-X_RODA} from={T.presas + 0.6} to={T.corta + 0.2} />

      <Roda x={-X_RODA} a={l} skid={windowed(t, T.presas + 0.6, T.corta, 0.3)} />
      <Roda x={X_RODA} a={r} />

      <Guy t={t} plan={PLAN} scale={0.85} />
    </>
  );
};

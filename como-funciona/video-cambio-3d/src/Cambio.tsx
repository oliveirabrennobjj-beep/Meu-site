import React from "react";
import { appear, pop, windowed } from "./lib";
import { PARES, PLAN, T, X_RE, X_WHEEL, Y_IN, Y_OUT, clutchOpen, engineAngle, engineOn, gearbox, marcha, wheelAngle } from "./timeline";
import { Box, CameraRig, Mat, Tube } from "./parts";
import { Guy } from "./Guy";
import { Estudio, Sol } from "./realismo";

const PI = Math.PI;
const STEEL = "#9aa3ad";
const DARK = "#3a3f47";
const GOLD = "#ffd60a";

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
    {/* cavalete da roda */}
    <Box a={[X_WHEEL - 0.25, 0.3, -0.9]} b={[X_WHEEL + 0.25, Y_OUT - 0.1, -0.6]} c="#d14b2a" m={0.4} r={0.5} />
  </>
);

/** Engrenagem de dentes retos em volta do eixo x. */
const Engrenagem: React.FC<{ x: number; y: number; z?: number; r: number; ang: number; c: string; glow?: number; s?: number }> = ({ x, y, z = 0, r, ang, c, glow = 0, s = 1 }) => {
  const n = Math.max(8, Math.round(r * 22));
  return (
    <group position={[x, y, z]} rotation={[ang, 0, 0]} scale={[s, s, s]}>
      <mesh rotation={[0, 0, PI / 2]} castShadow>
        <cylinderGeometry args={[r, r, 0.2, 32]} />
        <Mat c={c} m={0.6} r={0.35} e={GOLD} ei={glow * 0.6} />
      </mesh>
      {Array.from({ length: n }).map((_, k) => {
        const a = (k / n) * PI * 2;
        return (
          <mesh key={k} position={[0, Math.cos(a) * (r + 0.05), Math.sin(a) * (r + 0.05)]} rotation={[a, 0, 0]}>
            <boxGeometry args={[0.2, 0.12, 0.09]} />
            <Mat c={c} m={0.6} r={0.35} e={GOLD} ei={glow * 0.6} />
          </mesh>
        );
      })}
      <mesh rotation={[0, 0, PI / 2]}>
        <cylinderGeometry args={[0.11, 0.11, 0.22, 12]} />
        <Mat c={DARK} />
      </mesh>
    </group>
  );
};

const Motor: React.FC<{ t: number }> = ({ t }) => {
  const a = engineAngle(t);
  const on = engineOn(t) && t > T.liga;
  const dead = windowed(t, T.freia + 0.4, T.discos + 0.6, 0.2);
  const sx = on ? Math.sin(t * 61) * 0.015 : 0;
  return (
    <group position={[sx, 0, 0]}>
      <Box a={[-4.6, 0.3, -1.1]} b={[-2.0, 1.2, 1.1]} c={DARK} />
      <mesh position={[-3.3, 2.4, 0]}>
        <boxGeometry args={[2.5, 2.4, 1.9]} />
        <meshStandardMaterial color={dead > 0.5 ? "#ff8a7a" : "#b8c8de"} transparent opacity={0.35} metalness={0.3} roughness={0.4} />
      </mesh>
      <Box a={[-4.5, 3.6, -0.95]} b={[-2.1, 3.8, 0.95]} c="#8f98a3" m={0.6} r={0.35} />
      {[-4.0, -3.55, -3.05, -2.6].map((x, k) => {
        const y = 2.3 + 0.35 * Math.cos(a * 2 + k * PI * [0, 1.5, 0.5, 1][k]);
        return (
          <mesh key={x} position={[x, y, 0]}>
            <cylinderGeometry args={[0.2, 0.2, 0.36, 16]} />
            <Mat c={STEEL} m={0.75} r={0.3} tex="metal" />
          </mesh>
        );
      })}
      {/* fumacinha quando morre */}
      {dead > 0
        ? Array.from({ length: 6 }).map((_, k) => {
            const life = ((t - T.freia) * 0.6 + k / 6) % 1;
            return (
              <mesh key={k} position={[-3.3 + Math.sin(k * 2) * 0.4, 3.9 + life * 1.8, 0]}>
                <sphereGeometry args={[0.18 + life * 0.25, 10, 8]} />
                <Mat c="#6b6f76" o={0.6 * (1 - life) * dead} />
              </mesh>
            );
          })
        : null}
    </group>
  );
};

/** Discos da embreagem: volante (motor) e disco (câmbio). */
const Embreagem: React.FC<{ t: number }> = ({ t }) => {
  const s = pop(t, T.discos + 0.4, 0.6);
  if (s <= 0) return null;
  const gap = clutchOpen(t) * 0.45;
  const ea = engineAngle(t);
  const wa = t < T.pisa + 0.3 || t > T.embreagem + 1.2 ? ea : engineAngle(T.pisa + 0.3);
  const glow = windowed(t, T.embreagem, T.sair, 0.3);
  return (
    <group scale={[s, s, s]} position={[-1.05 * (1 - s), Y_IN * (1 - s), 0]}>
      <group position={[-1.35, Y_IN, 0]} rotation={[ea, 0, 0]}>
        <mesh rotation={[0, 0, PI / 2]}>
          <cylinderGeometry args={[0.95, 0.95, 0.16, 36]} />
          <Mat c={STEEL} m={0.7} r={0.3} tex="metal" e={GOLD} ei={glow * 0.3} />
        </mesh>
        <Box a={[-0.09, 0.6, -0.08]} b={[0.09, 0.85, 0.08]} c="#c8322b" />
      </group>
      <group position={[-1.12 + gap, Y_IN, 0]} rotation={[wa, 0, 0]}>
        <mesh rotation={[0, 0, PI / 2]}>
          <cylinderGeometry args={[0.85, 0.85, 0.12, 36]} />
          <Mat c="#b8742e" r={0.8} e={GOLD} ei={glow * 0.3} />
        </mesh>
        <Box a={[-0.07, 0.5, -0.07]} b={[0.07, 0.75, 0.07]} c="#2d7dff" />
      </group>
    </group>
  );
};

/** Pedal da embreagem, perto do boneco. */
const Pedal: React.FC<{ t: number }> = ({ t }) => {
  const s = pop(t, T.discos + 0.6, 0.5);
  if (s <= 0) return null;
  const down = clutchOpen(t);
  return (
    <group position={[-4.5, 0.3, 2.4]} scale={[s, s, s]}>
      <Box a={[-0.2, 0, -0.2]} b={[0.2, 0.1, 0.2]} c={DARK} />
      <group position={[0, 0.1, -0.1]} rotation={[-0.5 + down * 0.6, 0, 0]}>
        <Tube a={[0, 0, 0]} b={[0, 0.9, 0]} r={0.04} c={STEEL} />
        <Box a={[-0.18, 0.85, -0.03]} b={[0.18, 1.0, 0.06]} c="#1f1f22" />
      </group>
    </group>
  );
};

const Roda: React.FC<{ t: number }> = ({ t }) => {
  const a = wheelAngle(t);
  return (
    <group position={[X_WHEEL, Y_OUT, 0]} rotation={[a, 0, 0]}>
      <mesh rotation={[0, 0, PI / 2]} castShadow>
        <torusGeometry args={[0.78, 0.26, 14, 32]} />
        <Mat c="#1c1c1f" r={0.9} />
      </mesh>
      <mesh rotation={[0, 0, PI / 2]}>
        <cylinderGeometry args={[0.6, 0.6, 0.3, 24]} />
        <Mat c="#c9ced6" m={0.8} r={0.25} />
      </mesh>
      {[0, 1, 2, 3, 4].map((k) => (
        <group key={k} rotation={[(k * 2 * PI) / 5, 0, 0]}>
          <Box a={[0.16, 0.12, -0.07]} b={[0.2, 0.55, 0.07]} c="#5b6370" />
        </group>
      ))}
    </group>
  );
};

export const CambioScene: React.FC<{ t: number }> = ({ t }) => {
  const g = gearbox(t);
  const ea = engineAngle(t);
  const wa = wheelAngle(t);
  const m = marcha(t);
  const re = pop(t, T.mais + 0.5, 0.5);
  const ringIn = pop(t, T.anel + 0.5, 0.5);
  const ringX = t < T.anel + 1.6 ? 2.62 : 2.62 + 0.17 * appear(t, T.anel + 1.6, 0.6);
  const scrape = t > T.arranhar + 0.8 && t < T.anel;
  return (
    <>
      <CameraRig t={t} />
      <Estudio />
      <hemisphereLight args={["#fff6e0", "#3a3f47", 0.4]} />
      <Sol p={[6, 14, 12]} i={2.5} area={10} />
      <directionalLight position={[-10, 5, 8]} intensity={0.4} color="#bcd4ff" />
      <Garagem />
      <Motor t={t} />
      <Embreagem t={t} />
      <Pedal t={t} />
      <Roda t={t} />

      {/* eixo do motor */}
      <group rotation={[0, 0, 0]}>
        <Tube a={[-2.0, Y_IN, 0]} b={[t > T.discos ? -1.42 : -1.0, Y_IN, 0]} r={0.08} c="#c9ced6" />
      </group>

      {/* fase 1: motor ligado direto na roda */}
      {g < 1 ? (
        <group scale={[1, 1 - g, 1 - g]} position={[0, (Y_IN + Y_OUT) / 2 * g, 0]}>
          <Tube a={[t > T.discos ? -1.05 : -1.0, Y_IN, 0]} b={[3.6, Y_IN, 0]} r={0.08} c={GOLD} />
          <Tube a={[3.6, Y_IN, 0]} b={[4.3, Y_OUT, 0]} r={0.08} c={GOLD} />
          <Tube a={[4.3, Y_OUT, 0]} b={[X_WHEEL, Y_OUT, 0]} r={0.08} c={GOLD} />
        </group>
      ) : null}

      {/* câmbio */}
      {g > 0 ? (
        <group scale={[1, g, g]} position={[0, (1 - g) * Y_IN, 0]}>
          <mesh position={[2.15, (Y_IN + Y_OUT) / 2, 0]}>
            <boxGeometry args={[3.6, 2.9, 2.3]} />
            <meshStandardMaterial color="#b8c8de" transparent opacity={0.16} metalness={0.3} roughness={0.4} />
          </mesh>
          {/* eixo de entrada e de saída */}
          <Tube a={[-1.05, Y_IN, 0]} b={[3.9, Y_IN, 0]} r={0.07} c="#c9ced6" />
          <Tube a={[0.5, Y_OUT, 0]} b={[X_WHEEL, Y_OUT, 0]} r={0.08} c={GOLD} />
          {PARES.map((p, k) => {
            const ativo = m === k ? 1 : 0;
            const vis = k === 0 || k === 4 ? 1 : appear(t, T.entre + 0.2 + (k - 1) * 0.3, 0.4);
            const da = (k === 0 ? 0 : 0.2) + ea;
            return (
              <group key={k}>
                <Engrenagem x={p.x} y={Y_IN} r={p.rin} ang={da} c={ativo ? "#e0b030" : STEEL} glow={ativo} s={vis} />
                <Engrenagem x={p.x} y={Y_OUT} r={p.rout} ang={-da * (p.rin / p.rout) + 0.15} c={ativo ? "#e0b030" : "#7d8590"} glow={ativo} s={vis} />
              </group>
            );
          })}
          {/* ré: engrenagem intermediária */}
          {re > 0 ? (
            <>
              <Engrenagem x={X_RE} y={Y_IN} r={0.38} ang={ea} c={m === -2 ? "#e0b030" : STEEL} glow={m === -2 ? 1 : 0} s={re} />
              <Engrenagem x={X_RE} y={(Y_IN + Y_OUT) / 2} z={0.42} r={0.3} ang={-ea * 1.27} c="#d14b2a" glow={m === -2 ? 0.6 : 0} s={re} />
              <Engrenagem x={X_RE} y={Y_OUT} r={0.38} ang={ea} c={m === -2 ? "#e0b030" : "#7d8590"} glow={m === -2 ? 1 : 0} s={re} />
            </>
          ) : null}
          {/* sincronizador */}
          {ringIn > 0 ? (
            <group position={[ringX, Y_OUT, 0]} rotation={[wa, 0, 0]} scale={[ringIn, ringIn, ringIn]}>
              <mesh rotation={[0, PI / 2, 0]}>
                <torusGeometry args={[0.26, 0.07, 10, 28]} />
                <Mat c={GOLD} m={0.6} r={0.3} e={GOLD} ei={0.5 * windowed(t, T.anel + 0.5, T.re, 0.3)} />
              </mesh>
            </group>
          ) : null}
          {/* faíscas de arranhar */}
          {scrape
            ? Array.from({ length: 12 }).map((_, k) => {
                const life = (t * 2.2 + k / 12) % 1;
                return (
                  <mesh key={k} position={[2.7 + Math.sin(k * 3.1) * 0.5 * life, 1.95 + life * 0.8, 0.5 + Math.cos(k * 1.7) * 0.6 * life]}>
                    <sphereGeometry args={[0.04, 6, 4]} />
                    <Mat c="#ffe08a" e="#ffb02e" ei={2} o={1 - life} />
                  </mesh>
                );
              })
            : null}
        </group>
      ) : null}

      <Guy t={t} plan={PLAN} scale={0.9} />
    </>
  );
};

import React from "react";
import { appear, pop, windowed } from "./lib";
import { ANDARES_MAX, P, PLAN, T, afunda, andares, cabine, sway } from "./timeline";
import { Box, CameraRig, Flow, Mat, Tube, V3 } from "./parts";
import { Guy } from "./Guy";
import { Estudio, Sol } from "./realismo";

const { fh: FH, hx: HX, hz: HZ, rock: ROCK, floor: FUNDO } = P;
const TOPO = ANDARES_MAX * FH;
const CONC = "#c9c6bd";
const BRICK = "#b5543a";
const AGUA = "#4fb4ff";
const COLS: [number, number][] = [
  [-HX, -HZ], [0, -HZ], [HX, -HZ],
  [-HX, HZ], [0, HZ], [HX, HZ],
];
const rnd = (k: number) => {
  const x = Math.sin(k * 127.1) * 43758.5453;
  return x - Math.floor(x);
};

const Terreno: React.FC<{ t: number }> = ({ t }) => (
  <>
    {/* grama e calçada */}
    <Box a={[-30, -0.15, -14]} b={[30, 0, 3.2]} c="#7cc35a" tex="grama" rep={[16, 6]} r={0.95} />
    <Box a={[-30, 0, 2.2]} b={[30, 0.05, 3.2]} c="#a9abb0" tex="concreto" rep={[16, 1]} />
    {/* terra em corte: camada mole e rocha */}
    <Box a={[-30, ROCK, -14]} b={[30, -0.15, -1.9]} c="#8a5a32" tex="terra" rep={[14, 4]} r={0.95} />
    <mesh position={[0, (ROCK - 0.15) / 2, 0.65]}>
      <boxGeometry args={[60, -ROCK - 0.15, 5.1]} />
      <meshStandardMaterial color="#8a5a32" transparent opacity={0.38} roughness={0.95} />
    </mesh>
    <Box a={[-30, FUNDO, -14]} b={[30, ROCK, 3.2]} c="#6f6a66" tex="concreto" rep={[14, 2]} r={0.9} />
    {/* rua com o cano d'água */}
    <Tube a={[9, -0.5, 1.2]} b={[HX + 0.4, -0.5, 1.2]} r={0.12} c="#2d7dff" o={0.7} />
    {t > T.agua ? <Flow t={t} from={T.agua + 0.2} path={[[9, -0.5, 1.2], [HX + 0.4, -0.5, 1.2]]} n={8} speed={0.6} c={AGUA} r={0.09} /> : null}
  </>
);

/** Parede de tijolo que sobe e desaba. */
const Tijolos: React.FC<{ t: number }> = ({ t }) => {
  if (t > T.esqueleto + 0.6) return null;
  const rows = 16;
  const fall = t > T.desaba + 0.15 ? t - T.desaba - 0.15 : 0;
  const crack = appear(t, T.peso + 0.5, 0.6);
  const out: React.ReactNode[] = [];
  for (let r = 0; r < rows; r++) {
    const show = appear(t, 0.2 + r * 0.18, 0.2);
    if (show <= 0) continue;
    for (let c = 0; c < 6; c++) {
      const k = r * 10 + c;
      const x0 = -HX + c * 0.68 + (r % 2 ? 0.34 : 0) - 0.17;
      if (x0 + 0.62 > HX + 0.3) continue;
      const y0 = r * 0.3;
      const dx = fall * (rnd(k) - 0.5) * 2.4;
      const dz = fall * (rnd(k + 7) * 1.6);
      const dy = -Math.min(y0, 4.9 * fall * fall);
      const red = r < 3 ? crack : 0;
      out.push(
        <group key={k} position={[x0 + 0.31 + dx, y0 + 0.15 + dy - red * 0.04, dz]} rotation={[fall * rnd(k + 3) * 2, 0, fall * (rnd(k + 5) - 0.5) * 3]} scale={[show, show * (1 - red * 0.25), show]}>
          <Box a={[-0.31, -0.13, -0.18]} b={[0.31, 0.13, 0.18]} c={red > 0.5 ? "#e0402a" : BRICK} tex="tijolo" r={0.9} o={1 - appear(t, T.esqueleto + 0.1, 0.4)} />
        </group>,
      );
    }
  }
  return <>{out}</>;
};

const Esqueleto: React.FC<{ t: number }> = ({ t }) => {
  const n = andares(t);
  if (n <= 0) return null;
  const rebar = windowed(t, T.aco + 0.3, T.mole, 0.4);
  const nucleo = appear(t, T.buraco + 0.4, 1.5);
  const brilho = windowed(t, T.paredes + 0.6, T.agua, 0.4);
  const cab = cabine(t);
  return (
    <>
      {Array.from({ length: n }).map((_, i) => {
        const y0 = i * FH;
        const s = i === n - 1 ? pop(t, T.esqueleto + 0.4 + i * 0.45, 0.3) || 1 : 1;
        return (
          <group key={i}>
            {COLS.map(([x, z], k) => {
              const vidro = rebar > 0 && x === HX && z === HZ ? 0.3 : 1;
              return <Box key={k} a={[x - 0.14, y0, z - 0.14]} b={[x + 0.14, y0 + FH * s, z + 0.14]} c={CONC} tex="concreto" o={vidro} r={0.85} />;
            })}
            {/* laje + vigas */}
            <Box a={[-HX - 0.2, y0 + FH - 0.12, -HZ - 0.2]} b={[HX + 0.2, y0 + FH, HZ + 0.2]} c={CONC} tex="concreto" rep={[2, 1]} r={0.85} />
            {/* fachada de vidro nos fundos e na lateral */}
            {i < n - 1 || n === ANDARES_MAX ? (
              <>
                <Box a={[-HX, y0 + 0.05, -HZ - 0.05]} b={[HX, y0 + FH - 0.14, -HZ]} c="#8fc7ea" o={0.55} m={0.4} r={0.15} />
                <Box a={[-HX - 0.05, y0 + 0.05, -HZ]} b={[-HX, y0 + FH - 0.14, HZ]} c="#8fc7ea" o={0.45} m={0.4} r={0.15} />
              </>
            ) : null}
          </group>
        );
      })}
      {/* barras de aço aparecendo dentro da coluna da frente */}
      {rebar > 0
        ? [[-0.07, -0.07], [0.07, -0.07], [-0.07, 0.07], [0.07, 0.07]].map(([dx, dz], k) => (
            <Tube key={k} a={[HX + dx, 0, HZ + dz]} b={[HX + dx, n * FH, HZ + dz]} r={0.025} c="#4a4f57" o={rebar} />
          ))
        : null}
      {/* núcleo / poço do elevador */}
      {nucleo > 0 ? (
        <group>
          {[
            [[-0.65, 0, -0.65], [0.65, 1, -0.5]],
            [[-0.65, 0, -0.65], [-0.5, 1, 0.65]],
            [[0.5, 0, -0.65], [0.65, 1, 0.65]],
          ].map(([a, b], k) => (
            <Box key={k} a={a as V3} b={[b[0], (n * FH + 0.4) * nucleo, b[2]]} c="#a9a59b" tex="concreto" r={0.85} e="#ffd60a" ei={brilho * 0.45} />
          ))}
          {t > T.cabine + 0.3 ? (
            <>
              <Tube a={[0, cab * FH + 0.75, 0]} b={[0, n * FH + 0.3, 0]} r={0.02} c="#30343a" />
              <group position={[0, cab * FH + 0.06, 0]} scale={pop(t, T.cabine + 0.3, 0.4)}>
                <Box a={[-0.42, 0, -0.42]} b={[0.42, 0.68, 0.42]} c="#2d7dff" m={0.4} r={0.35} />
                <Box a={[-0.2, 0.08, 0.42]} b={[0.2, 0.6, 0.45]} c="#bcd4ff" />
              </group>
            </>
          ) : null}
        </group>
      ) : null}
    </>
  );
};

const Fundacao: React.FC<{ t: number }> = ({ t }) => {
  if (t < T.crava) return null;
  const bloco = pop(t, T.junta + 0.4, 0.5);
  return (
    <>
      {COLS.map(([x, z], k) => {
        const g = appear(t, T.crava + 0.4 + k * 0.3, 1.0);
        const len = (ROCK + 0.6) * g; // negativo
        return (
          <group key={k}>
            <Box a={[x - 0.13, -0.6 + len - 0.25, z - 0.13]} b={[x + 0.13, -0.6, z + 0.13]} c="#b8b4aa" tex="concreto" r={0.8} />
            <mesh position={[x, -0.6 + len - 0.32, z]} rotation={[Math.PI, 0, 0]}>
              <coneGeometry args={[0.13, 0.25, 8]} />
              <Mat c="#8f98a3" m={0.5} />
            </mesh>
          </group>
        );
      })}
      {bloco > 0 ? <Box a={[-HX - 0.4, -0.6, -HZ - 0.4]} b={[HX + 0.4, -0.6 + 0.55 * bloco, HZ + 0.4]} c="#bdb9ae" tex="concreto" rep={[3, 1]} r={0.85} /> : null}
    </>
  );
};

/** Água: não sobe sozinha; bomba, caixa no telhado e descida pelas torneiras. */
const Agua: React.FC<{ t: number }> = ({ t }) => {
  if (t < T.agua + 0.3) return null;
  const bomba = pop(t, T.bombeia + 0.3, 0.5);
  const subida: V3[] = [[HX + 0.4, -0.5, 1.2], [HX + 0.4, 0.4, 1.2], [HX + 0.4, TOPO + 0.4, 1.2], [0.9, TOPO + 0.4, 0.3]];
  const nivel = appear(t, T.bombeia + 1.6, 2.5);
  const descida: V3[] = [[-0.9, TOPO + 0.2, 0.9], [-HX - 0.35, TOPO + 0.2, 0.9], [-HX - 0.35, 0.3, 0.9]];
  return (
    <>
      <Tube a={[HX + 0.4, -0.5, 1.2]} b={[HX + 0.4, TOPO + 0.4, 1.2]} r={0.07} c="#2d7dff" o={0.6} />
      {/* sem bomba: sobe um pouco e volta */}
      {t < T.bombeia + 0.6
        ? Array.from({ length: 8 }).map((_, k) => {
            const life = ((t - T.agua) * 0.7 + k / 8) % 1;
            const y = -0.5 + Math.sin(life * Math.PI) * 3.0;
            return (
              <mesh key={k} position={[HX + 0.4, y, 1.2]}>
                <sphereGeometry args={[0.08, 8, 6]} />
                <Mat c={AGUA} e={AGUA} ei={0.4} />
              </mesh>
            );
          })
        : null}
      {bomba > 0 ? (
        <group position={[HX + 0.4, 0.35, 1.2]} scale={[bomba, bomba, bomba]}>
          <Box a={[-0.3, -0.3, -0.3]} b={[0.3, 0.3, 0.3]} c="#d14b2a" m={0.4} r={0.45} />
          <mesh position={[0, 0, 0.32]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.18, 0.18, 0.06, 18]} />
            <Mat c="#30343a" />
          </mesh>
        </group>
      ) : null}
      {t > T.bombeia + 0.8 ? <Flow t={t} from={T.bombeia + 0.8} path={subida} n={22} speed={0.3} c={AGUA} r={0.09} /> : null}
      {/* caixa d'água no telhado */}
      {bomba > 0 ? (
        <group scale={[1, appear(t, T.bombeia + 1.0, 0.5), 1]} position={[0, TOPO, 0]}>
          <Box a={[-1.1, 0, -0.8]} b={[1.1, 1.0, 0.8]} c="#bcd4ff" o={0.35} m={0.2} r={0.2} />
          <Box a={[-1.05, 0.03, -0.75]} b={[1.05, 0.05 + 0.9 * nivel, 0.75]} c={AGUA} o={0.85} />
        </group>
      ) : null}
      {t > T.desce + 0.2 ? (
        <>
          <Tube a={descida[0]} b={descida[1]} r={0.06} c="#2d7dff" o={0.6} />
          <Tube a={descida[1]} b={descida[2]} r={0.06} c="#2d7dff" o={0.6} />
          <Flow t={t} from={T.desce + 0.2} path={descida} n={24} speed={0.35} c={AGUA} r={0.08} />
        </>
      ) : null}
    </>
  );
};

const Vento: React.FC<{ t: number }> = ({ t }) => {
  const a = windowed(t, T.vento, T.agua, 0.4);
  if (a <= 0) return null;
  return (
    <>
      {Array.from({ length: 18 }).map((_, k) => {
        const life = ((t - T.vento) * 0.8 + k / 18) % 1;
        const y = 5 + (k % 6) * 1.0;
        const z = -1 + (k % 3);
        return <Box key={k} a={[-9 + life * 7, y, z]} b={[-8.2 + life * 7, y + 0.05, z + 0.05]} c="#e8f6ff" o={a * (1 - life) * 0.9} />;
      })}
    </>
  );
};

export const PredioScene: React.FC<{ t: number }> = ({ t }) => {
  const af = afunda(t);
  return (
    <>
      <CameraRig t={t} />
      <Estudio />
      <hemisphereLight args={["#e8f4ff", "#5b4a3a", 0.5]} />
      <Sol p={[8, 22, 14]} i={2.6} area={22} />
      <directionalLight position={[-12, 6, 10]} intensity={0.4} color="#bcd4ff" />
      <Terreno t={t} />
      <Tijolos t={t} />
      <Fundacao t={t} />
      <group position={[0, -0.6 * af, 0]} rotation={[0, 0, 0.1 * af + sway(t)]}>
        <Esqueleto t={t} />
        <Agua t={t} />
      </group>
      <Vento t={t} />
      <Guy t={t} plan={PLAN} scale={0.9} />
    </>
  );
};

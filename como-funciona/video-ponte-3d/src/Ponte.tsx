import React from "react";
import * as THREE from "three";
import { appear, pop, windowed } from "./lib";
import { M, PLAN, T, sink, stretch } from "./timeline";
import { Box, C, CameraRig, Mat, Tree, Tube, V3 } from "./parts";
import { Guy } from "./Guy";
import { Estudio, Sol } from "./realismo";

const PI = Math.PI;
const { river: RV, top: TOP, deck: DECK, bed: BED, water: WATER, rock: ROCK, front: FRONT, pilarX: PX, towerX: TX, towerTop: TT } = M;
const CONCRETE = "#c9c6bd";
const ROCKC = "#8d8f94";
const WOOD = "#a8743f";

/* ---------- terreno em corte ---------- */
const Margem: React.FC<{ side: 1 | -1 }> = ({ side }) => {
  const x0 = side * RV;
  const x1 = side * 16;
  const a = Math.min(x0, x1);
  const b = Math.max(x0, x1);
  return (
    <>
      <Box a={[a, -5, -30]} b={[b, ROCK, FRONT]} c={ROCKC} tex="concreto" rep={[6, 3]} r={0.9} />
      <Box a={[a, ROCK, -30]} b={[b, 0.5, FRONT]} c={C.soil2} tex="terra" rep={[6, 3]} r={0.95} />
      <Box a={[a, 0.5, -30]} b={[b, TOP - 0.2, FRONT]} c={C.soil1} tex="terra" rep={[6, 3]} r={0.95} />
      <Box a={[a, TOP - 0.2, -30]} b={[b, TOP, FRONT]} c={C.grass} tex="grama" rep={[6, 6]} r={0.95} />
      {/* estrada em cima da margem */}
      <Box a={[side > 0 ? 5.45 : -16, TOP, -1.0]} b={[side > 0 ? 16 : -5, DECK, 1.0]} c="#55555b" tex="asfalto" rep={[4, 1]} r={0.9} />
    </>
  );
};

/** Fundo do rio. A parte da frente fica transparente na cena da fundação, pra ver as estacas. */
const Fundo: React.FC<{ t: number }> = ({ t }) => {
  const xray = windowed(t, T.estacas + 0.1, T.barcos + 0.4, 0.5);
  const o = 1 - 0.75 * xray;
  return (
    <>
      <Box a={[-RV, -5, -30]} b={[RV, ROCK, -1.2]} c={ROCKC} tex="concreto" rep={[4, 3]} r={0.9} />
      <Box a={[-RV, ROCK, -30]} b={[RV, BED, -1.2]} c={C.soil3} tex="terra" rep={[4, 3]} r={0.95} />
      <Box a={[-RV, -5, -1.2]} b={[RV, ROCK, FRONT]} c={ROCKC} tex="concreto" rep={[4, 1]} r={0.9} o={o} />
      <Box a={[-RV, ROCK, -1.2]} b={[RV, BED, FRONT]} c={C.soil3} tex="terra" rep={[4, 1]} r={0.95} o={o} />
    </>
  );
};

const Agua: React.FC<{ t: number }> = ({ t }) => {
  const forte = windowed(t, T.correnteza, T.estacas, 0.5);
  const v = 1.0 + forte * 2.2;
  return (
    <>
      <mesh position={[0, (BED + WATER) / 2, (-30 + FRONT) / 2]}>
        <boxGeometry args={[RV * 2, WATER - BED, 30 + FRONT]} />
        <meshStandardMaterial color="#2f8fe8" transparent opacity={0.72} roughness={0.15} metalness={0.1} emissive="#0d3a73" emissiveIntensity={0.35} />
      </mesh>
      {/* marolas andando com a correnteza (para +z) */}
      {Array.from({ length: 26 }).map((_, k) => {
        const x = -RV + 0.4 + ((k * 2.37) % (RV * 2 - 0.8));
        const z = ((((k * 1.31 + t * v) % 26) + 26) % 26) - 23;
        return <Box key={k} a={[x, WATER, z]} b={[x + 0.5 + forte * 0.4, WATER + 0.015, z + 0.08]} c="#e8f6ff" o={0.75} />;
      })}
    </>
  );
};

/* ---------- veículos ---------- */
const Caminhao: React.FC<{ p: V3; rot?: number; o?: number }> = ({ p, rot = 0, o = 1 }) => (
  <group position={p} rotation={[0, 0, rot]} scale={[o, o, o]}>
    {[0.62, -0.62].map((x) =>
      [0.55, -0.55].map((z) => (
        <mesh key={`${x}${z}`} position={[x, 0.25, z]} rotation={[PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.25, 0.25, 0.2, 14]} />
          <Mat c="#1f1f22" />
        </mesh>
      )),
    )}
    <Box a={[-0.95, 0.3, -0.5]} b={[0.95, 0.45, 0.5]} c="#3a3f47" />
    <Box a={[0.35, 0.45, -0.55]} b={[0.95, 1.25, 0.55]} c="#d8322b" m={0.2} r={0.4} />
    <Box a={[0.78, 0.8, -0.5]} b={[0.96, 1.15, 0.5]} c="#bfe3ff" m={0.3} r={0.2} />
    <Box a={[-1.0, 0.45, -0.6]} b={[0.3, 1.4, 0.6]} c="#ffd60a" r={0.6} />
  </group>
);

const Navio: React.FC<{ z: number; shake: number }> = ({ z, shake }) => (
  <group position={[Math.sin(shake * 40) * 0.08 * shake, WATER - 0.35 + Math.sin(z) * 0.03, z]}>
    <Box a={[-1.8, -0.3, -2.5]} b={[1.8, 0.75, 2.5]} c="#2a4d8f" m={0.2} r={0.5} />
    <Box a={[-1.85, 0.55, -2.55]} b={[1.85, 0.75, 2.55]} c="#c8322b" />
    <Box a={[-1.0, 0.75, -2.3]} b={[1.0, 1.75, -1.1]} c="#f2f2f2" r={0.5} />
    <Box a={[-0.25, 1.75, -1.9]} b={[0.25, 2.3, -1.4]} c="#ff8a1a" />
    {[
      [-1.4, -0.6, "#1fbf4a"],
      [0.1, -0.6, "#ffd60a"],
      [-1.4, 0.9, "#2d7dff"],
      [0.1, 0.9, "#ff3b3b"],
    ].map(([x, zz, c], k) => (
      <Box key={k} a={[x as number, 0.75, (zz as number) - 0.0]} b={[(x as number) + 1.3, 1.35, (zz as number) + 1.4]} c={c as string} r={0.6} />
    ))}
  </group>
);

/* ---------- fases da ponte ---------- */
const SEG = 20;
/** Tábua de margem a margem: enverga com o caminhão e quebra no meio. */
const Tabua: React.FC<{ t: number; truckX: number }> = ({ t, truckX }) => {
  const o = 1 - appear(t, T.pilares + 0.9, 0.4);
  if (o <= 0) return null;
  const broken = t >= T.quebra;
  const sagNow = (x: number) => 0.55 * Math.max(0, 1 - (x / RV) ** 2);
  const S = broken ? 0.55 : Math.min(0.55, sagNow(Math.min(Math.abs(truckX), RV)) * appear(t, T.enverga - 0.5, 1.0));
  const fall = appear(t, T.quebra, 0.9) * 1.15;
  const seg = (i: number) => {
    const x0 = -5 + (i * 10) / SEG;
    const x1 = x0 + 10 / SEG;
    const xm = (x0 + x1) / 2;
    const y = -S * Math.max(0, 1 - (xm / RV) ** 2);
    const slope = (S * 2 * xm) / (RV * RV) * (Math.abs(xm) < RV ? 1 : 0);
    return { xm, y, ang: Math.atan(slope), len: 10 / SEG + 0.02 };
  };
  const pieces = Array.from({ length: SEG }).map((_, i) => seg(i));
  const draw = (filter: (x: number) => boolean, pivot: number, sign: number) => (
    <group position={[pivot, DECK, 0]} rotation={[0, 0, sign * fall]}>
      {pieces
        .filter((p) => filter(p.xm))
        .map((p, i) => (
          <mesh key={i} position={[p.xm - pivot, p.y - 0.1, 0]} rotation={[0, 0, p.ang]} castShadow>
            <boxGeometry args={[p.len, 0.2, 1.8]} />
            <Mat c={WOOD} tex="madeira" r={0.8} />
          </mesh>
        ))}
    </group>
  );
  return (
    <group scale={[1, o, 1]}>
      {draw((x) => x < 0, -RV, broken ? -1 : 0)}
      {draw((x) => x >= 0, RV, broken ? 1 : 0)}
    </group>
  );
};

/** Pista de concreto (fases 2 em diante). Estica e encolhe com o calor no fim. */
const Pista: React.FC<{ t: number }> = ({ t }) => {
  const s = appear(t, T.pilares + 1.3, 0.6);
  if (s <= 0) return null;
  const drop = (1 - s) * 4;
  const e = stretch(t);
  const xe = 4.4 + e;
  const tilt = -Math.atan((0.45 * sink(t)) / 5.6);
  const hot = Math.max(0, e) / 0.25;
  const cold = Math.max(0, -e) / 0.25;
  const color = new THREE.Color(CONCRETE).lerp(new THREE.Color("#9fd0ff"), cold * 0.5).getStyle();
  const junta = appear(t, T.deixa + 0.4, 0.6);
  const crack = windowed(t, T.racharia + 0.8, T.deixa + 0.3, 0.2);
  return (
    <group position={[-5, drop, 0]} rotation={[0, 0, tilt]}>
      <group position={[5, 0, 0]}>
        <Box a={[-5, DECK - 0.4, -1.0]} b={[xe, DECK, 1.0]} c={color} tex="concreto" rep={[5, 1]} r={0.85} e="#ff6a1a" ei={hot * 0.35} />
        {/* faixa do meio */}
        {[-4.2, -2.6, -1.0, 0.6, 2.2].map((x) => (
          <Box key={x} a={[x, DECK, -0.06]} b={[x + 0.9, DECK + 0.012, 0.06]} c="#f2f2f2" />
        ))}
        {/* guarda-corpo */}
        {[-1.0, 1.0].map((z) => (
          <Box key={z} a={[-5, DECK, z - 0.06]} b={[xe, DECK + 0.25, z]} c="#8f98a3" m={0.4} r={0.5} />
        ))}
        {/* dentes da junta presos na pista */}
        {junta > 0
          ? Array.from({ length: 6 }).map((_, k) => {
              const z = -0.875 + k * 0.35;
              return <Box key={k} a={[xe, DECK - 0.1, z - 0.07]} b={[xe + 0.7 * junta, DECK, z + 0.07]} c="#9aa3ad" m={0.7} r={0.3} />;
            })
          : null}
      </group>
      {/* rachadura */}
      {crack > 0 ? (
        <group position={[5, 0, 0]} scale={[1, 1, crack]}>
          {[
            [4.55, -0.9, 4.8, -0.4],
            [4.8, -0.4, 4.6, 0.1],
            [4.6, 0.1, 4.95, 0.6],
            [4.95, 0.6, 4.75, 0.95],
          ].map(([x0, z0, x1, z1], k) => (
            <Tube key={k} a={[x0, DECK + 0.02, z0]} b={[x1, DECK + 0.02, z1]} r={0.035} c="#ff3b3b" />
          ))}
        </group>
      ) : null}
    </group>
  );
};

/** Pedaço da estrada na margem direita, onde a pista encosta: liso antes, com dentes depois. */
const Encosto: React.FC<{ t: number }> = ({ t }) => {
  if (t < T.pilares + 1.3) return null;
  const junta = appear(t, T.deixa + 0.4, 0.6);
  return (
    <>
      {junta < 1 ? <Box a={[4.6, DECK - 0.4, -1.0]} b={[5.45, DECK, 1.0]} c="#55555b" tex="asfalto" r={0.9} o={1} /> : null}
      {junta > 0 ? (
        <>
          <Box a={[5.45 - 0.05, DECK - 0.4, -1.0]} b={[5.45, DECK, 1.0]} c="#7d8590" m={0.6} r={0.35} />
          {Array.from({ length: 6 }).map((_, k) => {
            const z = -0.7 + k * 0.35;
            return <Box key={k} a={[5.45 - 0.7 * junta, DECK - 0.1, z - 0.07]} b={[5.45, DECK, z + 0.07]} c="#c9ced6" m={0.7} r={0.3} />;
          })}
        </>
      ) : null}
    </>
  );
};

/** Pilares dentro do rio, com as estacas da fundação. */
const Pilares: React.FC<{ t: number }> = ({ t }) => {
  const sai = appear(t, T.pendura + 2.2, 0.8);
  if (t < T.pilares + 0.3 || sai >= 1) return null;
  const pit = appear(t, T.correnteza + 1.2, 2.5) * (1 - appear(t, T.estacas + 0.4, 0.6));
  const estaca = appear(t, T.estacas + 1.0, 1.8);
  const steps = (Math.floor(estaca * 4) + Math.min(1, ((estaca * 4) % 1) * 3)) / 4;
  const cruz = windowed(t, T.tira + 0.3, T.pendura + 2.2, 0.3);
  return (
    <>
      {[-PX, PX].map((x, i) => {
        const grow = pop(t, T.pilares + 0.4 + i * 0.3, 0.6) * (1 - sai);
        if (grow <= 0) return null;
        const afunda = i === 1 ? sink(t) : 0;
        const h = DECK - 0.4 - BED;
        const deep = 2.6 * steps;
        return (
          <group key={x} position={[x, BED - afunda * 0.6, 0]} rotation={[0, 0, -afunda * 0.14]}>
            <group scale={[1, grow, 1]}>
              <Box a={[-0.35, 0, -0.8]} b={[0.35, h, 0.8]} c={CONCRETE} tex="concreto" r={0.85} />
              <Box a={[-0.5, h - 0.25, -0.95]} b={[0.5, h, 0.95]} c="#b5b2a8" tex="concreto" r={0.85} />
            </group>
            {/* estacas */}
            {deep > 0.02
              ? [-0.2, 0.2].map((ex) =>
                  [-0.45, 0.45].map((ez) => (
                    <mesh key={`${ex}${ez}`} position={[ex, -deep / 2, ez]}>
                      <cylinderGeometry args={[0.12, 0.12, deep, 12]} />
                      <Mat c="#d8d4ca" e="#ffd60a" ei={windowed(t, T.estacas + 1.0, T.fundacao + 1.5, 0.3) * 0.35} />
                    </mesh>
                  )),
                )
              : null}
            {deep > 0.02 ? <Box a={[-0.5, -0.25, -0.9]} b={[0.5, 0, 0.9]} c="#b5b2a8" tex="concreto" r={0.85} /> : null}
            {cruz > 0 ? (
              <group position={[0, h * 0.55, 0.95]} scale={[cruz, cruz, cruz]}>
                <Box a={[-0.08, -0.9, -0.05]} b={[0.08, 0.9, 0.05]} c="#ff3b3b" />
                <group rotation={[0, 0, PI / 2]}>
                  <Box a={[-0.08, -0.9, -0.05]} b={[0.08, 0.9, 0.05]} c="#ff3b3b" />
                </group>
              </group>
            ) : null}
          </group>
        );
      })}
      {/* buraco da erosão em volta do pilar da direita */}
      {pit > 0.01 ? (
        <mesh position={[PX, BED + 0.02, 0]} scale={[pit * 1.3, 1, pit * 1.5]}>
          <cylinderGeometry args={[1, 0.6, 0.04, 20]} />
          <Mat c="#2e1d0e" r={1} />
        </mesh>
      ) : null}
    </>
  );
};

/** Torres nas margens e cabos em leque até a pista. */
const Estaiada: React.FC<{ t: number }> = ({ t }) => {
  if (t < T.torres) return null;
  const e = stretch(t);
  return (
    <>
      {[-1, 1].map((side, i) => {
        const g = appear(t, T.torres + 0.2 + i * 0.4, 1.0);
        const x = side * TX;
        return (
          <group key={side}>
            <group position={[x, TOP, 0]} scale={[1, Math.max(0.001, g), 1]}>
              {[-1.3, 1.3].map((z) => (
                <Box key={z} a={[-0.25, 0, z - 0.22]} b={[0.25, TT + 0.6 - TOP, z + 0.22]} c={CONCRETE} tex="concreto" r={0.85} />
              ))}
              {[3.6, TT + 0.2 - TOP].map((y) => (
                <Box key={y} a={[-0.22, y, -1.3]} b={[0.22, y + 0.4, 1.3]} c="#b5b2a8" tex="concreto" r={0.85} />
              ))}
            </group>
            {/* cabos */}
            {[1.0, 2.0, 3.0, 4.0, 4.9].map((d, k) => {
              const c = appear(t, T.pendura + 0.2 + k * 0.15 + i * 0.08, 0.5);
              if (c <= 0) return null;
              const xd = x - side * d;
              const xdS = xd + e * ((xd + 5) / 9.4);
              return [-1.0, 1.0].map((z) => {
                const a: V3 = [x, TT, z * 1.3];
                const b: V3 = [xdS, DECK + 0.05, z];
                return <Tube key={`${k}${z}`} a={a} b={[a[0] + (b[0] - a[0]) * c, a[1] + (b[1] - a[1]) * c, a[2] + (b[2] - a[2]) * c]} r={0.035} c="#f2f2f2" />;
              });
            })}
          </group>
        );
      })}
    </>
  );
};

/** Gotas de água quando a tábua e o caminhão caem. */
const Respingo: React.FC<{ t: number }> = ({ t }) => {
  const d = t - (T.quebra + 0.7);
  if (d < 0 || d > 1.4) return null;
  return (
    <>
      {Array.from({ length: 18 }).map((_, k) => {
        const a = (k / 18) * 2 * PI;
        const v = 1.6 + (k % 3) * 0.6;
        return (
          <mesh key={k} position={[Math.cos(a) * v * d, WATER + 3.2 * d - 4.9 * d * d, Math.sin(a) * v * d]}>
            <sphereGeometry args={[0.1, 8, 6]} />
            <Mat c="#bfe3ff" o={Math.max(0, 1 - d / 1.4)} />
          </mesh>
        );
      })}
    </>
  );
};

export const PonteScene: React.FC<{ t: number }> = ({ t }) => {
  // caminhão 1: entra, para no meio e cai com a tábua
  const x1 = Math.min(0, -9 + 9 * appear(t, T.caminhao, 1.9));
  const fallT = Math.max(0, t - T.quebra);
  const y1 = Math.max(WATER - 0.9, DECK - 0.55 - 4.9 * fallT * fallT);
  const show1 = t > T.caminhao && t < T.pilares + 1.4;
  // caminhão 2: passa por cima dos pilares
  const x2 = -9 + 18 * Math.min(1, Math.max(0, (t - T.pilares - 2.4) / 4.6));
  const show2 = t > T.pilares + 2.4 && t < T.pilares + 7.2;
  // caminhão 3: final
  const x3 = -9 + 18 * Math.min(1, Math.max(0, (t - T.fim - 0.3) / 5));
  // navio
  const zShip = t < T.estaiada
    ? -16 + 12.7 * appear(t, T.barcos + 0.3, 2.6) - 0.6 * windowed(t, T.batem + 0.1, T.tira, 0.3)
    : -3.3 + 5.3 * appear(t, T.estaiada + 0.2, 4.0);
  const shipO = t > T.barcos + 0.2 && t < T.calor + 3.5;
  const shake = windowed(t, T.batem, T.batem + 0.8, 0.1);
  return (
    <>
      <CameraRig t={t} />
      <Estudio />
      <hemisphereLight args={["#e8f4ff", "#5a7a3a", 0.5]} />
      <Sol p={[8, 18, 14]} i={2.6} area={18} />
      <directionalLight position={[-12, 6, 10]} intensity={0.4} color="#bcd4ff" />
      <Margem side={-1} />
      <Margem side={1} />
      <Fundo t={t} />
      <Agua t={t} />
      {[-12, -9, -7, 7.5, 10, 13].map((x, k) => (
        <Tree key={x} p={[x, TOP, -5 - (k % 3) * 2.5]} s={1.3} />
      ))}
      <Tabua t={t} truckX={x1} />
      <Pista t={t} />
      <Encosto t={t} />
      <Pilares t={t} />
      <Estaiada t={t} />
      <Respingo t={t} />
      {show1 ? <Caminhao p={[x1, t < T.quebra ? DECK - 0.55 * appear(t, T.enverga - 0.5, 1.0) * Math.max(0, 1 - (x1 / RV) ** 2) : y1, 0]} rot={t > T.quebra ? -0.5 * Math.min(1, fallT * 2) : 0} o={1 - appear(t, T.pilares + 0.8, 0.5)} /> : null}
      {show2 ? <Caminhao p={[x2, DECK, -0.45]} /> : null}
      {t > T.fim + 0.3 ? <Caminhao p={[x3, DECK, 0.45]} /> : null}
      {shipO ? <Navio z={zShip} shake={shake} /> : null}
      <Guy t={t} plan={PLAN} scale={0.9} yAt={() => TOP} />
    </>
  );
};

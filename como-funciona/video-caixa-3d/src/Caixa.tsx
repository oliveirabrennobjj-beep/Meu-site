import React from "react";
import * as THREE from "three";
import { appear, pop } from "./lib";
import { CASA, CX, PLAN, T, entradaAberta, guyY, nivel } from "./timeline";
import { Box, C, CameraRig, Flow, Mat, Tree, Tube, V3 } from "./parts";
import { Guy } from "./Guy";

const { x0, x1, z0, piso, laje } = CASA;

const Ground: React.FC = () => (
  <>
    <Box a={[-12, 0, -6]} b={[14, 0.3, 0]} c={C.grass} />
    <Box a={[-12, 0.22, -0.02]} b={[14, 0.3, 0.05]} c={C.grassDark} />
    <Box a={[-12, -1.6, -6]} b={[14, 0, 0]} c={C.soil1} />
    <Box a={[-12, -4.6, -6]} b={[14, -1.6, 0]} c={C.soil2} />
    <Box a={[-12, -7, -6]} b={[14, -4.6, 0]} c={C.soil3} />
    {/* rua */}
    <Box a={[7, 0.3, -6]} b={[14, 0.36, 0]} c="#4a4a4f" />
    {[-5, -3, -1].map((z) => (
      <Box key={z} a={[10.3, 0.36, z - 0.6]} b={[10.7, 0.37, z]} c="#f2f2f2" />
    ))}
    <Box a={[6.6, 0.3, -6]} b={[7, 0.45, 0]} c="#bdbab2" />
  </>
);

/** Casa em corte: chão, parede do fundo, parede esquerda, um toco da direita e a laje. */
const Casa: React.FC = () => (
  <>
    <Box a={[x0, 0.3, z0]} b={[x1, piso, 0]} c="#d9cfc0" />
    <Box a={[x0, piso, z0]} b={[x1, laje - 0.3, z0 + 0.2]} c="#f3e6cf" />
    <Box a={[x0, piso, z0]} b={[x0 + 0.2, laje - 0.3, 0]} c="#eadbc0" />
    <Box a={[x1 - 0.2, piso, z0]} b={[x1, laje - 0.3, z0 + 0.8]} c="#eadbc0" />
    <Box a={[x0 - 0.2, laje - 0.3, z0 - 0.2]} b={[x1 + 0.2, laje, 0.15]} c="#c9c6bd" />
    <Box a={[x0 - 0.2, laje, z0 - 0.2]} b={[x1 + 0.2, laje + 0.25, z0]} c="#b8b5ac" />
    {/* janela */}
    <Box a={[-1.2, 1.6, z0 + 0.2]} b={[0.4, 2.6, z0 + 0.24]} c="#9fd3ff" />
    {/* pia */}
    <Box a={[-3.2, piso, z0 + 0.2]} b={[-1.6, 1.35, z0 + 1.0]} c="#7a5a3a" />
    <Box a={[-3.25, 1.35, z0 + 0.15]} b={[-1.55, 1.45, z0 + 1.05]} c="#e8e8e8" />
    <Box a={[-2.7, 1.38, z0 + 0.35]} b={[-2.1, 1.46, z0 + 0.85]} c="#9aa3ad" />
    {/* box do chuveiro */}
    <Box a={[1.2, piso, z0 + 0.2]} b={[3.0, piso + 0.06, z0 + 1.6]} c="#bfe3f2" />
  </>
);

/** Partículas caindo (torneira, chuveiro, transbordo). */
const Pingos: React.FC<{ t: number; on: boolean; p: V3; n?: number; altura?: number; abre?: number; c?: string; r?: number }> = ({ t, on, p, n = 10, altura = 1.2, abre = 0.2, c = C.water, r = 0.06 }) => {
  if (!on) return null;
  return (
    <>
      {Array.from({ length: n }).map((_, k) => {
        const life = (t * 1.6 + k / n) % 1;
        return (
          <mesh key={k} position={[p[0] + Math.sin(k * 7.1) * abre * life, p[1] - life * altura, p[2] + Math.cos(k * 3.3) * abre * life]}>
            <icosahedronGeometry args={[r, 0]} />
            <Mat c={c} o={0.9} />
          </mesh>
        );
      })}
    </>
  );
};

const Hidrometro: React.FC = () => (
  <group position={[5.8, 0.3, 0.45]}>
    <Box a={[-0.45, 0, -0.3]} b={[0.45, 0.75, 0.3]} c="#e9edf2" />
    <mesh position={[0, 0.4, 0.31]} rotation={[Math.PI / 2, 0, 0]}>
      <cylinderGeometry args={[0.25, 0.25, 0.04, 16]} />
      <Mat c="#1b4fa8" />
    </mesh>
  </group>
);

const lerpC = (a: string, b: string, k: number) => new THREE.Color(a).lerp(new THREE.Color(b), Math.max(0, Math.min(1, k))).getStyle();

/** A caixa d'água com a água, a boia, o ladrão e a tampa. */
const Reservatorio: React.FC<{ t: number }> = ({ t }) => {
  const s = pop(t, T.caixa + 0.3, 0.7);
  if (s <= 0) return null;
  const base = laje + 0.25;
  const n = nivel(t);
  const topo = base + 0.08 + n * (CX.h - 0.16);
  const tampa = appear(t, T.tampa + 0.5, 0.8);
  const ladrao = pop(t, T.ladrao + 0.4, 0.5);
  const boiaY = Math.max(base + 0.3, topo + 0.05);
  const entrada: V3 = [CX.x + 0.85, base + CX.h - 0.18, CX.z];
  const lava = t > T.lava && t < T.parabens;
  return (
    <group position={[CX.x, base, CX.z]} scale={[s, s, s]}>
      <group position={[-CX.x, -base, -CX.z]}>
        {/* corpo da caixa, meio transparente pra ver a água */}
        <mesh position={[CX.x, base + CX.h / 2, CX.z]}>
          <cylinderGeometry args={[CX.r, CX.r * 0.88, CX.h, 20, 1, true]} />
          <meshStandardMaterial color="#6fa8ff" transparent opacity={0.22} side={THREE.DoubleSide} flatShading />
        </mesh>
        <mesh position={[CX.x, base + 0.04, CX.z]}>
          <cylinderGeometry args={[CX.r * 0.88, CX.r * 0.88, 0.08, 20]} />
          <Mat c="#2a5fb8" />
        </mesh>
        <mesh position={[CX.x, base + CX.h, CX.z]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[CX.r, 0.05, 6, 24]} />
          <Mat c="#2a5fb8" />
        </mesh>
        {n > 0.01 ? (
          <mesh position={[CX.x, (base + 0.08 + topo) / 2, CX.z]}>
            <cylinderGeometry args={[CX.r * 0.94 - (1 - n) * 0.1, CX.r * 0.86, topo - base - 0.08, 20]} />
            <Mat c={lerpC("#1f7ae0", "#8fb0c4", lava ? 1 : 0)} o={0.9} e="#1f7ae0" ei={0.25} />
          </mesh>
        ) : null}
        {/* boia: braço do registro até a bola */}
        <Tube a={entrada} b={[CX.x + 0.15, boiaY, CX.z + 0.2]} r={0.035} c="#666" />
        <mesh position={[CX.x + 0.15, boiaY, CX.z + 0.2]}>
          <sphereGeometry args={[0.17, 12, 8]} />
          <Mat c="#ff8a1a" />
        </mesh>
        {/* ladrão */}
        {ladrao > 0 ? (
          <group scale={[1, ladrao, 1]}>
            <Tube a={[CX.x + CX.r - 0.05, base + CX.h - 0.12, CX.z]} b={[x1 + 0.7, base + CX.h - 0.12, CX.z]} r={0.08} c="#e8e8e8" />
            <Tube a={[x1 + 0.7, base + CX.h - 0.12, CX.z]} b={[x1 + 0.7, base + CX.h - 0.6, CX.z]} r={0.08} c="#e8e8e8" />
          </group>
        ) : null}
        <Pingos t={t} on={t > T.ladrao + 1.0 && t < T.gravidade} p={[x1 + 0.7, base + CX.h - 0.65, CX.z]} altura={1.4} n={8} />
        {/* transbordando pela borda antes do ladrão */}
        <Pingos t={t} on={t > T.transborda && t < T.ladrao + 1.0} p={[CX.x + CX.r + 0.05, base + CX.h, CX.z + 0.3]} altura={CX.h + 0.2} n={14} abre={0.35} />
        {/* tampa */}
        {tampa > 0 ? (
          <mesh position={[CX.x, base + CX.h + 0.08 + (1 - tampa) * 1.6, CX.z]} rotation={[0, (1 - tampa) * 2, 0]}>
            <cylinderGeometry args={[CX.r * 0.7, CX.r + 0.08, 0.22, 20]} />
            <Mat c="#2a5fb8" />
          </mesh>
        ) : null}
      </group>
    </group>
  );
};

/** Mosquitos rondando a caixa aberta e indo embora quando a tampa fecha. */
const Mosquitos: React.FC<{ t: number }> = ({ t }) => {
  if (t < T.tampa || t > T.lava) return null;
  const foge = appear(t, T.tampa + 1.2, 1.5);
  return (
    <>
      {Array.from({ length: 7 }).map((_, k) => {
        const a = t * 3 + k;
        const raio = 0.6 + foge * 3 + (k % 3) * 0.2;
        return (
          <mesh key={k} position={[CX.x + Math.cos(a) * raio, laje + 2.2 + Math.sin(a * 1.7) * 0.25 + foge * 1.5, CX.z + Math.sin(a) * raio * 0.6]}>
            <sphereGeometry args={[0.06, 6, 4]} />
            <Mat c="#1a1a1a" o={1 - foge} />
          </mesh>
        );
      })}
    </>
  );
};

/** Seta da gravidade descendo pelo cano. */
const Seta: React.FC<{ t: number }> = ({ t }) => {
  const g = appear(t, T.gravidade + 0.6, 0.6) * (1 - appear(t, T.tampa, 0.4));
  if (g <= 0) return null;
  const y = laje - 0.4 - ((t * 1.2) % 1) * 1.2;
  return (
    <mesh position={[-0.6, y, -1.0]} rotation={[Math.PI, 0, 0]} scale={g}>
      <coneGeometry args={[0.22, 0.5, 6]} />
      <Mat c="#2d7dff" e="#2d7dff" ei={0.4} />
    </mesh>
  );
};

export const CaixaScene: React.FC<{ t: number }> = ({ t }) => {
  const base = laje + 0.25;
  // canos
  const rede: V3[] = [[13, -1.2, 0.4], [6.4, -1.2, 0.4], [6.4, 0.6, 0.4], [x1 + 0.1, 0.6, 0.4]];
  const direto: V3[] = [[x1 + 0.1, 0.6, 0.4], [x1 - 0.1, 0.6, z0 + 0.35], [-2.4, 0.6, z0 + 0.35], [-2.4, 1.75, z0 + 0.35]];
  const pChuveiro: V3[] = [[2.1, 0.6, z0 + 0.35], [2.1, 2.7, z0 + 0.35], [2.1, 2.7, z0 + 0.8]];
  const subida: V3[] = [[x1 + 0.1, 0.6, 0.4], [x1 + 0.3, 0.6, CX.z], [x1 + 0.3, base + CX.h - 0.18, CX.z], [CX.x + 0.85, base + CX.h - 0.18, CX.z]];
  const descida: V3[] = [[CX.x - 0.4, base, CX.z], [CX.x - 0.4, laje - 0.4, CX.z], [-0.6, laje - 0.4, z0 + 0.35], [-2.4, laje - 0.4, z0 + 0.35], [-2.4, 1.75, z0 + 0.35]];
  const descChuv: V3[] = [[-0.6, laje - 0.4, z0 + 0.35], [2.1, laje - 0.4, z0 + 0.35], [2.1, 2.7, z0 + 0.35], [2.1, 2.7, z0 + 0.8]];

  const comCaixa = t > T.caixa + 0.5;
  const ruaSeca = t > T.falta && t < T.caixa;
  const fraca = t > T.pressao && t < T.caixa;
  const gravidade = t > T.gravidade + 0.4;
  const torneira = (t > T.torneira + 0.3 && t < T.falta) || (gravidade && t < T.lava);
  const chuveiroForte = gravidade && t < T.lava;

  return (
    <>
      <CameraRig t={t} />
      <hemisphereLight args={["#fff6e0", "#5a4030", 1.1]} />
      <directionalLight position={[8, 14, 10]} intensity={2.2} castShadow />
      <directionalLight position={[-10, 4, 8]} intensity={0.5} color="#bcd4ff" />
      <Ground />
      <Casa />
      <Tree p={[-7, 0.3, -3.5]} s={1.3} />
      <Tree p={[-9.5, 0.3, -4.5]} />
      <Hidrometro />
      {/* rede da rua */}
      {rede.slice(1).map((p, i) => <Tube key={"r" + i} a={rede[i]} b={p} r={0.16} c="#3a7bd5" />)}
      <Flow t={t} from={T.rua} to={ruaSeca ? T.falta : 1e9} path={rede} c={C.water} n={12} speed={fraca ? 0.12 : 0.35} />
      {/* ligação direta (antes da caixa) */}
      {!comCaixa ? (
        <>
          {direto.slice(1).map((p, i) => <Tube key={"d" + i} a={direto[i]} b={p} r={0.12} c={C.pipe} />)}
          {pChuveiro.slice(1).map((p, i) => <Tube key={"c" + i} a={pChuveiro[i]} b={p} r={0.12} c={C.pipe} />)}
          <Flow t={t} from={T.rua + 0.6} to={T.falta} path={direto} c={C.water} n={8} speed={0.45} />
        </>
      ) : null}
      {/* subida até a caixa e descida por gravidade */}
      {comCaixa ? subida.slice(1).map((p, i) => <Tube key={"s" + i} a={subida[i]} b={p} r={0.12} c={C.pipe} />) : null}
      {comCaixa && entradaAberta(t) ? <Flow t={t} from={T.caixa + 0.5} path={subida} c={C.water} n={10} speed={0.5} /> : null}
      {t > T.gravidade ? (
        <>
          {descida.slice(1).map((p, i) => <Tube key={"g" + i} a={descida[i]} b={p} r={0.12} c={C.pipe} />)}
          {descChuv.slice(1).map((p, i) => <Tube key={"h" + i} a={descChuv[i]} b={p} r={0.12} c={C.pipe} />)}
          <Flow t={t} from={T.gravidade + 0.3} to={T.lava} path={descida} c={C.water} n={10} speed={0.55} />
          <Flow t={t} from={T.gravidade + 0.3} to={T.lava} path={descChuv} c={C.water} n={10} speed={0.55} />
        </>
      ) : null}
      {/* chuveiro */}
      <mesh position={[2.1, 2.62, z0 + 0.85]}>
        <cylinderGeometry args={[0.28, 0.18, 0.14, 12]} />
        <Mat c="#d8d8d8" />
      </mesh>
      <Pingos t={t} on={fraca} p={[2.1, 2.5, z0 + 0.85]} n={3} altura={2.0} abre={0.1} />
      <Pingos t={t} on={chuveiroForte} p={[2.1, 2.5, z0 + 0.85]} n={22} altura={2.0} abre={0.45} />
      {/* torneira */}
      <Tube a={[-2.4, 1.75, z0 + 0.35]} b={[-2.4, 1.75, z0 + 0.65]} r={0.06} c="#c0c0c0" />
      <Pingos t={t} on={torneira} p={[-2.4, 1.7, z0 + 0.65]} n={8} altura={0.3} abre={0.03} />
      <Reservatorio t={t} />
      <Seta t={t} />
      <Mosquitos t={t} />
      <Guy t={t} plan={PLAN} yAt={guyY} scale={1.0} />
    </>
  );
};

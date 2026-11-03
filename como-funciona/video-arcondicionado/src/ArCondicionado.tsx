import React from "react";
import { C, T, appear, pop, windowed } from "./timeline";

const FONT = "Montserrat, sans-serif";
const HOT = "#FF6B3D";
const SKIN = "#f2c9a0";

export const Label: React.FC<{
  t: number;
  from: number;
  to: number;
  x: number;
  y: number;
  ax?: number;
  ay?: number;
  text: string;
  color?: string;
  size?: number;
}> = ({ t, from, to, x, y, ax, ay, text, color = C.lime, size = 32 }) => {
  const o = windowed(t, from, to, 0.25);
  if (o <= 0) return null;
  const s = pop(t, from, 0.45);
  const w = text.length * size * 0.74 + size;
  const h = size * 1.75;
  return (
    <g opacity={o}>
      {ax !== undefined && ay !== undefined ? (
        <>
          <line x1={ax} y1={ay} x2={x} y2={y} stroke={color} strokeWidth={size / 11} strokeDasharray={`${size / 5} ${size / 5}`} />
          <circle cx={ax} cy={ay} r={size / 5} fill={color} />
        </>
      ) : null}
      <g transform={`translate(${x} ${y}) scale(${s})`}>
        <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={h / 2} fill="rgba(6,9,10,0.92)" stroke={color} strokeWidth={size / 11} />
        <text x={0} y={size * 0.36} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={size} fill={color} letterSpacing={1}>
          {text}
        </text>
      </g>
    </g>
  );
};

const Stick: React.FC<{ x: number; y: number; s?: number; color?: string; armL?: number; armR?: number; flip?: boolean; children?: React.ReactNode }> = ({
  x,
  y,
  s = 1,
  color = C.white,
  armL = 0,
  armR = 0,
  flip,
  children,
}) => (
  <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`} stroke={color} strokeWidth={7} strokeLinecap="round" fill="none">
    <circle cx={0} cy={-150} r={20} fill={color} stroke="none" />
    <line x1={0} y1={-128} x2={0} y2={-60} />
    <line x1={0} y1={-60} x2={-22} y2={0} />
    <line x1={0} y1={-60} x2={22} y2={0} />
    <line x1={0} y1={-115} x2={-28} y2={-80 - armL * 60} />
    <line x1={0} y1={-115} x2={36} y2={-80 - armR * 60} />
    {children}
  </g>
);

/** Cano em zigue-zague (serpentina) entre x0 e x1. */
const coil = (x0: number, x1: number, y0: number, y1: number, n: number) => {
  let d = `M ${x0} ${y0}`;
  const step = (x1 - x0) / n;
  for (let i = 0; i < n; i++) d += ` L ${x0 + step * (i + 0.5)} ${i % 2 ? y0 : y1} L ${x0 + step * (i + 1)} ${i % 2 ? y1 : y0}`;
  return d;
};

const WALL = 640; // parede entre o quarto e a rua
const IN = { x0: 150, x1: 560, y0: 300, y1: 430 }; // unidade de dentro
const OUT = { x0: 720, x1: 1020, y0: 720, y1: 930 }; // caixa lá fora
const FLOOR = 980;

export const ArCondicionado: React.FC<{ t: number; dimmed: number }> = ({ t, dimmed }) => {
  const cams: [number, number, number, number][] = [
    [0, -620, 600, 1.15],
    [T.acaba, 590, 640, 1.05],
    [T.gas, 360, 400, 1.55],
    [T.ventilador, 340, 600, 1.05],
    [T.volta, 600, 640, 1.05],
    [T.aperta, 860, 800, 1.45],
    [T.esquenta, 760, 700, 1.05],
    [T.condensador, 600, 640, 1.05],
    [T.pinga, 380, 430, 1.6],
    [T.bate, 380, 420, 1.9],
    [T.seca, 590, 640, 1.05],
    [T.carrier, 590, 640, 1.05],
    [T.parabens, 590, 640, 1.05],
  ];
  let ci = 0;
  for (let k = 0; k < cams.length; k++) if (t >= cams[k][0]) ci = k;
  const prev = cams[Math.max(0, ci - 1)];
  const cur = cams[ci];
  const m = ci === 0 ? 1 : appear(t, cur[0], 1.1);
  const cx = prev[1] + (cur[1] - prev[1]) * m;
  const cy = prev[2] + (cur[2] - prev[2]) * m;
  const sc = prev[3] + (cur[3] - prev[3]) * m;

  const casa = pop(t, T.acaba + 0.2, 0.6);
  const unidade = pop(t, T.gas + 0.3, 0.6);
  const frio = t > T.gas + 1.2;
  const sopra = t > T.ventilador + 0.4;
  const fora = pop(t, T.aperta + 0.3, 0.6);
  const comp = t > T.aperta + 0.8;
  const quente = t > T.esquenta + 0.8;
  const gotas = t > T.bate + 0.6;
  const copo = windowed(t, T.bate + 2.2, T.seca + 0.4, 0.3);
  const seco = appear(t, T.seca + 0.4, 1.5);
  const fan = t * 720;
  const papel = windowed(t, T.carrier + 0.6, T.parabens, 0.3);

  return (
    <svg viewBox="0 0 1080 1150" width={1080} height={1150} style={{ overflow: "visible" }}>
      <defs>
        <filter id="glow" filterUnits="userSpaceOnUse" x="-3000" y="-3000" width="9000" height="9000">
          <feGaussianBlur stdDeviation="7" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <g opacity={1 - dimmed * 0.75} transform={`translate(540 575) scale(${sc}) translate(${-cx} ${-cy})`}>
        {/* ---------- álcool na mão ---------- */}
        {t < T.gas + 1 ? (
          <g opacity={1 - appear(t, T.acaba + 0.5, 0.6)}>
            <Stick x={-760} y={820} s={1.4} armR={0.9} />
            {/* mão aberta */}
            <g transform="translate(-660 560)">
              <ellipse rx={48} ry={34} fill={SKIN} />
              {[-30, -12, 6, 24].map((x, k) => (
                <rect key={k} x={x - 7} y={-78} width={14} height={50} rx={7} fill={SKIN} />
              ))}
              <rect x={30} y={-30} width={36} height={14} rx={7} fill={SKIN} transform="rotate(-30 30 -30)" />
              {/* frio na pele */}
              <ellipse rx={70} ry={56} fill={C.cyan} opacity={0.35 * appear(t, T.evaporar + 0.3, 1.0)} filter="url(#glow)" />
            </g>
            {/* frasco de álcool pingando */}
            <g transform="translate(-520 380)">
              <rect x={-40} y={-90} width={80} height={120} rx={12} fill="rgba(79,227,255,0.1)" stroke={C.cyan} strokeWidth={6} />
              <text x={0} y={-15} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={22} fill={C.cyan}>70%</text>
              {t > T.alcool + 0.3 && t < T.evaporar + 1
                ? [0, 1, 2].map((k) => {
                    const life = ((t - T.alcool) * 1.2 + k / 3) % 1;
                    return <circle key={k} cx={-60 - life * 80} cy={40 + life * 120} r={9} fill={C.cyan} opacity={1 - life * 0.5} />;
                  })
                : null}
            </g>
            {/* vapor levando o calor */}
            {t > T.evaporar
              ? [0, 1, 2, 3].map((k) => {
                  const life = ((t - T.evaporar) * 0.6 + k / 4) % 1;
                  const x = -700 + k * 26;
                  return <path key={k} d={`M ${x} ${470 - life * 160} q 16 -22 0 -44 q -16 -22 0 -44`} fill="none" stroke={HOT} strokeWidth={6} opacity={1 - life} filter="url(#glow)" />;
                })
              : null}
          </g>
        ) : null}
        <Label t={t} from={T.evaporar + 0.5} to={T.acaba} x={-680} y={250} text="LEVA O CALOR" color={HOT} size={30} />

        {/* ---------- a casa em corte ---------- */}
        {casa > 0 ? (
          <g opacity={casa}>
            <line x1={0} y1={FLOOR} x2={1200} y2={FLOOR} stroke={C.dim} strokeWidth={6} />
            <rect x={WALL - 20} y={160} width={40} height={FLOOR - 160} fill="rgba(159,179,173,0.18)" stroke={C.steel} strokeWidth={5} />
            <text x={300} y={950} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={30} fill={C.dim}>QUARTO</text>
            <text x={880} y={1030} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={30} fill={C.dim}>RUA</text>
            {/* pessoa no quarto, de calor e depois aliviada */}
            <Stick x={330} y={FLOOR} s={1.5} armL={sopra ? 0.9 : 0.1} armR={sopra ? 0.9 : 0.1} color={sopra ? C.cyan : HOT} />
            {!sopra && t > T.acaba + 0.6
              ? [0, 1].map((k) => <circle key={k} cx={330 + k * 14} cy={FLOOR - 190 + ((t * 60 + k * 30) % 40)} r={6} fill={C.cyan} />)
              : null}
            {/* sol lá fora */}
            <circle cx={980} cy={260} r={60} fill={C.amber} opacity={0.85} filter="url(#glow)" />
          </g>
        ) : null}

        {/* unidade de dentro (evaporador) */}
        {unidade > 0 ? (
          <g transform={`translate(${(IN.x0 + IN.x1) / 2} ${(IN.y0 + IN.y1) / 2}) scale(${unidade}) translate(${-(IN.x0 + IN.x1) / 2} ${-(IN.y0 + IN.y1) / 2})`}>
            <rect x={IN.x0} y={IN.y0} width={IN.x1 - IN.x0} height={IN.y1 - IN.y0} rx={26} fill="rgba(242,247,244,0.06)" stroke={C.white} strokeWidth={7} />
            <path d={coil(IN.x0 + 30, IN.x1 - 30, IN.y0 + 30, IN.y0 + 80, 12)} fill="none" stroke={frio ? C.cyan : C.steel} strokeWidth={8} strokeLinejoin="round" filter={frio ? "url(#glow)" : undefined} />
            {/* ventilador (tangencial) */}
            <g transform={`translate(${(IN.x0 + IN.x1) / 2} ${IN.y1 - 30})`}>
              <rect x={-150} y={-16} width={300} height={32} rx={16} fill="none" stroke={C.steel} strokeWidth={4} />
              {Array.from({ length: 12 }).map((_, k) => {
                const x = -140 + ((k * 25 + (sopra ? t * 300 : 0)) % 280);
                return <line key={k} x1={x} y1={-12} x2={x + 8} y2={12} stroke={C.steel} strokeWidth={4} />;
              })}
            </g>
            {/* gotinhas no cano gelado */}
            {gotas
              ? Array.from({ length: 10 }).map((_, k) => {
                  const life = ((t - T.bate) * 0.5 + k / 10) % 1;
                  const x = IN.x0 + 50 + k * 34;
                  return <circle key={k} cx={x} cy={IN.y0 + 84 + life * 14} r={5 + life * 4} fill={C.cyan} opacity={0.9} />;
                })
              : null}
          </g>
        ) : null}
        {/* ar frio saindo */}
        {sopra
          ? Array.from({ length: 6 }).map((_, k) => {
              const life = ((t - T.ventilador) * 0.6 + k / 6) % 1;
              const x = IN.x0 + 60 + k * 60;
              return <path key={k} d={`M ${x} ${IN.y1 + 10 + life * 300} q 20 30 0 60`} fill="none" stroke={C.cyan} strokeWidth={7} opacity={(1 - life) * 0.9} strokeLinecap="round" filter="url(#glow)" />;
            })
          : null}
        {/* ar úmido entrando (setas que voltam) */}
        {t > T.pinga && t < T.carrier
          ? Array.from({ length: 4 }).map((_, k) => {
              const life = ((t - T.pinga) * 0.5 + k / 4) % 1;
              return <circle key={k} cx={IN.x1 - 40 - life * 300} cy={IN.y0 - 30 - Math.sin(life * 3) * 10} r={8} fill={C.white} opacity={(1 - life) * 0.6 * (1 - seco)} />;
            })
          : null}

        {/* canos entre as unidades */}
        {unidade > 0.9 ? (
          <g>
            <path d={`M ${IN.x1} ${IN.y0 + 40} H ${WALL + 60} V ${OUT.y0 + 60} H ${OUT.x0}`} fill="none" stroke={C.cyan} strokeWidth={10} opacity={0.5} />
            <path d={`M ${IN.x1} ${IN.y1 - 50} H ${WALL + 30} V ${OUT.y0 + 120} H ${OUT.x0}`} fill="none" stroke={quente ? HOT : C.steel} strokeWidth={10} opacity={0.5} />
            {fora > 0.5 ? (
              <>
                <path d={`M ${OUT.x0} ${OUT.y0 + 60} H ${WALL + 60} V ${IN.y0 + 40} H ${IN.x1}`} fill="none" stroke={C.cyan} strokeWidth={10} strokeDasharray="26 22" strokeDashoffset={-t * 120} filter="url(#glow)" />
                <path d={`M ${IN.x1} ${IN.y1 - 50} H ${WALL + 30} V ${OUT.y0 + 120} H ${OUT.x0}`} fill="none" stroke={HOT} strokeWidth={10} strokeDasharray="26 22" strokeDashoffset={-t * 120} filter="url(#glow)" />
              </>
            ) : null}
            {/* mangueira do dreno, pingando lá fora */}
            {t > T.pinga + 0.4 ? (
              <>
                <path d={`M ${IN.x0 + 40} ${IN.y1} V ${IN.y1 + 30} H ${WALL + 90} V 620`} fill="none" stroke={C.white} strokeWidth={6} opacity={0.6} />
                {[0, 1, 2].map((k) => {
                  const life = ((t - T.pinga) * 0.9 + k / 3) % 1;
                  return <ellipse key={k} cx={WALL + 90} cy={630 + life * 340} rx={8} ry={12} fill={C.cyan} filter="url(#glow)" />;
                })}
              </>
            ) : null}
          </g>
        ) : null}

        {/* caixa lá fora: compressor + condensador */}
        {fora > 0 ? (
          <g transform={`translate(${(OUT.x0 + OUT.x1) / 2} ${(OUT.y0 + OUT.y1) / 2}) scale(${fora}) translate(${-(OUT.x0 + OUT.x1) / 2} ${-(OUT.y0 + OUT.y1) / 2})`}>
            <rect x={OUT.x0} y={OUT.y0} width={OUT.x1 - OUT.x0} height={OUT.y1 - OUT.y0} rx={20} fill="rgba(242,247,244,0.05)" stroke={C.white} strokeWidth={7} />
            <path d={coil(OUT.x0 + 20, OUT.x0 + 130, OUT.y0 + 30, OUT.y1 - 30, 6)} fill="none" stroke={quente ? HOT : C.steel} strokeWidth={8} filter={quente ? "url(#glow)" : undefined} />
            {/* compressor */}
            <g transform={`translate(${OUT.x0 + 70} ${OUT.y1 - 60}) ${comp ? `translate(${Math.sin(t * 50) * 2} 0)` : ""}`}>
              <rect x={-38} y={-50} width={76} height={90} rx={30} fill="rgba(255,77,94,0.25)" stroke={C.red} strokeWidth={6} filter="url(#glow)" />
            </g>
            {/* ventilador */}
            <g transform={`translate(${OUT.x1 - 80} ${(OUT.y0 + OUT.y1) / 2})`}>
              <circle r={70} fill="none" stroke={C.steel} strokeWidth={5} />
              <g transform={`rotate(${quente ? fan : 0})`}>
                {[0, 120, 240].map((a) => (
                  <ellipse key={a} cx={0} cy={-34} rx={16} ry={34} fill={C.steel} transform={`rotate(${a})`} opacity={0.8} />
                ))}
              </g>
            </g>
          </g>
        ) : null}
        {/* calor indo pra rua */}
        {quente
          ? [0, 1, 2].map((k) => {
              const life = ((t - T.esquenta) * 0.6 + k / 3) % 1;
              return <path key={k} d={`M ${OUT.x1 + 20 + life * 160} ${OUT.y0 + 40 + k * 60} q 20 -20 40 0 t 40 0`} fill="none" stroke={HOT} strokeWidth={7} opacity={1 - life} filter="url(#glow)" />;
            })
          : null}

        {/* copo de refrigerante suando */}
        {copo > 0 ? (
          <g opacity={copo} transform={`translate(160 560) scale(${pop(t, T.bate + 2.2, 0.4)})`}>
            <path d="M -50 -90 L 50 -90 L 38 90 L -38 90 Z" fill="rgba(160,80,40,0.35)" stroke={C.white} strokeWidth={6} />
            {Array.from({ length: 8 }).map((_, k) => (
              <circle key={k} cx={-36 + ((k * 23) % 70)} cy={-70 + k * 20} r={6} fill={C.cyan} />
            ))}
            {[-20, 10].map((x) => (
              <rect key={x} x={x - 12} y={-80} width={24} height={24} rx={4} fill="rgba(79,227,255,0.4)" stroke={C.cyan} strokeWidth={3} />
            ))}
          </g>
        ) : null}

        {/* 1902: papel ondulado na gráfica */}
        {papel > 0 ? (
          <g opacity={papel} transform="translate(300 640)">
            <path d={`M -90 0 q 30 ${-20 * (1 - appear(t, T.carrier + 2.5, 1))} 60 0 t 60 0 t 60 0 V 120 H -90 Z`} fill="rgba(242,247,244,0.9)" stroke={C.white} strokeWidth={4} />
            <line x1={-70} y1={40} x2={70} y2={40} stroke={C.dim} strokeWidth={6} />
            <line x1={-70} y1={70} x2={50} y2={70} stroke={C.dim} strokeWidth={6} />
          </g>
        ) : null}

        {/* etiquetas */}
        <Label t={t} from={T.evaporador + 0.1} to={T.ventilador + 1.5} x={360} y={250} ax={360} ay={IN.y0 + 40} text="EVAPORADOR" color={C.cyan} size={32} />
        <Label t={t} from={T.ventilador + 1.2} to={T.volta} x={330} y={790} text="AR FRIO" color={C.cyan} size={32} />
        <Label t={t} from={T.volta + 0.6} to={T.aperta} x={800} y={520} text="GÁS VOLTA COMO?" color={C.red} size={26} />
        <Label t={t} from={T.compressor + 0.1} to={T.esquenta} x={790} y={640} ax={OUT.x0 + 70} ay={OUT.y1 - 100} text="COMPRESSOR" color={C.red} size={30} />
        <Label t={t} from={T.esquenta + 1.4} to={T.condensador} x={1050} y={620} text="CALOR PRA RUA" color={HOT} size={28} />
        <Label t={t} from={T.condensador + 0.1} to={T.pinga} x={870} y={1000} ax={OUT.x0 + 70} ay={OUT.y1 - 10} text="CONDENSADOR" color={HOT} size={30} />
        <Label t={t} from={T.bate + 0.8} to={T.seca} x={420} y={510} text="VAPOR VIRA GOTA" color={C.lime} size={22} />
        <Label t={t} from={T.bate + 2.4} to={T.seca + 0.4} x={250} y={690} text="IGUAL NO COPO" color={C.cyan} size={24} />
        <Label t={t} from={T.seca + 0.6} to={T.carrier} x={300} y={640} text="AR MAIS SECO" color={C.amber} size={30} />
        <Label t={t} from={T.parabens + 0.2} to={999} x={350} y={230} ax={360} ay={IN.y0 + 30} text="EVAPORADOR" color={C.cyan} size={24} />
        <Label t={t} from={T.parabens + 0.35} to={999} x={820} y={650} ax={OUT.x0 + 70} ay={OUT.y1 - 100} text="COMPRESSOR" color={C.red} size={24} />
        <Label t={t} from={T.parabens + 0.5} to={999} x={880} y={1010} ax={OUT.x0 + 90} ay={OUT.y1 - 10} text="CONDENSADOR" color={HOT} size={24} />
      </g>
    </svg>
  );
};

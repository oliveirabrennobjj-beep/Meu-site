import React from "react";
import { random } from "remotion";
import { C, T, appear, pop, windowed } from "./timeline";

const FONT = "Montserrat, sans-serif";

const Frame: React.FC<{
  t: number;
  from: number;
  to: number;
  tag: string;
  title: string;
  sub: string;
  color: string;
  children: React.ReactNode;
}> = ({ t, from, to, tag, title, sub, color, children }) => {
  const o = windowed(t, from, to, 0.3);
  if (o <= 0) return null;
  const s = 0.85 + 0.15 * pop(t, from, 0.5);
  return (
    <div
      style={{
        position: "absolute",
        left: 70,
        top: 560,
        width: 940,
        height: 880,
        opacity: o,
        scale: String(s),
        borderRadius: 40,
        border: `3px solid ${color}`,
        background: "rgba(11,20,18,0.94)",
        boxShadow: `0 0 60px ${color}2e`,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 36,
          left: 40,
          padding: "10px 22px",
          borderRadius: 999,
          background: color,
          color: C.bg,
          fontFamily: FONT,
          fontWeight: 900,
          fontSize: 30,
          letterSpacing: 2,
        }}
      >
        {tag}
      </div>
      <svg viewBox="0 0 940 600" width={940} height={600} style={{ position: "absolute", top: 110 }}>
        {children}
      </svg>
      <div style={{ position: "absolute", left: 40, right: 40, bottom: 50, fontFamily: FONT, color: C.white }}>
        <div style={{ fontWeight: 900, fontSize: 64, lineHeight: 1 }}>{title}</div>
        <div style={{ fontWeight: 600, fontSize: 36, color: C.steel, marginTop: 12 }}>{sub}</div>
      </div>
    </div>
  );
};

/** Someone getting out of the pool: water evaporating carries heat away from the skin. */
const Pool: React.FC<{ t: number }> = ({ t }) => {
  const shiver = t > T.pool + 1.2 ? Math.sin(t * 60) * 3 : 0;
  const steam = appear(t, T.pool + 1.6, 0.5);
  return (
    <Frame t={t} from={T.pool} to={T.pipe} tag="REPARA" title="A água evapora" sub="e leva o calor da sua pele junto" color={C.cyan}>
      {/* pool */}
      <rect x={40} y={430} width={860} height={150} rx={20} fill={C.ink} opacity={0.35} />
      {[0, 1, 2].map((k) => (
        <path key={k} d={`M ${80 + k * 280} ${470 + (k % 2) * 40} q 40 -20 80 0 t 80 0`} stroke={C.cyan} strokeWidth={5} fill="none" opacity={0.6} />
      ))}
      {/* person */}
      <g transform={`translate(${470 + shiver} 400)`} stroke={C.white} strokeWidth={9} strokeLinecap="round" fill="none">
        <circle cx={0} cy={-260} r={42} fill={C.white} stroke="none" />
        <line x1={0} y1={-215} x2={0} y2={-90} />
        <line x1={0} y1={-90} x2={-40} y2={0} />
        <line x1={0} y1={-90} x2={40} y2={0} />
        <path d="M 0 -190 L -55 -130 L -10 -120" />
        <path d="M 0 -190 L 55 -130 L 10 -120" />
      </g>
      {/* drops turning into steam, carrying heat (red) away */}
      {Array.from({ length: 12 }).map((_, i) => {
        const life = 1.8;
        const p = ((t + random(`p${i}`) * life) % life) / life;
        const x0 = 470 + (random(`px${i}`) - 0.5) * 160;
        const y0 = 160 + random(`py${i}`) * 220;
        return (
          <g key={i}>
            <circle cx={x0} cy={y0} r={7} fill={C.cyan} opacity={(1 - steam) * 0.9} />
            <circle cx={x0 + Math.sin((t + i) * 4) * 12} cy={y0 - p * 180} r={9 * (1 - p)} fill={C.red} opacity={steam * (1 - p) * 0.9} />
          </g>
        );
      })}
      <text x={780} y={120} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={44} fill={C.cyan} opacity={appear(t, T.pool + 1.0, 0.3)}>
        BRRR!
      </text>
    </Frame>
  );
};

const Perkins: React.FC<{ t: number }> = ({ t }) => {
  const crank = (t - T.perkins) * 3;
  return (
    <Frame t={t} from={T.perkins} to={T.seal} tag="INGLATERRA · 1834" title="Jacob Perkins" sub="patenteou a primeira máquina de gelo assim" color={C.amber}>
      {/* patent paper */}
      <g transform="translate(70 70) rotate(-5)">
        <rect x={0} y={0} width={360} height={430} rx={10} fill="#e9e4d6" />
        <rect x={30} y={30} width={300} height={40} fill="#2b2b2b" />
        {Array.from({ length: 7 }).map((_, k) => (
          <rect key={k} x={30} y={100 + k * 34} width={k % 3 === 2 ? 180 : 300} height={12} rx={4} fill="#6b6b6b" />
        ))}
        <circle cx={270} cy={370} r={38} fill="none" stroke="#b03030" strokeWidth={6} />
        <text x={270} y={382} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={28} fill="#b03030">
          1834
        </text>
      </g>
      {/* hand-cranked machine making ice */}
      <g transform="translate(640 330)">
        <rect x={-120} y={-60} width={240} height={150} rx={16} fill="#3a2f1c" stroke={C.amber} strokeWidth={5} />
        <circle cx={0} cy={15} r={44} fill="none" stroke={C.amber} strokeWidth={6} />
        <line x1={0} y1={15} x2={44 * Math.cos(crank)} y2={15 + 44 * Math.sin(crank)} stroke={C.amber} strokeWidth={8} strokeLinecap="round" />
        <rect x={-60} y={110} width={120} height={70} rx={10} fill={C.frost} opacity={0.4 + 0.5 * appear(t, T.perkins + 1.5, 1)} stroke={C.frost} strokeWidth={4} />
        <text x={0} y={-90} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={36} fill={C.lime} opacity={appear(t, T.perkins + 1.8, 0.3)}>
          GELO!
        </text>
      </g>
    </Frame>
  );
};

export const Cards: React.FC<{ t: number }> = ({ t }) => (
  <>
    <Pool t={t} />
    <Perkins t={t} />
  </>
);

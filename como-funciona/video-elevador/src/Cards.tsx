import React from "react";
import { C, appear, kf, pop, windowed } from "./timeline";

const FONT = "Montserrat, sans-serif";

const Frame: React.FC<{
  t: number;
  from: number;
  to: number;
  tag: string;
  title: string;
  sub: string;
  children: React.ReactNode;
}> = ({ t, from, to, tag, title, sub, children }) => {
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
        transform: `scale(${s})`,
        borderRadius: 40,
        border: `3px solid ${C.amber}`,
        background: "rgba(11,20,18,0.94)",
        boxShadow: `0 0 60px rgba(255,201,77,0.18)`,
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
          background: C.amber,
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
      <div
        style={{
          position: "absolute",
          left: 40,
          right: 40,
          bottom: 50,
          fontFamily: FONT,
          color: C.white,
        }}
      >
        <div style={{ fontWeight: 900, fontSize: 64, lineHeight: 1 }}>{title}</div>
        <div style={{ fontWeight: 600, fontSize: 36, color: C.steel, marginTop: 12 }}>{sub}</div>
      </div>
    </div>
  );
};

const Man: React.FC<{ x: number; y: number; s?: number; hat?: boolean; arms?: number; color?: string }> = ({
  x,
  y,
  s = 1,
  hat,
  arms = 0,
  color = C.white,
}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} stroke={color} strokeWidth={7} strokeLinecap="round" fill="none">
    <circle cx={0} cy={-150} r={20} fill={color} stroke="none" />
    {hat ? (
      <g fill={color} stroke="none">
        <rect x={-16} y={-210} width={32} height={40} />
        <rect x={-28} y={-174} width={56} height={8} />
      </g>
    ) : null}
    <line x1={0} y1={-128} x2={0} y2={-60} />
    <line x1={0} y1={-60} x2={-22} y2={0} />
    <line x1={0} y1={-60} x2={22} y2={0} />
    <line x1={0} y1={-115} x2={-30} y2={-80 - arms * 60} />
    <line x1={0} y1={-115} x2={30} y2={-80 - arms * 60} />
  </g>
);

export const Cards: React.FC<{ t: number }> = ({ t }) => {
  // Arquimedes: crane with pulley lifting a stone
  const lift = kf(t, [
    [11.6, 0],
    [14.4, 1],
  ]);
  // Coliseu: capstan turning, lion rising
  const rise = kf(t, [
    [17.6, 0],
    [20.6, 1],
  ]);
  const spin = (t - 16.8) * 120;
  // Otis: rope cut, platform drops a bit and stops
  const cut = t > 59.0;
  const drop = kf(t, [
    [59.0, 0],
    [59.35, 30, "in"],
  ]);

  return (
    <>
      <Frame t={t} from={11.4} to={14.85} tag="SÉC. III a.C." title="Arquimedes" sub="roldanas pra levantar cargas">
        <line x1={0} y1={540} x2={940} y2={540} stroke={C.steel} strokeWidth={5} />
        <line x1={380} y1={540} x2={470} y2={90} stroke={C.amber} strokeWidth={14} strokeLinecap="round" />
        <line x1={560} y1={540} x2={470} y2={90} stroke={C.amber} strokeWidth={14} strokeLinecap="round" />
        <circle cx={470} cy={110} r={40} fill="none" stroke={C.lime} strokeWidth={8} />
        <line x1={430} y1={110} x2={430} y2={440 - lift * 220} stroke="#e9d7b0" strokeWidth={6} />
        <line x1={510} y1={110} x2={700} y2={400} stroke="#e9d7b0" strokeWidth={6} />
        <rect x={370} y={440 - lift * 220} width={120} height={95} rx={8} fill="#7b6a55" stroke={C.amber} strokeWidth={5} />
        <Man x={730} y={540} arms={0.9 + Math.sin(t * 6) * 0.2} />
      </Frame>

      <Frame t={t} from={16.86} to={21.1} tag="ROMA · SÉC. I" title="Coliseu" sub="leões subindo até a arena, na força do braço">
        {[0, 1, 2, 3, 4, 5].map((k) => (
          <path
            key={k}
            d={`M ${60 + k * 140} 230 V 140 A 55 55 0 0 1 ${170 + k * 140} 140 V 230`}
            fill="none"
            stroke={C.dim}
            strokeWidth={6}
          />
        ))}
        <rect x={0} y={230} width={940} height={14} fill={C.steel} />
        <rect x={600} y={230} width={160} height={14} fill={C.bg2} />
        {/* lift shaft & lion platform */}
        <line x1={600} y1={244} x2={600} y2={560} stroke={C.dim} strokeWidth={4} />
        <line x1={760} y1={244} x2={760} y2={560} stroke={C.dim} strokeWidth={4} />
        <g transform={`translate(680 ${520 - rise * 290})`}>
          <rect x={-75} y={0} width={150} height={12} fill={C.amber} />
          <g transform="translate(0 -60)">
            {Array.from({ length: 12 }).map((_, k) => (
              <line
                key={k}
                x1={0}
                y1={0}
                x2={Math.cos((k / 12) * Math.PI * 2) * 58}
                y2={Math.sin((k / 12) * Math.PI * 2) * 58}
                stroke={C.amber}
                strokeWidth={14}
                strokeLinecap="round"
              />
            ))}
            <circle r={36} fill="#e7b85c" />
            <circle cx={-12} cy={-6} r={5} fill={C.bg} />
            <circle cx={12} cy={-6} r={5} fill={C.bg} />
            <path d="M -10 14 Q 0 22 10 14" stroke={C.bg} strokeWidth={4} fill="none" />
          </g>
        </g>
        <line x1={680} y1={244} x2={680} y2={520 - rise * 290 - 120} stroke="#e9d7b0" strokeWidth={4} />
        {/* capstan */}
        <g transform="translate(270 470)">
          <ellipse rx={70} ry={20} fill="none" stroke={C.amber} strokeWidth={6} />
          <rect x={-18} y={-80} width={36} height={80} fill="#7b6a55" />
          {[0, 1].map((k) => {
            const a = ((spin + k * 180) * Math.PI) / 180;
            return (
              <g key={k}>
                <line x1={0} y1={-50} x2={Math.cos(a) * 150} y2={-50 + Math.sin(a) * 30} stroke={C.amber} strokeWidth={10} strokeLinecap="round" />
                <Man x={Math.cos(a) * 150} y={90 + Math.sin(a) * 30} s={0.75} arms={0.2} color={Math.sin(a) > 0 ? C.white : C.steel} />
              </g>
            );
          })}
        </g>
        <path d="M 288 420 Q 480 400 680 260" stroke="#e9d7b0" strokeWidth={4} fill="none" opacity={0.6} />
      </Frame>

      <Frame t={t} from={55.36} to={61.2} tag="NOVA YORK · 1854" title="Elisha Otis" sub="mandou cortar a corda na frente do público">
        <line x1={300} y1={20} x2={300} y2={580} stroke={C.steel} strokeWidth={8} />
        <line x1={640} y1={20} x2={640} y2={580} stroke={C.steel} strokeWidth={8} />
        {Array.from({ length: 14 }).map((_, k) => (
          <g key={k}>
            <line x1={300} y1={30 + k * 40} x2={318} y2={45 + k * 40} stroke={C.steel} strokeWidth={4} />
            <line x1={640} y1={30 + k * 40} x2={622} y2={45 + k * 40} stroke={C.steel} strokeWidth={4} />
          </g>
        ))}
        <g transform={`translate(0 ${drop})`}>
          <rect x={310} y={360} width={320} height={16} fill={C.amber} />
          <Man x={470} y={360} hat arms={cut ? 1.3 : 0.3} />
          <line x1={470} y1={140} x2={470} y2={cut ? 100 : 20} stroke="#e9d7b0" strokeWidth={6} />
          <line x1={318} y1={376} x2={318} y2={350} stroke={C.lime} strokeWidth={8} />
          <line x1={622} y1={376} x2={622} y2={350} stroke={C.lime} strokeWidth={8} />
          <line x1={330} y1={150} x2={610} y2={150} stroke={C.steel} strokeWidth={6} />
          <line x1={330} y1={150} x2={330} y2={360} stroke={C.steel} strokeWidth={4} />
          <line x1={610} y1={150} x2={610} y2={360} stroke={C.steel} strokeWidth={4} />
          <line x1={470} y1={140} x2={470} y2={150} stroke={C.steel} strokeWidth={6} />
        </g>
        {t > 58.8 && t < 59.6 ? (
          <g transform="translate(470 60)" opacity={1 - appear(t, 59.3, 0.3)}>
            <path d="M -50 -20 L 40 10 M -50 20 L 40 -10" stroke={C.red} strokeWidth={10} strokeLinecap="round" />
            <circle cx={-56} cy={-22} r={14} fill="none" stroke={C.red} strokeWidth={6} />
            <circle cx={-56} cy={22} r={14} fill="none" stroke={C.red} strokeWidth={6} />
          </g>
        ) : null}
        {cut ? (
          <text x={470} y={530} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={56} fill={C.lime} opacity={appear(t, 59.4)}>
            NÃO CAIU!
          </text>
        ) : null}
      </Frame>
    </>
  );
};

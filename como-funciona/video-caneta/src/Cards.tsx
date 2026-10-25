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
        scale: String(s),
        borderRadius: 40,
        border: `3px solid ${C.amber}`,
        background: "rgba(11,20,18,0.94)",
        boxShadow: "0 0 60px rgba(255,201,77,0.18)",
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
      <div style={{ position: "absolute", left: 40, right: 40, bottom: 50, fontFamily: FONT, color: C.white }}>
        <div style={{ fontWeight: 900, fontSize: 64, lineHeight: 1 }}>{title}</div>
        <div style={{ fontWeight: 600, fontSize: 36, color: C.steel, marginTop: 12 }}>{sub}</div>
      </div>
    </div>
  );
};

export const Cards: React.FC<{ t: number }> = ({ t }) => {
  const press = kf(t, [
    [24.0, -260],
    [25.0, 0, "out"],
  ]);
  const dryP = appear(t, 28.0, 1.6);
  return (
    <Frame t={t} from={23.26} to={30.05} tag="HUNGRIA · 1938" title="László Bíró" sub="jornalista que viu a tinta de jornal secar rápido">
      {/* newspaper */}
      <g transform={`translate(80 ${80 + press * 0.2}) rotate(-4)`}>
        <rect x={0} y={0} width={420} height={460} rx={10} fill="#e9e4d6" />
        <rect x={30} y={30} width={360} height={46} fill="#2b2b2b" />
        {Array.from({ length: 9 }).map((_, k) => (
          <rect key={k} x={30} y={100 + k * 36} width={k % 3 === 2 ? 220 : 360} height={14} rx={4} fill="#6b6b6b" />
        ))}
        <rect x={250} y={170} width={140} height={110} fill="#9a9a9a" />
      </g>
      {/* ink drop drying */}
      <g transform="translate(560 220)">
        <path d="M 0 -80 C 50 -20 60 20 0 60 C -60 20 -50 -20 0 -80 Z" fill={C.ink} opacity={1 - dryP * 0.75} />
        <text x={0} y={140} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={40} fill={C.lime} opacity={dryP}>
          SECA RÁPIDO!
        </text>
      </g>
      {/* Bíró */}
      <g transform="translate(800 520)" stroke={C.white} strokeWidth={7} strokeLinecap="round" fill="none">
        <circle cx={0} cy={-190} r={30} fill={C.white} stroke="none" />
        <path d="M -16 -178 Q 0 -168 16 -178" stroke={C.bg} strokeWidth={6} />
        <circle cx={-11} cy={-196} r={9} stroke={C.bg} strokeWidth={3} />
        <circle cx={11} cy={-196} r={9} stroke={C.bg} strokeWidth={3} />
        <line x1={0} y1={-158} x2={0} y2={-70} />
        <line x1={0} y1={-70} x2={-26} y2={0} />
        <line x1={0} y1={-70} x2={26} y2={0} />
        <line x1={0} y1={-140} x2={-40} y2={-100} />
        <line x1={0} y1={-140} x2={-60} y2={-160} />
        <line x1={-60} y1={-160} x2={-80} y2={-210} stroke={C.ink} strokeWidth={8} />
      </g>
    </Frame>
  );
};

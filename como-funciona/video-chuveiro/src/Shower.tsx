import React from "react";
import { random } from "remotion";
import { C, T, appear, kf, pop, windowed } from "./timeline";

const FONT = "Montserrat, sans-serif";

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

const Stick: React.FC<{ x: number; y: number; s?: number; color?: string; arms?: number; shake?: number }> = ({ x, y, s = 1, color = C.white, arms = 0, shake = 0 }) => (
  <g transform={`translate(${x + shake} ${y}) scale(${s})`} stroke={color} strokeWidth={7} strokeLinecap="round" fill="none">
    <circle cx={0} cy={-150} r={20} fill={color} stroke="none" />
    <line x1={0} y1={-128} x2={0} y2={-60} />
    <line x1={0} y1={-60} x2={-22} y2={0} />
    <line x1={0} y1={-60} x2={22} y2={0} />
    <line x1={0} y1={-115} x2={-28} y2={-80 - arms * 60} />
    <line x1={0} y1={-115} x2={28} y2={-80 - arms * 60} />
  </g>
);

const mix = (a: string, b: string, k: number) => {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  return `rgb(${pa.map((v, i) => Math.round(v + (pb[i] - v) * Math.max(0, Math.min(1, k)))).join(",")})`;
};

// geometria do chuveiro
const X0 = 380;
const X1 = 700;
const TOP = 150;
const BOT = 500;
const COIL_Y = 410;
const MID = 540;

const coil = (x0: number, x1: number) => {
  const pts: string[] = [];
  const n = Math.round((x1 - x0) / 20);
  for (let i = 0; i <= n; i++) pts.push(`${x0 + i * 20},${COIL_Y + (i % 2 ? -26 : 26)}`);
  return pts.join(" ");
};

export const Shower: React.FC<{ t: number; dimmed: number }> = ({ t, dimmed }) => {
  const built = appear(t, T.fio, 0.6);
  const bucket = 1 - appear(t, T.fio - 0.3, 0.5);

  // fluxo de água (0 = sem água, 1 = normal, 0.4 = pouca)
  const flow =
    t < T.fio
      ? 0
      : t < T.semAgua
        ? 1
        : t < T.borracha + 1.2
          ? 0
          : t >= T.poucas && t < T.verao
            ? 0.4
            : 1;
  const diaphragmOn = t >= T.borracha + 1.2;
  const power = t < T.fio ? 0 : diaphragmOn ? (flow > 0 ? 1 : 0) : 1;
  const mode: "full" | "verao" | "inverno" = t >= T.inverno ? "inverno" : t >= T.inteiro ? "verao" : "full";
  const strength = mode === "inverno" ? 1 : mode === "verao" ? 0.55 : 0.8;
  const overheat = t >= T.semAgua && t < T.borracha ? appear(t, T.semAgua + 0.4, 1.2) : 0;
  const heat = power * strength + overheat * 0.8;
  const coilColor = mix("#9fb3ad", overheat > 0.5 ? "#ffffff" : "#ff5a2a", heat);
  const temp = flow > 0 ? 22 + (heat * 18) / Math.max(0.35, flow) : 22;
  const waterColor = mix("#4FE3FF", "#FF8A3D", (temp - 24) / 30);
  const bulge = diaphragmOn ? kf(t, [[T.borracha + 1.0, 0], [T.borracha + 1.5, flow > 0 ? 1 : 0]]) * (flow > 0 ? 1 : 0) : 0;
  const shockOn = t >= T.choque + 0.5 && t < T.terra + 0.6;
  const groundIn = appear(t, T.terra + 0.6, 0.6);
  const crivoGlow = windowed(t, T.crivo, T.parabens, 0.3);

  // câmera
  const zoomChamber = Math.max(windowed(t, T.fio + 0.2, T.menos, 0.6), windowed(t, T.verao, T.choque, 0.6));
  const zoomCrivo = windowed(t, T.crivo, T.parabens, 0.5);
  const sc = 1 + zoomChamber * 0.55 + zoomCrivo * 0.5 - appear(t, T.parabens, 0.6) * 0.05;
  const cx = 540 + zoomChamber * 40;
  const cy = 575 + zoomChamber * (330 - 575) + zoomCrivo * (560 - 575);

  // gotas
  const drops =
    flow > 0
      ? Array.from({ length: Math.round(26 * flow) }).map((_, k) => {
          const sp = 520 + random(`v${k}`) * 160;
          const ph = random(`p${k}`) * 600;
          const y = 540 + ((t * sp + ph) % 560);
          const spread = crivoGlow > 0 ? 1.4 : 1;
          const x = MID + (random(`x${k}`) - 0.5) * 260 * spread * ((y - 520) / 560 + 0.4);
          return { x, y };
        })
      : [];

  const sparks = (x: number, y: number, n: number, seed: string, len = 40) =>
    Array.from({ length: n }).map((_, k) => {
      const a = random(`${seed}${k}${Math.floor(t * 20)}`) * Math.PI * 2;
      const l = len * (0.4 + random(`${seed}l${k}${Math.floor(t * 20)}`));
      return <line key={k} x1={x} y1={y} x2={x + Math.cos(a) * l} y2={y + Math.sin(a) * l} stroke={k % 2 ? C.amber : C.white} strokeWidth={4} strokeLinecap="round" />;
    });

  return (
    <svg viewBox="0 0 1080 1150" width={1080} height={1150} style={{ overflow: "visible" }}>
      <defs>
        <filter id="glow" filterUnits="userSpaceOnUse" x="-600" y="-600" width="2400" height="2400">
          <feGaussianBlur stdDeviation="7" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <g opacity={1 - dimmed * 0.75} transform={`translate(540 575) scale(${sc}) translate(${-cx} ${-cy})`}>
        {/* azulejos */}
        {Array.from({ length: 10 }).map((_, k) => (
          <line key={`v${k}`} x1={k * 120} y1={-200} x2={k * 120} y2={1100} stroke={C.white} strokeOpacity={0.04} strokeWidth={3} />
        ))}
        {Array.from({ length: 11 }).map((_, k) => (
          <line key={`h${k}`} x1={-100} y1={k * 120 - 200} x2={1180} y2={k * 120 - 200} stroke={C.white} strokeOpacity={0.04} strokeWidth={3} />
        ))}
        <rect x={-300} y={1100} width={1680} height={300} fill="rgba(79,227,255,0.06)" />
        <line x1={-300} y1={1100} x2={1380} y2={1100} stroke={C.steel} strokeWidth={4} />

        {/* cena do balde */}
        {bucket > 0 ? (
          <g opacity={bucket}>
            <g transform="translate(220 1100)">
              <path d="M -50 0 Q -40 -80 0 -110 Q 10 -60 40 -90 Q 60 -40 50 0 Z" fill={C.amber} filter="url(#glow)" />
              <path d="M -20 0 Q -15 -40 5 -60 Q 15 -30 25 0 Z" fill={C.red} />
            </g>
            <g transform={`translate(560 780) rotate(${kf(t, [[0, 0], [1.6, 50]])})`}>
              <path d="M -70 -60 L 70 -60 L 55 60 L -55 60 Z" fill="rgba(255,201,77,0.2)" stroke={C.amber} strokeWidth={6} />
            </g>
            {t > 1.6
              ? Array.from({ length: 14 }).map((_, k) => {
                  const y = 840 + ((t * 600 + k * 40) % 120);
                  return <circle key={k} cx={560 + (random(`b${k}`) - 0.5) * 60} cy={y} r={7} fill="#FF8A3D" opacity={0.85} />;
                })
              : null}
          </g>
        ) : null}

        {/* chuveiro */}
        <g opacity={built}>
          <rect x={MID - 18} y={-200} width={36} height={TOP + 200} fill={C.steel} opacity={0.5} />
          <rect x={X0 - 20} y={TOP} width={X1 - X0 + 40} height={BOT - TOP} rx={40} fill="rgba(79,227,255,0.04)" stroke={C.cyan} strokeWidth={6} filter="url(#glow)" />
          {/* água dentro da câmara */}
          {flow > 0 ? <rect x={X0} y={230} width={X1 - X0} height={BOT - 230} rx={16} fill={waterColor} opacity={0.18 + 0.12 * flow} /> : null}
          {/* diafragma */}
          <path d={`M ${X0 + 10} 228 Q ${MID} ${228 - 46 * bulge} ${X1 - 10} 228`} fill="none" stroke={C.amber} strokeWidth={10} strokeLinecap="round" />
          <line x1={MID} y1={226 - 23 * bulge} x2={MID} y2={200 - 23 * bulge} stroke={C.amber} strokeWidth={8} />
          <rect x={MID - 30} y={172} width={60} height={10} fill={C.steel} />
          {power > 0 && diaphragmOn ? (
            <path d="M 600 160 L 585 190 L 600 190 L 588 220" fill="none" stroke={C.lime} strokeWidth={6} filter="url(#glow)" />
          ) : null}
          {/* fios de energia */}
          <path d={`M 1000 120 H ${X1 + 60} V 190 H ${MID + 30}`} fill="none" stroke={power ? C.red : C.dim} strokeWidth={6} />
          <path d={`M 1000 150 H ${X1 + 90} V ${COIL_Y} H ${X1}`} fill="none" stroke={power ? C.red : C.dim} strokeWidth={6} />
          {/* resistência */}
          <polyline points={coil(X0 + 20, X1 - 20)} fill="none" stroke={coilColor} strokeWidth={9} strokeLinejoin="round" filter={heat > 0.2 ? "url(#glow)" : undefined} />
          {mode !== "full" ? (
            <polyline
              points={coil(mode === "inverno" ? MID : X0 + 20, X1 - 20)}
              fill="none"
              stroke={C.lime}
              strokeWidth={4}
              strokeDasharray="10 12"
              strokeDashoffset={-t * 120}
              opacity={0.9}
            />
          ) : null}
          {[X0 + 20, MID, X1 - 20].map((x) => (
            <circle key={x} cx={x} cy={COIL_Y + 46} r={9} fill={C.steel} />
          ))}
          {overheat > 0.6 ? <g filter="url(#glow)">{sparks(MID, COIL_Y, 10, "q", 50)}</g> : null}
          {/* crivo */}
          <rect x={X0} y={BOT} width={X1 - X0} height={30} rx={10} fill={crivoGlow > 0 ? "rgba(79,227,255,0.35)" : "rgba(159,179,173,0.3)"} stroke={C.cyan} strokeWidth={4} />
          {Array.from({ length: 13 }).map((_, k) => (
            <circle key={k} cx={X0 + 20 + k * 23} cy={BOT + 15} r={4} fill={C.bg} />
          ))}
          {/* chave inverno-verão */}
          {t >= T.verao ? (
            <g transform={`translate(${X1 + 140} 300)`} opacity={appear(t, T.verao, 0.4)}>
              <circle r={46} fill={C.bg2} stroke={C.cyan} strokeWidth={6} />
              <line x1={0} y1={0} x2={mode === "inverno" ? 30 : -30} y2={-30} stroke={C.white} strokeWidth={8} strokeLinecap="round" />
              <text x={-70} y={-62} fontFamily={FONT} fontWeight={800} fontSize={22} fill={mode === "verao" ? C.lime : C.dim}>VERÃO</text>
              <text x={10} y={-62} fontFamily={FONT} fontWeight={800} fontSize={22} fill={mode === "inverno" ? C.lime : C.dim}>INVERNO</text>
            </g>
          ) : null}
          {/* fio terra */}
          {groundIn > 0 ? (
            <g opacity={groundIn}>
              <path d={`M ${X1 + 20} 470 H 900 V 1080`} fill="none" stroke="#7CDA4A" strokeWidth={10} />
              <path d={`M ${X1 + 20} 470 H 900 V 1080`} fill="none" stroke={C.amber} strokeWidth={10} strokeDasharray="22 22" />
              {[0, 1, 2].map((k) => (
                <line key={k} x1={900 - 40 + k * 14} y1={1086 + k * 12} x2={900 + 40 - k * 14} y2={1086 + k * 12} stroke={C.steel} strokeWidth={6} />
              ))}
              {t < T.crivo
                ? Array.from({ length: 6 }).map((_, k) => {
                    const p = ((t * 0.8 + k / 6) % 1);
                    const len = 180 + 610;
                    const d = p * len;
                    const x = d < 180 ? X1 + 20 + d : 900;
                    const y = d < 180 ? 470 : 470 + (d - 180);
                    return <circle key={k} cx={x} cy={y} r={8} fill={C.amber} filter="url(#glow)" />;
                  })
                : null}
            </g>
          ) : null}
        </g>

        {/* água caindo */}
        {drops.map((d, k) => (
          <ellipse key={k} cx={d.x} cy={d.y} rx={6} ry={12} fill={waterColor} opacity={0.9} />
        ))}

        {/* pessoa no banho */}
        {built > 0 ? <Stick x={MID} y={1100} s={1.1} color={shockOn ? C.red : C.white} arms={shockOn ? 1.2 : 0} shake={shockOn ? Math.sin(t * 70) * 6 : 0} /> : null}
        {bucket > 0 && built < 1 ? <Stick x={560} y={1100} s={1.1} arms={0.3} /> : null}
        {shockOn ? <g filter="url(#glow)">{sparks(MID, 900, 12, "s", 70)}</g> : null}

        {/* termômetro */}
        {t >= T.menos ? (
          <g transform="translate(930 620)" opacity={windowed(t, T.menos, T.verao, 0.4)}>
            <rect x={-26} y={0} width={52} height={360} rx={26} fill={C.bg} stroke={C.white} strokeWidth={5} />
            <rect x={-14} y={340 - ((temp - 20) / 30) * 320} width={28} height={((temp - 20) / 30) * 320 + 10} rx={14} fill={waterColor} filter="url(#glow)" />
            <circle cx={0} cy={380} r={40} fill={waterColor} />
            <text x={0} y={-20} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={40} fill={waterColor}>
              {Math.round(temp)}°C
            </text>
          </g>
        ) : null}

        {/* etiquetas */}
        <Label t={t} from={T.resistencia + 0.2} to={T.semAgua} x={MID} y={COIL_Y + 120} text="RESISTÊNCIA" color={C.amber} size={26} />
        <Label t={t} from={T.queima + 0.3} to={T.borracha} x={MID} y={COIL_Y + 120} text="QUEIMOU!" color={C.red} size={28} />
        <Label t={t} from={T.diafragma + 0.2} to={T.menos} x={MID} y={110} text="DIAFRAGMA" color={C.amber} size={24} />
        <Label t={t} from={T.soEsquenta} to={T.menos} x={MID} y={COIL_Y + 120} text="SÓ LIGA COM ÁGUA" color={C.lime} size={22} />
        <Label t={t} from={T.poucas} to={T.verao} x={MID} y={160} text="MESMO CALOR, MENOS ÁGUA" color={C.amber} size={26} />
        <Label t={t} from={T.inteiro + 0.2} to={T.inverno} x={MID} y={COIL_Y + 110} text="VERÃO: FIO INTEIRO" color={C.lime} size={22} />
        <Label t={t} from={T.inverno + 0.2} to={T.choque} x={MID} y={COIL_Y + 110} text="INVERNO: PEDAÇO CURTO" color={C.lime} size={22} />
        <Label t={t} from={T.chave + 0.2} to={T.choque} x={X1 + 140} y={390} text="CHAVE" color={C.cyan} size={22} />
        <Label t={t} from={T.choque + 0.6} to={T.terra + 0.5} x={MID} y={760} text="CHOQUE!" color={C.red} />
        <Label t={t} from={T.fioTerra + 0.2} to={T.crivo} x={760} y={760} ax={900} ay={760} text="FIO TERRA" color="#7CDA4A" />
        <Label t={t} from={T.crivo + 0.4} to={T.parabens} x={MID} y={600} text="CRIVO" color={C.cyan} size={24} />
        <Label t={t} from={T.parabens + 0.2} to={999} x={260} y={COIL_Y} ax={X0 + 20} ay={COIL_Y} text="RESISTÊNCIA" color={C.amber} size={24} />
        <Label t={t} from={T.parabens + 0.35} to={999} x={260} y={228} ax={X0 + 10} ay={228} text="DIAFRAGMA" color={C.amber} size={24} />
        <Label t={t} from={T.parabens + 0.5} to={999} x={260} y={BOT + 15} ax={X0} ay={BOT + 15} text="CRIVO" color={C.cyan} size={24} />
        <Label t={t} from={T.parabens + 0.65} to={999} x={760} y={900} ax={900} ay={900} text="FIO TERRA" color="#7CDA4A" size={24} />
      </g>
    </svg>
  );
};


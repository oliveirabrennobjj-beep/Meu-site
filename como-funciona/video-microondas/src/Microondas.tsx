import React from "react";
import { C, T, appear, pop, windowed } from "./timeline";

const FONT = "Montserrat, sans-serif";
const CHOC = "#7a4a26";
const HOT = "#FF6B3D";

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

/** Onda senoidal de x0 a x1 na altura y, andando com o tempo. */
const wavePath = (x0: number, x1: number, y: number, amp: number, len: number, phase: number) => {
  let d = "";
  for (let x = x0; x <= x1; x += 6) {
    const yy = y + Math.sin(((x - x0) / len) * Math.PI * 2 - phase) * amp;
    d += `${d ? "L" : "M"} ${x.toFixed(1)} ${yy.toFixed(1)} `;
  }
  return d;
};

/** Molécula de água (O vermelho com dois H brancos) girando. */
const Agua: React.FC<{ x: number; y: number; ang: number; s?: number; hot: number }> = ({ x, y, ang, s = 1, hot }) => (
  <g transform={`translate(${x} ${y}) rotate(${ang}) scale(${s})`}>
    <line x1={0} y1={0} x2={-14} y2={12} stroke={C.white} strokeWidth={3} />
    <line x1={0} y1={0} x2={14} y2={12} stroke={C.white} strokeWidth={3} />
    <circle r={11} fill={hot > 0.5 ? HOT : C.red} />
    <circle cx={-15} cy={13} r={6} fill={C.white} />
    <circle cx={15} cy={13} r={6} fill={C.white} />
  </g>
);

// Micro-ondas (coordenadas do desenho)
const OV = { x0: 150, x1: 930, y0: 360, y1: 840 }; // caixa inteira
const CAV = { x0: 190, x1: 700, y0: 400, y1: 800 }; // cavidade
const MAG = { x0: 560, x1: 690, y0: 410, y1: 470 }; // magnetron
const PLATE_Y = 735;

export const Microondas: React.FC<{ t: number; dimmed: number }> = ({ t, dimmed }) => {
  // câmera: [tempo, centro x, centro y, zoom]
  const cams: [number, number, number, number][] = [
    [0, -620, 560, 1.0],
    [T.chocolate, -560, 520, 1.35],
    [T.como, 540, 600, 1.15],
    [T.giram, 440, 680, 1.6],
    [T.prato, 440, 720, 1.35],
    [T.sair, 800, 600, 0.85],
    [T.metal, 540, 600, 1.2],
    [T.porta, 560, 620, 1.2],
    [T.gelado, 440, 700, 1.25],
    [T.garfo, 440, 680, 1.45],
    [T.parabens, 540, 600, 1.15],
  ];
  let ci = 0;
  for (let k = 0; k < cams.length; k++) if (t >= cams[k][0]) ci = k;
  const prev = cams[Math.max(0, ci - 1)];
  const cur = cams[ci];
  const m = ci === 0 ? 1 : appear(t, cur[0], 1.1);
  const cx = prev[1] + (cur[1] - prev[1]) * m;
  const cy = prev[2] + (cur[2] - prev[2]) * m;
  const sc = prev[3] + (cur[3] - prev[3]) * m;

  const oven = pop(t, T.como + 0.2, 0.6);
  const mag = pop(t, T.peca + 0.6, 0.5);
  const waves = t > T.peca + 1.2;
  const spin = t > T.giram ? (t - T.giram) * 900 : 0;
  const heat = appear(t, T.calor, 2.0);
  const leak = windowed(t, T.sair + 0.4, T.metal + 0.6, 0.3);
  const shield = appear(t, T.metal + 0.3, 0.6);
  const door = pop(t, T.porta + 0.2, 0.6);
  const mesh = windowed(t, T.porta + 0.6, T.gelado, 0.4);
  const spots = windowed(t, T.gelado + 0.3, T.garfo, 0.4);
  const turn = t > T.girar + 0.5 ? (t - T.girar - 0.5) * 70 : 0;
  const even = appear(t, T.girar + 1.5, 2.0);
  const fork = windowed(t, T.garfo + 0.2, T.parabens, 0.3);
  const sparks = t > T.faisca + 0.2 && t < T.parabens;
  const choc = appear(t, T.chocolate + 0.5, 1.5);

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
        <clipPath id="cav">
          <rect x={CAV.x0} y={CAV.y0} width={CAV.x1 - CAV.x0} height={CAV.y1 - CAV.y0} rx={14} />
        </clipPath>
      </defs>
      <g opacity={1 - dimmed * 0.75} transform={`translate(540 575) scale(${sc}) translate(${-cx} ${-cy})`}>
        {/* ---------- 1945: o radar e o chocolate ---------- */}
        {t < T.peca + 1 ? (
          <g opacity={1 - appear(t, T.como + 0.5, 0.6)}>
            <line x1={-1200} y1={800} x2={-100} y2={800} stroke={C.dim} strokeWidth={6} />
            {/* radar */}
            <g transform="translate(-900 800)" filter="url(#glow)">
              <rect x={-40} y={-170} width={80} height={170} fill="none" stroke={C.cyan} strokeWidth={8} />
              <path d="M -130 -300 Q 0 -150 130 -300" fill="none" stroke={C.cyan} strokeWidth={10} />
              <line x1={0} y1={-170} x2={0} y2={-240} stroke={C.cyan} strokeWidth={8} />
              <circle cx={0} cy={-250} r={12} fill={C.cyan} />
              {/* caixinha que solta as ondas */}
              <rect x={-26} y={-120} width={52} height={40} rx={6} fill={C.amber} opacity={0.9} />
            </g>
            {/* ondas do radar saindo */}
            {t > T.ano + 0.3
              ? Array.from({ length: 4 }).map((_, k) => {
                  const life = (t * 0.7 + k / 4) % 1;
                  const r = 60 + life * 520;
                  return <path key={k} d={`M ${-900 + r * 0.55} ${600 - r * 0.8} A ${r} ${r} 0 0 1 ${-900 + r * 0.55} ${600 + r * 0.8}`} fill="none" stroke={C.amber} strokeWidth={6} opacity={1 - life} filter="url(#glow)" />;
                })
              : null}
            {/* Percy Spencer */}
            <Stick x={-420} y={800} s={1.3} armR={0.2} flip>
              {/* barra de chocolate no bolso */}
              <rect x={-14} y={-112} width={34} height={22} fill={CHOC} stroke="none" />
              {choc > 0 ? <path d={`M -10 -90 q 4 ${20 * choc} 0 ${36 * choc} M 6 -90 q 4 ${12 * choc} 0 ${24 * choc} M 16 -90 q 3 ${16 * choc} 0 ${30 * choc}`} stroke={CHOC} strokeWidth={6} /> : null}
            </Stick>
          </g>
        ) : null}
        <Label t={t} from={T.ano + 0.4} to={T.como} x={-900} y={420} text="RADAR" color={C.cyan} size={34} />
        <Label t={t} from={T.chocolate + 1.0} to={T.como} x={-420} y={560} ax={-405} ay={655} text="DERRETEU!" color={C.amber} size={30} />

        {/* ---------- o micro-ondas ---------- */}
        {oven > 0 ? (
          <g transform={`translate(540 600) scale(${oven}) translate(-540 -600)`}>
            {/* vazamento de onda (antes da blindagem) */}
            {leak > 0 ? (
              <g opacity={leak} filter="url(#glow)">
                {[0, 1, 2].map((k) => (
                  <path key={k} d={wavePath(OV.x1 - 20, 1480, 520 + k * 110, 22, 90, t * 9 + k)} fill="none" stroke={C.red} strokeWidth={6} />
                ))}
                <Stick x={1420} y={900} s={1.1} color={C.white} armL={0.9} armR={0.9} />
              </g>
            ) : null}

            {/* caixa */}
            <rect x={OV.x0} y={OV.y0} width={OV.x1 - OV.x0} height={OV.y1 - OV.y0} rx={26} fill="rgba(79,227,255,0.04)" stroke={shield > 0 ? C.lime : C.steel} strokeWidth={8 + shield * 10} filter="url(#glow)" />
            <rect x={CAV.x0} y={CAV.y0} width={CAV.x1 - CAV.x0} height={CAV.y1 - CAV.y0} rx={14} fill="rgba(255,201,77,0.06)" stroke={shield > 0 ? C.lime : C.steel} strokeWidth={5} />
            {/* painel */}
            <rect x={730} y={420} width={170} height={70} rx={10} fill="rgba(184,255,60,0.08)" stroke={C.lime} strokeWidth={4} />
            <text x={815} y={470} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={40} fill={C.lime}>
              {t > T.peca ? `0:${String(Math.max(0, 59 - Math.floor(t - T.peca)) % 60).padStart(2, "0")}` : "0:00"}
            </text>
            {[0, 1, 2].map((r) =>
              [0, 1, 2].map((c) => <circle key={`${r}${c}`} cx={760 + c * 55} cy={560 + r * 60} r={18} fill="none" stroke={C.steel} strokeWidth={4} />),
            )}
            <rect x={760} y={750} width={110} height={40} rx={10} fill={C.lime} opacity={0.8} />

            <g clipPath="url(#cav)">
              {/* luz interna */}
              {t > T.peca ? <rect x={CAV.x0} y={CAV.y0} width={CAV.x1 - CAV.x0} height={CAV.y1 - CAV.y0} fill={C.amber} opacity={0.07} /> : null}
              {/* ondas dentro (batem e voltam depois da blindagem) */}
              {waves
                ? [0, 1, 2, 3].map((k) => (
                    <path
                      key={k}
                      d={wavePath(CAV.x0, MAG.x0, 500 + k * 70, 16, 80, (k % 2 ? -1 : 1) * t * 8)}
                      fill="none"
                      stroke={C.red}
                      strokeWidth={5}
                      opacity={0.55}
                      filter="url(#glow)"
                    />
                  ))
                : null}
              {/* pontos quentes e frios */}
              {spots > 0
                ? [
                    [300, 690, HOT],
                    [440, 650, C.cyan],
                    [580, 690, HOT],
                  ].map(([x, y, c], k) => <circle key={k} cx={x as number} cy={y as number} r={70} fill={c as string} opacity={spots * 0.35 * (1 - even)} />)
                : null}
            </g>

            {/* magnetron */}
            {mag > 0 ? (
              <g transform={`translate(${(MAG.x0 + MAG.x1) / 2} ${(MAG.y0 + MAG.y1) / 2}) scale(${mag})`} filter="url(#glow)">
                <rect x={-65} y={-30} width={130} height={60} rx={10} fill="rgba(255,77,94,0.25)" stroke={C.red} strokeWidth={6} />
                {[-40, -20, 0, 20, 40].map((x) => (
                  <line key={x} x1={x} y1={-22} x2={x} y2={22} stroke={C.red} strokeWidth={4} opacity={0.6 + 0.4 * Math.sin(t * 12 + x)} />
                ))}
              </g>
            ) : null}

            {/* prato giratório + comida */}
            <g>
              <ellipse cx={440} cy={PLATE_Y + 30} rx={200} ry={30} fill="none" stroke={C.steel} strokeWidth={5} />
              <g transform={`translate(440 ${PLATE_Y}) scale(1 0.32) rotate(${turn})`}>
                <circle r={190} fill="rgba(79,227,255,0.10)" stroke={C.cyan} strokeWidth={10} />
                <circle cx={150} cy={0} r={10} fill={C.cyan} />
              </g>
              {/* tigela */}
              <path d={`M 330 ${PLATE_Y - 10} Q 335 ${PLATE_Y - 120} 440 ${PLATE_Y - 125} Q 545 ${PLATE_Y - 120} 550 ${PLATE_Y - 10} Z`} fill={heat > 0.3 ? "rgba(255,107,61,0.35)" : "rgba(255,201,77,0.25)"} stroke={C.amber} strokeWidth={6} />
              {/* vapor */}
              {heat > 0.2
                ? [400, 440, 480].map((x, k) => {
                    const life = (t * 0.6 + k / 3) % 1;
                    return <path key={x} d={`M ${x} ${PLATE_Y - 140 - life * 90} q 14 -20 0 -40 q -14 -20 0 -40`} fill="none" stroke={C.white} strokeWidth={5} opacity={heat * (1 - life) * 0.8} />;
                  })
                : null}
            </g>

            {/* garfo e faíscas */}
            {fork > 0 ? (
              <g opacity={fork} transform="translate(560 640) rotate(35)">
                <rect x={-6} y={0} width={12} height={110} fill={C.steel} />
                {[-18, -6, 6, 18].map((x) => (
                  <rect key={x} x={x - 3} y={-44} width={6} height={46} fill={C.steel} />
                ))}
                <rect x={-21} y={-4} width={42} height={10} fill={C.steel} />
                {sparks
                  ? [-18, -6, 6, 18].map((x, k) => {
                      const on = Math.sin(t * 40 + k * 2.3) > 0.2;
                      return on ? (
                        <path key={k} d={`M ${x} -46 l ${-12 + k * 6} -26 l 10 6 l -4 -24`} fill="none" stroke={C.white} strokeWidth={5} filter="url(#glow)" />
                      ) : null;
                    })
                  : null}
              </g>
            ) : null}

            {/* porta com telinha */}
            {door > 0 ? (
              <g opacity={door * (1 - appear(t, T.gelado, 0.5) * 0.85)}>
                <rect x={CAV.x0 - 8} y={CAV.y0 - 8} width={CAV.x1 - CAV.x0 + 16} height={CAV.y1 - CAV.y0 + 16} rx={18} fill="rgba(6,9,10,0.35)" stroke={C.lime} strokeWidth={8} />
                {Array.from({ length: 9 }).map((_, r) =>
                  Array.from({ length: 14 }).map((_, c) => <circle key={`${r}-${c}`} cx={CAV.x0 + 28 + c * 35} cy={CAV.y0 + 30 + r * 42} r={9} fill="none" stroke={C.lime} strokeWidth={2.5} opacity={0.7} />),
                )}
              </g>
            ) : null}
          </g>
        ) : null}

        {/* luz passa, onda não (zoom na telinha) */}
        {mesh > 0 ? (
          <g opacity={mesh} filter="url(#glow)">
            {[540, 600].map((y, k) => (
              <line key={k} x1={CAV.x0 + 40} y1={y} x2={1250} y2={y + 10} stroke={C.amber} strokeWidth={8} strokeDasharray="30 18" strokeDashoffset={-t * 220} />
            ))}
            <path d={wavePath(CAV.x0 + 40, CAV.x1 - 10, 700, 34, 140, t * 7)} fill="none" stroke={C.red} strokeWidth={7} />
            <circle cx={CAV.x1} cy={700} r={30} fill="none" stroke={C.red} strokeWidth={7} />
            <line x1={CAV.x1 - 22} y1={678} x2={CAV.x1 + 22} y2={722} stroke={C.red} strokeWidth={7} />
          </g>
        ) : null}

        {/* moléculas de água girando (zoom) */}
        {t > T.giram - 0.2 && t < T.sair
          ? Array.from({ length: 7 }).map((_, k) => (
              <Agua key={k} x={360 + (k % 4) * 52 + (k > 3 ? 26 : 0)} y={PLATE_Y - 90 + (k > 3 ? 46 : 0)} ang={spin * (k % 2 ? 1 : -1) + k * 40} s={0.9 * pop(t, T.giram + k * 0.08, 0.4)} hot={heat} />
            ))
          : null}

        {/* etiquetas */}
        <Label t={t} from={T.magnetron + 0.1} to={T.giram} x={630} y={300} ax={625} ay={MAG.y0} text="MAGNETRON" color={C.red} size={34} />
        <Label t={t} from={T.giram + 0.6} to={T.prato} x={440} y={520} text="BILHÕES DE GIROS/S" color={C.red} size={22} />
        <Label t={t} from={T.calor + 0.3} to={T.prato} x={440} y={860} text="CALOR POR DENTRO" color={HOT} size={22} />
        <Label t={t} from={T.prato + 0.4} to={T.sair} x={440} y={820} ax={540} ay={PLATE_Y + 5} text="PRATO FRIO" color={C.cyan} size={26} />
        <Label t={t} from={T.sair + 0.8} to={T.metal + 0.6} x={1420} y={640} text="PERIGO!" color={C.red} size={40} />
        <Label t={t} from={T.metal + 0.7} to={T.porta} x={540} y={300} text="CAIXA DE METAL" color={C.lime} size={36} />
        <Label t={t} from={T.luz + 0.2} to={T.blindagem + 1.0} x={790} y={470} text="LUZ PASSA" color={C.amber} size={34} />
        <Label t={t} from={T.luz + 0.8} to={T.blindagem + 1.0} x={600} y={850} text="ONDA NÃO" color={C.red} size={34} />
        <Label t={t} from={T.gelado + 0.6} to={T.girar} x={300} y={560} text="QUENTE" color={HOT} size={24} />
        <Label t={t} from={T.gelado + 0.9} to={T.girar} x={580} y={560} text="GELADO" color={C.cyan} size={24} />
        <Label t={t} from={T.giratorio} to={T.garfo} x={440} y={850} ax={440} ay={PLATE_Y + 20} text="PRATO GIRATÓRIO" color={C.cyan} size={28} />
        <Label t={t} from={T.faisca + 0.4} to={T.parabens} x={700} y={460} text="FAÍSCA!" color={C.white} size={34} />
        <Label t={t} from={T.parabens + 0.2} to={999} x={720} y={290} ax={625} ay={MAG.y0} text="MAGNETRON" color={C.red} size={26} />
        <Label t={t} from={T.parabens + 0.35} to={999} x={230} y={290} ax={OV.x0 + 20} ay={OV.y0 + 10} text="CAIXA DE METAL" color={C.lime} size={24} />
        <Label t={t} from={T.parabens + 0.5} to={999} x={440} y={900} ax={440} ay={PLATE_Y + 25} text="PRATO GIRATÓRIO" color={C.cyan} size={24} />
      </g>
    </svg>
  );
};

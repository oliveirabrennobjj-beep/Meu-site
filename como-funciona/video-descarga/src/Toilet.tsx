import React from "react";
import { C, T, appear, kf, pop, windowed } from "./timeline";

const FONT = "Montserrat, sans-serif";
const BROWN = "#A0662E";
const SMELL = "#7CDA4A";
const FLOOR = 1000;
const SEWER = 1080;

type P = [number, number];

/** Ponto a uma fração u (0..1) do caminho formado por segmentos retos. */
const along = (pts: P[], u: number): P => {
  const seg = pts.slice(1).map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]));
  let d = Math.max(0, Math.min(1, u)) * seg.reduce((a, b) => a + b, 0);
  let i = 0;
  while (i < seg.length - 1 && d > seg[i]) d -= seg[i++];
  const k = seg[i] ? d / seg[i] : 0;
  return [pts[i][0] + (pts[i + 1][0] - pts[i][0]) * k, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * k];
};

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

/** Nuvenzinha verde de cheiro. */
const Puff: React.FC<{ x: number; y: number; r?: number; o?: number }> = ({ x, y, r = 18, o = 0.8 }) => (
  <g opacity={o} fill={SMELL}>
    <circle cx={x} cy={y} r={r} />
    <circle cx={x + r * 0.9} cy={y + r * 0.2} r={r * 0.75} />
    <circle cx={x - r * 0.9} cy={y + r * 0.25} r={r * 0.7} />
  </g>
);

// ---- geometria do vaso ----
const OUT_X = 460; // saída do vaso
const TRAP: P[] = [
  [OUT_X, 800],
  [OUT_X, 935],
  [490, 960],
  [550, 960],
  [580, 935],
  [580, 780],
  [610, 750],
  [760, 750],
  [760, SEWER],
  [2700, SEWER],
];
const TRAP_D = `M ${OUT_X} 790 V 930 Q ${OUT_X} 960 490 960 H 550 Q 580 960 580 930 V 780 Q 580 750 610 750 H 760 V ${SEWER} H 2700`;
const WATER_D = `M ${OUT_X} 800 V 930 Q ${OUT_X} 960 490 960 H 550 Q 580 960 580 930 V 768`;
const BOWL_D = "M 300 640 Q 315 800 430 805 L 490 805 Q 605 800 620 640 Z";
const TANK = { x0: 610, x1: 810, y0: 380, y1: 600 };

/** Nível da água na caixa (0 a 1). */
const tank = (t: number) => {
  if (t < T.caixa) return 0;
  let n = kf(t, [
    [T.caixa + 0.4, 0],
    [T.caixa + 1.6, 0.85],
  ]);
  if (t > T.aperta + 0.4) n = kf(t, [[T.aperta + 0.4, 0.85], [T.puxa + 1.2, 0.06, "out"]]);
  if (t > T.boia + 0.6) n = kf(t, [[T.boia + 0.6, 0.06], [T.sobeBoia + 2.2, 0.85, "linear"]]);
  return n;
};

export const Toilet: React.FC<{ t: number; dimmed: number }> = ({ t, dimmed }) => {
  // câmera: [tempo, centro x, centro y, zoom]
  const cams: [number, number, number, number][] = [
    [0, 520, 820, 1.05],
    [T.agua, 760, 900, 0.9],
    [T.curva, 540, 860, 1.25],
    [T.balde, 520, 760, 0.95],
    [T.caixa, 640, 560, 1.25],
    [T.puxa, 540, 820, 1.15],
    [T.enche, 700, 500, 1.45],
    [T.destino, 1950, 1040, 0.5],
    [T.parabens, 560, 720, 0.95],
  ];
  let ci = 0;
  for (let k = 0; k < cams.length; k++) if (t >= cams[k][0]) ci = k;
  const prev = cams[Math.max(0, ci - 1)];
  const cur = cams[ci];
  const m = ci === 0 ? 1 : appear(t, cur[0], 1.1);
  const cx = prev[1] + (cur[1] - prev[1]) * m;
  const cy = prev[2] + (cur[2] - prev[2]) * m;
  const sc = prev[3] + (cur[3] - prev[3]) * m;

  const hole = 1 - appear(t, T.curva, 0.4);
  const vaso = pop(t, T.curva + 0.2, 0.6);
  const straight = appear(t, T.agua + 0.2, 0.5) * hole;
  const caixa = pop(t, T.caixa + 0.2, 0.6);
  const lvl = tank(t);
  const levelY = TANK.y1 - 10 - lvl * (TANK.y1 - TANK.y0 - 30);
  const flapperOpen = t > T.aperta + 0.4 && t < T.puxa + 1.4 ? Math.min(1, (t - T.aperta - 0.4) / 0.3) : 0;
  const draining = flapperOpen > 0.5 && lvl > 0.08;
  const filling = t > T.boia + 0.6 && t < T.sobeBoia + 2.2;
  const siphon = t > T.puxa + 0.3 && t < T.ronco + 2.5;
  const bowlY = siphon ? kf(t, [[T.puxa + 0.3, 760], [T.puxa + 1.5, 800], [T.ronco + 1.2, 800], [T.ronco + 2.5, 760]]) : 760;
  const button = t > T.aperta && t < T.aperta + 0.8 ? 10 : 0;
  const metade = appear(t, T.metade + 0.3, 0.8);

  // dejetos no vaso antes de dar descarga
  const poo = t > T.balde && t < T.puxa + 0.5;

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
        <clipPath id="bowl">
          <path d={BOWL_D} />
        </clipPath>
        <clipPath id="tank">
          <rect x={TANK.x0} y={TANK.y0} width={TANK.x1 - TANK.x0} height={TANK.y1 - TANK.y0} rx={20} />
        </clipPath>
      </defs>
      <g opacity={1 - dimmed * 0.75} transform={`translate(540 575) scale(${sc}) translate(${-cx} ${-cy})`}>
        {/* chão e terra */}
        <rect x={-1500} y={FLOOR} width={5000} height={600} fill="rgba(160,102,46,0.10)" />
        <line x1={-1500} y1={FLOOR} x2={3500} y2={FLOOR} stroke={C.steel} strokeWidth={4} />

        {/* 1) o buraco */}
        {hole > 0 ? (
          <g opacity={hole}>
            <rect x={400} y={FLOOR} width={120} height={70} fill="rgba(6,9,10,1)" stroke={BROWN} strokeWidth={5} />
            <ellipse cx={460} cy={FLOOR + 50} rx={48} ry={14} fill={BROWN} />
            {t > T.cheiro && t < T.agua + 0.5
              ? Array.from({ length: 6 }).map((_, k) => {
                  const life = (t * 0.5 + k / 6) % 1;
                  return <Puff key={k} x={460 + Math.sin(k * 3 + t * 2) * 50} y={FLOOR - life * 420} r={16 + life * 18} o={0.75 * (1 - life)} />;
                })
              : null}
            <Stick x={260} y={FLOOR} s={1} armL={t > T.cheiro ? 1.1 : 0.2} armR={t > T.cheiro ? 1.1 : 0.2} color={t > T.cheiro && t < T.agua ? SMELL : C.white} />
          </g>
        ) : null}

        {/* 2) cano reto + balde */}
        {straight > 0 ? (
          <g opacity={straight}>
            <path d={`M 460 ${FLOOR + 60} V ${SEWER} H 2700`} fill="none" stroke={C.steel} strokeWidth={46} strokeLinejoin="round" />
            <path d={`M 460 ${FLOOR + 60} V ${SEWER} H 2700`} fill="none" stroke={C.bg} strokeWidth={34} strokeLinejoin="round" />
            {t < T.sobe + 0.5 ? (
              <>
                <g transform={`translate(460 860) rotate(${kf(t, [[T.agua + 0.3, 0], [T.agua + 0.9, 70]])})`}>
                  <path d="M -55 -50 L 55 -50 L 44 50 L -44 50 Z" fill="rgba(79,227,255,0.15)" stroke={C.cyan} strokeWidth={6} />
                </g>
                {Array.from({ length: 10 }).map((_, k) => {
                  const life = (t * 1.3 + k / 10) % 1;
                  const [x, y] = along([[480, 880], [460, SEWER], [1500, SEWER]], life);
                  return t > T.agua + 0.8 ? <circle key={k} cx={x} cy={y} r={k % 3 ? 9 : 15} fill={k % 3 ? C.cyan : BROWN} /> : null;
                })}
              </>
            ) : null}
            {t > T.sobe + 0.3
              ? Array.from({ length: 7 }).map((_, k) => {
                  const life = (t * 0.45 + k / 7) % 1;
                  const [x, y] = along([[1400, SEWER], [460, SEWER], [460, 700]], life);
                  return <Puff key={k} x={x} y={y} r={16} o={0.8 * (1 - Math.max(0, life - 0.8) * 5)} />;
                })
              : null}
          </g>
        ) : null}

        {/* 3) o vaso com o sifão */}
        {vaso > 0 ? (
          <g opacity={Math.min(1, vaso)}>
            <path d="M 360 805 L 380 1000 H 600 L 600 805" fill="rgba(242,247,244,0.03)" stroke={C.dim} strokeWidth={4} />
            <path d={TRAP_D} fill="none" stroke={C.steel} strokeWidth={46} strokeLinejoin="round" strokeLinecap="round" />
            <path d={TRAP_D} fill="none" stroke={C.bg} strokeWidth={34} strokeLinejoin="round" strokeLinecap="round" />
            {/* água parada da curva */}
            <path
              d={siphon ? TRAP_D : WATER_D}
              fill="none"
              stroke={C.cyan}
              strokeWidth={32}
              strokeLinejoin="round"
              strokeDasharray={siphon ? "40 14" : undefined}
              strokeDashoffset={siphon ? -t * 500 : 0}
              opacity={0.85}
              filter={t > T.tampa && t < T.sifao + 1.5 ? "url(#glow)" : undefined}
            />
            {/* vaso */}
            <g clipPath="url(#bowl)">
              <rect x={280} y={bowlY} width={360} height={200} fill={C.cyan} opacity={0.35} />
            </g>
            <path d={BOWL_D} fill="rgba(79,227,255,0.04)" stroke={C.cyan} strokeWidth={7} filter="url(#glow)" />
            <rect x={286} y={630} width={348} height={16} rx={8} fill={C.white} />
            {poo
              ? [0, 1].map((k) => {
                  const u = siphon ? Math.min(1, (t - T.puxa - 0.3) / 1.6 + k * 0.15) : 0;
                  const [x, y] = siphon ? along(TRAP, u) : [430 + k * 45, 785 - k * 6];
                  return <ellipse key={k} cx={x} cy={y} rx={22} ry={13} fill={BROWN} />;
                })
              : null}
            {/* cheiro batendo na água e voltando */}
            {t > T.curva + 0.5 && t < T.balde
              ? Array.from({ length: 6 }).map((_, k) => {
                  const life = (t * 0.45 + k / 6) % 1;
                  const back = life > 0.75;
                  const path: P[] = [[1300, SEWER], [760, SEWER], [760, 750], [610, 750], [580, 790]];
                  const [x, y] = along(path, back ? 0.75 - (life - 0.75) * 2 : life);
                  return <Puff key={k} x={x} y={y} r={15} o={0.8} />;
                })
              : null}
            {t > T.tampa && t < T.balde ? (
              <g transform="translate(580 800)" stroke={C.red} strokeWidth={9} strokeLinecap="round" opacity={windowed(t, T.tampa, T.balde)}>
                <line x1={-22} y1={-22} x2={22} y2={22} />
                <line x1={22} y1={-22} x2={-22} y2={22} />
              </g>
            ) : null}
            {/* balde jogado no vaso (cansativo) */}
            {t > T.balde && t < T.caixa + 0.5 ? (
              <g opacity={windowed(t, T.balde, T.caixa + 0.5)}>
                <Stick x={200} y={FLOOR} s={1} armL={0.9} armR={0.9} />
                <g transform={`translate(330 540) rotate(${40 + Math.sin(t * 4) * 10})`}>
                  <path d="M -45 -40 L 45 -40 L 36 40 L -36 40 Z" fill="rgba(79,227,255,0.15)" stroke={C.cyan} strokeWidth={6} />
                </g>
                {[0, 1, 2].map((k) => (
                  <ellipse key={k} cx={180 + k * 22} cy={790 - ((t * 120 + k * 30) % 60)} rx={5} ry={9} fill={C.cyan} opacity={0.8} />
                ))}
              </g>
            ) : null}
            {siphon && t > T.ronco ? (
              <text x={620} y={1090} fontFamily={FONT} fontWeight={900} fontSize={54} fill={C.cyan} opacity={windowed(t, T.ronco, T.ronco + 2.2)} transform={`rotate(-6 620 1090)`}>
                GLUB GLUB!
              </text>
            ) : null}
            {siphon
              ? [0, 1, 2].map((k) => {
                  const [x, y] = along(TRAP, ((t * 0.5 + k / 3) % 1) * 0.75);
                  return (
                    <g key={k} transform={`translate(${x} ${y})`}>
                      <circle r={12} fill={C.lime} filter="url(#glow)" />
                    </g>
                  );
                })
              : null}
          </g>
        ) : null}

        {/* 4) caixa acoplada, válvula e boia */}
        {caixa > 0 ? (
          <g opacity={Math.min(1, caixa)}>
            <g clipPath="url(#tank)">
              <rect x={TANK.x0} y={levelY} width={TANK.x1 - TANK.x0} height={TANK.y1 - levelY} fill={C.cyan} opacity={0.3} />
            </g>
            <rect x={TANK.x0} y={TANK.y0} width={TANK.x1 - TANK.x0} height={TANK.y1 - TANK.y0} rx={20} fill="none" stroke={C.cyan} strokeWidth={7} filter="url(#glow)" />
            <rect x={TANK.x0 + 60} y={TANK.y0 - 18 + button} width={70} height={18} rx={6} fill={button ? C.lime : C.steel} />
            {/* saída da caixa pro vaso */}
            <path d={`M 650 ${TANK.y1} V 625 H 600`} fill="none" stroke={C.steel} strokeWidth={22} />
            {/* tampa de borracha (válvula) */}
            <g transform={`translate(630 ${TANK.y1 - 6}) rotate(${-flapperOpen * 70})`}>
              <rect x={0} y={-8} width={50} height={16} rx={6} fill={C.amber} filter={flapperOpen ? "url(#glow)" : undefined} />
            </g>
            {draining
              ? Array.from({ length: 10 }).map((_, k) => {
                  const life = (t * 2 + k / 10) % 1;
                  const [x, y] = along([[655, TANK.y1], [655, 625], [600, 625], [560, 700]], life);
                  return <circle key={k} cx={x} cy={y} r={8} fill={C.cyan} />;
                })
              : null}
            {/* entrada de água e boia */}
            <path d={`M 900 ${FLOOR} V 630 H 760 V ${TANK.y1}`} fill="none" stroke={C.steel} strokeWidth={14} opacity={0.8} />
            <line x1={760} y1={TANK.y1} x2={760} y2={430} stroke={C.steel} strokeWidth={14} />
            <circle cx={760} cy={430} r={14} fill={filling ? C.lime : C.red} />
            {t > T.boia ? (
              <g opacity={appear(t, T.boia + 0.2, 0.4)}>
                <line x1={760} y1={430} x2={690} y2={levelY - 10} stroke={C.amber} strokeWidth={6} />
                <circle cx={690} cy={levelY - 10} r={26} fill={C.amber} filter="url(#glow)" />
              </g>
            ) : null}
            {filling
              ? Array.from({ length: 6 }).map((_, k) => {
                  const life = (t * 2.2 + k / 6) % 1;
                  return <circle key={k} cx={772 + Math.sin(k) * 6} cy={440 + life * (levelY - 440)} r={6} fill={C.cyan} />;
                })
              : null}
          </g>
        ) : null}

        {/* 5) pra onde vai: rede, estação e rio */}
        {t > T.destino - 0.5 ? (
          <g opacity={appear(t, T.destino - 0.5, 0.6)}>
            {Array.from({ length: 16 }).map((_, k) => {
              const life = (t * 0.35 + k / 16) % 1;
              const x = 800 + life * 1250;
              return <circle key={k} cx={x} cy={SEWER} r={11} fill={BROWN} />;
            })}
            <text x={1150} y={SEWER + 90} fontFamily={FONT} fontWeight={800} fontSize={44} fill={C.steel}>
              REDE DE ESGOTO
            </text>
            {/* estação */}
            <g opacity={appear(t, T.estacao, 0.6)}>
              <rect x={2050} y={760} width={260} height={240} rx={16} fill="rgba(184,255,60,0.08)" stroke={C.lime} strokeWidth={8} filter="url(#glow)" />
              {[2110, 2250].map((x) => (
                <ellipse key={x} cx={x} cy={940} rx={50} ry={22} fill={C.cyan} opacity={0.5} />
              ))}
              <path d="M 2180 760 V 690 H 2240 V 760" fill="none" stroke={C.lime} strokeWidth={8} />
              {Array.from({ length: 8 }).map((_, k) => {
                const life = (t * 0.5 + k / 8) % 1;
                return <circle key={k} cx={2310 + life * 330} cy={SEWER} r={11} fill={C.cyan} />;
              })}
            </g>
            {/* rio */}
            <path d={`M 2600 ${FLOOR + 30} Q 2700 ${FLOOR + 10} 2800 ${FLOOR + 30} T 3000 ${FLOOR + 30} V 1250 H 2600 Z`} fill={C.cyan} opacity={0.45} />
            {metade > 0 ? <path d={`M 2600 ${FLOOR + 30} Q 2700 ${FLOOR + 10} 2800 ${FLOOR + 30} V 1250 H 2600 Z`} fill={BROWN} opacity={0.75 * metade} /> : null}
            {metade > 0 ? (
              <path d={`M 1300 ${SEWER} V 1180 H 2620`} fill="none" stroke={BROWN} strokeWidth={30} opacity={metade} strokeDasharray="50 20" strokeDashoffset={-t * 200} />
            ) : null}
          </g>
        ) : null}

        {/* etiquetas */}
        <Label t={t} from={T.cheiro + 0.3} to={T.agua} x={460} y={520} text="CHEIRO!" color={C.red} />
        <Label t={t} from={T.agua + 0.6} to={T.sobe} x={1000} y={SEWER - 90} text="CANO" color={C.cyan} />
        <Label t={t} from={T.sobe + 0.6} to={T.curva} x={700} y={700} text="O CHEIRO VOLTA" color={C.red} size={28} />
        <Label t={t} from={T.sifao + 0.1} to={T.balde} x={520} y={1060} ax={520} ay={960} text="SIFÃO" color={C.lime} size={30} />
        <Label t={t} from={T.cumming + 0.2} to={T.balde} x={800} y={640} text="1775 · ALEXANDER CUMMING" color={C.amber} size={22} />
        <Label t={t} from={T.caixa + 0.8} to={T.aperta} x={710} y={330} text="CAIXA" color={C.cyan} size={26} />
        <Label t={t} from={T.valvula + 0.1} to={T.puxa} x={520} y={500} ax={650} ay={TANK.y1 - 6} text="VÁLVULA" color={C.amber} size={26} />
        <Label t={t} from={T.efeito + 0.1} to={T.enche} x={840} y={820} ax={580} ay={850} text="EFEITO SIFÃO" color={C.lime} size={28} />
        <Label t={t} from={T.boia + 0.5} to={T.destino} x={560} y={430} ax={690} ay={levelY - 10} text="BOIA" color={C.amber} size={24} />
        <Label t={t} from={T.sobeBoia + 2.2} to={T.destino} x={760} y={330} ax={760} ay={430} text="FECHOU" color={C.lime} size={22} />
        <Label t={t} from={T.estacao + 0.4} to={T.parabens} x={2180} y={600} text="ESTAÇÃO DE TRATAMENTO" color={C.lime} size={44} />
        <Label t={t} from={T.metade + 0.4} to={T.parabens} x={2350} y={1330} text="SÓ ~50% É TRATADO" color={C.red} size={52} />
        <Label t={t} from={T.parabens + 0.2} to={999} x={170} y={880} ax={470} ay={930} text="SIFÃO" color={C.lime} size={24} />
        <Label t={t} from={T.parabens + 0.35} to={999} x={940} y={500} ax={810} ay={500} text="CAIXA" color={C.cyan} size={24} />
        <Label t={t} from={T.parabens + 0.5} to={999} x={460} y={360} ax={650} ay={590} text="VÁLVULA" color={C.amber} size={24} />
        <Label t={t} from={T.parabens + 0.65} to={999} x={960} y={420} ax={760} ay={430} text="BOIA" color={C.amber} size={24} />
      </g>
    </svg>
  );
};

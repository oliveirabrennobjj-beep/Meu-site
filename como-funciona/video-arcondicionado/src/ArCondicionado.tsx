import React from "react";
import { C, T, appear, pop, windowed } from "./timeline";
import { Label } from "./Label";

const HOT = "#FF6B3D";

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

const wavePath = (x0: number, x1: number, y: number, amp: number, len: number, phase: number) => {
  let d = "";
  for (let x = x0; x <= x1; x += 6) {
    const yy = y + Math.sin(((x - x0) / len) * Math.PI * 2 - phase) * amp;
    d += `${d ? "L" : "M"} ${x.toFixed(1)} ${yy.toFixed(1)} `;
  }
  return d;
};

/** Floco de neve. */
const Floco: React.FC<{ x: number; y: number; s: number; c?: string }> = ({ x, y, s, c = C.cyan }) =>
  s <= 0 ? null : (
    <g transform={`translate(${x} ${y}) scale(${s})`} stroke={c} strokeWidth={6} strokeLinecap="round">
      {[0, 60, 120].map((a) => (
        <g key={a} transform={`rotate(${a})`}>
          <line x1={0} y1={-40} x2={0} y2={40} />
          <line x1={0} y1={-26} x2={-12} y2={-36} />
          <line x1={0} y1={-26} x2={12} y2={-36} />
          <line x1={0} y1={26} x2={-12} y2={36} />
          <line x1={0} y1={26} x2={12} y2={36} />
        </g>
      ))}
    </g>
  );

// ---------- o circuito do gás ----------
// ordem do fluxo: furinho → evaporador (sala) → compressor → condensador (rua) → volta
const LOOP: [number, number][] = [
  [640, 340],
  [560, 340],
  [330, 340],
  [330, 410],
  [600, 410],
  [690, 410],
  [690, 800],
  [760, 800],
  [850, 800],
  [850, 720],
  [1000, 720],
  [1000, 770],
  [865, 770],
  [865, 830],
  [1000, 830],
  [1000, 880],
  [1035, 880],
  [1035, 340],
  [640, 340],
];
const SEG = LOOP.slice(1).map((p, i) => Math.hypot(p[0] - LOOP[i][0], p[1] - LOOP[i][1]));
const TOTAL = SEG.reduce((a, b) => a + b, 0);
const pointAt = (s: number): [number, number] => {
  let d = ((s % TOTAL) + TOTAL) % TOTAL;
  for (let i = 0; i < SEG.length; i++) {
    if (d <= SEG[i]) {
      const f = d / SEG[i];
      return [LOOP[i][0] + (LOOP[i + 1][0] - LOOP[i][0]) * f, LOOP[i][1] + (LOOP[i + 1][1] - LOOP[i][1]) * f];
    }
    d -= SEG[i];
  }
  return LOOP[0];
};
const cum = (n: number) => SEG.slice(0, n).reduce((a, b) => a + b, 0);
const S_EVAP_END = cum(4); // saiu da serpentina da sala
const S_COMP = cum(7); // compressor
const S_COND_END = cum(15); // fim do condensador
/** Cor do gás conforme o trecho: gelado → morno → quente → morno. */
const gasColor = (s: number) => {
  const d = ((s % TOTAL) + TOTAL) % TOTAL;
  if (d < S_EVAP_END) return C.cyan;
  if (d < S_COMP) return C.amber;
  if (d < S_COND_END) return C.red;
  return C.amber;
};
const pathOf = (a: number, b: number) => LOOP.slice(a, b + 1).map((p, i) => `${i ? "L" : "M"} ${p[0]} ${p[1]}`).join(" ");

export const ArCondicionado: React.FC<{ t: number; dimmed: number }> = ({ t, dimmed }) => {
  const cams: [number, number, number, number][] = [
    [0, 560, 600, 0.95],
    [T.ano, -620, 620, 1.2],
    [T.como, 420, 600, 1.15],
    [T.alcool, 230, 700, 1.55],
    [T.sala, 420, 520, 1.25],
    [T.aperta, 780, 760, 1.5],
    [T.fora, 880, 700, 1.05],
    [T.furinho, 640, 380, 1.6],
    [T.agua, 660, 520, 1.3],
    [T.parabens, 580, 600, 0.95],
  ];
  let ci = 0;
  for (let k = 0; k < cams.length; k++) if (t >= cams[k][0]) ci = k;
  const prev = cams[Math.max(0, ci - 1)];
  const cur = cams[ci];
  const m = ci === 0 ? 1 : appear(t, cur[0], 1.1);
  const cx = prev[1] + (cur[1] - prev[1]) * m;
  const cy = prev[2] + (cur[2] - prev[2]) * m;
  const sc = prev[3] + (cur[3] - prev[3]) * m;

  const indoor = pop(t, T.como + 0.3, 0.6);
  const coil = appear(t, T.sala, 0.6);
  const flowing = t > T.sala + 0.3;
  const comp = pop(t, T.aperta + 0.3, 0.5);
  const outdoor = pop(t, T.fora + 0.1, 0.6);
  const valve = pop(t, T.furinho + 0.4, 0.5);
  const hand = windowed(t, T.alcool - 0.2, T.sala + 0.2, 0.3);
  const coldAir = appear(t, T.evaporador, 0.6);
  const heatIn = windowed(t, T.sala + 0.4, T.cheio + 0.4, 0.3);
  const heatOut = t > T.fora + 0.8;
  const squeeze = windowed(t, T.aperta + 0.5, T.fora, 0.3);
  const drip = t > T.agua + 0.5;
  const drain = appear(t, T.agua + 0.2, 0.5);
  const fanA = t > T.fora ? (t - T.fora) * 720 : 0;
  // temperatura da sala
  const temp = Math.round(32 - 10 * appear(t, T.evaporador + 0.5, 6));
  const sweat = 1 - appear(t, T.evaporador + 2, 1.5);
  const intro = t < T.como + 1.2;

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
        {/* ---------- 1902: a gráfica ---------- */}
        {intro ? (
          <g opacity={1 - appear(t, T.como + 0.4, 0.6)}>
            <line x1={-1200} y1={820} x2={-80} y2={820} stroke={C.dim} strokeWidth={6} />
            {/* máquina de impressão */}
            <g filter="url(#glow)">
              <rect x={-1080} y={640} width={300} height={180} rx={14} fill="none" stroke={C.steel} strokeWidth={7} />
              <circle cx={-990} cy={730} r={50} fill="none" stroke={C.steel} strokeWidth={7} transform={`rotate(${t * 200} -990 730)`} strokeDasharray="20 14" />
              <circle cx={-870} cy={730} r={50} fill="none" stroke={C.steel} strokeWidth={7} transform={`rotate(${-t * 200} -870 730)`} strokeDasharray="20 14" />
              {[0, 1, 2].map((k) => {
                const life = (t * 0.5 + k / 3) % 1;
                return <rect key={k} x={-780 + life * 120} y={700 - k * 4} width={90} height={8} fill={C.white} opacity={0.8} />;
              })}
            </g>
            {/* máquina do Carrier soprando ar */}
            <g filter="url(#glow)">
              <rect x={-560} y={560} width={150} height={260} rx={12} fill="rgba(79,227,255,0.08)" stroke={C.cyan} strokeWidth={7} />
              {[0, 1, 2, 3, 4].map((k) => (
                <line key={k} x1={-540} y1={600 + k * 40} x2={-430} y2={600 + k * 40} stroke={C.cyan} strokeWidth={4} opacity={0.7} />
              ))}
              {t > T.ano + 0.6
                ? [0, 1, 2].map((k) => (
                    <path key={k} d={wavePath(-760, -570, 620 + k * 60, 10, 70, -t * 8 + k)} fill="none" stroke={C.cyan} strokeWidth={5} opacity={0.8} />
                  ))
                : null}
            </g>
            <Stick x={-300} y={820} s={1.3} armL={0.3} flip />
            <Floco x={-660} y={480} s={pop(t, T.gelado + 0.5, 0.5) * (0.9 + 0.1 * Math.sin(t * 6))} />
          </g>
        ) : null}
        <Label t={t} from={T.ano + 0.4} to={T.como} x={-930} y={580} text="GRÁFICA" color={C.steel} size={32} />
        <Label t={t} from={T.gelado + 0.8} to={T.como} x={-660} y={380} text="SAIU GELADO!" color={C.cyan} size={32} />

        {/* ---------- a casa: sala | parede | rua ---------- */}
        {t < T.ano + 0.4 || t > T.como ? (
          <g opacity={t < T.como ? 1 - appear(t, T.ano - 0.1, 0.4) : appear(t, T.como, 0.5)}>
            {/* chão */}
            <line x1={60} y1={900} x2={1100} y2={900} stroke={C.dim} strokeWidth={6} />
            {/* parede */}
            <rect x={605} y={250} width={50} height={650} fill="rgba(159,179,173,0.18)" stroke={C.steel} strokeWidth={5} />
            <text x={330} y={880} textAnchor="middle" fontFamily="Montserrat, sans-serif" fontWeight={800} fontSize={30} fill={C.dim} letterSpacing={4}>
              SALA
            </text>
            <text x={880} y={950} textAnchor="middle" fontFamily="Montserrat, sans-serif" fontWeight={800} fontSize={30} fill={C.dim} letterSpacing={4}>
              RUA
            </text>
            {/* termômetro */}
            <g>
              <rect x={95} y={470} width={30} height={240} rx={15} fill="none" stroke={C.white} strokeWidth={4} />
              <circle cx={110} cy={725} r={26} fill={temp > 26 ? HOT : C.cyan} />
              <rect x={103} y={710 - (temp - 15) * 12} width={14} height={(temp - 15) * 12} fill={temp > 26 ? HOT : C.cyan} />
              <text x={110} y={450} textAnchor="middle" fontFamily="Montserrat, sans-serif" fontWeight={900} fontSize={40} fill={temp > 26 ? HOT : C.cyan}>
                {temp}°
              </text>
            </g>
            {/* pessoa na sala */}
            <Stick x={380} y={900} s={1.25} armL={0.15} armR={hand > 0.5 ? 0.6 : 0.1} color={C.white}>
              {sweat > 0.05
                ? [0, 1].map((k) => {
                    const life = (t * 0.9 + k / 2) % 1;
                    return <circle key={k} cx={-26 + k * 52} cy={-160 + life * 50} r={6} fill={C.cyan} stroke="none" opacity={sweat * (1 - life)} />;
                  })
                : null}
            </Stick>
          </g>
        ) : null}

        {/* álcool secando na mão */}
        {hand > 0 ? (
          <g opacity={hand} filter="url(#glow)">
            <path d="M 160 760 q 40 -30 90 -20 q 30 10 40 40 q -60 30 -130 -20 z" fill="rgba(242,247,244,0.15)" stroke={C.white} strokeWidth={5} />
            {[0, 1, 2, 3].map((k) => {
              const life = (t * 0.8 + k / 4) % 1;
              return <path key={k} d={`M ${190 + k * 22} ${740 - life * 120} q 10 -14 0 -28`} fill="none" stroke={C.cyan} strokeWidth={4} opacity={1 - life} />;
            })}
            {[0, 1, 2].map((k) => (
              <path key={k} d={wavePath(120 + k * 50, 160 + k * 50, 820, 6, 20, t * 10)} fill="none" stroke={HOT} strokeWidth={4} opacity={0.6} />
            ))}
          </g>
        ) : null}
        <Label t={t} from={T.alcool + 0.4} to={T.sala} x={220} y={640} text="PUXA O CALOR" color={C.cyan} size={24} />

        {/* unidade de dentro */}
        {indoor > 0 ? (
          <g transform={`translate(445 375) scale(${indoor}) translate(-445 -375)`}>
            <rect x={300} y={305} width={290} height={140} rx={22} fill="rgba(242,247,244,0.06)" stroke={C.white} strokeWidth={6} filter="url(#glow)" />
            <line x1={320} y1={430} x2={570} y2={430} stroke={C.steel} strokeWidth={5} />
          </g>
        ) : null}

        {/* canos do circuito */}
        {coil > 0 ? (
          <g filter="url(#glow)">
            <path d={pathOf(0, 5)} fill="none" stroke={C.cyan} strokeWidth={9} opacity={coil * 0.55} strokeLinejoin="round" />
            <path d={pathOf(5, 7)} fill="none" stroke={C.amber} strokeWidth={9} opacity={coil * 0.45} strokeLinejoin="round" />
          </g>
        ) : null}
        {outdoor > 0 || comp > 0 ? (
          <g filter="url(#glow)" opacity={Math.max(outdoor, comp)}>
            <path d={pathOf(7, 15)} fill="none" stroke={C.red} strokeWidth={9} opacity={0.5} strokeLinejoin="round" />
            <path d={pathOf(15, 18)} fill="none" stroke={C.amber} strokeWidth={9} opacity={0.45} strokeLinejoin="round" />
          </g>
        ) : null}

        {/* gás andando */}
        {flowing
          ? Array.from({ length: 46 }).map((_, k) => {
              const s = k * (TOTAL / 46) + (t - T.sala) * 160;
              const [x, y] = pointAt(s);
              return <circle key={k} cx={x} cy={y} r={7} fill={gasColor(s)} filter="url(#glow)" />;
            })
          : null}

        {/* calor da sala entrando no aparelho */}
        {heatIn > 0
          ? [0, 1, 2].map((k) => {
              const life = (t * 0.7 + k / 3) % 1;
              const x = 380 + k * 40;
              return <path key={k} d={`M ${x} ${700 - life * 230} q 14 -18 0 -36 q -14 -18 0 -36`} fill="none" stroke={HOT} strokeWidth={6} opacity={heatIn * (1 - life)} filter="url(#glow)" />;
            })
          : null}
        {/* ar gelado saindo */}
        {coldAir > 0 && indoor > 0
          ? [0, 1, 2, 3].map((k) => {
              const life = (t * 0.6 + k / 4) % 1;
              return (
                <path
                  key={k}
                  d={`M ${340 + k * 60} ${455 + life * 40} q -30 ${60 + life * 60} -80 ${110 + life * 120}`}
                  fill="none"
                  stroke={C.cyan}
                  strokeWidth={5}
                  strokeDasharray="18 14"
                  opacity={coldAir * (1 - life) * 0.9}
                />
              );
            })
          : null}

        {/* unidade de fora */}
        {outdoor > 0 ? (
          <g transform={`translate(875 795) scale(${outdoor}) translate(-875 -795)`}>
            <rect x={710} y={690} width={350} height={210} rx={16} fill="rgba(242,247,244,0.04)" stroke={C.white} strokeWidth={6} filter="url(#glow)" />
            <circle cx={930} cy={800} r={78} fill="none" stroke={C.steel} strokeWidth={5} />
            <g transform={`rotate(${fanA} 930 800)`}>
              {[0, 120, 240].map((a) => (
                <path key={a} transform={`rotate(${a} 930 800)`} d="M 930 800 q 20 -60 0 -72 q -26 10 0 72" fill="rgba(159,179,173,0.5)" stroke={C.steel} strokeWidth={3} />
              ))}
            </g>
          </g>
        ) : null}
        {/* compressor */}
        {comp > 0 ? (
          <g transform={`translate(760 800) scale(${comp * (1 + 0.08 * squeeze * Math.sin(t * 18))})`} filter="url(#glow)">
            <rect x={-38} y={-48} width={76} height={96} rx={30} fill="rgba(255,77,94,0.25)" stroke={C.red} strokeWidth={6} />
          </g>
        ) : null}
        {squeeze > 0 ? (
          <g opacity={squeeze} stroke={C.white} strokeWidth={6} strokeLinecap="round" fill="none">
            <path d="M 680 740 l 30 25 m -30 0 l 30 -25" transform="translate(0 35)" />
            <path d="M 840 740 l -30 25 m 30 0 l -30 -25" transform="translate(0 35)" />
          </g>
        ) : null}
        {/* calor indo pra rua */}
        {heatOut
          ? [0, 1, 2].map((k) => (
              <path key={k} d={wavePath(1070, 1330, 730 + k * 70, 18, 80, t * 8 + k)} fill="none" stroke={HOT} strokeWidth={6} opacity={0.75} filter="url(#glow)" />
            ))
          : null}

        {/* furinho (válvula de expansão) */}
        {valve > 0 ? (
          <g transform={`translate(632 340) scale(${valve})`} filter="url(#glow)">
            <path d="M -40 -22 L -6 -6 L 6 -6 L 40 -22 L 40 22 L 6 6 L -6 6 L -40 22 Z" fill="rgba(79,227,255,0.25)" stroke={C.cyan} strokeWidth={5} />
          </g>
        ) : null}
        <Floco x={560} y={250} s={pop(t, T.furinho + 1.6, 0.5) * windowed(t, T.furinho + 1.6, T.agua, 0.3)} />

        {/* dreno pingando lá fora */}
        {drain > 0 ? (
          <g opacity={drain}>
            <path d="M 580 450 L 580 470 L 720 470 L 720 640" fill="none" stroke={C.steel} strokeWidth={8} strokeLinejoin="round" />
            {drip
              ? [0, 1, 2].map((k) => {
                  const life = (t * 0.9 + k / 3) % 1;
                  return <ellipse key={k} cx={720} cy={660 + life * 220} rx={8} ry={12} fill={C.cyan} opacity={1 - life * 0.6} filter="url(#glow)" />;
                })
              : null}
            {/* gotinhas no cano gelado */}
            {[350, 420, 490].map((x, k) => (
              <circle key={x} cx={x} cy={420 + ((t * 30 + k * 7) % 14)} r={5} fill={C.cyan} opacity={0.8} />
            ))}
          </g>
        ) : null}

        {/* etiquetas */}
        <Label t={t} from={T.gas + 0.6} to={T.sala} x={450} y={250} text="GÁS GELADO" color={C.cyan} size={30} />
        <Label t={t} from={T.evaporador} to={T.cheio} x={445} y={230} ax={445} ay={305} text="EVAPORADOR" color={C.cyan} size={34} />
        <Label t={t} from={T.cheio + 0.3} to={T.aperta} x={690} y={600} ax={690} ay={560} text="GÁS COM CALOR" color={C.amber} size={26} />
        <Label t={t} from={T.compressor} to={T.fora} x={760} y={640} ax={760} ay={752} text="COMPRESSOR" color={C.red} size={34} />
        <Label t={t} from={T.aperta + 0.9} to={T.compressor} x={780} y={950} text="MAIS QUENTE!" color={HOT} size={28} />
        <Label t={t} from={T.condensador} to={T.furinho} x={930} y={630} ax={930} ay={690} text="CONDENSADOR" color={C.red} size={32} />
        <Label t={t} from={T.fora + 1.0} to={T.condensador} x={1200} y={660} text="CALOR PRA RUA" color={HOT} size={26} />
        <Label t={t} from={T.furinho + 0.8} to={T.agua} x={720} y={260} ax={640} ay={330} text="FURINHO" color={C.cyan} size={30} />
        <Label t={t} from={T.umidade} to={T.parabens} x={860} y={600} ax={720} ay={680} text="ÁGUA DO AR" color={C.cyan} size={28} />
        <Label t={t} from={T.parabens + 0.2} to={999} x={445} y={240} ax={445} ay={305} text="EVAPORADOR" color={C.cyan} size={26} />
        <Label t={t} from={T.parabens + 0.35} to={999} x={760} y={630} ax={760} ay={752} text="COMPRESSOR" color={C.red} size={26} />
        <Label t={t} from={T.parabens + 0.5} to={999} x={930} y={990} ax={930} ay={900} text="CONDENSADOR" color={C.red} size={26} />
      </g>
    </svg>
  );
};

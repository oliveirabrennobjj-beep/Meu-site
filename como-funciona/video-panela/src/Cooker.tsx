import React from "react";
import { random } from "remotion";
import { C, T, appear, kf, pop, windowed } from "./timeline";

const FONT = "Montserrat, sans-serif";
const RUBBER = "#FF8A3D";
const BEAN = "#7A3B22";
const BEAN2 = "#4A2414";

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

const Stick: React.FC<{ x: number; y: number; s?: number; color?: string; armL?: number; armR?: number }> = ({
  x,
  y,
  s = 1,
  color = C.white,
  armL = 0,
  armR = 0,
}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} stroke={color} strokeWidth={7} strokeLinecap="round" fill="none">
    <circle cx={0} cy={-150} r={20} fill={color} stroke="none" />
    <line x1={0} y1={-128} x2={0} y2={-60} />
    <line x1={0} y1={-60} x2={-22} y2={0} />
    <line x1={0} y1={-60} x2={22} y2={0} />
    <line x1={0} y1={-115} x2={-28} y2={-80 - armL * 60} />
    <line x1={0} y1={-115} x2={36 + armR * 40} y2={-80 - armR * 40} />
  </g>
);

const Cross: React.FC<{ x: number; y: number; o: number; r?: number }> = ({ x, y, o, r = 34 }) =>
  o > 0 ? (
    <g transform={`translate(${x} ${y})`} stroke={C.red} strokeWidth={12} strokeLinecap="round" opacity={o}>
      <line x1={-r} y1={-r} x2={r} y2={r} />
      <line x1={r} y1={-r} x2={-r} y2={r} />
    </g>
  ) : null;

/** Fumaça de vapor saindo de um ponto numa direção. */
const Steam: React.FC<{
  t: number;
  x: number;
  y: number;
  dx: number;
  dy: number;
  amount: number;
  seed: string;
  len?: number;
  size?: number;
  rate?: number;
  n?: number;
}> = ({ t, x, y, dx, dy, amount, seed, len = 160, size = 22, rate = 1.6, n = 10 }) => {
  if (amount <= 0.01) return null;
  return (
    <g>
      {Array.from({ length: n }).map((_, i) => {
        const ph = random(`${seed}${i}`);
        const a = (t * rate + ph) % 1;
        const wob = Math.sin((t + ph * 10) * 3) * 10 * a;
        const px = x + dx * a * len - dy * wob;
        const py = y + dy * a * len + dx * wob;
        const r = size * (0.4 + a * 1.5);
        const o = amount * (1 - a) * Math.min(1, a * 6) * 0.6;
        return <circle key={i} cx={px} cy={py} r={r} fill="#E9F3F0" opacity={o} />;
      })}
    </g>
  );
};

const Hiss: React.FC<{ t: number; x: number; y: number; o: number; size?: number }> = ({ t, x, y, o, size = 40 }) =>
  o > 0.02 ? (
    <text
      x={x + Math.sin(t * 47) * 3}
      y={y + Math.cos(t * 53) * 3}
      textAnchor="middle"
      fontFamily={FONT}
      fontWeight={900}
      fontStyle="italic"
      fontSize={size}
      fill={C.cyan}
      opacity={o}
    >
      TSSS
    </text>
  ) : null;

/* altura da tampa (domo) em cada x */
const domeY = (x: number) => {
  const s = (x - 262) / 556;
  return 600 - 260 * s * (1 - s);
};

const Drill: React.FC<{ t: number; x: number; from: number }> = ({ t, x, from }) => {
  const o = windowed(t, from, from + 1.5, 0.2);
  if (o <= 0) return null;
  const tip = domeY(x) - 2;
  const y = kf(t, [[from, tip - 160], [from + 0.4, tip], [from + 0.9, tip + 6], [from + 1.3, tip - 160]]);
  const spinning = t > from + 0.35 && t < from + 0.95;
  return (
    <g opacity={o}>
      <rect x={x - 6} y={y - 120} width={12} height={120} rx={4} fill={C.amber} />
      <line x1={x - 6} y1={y - 100 + ((t * 300) % 20)} x2={x + 6} y2={y - 92 + ((t * 300) % 20)} stroke={C.bg} strokeWidth={4} />
      <line x1={x - 6} y1={y - 60 + ((t * 300) % 20)} x2={x + 6} y2={y - 52 + ((t * 300) % 20)} stroke={C.bg} strokeWidth={4} />
      <rect x={x - 34} y={y - 210} width={68} height={92} rx={14} fill="rgba(6,9,10,0.95)" stroke={C.steel} strokeWidth={6} />
      {spinning
        ? [0, 1, 2, 3, 4, 5].map((k) => {
            const ang = random(`sp${k}${Math.floor(t * 15)}`) * Math.PI - Math.PI;
            return (
              <line
                key={k}
                x1={x}
                y1={tip}
                x2={x + Math.cos(ang) * 40}
                y2={tip + Math.sin(ang) * 40}
                stroke={C.amber}
                strokeWidth={4}
                strokeLinecap="round"
              />
            );
          })
        : null}
    </g>
  );
};

const Pot: React.FC<{ t: number }> = ({ t }) => {
  // pressão interna (0 a 1); acima de 0.85 a panela treme e fica vermelha
  const p = t < T.preso ? 0 : kf(t, [
    [T.preso, 0],
    [T.graus, 0.6],
    [T.explode, 0.6],
    [T.explode + 1.5, 1.0],
    [T.furinho + 1.0, 1.0],
    [T.furinho + 1.6, 0.6],
    [T.peso + 0.6, 0.6],
    [T.levanta + 1.3, 0.95],
    [T.levanta + 2.0, 0.75],
    [T.entupir + 0.8, 0.75],
    [T.entupir + 2.6, 1.0],
    [T.segundo + 2.0, 1.0],
    [T.segundo + 2.6, 0.6],
    [T.fogo + 0.4, 0.6],
    [T.fogo + 3.0, 0],
  ]);
  const danger = Math.max(0, Math.min(1, (p - 0.85) / 0.15));
  const heat = 1 - appear(t, T.fogo + 0.2, 0.6);

  // tampa: cai, treme, pula e volta
  const lidDrop = kf(t, [[0.3, -420], [0.9, 0, "outBack"]]);
  const lidUp = kf(t, [[T.pula + 0.8, 0], [T.pula + 1.2, -220, "out"], [T.encaixes + 0.2, -235], [T.encaixes + 1.0, 0, "in"]]);
  const lidRot = kf(t, [[T.pula + 0.8, 0], [T.pula + 1.2, 12, "out"], [T.encaixes + 0.2, 10], [T.encaixes + 1.0, 0, "in"]]);
  const tremble = t > 2.2 && t < T.pula + 0.8 ? appear(t, 2.2, T.pula + 0.8 - 2.2) : 0;
  const bob = t > T.pula + 1.2 && t < T.encaixes + 0.2 ? Math.sin(t * 6) * 6 : 0;
  const lidJit = tremble * Math.sin(t * 90) * 5;
  const lidY = lidDrop + lidUp + bob + lidJit;

  const shake = Math.max(danger, 0) * 6;
  const sx = Math.sin(t * 71) * shake;
  const sy = Math.cos(t * 83) * shake;

  const hooks = appear(t, T.encaixes + 1.2, 0.6);
  const hookColor = t > T.encaixes + 1.2 && t < T.bordas ? C.cyan : C.steel;
  const ring = appear(t, T.anel + 0.6, 0.6);
  const ringHot = windowed(t, T.anel + 0.6, T.preso, 0.3);

  const leakStart = t > 2.6 && t < T.pula + 0.8 ? tremble : 0;
  const burst = windowed(t, T.pula + 0.8, T.encaixes + 0.6, 0.15);
  const leak = windowed(t, T.bordas + 0.2, T.anel + 1.2, 0.3);

  const hole = t > T.furinho + 0.9;
  const openJet = windowed(t, T.furinho + 1.0, T.peso + 0.5, 0.15);
  const weightIn = t > T.peso + 0.1;
  const weightY = kf(t, [[T.peso + 0.1, -260], [T.peso + 0.6, 0, "outBack"]]);
  const valveHiss = Math.max(
    windowed(t, T.levanta + 1.4, T.entupir + 0.8, 0.2),
    windowed(t, T.nunca, T.fogo + 2.8, 0.3) * (1 - appear(t, T.fogo + 0.6, 2.2)),
  );
  const lift = valveHiss * 14;
  const wobble = valveHiss * Math.sin(t * 26) * 8;
  const clogged = t > T.entupir + 0.8 && t < T.papin;
  const beanFly = kf(t, [[T.entupir + 0.3, 0], [T.entupir + 0.8, 1, "out"]]);

  const pinIn = t > T.segundo + 1.0;
  const pinPop = kf(t, [[T.segundo + 2.0, 0], [T.segundo + 2.15, 1, "outBack"]]) * (1 - appear(t, T.papin, 0.4));
  const pinSteam = windowed(t, T.segundo + 2.0, T.seguranca + 1.6, 0.15);

  const beansIn = t > T.rapido + 0.1;
  const insideSteam = windowed(t, T.preso, T.fogo + 2.5, 0.6);

  const thermo = windowed(t, T.preso + 0.2, T.explode, 0.3);
  const temp = kf(t, [[T.preso + 0.4, 100], [T.graus + 0.6, 120]]);
  const bars = windowed(t, T.feijao + 0.2, T.explode, 0.3);
  const fill = kf(t, [[T.feijao + 0.5, 0], [T.feijao + 2.3, 1, "linear"]]);

  const lidStroke = danger > 0.05 ? C.red : C.steel;

  return (
    <g>
      {/* fogão */}
      <rect x={0} y={1000} width={1080} height={160} fill="rgba(159,179,173,0.05)" />
      <line x1={0} y1={1000} x2={1080} y2={1000} stroke={C.steel} strokeWidth={4} />
      <rect x={300} y={984} width={480} height={16} rx={4} fill="#2a3532" />
      {/* chamas */}
      {heat > 0.01
        ? Array.from({ length: 7 }).map((_, i) => {
            const x = 330 + i * 70;
            const h = 50 * heat * (0.85 + 0.15 * Math.sin(t * 18 + i * 1.7));
            return (
              <g key={i}>
                <path d={`M ${x - 18} 984 Q ${x - 22} ${984 - h * 0.5} ${x} ${984 - h} Q ${x + 22} ${984 - h * 0.5} ${x + 18} 984 Z`} fill={C.amber} opacity={0.85} />
                <path d={`M ${x - 9} 984 Q ${x - 11} ${984 - h * 0.3} ${x} ${984 - h * 0.6} Q ${x + 11} ${984 - h * 0.3} ${x + 9} 984 Z`} fill={C.cyan} opacity={0.9} />
              </g>
            );
          })
        : null}

      <g transform={`translate(${sx} ${sy})`}>
        {/* corpo da panela (corte) */}
        <rect x={285} y={600} width={510} height={325} fill="rgba(159,179,173,0.05)" />
        {/* água */}
        <path
          d={`M 285 ${720 + Math.sin(t * 5) * 4} Q 412 ${712 + Math.sin(t * 6) * 5} 540 ${720} Q 668 ${728 + Math.sin(t * 7) * 5} 795 ${720 + Math.cos(t * 5) * 4} V 925 H 285 Z`}
          fill="rgba(79,227,255,0.18)"
          stroke={C.cyan}
          strokeWidth={4}
        />
        {/* bolhas */}
        {Array.from({ length: 22 }).map((_, i) => {
          const bx = 305 + random(`bx${i}`) * 470;
          const ph = random(`bp${i}`);
          const a = (t * (0.7 + random(`bs${i}`) * 0.5) + ph) % 1;
          const r = (5 + random(`br${i}`) * 7) * (1 + p * 0.4);
          return <circle key={i} cx={bx + Math.sin(t * 4 + i) * 5} cy={915 - a * 190} r={r} fill="none" stroke={C.cyan} strokeWidth={3} opacity={heat * (0.5 + p * 0.4) * Math.min(1, (1 - a) * 4)} />;
        })}
        {/* feijões */}
        {beansIn
          ? Array.from({ length: 14 }).map((_, i) => {
              const fall = kf(t, [[T.rapido + 0.1 + i * 0.05, -380], [T.rapido + 0.7 + i * 0.05, 0, "outBack"]]);
              const x = 322 + i * 33 + random(`fx${i}`) * 10;
              const y = 892 - random(`fy${i}`) * 26 + Math.sin(t * 3 + i) * 3 * heat;
              return (
                <g key={i} transform={`translate(${x} ${y + fall}) rotate(${random(`fr${i}`) * 180})`}>
                  <ellipse rx={14} ry={9} fill={BEAN} stroke={BEAN2} strokeWidth={3} />
                  <line x1={-4} y1={-2} x2={4} y2={-2} stroke="#E8D2B8" strokeWidth={3} strokeLinecap="round" />
                </g>
              );
            })
          : null}
        {/* vapor preso lá dentro */}
        {insideSteam > 0
          ? Array.from({ length: 12 }).map((_, i) => {
              const ph = random(`is${i}`);
              const a = (t * 0.5 + ph) % 1;
              const x = 330 + random(`ix${i}`) * 420 + Math.sin(t * 2 + i) * 20;
              return <circle key={i} cx={x} cy={712 - a * 110} r={24 + a * 20} fill="#E9F3F0" opacity={insideSteam * 0.13 * Math.sin(a * Math.PI)} />;
            })
          : null}
        {/* perigo */}
        {danger > 0 ? <rect x={285} y={560} width={510} height={365} fill={C.red} opacity={danger * (0.18 + 0.08 * Math.sin(t * 14))} /> : null}
        {/* paredes */}
        <path d="M 280 600 V 910 Q 280 930 300 930 H 780 Q 800 930 800 910 V 600" fill="none" stroke={danger > 0.05 ? C.red : C.steel} strokeWidth={10} strokeLinejoin="round" />
        <line x1={264} y1={600} x2={282} y2={600} stroke={C.steel} strokeWidth={8} strokeLinecap="round" />
        <line x1={798} y1={600} x2={816} y2={600} stroke={C.steel} strokeWidth={8} strokeLinecap="round" />
        {/* cabos */}
        <rect x={805} y={612} width={190} height={34} rx={16} fill="#1b2220" stroke={C.steel} strokeWidth={5} />
        <rect x={225} y={612} width={50} height={28} rx={12} fill="#1b2220" stroke={C.steel} strokeWidth={5} />

        {/* tampa */}
        <g transform={`translate(0 ${lidY}) rotate(${lidRot} 540 600)`}>
          <path d="M 262 600 Q 540 470 818 600 Z" fill="rgba(159,179,173,0.14)" stroke={lidStroke} strokeWidth={8} strokeLinejoin="round" />
          <rect x={830} y={566} width={170} height={30} rx={14} fill="#1b2220" stroke={C.steel} strokeWidth={5} />
          <line x1={800} y1={590} x2={834} y2={582} stroke={C.steel} strokeWidth={6} />
          {/* furo e bico da válvula */}
          {hole ? <rect x={530} y={503} width={20} height={34} rx={3} fill="#1b2220" stroke={C.steel} strokeWidth={4} /> : null}
          {/* furo da válvula de segurança */}
          {pinIn ? (
            <g opacity={appear(t, T.segundo + 1.0, 0.3)}>
              <rect x={674} y={524 - pinPop * 30} width={12} height={26} rx={4} fill={C.red} />
              <rect x={666} y={526} width={28} height={26} rx={6} fill="#1b2220" stroke={C.red} strokeWidth={5} />
            </g>
          ) : null}
        </g>

        {/* feijão que entope */}
        {t > T.entupir + 0.3 && t < T.papin ? (
          <g transform={`translate(540 ${800 - beanFly * 262}) rotate(${90 * beanFly})`} opacity={1 - appear(t, T.papin - 0.4, 0.4)}>
            <ellipse rx={13} ry={9} fill={BEAN} stroke={clogged ? C.red : BEAN2} strokeWidth={3} />
          </g>
        ) : null}

        {/* peso da válvula */}
        {weightIn ? (
          <g transform={`translate(540 ${503 + weightY - lift}) rotate(${wobble})`}>
            <path d="M -38 -4 H 38 L 28 6 H -28 Z" fill="#1b2220" stroke={C.amber} strokeWidth={4} />
            <rect x={-32} y={-52} width={64} height={48} rx={10} fill="#1b2220" stroke={C.amber} strokeWidth={6} />
            <rect x={-12} y={-70} width={24} height={20} rx={6} fill="#1b2220" stroke={C.amber} strokeWidth={5} />
          </g>
        ) : null}

        {/* anel de borracha */}
        {ring > 0 ? (
          <g opacity={ring} transform={`translate(0 ${(1 - ring) * -50})`} filter={ringHot > 0.5 ? "url(#glow)" : undefined}>
            <line x1={262} y1={601} x2={306} y2={601} stroke={RUBBER} strokeWidth={12} strokeLinecap="round" />
            <line x1={774} y1={601} x2={818} y2={601} stroke={RUBBER} strokeWidth={12} strokeLinecap="round" />
          </g>
        ) : null}
        {/* encaixes */}
        {hooks > 0 ? (
          <g stroke={hookColor} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" fill="none">
            <path d={`M 254 618 V 578 H ${254 + 46 * hooks}`} />
            <path d={`M 826 618 V 578 H ${826 - 46 * hooks}`} />
          </g>
        ) : null}

        {/* vapores */}
        <Steam t={t} x={258} y={596 + lidY} dx={-0.7} dy={-0.7} amount={leakStart * 0.7} seed="la" len={110} size={16} />
        <Steam t={t} x={822} y={596 + lidY} dx={0.7} dy={-0.7} amount={leakStart * 0.7} seed="lb" len={110} size={16} />
        <Steam t={t} x={540} y={640} dx={0} dy={-1} amount={burst} seed="bu" len={320} size={40} rate={1.4} n={16} />
        <Steam t={t} x={258} y={596} dx={-0.75} dy={-0.65} amount={leak} seed="va" len={140} size={18} />
        <Steam t={t} x={822} y={596} dx={0.75} dy={-0.65} amount={leak} seed="vb" len={140} size={18} />
        <Steam t={t} x={540} y={500} dx={0} dy={-1} amount={openJet} seed="oj" len={220} size={18} rate={2.2} />
        <Steam t={t} x={505} y={498 - lift} dx={-0.85} dy={-0.5} amount={valveHiss} seed="ha" len={200} size={16} rate={2.4} />
        <Steam t={t} x={575} y={498 - lift} dx={0.85} dy={-0.5} amount={valveHiss} seed="hb" len={200} size={16} rate={2.4} />
        <Steam t={t} x={680} y={520} dx={0.25} dy={-1} amount={pinSteam} seed="ps" len={260} size={22} rate={2.4} n={14} />
        <Hiss t={t} x={420} y={430} o={valveHiss} />
        <Hiss t={t} x={790} y={540} o={pinSteam} size={34} />
      </g>

      {/* termômetro */}
      {thermo > 0 ? (
        <g opacity={thermo}>
          <rect x={134} y={280} width={32} height={330} rx={16} fill="rgba(6,9,10,0.9)" stroke={C.white} strokeWidth={5} />
          <rect x={143} y={600 - ((temp - 20) / 110) * 320} width={14} height={((temp - 20) / 110) * 320 + 20} rx={7} fill={C.red} />
          <circle cx={150} cy={636} r={30} fill={C.red} stroke={C.white} strokeWidth={5} />
          <line x1={166} y1={600 - (80 / 110) * 320} x2={190} y2={600 - (80 / 110) * 320} stroke={C.steel} strokeWidth={4} />
          <text x={196} y={600 - (80 / 110) * 320 + 10} fontFamily={FONT} fontWeight={800} fontSize={28} fill={C.steel}>
            100°
          </text>
          <line x1={166} y1={600 - (100 / 110) * 320} x2={190} y2={600 - (100 / 110) * 320} stroke={C.amber} strokeWidth={4} />
          <text x={196} y={600 - (100 / 110) * 320 + 10} fontFamily={FONT} fontWeight={800} fontSize={28} fill={C.amber} opacity={appear(t, T.graus, 0.3)}>
            120°
          </text>
          <text x={150} y={730} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={46} fill={temp > 110 ? C.amber : C.white} filter="url(#glow)">
            {Math.round(temp)}°C
          </text>
        </g>
      ) : null}

      {/* metade do tempo */}
      {bars > 0 ? (
        <g opacity={bars}>
          <text x={320} y={290} fontFamily={FONT} fontWeight={800} fontSize={30} fill={C.steel}>
            PANELA COMUM
          </text>
          <rect x={320} y={304} width={640} height={36} rx={18} fill="rgba(159,179,173,0.12)" />
          <rect x={320} y={304} width={640 * fill} height={36} rx={18} fill={C.steel} />
          <text x={320} y={392} fontFamily={FONT} fontWeight={800} fontSize={30} fill={C.lime}>
            PANELA DE PRESSÃO
          </text>
          <rect x={320} y={406} width={640} height={36} rx={18} fill="rgba(184,255,60,0.08)" />
          <rect x={320} y={406} width={320 * Math.min(1, fill * 2)} height={36} rx={18} fill={C.lime} />
          <text x={660} y={436} fontFamily={FONT} fontWeight={900} fontSize={34} fill={C.lime} opacity={appear(t, T.feijao + 1.5, 0.3)}>
            PRONTO!
          </text>
        </g>
      ) : null}

      <Drill t={t} x={540} from={T.furinho + 0.3} />
      <Drill t={t} x={680} from={T.segundo + 0.3} />

      {/* aviso: não abra com pressão */}
      {t > T.nunca && t < T.parabens ? (
        <g opacity={windowed(t, T.nunca, T.parabens, 0.3)}>
          <Stick x={120} y={1000} s={1.05} color={C.red} armR={1} />
        </g>
      ) : null}
      <Cross x={540} y={540} o={windowed(t, T.nunca + 0.8, T.fogo + 0.6, 0.25)} r={60} />
      {t > T.fogo + 0.8 && t < T.parabens ? (
        <g transform="translate(900 300)" opacity={windowed(t, T.fogo + 0.8, T.parabens, 0.3)}>
          <circle r={52} fill="rgba(6,9,10,0.9)" stroke={C.white} strokeWidth={6} />
          <line x1={0} y1={0} x2={0} y2={-34} stroke={C.white} strokeWidth={6} strokeLinecap="round" transform={`rotate(${(t - T.fogo) * 240})`} />
          <line x1={0} y1={0} x2={22} y2={0} stroke={C.amber} strokeWidth={6} strokeLinecap="round" transform={`rotate(${(t - T.fogo) * 20})`} />
        </g>
      ) : null}

      <Label t={t} from={1.2} to={T.pula} x={540} y={420} ax={540} ay={540} text="TAMPA PESADA" color={C.amber} />
      <Label t={t} from={T.pula + 1.0} to={T.encaixes} x={870} y={460} text="PULOU!" color={C.red} />
      <Label t={t} from={T.encaixes + 1.7} to={T.bordas} x={340} y={460} ax={258} ay={584} text="TRAVA" color={C.cyan} />
      <Label t={t} from={T.bordas + 0.6} to={T.anel} x={880} y={470} ax={822} ay={596} text="VAZA!" color={C.red} />
      <Label t={t} from={T.anel + 1.3} to={T.vedacao} x={410} y={480} ax={284} ay={601} text="ANEL DE BORRACHA" color={RUBBER} size={20} />
      <Label t={t} from={T.vedacao} to={T.preso} x={410} y={480} ax={284} ay={601} text="VEDAÇÃO" color={C.lime} size={24} />
      <Label t={t} from={T.preso + 0.6} to={T.graus} x={540} y={655} text="VAPOR PRESO" color={C.cyan} size={28} />
      <Label t={t} from={T.explode + 1.2} to={T.furinho} x={540} y={410} text="PERIGO!" color={C.red} size={44} />
      <Label t={t} from={T.furinho + 1.0} to={T.peso} x={700} y={440} ax={540} ay={510} text="FURINHO" color={C.cyan} size={22} />
      <Label t={t} from={T.peso + 0.8} to={T.levanta + 1.3} x={720} y={420} ax={572} ay={470} text="PESO" color={C.amber} size={22} />
      <Label t={t} from={T.valvula} to={T.entupir} x={730} y={400} ax={572} ay={460} text="VÁLVULA" color={C.lime} size={24} />
      <Label t={t} from={T.entupir + 1.1} to={T.segundo + 0.3} x={420} y={430} ax={530} ay={532} text="ENTUPIU!" color={C.red} size={22} />
      <Label t={t} from={T.segundo + 1.2} to={T.seguranca} x={830} y={460} ax={692} ay={520} text="PINO" color={C.red} size={22} />
      <Label t={t} from={T.seguranca} to={T.papin} x={700} y={392} ax={686} ay={500} text="VÁLVULA DE SEGURANÇA" color={C.lime} size={22} />
      <Label t={t} from={T.nunca + 0.9} to={T.fogo} x={540} y={400} text="NÃO ABRA COM PRESSÃO" color={C.red} size={30} />
      <Label t={t} from={T.fogo + 0.2} to={T.fogo + 2.2} x={540} y={1050} text="TIRA DO FOGO" color={C.amber} size={30} />
      <Label t={t} from={T.fogo + 1.6} to={T.parabens - 0.3} x={540} y={420} text="ESPERE O CHIADO PARAR" color={C.white} size={28} />
      <Label t={t} from={T.parabens + 0.3} to={999} x={200} y={470} ax={258} ay={584} text="TRAVA" color={C.cyan} size={24} />
      <Label t={t} from={T.parabens + 0.45} to={999} x={890} y={700} ax={810} ay={601} text="VEDAÇÃO" color={RUBBER} size={24} />
      <Label t={t} from={T.parabens + 0.6} to={999} x={380} y={410} ax={540} ay={460} text="VÁLVULA" color={C.amber} size={24} />
      <Label t={t} from={T.parabens + 0.75} to={999} x={820} y={430} ax={680} ay={526} text="SEGURANÇA" color={C.red} size={24} />
      <Label t={t} from={T.parabens + 0.9} to={999} x={540} y={820} text="~120 °C" color={C.cyan} size={28} />
    </g>
  );
};

const Papin: React.FC<{ t: number }> = ({ t }) => {
  const o = windowed(t, T.papin + 0.2, T.nunca, 0.3);
  if (o <= 0) return null;
  return (
    <g opacity={o} transform={`translate(540 560) scale(${0.85 + 0.15 * pop(t, T.papin + 0.2)})`}>
      <rect x={-380} y={-170} width={760} height={340} rx={36} fill="rgba(6,9,10,0.95)" stroke={C.amber} strokeWidth={6} />
      <text x={0} y={-60} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={64} fill={C.white}>
        DENIS PAPIN
      </text>
      <text x={0} y={34} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={76} fill={C.amber}>
        FRANÇA · 1679
      </text>
      <text x={0} y={116} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={44} fill={C.cyan} opacity={appear(t, T.digestor, 0.3)}>
        “DIGESTOR”
      </text>
    </g>
  );
};

export const Cooker: React.FC<{ t: number; dimmed: number }> = ({ t, dimmed }) => {
  const cams: [number, number, number, number][] = [
    [0, 540, 640, 1.05],
    [T.anel, 330, 600, 1.7],
    [T.preso, 540, 600, 1.0],
    [T.furinho, 540, 560, 1.4],
    [T.entupir, 600, 560, 1.4],
    [T.papin, 540, 620, 1.0],
  ];
  let ci = 0;
  for (let k = 0; k < cams.length; k++) if (t >= cams[k][0]) ci = k;
  const prev = cams[Math.max(0, ci - 1)];
  const cur = cams[ci];
  const m = ci === 0 ? 1 : appear(t, cur[0], 1.0);
  const cx = prev[1] + (cur[1] - prev[1]) * m;
  const cy = prev[2] + (cur[2] - prev[2]) * m;
  const sc = prev[3] + (cur[3] - prev[3]) * m;
  const card = windowed(t, T.papin + 0.2, T.nunca, 0.3);

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
      <g opacity={(1 - dimmed * 0.75) * (1 - card * 0.75)} transform={`translate(540 575) scale(${sc}) translate(${-cx} ${-cy})`}>
        <Pot t={t} />
      </g>
      <Papin t={t} />
    </svg>
  );
};

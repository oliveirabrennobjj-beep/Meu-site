import React from "react";
import { random } from "remotion";
import { C, G, appear, inkTop, kf, penX, pop, windowed } from "./timeline";

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
}> = ({ t, from, to, x, y, ax, ay, text, color = C.lime, size = 34 }) => {
  const o = windowed(t, from, to, 0.25);
  if (o <= 0) return null;
  const s = pop(t, from, 0.45);
  const w = text.length * size * 0.74 + size;
  const h = size + size * 0.75;
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

const wave = (x: number) => G.paperY + 24 + Math.sin(x * 0.07) * 8 + Math.sin(x * 0.023) * 6;
const stroke = (x0: number, x1: number) => {
  const pts: string[] = [];
  const dir = x1 >= x0 ? 1 : -1;
  for (let x = x0; dir > 0 ? x <= x1 : x >= x1; x += 6 * dir) pts.push(`${x.toFixed(1)},${wave(x).toFixed(1)}`);
  return pts.join(" ");
};

const Line: React.FC<{ t: number; t0: number; t1: number; x0: number; x1: (t: number) => number; until: number; color?: string; dash?: boolean; fadeAlong?: boolean }> = ({
  t,
  t0,
  t1,
  x0,
  x1,
  until,
  color = C.ink,
  dash,
  fadeAlong,
}) => {
  if (t < t0) return null;
  const o = 1 - appear(t, until - 0.4, 0.4);
  if (o <= 0) return null;
  const end = x1(Math.min(t, t1));
  if (Math.abs(end - x0) < 2) return null;
  return (
    <polyline
      points={stroke(x0, end)}
      fill="none"
      stroke={color}
      strokeWidth={fadeAlong ? 4 : 7}
      strokeLinecap="round"
      strokeDasharray={dash ? "4 14" : undefined}
      opacity={o * (fadeAlong ? 0.6 : 1)}
      filter="url(#glow)"
    />
  );
};

const Quill: React.FC<{ t: number }> = ({ t }) => {
  const o = 1 - appear(t, 6.1, 0.4);
  if (o <= 0) return null;
  const qx = kf(t, [
    [0, -320],
    [1.0, -320],
    [1.6, -150],
    [3.6, 80, "linear"],
    [4.4, 80],
    [5.8, 220, "linear"],
  ]);
  const inked = 1 - appear(t, 3.4, 1.5);
  return (
    <g opacity={o} transform={`translate(${G.x + qx} ${G.paperY - 4}) rotate(-28)`}>
      <path d="M 0 0 L -12 -70 L 12 -70 Z" fill={inked > 0.3 ? C.ink : C.dim} stroke={C.white} strokeWidth={3} />
      <line x1={0} y1={-70} x2={0} y2={-560} stroke={C.white} strokeWidth={6} strokeLinecap="round" />
      <path d="M 0 -210 C 70 -260 90 -420 20 -580 C -10 -470 -30 -330 0 -210 Z" fill="rgba(255,201,77,0.18)" stroke={C.amber} strokeWidth={5} />
      <path d="M 0 -230 C -60 -290 -70 -420 -10 -560" fill="none" stroke={C.amber} strokeWidth={4} opacity={0.7} />
      {[0, 1, 2, 3, 4, 5].map((k) => (
        <line key={k} x1={0} y1={-260 - k * 50} x2={50 - k * 4} y2={-300 - k * 52} stroke={C.amber} strokeWidth={2} opacity={0.6} />
      ))}
    </g>
  );
};

/** Pen scene: quill → refill → ball tip → barrel → cap. */
const PenScene: React.FC<{ t: number }> = ({ t }) => {
  const px = penX(t);
  const lift = kf(t, [
    [42.5, 0],
    [43.0, -140],
    [58.7, -140],
    [59.6, 0],
  ]);
  const it = inkTop(t);
  const tubeIn = t >= 6.6 ? pop(t, 6.6, 0.5) : 0;
  const tipIn = t >= 13.6 ? pop(t, 13.6, 0.45) : 0;
  const barrelIn = appear(t, 35.6, 0.6);
  const dry = windowed(t, 41.0, 43.2, 0.3);
  const writing = (t > 17.2 && t < 21.2) || (t > 39.4 && t < 40.6) || (t > 60.9 && t < 62.6);
  const ballRot = px * 6;
  const L = G.x - G.tubeW / 2;
  const R = G.x + G.tubeW / 2;
  const bL = G.x - G.barrelW / 2;
  const bR = G.x + G.barrelW / 2;

  // cap: slides in from the right, then gets posted on the back of the pen
  const capInX = kf(t, [
    [42.9, 520],
    [43.75, 0, "outBack"],
  ]);
  const capPost = appear(t, 58.7, 0.8);
  const capY = 760 + (60 - 760) * capPost;
  const capVisible = t >= 42.9;
  const clipIn = t >= 59.04 ? pop(t, 59.04, 0.45) : 0;
  const glassy = appear(t, 60.6, 0.5);

  // drips from the open refill
  const drips =
    t > 10.6 && t < 13.6
      ? [0, 1, 2, 3].map((k) => {
          const p = ((t - 10.6 + k * 0.3) % 1.2) / 1.2;
          return { y: G.tubeBot + p * (G.paperY - G.tubeBot), o: 1 - p * 0.3 };
        })
      : [];
  const blotR = kf(t, [
    [11.2, 0],
    [13.2, 95, "out"],
  ]);
  const blotO = 1 - appear(t, 14.2, 0.6);

  // air particles entering the hole
  const airOn = t > 37.3 && t < 41.0;
  const air = airOn
    ? Array.from({ length: 10 }).map((_, k) => {
        const p = ((t - 37.3) * 0.9 + k / 10) % 1;
        let x: number;
        let y: number;
        if (p < 0.3) {
          x = 760 - (p / 0.3) * (760 - bR);
          y = G.holeY;
        } else if (p < 0.7) {
          const q = (p - 0.3) / 0.4;
          x = bR - q * (bR - R - 8);
          y = G.holeY - q * (G.holeY - G.tubeTop - 10);
        } else {
          const q = (p - 0.7) / 0.3;
          x = R + 8 - q * (R + 8 - G.x);
          y = G.tubeTop + q * (it - 14 - G.tubeTop);
        }
        return { x, y, o: Math.sin(p * Math.PI) };
      })
    : [];

  const vac = windowed(t, 31.6, 35.6, 0.4);

  return (
    <>
      {/* paper */}
      <rect x={-300} y={G.paperY} width={1680} height={300} fill="rgba(242,247,244,0.06)" />
      <line x1={-300} y1={G.paperY} x2={1380} y2={G.paperY} stroke={C.steel} strokeWidth={4} />
      {/* inkwell */}
      <g opacity={1 - appear(t, 6.1, 0.4)}>
        <path d="M 170 990 L 180 920 L 260 920 L 270 990 Z" fill="rgba(77,124,255,0.25)" stroke={C.white} strokeWidth={4} />
        <rect x={192} y={905} width={56} height={18} rx={4} fill={C.white} />
      </g>

      {/* writing */}
      <Line t={t} t0={1.6} t1={3.6} x0={G.x - 150} x1={(tt) => G.x + kf(tt, [[1.6, -150], [3.6, 80, "linear"]])} until={6.8} />
      <Line t={t} t0={4.4} t1={5.8} x0={G.x + 80} x1={(tt) => G.x + kf(tt, [[4.4, 80], [5.8, 220, "linear"]])} until={6.8} dash fadeAlong color={C.red} />
      <Line t={t} t0={17.2} t1={21.2} x0={G.x - 170} x1={(tt) => G.x + penX(tt)} until={30.0} />
      <Line t={t} t0={30.5} t1={31.4} x0={G.x - 120} x1={(tt) => G.x + penX(tt)} until={44.2} fadeAlong />
      <Line t={t} t0={39.4} t1={40.6} x0={G.x - 60} x1={(tt) => G.x + penX(tt)} until={44.2} />
      <Line t={t} t0={60.9} t1={62.6} x0={G.x - 150} x1={(tt) => G.x + penX(tt)} until={99} />
      {blotO > 0 && blotR > 0 ? (
        <g opacity={blotO} filter="url(#glow)">
          <ellipse cx={G.x} cy={G.paperY + 26} rx={blotR * 1.4} ry={blotR * 0.35} fill={C.ink} />
          <circle cx={G.x - blotR} cy={G.paperY + 40} r={blotR * 0.12} fill={C.ink} />
          <circle cx={G.x + blotR * 1.1} cy={G.paperY + 30} r={blotR * 0.09} fill={C.ink} />
        </g>
      ) : null}

      <Quill t={t} />

      <g transform={`translate(${px} ${lift})`}>
        {/* barrel */}
        {barrelIn > 0 ? (
          <g opacity={barrelIn}>
            <path
              d={`M ${bL} ${G.barrelTop + 20} Q ${bL} ${G.barrelTop} ${bL + 20} ${G.barrelTop} H ${bR - 20} Q ${bR} ${G.barrelTop} ${bR} ${G.barrelTop + 20} V ${G.barrelBot} L ${G.x + 24} 935 H ${G.x - 24} L ${bL} ${G.barrelBot} Z`}
              fill={`rgba(79,227,255,${0.05 + glassy * 0.08})`}
              stroke={C.cyan}
              strokeWidth={5}
              filter="url(#glow)"
            />
            {glassy > 0 ? (
              <line x1={bL + 26} y1={G.barrelTop + 40} x2={bL + 26} y2={G.barrelBot - 20} stroke={C.white} strokeWidth={6} opacity={0.35 * glassy} strokeLinecap="round" />
            ) : null}
            <circle cx={bR} cy={G.holeY} r={12} fill={C.bg} stroke={C.lime} strokeWidth={5} />
          </g>
        ) : null}

        {/* refill */}
        {tubeIn > 0 ? (
          <g transform={`translate(${G.x} ${G.tubeBot}) scale(${tubeIn}) translate(${-G.x} ${-G.tubeBot})`}>
            <rect x={L} y={G.tubeTop} width={G.tubeW} height={G.tubeBot - G.tubeTop} rx={6} fill="rgba(242,247,244,0.05)" stroke={C.white} strokeWidth={4} />
            <rect x={L + 4} y={it} width={G.tubeW - 8} height={Math.max(0, G.tubeBot - it - 2)} fill={C.ink} filter="url(#glow)" />
            {vac > 0 ? (
              <rect x={L + 4} y={G.tubeTop + 4} width={G.tubeW - 8} height={it - G.tubeTop - 8} fill={C.red} opacity={vac * (0.25 + 0.15 * Math.sin(t * 10))} />
            ) : null}
          </g>
        ) : null}

        {/* drips */}
        {drips.map((d, k) => (
          <ellipse key={k} cx={G.x} cy={d.y} rx={9} ry={14} fill={C.ink} opacity={d.o} filter="url(#glow)" />
        ))}

        {/* tip + ball */}
        {tipIn > 0 ? (
          <g transform={`translate(${G.x} ${G.tipY}) scale(${tipIn}) translate(${-G.x} ${-G.tipY})`}>
            <polygon points={`${L},${G.tubeBot} ${R},${G.tubeBot} ${G.x + 9},${G.tipY - 10} ${G.x - 9},${G.tipY - 10}`} fill={dry > 0.5 ? C.dim : C.steel} stroke={C.white} strokeWidth={2} />
            {writing && dry === 0 ? <path d={`M ${G.x - 13} ${G.tipY} A 13 13 0 0 0 ${G.x + 13} ${G.tipY}`} stroke={C.ink} strokeWidth={6} fill="none" /> : null}
            <g transform={`translate(${G.x} ${G.tipY}) rotate(${ballRot})`}>
              <circle r={G.ballR} fill={dry > 0.5 ? "#7d8a86" : "#e8f0ee"} stroke={C.white} strokeWidth={2} />
              <line x1={-G.ballR + 3} y1={0} x2={G.ballR - 3} y2={0} stroke={C.ink} strokeWidth={3} />
            </g>
            {dry > 0 ? (
              <g opacity={dry} stroke={C.red} strokeWidth={2.5}>
                <path d={`M ${G.x - 6} ${G.tipY - 30} l 4 8 l -3 7`} fill="none" />
                <path d={`M ${G.x + 5} ${G.tipY - 40} l -3 9 l 4 6`} fill="none" />
              </g>
            ) : null}
          </g>
        ) : null}

        {/* air */}
        {air.map((a, k) => (
          <circle key={k} cx={a.x} cy={a.y} r={7} fill={C.white} opacity={a.o * 0.9} filter="url(#glow)" />
        ))}

        {/* cap */}
        {capVisible ? (
          <g transform={`translate(${capInX} ${capY - 760})`}>
            <path
              d={`M ${G.x - 85} 760 H ${G.x + 85} V 970 Q ${G.x + 85} 1000 ${G.x + 55} 1000 H ${G.x - 55} Q ${G.x - 85} 1000 ${G.x - 85} 970 Z`}
              fill="rgba(77,124,255,0.35)"
              stroke={C.ink}
              strokeWidth={6}
              filter="url(#glow)"
            />
            <rect x={G.x - 10} y={980} width={20} height={22} fill={C.bg} stroke={C.lime} strokeWidth={4} />
            {clipIn > 0 ? (
              <g transform={`translate(${G.x + 85} 770) scale(${clipIn}) translate(${-(G.x + 85)} -770)`}>
                <path d={`M ${G.x + 85} 770 H ${G.x + 112} V 1000 Q ${G.x + 112} 1020 ${G.x + 100} 1020 H ${G.x + 92}`} fill="none" stroke={C.amber} strokeWidth={10} strokeLinecap="round" filter="url(#glow)" />
              </g>
            ) : null}
          </g>
        ) : null}

        {/* labels attached to the pen */}
        <Label t={t} from={9.8} to={13.4} x={G.x + 230} y={520} ax={R + 4} ay={520} text="CARGA" />
        <Label t={t} from={15.0} to={17.1} x={G.x + 110} y={G.tipY - 60} ax={G.x + 10} ay={G.tipY} text="BOLINHA DE METAL" size={16} />
        <Label t={t} from={22.0} to={23.2} x={G.x} y={G.tipY - 80} text="PONTA ESFEROGRÁFICA" size={14} color={C.cyan} />
        <Label t={t} from={33.1} to={35.4} x={G.x + 220} y={270} ax={G.x + 10} ay={270} text="VÁCUO" color={C.red} size={28} />
        <Label t={t} from={35.9} to={40.6} x={G.x + 260} y={G.holeY - 90} ax={bR + 10} ay={G.holeY} text="FURINHO" size={28} />
        <Label t={t} from={37.6} to={40.6} x={G.x + 260} y={G.holeY + 70} text="AR ENTRA" color={C.white} size={22} />
        <Label t={t} from={41.4} to={42.9} x={G.x} y={G.tipY - 80} text="SECOU!" color={C.red} size={18} />
        <Label t={t} from={43.8} to={44.4} x={G.x + 260} y={880} ax={G.x + 85} ay={880} text="TAMPA" />
        <Label t={t} from={59.1} to={60.5} x={G.x + 300} y={230} ax={G.x + 112} ay={200} text="CLIPE" color={C.amber} />
        <Label t={t} from={60.6} to={63.0} x={G.x - 280} y={520} ax={bL} ay={520} text="DÁ PRA VER A TINTA" size={26} color={C.cyan} />
        <Label t={t} from={63.4} to={99} x={G.x - 270} y={180} ax={G.x - 85} ay={180} text="TAMPA COM FURO" size={24} color={C.lime} />
        <Label t={t} from={63.55} to={99} x={G.x + 290} y={330} ax={G.x + 112} ay={300} text="CLIPE" size={24} color={C.amber} />
        <Label t={t} from={63.7} to={99} x={G.x + 280} y={G.holeY + 30} ax={bR + 10} ay={G.holeY} text="FURINHO" size={24} />
        <Label t={t} from={63.85} to={99} x={G.x - 270} y={640} ax={L} ay={640} text="CARGA" size={24} color={C.cyan} />
        <Label t={t} from={64.0} to={99} x={G.x + 260} y={G.tipY - 40} ax={G.x + 10} ay={G.tipY} text="BOLINHA" size={24} />
      </g>

      {/* screen-level labels */}
      <Label t={t} from={0.6} to={4.1} x={G.x - 300} y={840} ax={222} ay={910} text="TINTEIRO" color={C.ink} size={28} />
      <Label t={t} from={4.9} to={6.4} x={G.x + 160} y={G.paperY - 60} text="SEM TINTA" color={C.red} size={28} />
      <Label t={t} from={12.3} to={13.6} x={G.x} y={G.paperY - 150} text="BORROU!" color={C.red} />
      <Label t={t} from={31.5} to={33.0} x={G.x - 60 + 0} y={G.paperY - 70} text="PAROU" color={C.red} size={20} />
    </>
  );
};

/** Throat scene: the cap gets stuck, and the hole lets air through. */
const ThroatScene: React.FC<{ t: number }> = ({ t }) => {
  const wl = 425;
  const wr = 655;
  const capTopY = kf(t, [
    [46.6, -420],
    [48.2, 380, "in"],
    [48.4, 395, "out"],
    [48.6, 380],
  ]);
  const capH = 360;
  const capBot = capTopY + capH;
  const hole = t >= 51.0 ? pop(t, 51.0, 0.5) : 0;
  const flowing = t >= 52.3;
  const blocked = t >= 48.6 && !flowing;
  const N = 36;
  const parts = Array.from({ length: N }).map((_, k) => {
    const seedX = random(`px${k}`);
    const speed = 260 + random(`ps${k}`) * 120;
    const phase = random(`pp${k}`) * 1100;
    let y = 60 + ((t * speed + phase) % 1100);
    let x = wl + 20 + seedX * (wr - wl - 40);
    let o = 1;
    let color: string = C.cyan;
    if (t >= 48.4) {
      if (!flowing) {
        if (y > capTopY - 14) {
          y = capTopY - 14 - (k % 6) * 14;
          color = C.red;
          o = 0.9;
        }
      } else if (y > capTopY - 40 && y < capBot + 40) {
        const q = Math.min(1, Math.max(0, (y - (capTopY - 40)) / 40));
        x = x + (540 + (seedX - 0.5) * 30 - x) * (y < capBot ? q : 1 - (y - capBot) / 40);
        color = C.lime;
      } else if (y >= capBot + 40) {
        color = C.lime;
      }
    }
    return { x, y, o, color };
  });
  const redPulse = blocked ? 0.12 + 0.08 * Math.sin(t * 12) : 0;
  return (
    <>
      <rect x={wl} y={capBot} width={wr - wl} height={1150 - capBot} fill={C.red} opacity={redPulse} />
      {/* airway walls */}
      <path d={`M 300 40 Q 300 110 ${wl} 160 V 1150`} fill="none" stroke="#ff9aa8" strokeWidth={8} opacity={0.8} />
      <path d={`M 780 40 Q 780 110 ${wr} 160 V 1150`} fill="none" stroke="#ff9aa8" strokeWidth={8} opacity={0.8} />
      {[0, 1, 2, 3, 4].map((k) => (
        <path key={k} d={`M ${wl} ${820 + k * 70} Q 540 ${850 + k * 70} ${wr} ${820 + k * 70}`} fill="none" stroke="#ff9aa8" strokeWidth={4} opacity={0.4} />
      ))}
      <text x={820} y={250} fontFamily={FONT} fontWeight={800} fontSize={30} fill="#ff9aa8" letterSpacing={3}>
        GARGANTA
      </text>
      {/* air */}
      {parts.map((p, k) => (
        <circle key={k} cx={p.x} cy={p.y} r={8} fill={p.color} opacity={p.o * 0.85} filter="url(#glow)" />
      ))}
      {/* cap */}
      <g>
        <path
          d={`M ${540 - 115} ${capTopY + 30} Q ${540 - 115} ${capTopY} ${540 - 85} ${capTopY} H ${540 + 85} Q ${540 + 115} ${capTopY} ${540 + 115} ${capTopY + 30} V ${capBot} H ${540 - 115} Z`}
          fill="rgba(77,124,255,0.55)"
          stroke={C.ink}
          strokeWidth={8}
          filter="url(#glow)"
        />
        <rect x={540 - 85} y={capBot - 40} width={170} height={40} fill="rgba(6,9,10,0.6)" />
        {hole > 0 ? (
          <rect
            x={540 - 26 * hole}
            y={capTopY - 2}
            width={52 * hole}
            height={capH + 4}
            rx={10}
            fill={C.bg}
            stroke={C.lime}
            strokeWidth={5}
          />
        ) : null}
      </g>
      {blocked ? (
        <g opacity={appear(t, 49.2, 0.2)} transform={`translate(540 ${capBot + 150})`}>
          <path d="M -90 -90 L 90 90 M 90 -90 L -90 90" stroke={C.red} strokeWidth={26} strokeLinecap="round" filter="url(#glow)" />
        </g>
      ) : null}
      <Label t={t} from={49.3} to={51.0} x={540} y={capBot + 300} text="O AR NÃO PASSA" color={C.red} />
      <Label t={t} from={51.4} to={58.6} x={810} y={capTopY + 180} ax={566} ay={capTopY + 180} text="FURO" size={30} />
      <Label t={t} from={52.6} to={58.6} x={540} y={capBot + 300} text="O AR CONTINUA PASSANDO" size={30} />
    </>
  );
};

export const Pen: React.FC<{ t: number; dimmed: number }> = ({ t, dimmed }) => {
  const throat = windowed(t, 44.35, 58.67, 0.45);
  const pen = 1 - throat;
  const tipX = G.x + penX(t);
  const fTip = Math.max(windowed(t, 13.4, 23.25, 0.7), windowed(t, 40.9, 42.6, 0.4));
  const fTop = windowed(t, 30.8, 35.3, 0.6);
  const fHole = windowed(t, 35.3, 40.4, 0.6);
  const fEnd = appear(t, 58.7, 0.8);
  const sc = 1 + fTip * 1.3 + fTop * 0.55 + fHole * 0.35 - fEnd * 0.06;
  const cx = G.x + fTip * (tipX - G.x) + fHole * 30;
  const cy = 575 + fTip * (925 - 575) + fTop * (360 - 575) + fHole * (420 - 575);
  return (
    <svg viewBox="0 0 1080 1150" width={1080} height={1150} style={{ overflow: "visible" }}>
      <defs>
        <filter id="glow" filterUnits="userSpaceOnUse" x="-600" y="-600" width="2400" height="2400">
          <feGaussianBlur stdDeviation="6" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <g opacity={(1 - dimmed * 0.75) * pen} transform={`translate(540 575) scale(${sc}) translate(${-cx} ${-cy})`}>
        <PenScene t={t} />
      </g>
      {throat > 0 ? (
        <g opacity={(1 - dimmed * 0.75) * throat}>
          <ThroatScene t={t} />
        </g>
      ) : null}
    </svg>
  );
};

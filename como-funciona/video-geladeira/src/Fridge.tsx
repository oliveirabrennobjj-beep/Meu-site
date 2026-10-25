import React from "react";
import { random } from "remotion";
import { C, G, LOOP_LEN, PART, T, appear, kf, pathBetween, pointAt, pop, windowed } from "./timeline";

const FONT = "Montserrat, sans-serif";

const lerp = (a: number, b: number, p: number) => a + (b - a) * p;
const hex = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const mix = (a: string, b: string, p: number) => {
  const A = hex(a);
  const B = hex(b);
  return `rgb(${A.map((v, i) => Math.round(lerp(v, B[i], p))).join(",")})`;
};

const Label: React.FC<{ x: number; y: number; text: string; color: string; t: number; from: number; anchor?: "start" | "middle" | "end" }> = ({
  x,
  y,
  text,
  color,
  t,
  from,
  anchor = "middle",
}) => {
  const o = appear(t, from, 0.3);
  if (o <= 0) return null;
  const w = text.length * 25 + 44;
  const x0 = anchor === "middle" ? x - w / 2 : anchor === "end" ? x - w : x;
  const s = 0.6 + 0.4 * pop(t, from);
  return (
    <g opacity={o} transform={`translate(${x0 + w / 2} ${y}) scale(${s}) translate(${-w / 2} 0)`}>
      <rect x={0} y={-30} width={w} height={60} rx={30} fill="rgba(6,9,10,0.92)" stroke={color} strokeWidth={4} />
      <text x={w / 2} y={12} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={34} letterSpacing={2} fill={color}>
        {text}
      </text>
    </g>
  );
};

/** Draws a part of the loop growing from a to b between `from` and `from + dur`. */
const Pipe: React.FC<{ t: number; from: number; dur: number; a: number; b: number; w: number; color: string; glow?: string }> = ({
  t,
  from,
  dur,
  a,
  b,
  w,
  color,
  glow,
}) => {
  const p = kf(t, [
    [from, 0],
    [from + dur, 1, "inOut"],
  ]);
  if (p <= 0) return null;
  const d = pathBetween(a, a + (b - a) * p);
  return (
    <g fill="none" strokeLinecap="round" strokeLinejoin="round">
      {glow ? <path d={d} stroke={glow} strokeWidth={w + 22} opacity={0.25} /> : null}
      <path d={d} stroke="#1b2724" strokeWidth={w + 8} />
      <path d={d} stroke={color} strokeWidth={w} />
    </g>
  );
};

export const Fridge: React.FC<{ t: number; dimmed: number }> = ({ t, dimmed }) => {
  const { cabL, cabR, cabT, cabB, wall, shelfY } = G;

  // ---- ice box intro ----
  const iceIn = pop(t, 0.6, 0.5);
  const melt = kf(t, [
    [T.melt, 0],
    [T.melt + 1.8, 1, "inOut"],
  ]);
  const newIce = kf(t, [
    [T.buy + 0.1, -500],
    [T.buy + 0.6, 0, "outBack"],
  ]);
  const iceGone = 1 - appear(t, T.pipe, 0.5);
  const showNew = t >= T.buy + 0.1;
  const iceH = showNew ? 170 : 170 * (1 - 0.75 * melt);
  const iceY = showNew ? 140 + newIce : 140 + 170 - iceH;
  const puddle = t < T.buy + 0.1 ? melt : 1;

  // ---- what has been built ----
  const built =
    t < T.pipe + 0.3
      ? 0
      : t < T.motor + 0.3
        ? PART.evap * Math.min(1, (t - T.pipe - 0.3) / 1.2)
        : t < T.grid + 0.3
          ? PART.evap + (PART.comp - PART.evap) * Math.min(1, (t - T.motor - 0.3) / 1.0)
          : t < T.thin + 0.3
            ? PART.comp + (PART.cond - PART.comp) * Math.min(1, (t - T.grid - 0.3) / 2.0)
            : PART.cond + (PART.cap - PART.cond) * Math.min(1, (t - T.thin - 0.3) / 1.2);
  const cycle = t >= T.cap;

  const compIn = pop(t, T.motor + 0.3, 0.5);
  const noisy = windowed(t, T.noise, T.noise + 2.6, 0.2);
  const running = t >= T.comp ? 1 : 0;
  const jx = running ? Math.sin(t * 90) * (1.2 + 4 * noisy) : 0;
  const jy = running ? Math.cos(t * 77) * (1 + 3 * noisy) : 0;
  const compHot = appear(t, T.hot, 0.6);

  // ---- door ----
  const door = kf(t, [
    [T.open + 0.3, 0],
    [T.open + 0.9, 62, "out"],
    [T.perkins - 0.2, 62],
    [T.seal + 0.4, 0, "outBack"],
  ]);
  const sealGlow = windowed(t, T.seal + 0.4, T.done, 0.3);
  const lightOn = appear(t, T.light + 0.3, 0.3) * (1 - appear(t, T.done + 2.5, 0.5));

  // ---- particles (refrigerant) ----
  const N = 70;
  const particles = [];
  if (built > 0) {
    const L = cycle ? LOOP_LEN : built;
    for (let i = 0; i < N; i++) {
      const d = (((i / N) * LOOP_LEN + t * 230) % LOOP_LEN) % L;
      const [x, y] = pointAt(d);
      let col: string = C.cyan;
      let r = 6;
      if (d < PART.evap) {
        const warm = t >= T.steal ? Math.min(1, d / PART.evap) * appear(t, T.steal, 1) : 0;
        col = mix(C.cyan, C.orange, warm);
        r = 6 + 3 * (d / PART.evap);
      } else if (d < PART.comp) {
        col = C.orange;
        r = 9;
      } else if (d < PART.cond) {
        const p = (d - PART.comp) / (PART.cond - PART.comp);
        const cool = appear(t, T.liquid, 1) * p;
        col = mix(compHot > 0 ? C.red : C.orange, C.ink, cool);
        r = lerp(7, 5, cool);
      } else {
        const p = (d - PART.cond) / (PART.cap - PART.cond);
        const cold = appear(t, T.drop, 0.8) * p;
        col = mix(C.ink, C.frost, cold);
        r = 4;
      }
      particles.push(<circle key={i} cx={x} cy={y} r={r} fill={col} opacity={0.95} />);
    }
  }

  // ---- heat leaving the food ----
  const heat = [];
  if (t >= T.steal) {
    const o = appear(t, T.steal, 0.5) * (1 - appear(t, T.done, 0.5));
    for (let i = 0; i < 18; i++) {
      const life = 2.2;
      const ph = (t + random(`h${i}`) * life) % life;
      const p = ph / life;
      const x0 = 210 + random(`hx${i}`) * 340;
      const x = x0 + Math.sin((t + i) * 3) * 14;
      const y = lerp(shelfY - 60, 320, p);
      heat.push(<circle key={i} cx={x} cy={y} r={7 * (1 - p * 0.5)} fill={C.red} opacity={o * (p < 0.15 ? p / 0.15 : 1 - p) * 0.9} />);
    }
  }

  // ---- heat leaving the condenser into the kitchen ----
  const waves = [];
  const condOn = t >= T.cond ? appear(t, T.cond, 0.6) : 0;
  const boost = 1 + windowed(t, T.open + 0.5, T.seal + 0.5, 0.4) * 1.2;
  if (condOn > 0) {
    for (let k = 0; k < 4; k++) {
      const yy = 300 + k * 170;
      const ph = (t * 1.3 + k * 0.37) % 1;
      const x = 1005 + ph * 60;
      waves.push(
        <path
          key={k}
          d={`M ${x} ${yy} q 14 -30 0 -60 q -14 -30 0 -60`}
          stroke={C.orange}
          strokeWidth={7 * Math.min(boost, 1.6)}
          fill="none"
          strokeLinecap="round"
          opacity={condOn * (1 - ph) * 0.9}
        />,
      );
    }
  }

  // ---- big "heat goes out" arrow ----
  const arrow = windowed(t, T.out, T.open, 0.3);

  // ---- cold spilling out when the door opens ----
  const spill = [];
  const spillO = windowed(t, T.open + 0.6, T.perkins, 0.3);
  if (spillO > 0) {
    for (let i = 0; i < 14; i++) {
      const life = 1.6;
      const p = ((t + random(`s${i}`) * life) % life) / life;
      spill.push(
        <circle
          key={i}
          cx={cabL - p * 110}
          cy={lerp(300, 940, random(`sy${i}`)) + p * 60}
          r={10 * (1 - p)}
          fill={C.frost}
          opacity={spillO * (1 - p) * 0.8}
        />,
      );
    }
  }

  const frost = appear(t, T.evap, 0.6) * (1 - appear(t, T.open + 0.8, 0.6) * 0.6);

  return (
    <svg viewBox="0 0 1080 1150" width={1080} height={1150} style={{ opacity: 1 - dimmed * 0.85 }}>
      <defs>
        <linearGradient id="inside" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={C.cyan} stopOpacity={0.1 + lightOn * 0.12} />
          <stop offset="1" stopColor={C.cyan} stopOpacity={0.02} />
        </linearGradient>
        <radialGradient id="bulb">
          <stop offset="0" stopColor={C.amber} stopOpacity={0.7} />
          <stop offset="1" stopColor={C.amber} stopOpacity={0} />
        </radialGradient>
      </defs>

      {/* cabinet */}
      <rect x={cabL} y={cabT} width={cabR - cabL} height={cabB - cabT} rx={34} fill="#0d1715" stroke={C.steel} strokeWidth={6} />
      <rect
        x={cabL + wall}
        y={cabT + wall}
        width={cabR - cabL - wall * 2}
        height={cabB - cabT - wall * 2}
        rx={18}
        fill="url(#inside)"
        stroke={C.dim}
        strokeWidth={3}
        strokeDasharray="10 10"
      />
      <line x1={cabL + wall} y1={shelfY} x2={cabR - wall} y2={shelfY} stroke={C.steel} strokeWidth={6} />
      <line x1={cabL + wall} y1={520} x2={cabR - wall} y2={520} stroke={C.dim} strokeWidth={4} />

      {/* interior light */}
      {lightOn > 0 ? <circle cx={370} cy={150} r={230} fill="url(#bulb)" opacity={lightOn} /> : null}
      <circle cx={370} cy={140} r={14} fill={lightOn > 0 ? C.amber : "#2a3532"} opacity={appear(t, T.light, 0.3)} />

      {/* food */}
      <g>
        <rect x={200} y={shelfY - 170} width={56} height={170} rx={14} fill={C.cyan} opacity={0.75} />
        <rect x={214} y={shelfY - 200} width={28} height={34} rx={6} fill={C.cyan} opacity={0.75} />
        <circle cx={360} cy={shelfY - 46} r={46} fill={C.red} />
        <path d={`M 360 ${shelfY - 92} q 6 -24 24 -26`} stroke={C.lime} strokeWidth={6} fill="none" />
        <rect x={450} y={shelfY - 140} width={110} height={140} rx={8} fill={C.white} opacity={0.85} />
        <rect x={450} y={shelfY - 100} width={110} height={36} fill={C.ink} />
        <ellipse cx={300} cy={940} rx={90} ry={34} fill={C.lime} opacity={0.55} />
        <ellipse cx={470} cy={940} rx={70} ry={30} fill={C.amber} opacity={0.55} />
      </g>

      {/* ice block */}
      {iceGone > 0 && iceIn > 0 ? (
        <g opacity={iceGone}>
          <ellipse cx={370} cy={500} rx={200 * puddle} ry={14 * puddle} fill={C.cyan} opacity={0.35} />
          <g transform={`translate(370 ${iceY + iceH / 2}) scale(${iceIn})`}>
            <rect x={-130} y={-iceH / 2} width={260} height={iceH} rx={16} fill={C.frost} opacity={0.35} stroke={C.frost} strokeWidth={5} />
            <path d={`M -90 ${-iceH / 2 + 20} l 40 0 M 50 ${iceH / 2 - 30} l 50 -20`} stroke={C.white} strokeWidth={5} strokeLinecap="round" />
          </g>
          {melt > 0 && !showNew
            ? [0, 1, 2].map((k) => {
                const ph = (t * 1.4 + k / 3) % 1;
                return <circle key={k} cx={300 + k * 70} cy={320 + ph * 170} r={8} fill={C.cyan} opacity={1 - ph} />;
              })
            : null}
        </g>
      ) : null}

      {/* frost on the evaporator */}
      {frost > 0 ? <rect x={160} y={170} width={420} height={150} rx={24} fill={C.cyan} opacity={0.12 * frost} /> : null}

      {/* pipes */}
      <Pipe t={t} from={T.pipe + 0.3} dur={1.2} a={0} b={PART.evap} w={14} color="#2f6f86" glow={frost > 0 ? C.cyan : undefined} />
      <Pipe t={t} from={T.motor + 0.3} dur={1.0} a={PART.evap} b={PART.comp} w={14} color="#6b5a3a" />
      <Pipe t={t} from={T.grid + 0.3} dur={2.0} a={PART.comp} b={PART.cond} w={14} color="#7a3b2c" glow={condOn > 0 ? C.orange : undefined} />
      <Pipe t={t} from={T.thin + 0.3} dur={1.2} a={PART.cond} b={PART.cap} w={5} color="#7fd6ee" />

      {/* compressor */}
      {compIn > 0 ? (
        <g transform={`translate(${800 + jx} ${1010 + jy}) scale(${compIn})`}>
          <rect x={-80} y={-55} width={160} height={110} rx={40} fill={mix("#25332f", "#5a1c22", compHot)} stroke={compHot > 0 ? C.red : C.lime} strokeWidth={6} />
          <circle cx={0} cy={0} r={26} fill="none" stroke={C.white} strokeWidth={5} opacity={0.6} />
          <line x1={0} y1={0} x2={22 * Math.cos(t * 12)} y2={22 * Math.sin(t * 12)} stroke={C.white} strokeWidth={6} strokeLinecap="round" opacity={running ? 0.9 : 0.4} />
          {noisy > 0
            ? [0, 1].map((k) => (
                <path key={k} d={`M ${-100 - k * 22} -30 q -14 30 0 60 M ${100 + k * 22} -30 q 14 30 0 60`} stroke={C.lime} strokeWidth={5} fill="none" opacity={noisy * 0.8} />
              ))
            : null}
        </g>
      ) : null}

      {/* door (front, hinged at the top-left corner) */}
      <g transform={`rotate(${door} ${cabL} ${cabT + 20})`}>
        <rect x={cabL - 22} y={cabT + 10} width={22} height={cabB - cabT - 20} rx={10} fill="#16211e" stroke={sealGlow > 0 ? C.lime : C.steel} strokeWidth={5} />
        {sealGlow > 0 ? (
          <g opacity={sealGlow}>
            <rect x={cabL - 30} y={cabT + 4} width={38} height={cabB - cabT - 8} rx={14} fill="none" stroke={C.lime} strokeWidth={6} strokeDasharray="18 12" />
            {[cabT + 90, cabB - 90].map((y) => (
              <path key={y} d={`M ${cabL - 70} ${y - 22} h -26 v 44 h 26`} stroke={C.red} strokeWidth={12} fill="none" strokeLinecap="round" />
            ))}
          </g>
        ) : null}
      </g>

      {spill}
      {heat}
      {particles}
      {waves}

      {/* heat goes out */}
      {arrow > 0 ? (
        <g opacity={arrow}>
          <path d="M 300 600 C 500 600 600 560 720 560" stroke={C.red} strokeWidth={22} fill="none" strokeLinecap="round" strokeDasharray={`${700 * appear(t, T.out, 0.8)} 2000`} />
          <path d="M 700 520 L 760 560 L 700 600" stroke={C.red} strokeWidth={18} fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={appear(t, T.out + 0.6, 0.2)} />
          <text x={300} y={660} fontFamily={FONT} fontWeight={900} fontSize={40} fill={C.red}>
            CALOR
          </text>
        </g>
      ) : null}

      {/* labels */}
      {t < T.truth ? (
        <>
          <Label x={370} y={365} text="EVAPORADOR" color={C.cyan} t={t} from={T.evap} />
          <Label x={370} y={440} text="GÁS REFRIGERANTE" color={C.frost} t={t} from={T.gas} />
          <Label x={800} y={1105} text="COMPRESSOR" color={C.lime} t={t} from={T.comp} />
          <Label x={875} y={180} text="CONDENSADOR" color={C.orange} t={t} from={T.cond} />
          <Label x={470} y={22} text="TUBO CAPILAR" color={C.cyan} t={t} from={T.cap} />
        </>
      ) : null}
    </svg>
  );
};

/** The fridge at rest with everything built, for the cover. */
export const FridgeStill: React.FC = () => <Fridge t={Math.min(T.cap + 1.2, T.truth - 0.1)} dimmed={0} />;

import React from "react";
import { random } from "remotion";
import {
  C,
  G,
  appear,
  carTop,
  cwTop,
  kf,
  pop,
  ropeMode,
  windowed,
} from "./timeline";

const FONT = "Montserrat, sans-serif";

const Label: React.FC<{
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
  const w = text.length * size * 0.66 + 36;
  const h = size + 26;
  return (
    <g opacity={o}>
      {ax !== undefined && ay !== undefined ? (
        <>
          <line
            x1={ax}
            y1={ay}
            x2={x}
            y2={y}
            stroke={color}
            strokeWidth={3}
            strokeDasharray="6 6"
          />
          <circle cx={ax} cy={ay} r={7} fill={color} />
        </>
      ) : null}
      <g transform={`translate(${x} ${y}) scale(${s})`}>
        <rect
          x={-w / 2}
          y={-h / 2}
          width={w}
          height={h}
          rx={h / 2}
          fill="rgba(6,9,10,0.92)"
          stroke={color}
          strokeWidth={3}
        />
        <text
          x={0}
          y={size * 0.36}
          textAnchor="middle"
          fontFamily={FONT}
          fontWeight={800}
          fontSize={size}
          fill={color}
          letterSpacing={1}
        >
          {text}
        </text>
      </g>
    </g>
  );
};

const Stick: React.FC<{
  x: number;
  y: number;
  s?: number;
  color?: string;
  armUp?: number;
  lean?: number;
  op?: number;
}> = ({ x, y, s = 1, color = C.white, armUp = 0, lean = 0, op = 1 }) => (
  <g
    transform={`translate(${x} ${y}) scale(${s}) rotate(${lean})`}
    opacity={op}
    stroke={color}
    strokeWidth={7}
    strokeLinecap="round"
    fill="none"
  >
    <circle cx={0} cy={-150} r={20} fill={color} stroke="none" />
    <line x1={0} y1={-128} x2={0} y2={-60} />
    <line x1={0} y1={-60} x2={-22} y2={0} />
    <line x1={0} y1={-60} x2={22} y2={0} />
    <line x1={0} y1={-115} x2={-26} y2={-80 - armUp * 70} />
    <line x1={0} y1={-115} x2={26} y2={-80 - armUp * 70} />
  </g>
);

const Spring: React.FC<{ x: number; top: number; bottom: number; o: number }> =
  ({ x, top, bottom, o }) => {
    const n = 7;
    const pts: string[] = [`${x},${bottom}`];
    for (let i = 1; i < n * 2; i++) {
      const yy = bottom - ((bottom - top) * i) / (n * 2);
      pts.push(`${x + (i % 2 ? -26 : 26)},${yy}`);
    }
    pts.push(`${x},${top}`);
    return (
      <g opacity={o}>
        <polyline
          points={pts.join(" ")}
          fill="none"
          stroke={C.lime}
          strokeWidth={6}
          strokeLinejoin="round"
          filter="url(#glow)"
        />
        <rect x={x - 34} y={top - 8} width={68} height={10} rx={4} fill={C.lime} />
      </g>
    );
  };

export const Elevator: React.FC<{ t: number; dimmed: number }> = ({
  t,
  dimmed,
}) => {
  const ct = carTop(t);
  const cb = ct + G.carH;
  const cw = cwTop(t);
  const mode = ropeMode(t);
  const L = G.carX - G.carW / 2;
  const R = G.carX + G.carW / 2;
  const rL = G.sheaveX - G.sheaveR; // 480
  const rR = G.sheaveX + G.sheaveR; // 700

  // ---- appearances
  const building = appear(t, 21.15, 0.8);
  const rails = appear(t, 22.9, 0.6);
  const sheaveIn = pop(t, 8.6, 0.5);
  const motorIn = pop(t, 22.9, 0.5);
  const cwIn = t >= 31.0 ? pop(t, 31.0, 0.5) : 0;
  const governorIn = appear(t, 46.6, 0.6);
  const springsIn = pop(t, 63.4, 0.5);
  const crate = 1 - appear(t, 21.15, 0.8);
  const person = appear(t, 5.4, 0.4);

  // ---- camera
  let cx = kf(t, [
    [0, 480],
    [4, 480],
    [7.6, 560],
    [11, 540],
    [21.15, 540],
    [22.6, 590],
    [26.5, 540],
    [46.35, 540],
    [47.2, 430],
    [50.0, 430],
    [50.7, 450],
    [53.6, 450],
    [54.6, 540],
    [61.3, 540],
    [62.4, 540],
    [73.79, 540],
    [74.7, 480],
    [76.5, 480],
    [77.5, 540],
  ]);
  let cy = kf(t, [
    [0, 600],
    [4, 640],
    [7.6, 420],
    [11, 575],
    [21.15, 575],
    [22.6, 300],
    [26.5, 575],
    [46.35, 575],
    [47.2, 600],
    [50.0, 600],
    [53.6, 600],
    [54.6, 575],
    [61.3, 575],
    [62.4, 880],
    [66.9, 880],
    [67.7, 575],
    [73.79, 575],
    [74.7, 610],
    [76.5, 610],
    [77.5, 575],
  ]);
  const sc = kf(t, [
    [0, 1.3],
    [4, 1.3],
    [7.6, 1.05],
    [21.15, 1.0],
    [22.6, 1.4],
    [26.5, 1.0],
    [46.35, 1.0],
    [47.2, 1.2],
    [50.0, 1.2],
    [50.7, 2.0],
    [53.6, 2.0],
    [54.6, 1.0],
    [61.3, 1.0],
    [62.4, 1.3],
    [66.9, 1.3],
    [67.7, 1.0],
    [73.79, 1.0],
    [74.7, 2.4],
    [76.5, 2.4],
    [77.5, 0.96],
  ]);
  const follow = windowed(t, 50.3, 54.4, 0.6);
  cy = cy * (1 - follow) + (cb - 30) * follow;
  cx = cx * (1 - follow) + 440 * follow;
  // impact shake
  const shakeAmt =
    Math.max(0, 1 - Math.abs(t - 63.95) * 4) * 14 +
    Math.max(0, 1 - Math.abs(t - 45.4) * 5) * 10;
  const sx = shakeAmt * (random(`sx${Math.floor(t * 30)}`) - 0.5);
  const sy = shakeAmt * (random(`sy${Math.floor(t * 30)}`) - 0.5);

  // ---- rope geometry
  const strands = mode === "cables" || mode === "snapped" ? [-14, -7, 0, 7, 14] : [0];
  const ropeColor = mode === "broken" ? C.red : mode === "single" || mode === "straight" ? "#e9d7b0" : C.cyan;
  const ropeW = strands.length > 1 ? 3.5 : 7;
  const cablesShown = (i: number) =>
    mode === "cables" && t < 45.4 ? appear(t, 40.0 + i * 0.14, 0.2) : 1;
  const rightEnd =
    t < 21.6 ? 900 + Math.sin(t * 6) * 18 : t < 31 ? null : cw;
  const figure = windowed(t, 9.0, 21.9, 0.4);

  const recoil = kf(t, [
    [45.4, ct - G.sheaveY],
    [45.75, 70, "out"],
  ]);
  const slack = kf(t, [
    [45.4, 0],
    [45.8, 90, "out"],
  ]);

  const ropes: React.ReactNode[] = [];
  strands.forEach((o, i) => {
    const op = cablesShown(i);
    if (mode === "straight") {
      ropes.push(
        <line key={`s${i}`} x1={G.carX} y1={ct} x2={G.carX} y2={-80} stroke={ropeColor} strokeWidth={ropeW} />,
      );
      return;
    }
    if (mode === "snapped") {
      // upper pieces recoiling at the sheave
      ropes.push(
        <path
          key={`u${i}`}
          d={`M ${rL + o} ${G.sheaveY} L ${rL + o + Math.sin(t * 20 + i) * 6} ${G.sheaveY + recoil}`}
          stroke={C.red}
          strokeWidth={ropeW}
          fill="none"
          opacity={0.9}
        />,
        <path
          key={`ur${i}`}
          d={`M ${rR + o} ${G.sheaveY} L ${rR + o - Math.sin(t * 18 + i) * 6} ${G.sheaveY + recoil * 0.8}`}
          stroke={C.red}
          strokeWidth={ropeW}
          fill="none"
          opacity={0.9}
        />,
        <path
          key={`l${i}`}
          d={`M ${G.carX + o} ${ct} q ${20 + o} ${-slack * 0.6} ${o * 2} ${-slack}`}
          stroke={C.red}
          strokeWidth={ropeW}
          fill="none"
          opacity={0.9}
        />,
      );
      return;
    }
    const leftSeg =
      mode === "broken"
        ? `M ${rL + o} ${G.sheaveY} L ${rL + o} ${ct - 140} M ${rL + o} ${ct - 100} L ${rL + o} ${ct}`
        : `M ${rL + o} ${ct} L ${rL + o} ${G.sheaveY}`;
    const arc = `M ${rL + o} ${G.sheaveY} A ${G.sheaveR - o} ${G.sheaveR - o} 0 0 1 ${rR - o} ${G.sheaveY}`;
    const right = rightEnd === null ? "" : `M ${rR - o} ${G.sheaveY} L ${rR - o} ${rightEnd}`;
    ropes.push(
      <path key={`r${i}`} d={`${leftSeg} ${arc} ${right}`} stroke={ropeColor} strokeWidth={ropeW} fill="none" opacity={op} strokeLinecap="round" />,
    );
  });

  const sheaveRot = (ct / G.sheaveR) * 57.3 * -1;
  const govRot = ct * 2.2;
  const overspeed = kf(t, [
    [48.6, 0],
    [49.3, 1],
  ]);
  const locked = t >= 49.4;
  const govColor = locked && t < 50.6 ? C.red : C.cyan;
  const wedge = kf(t, [
    [49.4, 0],
    [50.0, 1, "out"],
  ]);
  const sparks = t > 49.5 && t < 53.4 ? (53.4 - t) / 3.9 : 0;

  // energy meter
  const meterO = windowed(t, 26.9, 38.0, 0.3);
  const level = kf(t, [
    [26.9, 0.2],
    [27.6, 1.0, "out"],
    [35.9, 1.0],
    [36.8, 0.3, "out"],
  ]);

  // door scenario (floor 2)
  const f2 = G.floors[1];
  const doorOpenBad = windowed(t, 68.6, 70.75, 0.2);
  const doorOpenGood = appear(t, 72.6, 0.3);
  const lockIn = pop(t, 70.4, 0.4);

  const finalLabels = t >= 77.0;

  return (
    <svg viewBox="0 0 1080 1150" width={1080} height={1150} style={{ overflow: "visible" }}>
      <defs>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="6" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <pattern id="hatch" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="14" stroke={C.dim} strokeWidth="3" />
        </pattern>
      </defs>
      <g
        opacity={1 - dimmed * 0.75}
        transform={`translate(${540 + sx} ${575 + sy}) scale(${sc}) translate(${-cx} ${-cy})`}
      >
        {/* ground / pit floor */}
        <rect x={-400} y={G.pit} width={1880} height={400} fill="url(#hatch)" opacity={0.5} />
        <line x1={-400} y1={G.pit} x2={1480} y2={G.pit} stroke={C.steel} strokeWidth={4} />

        {/* building: shaft, machine room, floors */}
        <g opacity={building}>
          <rect x={G.wallL - 30} y={0} width={30} height={G.pit} fill="url(#hatch)" />
          <rect x={G.wallR} y={0} width={30} height={G.pit} fill="url(#hatch)" />
          <line x1={G.wallL} y1={0} x2={G.wallL} y2={G.pit} stroke={C.steel} strokeWidth={4} />
          <line x1={G.wallR} y1={0} x2={G.wallR} y2={G.pit} stroke={C.steel} strokeWidth={4} />
          <rect x={G.wallL} y={G.top - 14} width={150} height={14} fill={C.steel} opacity={0.7} />
          <rect x={G.wallR - 90} y={G.top - 14} width={90} height={14} fill={C.steel} opacity={0.7} />
          <rect x={G.wallL - 30} y={-40} width={G.wallR - G.wallL + 60} height={20} fill={C.steel} opacity={0.5} />
          <text x={G.wallR + 50} y={60} fontFamily={FONT} fontWeight={700} fontSize={24} fill={C.dim} letterSpacing={2}>
            CASA DE
          </text>
          <text x={G.wallR + 50} y={90} fontFamily={FONT} fontWeight={700} fontSize={24} fill={C.dim} letterSpacing={2}>
            MÁQUINAS
          </text>
          {G.floors.map((fy, i) => (
            <g key={fy}>
              <rect x={20} y={fy} width={G.wallL - 50} height={18} fill={C.steel} opacity={0.6} />
              <circle cx={70} cy={fy - 50} r={28} fill="none" stroke={C.dim} strokeWidth={3} />
              <text x={70} y={fy - 40} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={30} fill={C.dim}>
                {3 - i}
              </text>
              {/* landing doors */}
              <rect
                x={G.wallL - 8}
                y={fy - 180}
                width={14}
                height={180}
                rx={4}
                fill={i === 1 && (doorOpenBad > 0 || doorOpenGood > 0) ? "none" : C.steel}
                stroke={i === 1 && doorOpenBad > 0 ? C.red : i === 1 && doorOpenGood > 0 ? C.lime : "none"}
                strokeWidth={4}
                strokeDasharray={i === 1 ? "10 8" : undefined}
              />
            </g>
          ))}
        </g>

        {/* door scenario */}
        {doorOpenBad > 0 ? (
          <g opacity={doorOpenBad}>
            <rect x={G.wallL - 10} y={f2 - 180} width={G.carW + 120} height={180} fill={C.red} opacity={0.12} />
            <Stick x={185} y={f2} s={0.85} color={C.white} lean={14} armUp={0.4} />
            <text x={G.wallL + 60} y={f2 - 70} fontFamily={FONT} fontWeight={900} fontSize={90} fill={C.red} filter="url(#glow)">
              !
            </text>
          </g>
        ) : null}
        {t > 70.3 && t < 73.8 ? (
          <g transform={`translate(${G.wallL - 1} ${f2 - 90}) scale(${lockIn})`} opacity={windowed(t, 70.3, 73.8, 0.3)}>
            <rect x={-26} y={-10} width={52} height={42} rx={8} fill={t > 70.7 ? C.lime : C.amber} />
            <path d="M -15 -10 V -24 A 15 15 0 0 1 15 -24 V -10" fill="none" stroke={t > 70.7 ? C.lime : C.amber} strokeWidth={7} />
          </g>
        ) : null}

        {/* rails */}
        <g opacity={rails * (t > 50.0 && t < 54 ? 1 : 0.55)}>
          {[L - 15, R + 15].map((x) => (
            <line
              key={x}
              x1={x}
              y1={G.top}
              x2={x}
              y2={G.pit}
              stroke={t > 50 && t < 54 ? C.lime : C.steel}
              strokeWidth={6}
            />
          ))}
          {[G.cwX - 42, G.cwX + 42].map((x) => (
            <line key={x} x1={x} y1={G.top} x2={x} y2={G.pit} stroke={C.steel} strokeWidth={3} opacity={0.6} />
          ))}
        </g>

        {/* governor */}
        {governorIn > 0 ? (
          <g opacity={governorIn}>
            <line x1={G.govX - G.govR} y1={G.top - 40} x2={G.govX - G.govR} y2={G.pit - 30} stroke={govColor} strokeWidth={3} />
            <line x1={G.govX + G.govR} y1={G.top - 40} x2={G.govX + G.govR} y2={G.pit - 30} stroke={govColor} strokeWidth={3} />
            <line x1={G.govX + G.govR} y1={ct + 40} x2={L} y2={ct + 40} stroke={govColor} strokeWidth={6} />
            <g transform={`translate(${G.govX} ${G.top - 40}) rotate(${govRot})`}>
              <circle r={G.govR + 6} fill={C.bg} stroke={govColor} strokeWidth={6} filter="url(#glow)" />
              <line x1={-G.govR} y1={0} x2={G.govR} y2={0} stroke={govColor} strokeWidth={4} />
              <rect x={-10 - overspeed * 16} y={-8} width={14} height={16} fill={locked ? C.red : C.amber} />
              <rect x={-4 + overspeed * 16} y={-8} width={14} height={16} fill={locked ? C.red : C.amber} />
            </g>
            <circle cx={G.govX} cy={G.pit - 30} r={G.govR - 6} fill={C.bg} stroke={govColor} strokeWidth={5} />
          </g>
        ) : null}

        {/* counterweight */}
        {cwIn > 0 ? (
          <g
            opacity={t > 45.4 && t < 66.94 ? 0.35 : 1}
            transform={`translate(${G.cwX} ${cw + G.cwH / 2}) scale(${cwIn}) translate(${-G.cwX} ${-(cw + G.cwH / 2)})`}
          >
            <rect x={G.cwX - G.cwW / 2} y={cw} width={G.cwW} height={G.cwH} rx={6} fill="rgba(255,201,77,0.15)" stroke={C.amber} strokeWidth={5} />
            {[1, 2, 3, 4, 5].map((k) => (
              <line key={k} x1={G.cwX - G.cwW / 2 + 6} x2={G.cwX + G.cwW / 2 - 6} y1={cw + k * 30} y2={cw + k * 30} stroke={C.amber} strokeWidth={3} opacity={0.6} />
            ))}
          </g>
        ) : null}

        {/* ropes */}
        <g filter={mode === "broken" || mode === "snapped" ? "url(#glow)" : undefined}>{ropes}</g>
        {mode === "broken" ? (
          <g transform={`translate(${rL} ${ct - 120})`} filter="url(#glow)">
            {[0, 1, 2, 3, 4, 5, 6, 7].map((k) => (
              <line key={k} x1={0} y1={0} x2={Math.cos(k * 0.8) * 60} y2={Math.sin(k * 0.8) * 60} stroke={C.red} strokeWidth={5} />
            ))}
          </g>
        ) : null}

        {/* puller figure */}
        {figure > 0 ? (
          <Stick x={rR + 10} y={G.pit} s={1.1} op={figure} armUp={1.1 + Math.sin(t * 6) * 0.15} />
        ) : null}

        {/* sheave + motor */}
        {sheaveIn > 0 ? (
          <g transform={`translate(${G.sheaveX} ${G.sheaveY}) scale(${sheaveIn})`}>
            <circle r={G.sheaveR} fill="none" stroke={C.lime} strokeWidth={8} filter="url(#glow)" />
            <g transform={`rotate(${sheaveRot})`}>
              {[0, 60, 120].map((a) => (
                <line key={a} x1={-G.sheaveR + 10} y1={0} x2={G.sheaveR - 10} y2={0} transform={`rotate(${a})`} stroke={C.lime} strokeWidth={5} opacity={0.7} />
              ))}
            </g>
            <circle r={20} fill={C.lime} />
            {motorIn > 0 ? (
              <g transform={`scale(${motorIn})`}>
                <circle r={52} fill={C.bg2} stroke={C.cyan} strokeWidth={6} filter="url(#glow)" />
                <path d="M 6 -30 L -14 4 L 2 4 L -6 30 L 16 -6 L 0 -6 Z" fill={C.cyan} />
              </g>
            ) : null}
          </g>
        ) : null}

        {/* car */}
        <g>
          <rect
            x={L}
            y={ct}
            width={G.carW}
            height={G.carH}
            rx={12}
            fill={crate > 0.5 ? "rgba(255,201,77,0.10)" : "rgba(184,255,60,0.07)"}
            stroke={crate > 0.5 ? C.amber : t > 45.4 && t < 53.3 ? C.red : C.lime}
            strokeWidth={6}
            filter="url(#glow)"
          />
          {crate > 0 ? (
            <g opacity={crate} stroke={C.amber} strokeWidth={4}>
              <line x1={L + 10} y1={ct + 10} x2={R - 10} y2={cb - 10} />
              <line x1={R - 10} y1={ct + 10} x2={L + 10} y2={cb - 10} />
            </g>
          ) : null}
          {crate < 1 ? (
            <line x1={G.carX} y1={ct + 14} x2={G.carX} y2={cb - 14} stroke={C.lime} strokeWidth={3} opacity={(1 - crate) * 0.45} />
          ) : null}
          {person > 0 ? <Stick x={G.carX - 40} y={cb - 14} s={0.9} op={person} color={C.white} /> : null}
          {/* interior items */}
          {t > 74.0 ? (
            <g transform={`translate(${R - 34} ${ct + 70}) scale(${pop(t, 74.12)})`}>
              <rect x={-16} y={-26} width={32} height={84} rx={6} fill={C.bg2} stroke={C.cyan} strokeWidth={3} />
              {[0, 1, 2].map((k) => (
                <circle key={k} cx={0} cy={-10 + k * 24} r={7} fill={k === 1 ? C.lime : C.cyan} />
              ))}
            </g>
          ) : null}
          {t > 74.8 ? (
            <g transform={`translate(${G.carX + 2} ${ct + 30})`} opacity={appear(t, 74.84)}>
              <rect x={0} y={0} width={38} height={100} rx={5} fill="rgba(79,227,255,0.15)" stroke={C.cyan} strokeWidth={3} />
              <line x1={6} y1={70} x2={32} y2={20} stroke={C.white} strokeWidth={3} opacity={0.7} />
            </g>
          ) : null}
          {t > 75.6
            ? [0, 1, 2].map((k) => {
                const p = ((t - 75.6 + k * 0.5) % 1.5) / 1.5;
                return (
                  <text key={k} x={L + 30 + k * 30 + Math.sin(p * 6) * 8} y={ct + 60 - p * 40} fontSize={30} fill={C.amber} opacity={1 - p} fontFamily={FONT}>
                    ♪
                  </text>
                );
              })
            : null}
          {/* weight tag */}
          {windowed(t, 5.0, 10.2) > 0 ? (
            <g opacity={windowed(t, 5.0, 10.2)} transform={`translate(${G.carX + 60} ${ct + 50})`}>
              <rect x={-58} y={-26} width={116} height={50} rx={10} fill={C.red} />
              <text x={0} y={11} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={30} fill={C.bg}>
                600 kg
              </text>
            </g>
          ) : null}
          {/* safety wedges */}
          {wedge > 0
            ? [
                [L, -1],
                [R, 1],
              ].map(([x, d]) => (
                <polygon
                  key={x}
                  points={`${x},${cb - 70 + (1 - wedge) * 40} ${x + d * 15},${cb - 70 + (1 - wedge) * 40} ${x + d * 15},${cb - 20 + (1 - wedge) * 40} ${x},${cb - 6 + (1 - wedge) * 40}`}
                  fill={C.lime}
                  stroke={C.white}
                  strokeWidth={2}
                  filter="url(#glow)"
                />
              ))
            : null}
          {sparks > 0
            ? Array.from({ length: 18 }).map((_, k) => {
                const seed = Math.floor(t * 30) * 31 + k;
                const side = k % 2 ? L - 15 : R + 15;
                const ang = random(`a${seed}`) * Math.PI;
                const len = 20 + random(`l${seed}`) * 50 * sparks;
                return (
                  <line
                    key={k}
                    x1={side}
                    y1={cb - 20}
                    x2={side + Math.cos(ang) * len * (k % 2 ? -1 : 1)}
                    y2={cb - 20 - Math.sin(ang) * len * 0.5 + 10}
                    stroke={k % 3 ? C.amber : C.white}
                    strokeWidth={3}
                    opacity={sparks}
                  />
                );
              })
            : null}
        </g>

        {/* buffers */}
        {springsIn > 0
          ? [G.carX - 60, G.carX + 60].map((x) => (
              <Spring key={x} x={x} bottom={G.pit} top={Math.min(G.springTop, cb > G.springTop ? cb : G.springTop)} o={springsIn} />
            ))
          : null}

        {/* energy meter */}
        {meterO > 0 ? (
          <g opacity={meterO} transform="translate(900 300)">
            <text x={45} y={-20} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={26} fill={C.white} letterSpacing={2}>
              ENERGIA
            </text>
            <rect x={0} y={0} width={90} height={400} rx={14} fill="none" stroke={C.dim} strokeWidth={4} />
            <rect
              x={10}
              y={10 + (380 * (1 - level))}
              width={70}
              height={380 * level}
              rx={8}
              fill={level > 0.6 ? C.red : C.lime}
              filter="url(#glow)"
            />
            <text x={45} y={450} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={38} fill={level > 0.6 ? C.red : C.lime}>
              {Math.round(level * 100)}%
            </text>
          </g>
        ) : null}

        {/* labels */}
        <Label t={t} from={1.0} to={7.4} x={G.carX} y={ct + G.carH + 60} text="CAIXA" color={C.amber} />
        <Label t={t} from={1.6} to={7.4} x={G.carX + 190} y={ct - 120} ax={G.carX} ay={ct - 120} text="CORDA" color={C.amber} />
        <Label t={t} from={10.64} to={21.1} x={G.sheaveX + 120} y={G.sheaveY + 200} ax={G.sheaveX + 70} ay={G.sheaveY + 80} text="ROLDANA" />
        <Label t={t} from={22.9} to={38.0} x={G.sheaveX + 230} y={G.sheaveY - 10} ax={G.sheaveX + 52} ay={G.sheaveY} text="MOTOR" color={C.cyan} />
        <Label t={t} from={35.1} to={44.6} x={G.cwX + 160} y={cw - 50} ax={G.cwX + 32} ay={cw + 30} text="CONTRAPESO" color={C.amber} />
        <Label t={t} from={41.2} to={44.6} x={G.carX + 260} y={G.sheaveY + 260} ax={rL + 14} ay={G.sheaveY + 220} text="5 CABOS DE AÇO" color={C.cyan} />
        <Label t={t} from={42.5} to={44.6} x={G.carX} y={cb + 60} text="CADA UM AGUENTA TUDO" size={28} />
        <Label t={t} from={47.7} to={54.0} x={G.govX + 200} y={G.top + 60} ax={G.govX + 30} ay={G.top - 40} text="LIMITADOR" color={C.cyan} />
        <Label t={t} from={49.4} to={50.6} x={G.carX} y={ct - 60} text="TRAVOU!" color={C.red} />
        <Label t={t} from={50.9} to={53.6} x={G.carX} y={cb + 50} text="CUNHAS" size={26} />
        <Label t={t} from={53.9} to={61.2} x={G.carX} y={cb + 70} text="FREIO DE SEGURANÇA" />
        <Label t={t} from={65.9} to={67.6} x={G.carX} y={G.springTop - 260} text="AMORTECEDOR" />
        <Label t={t} from={70.7} to={73.8} x={G.wallL + 190} y={f2 + 80} ax={G.wallL + 10} ay={f2 - 70} text="TRAVA DA PORTA" color={C.lime} />

        {finalLabels ? (
          <>
            <Label t={t} from={77.1} to={99} x={G.sheaveX + 250} y={G.sheaveY + 30} ax={G.sheaveX + 60} ay={G.sheaveY} text="MOTOR" color={C.cyan} size={28} />
            <Label t={t} from={77.25} to={99} x={G.cwX + 210} y={cw + 60} ax={G.cwX + 32} ay={cw + 60} text="CONTRAPESO" color={C.amber} size={28} />
            <Label t={t} from={77.4} to={99} x={G.carX + 330} y={ct - 80} ax={rL + 14} ay={ct - 80} text="CABOS" color={C.cyan} size={28} />
            <Label t={t} from={77.55} to={99} x={G.govX - 170} y={G.top + 120} ax={G.govX - 30} ay={G.top + 120} text="LIMITADOR" size={28} />
            <Label t={t} from={77.7} to={99} x={G.carX + 330} y={cb - 20} ax={R + 15} ay={cb - 20} text="FREIO" size={28} />
            <Label t={t} from={77.85} to={99} x={G.carX + 330} y={G.springTop + 20} ax={G.carX + 80} ay={G.springTop + 20} text="AMORTECEDOR" size={28} />
          </>
        ) : null}
      </g>
    </svg>
  );
};

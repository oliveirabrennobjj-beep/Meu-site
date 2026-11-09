import React from "react";
import { C, T, appear, pop, windowed } from "./timeline";

const FONT = "Montserrat, sans-serif";
const HOT = "#FF6B3D";
const ICE = "#bff3ff";

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

/** Linha ondulada de x0 a x1 na altura y, andando com o tempo. */
const wavePath = (x0: number, x1: number, y: number, amp: number, len: number, phase: number) => {
  let d = "";
  for (let x = x0; x <= x1; x += 6) {
    const yy = y + Math.sin(((x - x0) / len) * Math.PI * 2 - phase) * amp;
    d += `${d ? "L" : "M"} ${x.toFixed(1)} ${yy.toFixed(1)} `;
  }
  return d;
};
/** Igual, mas na vertical (de y0 a y1 na coluna x). */
const wavePathV = (y0: number, y1: number, x: number, amp: number, len: number, phase: number) => {
  let d = "";
  for (let y = y0; y <= y1; y += 6) {
    const xx = x + Math.sin(((y - y0) / len) * Math.PI * 2 - phase) * amp;
    d += `${d ? "L" : "M"} ${xx.toFixed(1)} ${y.toFixed(1)} `;
  }
  return d;
};

const mix = (a: string, b: string, p: number) => {
  const h = (s: string) => [1, 3, 5].map((i) => parseInt(s.slice(i, i + 2), 16));
  const [r1, g1, b1] = h(a);
  const [r2, g2, b2] = h(b);
  const q = Math.max(0, Math.min(1, p));
  return `rgb(${Math.round(r1 + (r2 - r1) * q)},${Math.round(g1 + (g2 - g1) * q)},${Math.round(b1 + (b2 - b1) * q)})`;
};

// ---------- O circuito do gás (ordem do fluxo) ----------
type P = [number, number];
const evapBottom: P[] = [470, 440, 410, 380, 350, 320, 290, 260, 230, 200, 170].map((x, i) => [x, i % 2 ? 375 : 345]);
const evapTop: P[] = [170, 200, 230, 260, 290, 320, 350, 380, 410, 440].map((x, i) => [x, i % 2 ? 315 : 285]);
const EVAP: P[] = [[490, 360], ...evapBottom, [140, 360], [140, 300], ...evapTop, [470, 300]];
const SUC: P[] = [[640, 300], [640, 720], [740, 720], [740, 780]];
const COMP: P[] = [[740, 880], [820, 880]];
const COND: P[] = [[850, 680], [880, 880], [910, 680], [940, 880], [970, 680], [1000, 880], [1000, 975]];
const LIQ: P[] = [[590, 975], [590, 470]];
const VALV: P[] = [[590, 430], [590, 360]];
const GROUPS = [EVAP, SUC, COMP, COND, LIQ, VALV];
const LOOP: { p: P; g: number }[] = GROUPS.flatMap((pts, g) => pts.map((p) => ({ p, g })));

const segs = LOOP.map((a, i) => {
  const b = LOOP[(i + 1) % LOOP.length];
  const len = Math.hypot(b.p[0] - a.p[0], b.p[1] - a.p[1]);
  return { a: a.p, b: b.p, g: b.g, len };
});
const TOTAL = segs.reduce((s, x) => s + x.len, 0);
const pointAt = (d: number) => {
  let r = ((d % TOTAL) + TOTAL) % TOTAL;
  for (const s of segs) {
    if (r <= s.len) {
      const q = s.len ? r / s.len : 0;
      return { x: s.a[0] + (s.b[0] - s.a[0]) * q, y: s.a[1] + (s.b[1] - s.a[1]) * q, g: s.g };
    }
    r -= s.len;
  }
  return { x: segs[0].a[0], y: segs[0].a[1], g: 0 };
};
const poly = (pts: P[]) => pts.map((p, i) => `${i ? "L" : "M"} ${p[0]} ${p[1]}`).join(" ");

export const ArCondicionado: React.FC<{ t: number; dimmed: number }> = ({ t, dimmed }) => {
  // câmera: [tempo, centro x, centro y, zoom]
  const cams: [number, number, number, number][] = [
    [0, -620, 560, 1.0],
    [T.enrugavam, -560, 640, 1.25],
    [T.canos, -640, 560, 1.0],
    [T.como, 560, 620, 0.95],
    [T.alcool, 540, -560, 1.15],
    [T.gas, 300, 330, 1.6],
    [T.ventilador, 300, 600, 1.0],
    [T.cheio, 300, 330, 1.6],
    [T.aperta, 720, 780, 1.35],
    [T.lafora, 870, 780, 1.15],
    [T.bafo, 960, 760, 0.95],
    [T.furinho, 590, 450, 1.7],
    [T.ciclo, 580, 600, 1.05],
    [T.pinga, 300, 440, 1.45],
    [T.parabens, 580, 600, 1.05],
  ];
  let ci = 0;
  for (let k = 0; k < cams.length; k++) if (t >= cams[k][0]) ci = k;
  const prev = cams[Math.max(0, ci - 1)];
  const cur = cams[ci];
  const m = ci === 0 ? 1 : appear(t, cur[0], 1.1);
  const cx = prev[1] + (cur[1] - prev[1]) * m;
  const cy = prev[2] + (cur[2] - prev[2]) * m;
  const sc = prev[3] + (cur[3] - prev[3]) * m;

  // gráfica de 1902
  const enr = appear(t, T.enrugavam + 0.3, 0.8) * (1 - appear(t, T.secou + 0.2, 1.2));
  const pipesOld = appear(t, T.canos + 0.3, 0.6);
  // mão com álcool
  const hand = windowed(t, T.alcool - 0.3, T.gas + 0.6, 0.4);
  const blow = windowed(t, T.alcool + 0.9, T.evapora + 1.5, 0.3);
  const evap = appear(t, T.gela - 0.4, 1.2);
  const cold = appear(t, T.gela, 0.6);
  // casa e circuito
  const house = pop(t, T.como + 0.3, 0.6);
  const reveal = [
    appear(t, T.gas + 0.4, 0.8),
    appear(t, T.aperta + 0.4, 0.8),
    appear(t, T.aperta + 0.8, 0.6),
    appear(t, T.lafora + 0.3, 0.8),
    appear(t, T.furinho + 0.2, 0.8),
    appear(t, T.furinho + 0.6, 0.6),
  ];
  const comp = pop(t, T.aperta + 0.5, 0.5);
  const outdoor = pop(t, T.aperta + 0.2, 0.6);
  const fanIn = t > T.ventilador + 0.2;
  const coldAir = appear(t, T.ventilador + 0.5, 0.8);
  const warmEvap = appear(t, T.cheio + 0.3, 1.0);
  const fanOut = t > T.lafora + 0.3;
  const hotAir = appear(t, T.lafora + 0.8, 0.8);
  const valve = pop(t, T.furinho + 0.4, 0.5);
  const drip = t > T.pinga + 0.3;
  const happy = appear(t, T.ventilador + 1.2, 0.5);

  // cor do gás em cada ponto do circuito
  const gasColor = (g: number, x: number) => {
    if (g === 0) return mix(C.cyan, C.amber, warmEvap * (1 - (x - 140) / 350));
    if (g === 1) return mix(C.cyan, C.amber, warmEvap);
    if (g === 2) return C.red;
    if (g === 3) return HOT;
    if (g === 4) return C.amber;
    return C.cyan;
  };
  const speed = t > T.ciclo ? 330 : 210;
  const N = 54;

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
        {t < T.alcool + 1 ? (
          <g opacity={1 - appear(t, T.como + 0.4, 0.6)}>
            <line x1={-1250} y1={800} x2={-50} y2={800} stroke={C.dim} strokeWidth={6} />
            {/* máquina de impressão */}
            <g filter="url(#glow)">
              <rect x={-1060} y={600} width={300} height={200} rx={14} fill="rgba(79,227,255,0.05)" stroke={C.steel} strokeWidth={8} />
              {[-1010, -910, -810].map((x, k) => (
                <g key={x} transform={`translate(${x} 650) rotate(${t * 160 + k * 40})`}>
                  <circle r={34} fill="none" stroke={C.cyan} strokeWidth={7} />
                  <line x1={-34} y1={0} x2={34} y2={0} stroke={C.cyan} strokeWidth={5} />
                </g>
              ))}
            </g>
            {/* pilha de papel (enruga com a umidade) */}
            {[0, 1, 2, 3].map((k) => (
              <path
                key={k}
                d={wavePath(-700, -440, 780 - k * 26, 14 * enr, 70, k * 1.3 + t * 2 * enr)}
                fill="none"
                stroke={C.white}
                strokeWidth={8}
                strokeLinecap="round"
              />
            ))}
            {/* calor e umidade no ar */}
            {enr > 0
              ? Array.from({ length: 9 }).map((_, k) => {
                  const life = (t * 0.5 + k / 9) % 1;
                  return <circle key={k} cx={-1000 + k * 110} cy={420 + life * 280} r={9} fill={C.cyan} opacity={enr * (1 - life)} />;
                })
              : null}
            <g transform="translate(-260 360)" opacity={1 - pipesOld}>
              <circle r={60} fill="none" stroke={C.amber} strokeWidth={8} filter="url(#glow)" />
              {Array.from({ length: 8 }).map((_, k) => {
                const a = (k / 8) * Math.PI * 2 + t * 0.6;
                return <line key={k} x1={Math.cos(a) * 80} y1={Math.sin(a) * 80} x2={Math.cos(a) * 110} y2={Math.sin(a) * 110} stroke={C.amber} strokeWidth={7} strokeLinecap="round" />;
              })}
            </g>
            {/* canos gelados do Carrier */}
            {pipesOld > 0 ? (
              <g opacity={pipesOld} filter="url(#glow)">
                <path d="M -1100 430 L -150 430 M -1100 470 L -150 470" stroke={C.cyan} strokeWidth={14} strokeLinecap="round" />
                {Array.from({ length: 7 }).map((_, k) => (
                  <line key={k} x1={-1040 + k * 140} y1={500} x2={-1040 + k * 140} y2={700} stroke={C.cyan} strokeWidth={6} strokeDasharray="22 22" strokeDashoffset={-t * 160} opacity={0.7} />
                ))}
              </g>
            ) : null}
            <Stick x={-300} y={800} s={1.3} armR={0.3 + 0.5 * appear(t, T.secou + 0.3, 0.5)} armL={0.5 * appear(t, T.secou + 0.3, 0.5)} flip />
          </g>
        ) : null}
        <Label t={t} from={T.enrugavam + 0.6} to={T.canos} x={-570} y={640} ax={-570} ay={740} text="PAPEL ENRUGADO" color={C.red} size={30} />
        <Label t={t} from={T.canos + 0.6} to={T.como} x={-640} y={360} text="CANOS GELADOS" color={C.cyan} size={32} />

        {/* ---------- A mão com álcool ---------- */}
        {hand > 0 ? (
          <g opacity={hand}>
            {/* sopro */}
            {blow > 0
              ? [0, 1, 2].map((k) => (
                  <path key={k} d={wavePath(170, 400, -520 + k * 50, 10, 80, t * 10 + k)} fill="none" stroke={C.white} strokeWidth={6} strokeDasharray="24 16" strokeDashoffset={-t * 240} opacity={blow * 0.8} />
                ))
              : null}
            <g filter="url(#glow)">
              {[430, 490, 550, 610].map((x, k) => (
                <rect key={x} x={x} y={-720 + (k === 0 || k === 3 ? 30 : 0)} width={46} height={190} rx={23} fill={mix("#13201d", "#123447", cold)} stroke={mix(C.white, C.cyan, cold)} strokeWidth={7} />
              ))}
              <rect x={370} y={-470} width={50} height={130} rx={25} transform="rotate(-35 395 -405)" fill={mix("#13201d", "#123447", cold)} stroke={mix(C.white, C.cyan, cold)} strokeWidth={7} />
              <rect x={420} y={-560} width={240} height={220} rx={70} fill={mix("#13201d", "#123447", cold)} stroke={mix(C.white, C.cyan, cold)} strokeWidth={8} />
            </g>
            {/* gotas de álcool que somem */}
            {[
              [480, -470],
              [545, -440],
              [605, -480],
            ].map(([x, y], k) => (
              <circle key={k} cx={x} cy={y} r={18 * (1 - evap)} fill={ICE} opacity={0.9} />
            ))}
            {/* vapor levando o calor */}
            {evap > 0
              ? [480, 545, 605].map((x, k) => {
                  const life = (t * 0.7 + k / 3) % 1;
                  return (
                    <g key={k} opacity={evap * (1 - life)}>
                      <path d={`M ${x} ${-520 - life * 200} q 16 -24 0 -48 q -16 -24 0 -48`} fill="none" stroke={ICE} strokeWidth={6} />
                      {t > T.evapora + 0.3 ? <path d={`M ${x + 22} ${-560 - life * 200} l 0 -40 l -12 14 m 12 -14 l 12 14`} fill="none" stroke={C.red} strokeWidth={6} strokeLinecap="round" /> : null}
                    </g>
                  );
                })
              : null}
            {/* floco de neve */}
            {cold > 0 ? (
              <g transform={`translate(760 -680) scale(${pop(t, T.gela, 0.5)}) rotate(${t * 30})`} stroke={C.cyan} strokeWidth={8} strokeLinecap="round" filter="url(#glow)">
                {[0, 60, 120].map((a) => (
                  <line key={a} x1={-50} y1={0} x2={50} y2={0} transform={`rotate(${a})`} />
                ))}
              </g>
            ) : null}
          </g>
        ) : null}
        <Label t={t} from={T.alcool + 0.3} to={T.gela} x={540} y={-280} text="ÁLCOOL NA MÃO" color={C.amber} size={32} />
        <Label t={t} from={T.evapora + 0.3} to={T.gas + 0.4} x={540} y={-280} text="EVAPORA = ROUBA CALOR" color={C.cyan} size={30} />

        {/* ---------- A casa ---------- */}
        {house > 0 ? (
          <g transform={`translate(560 620) scale(${house}) translate(-560 -620)`}>
            {/* sol lá fora */}
            <g transform="translate(980 170)" filter="url(#glow)">
              <circle r={50} fill="none" stroke={C.amber} strokeWidth={8} />
              {Array.from({ length: 8 }).map((_, k) => {
                const a = (k / 8) * Math.PI * 2 + t * 0.5;
                return <line key={k} x1={Math.cos(a) * 68} y1={Math.sin(a) * 68} x2={Math.cos(a) * 92} y2={Math.sin(a) * 92} stroke={C.amber} strokeWidth={7} strokeLinecap="round" />;
              })}
            </g>
            {/* parede e chão */}
            <rect x={530} y={120} width={22} height={880} fill="rgba(159,179,173,0.25)" stroke={C.steel} strokeWidth={4} />
            <line x1={40} y1={1000} x2={1120} y2={1000} stroke={C.dim} strokeWidth={6} />
            <text x={300} y={1060} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={34} fill={C.dim}>
              DENTRO
            </text>
            <text x={840} y={1060} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={34} fill={C.dim}>
              LÁ FORA
            </text>

            {/* ar frio saindo */}
            {coldAir > 0
              ? [160, 230, 300, 370, 440].map((x, k) => (
                  <path key={k} d={wavePathV(420, 760, x, 12, 90, t * 7 + k)} fill="none" stroke={C.cyan} strokeWidth={6} strokeDasharray="26 18" strokeDashoffset={-t * 200} opacity={coldAir * 0.75} filter="url(#glow)" />
                ))
              : null}

            {/* ar quente lá fora */}
            {hotAir > 0
              ? [700, 790, 880].map((y, k) => (
                  <path key={k} d={wavePath(1030, 1320, y, 14, 100, t * 7 + k)} fill="none" stroke={HOT} strokeWidth={7} strokeDasharray="28 18" strokeDashoffset={-t * 220} opacity={hotAir * 0.85} filter="url(#glow)" />
                ))
              : null}

            {/* canos */}
            {GROUPS.map((pts, g) => {
              const prevPt = g === 0 ? VALV[VALV.length - 1] : GROUPS[g - 1][GROUPS[g - 1].length - 1];
              return reveal[g] > 0 ? (
                <path key={g} d={poly([prevPt, ...pts])} fill="none" stroke={g === 0 ? "rgba(79,227,255,0.55)" : C.steel} strokeWidth={g === 0 || g === 3 ? 9 : 12} strokeLinejoin="round" strokeLinecap="round" opacity={reveal[g] * 0.8} />
              ) : null;
            })}
            {/* gás andando */}
            {reveal[0] > 0
              ? Array.from({ length: N }).map((_, k) => {
                  const p = pointAt(k * (TOTAL / N) + t * speed);
                  if (reveal[p.g] < 0.5) return null;
                  return <circle key={k} cx={p.x} cy={p.y} r={p.g === 4 ? 10 : 8} fill={gasColor(p.g, p.x)} filter="url(#glow)" />;
                })
              : null}

            {/* aparelho de dentro (split) */}
            <rect x={110} y={250} width={380} height={150} rx={26} fill="rgba(79,227,255,0.04)" stroke={C.white} strokeWidth={7} />
            {[0, 1, 2, 3].map((k) => (
              <line key={k} x1={150} y1={392 - k * 0} x2={450} y2={392} stroke={C.steel} strokeWidth={3} transform={fanIn ? `rotate(${Math.sin(t * 3) * 4} 300 392)` : undefined} opacity={k === 0 ? 1 : 0} />
            ))}
            <circle cx={455} cy={275} r={7} fill={fanIn ? C.lime : C.dim} />
            {/* água pingando */}
            {drip
              ? [0, 1].map((k) => {
                  const life = (t * 1.1 + k / 2) % 1;
                  return <path key={k} d={`M 470 ${410 + life * 300} q 12 22 0 30 q -12 -8 0 -30`} fill={C.cyan} opacity={1 - life * 0.8} />;
                })
              : null}
            {/* gotinhas de umidade grudando no cano */}
            {t > T.umidade
              ? Array.from({ length: 8 }).map((_, k) => <circle key={k} cx={170 + k * 38} cy={322 + (k % 2) * 12} r={6 * pop(t, T.umidade + k * 0.07, 0.3)} fill={ICE} />)
              : null}

            {/* pessoa dentro de casa */}
            <Stick x={300} y={1000} s={1.25} armL={happy * 0.9} armR={happy * 0.9}>
              {happy < 1
                ? [-30, 30].map((x, k) => {
                    const life = (t * 1.3 + k / 2) % 1;
                    return <path key={k} d={`M ${x} ${-160 + life * 40} q 7 12 0 16 q -7 -4 0 -16`} fill={C.cyan} stroke="none" opacity={(1 - happy) * (1 - life)} />;
                  })
                : null}
            </Stick>

            {/* aparelho de fora */}
            {outdoor > 0 ? (
              <g transform={`translate(840 790) scale(${outdoor}) translate(-840 -790)`}>
                <rect x={670} y={630} width={360} height={310} rx={20} fill="rgba(255,107,61,0.04)" stroke={C.white} strokeWidth={7} />
                {/* ventilador */}
                {reveal[3] > 0 ? (
                  <g transform="translate(925 780)" opacity={reveal[3]}>
                    <circle r={95} fill="rgba(6,9,10,0.55)" stroke={C.steel} strokeWidth={5} />
                    <g transform={`rotate(${fanOut ? (t - T.lafora) * 720 : 0})`}>
                      {[0, 120, 240].map((a) => (
                        <path key={a} d="M 0 0 Q 30 -40 0 -82 Q -24 -40 0 0" fill="rgba(159,179,173,0.5)" stroke={C.steel} strokeWidth={4} transform={`rotate(${a})`} />
                      ))}
                    </g>
                    <circle r={12} fill={C.steel} />
                  </g>
                ) : null}
              </g>
            ) : null}
            {/* compressor */}
            {comp > 0 ? (
              <g transform={`translate(745 845) scale(${comp})`} filter="url(#glow)">
                <rect x={-50} y={-80} width={100} height={160} rx={44} fill="rgba(255,77,94,0.25)" stroke={C.red} strokeWidth={7} />
                <rect x={-50} y={-20 + Math.sin(t * 14) * 6} width={100} height={10} fill={C.red} opacity={0.7} />
              </g>
            ) : null}
            {/* válvula de expansão */}
            {valve > 0 ? (
              <g transform={`translate(590 445) scale(${valve})`} filter="url(#glow)">
                <path d="M -22 -30 L 22 -30 L 6 0 L 22 30 L -22 30 L -6 0 Z" fill="rgba(79,227,255,0.25)" stroke={C.cyan} strokeWidth={5} />
              </g>
            ) : null}
          </g>
        ) : null}

        {/* etiquetas */}
        <Label t={t} from={T.refrigerante + 0.1} to={T.ventilador} x={300} y={190} ax={300} ay={330} text="GÁS REFRIGERANTE" color={C.cyan} size={30} />
        <Label t={t} from={T.ventilador + 0.6} to={T.evaporador} x={300} y={820} text="AR FRIO" color={C.cyan} size={36} />
        <Label t={t} from={T.evaporador + 0.1} to={T.cheio} x={300} y={190} ax={300} ay={300} text="EVAPORADOR" color={C.cyan} size={36} />
        <Label t={t} from={T.cheio + 0.5} to={T.aperta} x={300} y={190} ax={300} ay={330} text="GÁS CHEIO DE CALOR" color={C.amber} size={28} />
        <Label t={t} from={T.compressor + 0.1} to={T.lafora + 0.4} x={745} y={1080} ax={745} ay={925} text="COMPRESSOR" color={C.red} size={34} />
        <Label t={t} from={T.aperta + 1.2} to={T.compressor} x={745} y={1080} text="MAIS QUENTE QUE A RUA" color={HOT} size={26} />
        <Label t={t} from={T.condensador + 0.1} to={T.bafo + 0.8} x={925} y={560} ax={925} ay={690} text="CONDENSADOR" color={HOT} size={34} />
        <Label t={t} from={T.liquido + 0.4} to={T.condensador} x={800} y={1080} ax={800} ay={975} text="VIRA LÍQUIDO" color={C.amber} size={28} />
        <Label t={t} from={T.bafo + 0.3} to={T.furinho} x={1160} y={620} text="BAFO QUENTE" color={HOT} size={34} />
        <Label t={t} from={T.furinho + 0.6} to={T.ciclo} x={800} y={470} ax={612} ay={445} text="BURAQUINHO FINO" color={C.cyan} size={24} />
        <Label t={t} from={T.gelaDeNovo + 0.1} to={T.ciclo + 0.3} x={380} y={500} ax={575} ay={400} text="GELA DE NOVO" color={C.cyan} size={24} />
        <Label t={t} from={T.ciclo + 0.3} to={T.pinga} x={560} y={70} text="E O CICLO RECOMEÇA" color={C.lime} size={34} />
        <Label t={t} from={T.umidade + 0.3} to={T.parabens} x={300} y={560} ax={460} ay={440} text="UMIDADE VIRA ÁGUA" color={C.cyan} size={26} />
        <Label t={t} from={T.parabens + 0.2} to={999} x={300} y={180} ax={300} ay={255} text="EVAPORADOR" color={C.cyan} size={26} />
        <Label t={t} from={T.parabens + 0.35} to={999} x={745} y={1080} ax={745} ay={925} text="COMPRESSOR" color={C.red} size={26} />
        <Label t={t} from={T.parabens + 0.5} to={999} x={925} y={560} ax={925} ay={690} text="CONDENSADOR" color={HOT} size={26} />
        <Label t={t} from={T.parabens + 0.65} to={999} x={380} y={500} ax={575} ay={445} text="VÁLVULA" color={C.cyan} size={26} />
      </g>
    </svg>
  );
};

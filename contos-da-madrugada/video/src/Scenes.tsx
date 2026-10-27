import React from "react";
import { random } from "remotion";
import { H, appear, pop } from "./lib";

const FONT = "Montserrat, sans-serif";

export type SceneProps = { t: number; s: number; e: number; p: Record<string, any> };

export const Stick: React.FC<{ x: number; y: number; s?: number; color?: string; lying?: boolean; op?: number; lean?: number }> = ({
  x,
  y,
  s = 1,
  color = H.white,
  lying,
  op = 1,
  lean = 0,
}) => (
  <g transform={`translate(${x} ${y}) scale(${s}) rotate(${lying ? -90 : lean})`} opacity={op} stroke={color} strokeWidth={8} strokeLinecap="round" fill="none">
    <circle cx={0} cy={-150} r={22} fill={color} stroke="none" />
    <line x1={0} y1={-126} x2={0} y2={-60} />
    <line x1={0} y1={-60} x2={-22} y2={0} />
    <line x1={0} y1={-60} x2={22} y2={0} />
    <line x1={0} y1={-112} x2={-28} y2={-70} />
    <line x1={0} y1={-112} x2={28} y2={-70} />
  </g>
);

const Eyes: React.FC<{ x: number; y: number; s?: number; o?: number; blink?: number }> = ({ x, y, s = 1, o = 1, blink = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o} filter="url(#glowR)">
    <ellipse cx={-26} cy={0} rx={16} ry={10 * blink} fill={H.red} />
    <ellipse cx={26} cy={0} rx={16} ry={10 * blink} fill={H.red} />
  </g>
);

const Window: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={0} y={0} width={220} height={260} rx={8} fill="#0d0a26" stroke={H.dim} strokeWidth={8} />
    <circle cx={150} cy={80} r={44} fill={H.moon} filter="url(#glowM)" />
    <circle cx={172} cy={66} r={40} fill="#0d0a26" />
    <line x1={110} y1={0} x2={110} y2={260} stroke={H.dim} strokeWidth={6} />
    <line x1={0} y1={130} x2={220} y2={130} stroke={H.dim} strokeWidth={6} />
  </g>
);

const Phone: React.FC<{ x: number; y: number; s?: number; glow?: number; shake?: number }> = ({ x, y, s = 1, glow = 1, shake = 0 }) => (
  <g transform={`translate(${x + shake} ${y}) scale(${s})`}>
    <rect x={-60} y={-110} width={120} height={220} rx={18} fill="#111" stroke={H.steel} strokeWidth={5} />
    <rect x={-50} y={-95} width={100} height={180} rx={8} fill={H.purple} opacity={0.35 + 0.5 * glow} filter="url(#glowP)" />
  </g>
);

/** Quarto escuro: cama, janela com lua, criado-mudo com celular. */
export const Quarto: React.FC<SceneProps> = ({ t, s, p }) => {
  const vib = p.vibrate?.some((v: number) => t > v && t < v + 0.6) ? Math.sin(t * 90) * 6 : 0;
  const sit = p.sitAt ? appear(t, p.sitAt, 0.6) : 0;
  return (
    <>
      <rect x={0} y={760} width={1080} height={400} fill="#0b0920" />
      <Window x={700} y={250} />
      <rect x={120} y={640} width={520} height={120} rx={20} fill="#1c1640" stroke={H.dim} strokeWidth={6} />
      <rect x={120} y={600} width={120} height={60} rx={16} fill="#2a2360" />
      <rect x={100} y={560} width={30} height={220} rx={8} fill="#2a2360" />
      {sit < 1 ? <Stick x={360} y={610} s={1.05} lying op={1 - sit} /> : null}
      {sit > 0 ? <Stick x={300} y={650} s={1.05} op={sit} /> : null}
      <rect x={680} y={640} width={160} height={120} rx={10} fill="#1c1640" stroke={H.dim} strokeWidth={6} />
      <Phone x={760} y={600} s={0.45} glow={vib ? 1 : 0.4} shake={vib} />
      {p.clock ? (
        <g transform="translate(250 300)" opacity={appear(t, s, 0.5)}>
          <rect x={-150} y={-70} width={300} height={140} rx={16} fill="#0a0818" stroke={H.dim} strokeWidth={6} />
          <text x={0} y={36} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={96} fill={H.red} filter="url(#glowR)">
            {p.clock}
          </text>
        </g>
      ) : null}
    </>
  );
};

/** Tela do celular com mensagens que vão chegando. */
export const Celular: React.FC<SceneProps> = ({ t, s, p }) => {
  const msgs: { at: number; text: string }[] = p.msgs ?? [];
  const sc = 0.9 + 0.1 * appear(t, s, 0.5);
  return (
    <g transform={`translate(540 575) scale(${sc}) translate(-540 -575)`}>
      <rect x={250} y={120} width={580} height={960} rx={60} fill="#0c0b14" stroke={H.steel} strokeWidth={8} />
      <rect x={280} y={180} width={520} height={860} rx={30} fill="#15122c" />
      <circle cx={540} cy={250} r={42} fill={H.dim} />
      <text x={540} y={330} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={30} fill={H.white}>
        {p.from ?? "Você"}
      </text>
      <text x={540} y={366} textAnchor="middle" fontFamily={FONT} fontWeight={600} fontSize={22} fill={H.steel}>
        {p.number ?? "(seu número)"}
      </text>
      {msgs.map((m, i) => {
        const o = pop(t, m.at, 0.4);
        if (o <= 0) return null;
        const y = 430 + i * 170;
        const lines = m.text.match(/.{1,24}(\s|$)/g) ?? [m.text];
        return (
          <g key={i} transform={`translate(310 ${y}) scale(${o})`}>
            <rect x={0} y={0} width={440} height={50 + lines.length * 40} rx={26} fill="#2b2456" stroke={i === msgs.length - 1 ? H.red : "none"} strokeWidth={3} />
            {lines.map((l, k) => (
              <text key={k} x={26} y={52 + k * 40} fontFamily={FONT} fontWeight={700} fontSize={30} fill={H.white}>
                {l.trim()}
              </text>
            ))}
          </g>
        );
      })}
    </g>
  );
};

/** Porta do quarto vista de dentro: fresta de luz, sombra e batidas. */
export const Porta: React.FC<SceneProps> = ({ t, p }) => {
  const knocks: number[] = p.knocks ?? [];
  const k = knocks.find((v) => t > v && t < v + 0.25);
  const shake = k !== undefined ? Math.sin((t - k) * 120) * 8 : 0;
  const shadowX = p.shadowAt ? ((t - p.shadowAt) * 260) % 900 : -999;
  const eyes = p.eyesAt ? appear(t, p.eyesAt, 0.8) : 0;
  return (
    <>
      <rect x={0} y={900} width={1080} height={300} fill="#0b0920" />
      <g transform={`translate(${shake} 0)`}>
        <rect x={330} y={180} width={420} height={720} rx={10} fill="#1a1438" stroke={H.dim} strokeWidth={10} />
        <circle cx={700} cy={560} r={16} fill={H.steel} />
        <rect x={340} y={890} width={400} height={12} fill={H.moon} opacity={0.75} filter="url(#glowM)" />
        {shadowX > -900 && shadowX < 400 ? <rect x={340 + shadowX} y={890} width={90} height={12} fill="#05040c" /> : null}
      </g>
      {eyes > 0 ? <Eyes x={540} y={330} s={1.2} o={eyes} blink={Math.sin(t * 2) > 0.97 ? 0.1 : 1} /> : null}
      {k !== undefined ? (
        <text x={540} y={140} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={90} fill={H.white} opacity={0.9}>
          TOC
        </text>
      ) : null}
    </>
  );
};

/** Silhueta escura com olhos vermelhos. */
export const Vulto: React.FC<SceneProps> = ({ t, s, p }) => {
  const o = appear(t, s, 1.0);
  const breathe = 1 + Math.sin(t * 2) * 0.01;
  return (
    <>
      <rect x={0} y={950} width={1080} height={300} fill="#0b0920" />
      <g transform={`translate(540 950) scale(${breathe}) translate(-540 -950)`} opacity={o}>
        <path d="M 400 950 C 400 700 430 560 540 540 C 650 560 680 700 680 950 Z" fill="#000" />
        <circle cx={540} cy={470} r={95} fill="#000" />
      </g>
      <Eyes x={540} y={470} s={1.1} o={o} blink={Math.sin(t * 1.7) > 0.98 ? 0.1 : 1} />
      {p.label ? (
        <text x={540} y={1080} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={40} fill={H.red} opacity={o}>
          {p.label}
        </text>
      ) : null}
    </>
  );
};

/** Escolha final: duas opções lado a lado. */
export const Escolha: React.FC<SceneProps> = ({ t, s, p }) => {
  const a = pop(t, s, 0.5);
  const b = pop(t, s + 0.4, 0.5);
  const card = (x: number, o: number, title: string, color: string, icon: React.ReactNode) => (
    <g transform={`translate(${x} 560) scale(${o})`}>
      <rect x={-220} y={-330} width={440} height={660} rx={40} fill="#120e2a" stroke={color} strokeWidth={6} />
      {icon}
      <text x={0} y={250} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={64} fill={color}>
        {title}
      </text>
    </g>
  );
  return (
    <>
      {card(
        290,
        a,
        p.a ?? "ABRO",
        H.red,
        <g transform="translate(0 -40)">
          <rect x={-90} y={-160} width={180} height={300} rx={8} fill="#1a1438" stroke={H.dim} strokeWidth={8} />
          <circle cx={60} cy={0} r={10} fill={H.steel} />
        </g>,
      )}
      {card(790, b, p.b ?? "RESPONDO", H.purple, <g transform="translate(0 -40) scale(1.2)"><rect x={-60} y={-110} width={120} height={220} rx={18} fill="#111" stroke={H.steel} strokeWidth={5} /><rect x={-50} y={-95} width={100} height={180} rx={8} fill={H.purple} opacity={0.7} /></g>)}
    </>
  );
};

/** Corredor de escola com luz piscando. */
export const Corredor: React.FC<SceneProps> = ({ t }) => {
  const flick = random(`f${Math.floor(t * 8)}`) > 0.85 ? 0.25 : 1;
  return (
    <>
      <polygon points="0,150 1080,150 700,520 380,520" fill="#120e2a" />
      <polygon points="0,1150 1080,1150 700,700 380,700" fill="#0d0a20" />
      <polygon points="0,150 380,520 380,700 0,1150" fill="#17123a" />
      <polygon points="1080,150 700,520 700,700 1080,1150" fill="#17123a" />
      <rect x={380} y={520} width={320} height={180} fill="#05040c" />
      {[0, 1, 2].map((k) => (
        <rect key={k} x={60 + k * 110} y={300 + k * 70} width={70} height={240 - k * 50} fill="#241c52" stroke={H.dim} strokeWidth={4} />
      ))}
      <rect x={470} y={170} width={140} height={20} rx={8} fill={H.moon} opacity={flick} filter="url(#glowM)" />
      <polygon points="470,190 610,190 760,900 320,900" fill={H.moon} opacity={0.06 * flick} />
    </>
  );
};

/** Espelho de banheiro com reflexo surgindo. */
export const Espelho: React.FC<SceneProps> = ({ t, s, p }) => {
  const ghost = p.ghostAt !== undefined ? appear(t, p.ghostAt, 1.2) : 0;
  const dark = p.darkAt ? appear(t, p.darkAt, 0.3) : 0;
  return (
    <>
      <rect x={0} y={820} width={1080} height={400} fill="#0d0a20" />
      <rect x={300} y={830} width={480} height={90} rx={12} fill="#1c1640" stroke={H.dim} strokeWidth={6} />
      <rect x={260} y={180} width={560} height={600} rx={20} fill="#0f0c24" stroke={H.steel} strokeWidth={10} />
      <rect x={280} y={200} width={520} height={560} rx={12} fill={`rgba(123,92,255,${0.12 * (1 - dark)})`} />
      <Stick x={540} y={760} s={1.3} op={0.5 * (1 - dark) + 0.15} />
      {ghost > 0 ? (
        <g opacity={ghost}>
          <path d="M 640 760 C 640 600 650 520 700 510 C 750 520 760 600 760 760 Z" fill="#e8e2c8" opacity={0.5} />
          <circle cx={700} cy={470} r={46} fill="#e8e2c8" opacity={0.6} />
          <path d="M 655 450 Q 700 380 745 450 L 760 560 L 640 560 Z" fill={H.moon} opacity={0.55} />
          <Eyes x={700} y={472} s={0.45} />
        </g>
      ) : null}
      {dark > 0 ? <rect x={0} y={0} width={1080} height={1150} fill="#000" opacity={dark * 0.55} /> : null}
    </>
  );
};

/** Rua de bairro com muro e terreno baldio; silhueta agachada opcional. */
export const Terreno: React.FC<SceneProps> = ({ t, p }) => {
  const c = p.creatureAt !== undefined ? appear(t, p.creatureAt, 1.0) : 0;
  const girls = p.girls ? 1 : 0;
  return (
    <>
      <rect x={0} y={760} width={1080} height={400} fill="#14102e" />
      <rect x={0} y={520} width={1080} height={240} fill="#1a1438" />
      {[0, 1, 2, 3, 4, 5, 6, 7].map((k) => (
        <line key={k} x1={k * 140} y1={520} x2={k * 140} y2={760} stroke="#241c52" strokeWidth={6} />
      ))}
      <line x1={0} y1={520} x2={1080} y2={520} stroke={H.dim} strokeWidth={8} />
      {Array.from({ length: 14 }).map((_, k) => (
        <path key={k} d={`M ${40 + k * 75} 780 l 10 -40 l 10 40`} stroke="#2f2766" strokeWidth={5} fill="none" />
      ))}
      {c > 0 ? (
        <g opacity={c}>
          <ellipse cx={720} cy={720} rx={90} ry={60} fill="#000" />
          <circle cx={720} cy={630} r={62} fill="#000" />
          {[-30, 0, 30].map((dx) => (
            <circle key={dx} cx={720 + dx} cy={572} r={16} fill="#000" />
          ))}
          <Eyes x={720} y={632} s={0.9} />
        </g>
      ) : null}
      {girls
        ? [0, 1, 2].map((k) => <Stick key={k} x={200 + k * 80} y={900} s={0.8} lean={k === 1 ? 4 : -3} />)
        : null}
    </>
  );
};

/** Manchetes de jornal surgindo. */
export const Manchetes: React.FC<SceneProps> = ({ t, s, p }) => {
  const items: string[] = p.items ?? [];
  return (
    <>
      {items.map((txt, i) => {
        const o = pop(t, s + i * 0.6, 0.45);
        if (o <= 0) return null;
        return (
          <g key={i} transform={`translate(540 ${330 + i * 250}) rotate(${i % 2 ? 3 : -3}) scale(${o})`}>
            <rect x={-400} y={-95} width={800} height={190} rx={8} fill="#e9e4d6" />
            <text x={0} y={-20} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={46} fill="#1b1b1b">
              {txt}
            </text>
            {[0, 1].map((k) => (
              <rect key={k} x={-340} y={20 + k * 30} width={k ? 420 : 680} height={14} rx={4} fill="#8a8a8a" />
            ))}
          </g>
        );
      })}
    </>
  );
};

/** Cartão de informação (data, documento, lenda). */
export const Cartao: React.FC<SceneProps> = ({ t, s, p }) => {
  const o = pop(t, s, 0.5);
  return (
    <g transform={`translate(540 560) scale(${o})`}>
      <rect x={-380} y={-260} width={760} height={520} rx={36} fill="#120e2a" stroke={H.moon} strokeWidth={5} />
      <text x={0} y={-140} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={34} fill={H.moon} letterSpacing={4}>
        {p.tag}
      </text>
      <text x={0} y={10} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={p.big?.length > 10 ? 76 : 110} fill={H.white}>
        {p.big}
      </text>
      <text x={0} y={120} textAnchor="middle" fontFamily={FONT} fontWeight={600} fontSize={34} fill={H.steel}>
        {p.sub}
      </text>
      {p.stamp ? (
        <g transform="translate(220 170) rotate(-12)">
          <rect x={-130} y={-40} width={260} height={80} rx={10} fill="none" stroke={H.red} strokeWidth={6} />
          <text x={0} y={14} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={34} fill={H.red}>
            {p.stamp}
          </text>
        </g>
      ) : null}
    </g>
  );
};

/** Céu da madrugada com lua, para abertura ou CTA. */
export const Ceu: React.FC<SceneProps> = ({ t, p }) => (
  <>
    {Array.from({ length: 40 }).map((_, k) => (
      <circle key={k} cx={random(`sx${k}`) * 1080} cy={random(`sy${k}`) * 700 + 80} r={2 + random(`sr${k}`) * 3} fill={H.white} opacity={0.4 + 0.5 * Math.abs(Math.sin(t + k))} />
    ))}
    <circle cx={720} cy={320} r={130} fill={H.moon} filter="url(#glowM)" />
    <circle cx={780} cy={280} r={120} fill={H.bg2} />
    <path d="M0 900 Q 270 780 540 840 T 1080 820 V 1150 H 0 Z" fill="#0b0820" />
    <path d="M420 860 V 720 L 540 620 L 660 720 V 860 Z" fill="#0b0820" stroke={H.purple} strokeWidth={8} />
    <rect x={505} y={740} width={70} height={80} rx={6} fill={H.moon} opacity={0.85} filter="url(#glowM)" />
    {p.eyes ? <Eyes x={250} y={950} s={0.7} /> : null}
  </>
);

/** Estátua de ET e disco voador (cidade turística). */
export const Cidade: React.FC<SceneProps> = ({ t, s }) => {
  const o = appear(t, s, 0.6);
  return (
    <g opacity={o}>
      <rect x={0} y={880} width={1080} height={300} fill="#14102e" />
      <g transform="translate(330 880)">
        <rect x={-90} y={-40} width={180} height={40} fill={H.dim} />
        <path d="M -40 -40 V -200 Q 0 -230 40 -200 V -40 Z" fill="#3b3470" />
        <ellipse cx={0} cy={-270} rx={70} ry={80} fill="#3b3470" />
        <ellipse cx={-28} cy={-270} rx={18} ry={26} fill="#000" />
        <ellipse cx={28} cy={-270} rx={18} ry={26} fill="#000" />
      </g>
      <g transform={`translate(760 ${560 + Math.sin(t * 2) * 12})`}>
        <ellipse cx={0} cy={0} rx={200} ry={50} fill="#3b3470" stroke={H.purple} strokeWidth={6} />
        <ellipse cx={0} cy={-30} rx={90} ry={60} fill="#241c52" stroke={H.purple} strokeWidth={6} />
        {[-120, -40, 40, 120].map((x) => (
          <circle key={x} cx={x} cy={10} r={12} fill={H.moon} filter="url(#glowM)" />
        ))}
      </g>
    </g>
  );
};

export const SCENES: Record<string, React.FC<SceneProps>> = {
  quarto: Quarto,
  celular: Celular,
  porta: Porta,
  vulto: Vulto,
  escolha: Escolha,
  corredor: Corredor,
  espelho: Espelho,
  terreno: Terreno,
  manchetes: Manchetes,
  cartao: Cartao,
  ceu: Ceu,
  cidade: Cidade,
};

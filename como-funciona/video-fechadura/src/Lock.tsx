import React from "react";
import { C, T, appear, kf, pop, windowed } from "./timeline";

const FONT = "Montserrat, sans-serif";
const WOOD = "#A0662E";
const WOOD2 = "#6E4420";

type P = [number, number];

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
    <line x1={0} y1={-115} x2={36} y2={-80 - armR * 60} />
  </g>
);

const Cross: React.FC<{ x: number; y: number; o: number; r?: number }> = ({ x, y, o, r = 34 }) =>
  o > 0 ? (
    <g transform={`translate(${x} ${y})`} stroke={C.red} strokeWidth={12} strokeLinecap="round" opacity={o}>
      <line x1={-r} y1={-r} x2={r} y2={r} />
      <line x1={r} y1={-r} x2={-r} y2={r} />
    </g>
  ) : null;

/* ---------- cena 1: porta com tábua ---------- */
const Porta: React.FC<{ t: number }> = ({ t }) => {
  const drop = kf(t, [[0.3, -340], [0.9, 0, "outBack"]]);
  const slot = appear(t, T.buraco + 0.3, 0.4);
  // vara empurrando a tábua (primeiro a vara da chave, depois a vara qualquer)
  const ida1 = kf(t, [[T.buraco + 1.6, 0], [T.buraco + 2.6, 1]]);
  const volta = kf(t, [[T.qualquer + 0.1, 0], [T.qualquer + 0.5, 1]]);
  const ida2 = kf(t, [[T.qualquer + 0.9, 0], [T.qualquer + 1.9, 1]]);
  const segunda = t >= T.qualquer + 0.1;
  const push = segunda ? ida2 : ida1 * (1 - volta);
  const rodX = 700 - push * 150;
  const boardX = -push * 150;
  const rodColor = segunda ? C.red : C.amber;
  return (
    <g>
      <rect x={60} y={180} width={280} height={820} fill="rgba(159,179,173,0.06)" />
      <rect x={740} y={180} width={280} height={820} fill="rgba(159,179,173,0.06)" />
      <rect x={340} y={180} width={400} height={820} rx={8} fill="rgba(160,102,46,0.16)" stroke={WOOD} strokeWidth={8} />
      {[260, 470, 700, 880].map((y) => (
        <line key={y} x1={360} y1={y} x2={720} y2={y} stroke={WOOD} strokeWidth={3} opacity={0.35} />
      ))}
      <circle cx={380} cy={640} r={14} fill={C.steel} />
      {/* suportes */}
      <path d="M 400 510 V 590 H 460 V 510" fill="none" stroke={C.steel} strokeWidth={10} />
      <path d="M 770 510 V 590 H 830 V 510" fill="none" stroke={C.steel} strokeWidth={10} />
      {/* buraco (rasgo) na porta */}
      {slot > 0 ? <rect x={540} y={600} width={180} height={26} rx={13} fill={C.bg} stroke={C.dim} strokeWidth={4} opacity={slot} /> : null}
      {/* tábua */}
      <g transform={`translate(${boardX} ${drop})`}>
        <rect x={300} y={520} width={560} height={58} rx={10} fill={WOOD} stroke={WOOD2} strokeWidth={5} />
        <line x1={320} y1={548} x2={840} y2={548} stroke={WOOD2} strokeWidth={3} opacity={0.5} />
        {slot > 0 ? <rect x={690} y={578} width={18} height={32} fill={WOOD2} opacity={slot} /> : null}
      </g>
      {/* vara */}
      {t > T.buraco + 0.9 ? (
        <g opacity={appear(t, T.buraco + 0.9, 0.4)}>
          <circle cx={rodX + 18} cy={613} r={15} fill={rodColor} stroke={C.bg} strokeWidth={4} />
          <circle cx={rodX + 14} cy={609} r={5} fill="rgba(255,255,255,0.6)" />
        </g>
      ) : null}
      {/* pessoa do lado de fora */}
      {t > T.dentro && t < T.buraco + 0.8 ? (
        <g opacity={windowed(t, T.dentro, T.buraco + 0.8)}>
          <Stick x={930} y={1000} s={1.05} color={C.red} armL={1} armR={1} />
          <text x={930} y={760} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={70} fill={C.red}>
            ?
          </text>
        </g>
      ) : null}
      <line x1={0} y1={1000} x2={1080} y2={1000} stroke={C.steel} strokeWidth={4} />
      <Label t={t} from={1.0} to={T.dentro} x={580} y={440} text="TRANCA" color={C.amber} />
      <Label t={t} from={T.dentro + 0.4} to={T.buraco + 0.6} x={600} y={720} text="SÓ POR DENTRO" color={C.red} size={30} />
      <Label t={t} from={T.buraco + 1.1} to={T.chave} x={780} y={720} ax={rodX + 18} ay={613} text="VARA" color={C.amber} size={28} />
      <Label t={t} from={T.chave} to={T.qualquer} x={780} y={720} ax={rodX + 18} ay={613} text="CHAVE" color={C.lime} />
      <Label t={t} from={T.qualquer + 1.0} to={T.pinos} x={560} y={780} text="QUALQUER VARA ABRE" color={C.red} size={28} />
    </g>
  );
};

/* ---------- cena 2: fechadura egípcia de madeira ---------- */
const WX = [460, 550, 640];
const Egipcia: React.FC<{ t: number }> = ({ t }) => {
  // primeira chave (certa), depois a parecida
  const ciclo = (t0: number) => ({
    entra: kf(t, [[t0, 700], [t0 + 1.0, 0, "out"]]),
    sobe: kf(t, [[t0 + 1.1, 0], [t0 + 1.5, -40]]),
    abre: kf(t, [[t0 + 1.7, 0], [t0 + 2.4, 170]]),
  });
  const segunda = t >= T.iguais + 0.2;
  const c = segunda ? ciclo(T.iguais + 0.4) : ciclo(T.dentes + 0.2);
  const temChave = segunda || t >= T.dentes + 0.2;
  const dropPin = kf(t, [[T.pinos + 0.4, -90], [T.pinos + 1.0, 0, "outBack"]]);
  const keyY = temChave ? c.sobe : 0;
  const boltX = temChave ? c.abre : 0;
  const keyX = temChave ? c.entra + c.abre : 700;
  const keyColor = segunda ? C.red : C.lime;
  const pegs = segunda ? [455, 553, 637] : WX;
  return (
    <g>
      {/* parte presa na porta */}
      <rect x={380} y={400} width={340} height={200} rx={10} fill="rgba(110,68,32,0.55)" stroke={WOOD} strokeWidth={6} />
      {WX.map((x) => (
        <rect key={x} x={x - 20} y={410} width={40} height={190} fill={C.bg} opacity={0.75} />
      ))}
      {/* tranca (ferrolho) */}
      <g transform={`translate(${boltX} 0)`}>
        <rect x={140} y={600} width={800} height={96} rx={10} fill={WOOD} stroke={WOOD2} strokeWidth={6} />
        <rect x={150} y={652} width={790} height={34} fill={C.bg} opacity={0.85} />
        {WX.map((x) => (
          <rect key={x} x={x - 20} y={600} width={40} height={44} fill={C.bg} opacity={0.85} />
        ))}
      </g>
      {/* pinos */}
      {WX.map((x, i) => {
        const pegTop = keyY + 640 + (temChave && c.entra < 5 ? 0 : 200);
        const bottom = Math.min(640 + dropPin, pegTop, boltX > 8 ? 600 : 999);
        return <rect key={i} x={x - 16} y={bottom - 130} width={32} height={130} rx={6} fill="#D8A866" stroke={WOOD2} strokeWidth={4} />;
      })}
      {/* chave de madeira */}
      {temChave ? (
        <g transform={`translate(${keyX} ${keyY})`} opacity={1}>
          <rect x={300} y={656} width={720} height={24} rx={6} fill="rgba(6,9,10,0.4)" stroke={keyColor} strokeWidth={5} />
          <rect x={990} y={560} width={30} height={120} rx={8} fill="rgba(6,9,10,0.4)" stroke={keyColor} strokeWidth={5} />
          {pegs.map((x) => (
            <rect key={x} x={x - 13} y={640} width={26} height={18} fill={keyColor} />
          ))}
        </g>
      ) : null}
      <Label t={t} from={T.pinos + 0.8} to={T.dentes} x={550} y={330} ax={550} ay={420} text="PINOS" color={C.lime} />
      <Label t={t} from={T.dentes + 1.2} to={T.egito} x={740} y={800} ax={600} ay={660} text="DENTES DA CHAVE" color={C.lime} size={28} />
      <Label t={t} from={T.egito + 0.2} to={T.iguais} x={540} y={320} text="EGITO · ~4 MIL ANOS" color={C.amber} size={30} />
      <Label t={t} from={T.iguais + 2.0} to={T.corta} x={540} y={820} text="CHAVE PARECIDA ABRE" color={C.red} size={28} />
    </g>
  );
};

/* ---------- cena 3: cilindro de pinos (Yale) ---------- */
const PX = [330, 430, 530, 630, 730];
const LEN = [62, 44, 78, 52, 70];
const DRIVER = 70;
const SHEAR = 600;
const REST = 698;
const cutsOf = (ys: number[]): P[] => {
  const pts: P[] = [[250, 640]];
  PX.forEach((x, i) => {
    pts.push([x - 14, ys[i]]);
    pts.push([x + 14, ys[i]]);
  });
  pts.push([800, REST]);
  return pts;
};
const CERTA = cutsOf(LEN.map((l) => SHEAR + l));
const ERRADA = cutsOf([650, 668, 660, 642, 690]);
const profileAt = (pts: P[], x: number): number | null => {
  if (x < pts[0][0] || x > pts[pts.length - 1][0]) return null;
  for (let i = 1; i < pts.length; i++) {
    if (x <= pts[i][0]) {
      const [x0, y0] = pts[i - 1];
      const [x1, y1] = pts[i];
      return x1 === x0 ? y1 : y0 + ((y1 - y0) * (x - x0)) / (x1 - x0);
    }
  }
  return null;
};
const keyPath = (pts: P[]) => `M 250 702 L ${pts.map((p) => `${p[0]} ${p[1]}`).join(" L ")} L 800 702 Z`;

const Spring: React.FC<{ x: number; top: number; bottom: number }> = ({ x, top, bottom }) => {
  const n = 7;
  const h = Math.max(8, bottom - top);
  const d = Array.from({ length: n + 1 }, (_, i) => `${i === 0 ? "M" : "L"} ${x + (i % 2 ? 14 : -14)} ${top + (h * i) / n}`).join(" ");
  return <path d={d} fill="none" stroke={C.steel} strokeWidth={4} />;
};

const Cilindro: React.FC<{ t: number }> = ({ t }) => {
  const corta = appear(t, T.corta + 0.3, 0.5);
  // qual chave está no cilindro e quanto entrou (dx = 0 é toda dentro)
  let key: P[] | null = null;
  let dx = -700;
  let keyColor: string = C.lime;
  if (t >= T.certa && t < T.cinco + 0.2) {
    key = CERTA;
    dx = kf(t, [[T.certa + 0.1, -620], [T.certa + 1.6, 0, "out"]]);
    if (t > T.cinco - 0.2) dx = kf(t, [[T.cinco - 0.2, 0], [T.cinco + 0.2, -620, "in"]]);
  } else if (t >= T.vizinho && t < T.yale) {
    key = ERRADA;
    keyColor = C.red;
    dx = kf(t, [[T.vizinho + 0.1, -620], [T.vizinho + 1.4, 0, "out"]]);
  } else if (t >= T.parabens - 0.4) {
    key = CERTA;
    dx = kf(t, [[T.parabens - 0.4, -620], [T.parabens + 0.6, 0, "out"]]);
  }
  // grampo levantando o pino do meio
  const grampo = t >= T.grampo + 0.3 && t < T.parabens - 0.4;
  const pickX = kf(t, [[T.grampo + 0.3, -300], [T.grampo + 1.2, 0, "out"]]);
  const pickLift = kf(t, [[T.grampo + 1.4, 0], [T.grampo + 2.2, 1]]);
  const carretel = t >= T.carretel + 0.6 && t < T.parabens - 0.4;
  const enrosca = carretel ? appear(t, T.carretel + 2.0, 0.3) : 0;

  const bottoms = PX.map((x, i) => {
    if (grampo && i === 2) return REST - pickLift * (REST - (SHEAR + LEN[2]) + (carretel ? 14 : 0));
    if (!key) return REST;
    const y = profileAt(key, x - dx);
    return y === null ? REST : Math.min(REST, y);
  });
  const alinhada = key === CERTA && dx > -3;
  const angulo = (() => {
    if (key === CERTA && t >= T.gira && t < T.cinco - 0.2) return kf(t, [[T.gira, 0], [T.gira + 0.6, 90, "outBack"]]);
    if (t >= T.cinco - 0.2 && t < T.cinco + 0.2) return kf(t, [[T.cinco - 0.2, 90], [T.cinco + 0.1, 0]]);
    if (carretel) return enrosca * 9;
    if (t >= T.parabens + 0.8) return kf(t, [[T.parabens + 0.8, 0], [T.parabens + 1.4, 90, "outBack"]]);
    return 0;
  })();
  const shearGlow = alinhada ? 1 : 0;
  const conta = Math.round(kf(t, [[T.cinco + 0.4, 0], [T.cinco + 2.6, 7776, "out"]]));
  const yaleCard = windowed(t, T.yale + 0.1, T.grampo, 0.35);
  const fundo = 1 - yaleCard * 0.75;

  return (
    <g>
      <g opacity={fundo}>
        {/* corpo e cilindro */}
        <rect x={240} y={380} width={590} height={220} rx={14} fill="rgba(159,179,173,0.10)" stroke={C.steel} strokeWidth={6} />
        <rect x={240} y={600} width={590} height={110} rx={14} fill={`rgba(79,227,255,${0.06 + corta * 0.06})`} stroke={corta > 0 ? C.cyan : C.steel} strokeWidth={6} />
        {PX.map((x) => (
          <rect key={x} x={x - 22} y={396} width={44} height={300} fill={C.bg} opacity={0.9} />
        ))}
        {/* linha de corte */}
        <line
          x1={240}
          y1={SHEAR}
          x2={830}
          y2={SHEAR}
          stroke={shearGlow ? C.lime : C.dim}
          strokeWidth={shearGlow ? 7 : 4}
          strokeDasharray="18 12"
          filter={shearGlow ? "url(#glow)" : undefined}
        />
        {/* pinos: mola + pino de cima + pino de baixo */}
        {PX.map((x, i) => {
          const bottom = bottoms[i];
          const keyTop = bottom - LEN[i];
          const driverTop = keyTop - DRIVER;
          const spool = carretel && i === 2;
          const errado = key === ERRADA && dx > -3 && Math.abs(keyTop - SHEAR) > 4;
          return (
            <g key={x}>
              <Spring x={x} top={400} bottom={driverTop} />
              {spool ? (
                <path
                  d={`M ${x - 18} ${driverTop} H ${x + 18} V ${driverTop + 18} L ${x + 8} ${driverTop + 30} V ${driverTop + 40} L ${x + 18} ${driverTop + 52} V ${keyTop} H ${x - 18} V ${driverTop + 52} L ${x - 8} ${driverTop + 40} V ${driverTop + 30} L ${x - 18} ${driverTop + 18} Z`}
                  fill={enrosca ? C.red : C.amber}
                  filter={enrosca ? "url(#glow)" : undefined}
                />
              ) : (
                <rect x={x - 18} y={driverTop} width={36} height={DRIVER} rx={5} fill={C.amber} />
              )}
              <rect
                x={x - 18}
                y={keyTop + (corta > 0 ? 2 * corta : 0)}
                width={36}
                height={LEN[i] - 2 * corta}
                rx={5}
                fill={errado ? C.red : C.cyan}
                opacity={corta > 0 ? 1 : 0}
              />
              {corta < 1 ? <rect x={x - 18} y={keyTop} width={36} height={LEN[i]} rx={5} fill={C.amber} opacity={1 - corta} /> : null}
            </g>
          );
        })}
        {/* chave */}
        {key ? (
          <g transform={`translate(${dx} 0)`}>
            <path d={keyPath(key)} fill="rgba(6,9,10,0.35)" stroke={keyColor} strokeWidth={6} strokeLinejoin="round" />
            <rect x={70} y={590} width={180} height={130} rx={36} fill="rgba(6,9,10,0.35)" stroke={keyColor} strokeWidth={6} />
            <circle cx={120} cy={655} r={18} fill="none" stroke={keyColor} strokeWidth={6} />
          </g>
        ) : null}
        {/* grampo */}
        {grampo ? (
          <g transform={`translate(${pickX} ${-pickLift * (REST - (SHEAR + LEN[2]))})`}>
            <path d={`M 60 692 H ${PX[2] - 6} L ${PX[2] + 8} ${REST - 4}`} fill="none" stroke={C.white} strokeWidth={7} strokeLinecap="round" />
          </g>
        ) : null}
        {/* frente do cilindro, mostrando o giro */}
        <g transform="translate(860 260)">
          <circle r={72} fill="rgba(159,179,173,0.10)" stroke={C.steel} strokeWidth={5} />
          <circle r={52} fill="rgba(79,227,255,0.10)" stroke={alinhada || angulo > 30 ? C.lime : C.cyan} strokeWidth={5} />
          <g transform={`rotate(${angulo})`}>
            <rect x={-7} y={-34} width={14} height={52} rx={4} fill={C.bg} stroke={C.white} strokeWidth={3} />
          </g>
          <text y={112} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={24} fill={C.steel}>
            DE FRENTE
          </text>
        </g>
        {/* contador de combinações */}
        {t > T.cinco + 0.3 && t < T.yale ? (
          <g opacity={windowed(t, T.cinco + 0.3, T.yale)}>
            <text x={520} y={900} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={120} fill={C.amber} filter="url(#glow)">
              {conta.toLocaleString("pt-BR")}
            </text>
            <text x={520} y={960} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={34} fill={C.steel}>
              5 PINOS × 6 ALTURAS = 6⁵
            </text>
          </g>
        ) : null}
        <Cross x={860} y={260} o={key === ERRADA && dx > -3 ? appear(t, T.vizinho + 1.5, 0.3) : 0} r={44} />
      </g>

      {/* cartão do Yale */}
      {yaleCard > 0 ? (
        <g opacity={yaleCard} transform={`translate(540 560) scale(${0.85 + 0.15 * pop(t, T.yale + 0.1)})`}>
          <rect x={-410} y={-170} width={820} height={340} rx={36} fill="rgba(6,9,10,0.95)" stroke={C.amber} strokeWidth={6} />
          <g transform="translate(-300 -10)" stroke={C.amber} strokeWidth={10} fill="none">
            <path d="M -40 -20 V -60 A 40 40 0 0 1 40 -60 V -20" />
            <rect x={-60} y={-20} width={120} height={100} rx={16} fill="rgba(255,201,77,0.15)" />
          </g>
          <text x={80} y={-30} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={54} fill={C.white}>
            LINUS YALE JR.
          </text>
          <text x={80} y={50} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={72} fill={C.amber}>
            ANOS 1860
          </text>
          <text x={80} y={110} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={30} fill={C.steel}>
            a mesma da sua porta
          </text>
        </g>
      ) : null}

      <Label t={t} from={T.corta + 0.6} to={T.certa} x={540} y={300} text="PINO EM 2 PARTES" color={C.cyan} size={30} />
      <Label t={t} from={T.corta + 1.4} to={T.certa} x={540} y={800} ax={540} ay={690} text="CILINDRO QUE GIRA" color={C.cyan} size={28} />
      <Label t={t} from={T.gira + 0.4} to={T.linha} x={860} y={430} text="GIROU!" color={C.lime} size={30} />
      <Label t={t} from={T.linha + 0.1} to={T.cinco - 0.2} x={540} y={800} ax={420} ay={SHEAR} text="LINHA DE CORTE" color={C.lime} />
      <Label t={t} from={T.vizinho + 1.6} to={T.yale} x={540} y={300} text="CHAVE DO VIZINHO: NÃO GIRA" color={C.red} size={28} />
      <Label t={t} from={T.grampo + 1.3} to={T.carretel} x={540} y={820} ax={PX[2]} ay={700} text="GRAMPO" color={C.white} size={30} />
      <Label t={t} from={T.carretel + 2.1} to={T.seguranca} x={540} y={300} ax={PX[2]} ay={SHEAR} text="ENROSCOU!" color={C.red} size={32} />
      <Label t={t} from={T.seguranca + 0.1} to={T.parabens - 0.4} x={540} y={300} ax={PX[2]} ay={SHEAR - 20} text="PINO DE SEGURANÇA" color={C.lime} size={30} />
      <Label t={t} from={T.parabens + 0.3} to={999} x={200} y={300} ax={PX[0]} ay={450} text="MOLAS" color={C.steel} size={24} />
      <Label t={t} from={T.parabens + 0.45} to={999} x={560} y={300} ax={PX[2]} ay={520} text="PINOS" color={C.amber} size={24} />
      <Label t={t} from={T.parabens + 0.6} to={999} x={560} y={820} ax={PX[3]} ay={SHEAR} text="LINHA DE CORTE" color={C.lime} size={24} />
      <Label t={t} from={T.parabens + 0.75} to={999} x={180} y={820} ax={170} ay={700} text="CHAVE" color={C.lime} size={24} />
    </g>
  );
};

export const Lock: React.FC<{ t: number; dimmed: number }> = ({ t, dimmed }) => {
  const cams: [number, number, number, number][] = [
    [0, 560, 590, 1.0],
    [T.pinos, 545, 560, 1.15],
    [T.corta, 540, 560, 1.05],
    [T.linha, 540, 600, 1.2],
    [T.cinco, 540, 600, 1.0],
    [T.grampo, 520, 580, 1.15],
    [T.parabens, 540, 570, 1.0],
  ];
  let ci = 0;
  for (let k = 0; k < cams.length; k++) if (t >= cams[k][0]) ci = k;
  const prev = cams[Math.max(0, ci - 1)];
  const cur = cams[ci];
  const m = ci === 0 ? 1 : appear(t, cur[0], 1.0);
  const cx = prev[1] + (cur[1] - prev[1]) * m;
  const cy = prev[2] + (cur[2] - prev[2]) * m;
  const sc = prev[3] + (cur[3] - prev[3]) * m;

  const porta = 1 - appear(t, T.pinos - 0.2, 0.5);
  const egipcia = Math.min(appear(t, T.pinos, 0.5), 1 - appear(t, T.corta - 0.2, 0.5));
  const cilindro = appear(t, T.corta, 0.5);

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
        {porta > 0 ? (
          <g opacity={porta}>
            <Porta t={t} />
          </g>
        ) : null}
        {egipcia > 0 ? (
          <g opacity={egipcia}>
            <Egipcia t={t} />
          </g>
        ) : null}
        {cilindro > 0 ? (
          <g opacity={cilindro}>
            <Cilindro t={t} />
          </g>
        ) : null}
      </g>
    </svg>
  );
};

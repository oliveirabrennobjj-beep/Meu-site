import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Boneco } from "../../kit/Boneco";
import { Camera } from "../../kit/Camera";
import { Noite, Vila } from "../../kit/Cenario";
import { progresso } from "../../kit/util";
import { Comprido, Criatura, Escada, Mao, MENINO } from "./personagens";

type T = React.FC<{ dur: number }>;

// Mapa da vila: rua no eixo z; casa do menino em x=7 (frente em x=4, janela z=-1.3);
// chaminé no topo em (8.1, 8.4, 1.5); torre do sino em (-1, 0, -42).
const CHAMINE: [number, number, number] = [8.08, 8.4, 1.5];

const useT = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return { frame, t: frame / fps };
};

const sinoTorre: T = ({ dur }) => {
  const { t } = useT();
  return (
    <>
      <Noite neblina={[30, 110]} />
      <Vila sino={Math.sin(t * 3.4) * 0.45} />
      <Camera dur={dur} de={[7, 16, -30]} para={[6, 12.5, -24]} alvo={[-1, 14.2, -42]} alvoPara={[-1, 12, -42]} fov={40} />
    </>
  );
};

const vilaGeral: T = ({ dur }) => (
  <>
    <Noite neblina={[25, 90]} />
    <Vila />
    <Camera dur={dur} de={[0, 16, 30]} para={[0, 13, 22]} alvo={[0, 2, -14]} alvoPara={[0, 2.5, -16]} fov={42} />
  </>
);

const ruaNeblina: T = ({ dur }) => {
  const { frame } = useT();
  const z = interpolate(frame, [0, dur], [-30, -27]);
  return (
    <>
      <Noite neblina={[10, 55]} />
      <Vila />
      <Comprido pos={[0, 0, z]} andando />
      <Camera dur={dur} de={[0.6, 2.4, 14]} para={[0.6, 2.6, 7]} alvo={[0, 5, -26]} fov={38} />
    </>
  );
};

const compridoRosto: T = ({ dur }) => {
  const { frame } = useT();
  const z = interpolate(frame, [0, dur], [-27, -25.5]);
  return (
    <>
      <Noite neblina={[8, 45]} />
      <Vila />
      <Comprido pos={[0, 0, z]} andando />
      <Camera dur={dur} de={[1.6, 7.5, -17]} para={[1.2, 8.2, -18.5]} alvo={[0, 10.2, -26]} fov={34} tremor={0.06} />
    </>
  );
};

const vizinhoApaga: T = ({ dur }) => {
  const { frame } = useT();
  const luz = interpolate(frame, [dur * 0.35, dur * 0.45], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <>
      <Noite />
      <Vila janelaVizinho={luz} />
      <Camera dur={dur} de={[2.8, 4.2, 0]} para={[2.4, 4, -1.5]} alvo={[-4, 3.5, -9]} fov={50} />
    </>
  );
};

const meninoCalmo: T = ({ dur }) => (
  <>
    <Noite />
    <Vila />
    <Boneco visual={MENINO} pos={[3.0, 0, 1.6]} rotY={-Math.PI / 2} boca="sorriso" />
    <Camera dur={dur} de={[-3.2, 3.6, 0.2]} para={[-2.0, 3.9, 0.8]} alvo={[3.0, 3.6, 1.6]} fov={40} />
  </>
);

const compridoFrenteCasa: T = ({ dur }) => (
  <>
    <Noite />
    <Vila />
    <Comprido pos={[1.0, 0, -0.5]} rotY={Math.PI / 2} />
    <Camera dur={dur} de={[-1.2, 1.3, 10]} para={[-1.0, 1.5, 8]} alvo={[3, 6, -0.5]} fov={46} />
  </>
);

const compridoOlhaCima: T = ({ dur }) => {
  const { frame } = useT();
  const olhar = interpolate(progresso(frame, dur), [0, 1], [0, -0.75]);
  return (
    <>
      <Noite />
      <Vila />
      <Comprido pos={[1.0, 0, -0.5]} rotY={Math.PI / 2} olharX={olhar} />
      <Camera dur={dur} de={[2.6, 6.5, 5.5]} para={[2.4, 7, 4.6]} alvo={[1.5, 9.8, -0.5]} alvoPara={[1.5, 10.4, -0.5]} fov={40} />
    </>
  );
};

const meninoSobe: T = ({ dur }) => {
  const { frame } = useT();
  const y = interpolate(frame, [0, dur], [0.4, 3.6]);
  return (
    <>
      <Noite />
      <Vila />
      <Escada pos={[2.8, 0, 2.6]} />
      <Boneco visual={MENINO} pos={[1.95 + 0.18 * y, y, 2.6]} rotY={Math.PI / 2} pose="escalar" />
      <Camera dur={dur} de={[-2.6, 2.5, 11]} para={[-2.2, 4, 10]} alvo={[3.2, 3.5, 2.4]} alvoPara={[3.2, 5.5, 2.4]} fov={44} />
    </>
  );
};

const meninoTelhado: T = ({ dur }) => (
  <>
    <Noite />
    <Vila />
    <Boneco visual={MENINO} pos={[6.0, 7.1, -2.6]} rotY={0.25} pose="medo" boca="medo" escala={0.9} />
    <Camera dur={dur} de={[3.2, 13, -12]} para={[3.8, 12.4, -10.5]} alvo={[7.2, 8.8, 0.5]} fov={46} />
  </>
);

const criaturaChamine: T = ({ dur }) => (
  <>
    <Noite neblina={[12, 70]} />
    <Vila />
    <Criatura pos={CHAMINE} rotY={-Math.PI / 2} />
    <Camera dur={dur} de={[4.2, 13.5, -8]} para={[4.9, 12.4, -5.6]} alvo={[8.0, 9.4, 1.5]} fov={38} tremor={0.08} />
  </>
);

const criaturaRosto: T = ({ dur }) => {
  const { t } = useT();
  return (
    <>
      <Noite neblina={[6, 50]} />
      <Vila />
      <Criatura pos={CHAMINE} rotY={-Math.PI / 2} olharX={0.45 + Math.sin(t * 1.1) * 0.05} olharY={Math.sin(t * 0.7) * 0.08} />
      <Camera dur={dur} de={[4.3, 10.4, 2.6]} para={[4.9, 10.1, 2.1]} alvo={[7.0, 9.9, 1.5]} fov={36} tremor={0.05} />
    </>
  );
};

const olharJanela: T = ({ dur }) => (
  <>
    <Noite />
    <Vila />
    <Criatura pos={CHAMINE} rotY={-Math.PI / 2} />
    <Camera dur={dur} de={[13.5, 15, 4.5]} para={[12.8, 14.4, 4]} alvo={[4, 3, -1.3]} fov={44} />
  </>
);

const compridoVigia: T = ({ dur }) => (
  <>
    <Noite />
    <Vila />
    <Comprido pos={[1.0, 0, -0.5]} rotY={Math.PI / 2} olharX={-0.7} />
    <Criatura pos={CHAMINE} rotY={-Math.PI / 2} />
    <Camera dur={dur} de={[-5, 2.6, -5]} para={[-4.5, 3, -3]} alvo={[2, 9, 0]} fov={46} />
  </>
);

const planoGeral: T = ({ dur }) => (
  <>
    <Noite neblina={[25, 90]} />
    <Vila />
    <Comprido pos={[1.0, 0, -0.5]} rotY={Math.PI / 2} olharX={-0.7} />
    <Criatura pos={CHAMINE} rotY={-Math.PI / 2} />
    <Camera dur={dur} de={[-14, 10, 16]} para={[-11, 9, 12]} alvo={[4, 5, 0]} fov={42} />
  </>
);

const sinoBalanca: T = ({ dur }) => {
  const { t } = useT();
  return (
    <>
      <Noite neblina={[20, 90]} />
      <Vila sino={Math.sin(t * 3.4) * 0.5} />
      <Camera dur={dur} de={[-1, 14.6, -34]} para={[-1, 14.4, -35.5]} alvo={[-1, 14, -42]} fov={34} />
    </>
  );
};

const ruaVazia: T = ({ dur }) => (
  <>
    <Noite neblina={[10, 60]} />
    <Vila />
    <Camera dur={dur} de={[0.4, 3, 12]} para={[0.4, 3.1, 5]} alvo={[0, 3, -20]} fov={40} />
  </>
);

const janelaArranhao: T = ({ dur }) => {
  const { frame } = useT();
  const desce = interpolate(frame, [0, dur * 0.8], [0, 1.4], { extrapolateRight: "clamp" });
  const luz = interpolate(frame, [dur * 0.82, dur * 0.86, dur * 0.9, dur * 0.94], [1, 0.2, 0.8, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <>
      <Noite neblina={[6, 40]} />
      <Vila janelaMenino={luz} />
      <Mao pos={[3.82, 4.6, -1.15]} desce={desce} />
      <Camera dur={dur} de={[-1.0, 3.5, -0.2]} para={[0.6, 3.4, -0.8]} alvo={[4, 3.1, -1.3]} fov={42} tremor={0.05} />
    </>
  );
};

export const tomadas: Record<string, T> = {
  sinoTorre,
  vilaGeral,
  ruaNeblina,
  compridoRosto,
  vizinhoApaga,
  meninoCalmo,
  compridoFrenteCasa,
  compridoOlhaCima,
  meninoSobe,
  meninoTelhado,
  criaturaChamine,
  criaturaRosto,
  olharJanela,
  compridoVigia,
  planoGeral,
  sinoBalanca,
  ruaVazia,
  janelaArranhao,
};

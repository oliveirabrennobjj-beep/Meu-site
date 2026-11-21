import { Audio } from "@remotion/media";
import type { Caption } from "@remotion/captions";
import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill, Sequence, staticFile, useVideoConfig } from "remotion";
import { historias } from "./historias";
import { Legenda, Vinheta } from "./kit/Legenda";

export type Cena = {
  fala: string;
  tomadas: string[];
  som?: string | null;
  audio: string;
  inicioMs: number;
  falaMs: number;
  fimMs: number;
};

export type Dados = {
  nome: string;
  historia: string;
  duracaoMs: number;
  cenas: Cena[];
  legendas: Caption[];
};

export const Historia: React.FC<Dados> = ({ nome, historia, cenas, legendas }) => {
  const { fps, width, height } = useVideoConfig();
  const tomadas = historias[historia];
  const q = (ms: number) => Math.round((ms / 1000) * fps);

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {cenas.map((c, i) => {
        const ini = q(c.inicioMs);
        const total = q(c.fimMs) - ini;
        return c.tomadas.map((nomeTomada, j) => {
          const a = ini + Math.round((total * j) / c.tomadas.length);
          const b = ini + Math.round((total * (j + 1)) / c.tomadas.length);
          const Tomada = tomadas[nomeTomada];
          if (!Tomada) throw new Error(`Tomada "${nomeTomada}" não existe em historias/${historia}`);
          return (
            <Sequence key={`${i}-${j}`} from={a} durationInFrames={b - a} premountFor={0} name={nomeTomada}>
              <ThreeCanvas width={width} height={height} shadows gl={{ antialias: true }} camera={{ fov: 45 }}>
                <Tomada dur={b - a} />
              </ThreeCanvas>
            </Sequence>
          );
        });
      })}

      {cenas.map((c, i) => (
        <Sequence key={`v${i}`} from={q(c.falaMs)} name={`voz ${i + 1}`}>
          <Audio src={staticFile(c.audio)} />
        </Sequence>
      ))}
      {cenas.map((c, i) =>
        c.som ? (
          <Sequence key={`s${i}`} from={q(c.inicioMs)} name={`som ${c.som}`}>
            <Audio src={staticFile(`sfx/${c.som}.wav`)} volume={0.55} />
          </Sequence>
        ) : null,
      )}
      <Audio src={staticFile(`${nome}/trilha.wav`)} volume={0.32} />

      <Vinheta />
      <Legenda legendas={legendas} />
    </AbsoluteFill>
  );
};

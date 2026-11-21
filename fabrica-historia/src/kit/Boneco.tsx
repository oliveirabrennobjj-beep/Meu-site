import { useCurrentFrame, useVideoConfig } from "remotion";
import { PELE, type V3 } from "./util";

export type Pose = "parado" | "andar" | "olharCima" | "escalar" | "medo" | "deitado";

export type Visual = {
  camisa: string;
  calca: string;
  cabelo?: string;
  pele?: string;
  capuz?: boolean;
};

const Bloco: React.FC<{ tam: V3; pos?: V3; cor: string; brilho?: string; rot?: V3 }> = ({
  tam,
  pos = [0, 0, 0],
  cor,
  brilho,
  rot,
}) => (
  <mesh position={pos} rotation={rot} castShadow receiveShadow>
    <boxGeometry args={tam} />
    <meshStandardMaterial
      color={cor}
      roughness={0.55}
      emissive={brilho ?? "#000000"}
      emissiveIntensity={brilho ? 1.4 : 0}
    />
  </mesh>
);

// Boneco de bloco: pernas 2, tronco 2, cabeça cilíndrica. Altura total ~5,3. Frente = +z.
export const Boneco: React.FC<{
  visual: Visual;
  pos?: V3;
  rotY?: number;
  pose?: Pose;
  olharY?: number;
  olharX?: number;
  boca?: "sorriso" | "seria" | "medo";
  escala?: number;
}> = ({ visual, pos = [0, 0, 0], rotY = 0, pose = "parado", olharY = 0, olharX = 0, boca = "seria", escala = 1 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const pele = visual.pele ?? PELE;

  let pernaE = 0, pernaD = 0, bracoE = 0, bracoD = 0, abreE = 0, abreD = 0, cabecaX = olharX, quica = 0, corpoX = 0;
  if (pose === "parado") {
    bracoE = Math.sin(t * 1.6) * 0.04;
    bracoD = -bracoE;
  } else if (pose === "andar") {
    const s = Math.sin(t * 7);
    pernaE = s * 0.6;
    pernaD = -s * 0.6;
    bracoE = -s * 0.5;
    bracoD = s * 0.5;
    quica = Math.abs(Math.cos(t * 7)) * 0.08;
  } else if (pose === "olharCima") {
    cabecaX = -0.55 + olharX;
    bracoE = 0.05;
    bracoD = 0.05;
  } else if (pose === "escalar") {
    const s = Math.sin(t * 5);
    bracoE = -2.6 + s * 0.35;
    bracoD = -2.6 - s * 0.35;
    pernaE = -0.5 - s * 0.4;
    pernaD = -0.5 + s * 0.4;
  } else if (pose === "medo") {
    const tr = Math.sin(t * 40) * 0.03;
    bracoE = -1.4 + tr;
    bracoD = -1.4 - tr;
    abreE = 0.35;
    abreD = -0.35;
    cabecaX = 0.15 + olharX;
  } else if (pose === "deitado") {
    corpoX = -Math.PI / 2;
  }

  const eyeY = boca === "medo" ? 4.75 : 4.72;
  return (
    <group position={pos} rotation={[0, rotY, 0]} scale={escala}>
      <group position={[0, quica, 0]} rotation={[corpoX, 0, 0]}>
        {/* pernas */}
        <group position={[-0.5, 2, 0]} rotation={[pernaE, 0, 0]}>
          <Bloco tam={[0.95, 2, 0.95]} pos={[0, -1, 0]} cor={visual.calca} />
        </group>
        <group position={[0.5, 2, 0]} rotation={[pernaD, 0, 0]}>
          <Bloco tam={[0.95, 2, 0.95]} pos={[0, -1, 0]} cor={visual.calca} />
        </group>
        {/* tronco */}
        <Bloco tam={[2, 2, 1]} pos={[0, 3, 0]} cor={visual.camisa} />
        {visual.capuz ? <Bloco tam={[1.5, 0.5, 0.4]} pos={[0, 3.85, -0.55]} cor={visual.camisa} /> : null}
        {/* braços */}
        <group position={[-1.47, 3.9, 0]} rotation={[bracoE, 0, abreE]}>
          <Bloco tam={[0.92, 2, 0.92]} pos={[0, -0.9, 0]} cor={visual.capuz ? visual.camisa : pele} />
          <Bloco tam={[0.93, 0.5, 0.93]} pos={[0, -1.7, 0]} cor={pele} />
        </group>
        <group position={[1.47, 3.9, 0]} rotation={[bracoD, 0, abreD]}>
          <Bloco tam={[0.92, 2, 0.92]} pos={[0, -0.9, 0]} cor={visual.capuz ? visual.camisa : pele} />
          <Bloco tam={[0.93, 0.5, 0.93]} pos={[0, -1.7, 0]} cor={pele} />
        </group>
        {/* cabeça */}
        <group position={[0, 4.05, 0]} rotation={[cabecaX, olharY, 0]}>
          <mesh position={[0, 0.6, 0]} castShadow>
            <cylinderGeometry args={[0.62, 0.62, 1.15, 28]} />
            <meshStandardMaterial color={pele} roughness={0.5} />
          </mesh>
          {/* olhos */}
          <Bloco tam={[0.13, boca === "medo" ? 0.3 : 0.24, 0.06]} pos={[-0.21, eyeY - 4.05, 0.6]} cor="#111" />
          <Bloco tam={[0.13, boca === "medo" ? 0.3 : 0.24, 0.06]} pos={[0.21, eyeY - 4.05, 0.6]} cor="#111" />
          {/* boca */}
          {boca === "sorriso" ? (
            <>
              <Bloco tam={[0.3, 0.06, 0.06]} pos={[0, 0.32, 0.6]} cor="#111" />
              <Bloco tam={[0.06, 0.1, 0.06]} pos={[-0.17, 0.36, 0.6]} cor="#111" />
              <Bloco tam={[0.06, 0.1, 0.06]} pos={[0.17, 0.36, 0.6]} cor="#111" />
            </>
          ) : boca === "medo" ? (
            <Bloco tam={[0.2, 0.22, 0.06]} pos={[0, 0.3, 0.6]} cor="#1a0505" />
          ) : (
            <Bloco tam={[0.26, 0.05, 0.06]} pos={[0, 0.33, 0.6]} cor="#111" />
          )}
          {visual.cabelo ? (
            <>
              <Bloco tam={[1.32, 0.38, 1.32]} pos={[0, 1.22, -0.02]} cor={visual.cabelo} />
              <Bloco tam={[1.32, 0.7, 0.3]} pos={[0, 0.9, -0.52]} cor={visual.cabelo} />
            </>
          ) : null}
        </group>
      </group>
    </group>
  );
};

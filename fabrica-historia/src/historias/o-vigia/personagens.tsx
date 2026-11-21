import { useCurrentFrame, useVideoConfig } from "remotion";
import { Caixa } from "../../kit/Cenario";
import type { Visual } from "../../kit/Boneco";
import type { V3 } from "../../kit/util";

export const MENINO: Visual = { camisa: "#b3262d", calca: "#27407a", cabelo: "#3b2414", capuz: true };

const PRETO = "#0b0b0e";

// Homem Comprido: ~10,5 de altura, membros finos, olhos brancos acesos, dentes.
export const Comprido: React.FC<{
  pos: V3;
  rotY?: number;
  olharX?: number;
  andando?: boolean;
  braco?: number;
}> = ({ pos, rotY = 0, olharX = 0, andando = false, braco = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const passo = andando ? Math.sin(t * 3.2) * 0.35 : 0;
  const balanca = Math.sin(t * 1.3) * 0.04;
  return (
    <group position={pos} rotation={[0, rotY, 0]}>
      {/* pernas */}
      <group position={[-0.38, 6, 0]} rotation={[passo, 0, 0]}>
        <Caixa tam={[0.42, 6, 0.42]} pos={[0, -3, 0]} cor={PRETO} />
      </group>
      <group position={[0.38, 6, 0]} rotation={[-passo, 0, 0]}>
        <Caixa tam={[0.42, 6, 0.42]} pos={[0, -3, 0]} cor={PRETO} />
      </group>
      <group position={[0, 6, 0]} rotation={[0.16 + balanca, 0, 0]}>
        {/* tronco */}
        <Caixa tam={[1.4, 3.1, 0.6]} pos={[0, 1.55, 0]} cor={PRETO} />
        {/* farrapos nas costas */}
        <Caixa tam={[0.35, 3.6, 0.06]} pos={[-0.5, 1.4, -0.38]} rot={[0.12, 0, 0.05]} cor="#121216" />
        <Caixa tam={[0.35, 4.2, 0.06]} pos={[0.05, 1.2, -0.4]} rot={[0.16, 0, 0]} cor="#121216" />
        <Caixa tam={[0.35, 3.4, 0.06]} pos={[0.55, 1.5, -0.38]} rot={[0.1, 0, -0.06]} cor="#121216" />
        {/* braços longos */}
        {[-1, 1].map((lado) => (
          <group key={lado} position={[lado * 0.92, 2.9, 0]} rotation={[-passo * 0.6 + braco, 0, lado * 0.06]}>
            <Caixa tam={[0.34, 5.4, 0.34]} pos={[0, -2.7, 0]} cor={PRETO} />
            {[-0.12, 0, 0.12].map((dx, i) => (
              <Caixa key={i} tam={[0.08, 0.9, 0.08]} pos={[dx, -5.75, 0.05]} rot={[0.15, 0, dx]} cor={PRETO} />
            ))}
          </group>
        ))}
        {/* cabeça */}
        <group position={[0, 3.25, 0.05]} rotation={[olharX, 0, 0]}>
          <Caixa tam={[0.95, 1.3, 0.85]} pos={[0, 0.65, 0]} cor={PRETO} />
          <Caixa tam={[0.2, 0.12, 0.05]} pos={[-0.22, 0.85, 0.44]} cor="#ffffff" brilho="#e8f0ff" />
          <Caixa tam={[0.2, 0.12, 0.05]} pos={[0.22, 0.85, 0.44]} cor="#ffffff" brilho="#e8f0ff" />
          {Array.from({ length: 6 }, (_, i) => (
            <Caixa
              key={i}
              tam={[0.08, i % 2 ? 0.16 : 0.22, 0.05]}
              pos={[-0.25 + i * 0.1, 0.38, 0.44]}
              cor="#dcd6c8"
              brilho="#4a463e"
              sombra={false}
            />
          ))}
        </group>
      </group>
    </group>
  );
};

const PALIDO = "#cfc8bb";

// Coisa agarrada na chaminé: agachada, membros finos, olhos vermelhos, boca larga.
export const Criatura: React.FC<{ pos: V3; rotY?: number; olharX?: number; olharY?: number }> = ({
  pos,
  rotY = 0,
  olharX = 0.35,
  olharY = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const resp = 1 + Math.sin(t * 2.4) * 0.04;
  return (
    <group position={pos} rotation={[0, rotY, 0]}>
      {/* corpo agachado */}
      <group scale={[1, resp, 1]}>
        <Caixa tam={[1.1, 0.9, 1.9]} pos={[0, 0.85, -0.2]} rot={[0.35, 0, 0]} cor={PALIDO} />
        {[0, 1, 2, 3].map((i) => (
          <Caixa key={i} tam={[0.22, 0.18, 0.22]} pos={[0, 1.33 - i * 0.12, -0.8 + i * 0.42]} cor="#b9b1a3" />
        ))}
      </group>
      {/* pernas dobradas agarrando a borda */}
      {[-1, 1].map((lado) => (
        <group key={lado}>
          <Caixa tam={[0.26, 1.3, 0.26]} pos={[lado * 0.65, 0.65, -0.7]} rot={[-0.6, 0, lado * 0.25]} cor={PALIDO} />
          <Caixa tam={[0.24, 1.2, 0.24]} pos={[lado * 0.75, 0.15, -0.25]} rot={[0.5, 0, 0]} cor={PALIDO} />
        </group>
      ))}
      {/* braços compridos descendo pela frente da chaminé */}
      {[-1, 1].map((lado) => (
        <group key={lado} position={[lado * 0.45, 1.0, 0.55]} rotation={[0.9 + Math.sin(t * 1.5 + lado) * 0.05, 0, lado * 0.15]}>
          <Caixa tam={[0.2, 2.2, 0.2]} pos={[0, -1.1, 0]} cor={PALIDO} />
          {[-0.1, 0, 0.1].map((dx, i) => (
            <Caixa key={i} tam={[0.06, 0.7, 0.06]} pos={[dx, -2.5, 0.05]} rot={[0.4, 0, dx * 1.5]} cor={PALIDO} />
          ))}
        </group>
      ))}
      {/* cabeça */}
      <group position={[0, 1.45, 0.75]} rotation={[olharX, olharY, 0]}>
        <Caixa tam={[1.0, 0.85, 0.9]} pos={[0, 0, 0]} cor={PALIDO} />
        <mesh position={[-0.24, 0.1, 0.46]}>
          <sphereGeometry args={[0.13, 12, 12]} />
          <meshStandardMaterial color="#ff2a1a" emissive="#ff1a0a" emissiveIntensity={3} />
        </mesh>
        <mesh position={[0.24, 0.1, 0.46]}>
          <sphereGeometry args={[0.13, 12, 12]} />
          <meshStandardMaterial color="#ff2a1a" emissive="#ff1a0a" emissiveIntensity={3} />
        </mesh>
        <pointLight position={[0, 0.1, 0.9]} color="#ff2010" intensity={1.2} distance={3.5} decay={1.6} />
        <Caixa tam={[0.7, 0.16, 0.05]} pos={[0, -0.22, 0.46]} cor="#1a0505" sombra={false} />
        {Array.from({ length: 7 }, (_, i) => (
          <Caixa key={i} tam={[0.06, 0.1, 0.04]} pos={[-0.3 + i * 0.1, -0.19, 0.48]} cor="#eee7d6" sombra={false} />
        ))}
      </group>
    </group>
  );
};

// Mão comprida e pálida arranhando o vidro (para o close final).
export const Mao: React.FC<{ pos: V3; desce: number }> = ({ pos, desce }) => (
  <group position={[pos[0], pos[1] - desce, pos[2]]}>
    <Caixa tam={[0.25, 2.2, 0.35]} pos={[0, 1.4, 0]} cor={PALIDO} />
    {[-0.24, -0.08, 0.08, 0.24].map((dz, i) => (
      <Caixa key={i} tam={[0.07, 1.0 + (i % 2) * 0.15, 0.08]} pos={[-0.02, -0.15 - (i % 2) * 0.07, dz]} cor={PALIDO} />
    ))}
  </group>
);

export const Escada: React.FC<{ pos: V3 }> = ({ pos }) => (
  <group position={pos} rotation={[0, 0, -0.18]}>
    <Caixa tam={[0.15, 7, 0.15]} pos={[0, 3.5, -0.55]} cor="#6b4a2b" />
    <Caixa tam={[0.15, 7, 0.15]} pos={[0, 3.5, 0.55]} cor="#6b4a2b" />
    {Array.from({ length: 9 }, (_, i) => (
      <Caixa key={i} tam={[0.12, 0.12, 1.1]} pos={[0, 0.6 + i * 0.75, 0]} cor="#6b4a2b" />
    ))}
  </group>
);

import { useThree } from "@react-three/fiber";
import { Color, Fog } from "three";
import type { V3 } from "./util";

const Mat: React.FC<{ cor: string; brilho?: string; forca?: number; rough?: number }> = ({
  cor,
  brilho,
  forca = 1.5,
  rough = 0.8,
}) => (
  <meshStandardMaterial color={cor} roughness={rough} emissive={brilho ?? "#000"} emissiveIntensity={brilho ? forca : 0} />
);

export const Caixa: React.FC<{ tam: V3; pos: V3; cor: string; brilho?: string; rot?: V3; sombra?: boolean }> = ({
  tam,
  pos,
  cor,
  brilho,
  rot,
  sombra = true,
}) => (
  <mesh position={pos} rotation={rot} castShadow={sombra} receiveShadow>
    <boxGeometry args={tam} />
    <Mat cor={cor} brilho={brilho} />
  </mesh>
);

// Noite: céu escuro, neblina, luar azul. Muda o fundo e a neblina da cena.
export const Noite: React.FC<{ neblina?: [number, number]; ceu?: string; luar?: number }> = ({
  neblina = [18, 75],
  ceu = "#1a2440",
  luar = 2.4,
}) => {
  const scene = useThree((s) => s.scene);
  scene.background = new Color(ceu);
  scene.fog = new Fog(ceu, neblina[0], neblina[1]);
  return (
    <>
      <hemisphereLight args={["#7d93d6", "#2a2620", 1.25]} />
      <ambientLight intensity={0.4} color="#8a9ad0" />
      <directionalLight
        position={[-30, 45, 20]}
        intensity={luar}
        color="#a9bcff"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-left={-40}
        shadow-camera-right={40}
        shadow-camera-top={40}
        shadow-camera-bottom={-40}
        shadow-camera-far={150}
      />
      <mesh position={[-60, 70, -140]}>
        <sphereGeometry args={[7, 24, 24]} />
        <meshBasicMaterial color="#e8ecff" fog={false} />
      </mesh>
    </>
  );
};

export const Chao: React.FC<{ cor?: string; rua?: string }> = ({ cor = "#26381f", rua = "#3b3f47" }) => (
  <>
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[400, 400]} />
      <Mat cor={cor} />
    </mesh>
    {/* rua de pedra ao longo do eixo z */}
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]} receiveShadow>
      <planeGeometry args={[7, 400]} />
      <Mat cor={rua} />
    </mesh>
    {Array.from({ length: 40 }, (_, i) => (
      <Caixa key={i} tam={[6.6, 0.06, 0.12]} pos={[0, 0.05, -100 + i * 5]} cor="#30343b" sombra={false} />
    ))}
  </>
);

// Casa de bloco. Frente aponta para `frente` (+1 = +x, -1 = -x). Telhado em prisma.
export const Casa: React.FC<{
  pos: V3;
  tam?: V3;
  cor: string;
  telhado?: string;
  frente?: 1 | -1;
  /** true/false ou 0..1 para apagar aos poucos */
  janelaAcesa?: boolean | number;
  chamine?: boolean;
}> = ({ pos, tam = [6, 5, 6], cor, telhado = "#5a2a22", frente = -1, janelaAcesa = false, chamine = false }) => {
  const [w, h, d] = tam; // w = eixo x, d = eixo z
  const fx = (frente * w) / 2;
  const acesa = typeof janelaAcesa === "number" ? janelaAcesa : janelaAcesa ? 1 : 0;
  // prisma de 3 lados: raio r cobre a largura; achatado em altura
  const r = (w + 0.6) / 1.732;
  const achata = 0.55;
  return (
    <group position={pos}>
      <Caixa tam={[w, h, d]} pos={[0, h / 2, 0]} cor={cor} />
      <mesh position={[0, h + 0.5 * r * achata, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[1, 1, achata]} castShadow receiveShadow>
        <cylinderGeometry args={[r, r, d + 0.8, 3]} />
        <Mat cor={telhado} />
      </mesh>
      {/* porta */}
      <Caixa tam={[0.2, 2.6, 1.4]} pos={[fx, 1.3, d * 0.22]} cor="#3a2416" />
      {/* janela da frente */}
      <mesh position={[fx, 3, -d * 0.22]}>
        <boxGeometry args={[0.2, 1.4, 1.4]} />
        <meshStandardMaterial color={acesa > 0 ? "#c9a15a" : "#141a26"} emissive="#ffbe5c" emissiveIntensity={0.9 * acesa} roughness={0.3} />
      </mesh>
      <Caixa tam={[0.25, 1.6, 0.15]} pos={[fx, 3, -d * 0.22]} cor="#2b1d14" />
      <Caixa tam={[0.25, 0.15, 1.6]} pos={[fx, 3, -d * 0.22]} cor="#2b1d14" />
      {acesa > 0 ? (
        <pointLight position={[fx + frente * 1.2, 3, -d * 0.22]} color="#ffb85c" intensity={6 * acesa} distance={9} decay={1.5} />
      ) : null}
      {chamine ? <Caixa tam={[1, 2.6, 1]} pos={[-frente * w * 0.18, h + 2.1, d * 0.25]} cor="#4a4a52" /> : null}
    </group>
  );
};

export const Poste: React.FC<{ pos: V3; aceso?: boolean }> = ({ pos, aceso = true }) => (
  <group position={pos}>
    <Caixa tam={[0.3, 6, 0.3]} pos={[0, 3, 0]} cor="#1d1f24" />
    <Caixa tam={[0.8, 0.6, 0.8]} pos={[0, 6.2, 0]} cor="#ffe2a0" brilho={aceso ? "#ffcf70" : undefined} sombra={false} />
    {aceso ? <pointLight position={[0, 5.6, 0]} color="#ffbf66" intensity={14} distance={16} decay={1.4} /> : null}
  </group>
);

export const Arvore: React.FC<{ pos: V3; alt?: number }> = ({ pos, alt = 1 }) => (
  <group position={pos} scale={alt}>
    <Caixa tam={[0.7, 3, 0.7]} pos={[0, 1.5, 0]} cor="#3a2a1c" />
    <Caixa tam={[3, 2.4, 3]} pos={[0, 4, 0]} cor="#1d3320" />
    <Caixa tam={[2, 1.4, 2]} pos={[0, 5.8, 0]} cor="#20391f" />
  </group>
);

// Torre do sino com sino que balança `balanco` radianos.
export const Torre: React.FC<{ pos: V3; balanco?: number }> = ({ pos, balanco = 0 }) => (
  <group position={pos}>
    <Caixa tam={[4, 12, 4]} pos={[0, 6, 0]} cor="#5b5650" />
    {/* colunas do campanário */}
    {[
      [-1.7, -1.7],
      [1.7, -1.7],
      [-1.7, 1.7],
      [1.7, 1.7],
    ].map(([x, z], i) => (
      <Caixa key={i} tam={[0.6, 3.4, 0.6]} pos={[x, 13.7, z]} cor="#5b5650" />
    ))}
    <Caixa tam={[4.4, 0.5, 4.4]} pos={[0, 15.6, 0]} cor="#4a4540" />
    <mesh position={[0, 17.6, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
      <coneGeometry args={[3.3, 3.6, 4]} />
      <Mat cor="#3b2a26" />
    </mesh>
    <group position={[0, 15.2, 0]} rotation={[0, 0, balanco]}>
      <mesh position={[0, -1.1, 0]} castShadow>
        <cylinderGeometry args={[0.55, 1.1, 1.6, 16, 1, true]} />
        <meshStandardMaterial color="#b8892d" metalness={0.7} roughness={0.35} side={2} />
      </mesh>
    </group>
    <Caixa tam={[0.2, 2.2, 2.2]} pos={[2.05, 8, 0]} cor="#d9d4c3" brilho="#9aa0b0" />
  </group>
);

// Rua padrão da vila, reaproveitada pelas tomadas.
export const Vila: React.FC<{ janelaMenino?: boolean | number; janelaVizinho?: boolean | number; sino?: number; postes?: boolean }> = ({
  janelaMenino = true,
  janelaVizinho = false,
  sino = 0,
  postes = true,
}) => (
  <>
    <Chao />
    <Casa pos={[7, 0, 0]} cor="#6d7f8f" telhado="#4b2620" frente={-1} janelaAcesa={janelaMenino} chamine />
    <Casa pos={[7, 0, -11]} cor="#8a7660" telhado="#3e2a20" frente={-1} />
    <Casa pos={[7, 0, -22]} tam={[6, 6, 7]} cor="#6f6a7d" frente={-1} />
    <Casa pos={[7, 0, 11]} cor="#7d6b5a" frente={-1} />
    <Casa pos={[-7, 0, 2]} cor="#5f7563" telhado="#3a2420" frente={1} />
    <Casa pos={[-7, 0, -9]} tam={[6, 6, 6]} cor="#8b6d6d" frente={1} janelaAcesa={janelaVizinho} />
    <Casa pos={[-7, 0, -20]} cor="#6a6f80" frente={1} />
    <Casa pos={[-7, 0, 13]} cor="#7a7468" frente={1} />
    <Torre pos={[-1, 0, -42]} balanco={sino} />
    {postes ? (
      <>
        <Poste pos={[3.8, 0, -6]} />
        <Poste pos={[-3.8, 0, 7]} />
        <Poste pos={[3.8, 0, -28]} />
      </>
    ) : null}
    <Arvore pos={[13, 0, -5]} alt={1.2} />
    <Arvore pos={[-13, 0, -14]} alt={1.3} />
    <Arvore pos={[12, 0, 17]} />
  </>
);

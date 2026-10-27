import React from "react";
import { Easing } from "remotion";

export type Pose = "idle" | "wave" | "point" | "dig" | "nose" | "worried" | "thumbs" | "panic" | "party" | "throw" | "pick";
export type PlanItem = [number, number, number, Pose, number];

/** Visual do personagem. O padrão é o engenheiro: capacete branco, camisa azul, óculos e planta na mão. */
export type Look = { helmet: string; brim: string; shirt: string; pants: string; stripe: boolean; glasses: boolean; roll: boolean };
export const ENGENHEIRO: Look = { helmet: "#f4f6f8", brim: "#d9dee5", shirt: "#2d6fd6", pants: "#2b3445", stripe: false, glasses: true, roll: true };


const WALK = 1.4;
const SKIN = "#f2c49b";

const M: React.FC<{ c: string }> = ({ c }) => <meshStandardMaterial color={c} flatShading roughness={0.8} />;

/** Braço/perna: grupo no ombro/quadril; o membro pende para baixo e gira em x (frente) e z (lado). */
const Limb: React.FC<{ p: [number, number, number]; rx: number; rz: number; len: number; r: number; c: string; end?: React.ReactNode; endC?: string }> = ({
  p,
  rx,
  rz,
  len,
  r,
  c,
  end,
}) => (
  <group position={p} rotation={[rx, 0, rz]}>
    <mesh position={[0, -len / 2, 0]} castShadow>
      <capsuleGeometry args={[r, len - 2 * r, 3, 8]} />
      <M c={c} />
    </mesh>
    <group position={[0, -len, 0]}>{end}</group>
  </group>
);

const poseAngles = (pose: Pose, t: number) => {
  const s = Math.sin;
  // [braçoA x, braçoA z, braçoB x, braçoB z, inclinação, pulo, cabeça y]
  switch (pose) {
    case "wave":
      return [0.1 * s(t * 2), -0.15, 0, 2.5 + 0.35 * s(t * 9), 0, 0, 0.15 * s(t * 1.5)];
    case "point":
      return [0.1 * s(t * 2), -0.15, -1.35, 0.25, 0.05, 0, -0.2];
    case "dig":
      return [-0.9 + 0.55 * s(t * 6), -0.25, -0.9 + 0.55 * s(t * 6), 0.25, 0.25 + 0.12 * s(t * 6), 0, 0];
    case "nose":
      return [-2.5, -0.35, 0.1, 0.4, -0.05, 0, 0.35 * s(t * 7)];
    case "worried":
      return [-2.7, -0.7, -2.7, 0.7, 0, 0, 0.25 * s(t * 5)];
    case "throw":
      return [0.1 * s(t * 2), -0.15, -2.2 + 1.6 * Math.max(0, s(t * 5)), 0.2, 0.1, 0, 0];
    case "pick":
      return [-2.5, -0.45, -1.5, 0.2, 0, 0, 0.12];
    case "thumbs":
      return [0.1 * s(t * 2), -0.15, -1.6, 0.2, 0, 0, 0.1];
    case "panic":
      return [0.2 * s(t * 14), -2.7 + 0.3 * s(t * 11), 0.2 * s(t * 13), 2.7 + 0.3 * s(t * 12), 0, Math.abs(s(t * 9)) * 0.35, 0.3 * s(t * 8)];
    case "party":
      return [0, -2.5 - 0.3 * s(t * 8), 0, 2.5 + 0.3 * s(t * 8), 0, Math.abs(s(t * 6)) * 0.55, 0];
    default:
      return [0.08 * s(t * 2), -0.15, -0.08 * s(t * 2), 0.15, 0, 0, 0.1 * s(t)];
  }
};

/** Picareta apoiada no ombro (presa na mão do braço A). */
export const Pickaxe: React.FC<{ rot?: [number, number, number] }> = ({ rot = [0.4, 0, -1.2] }) => (
  <group rotation={rot}>
    <mesh position={[0, -0.55, 0]}>
      <cylinderGeometry args={[0.05, 0.05, 1.7, 8]} />
      <M c="#9a6334" />
    </mesh>
    <group position={[0, -1.35, 0]}>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <coneGeometry args={[0.09, 0.6, 6]} />
        <M c="#8f98a3" />
      </mesh>
      <mesh rotation={[0, 0, -Math.PI / 2]} position={[-0.42, 0, 0]}>
        <coneGeometry args={[0.09, 0.6, 6]} />
        <M c="#8f98a3" />
      </mesh>
      <mesh position={[-0.12, 0, 0]}>
        <boxGeometry args={[0.2, 0.18, 0.18]} />
        <M c="#6f7782" />
      </mesh>
    </group>
  </group>
);

const Shovel: React.FC = () => (
  <group rotation={[0.9, 0, 0]}>
    <mesh position={[0, -0.5, 0]}>
      <cylinderGeometry args={[0.045, 0.045, 1.6, 6]} />
      <M c="#8a5a32" />
    </mesh>
    <mesh position={[0, -1.4, 0]}>
      <boxGeometry args={[0.4, 0.45, 0.05]} />
      <M c="#9aa3ad" />
    </mesh>
  </group>
);

/** plan: [início, x, z, pose, olhar]; o boneco anda até cada ponto. yAt deixa a cena levantar/afundar o boneco. */
export const Guy: React.FC<{ t: number; plan: PlanItem[]; yAt?: (t: number) => number; scale?: number; pickRot?: [number, number, number]; visual?: Look }> = ({ t, plan, yAt, scale = 0.95, pickRot, visual = ENGENHEIRO }) => {
  let i = 0;
  for (let k = 0; k < plan.length; k++) if (t >= plan[k][0]) i = k;
  const [s, x1, z1, pose, look] = plan[i];
  const [, x0, z0] = plan[Math.max(0, i - 1)];
  const k = i === 0 ? 1 : Easing.inOut(Easing.quad)(Math.min(1, (t - s) / WALK));
  const x = x0 + (x1 - x0) * k;
  const z = z0 + (z1 - z0) * k;
  const walking = k < 1 && Math.abs(x1 - x0) > 0.3;
  const step = walking ? Math.sin(t * 11) : 0;
  const face = walking ? Math.sign(x1 - x0) * 1.2 : look;
  const [ax, az, bx, bz, lean, jump, headY] = walking ? [-0.6 * step, -0.15, 0.6 * step, 0.15, 0.08, Math.abs(step) * 0.08, 0] : poseAngles(pose, t);
  const breathe = 1 + 0.015 * Math.sin(t * 3);
  return (
    <group position={[x, (yAt ? yAt(t) : 0.3) + jump, z]} rotation={[0, face, 0]} scale={scale}>
      {/* pernas */}
      <Limb p={[-0.22, 1.0, 0]} rx={0.7 * step} rz={0.02} len={1.0} r={0.17} c={visual.pants} end={<mesh position={[0, 0.02, 0.08]}><boxGeometry args={[0.32, 0.2, 0.48]} /><M c="#222" /></mesh>} />
      <Limb p={[0.22, 1.0, 0]} rx={-0.7 * step} rz={-0.02} len={1.0} r={0.17} c={visual.pants} end={<mesh position={[0, 0.02, 0.08]}><boxGeometry args={[0.32, 0.2, 0.48]} /><M c="#222" /></mesh>} />
      <group position={[0, 1.0, 0]} rotation={[lean, 0, 0]} scale={[1, breathe, 1]}>
        {/* quadril e tronco */}
        <mesh position={[0, 0.08, 0]}>
          <boxGeometry args={[0.72, 0.25, 0.42]} />
          <M c={visual.pants} />
        </mesh>
        <mesh position={[0, 0.6, 0]} castShadow>
          <capsuleGeometry args={[0.38, 0.5, 4, 10]} />
          <M c={visual.shirt} />
        </mesh>
        {/* faixa refletiva */}
        {visual.stripe ? (
          <mesh position={[0, 0.55, 0]}>
            <cylinderGeometry args={[0.395, 0.395, 0.1, 10]} />
            <M c="#e8f04a" />
          </mesh>
        ) : (
          <>
            {/* gola e botões da camisa */}
            <mesh position={[0, 1.02, 0.12]} rotation={[0.5, 0, 0]}>
              <torusGeometry args={[0.24, 0.06, 4, 10, Math.PI]} />
              <M c="#f4f6f8" />
            </mesh>
            {[0.85, 0.6, 0.35].map((y) => (
              <mesh key={y} position={[0, y, 0.385]}>
                <sphereGeometry args={[0.035, 6, 4]} />
                <M c="#f4f6f8" />
              </mesh>
            ))}
            {/* caneta no bolso */}
            <mesh position={[-0.2, 0.86, 0.36]}>
              <cylinderGeometry args={[0.025, 0.025, 0.22, 6]} />
              <M c="#ffd60a" />
            </mesh>
          </>
        )}
        {/* braços */}
        <Limb
          p={[-0.48, 0.95, 0]}
          rx={ax}
          rz={az}
          len={0.85}
          r={0.13}
          c={visual.shirt}
          end={
            <>
              <mesh>
                <sphereGeometry args={[0.15, 8, 6]} />
                <M c={SKIN} />
              </mesh>
              {pose === "pick" && !walking ? <Pickaxe rot={pickRot} /> : null}
              {visual.roll && pose !== "dig" ? (
                <group rotation={[0.25, 0.4, 1.35]} position={[0, -0.05, 0.12]}>
                  <mesh>
                    <cylinderGeometry args={[0.13, 0.13, 1.1, 12]} />
                    <M c="#5aa9ff" />
                  </mesh>
                  {[-0.52, 0.52].map((y) => (
                    <mesh key={y} position={[0, y, 0]}>
                      <cylinderGeometry args={[0.135, 0.135, 0.06, 12]} />
                      <M c="#e8f4ff" />
                    </mesh>
                  ))}
                </group>
              ) : null}
            </>
          }
        />
        <Limb
          p={[0.48, 0.95, 0]}
          rx={bx}
          rz={bz}
          len={0.85}
          r={0.13}
          c={visual.shirt}
          end={
            <>
              <mesh>
                <sphereGeometry args={[0.15, 8, 6]} />
                <M c={SKIN} />
              </mesh>
              {(pose === "thumbs" || pose === "pick") && !walking ? (
                <mesh position={[0, -0.08, 0.14]} rotation={[-1.2, 0, 0]}>
                  <capsuleGeometry args={[0.05, 0.12, 2, 6]} />
                  <M c={SKIN} />
                </mesh>
              ) : null}
              {pose === "dig" && !walking ? <Shovel /> : null}
            </>
          }
        />
        {/* cabeça */}
        <group position={[0, 1.55, 0]} rotation={[0, headY, 0]}>
          <mesh castShadow>
            <sphereGeometry args={[0.55, 14, 10]} />
            <M c={SKIN} />
          </mesh>
          {[-0.2, 0.2].map((ex) => (
            <group key={ex} position={[ex, 0.08, 0.45]}>
              <mesh>
                <sphereGeometry args={[0.16, 10, 8]} />
                <M c="#ffffff" />
              </mesh>
              <mesh position={[0, 0, 0.13]}>
                <sphereGeometry args={[0.075, 8, 6]} />
                <M c="#111" />
              </mesh>
            </group>
          ))}
          {pose === "panic" || pose === "worried" ? (
            <mesh position={[0, -0.24, 0.5]}>
              <sphereGeometry args={[0.1, 8, 6]} />
              <M c="#5a1a1a" />
            </mesh>
          ) : (
            <mesh position={[0, -0.16, 0.48]} rotation={[0.25, 0, Math.PI]}>
              <torusGeometry args={[0.17, 0.045, 6, 12, Math.PI]} />
              <M c="#5a1a1a" />
            </mesh>
          )}
          <mesh position={[0, -0.02, 0.56]}>
            <sphereGeometry args={[0.07, 6, 5]} />
            <M c="#e8a77c" />
          </mesh>
          {visual.glasses ? (
            <>
              {[-0.2, 0.2].map((ex) => (
                <mesh key={ex} position={[ex, 0.08, 0.6]}>
                  <torusGeometry args={[0.19, 0.03, 6, 16]} />
                  <M c="#1b1b1f" />
                </mesh>
              ))}
              <mesh position={[0, 0.1, 0.62]}>
                <boxGeometry args={[0.06, 0.03, 0.03]} />
                <M c="#1b1b1f" />
              </mesh>
            </>
          ) : null}
          {/* capacete */}
          <mesh position={[0, 0.12, 0]}>
            <sphereGeometry args={[0.6, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <M c={visual.helmet} />
          </mesh>
          <mesh position={[0, 0.13, 0.1]}>
            <cylinderGeometry args={[0.68, 0.68, 0.06, 14]} />
            <M c={visual.brim} />
          </mesh>
        </group>
      </group>
    </group>
  );
};

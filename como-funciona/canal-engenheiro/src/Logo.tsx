import React from "react";
import { AbsoluteFill, staticFile } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { loadFont } from "@remotion/fonts";
import { Guy } from "./Guy";

loadFont({ family: "Montserrat", url: staticFile("fonts/montserrat.woff2"), weight: "100 900" });

const Camera: React.FC = () => {
  const camera = useThree((s) => s.camera);
  camera.position.set(1.1, 2.75, 7.6);
  camera.lookAt(0.1, 2.45, 0);
  camera.updateMatrixWorld();
  return null;
};

/** Caminhão desenhado em linha branca, como numa planta de engenharia. */
const Planta: React.FC = () => (
  <svg viewBox="0 0 1080 1080" style={{ position: "absolute", inset: 0 }}>
    <g fill="none" stroke="#cfe6ff" strokeWidth={7} strokeLinejoin="round" opacity={0.55}>
      <path d="M90 700 V470 h290 v230 M380 520 h150 l70 90 v90 H90" />
      <rect x={410} y={540} width={90} height={60} />
      <path d="M600 700 h390 V430 H560 v120" />
      <circle cx={190} cy={720} r={62} />
      <circle cx={190} cy={720} r={22} />
      <circle cx={760} cy={720} r={62} />
      <circle cx={760} cy={720} r={22} />
      <circle cx={900} cy={720} r={62} />
      <circle cx={900} cy={720} r={22} />
    </g>
    <g stroke="#cfe6ff" strokeWidth={4} opacity={0.45}>
      <path d="M90 840 H990 M90 820 v40 M990 820 v40" />
      <path d="M1030 430 V700 M1010 430 h40 M1010 700 h40" />
    </g>
    <g fill="#cfe6ff" opacity={0.5} fontFamily="Montserrat, sans-serif" fontWeight={800} fontSize={34}>
      <text x={540} y={890} textAnchor="middle">12,0 m</text>
    </g>
    {/* engrenagem no canto */}
    <g transform="translate(905 215)" fill="none" stroke="#ffd60a" strokeWidth={10} opacity={0.85}>
      <circle r={62} />
      <circle r={22} />
      {Array.from({ length: 8 }).map((_, k) => (
        <rect key={k} x={-13} y={-92} width={26} height={30} rx={4} transform={`rotate(${k * 45})`} />
      ))}
    </g>
  </svg>
);

/** Foto de perfil do canal: o engenheiro na frente de uma planta de caminhão. */
export const Logo: React.FC = () => (
  <AbsoluteFill
    style={{
      backgroundColor: "#16407e",
      backgroundImage:
        "linear-gradient(rgba(255,255,255,0.10) 2px, transparent 2px), linear-gradient(90deg, rgba(255,255,255,0.10) 2px, transparent 2px), linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
      backgroundSize: "120px 120px, 120px 120px, 30px 30px, 30px 30px",
    }}
  >
    <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 45%, rgba(90,169,255,0.45) 0%, rgba(22,64,126,0) 55%)" }} />
    <Planta />
    <ThreeCanvas width={1080} height={1080} camera={{ fov: 36, position: [0, 2, 6] }} shadows>
      <Camera />
      <hemisphereLight args={["#fff6e0", "#1d3b66", 1.25]} />
      <directionalLight position={[4, 8, 8]} intensity={2.4} castShadow />
      <directionalLight position={[-6, 3, 4]} intensity={0.7} color="#bcd4ff" />
      <Guy t={0.4} plan={[[0, 0, 0, "thumbs", 0.2]]} yAt={() => 0} scale={1.3} />
    </ThreeCanvas>
  </AbsoluteFill>
);

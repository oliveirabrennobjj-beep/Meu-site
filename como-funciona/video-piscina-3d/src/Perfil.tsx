import React from "react";
import { AbsoluteFill, Still } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { Guy } from "./Guy";

const Camera: React.FC = () => {
  const camera = useThree((s) => s.camera);
  camera.position.set(0.7, 2.25, 7.3);
  camera.lookAt(0, 2.15, 0);
  camera.updateMatrixWorld();
  return null;
};

/** Foto de perfil: o boneco com a picareta no ombro, fazendo joinha. */
const Foto: React.FC<{ pickRot: [number, number, number] }> = ({ pickRot }) => (
  <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 42%, #FFE07A 0%, #FFC21A 34%, #5BB8F5 35%, #3E9BE0 100%)" }}>
    <div style={{ position: "absolute", left: "50%", top: "66%", width: 1400, height: 900, translate: "-50% 0", borderRadius: "50%", background: "#7cc35a", boxShadow: "inset 0 18px 0 #94d470" }} />
    <ThreeCanvas width={1080} height={1080} camera={{ fov: 36, position: [0, 2, 6] }} shadows>
      <Camera />
      <hemisphereLight args={["#fff6e0", "#5a4030", 1.2]} />
      <directionalLight position={[4, 8, 8]} intensity={2.4} castShadow />
      <directionalLight position={[-6, 3, 4]} intensity={0.6} color="#bcd4ff" />
      <Guy t={0.4} plan={[[0, 0, 0, "pick", 0.18]]} yAt={() => 0} scale={1.25} pickRot={pickRot} />
    </ThreeCanvas>
  </AbsoluteFill>
);

export const Perfis = () => (
  <>
    <Still id="FotoPerfil" component={Foto} defaultProps={{ pickRot: [0.4, 0, -1.2] as [number, number, number] }} width={1080} height={1080} />
  </>
);

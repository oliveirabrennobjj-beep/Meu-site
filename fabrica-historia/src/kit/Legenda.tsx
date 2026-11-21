import "@fontsource/montserrat/900.css";
import type { Caption } from "@remotion/captions";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

// Uma palavra por vez, no centro, com pulo. Palavra que fecha frase fica amarela.
export const Legenda: React.FC<{ legendas: Caption[] }> = ({ legendas }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ms = (frame / fps) * 1000;
  let atual = -1;
  for (let i = 0; i < legendas.length; i++) {
    if (legendas[i].startMs <= ms) atual = i;
    else break;
  }
  if (atual < 0) return null;
  const c = legendas[atual];
  if (ms > c.endMs + 450) return null;
  const local = frame - Math.round((c.startMs / 1000) * fps);
  const s = spring({ frame: local, fps, config: { damping: 11, stiffness: 240, mass: 0.6 } });
  const escala = interpolate(s, [0, 1], [0.72, 1]);
  const fechaFrase = /[.!?…]$/.test(c.text.trim());
  const texto = c.text.trim().replace(/[,.;:…]+$/, "");
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", paddingTop: 380 }}>
      <div
        style={{
          fontFamily: "Montserrat",
          fontWeight: 900,
          fontSize: 104,
          letterSpacing: -1,
          color: fechaFrase ? "#ffd21f" : "#ffffff",
          WebkitTextStroke: "18px #000",
          paintOrder: "stroke fill",
          textShadow: "0 8px 0 rgba(0,0,0,0.55)",
          transform: `scale(${escala})`,
          textAlign: "center",
          maxWidth: 940,
          lineHeight: 1.05,
        }}
      >
        {texto}
      </div>
    </AbsoluteFill>
  );
};

export const Vinheta: React.FC = () => (
  <AbsoluteFill
    style={{
      background:
        "radial-gradient(ellipse 75% 60% at 50% 45%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.55) 100%), linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0) 18%, rgba(0,0,0,0) 80%, rgba(0,0,0,0.4) 100%)",
      pointerEvents: "none",
    }}
  />
);

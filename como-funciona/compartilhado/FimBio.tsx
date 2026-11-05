// Tela final "link na bio". Copiada para src/ de cada vídeo (mesmo arquivo em todos).
import React from "react";
import { AbsoluteFill, Series, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Audio } from "@remotion/media";

export const FIM_S = 4.6;

const FONT = "Montserrat, sans-serif";

export const FimBio: React.FC<{ cor: string; fundo: string; perfil: string }> = ({ cor, fundo, perfil }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const entra = spring({ frame: f, fps, config: { damping: 14 } });
  const seta = spring({ frame: f - 18, fps, config: { damping: 9 } });
  const pulso = 1 + 0.06 * Math.sin((f / fps) * Math.PI * 3);
  const sai = interpolate(f, [FIM_S * fps - 10, FIM_S * fps], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ background: fundo, fontFamily: FONT, alignItems: "center", justifyContent: "center", opacity: sai }}>
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 10,
          background: cor,
          boxShadow: `0 0 30px ${cor}`,
        }}
      />
      <div style={{ textAlign: "center", padding: "0 80px", transform: `translateY(${(1 - entra) * 80}px)`, opacity: entra }}>
        <div style={{ color: "#fff", fontSize: 96, fontWeight: 900, lineHeight: 1.0, letterSpacing: -2 }}>
          Quer fazer
          <div style={{ color: cor, textShadow: `0 0 40px ${cor}88` }}>vídeos assim?</div>
        </div>
        <div style={{ color: "#cfd8dc", fontSize: 44, fontWeight: 700, marginTop: 40 }}>Sem gravar, sem aparecer, só com IA</div>
      </div>
      <div
        style={{
          position: "absolute",
          bottom: 330,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 26,
          transform: `scale(${seta * pulso})`,
        }}
      >
        <div style={{ width: 0, height: 0, borderLeft: "40px solid transparent", borderRight: "40px solid transparent", borderBottom: `56px solid ${cor}`, transform: `translateY(${-14 * Math.abs(Math.sin((f / fps) * Math.PI * 2))}px)` }} />
        <div
          style={{
            background: cor,
            color: "#0a0d0f",
            fontSize: 64,
            fontWeight: 900,
            padding: "26px 60px",
            borderRadius: 999,
            boxShadow: `0 0 50px ${cor}aa`,
          }}
        >
          LINK NA BIO
        </div>
        <div style={{ color: "#fff", fontSize: 40, fontWeight: 800, letterSpacing: 2 }}>{perfil}</div>
      </div>
      <Audio src={staticFile("fim-bio.mp3")} />
    </AbsoluteFill>
  );
};

// Vídeo original + tela final.
export const ComFim: React.FC<{
  Video: React.FC;
  duracao: number;
  cor: string;
  fundo: string;
  perfil: string;
}> = ({ Video, duracao, cor, fundo, perfil }) => {
  const { fps } = useVideoConfig();
  return (
    <Series>
      <Series.Sequence durationInFrames={Math.round(duracao * fps)}>
        <Video />
      </Series.Sequence>
      <Series.Sequence durationInFrames={Math.round(FIM_S * fps)}>
        <FimBio cor={cor} fundo={fundo} perfil={perfil} />
      </Series.Sequence>
    </Series>
  );
};

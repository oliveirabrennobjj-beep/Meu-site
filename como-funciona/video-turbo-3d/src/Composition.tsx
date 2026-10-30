import React from "react";
import { AbsoluteFill, Composition, Still, staticFile, useCurrentFrame, getStaticFiles } from "remotion";
import { Audio } from "@remotion/media";
import { ThreeCanvas } from "@remotion/three";
import { loadFont } from "@remotion/fonts";
import { createTikTokStyleCaptions, type Caption } from "@remotion/captions";
import { FPS, appear, pop } from "./lib";
import { DURATION_S, LABELS, SFX, T, WORDS } from "./timeline";
import { FOV, H, W, project } from "./camera";
import { TurboScene } from "./Turbo";

loadFont({ family: "Montserrat", url: staticFile("fonts/montserrat.woff2"), weight: "100 900" });
const FONT = "Montserrat, sans-serif";
const YELLOW = "#FFD60A";
const STROKE = "0 0 1px #000, 3px 3px 0 #000, -3px 3px 0 #000, 3px -3px 0 #000, -3px -3px 0 #000, 0 6px 12px rgba(0,0,0,0.5)";

const captions: Caption[] = WORDS.map((w, i) => ({
  text: (i === 0 ? "" : " ") + w.t.replace(/[,:]$/, ""),
  startMs: w.s * 1000,
  endMs: w.e * 1000,
  timestampMs: ((w.s + w.e) / 2) * 1000,
  confidence: null,
}));
const { pages } = createTikTokStyleCaptions({ captions, combineTokensWithinMilliseconds: 700 });

const Captions: React.FC<{ t: number }> = ({ t }) => {
  const ms = t * 1000;
  const page = pages.find((p, i) => ms >= p.startMs - 50 && ms < (pages[i + 1] ? pages[i + 1].startMs : p.startMs + p.durationMs + 600));
  if (!page) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: 50,
        right: 50,
        top: 1390,
        display: "flex",
        justifyContent: "center",
        flexWrap: "wrap",
        fontFamily: FONT,
        fontWeight: 900,
        fontSize: 76,
        lineHeight: 1.1,
        textTransform: "uppercase",
      }}
    >
      {page.tokens.map((tok, i) => {
        const active = ms >= tok.fromMs && ms < tok.toMs + 80;
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              margin: "0 14px",
              color: active ? YELLOW : "#fff",
              scale: active ? "1.1" : "1",
              WebkitTextStroke: "10px #000",
              paintOrder: "stroke fill",
              textShadow: "0 8px 16px rgba(0,0,0,0.45)",
            }}
          >
            {tok.text.trim()}
          </span>
        );
      })}
    </div>
  );
};

const TONES = { red: "#ff3b3b", blue: "#2d7dff", green: "#1fbf4a" } as const;

const Labels: React.FC<{ t: number }> = ({ t }) => (
  <>
    {LABELS.map((l, i) => {
      if (t < l.from || t > l.to + 0.3) return null;
      const s = pop(t, l.from, 0.35) * (1 - appear(t, l.to, 0.25));
      const { x, y, visible } = l.screen ? { x: l.screen[0], y: l.screen[1], visible: true } : project(t, l.p);
      if (!visible) return null;
      return (
        <div
          key={i}
          style={{
            position: "absolute",
            left: x,
            top: y,
            translate: "-50% -100%",
            scale: String(s),
            transformOrigin: "50% 100%",
            fontFamily: FONT,
            fontWeight: 900,
            fontSize: 40,
            letterSpacing: 1,
            whiteSpace: "nowrap",
            color: l.tone ? "#fff" : "#111",
            background: l.tone ? TONES[l.tone] : "#fff",
            padding: "12px 26px",
            borderRadius: 18,
            border: "5px solid #111",
            boxShadow: "0 8px 0 #111",
          }}
        >
          {l.text}
        </div>
      );
    })}
  </>
);

const Headline: React.FC<{ t: number; big?: boolean }> = ({ t, big }) => {
  const p = big ? 1 : appear(t, 0.05, 0.4);
  return (
    <div
      style={{
        position: "absolute",
        top: big ? 170 : 110,
        left: 60,
        right: 60,
        fontFamily: FONT,
        fontWeight: 900,
        fontSize: big ? 112 : 66,
        lineHeight: 1.08,
        textTransform: "uppercase",
        color: "#fff",
        opacity: p,
        translate: `0 ${(1 - p) * -30}px`,
        textShadow: STROKE,
      }}
    >
      E se você fizesse um{" "}
      <br />
      <span style={{ background: YELLOW, color: "#111", padding: "0 14px", textShadow: "none", borderRadius: 8 }}>turbo?</span>
    </div>
  );
};

const Confetti: React.FC<{ t: number }> = ({ t }) => {
  if (t < T.parabens) return null;
  const life = t - T.parabens;
  return (
    <>
      {Array.from({ length: 70 }).map((_, i) => {
        const x = (i * 157) % W;
        const y = -60 + life * (420 + (i % 7) * 60) - ((i * 89) % 500);
        if (y > H) return null;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x + Math.sin(life * 3 + i) * 40,
              top: y,
              width: 22,
              height: 34,
              background: ["#FFD60A", "#ff3b3b", "#2d7dff", "#1fbf4a", "#ffffff"][i % 5],
              rotate: `${life * 300 + i * 40}deg`,
              borderRadius: 4,
            }}
          />
        );
      })}
    </>
  );
};

const Cta: React.FC<{ t: number }> = ({ t }) => {
  if (t < T.cta) return null;
  const a = pop(t, T.cta + 0.1, 0.45);
  const b = pop(t, T.cta + 0.35, 0.45);
  const box = (txt: string, c: string, s: number) => (
    <div style={{ scale: String(s), background: c, color: "#fff", border: "6px solid #111", boxShadow: "0 10px 0 #111", borderRadius: 26, padding: "26px 40px", fontFamily: FONT, fontWeight: 900, fontSize: 60 }}>
      {txt}
    </div>
  );
  return (
    <div style={{ position: "absolute", top: 1060, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 40 }}>
      {box("TURBO", "#2d7dff", a)}
      {box("ASPIRADO", "#ff3b3b", b)}
    </div>
  );
};

const hasNarration = getStaticFiles().some((f) => f.name === "narracao-turbo.mp3");

export const Turbo: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  return (
    <AbsoluteFill style={{ background: "linear-gradient(180deg, #4b5566 0%, #4b5566 55%, #8a8d93 55%)" }}>
      <ThreeCanvas width={W} height={H} camera={{ fov: FOV, position: [0, 0, 20], near: 0.1, far: 200 }} shadows>
        <TurboScene t={t} />
      </ThreeCanvas>
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0) 22%, rgba(0,0,0,0) 66%, rgba(0,0,0,0.35) 100%)" }} />
      <Labels t={t} />
      <Headline t={t} />
      <Cta t={t} />
      <Captions t={t} />
      <Confetti t={t} />
      {hasNarration ? <Audio name="Narração" src={staticFile("narracao-turbo.mp3")} premountFor={FPS} /> : null}
      <Audio
        name="Ambiente"
        src={staticFile("sfx/ambient.mp3")}
        loop
        premountFor={FPS}
        volume={(f) => 0.12 * Math.min(1, f / FPS / 1.5) * Math.min(1, Math.max(0, (DURATION_S - f / FPS) / 1.5))}
      />
      {SFX.map((s, i) => (
        <Audio key={i} name={s.src} src={staticFile(s.src)} from={Math.max(0, Math.round(s.at * FPS))} durationInFrames={FPS * 4} premountFor={FPS} volume={s.vol} />
      ))}
    </AbsoluteFill>
  );
};

const Cover: React.FC = () => {
  const t = T.juntos + 2.0;
  return (
    <AbsoluteFill style={{ background: "linear-gradient(180deg, #4b5566 0%, #4b5566 55%, #8a8d93 55%)" }}>
      <ThreeCanvas width={W} height={H} camera={{ fov: FOV, position: [0, 0, 20] }} shadows>
        <TurboScene t={t} />
      </ThreeCanvas>
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0) 35%)" }} />
      <Headline t={t} big />
    </AbsoluteFill>
  );
};

export const MyComposition = () => (
  <>
    <Composition id="Turbo" component={Turbo} durationInFrames={Math.round(DURATION_S * FPS)} fps={FPS} width={W} height={H} />
    <Still id="Capa-Turbo" component={Cover} width={W} height={H} />
  </>
);

import React from "react";
import {
  AbsoluteFill,
  Composition,
  Solid,
  Still,
  getStaticFiles,
  interpolate,
  random,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Audio } from "@remotion/media";
import { CameraMotionBlur } from "@remotion/motion-blur";
import { Underline } from "@remotion/rough-notation";
import { lightLeak } from "@remotion/effects/light-leak";
import { createTikTokStyleCaptions, type Caption } from "@remotion/captions";
import { loadFont } from "@remotion/fonts";
import { Cooker } from "./Cooker";
import { BEATS, C, DURATION_S, FPS, SFX, T, appear, pop } from "./timeline";
import rawWords from "./words.json";

loadFont({ family: "Montserrat", url: staticFile("fonts/montserrat.woff2"), weight: "100 900" });
const FONT = "Montserrat, sans-serif";

type W = { t: string; s: number; e: number };
const words = (rawWords as W[]).filter((w) => w.s >= 0.08 && !w.t.startsWith("["));

const captions: Caption[] = words.map((w, i) => ({
  text: (i === 0 ? "" : " ") + w.t.replace(/[,:]$/, ""),
  startMs: w.s * 1000,
  endMs: w.e * 1000,
  timestampMs: ((w.s + w.e) / 2) * 1000,
  confidence: null,
}));
const { pages } = createTikTokStyleCaptions({ captions, combineTokensWithinMilliseconds: 900 });

const Captions: React.FC<{ t: number }> = ({ t }) => {
  const ms = t * 1000;
  const idx = pages.findIndex((p, i) => {
    const end = pages[i + 1] ? pages[i + 1].startMs : p.startMs + p.durationMs + 600;
    return ms >= p.startMs - 50 && ms < end;
  });
  if (idx < 0) return null;
  const page = pages[idx];
  const s = 0.9 + 0.1 * pop(t, page.startMs / 1000 - 0.05, 0.25);
  return (
    <div
      style={{
        position: "absolute",
        left: 60,
        right: 60,
        top: 1610,
        display: "flex",
        justifyContent: "center",
        flexWrap: "wrap",
        whiteSpace: "pre-wrap",
        scale: String(s),
        fontFamily: FONT,
        fontWeight: 900,
        fontSize: 66,
        lineHeight: 1.15,
        textTransform: "uppercase",
        textShadow: "0 4px 0 rgba(0,0,0,0.8), 0 0 24px rgba(0,0,0,0.9)",
      }}
    >
      {page.tokens.map((tok, i) => {
        const active = ms >= tok.fromMs && ms < tok.toMs + 80;
        const said = ms >= tok.fromMs;
        return (
          <span
            key={i}
            style={{
              color: active ? C.lime : said ? C.white : "rgba(242,247,244,0.55)",
              scale: active ? "1.08" : "1",
              display: "inline-block",
              margin: "0 16px",
            }}
          >
            {tok.text.trim()}
          </span>
        );
      })}
    </div>
  );
};

const Headline: React.FC<{ t: number }> = ({ t }) => {
  let i = 0;
  for (let k = 0; k < BEATS.length; k++) if (t >= BEATS[k].at) i = k;
  const b = BEATS[i];
  const p = appear(t, b.at, 0.4);
  const n = Math.max(b.a.length, b.b.length);
  const fontSize = n > 20 ? 70 : n > 15 ? 82 : 96;
  return (
    <div
      style={{
        position: "absolute",
        left: 70,
        right: 70,
        top: 190,
        fontFamily: FONT,
        fontWeight: 900,
        fontSize,
        lineHeight: 1.02,
        letterSpacing: -2,
        opacity: p,
        transform: `translateY(${(1 - p) * 40}px)`,
      }}
    >
      <div style={{ color: C.white }}>{b.a}</div>
      <div style={{ color: b.color ?? C.lime, textShadow: `0 0 30px ${b.color ?? C.lime}55` }}>
        <Underline
          color={b.color ?? C.lime}
          strokeWidth={6}
          iterations={2}
          seed={i + 3}
          padding={{ top: 4 }}
          progress={interpolate(t, [b.at + 0.25, b.at + 0.85], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          })}
        >
          {b.b}
        </Underline>
      </div>
    </div>
  );
};

const Confetti: React.FC<{ t: number }> = ({ t }) => {
  if (t < T.parabens || t > T.parabens + 3.7) return null;
  const dt = t - T.parabens;
  const colors = [C.lime, C.cyan, C.amber, C.white, C.red];
  return (
    <>
      {Array.from({ length: 90 }).map((_, i) => {
        const vx = (random(`vx${i}`) - 0.5) * 1400;
        const vy = -900 - random(`vy${i}`) * 900;
        const x = 540 + vx * dt;
        const y = 1100 + vy * dt + 1100 * dt * dt;
        const r = random(`r${i}`) * 720 * dt;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: 18,
              height: 30,
              borderRadius: 4,
              background: colors[i % colors.length],
              transform: `rotate(${r}deg)`,
              opacity: 1 - Math.max(0, dt - 2.7),
            }}
          />
        );
      })}
    </>
  );
};

const CTA: React.FC<{ t: number }> = ({ t }) => {
  const o = appear(t, T.cta, 0.4);
  if (o <= 0) return null;
  const row = (from: number, q: string, word: string, color: string) => (
    <div
      style={{
        opacity: appear(t, from, 0.3),
        transform: `scale(${0.8 + 0.2 * pop(t, from)})`,
        borderRadius: 36,
        border: `4px solid ${color}`,
        background: "rgba(6,9,10,0.92)",
        padding: "34px 40px",
        textAlign: "center",
        boxShadow: `0 0 50px ${color}44`,
      }}
    >
      <div style={{ color: C.white, fontSize: 52, fontWeight: 800 }}>{q}</div>
      <div style={{ color, fontSize: 84, fontWeight: 900, letterSpacing: 2 }}>“{word}”</div>
    </div>
  );
  return (
    <div
      style={{
        position: "absolute",
        left: 110,
        right: 110,
        top: 700,
        display: "flex",
        flexDirection: "column",
        gap: 40,
        fontFamily: FONT,
        opacity: o,
      }}
    >
      {row(T.cta, "Já sabia? Comenta", "COZINHEIRO", C.amber)}
      {row(T.cta2, "Não sabia? Comenta", "CHIOU", C.cyan)}
    </div>
  );
};

const LEAKS = [
  { at: T.anel - 0.3, seed: 1, hue: 190 },
  { at: T.papin - 0.3, seed: 2, hue: 40 },
  { at: T.parabens - 0.2, seed: 3, hue: 90 },
];
const LightLeaks: React.FC<{ t: number }> = ({ t }) => {
  const { width, height } = useVideoConfig();
  const leak = LEAKS.find((l) => t >= l.at && t < l.at + 1.2);
  if (!leak) return null;
  return (
    <Solid
      width={width}
      height={height}
      style={{ position: "absolute", inset: 0, mixBlendMode: "screen", opacity: 0.4 }}
      effects={[
        lightLeak({
          seed: leak.seed,
          hueShift: leak.hue,
          progress: interpolate(t, [leak.at, leak.at + 1.2], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }),
      ]}
    />
  );
};

const Flash: React.FC<{ t: number }> = ({ t }) => {
  const hits = [
    { at: T.pula + 0.8, c: C.white },
    { at: T.segundo + 2.0, c: "#FF4D5E" },
  ];
  const h = hits.find((x) => t >= x.at && t < x.at + 0.35);
  if (!h) return null;
  return (
    <AbsoluteFill
      style={{
        background: h.c,
        mixBlendMode: "screen",
        opacity: interpolate(t, [h.at, h.at + 0.35], [0.22, 0], { extrapolateRight: "clamp" }),
      }}
    />
  );
};

const BLUR_WINDOWS: [number, number][] = [
  [T.anel - 0.4, T.anel + 1.0],
  [T.preso - 0.4, T.preso + 1.0],
  [T.furinho - 0.4, T.furinho + 1.0],
  [T.papin - 0.4, T.papin + 1.0],
  [T.parabens - 0.4, T.parabens + 0.8],
];

const CookerLayer: React.FC<{ dimmed: number }> = ({ dimmed }) => {
  const frame = useCurrentFrame();
  return <Cooker t={frame / FPS} dimmed={dimmed} />;
};

const hasNarration = getStaticFiles().some((f) => f.name === "narracao.mp3");

// Duck the music bed under the voice.
const speaking = (t: number) => words.some((w) => t >= w.s - 0.15 && t <= w.e + 0.25);

export const Panela: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const dimmed = appear(t, T.cta, 0.4) * 0.8;

  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 55%, ${C.bg2} 0%, ${C.bg} 70%)` }}>
      {/* grid */}
      <AbsoluteFill
        style={{
          backgroundImage: `linear-gradient(${C.grid} 2px, transparent 2px), linear-gradient(90deg, ${C.grid} 2px, transparent 2px)`,
          backgroundSize: "60px 60px",
          backgroundPosition: `0 ${(t * 12) % 60}px`,
        }}
      />
      <div style={{ position: "absolute", left: 0, top: 440, width: 1080, height: 1150 }}>
        {BLUR_WINDOWS.some(([a, b]) => t >= a && t <= b) ? (
          <CameraMotionBlur samples={6} shutterAngle={200}>
            <CookerLayer dimmed={dimmed} />
          </CameraMotionBlur>
        ) : (
          <Cooker t={t} dimmed={dimmed} />
        )}
      </div>
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, rgba(6,9,10,1) 0%, rgba(6,9,10,0.92) 22%, rgba(6,9,10,0) 32%, rgba(6,9,10,0) 78%, rgba(6,9,10,0.85) 88%, rgba(6,9,10,1) 100%)",
        }}
      />

      {/* header */}
      <div
        style={{
          position: "absolute",
          top: 96,
          left: 70,
          display: "flex",
          alignItems: "center",
          gap: 16,
          fontFamily: FONT,
          fontWeight: 800,
          fontSize: 30,
          letterSpacing: 4,
          color: C.steel,
        }}
      >
        <div style={{ width: 18, height: 18, borderRadius: 9, background: C.lime, boxShadow: `0 0 16px ${C.lime}` }} />
        RAIO-X · PANELA DE PRESSÃO
      </div>
      <Headline t={t} />


      <Confetti t={t} />
      <CTA t={t} />
      <Captions t={t} />

      {/* progress */}
      <div style={{ position: "absolute", left: 0, top: 0, height: 10, width: `${(t / DURATION_S) * 100}%`, background: C.lime }} />

      <LightLeaks t={t} />
      <Flash t={t} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 50%, transparent 55%, rgba(0,0,0,0.55) 100%)" }} />

      {hasNarration ? <Audio name="Narração" src={staticFile("narracao.mp3")} premountFor={FPS} /> : null}
      <Audio
        name="Trilha"
        src={staticFile("sfx/ambient.mp3")}
        premountFor={FPS}
        volume={(f) => {
          const tt = f / FPS;
          const base = speaking(tt) ? 0.07 : 0.16;
          const fadeIn = Math.min(1, tt / 1.0);
          const fadeOut = Math.min(1, Math.max(0, (DURATION_S - tt) / 1.5));
          return base * fadeIn * fadeOut;
        }}
      />
      {SFX.map((s, i) => (
        <Audio
          key={i}
          name={s.src}
          src={staticFile(s.src)}
          from={Math.round(s.at * FPS)}
          durationInFrames={FPS * 4}
          premountFor={FPS}
          volume={s.vol}
        />
      ))}
    </AbsoluteFill>
  );
};

export const Capa: React.FC = () => (
  <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 55%, ${C.bg2} 0%, ${C.bg} 70%)` }}>
    <div style={{ position: "absolute", left: 0, top: 520, opacity: 1 }}>
      <Cooker t={T.graus + 2.0} dimmed={0} />
    </div>
    <AbsoluteFill
      style={{
        background:
          "linear-gradient(180deg, rgba(6,9,10,1) 0%, rgba(6,9,10,0.9) 26%, rgba(6,9,10,0) 40%, rgba(6,9,10,0) 80%, rgba(6,9,10,0.9) 100%)",
      }}
    />
    <div
      style={{
        position: "absolute",
        top: 170,
        left: 70,
        right: 70,
        fontFamily: FONT,
        fontWeight: 900,
        fontSize: 104,
        lineHeight: 0.98,
        letterSpacing: -3,
        color: C.white,
      }}
    >
      Por que ela cozinha
      <div style={{ color: C.lime, textShadow: `0 0 40px ${C.lime}88` }}>na metade do tempo?</div>
    </div>
    <div
      style={{
        position: "absolute",
        bottom: 150,
        left: 0,
        right: 0,
        textAlign: "center",
        fontFamily: FONT,
        fontWeight: 900,
        fontSize: 54,
        color: C.lime,
        letterSpacing: 2,
      }}
    >
      RAIO-X · PANELA DE PRESSÃO
    </div>
  </AbsoluteFill>
);

export const MyComposition = () => {
  return (
    <>
    <Still id="Capa" component={Capa} width={1080} height={1920} />
    <Composition
      id="Panela"
      component={Panela}
      durationInFrames={Math.round(DURATION_S * FPS)}
      fps={FPS}
      width={1080}
      height={1920}
    />
    </>
  );
};

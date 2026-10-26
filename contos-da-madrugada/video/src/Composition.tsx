import React from "react";
import { AbsoluteFill, Composition, Still, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import { loadFont } from "@remotion/fonts";
import { createTikTokStyleCaptions, type Caption } from "@remotion/captions";
import { FPS, H, Word, appear, findAt } from "./lib";
import { SCENES } from "./Scenes";
import { EPISODES, Episode } from "./episodes";

loadFont({ family: "Montserrat", url: staticFile("fonts/montserrat.woff2"), weight: "100 900" });
const FONT = "Montserrat, sans-serif";

/** Strings "@frase" (ou "@frase|+0.5") viram o tempo, em segundos, em que a narração fala a frase. */
const resolve = (v: any, words: Word[]): any => {
  if (typeof v === "string" && v.startsWith("@")) {
    const [phrase, off] = v.slice(1).split("|");
    return findAt(words, phrase) + (off ? parseFloat(off) : 0);
  }
  if (Array.isArray(v)) return v.map((x) => resolve(x, words));
  if (v && typeof v === "object") return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, resolve(x, words)]));
  return v;
};

const prepare = (ep: Episode) => {
  const words = ep.words.filter((w) => !w.t.startsWith("["));
  const scenes = ep.scenes.map((sc) => ({ ...sc, s: resolve(sc.at, words) as number, p: resolve(sc.p ?? {}, words) }));
  const end = words[words.length - 1].e + 1.6;
  const captions: Caption[] = words.map((w, i) => ({
    text: (i === 0 ? "" : " ") + w.t.replace(/[,:]$/, ""),
    startMs: w.s * 1000,
    endMs: w.e * 1000,
    timestampMs: ((w.s + w.e) / 2) * 1000,
    confidence: null,
  }));
  const { pages } = createTikTokStyleCaptions({ captions, combineTokensWithinMilliseconds: 900 });
  const sfx = (ep.sfx ?? []).map((x) => ({ ...x, at: resolve(x.at, words) as number }));
  return { words, scenes, end, pages, sfx };
};

const SCARY = /^(medo|morr|sangue|porta|sozinh|escuro|atr[aá]s|ele|ela|vulto|olhos|grito|madrugada|tr[eê]s|nunca|espera|entra|sumiu|criatura|vermelh|abre)/i;

const Captions: React.FC<{ t: number; pages: ReturnType<typeof prepare>["pages"] }> = ({ t, pages }) => {
  const ms = t * 1000;
  const idx = pages.findIndex((p, i) => {
    const end = pages[i + 1] ? pages[i + 1].startMs : p.startMs + p.durationMs + 600;
    return ms >= p.startMs - 50 && ms < end;
  });
  if (idx < 0) return null;
  const page = pages[idx];
  return (
    <div
      style={{
        position: "absolute",
        left: 60,
        right: 60,
        top: 1620,
        display: "flex",
        justifyContent: "center",
        flexWrap: "wrap",
        fontFamily: FONT,
        fontWeight: 900,
        fontSize: 64,
        lineHeight: 1.15,
        textTransform: "uppercase",
        textShadow: "0 4px 0 rgba(0,0,0,0.8), 0 0 30px rgba(0,0,0,1)",
      }}
    >
      {page.tokens.map((tok, i) => {
        const word = tok.text.trim();
        const active = ms >= tok.fromMs && ms < tok.toMs + 80;
        const said = ms >= tok.fromMs;
        const scary = SCARY.test(word);
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              margin: "0 14px",
              color: active ? (scary ? H.red : H.moon) : said ? H.white : "rgba(243,238,255,0.5)",
              scale: active ? "1.08" : "1",
            }}
          >
            {word}
          </span>
        );
      })}
    </div>
  );
};

const Stage: React.FC<{ t: number; ep: ReturnType<typeof prepare>; dim?: number }> = ({ t, ep, dim = 0 }) => {
  let i = 0;
  for (let k = 0; k < ep.scenes.length; k++) if (t >= ep.scenes[k].s) i = k;
  const cur = ep.scenes[i];
  const next = ep.scenes[i + 1];
  const sEnd = next ? next.s : ep.end;
  const fadeIn = appear(t, cur.s, 0.35);
  const push = 1 + 0.06 * Math.min(1, (t - cur.s) / Math.max(1, sEnd - cur.s));
  const prev = i > 0 ? ep.scenes[i - 1] : null;
  const Cur = SCENES[cur.kind];
  const Prev = prev ? SCENES[prev.kind] : null;
  return (
    <svg viewBox="0 0 1080 1150" width={1080} height={1150} style={{ overflow: "visible" }}>
      <defs>
        {(["R", "M", "P"] as const).map((k) => (
          <filter key={k} id={`glow${k}`} filterUnits="userSpaceOnUse" x="-500" y="-500" width="2200" height="2200">
            <feGaussianBlur stdDeviation={k === "M" ? 14 : 8} result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        ))}
      </defs>
      <g opacity={1 - dim}>
        {Prev && fadeIn < 1 ? (
          <g opacity={1 - fadeIn}>
            <Prev t={t} s={prev!.s} e={cur.s} p={prev!.p} />
          </g>
        ) : null}
        <g opacity={fadeIn} transform={`translate(540 575) scale(${push}) translate(-540 -575)`}>
          <Cur t={t} s={cur.s} e={sEnd} p={cur.p} />
        </g>
      </g>
    </svg>
  );
};

const Title: React.FC<{ t: number; ep: ReturnType<typeof prepare> }> = ({ t, ep }) => {
  let cur: (typeof ep.scenes)[number] | null = null;
  for (const sc of ep.scenes) if (t >= sc.s && sc.title) cur = sc;
  if (!cur || !cur.title) return null;
  const p = appear(t, cur.s, 0.4);
  const jitter = Math.sin(t * 37) * 1.2;
  return (
    <div
      style={{
        position: "absolute",
        left: 70,
        right: 70,
        top: 190,
        fontFamily: FONT,
        fontWeight: 900,
        fontSize: 92,
        lineHeight: 1.02,
        letterSpacing: -2,
        color: H.white,
        opacity: p,
        translate: `${jitter}px ${(1 - p) * 30}px`,
        textShadow: `0 0 40px ${H.red}55`,
      }}
    >
      {cur.title.split("\n").map((l, k) => (
        <div key={k} style={{ color: k === 1 ? H.red : H.white }}>
          {l}
        </div>
      ))}
    </div>
  );
};

export const EpisodeVideo: React.FC<{ id: string }> = ({ id }) => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const ep = prepare(EPISODES[id]);
  const flicker = 0.92 + 0.08 * Math.sin(t * 13) * Math.sin(t * 7.3);
  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 40%, ${H.bg2} 0%, ${H.bg} 70%)` }}>
      <div style={{ position: "absolute", left: 0, top: 440, opacity: flicker }}>
        <Stage t={t} ep={ep} />
      </div>
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, rgba(5,4,12,1) 0%, rgba(5,4,12,0.92) 22%, rgba(5,4,12,0) 32%, rgba(5,4,12,0) 78%, rgba(5,4,12,0.9) 88%, rgba(5,4,12,1) 100%)",
        }}
      />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 50%, transparent 45%, rgba(0,0,0,0.75) 100%)" }} />
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
          color: H.steel,
        }}
      >
        <div style={{ width: 18, height: 18, borderRadius: 9, background: H.red, boxShadow: `0 0 16px ${H.red}` }} />
        CONTOS DA MADRUGADA · {EPISODES[id].tag}
      </div>
      <Title t={t} ep={ep} />
      <Captions t={t} pages={ep.pages} />
      <div style={{ position: "absolute", left: 0, top: 0, height: 10, width: `${(t / ep.end) * 100}%`, background: H.red }} />

      <Audio name="Narração" src={staticFile(EPISODES[id].audio)} premountFor={FPS} />
      <Audio
        name="Ambiente"
        src={staticFile("sfx/drone.mp3")}
        loop
        premountFor={FPS}
        volume={(f) => {
          const tt = f / FPS;
          return 0.22 * Math.min(1, tt / 1.5) * Math.min(1, Math.max(0, (ep.end - tt) / 1.5));
        }}
      />
      {ep.sfx.map((s, i) => (
        <Audio key={i} name={s.src} src={staticFile(s.src)} from={Math.max(0, Math.round(s.at * FPS))} durationInFrames={FPS * 5} premountFor={FPS} volume={s.vol} />
      ))}
    </AbsoluteFill>
  );
};

const Cover: React.FC<{ id: string }> = ({ id }) => {
  const ep = prepare(EPISODES[id]);
  const c = EPISODES[id].cover;
  const t = resolve(c.at, ep.words) as number;
  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 40%, ${H.bg2} 0%, ${H.bg} 70%)` }}>
      <div style={{ position: "absolute", left: 0, top: 520 }}>
        <Stage t={t} ep={ep} />
      </div>
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(5,4,12,1) 0%, rgba(5,4,12,0.9) 28%, rgba(5,4,12,0) 42%, rgba(5,4,12,0) 80%, rgba(5,4,12,0.95) 100%)" }} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 55%, transparent 45%, rgba(0,0,0,0.75) 100%)" }} />
      <div style={{ position: "absolute", top: 180, left: 70, right: 70, fontFamily: FONT, fontWeight: 900, fontSize: 118, lineHeight: 0.98, letterSpacing: -3, color: H.white }}>
        {c.a}
        <div style={{ color: H.red, textShadow: `0 0 40px ${H.red}aa` }}>{c.b}</div>
      </div>
      <div style={{ position: "absolute", bottom: 150, left: 0, right: 0, textAlign: "center", fontFamily: FONT, fontWeight: 900, fontSize: 50, color: H.moon, letterSpacing: 3 }}>
        CONTOS DA MADRUGADA
      </div>
    </AbsoluteFill>
  );
};

export const MyComposition = () => (
  <>
    {Object.keys(EPISODES).map((id) => {
      const ep = prepare(EPISODES[id]);
      return (
        <React.Fragment key={id}>
          <Composition id={`Conto-${id}`} component={EpisodeVideo} defaultProps={{ id }} durationInFrames={Math.round(ep.end * FPS)} fps={FPS} width={1080} height={1920} />
          <Still id={`Capa-${id}`} component={Cover} defaultProps={{ id }} width={1080} height={1920} />
        </React.Fragment>
      );
    })}
  </>
);

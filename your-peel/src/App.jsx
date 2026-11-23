import React, { useEffect, useRef, useState } from 'react';
import { createTee } from './Tee.js';

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));

// Asterisco em SVG (seis braços)
function Asterisk({ className = '', color = 'currentColor' }) {
  return (
    <svg className={className} viewBox="0 0 100 100" aria-hidden="true">
      <g fill={color}>
        {[0, 60, 120].map((deg) => (
          <rect key={deg} x="44" y="2" width="12" height="96" rx="6" transform={`rotate(${deg} 50 50)`} />
        ))}
      </g>
    </svg>
  );
}

// Preloader: o progresso vem de eventos reais (fontes, cena 3D, página carregada)
function Preloader({ progress, done }) {
  return (
    <div className={`preloader ${done ? 'is-done' : ''}`} aria-live="polite" role="status">
      <div className="preloader-spin">
        <Asterisk className="pre-big" color="#101010" />
        <Asterisk className="pre-small" color="#FFFFFF" />
      </div>
      <div className="pre-count">{String(Math.round(progress)).padStart(3, '0')}</div>
    </div>
  );
}

function SplitWords({ text, className = '' }) {
  let i = 0;
  return (
    <span className={className} aria-label={text}>
      {text.split(' ').map((word, w) => (
        <span className="word" key={w} aria-hidden="true">
          {[...word].map((ch) => {
            const idx = i++;
            return (
              <span className="letter" key={idx} style={{ '--i': idx }}>
                {ch}
              </span>
            );
          })}
          <span className="space">&nbsp;</span>
        </span>
      ))}
    </span>
  );
}

function MagneticButton({ children, href = '#colecao' }) {
  const ref = useRef(null);
  const onMove = (e) => {
    const el = ref.current;
    const r = el.getBoundingClientRect();
    const x = e.clientX - (r.left + r.width / 2);
    const y = e.clientY - (r.top + r.height / 2);
    el.style.transform = `translate(${x * 0.3}px, ${y * 0.35}px)`;
  };
  const onLeave = () => {
    ref.current.style.transform = 'translate(0,0)';
  };
  return (
    <a ref={ref} className="magnetic" href={href} onPointerMove={onMove} onPointerLeave={onLeave}>
      {children}
    </a>
  );
}

export default function App() {
  const [progress, setProgress] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const heroCanvas = useRef(null);
  const limeRef = useRef(null);
  const demo = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('demo') === '1';

  // Progresso real: 30% fonte, 30% cena 3D, 40% página completa
  useEffect(() => {
    let fonts = false;
    let tee = false;
    let page = document.readyState === 'complete';
    const update = () => {
      const p = (fonts ? 30 : 0) + (tee ? 30 : 0) + (page ? 40 : 0);
      setProgress(p);
    };
    const onFonts = () => { fonts = true; update(); };
    const onPage = () => { page = true; update(); };
    document.fonts?.ready.then(onFonts) ?? onFonts();
    if (!page) window.addEventListener('load', onPage, { once: true });
    update();

    const viewer = createTee(heroCanvas.current, {
      onReady: () => { tee = true; update(); },
    });
    return () => viewer.dispose();
  }, []);

  useEffect(() => {
    if (progress >= 100) {
      const t = setTimeout(() => setLoaded(true), 400);
      return () => clearTimeout(t);
    }
  }, [progress]);

  // Scroll: escreve variáveis CSS em :root (o CSS faz o resto)
  useEffect(() => {
    const root = document.documentElement;
    let raf = 0;
    const tick = () => {
      const vh = window.innerHeight;
      const ph = clamp(window.scrollY / vh);
      const r = limeRef.current?.getBoundingClientRect();
      const pl = r ? clamp((vh - r.top) / (vh * 0.9)) : 0;
      const pt = r ? clamp((vh * 0.55 - r.top) / (vh * 0.55)) : 0;
      root.style.setProperty('--ph', ph.toFixed(4));
      root.style.setProperty('--pl', pl.toFixed(4));
      root.style.setProperty('--pt', pt.toFixed(4));
      raf = 0;
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(tick); };
    tick();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  // Modo demo (?demo=1): rolagem roteirizada para gravação
  useEffect(() => {
    if (!demo || !loaded) return;
    const start = performance.now();
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const dur = 22000;
    let raf;
    const run = (now) => {
      const k = clamp((now - start) / dur);
      const eased = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
      window.scrollTo(0, eased * max);
      if (k < 1) raf = requestAnimationFrame(run);
    };
    const t = setTimeout(() => { raf = requestAnimationFrame(run); }, 1200);
    return () => { clearTimeout(t); cancelAnimationFrame(raf); };
  }, [demo, loaded]);

  return (
    <>
      <Preloader progress={progress} done={loaded} />

      <header className="site-header">
        <a className="logo" href="#top" aria-label="Your*peel, início">
          Your<span className="star">*</span>peel
        </a>
        <nav aria-label="Principal">
          <a href="#colecao">Coleção</a>
          <a href="#sobre">Sobre</a>
          <a href="#contato">Contato</a>
        </nav>
        <span className="drop">1st Collection</span>
      </header>

      <main id="top">
        <section className="hero" data-enter>
          <div className="hero-sheet">
            <div className="hero-copy">
              <p className="kicker">Camiseta oversized · Preto</p>
              <h1>Black peel</h1>
              <p className="lede">
                Caimento pesado, ombro caído e print em couro. Arrasta a camiseta para girar o tecido.
              </p>
              <div className="hero-actions">
                <MagneticButton>Full collection</MagneticButton>
              </div>
            </div>
            <div className="hero-asterisk" aria-hidden="true">
              <Asterisk className="hero-star" color="#A0B527" />
            </div>
            <div className="tee-stage" ref={heroCanvas} aria-label="Camiseta Black peel em 3D, arraste para girar" />
            <p className="scroll-hint">Role para abrir</p>
          </div>
        </section>

        <section className="lime-wrap" ref={limeRef} id="colecao">
          <div className="lime-box">
            <div className="tape tape-a">
              <SplitWords className="tape-text" text="We Craft" />
            </div>
            <div className="tape tape-b">
              <SplitWords className="tape-text" text="human peel" />
            </div>
            <div className="lime-foot">
              <Asterisk className="foot-star" color="#101010" />
              <p>Feito em lotes pequenos. Cada peça sai com uma costura a mais do que precisa.</p>
              <MagneticButton>Full collection</MagneticButton>
            </div>
          </div>
        </section>

        <section className="walk" id="sobre" aria-label="Versão branca">
          <div className="walk-track">
            <svg className="walk-tee" viewBox="0 0 200 200" aria-hidden="true">
              <path
                d="M70 20 L40 40 L8 70 L30 100 L50 84 L50 180 L150 180 L150 84 L170 100 L192 70 L160 40 L130 20 Q100 36 70 20 Z"
                fill="#FFFFFF"
                stroke="#101010"
                strokeWidth="2"
              />
            </svg>
            <p className="walk-line">White peel: a mesma peça, outra cor.</p>
          </div>
        </section>

        <footer className="site-footer" id="contato">
          <div>
            <strong>Your*peel</strong>
            <span>1st Collection 2024©</span>
          </div>
          <a href="mailto:contato@example.com">contato@example.com</a>
        </footer>
      </main>
    </>
  );
}

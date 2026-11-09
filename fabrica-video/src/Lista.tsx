import {
  AbsoluteFill,
  CalculateMetadataFunction,
  Composition,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

// Roteiro: tudo que muda de um vídeo para outro. Vem do JSON em roteiros/.
type Item = {
  readonly titulo: string;
  readonly sub: string;
};

type Props = {
  readonly gancho: string;
  readonly titulo: string;
  readonly itens: readonly Item[];
  readonly cta: string;
  readonly marca: string;
  readonly cor: string;
};

const FPS = 30;
const GANCHO = 75; // 2,5 s
const TITULO = 24; // título entra antes dos itens
const POR_ITEM = 45; // 1,5 s por item
const PAUSA = 45; // lista completa na tela
const CTA = 90; // 3 s

const duracao = (itens: number) =>
  GANCHO + TITULO + itens * POR_ITEM + PAUSA + CTA;

const calculateMetadata: CalculateMetadataFunction<Props> = ({ props }) => ({
  durationInFrames: duracao(props.itens.length),
});

const FUNDO = "#05050c";
const CARD = "#14141f";
const BORDA = "#2c2c3d";
const TEXTO = "#f4f4f8";
const APAGADO = "#9a9aae";
const SANS = "'Inter', 'Helvetica Neue', Arial, sans-serif";
const MONO = "'JetBrains Mono', 'DejaVu Sans Mono', monospace";

// Cena 1: gancho em tipografia cinética, palavra por palavra.
const Gancho: React.FC<{ texto: string; cor: string }> = ({ texto, cor }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const palavras = texto.split(" ");
  const saida = interpolate(frame, [GANCHO - 12, GANCHO], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        padding: "0 90px",
        opacity: saida,
        transform: `scale(${1 + (1 - saida) * 0.08})`,
      }}
    >
      <div
        style={{
          fontFamily: SANS,
          fontWeight: 900,
          fontSize: 118,
          lineHeight: 1.02,
          letterSpacing: -4,
          color: TEXTO,
        }}
      >
        {palavras.map((p, i) => {
          const s = spring({ frame: frame - i * 4, fps, config: { damping: 14 } });
          const destaque = i === palavras.length - 1;
          return (
            <span
              key={i}
              style={{
                display: "inline-block",
                marginRight: 28,
                opacity: s,
                transform: `translateY(${(1 - s) * 60}px)`,
                color: destaque ? cor : TEXTO,
              }}
            >
              {p}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// Cena 2: título e cards numerados entrando um a um (estilo "Recapitulando").
const ListaCena: React.FC<{ titulo: string; itens: readonly Item[]; cor: string }> = ({
  titulo,
  itens,
  cor,
}) => {
  const frame = useCurrentFrame() - GANCHO;
  const { fps } = useVideoConfig();
  const fimLista = TITULO + itens.length * POR_ITEM + PAUSA;
  const tituloIn = spring({ frame, fps, config: { damping: 16 } });
  const saida = interpolate(frame, [fimLista - 10, fimLista], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  // Câmera: zoom lento durante toda a lista.
  const zoom = interpolate(frame, [0, fimLista], [1, 1.05], {
    extrapolateRight: "clamp",
  });
  const ativo = Math.min(
    itens.length - 1,
    Math.floor((frame - TITULO) / POR_ITEM),
  );
  const altura = Math.min(260, Math.floor(1150 / Math.max(itens.length, 1)) - 28);

  return (
    <AbsoluteFill
      style={{
        padding: "220px 60px 0",
        opacity: saida,
        transform: `scale(${zoom})`,
      }}
    >
      <div
        style={{
          fontFamily: SANS,
          fontWeight: 900,
          fontSize: 112,
          letterSpacing: -4,
          color: TEXTO,
          marginBottom: 40,
          opacity: tituloIn,
          transform: `translateX(${(1 - tituloIn) * -80}px)`,
        }}
      >
        {titulo}
      </div>
      {itens.map((item, i) => {
        const s = spring({
          frame: frame - TITULO - i * POR_ITEM,
          fps,
          config: { damping: 15 },
        });
        const eAtivo = i === ativo && frame < TITULO + itens.length * POR_ITEM;
        return (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 50,
              height: altura,
              marginBottom: 28,
              padding: "0 44px",
              borderRadius: 22,
              background: CARD,
              border: `3px solid ${eAtivo ? cor : BORDA}`,
              boxShadow: eAtivo ? `0 0 40px ${cor}55` : "none",
              opacity: s,
              transform: `translateY(${(1 - s) * 120}px) scale(${0.92 + s * 0.08})`,
            }}
          >
            <div
              style={{
                fontFamily: SANS,
                fontWeight: 900,
                fontSize: Math.min(130, altura * 0.6),
                letterSpacing: -6,
                color: cor,
                minWidth: 170,
              }}
            >
              {String(i + 1).padStart(2, "0")}
            </div>
            <div>
              <div
                style={{
                  fontFamily: SANS,
                  fontWeight: 800,
                  fontSize: 56,
                  letterSpacing: -1.5,
                  color: TEXTO,
                  lineHeight: 1.1,
                }}
              >
                {item.titulo}
              </div>
              <div
                style={{
                  fontFamily: MONO,
                  fontSize: 40,
                  color: APAGADO,
                  marginTop: 14,
                  letterSpacing: 2,
                }}
              >
                {item.sub}
              </div>
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// Cena 3: círculo vira card com a chamada final (transição entre formas).
const Cta: React.FC<{ texto: string; marca: string; cor: string; inicio: number }> = ({
  texto,
  marca,
  cor,
  inicio,
}) => {
  const frame = useCurrentFrame() - inicio;
  const { fps } = useVideoConfig();
  const morph = interpolate(frame, [0, 24], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.65, 0, 0.35, 1),
  });
  const textoIn = spring({ frame: frame - 18, fps, config: { damping: 14 } });
  const largura = interpolate(morph, [0, 1], [140, 900]);
  const alturaCard = interpolate(morph, [0, 1], [140, 520]);
  const raio = interpolate(morph, [0, 1], [70, 36]);
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      <div
        style={{
          width: largura,
          height: alturaCard,
          borderRadius: raio,
          background: cor,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: 60,
          textAlign: "center",
          transform: `rotate(${(1 - morph) * -90}deg)`,
        }}
      >
        <div
          style={{
            fontFamily: SANS,
            fontWeight: 900,
            fontSize: 84,
            lineHeight: 1.05,
            letterSpacing: -3,
            color: "#ffffff",
            opacity: textoIn,
            transform: `translateY(${(1 - textoIn) * 40}px)`,
          }}
        >
          {texto}
        </div>
        <div
          style={{
            fontFamily: MONO,
            fontSize: 44,
            color: "#ffffffcc",
            marginTop: 30,
            opacity: textoIn,
          }}
        >
          {marca}
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const Lista: React.FC<Props> = ({ gancho, titulo, itens, cta, marca, cor }) => {
  const frame = useCurrentFrame();
  const inicioLista = GANCHO;
  const inicioCta = GANCHO + TITULO + itens.length * POR_ITEM + PAUSA;
  return (
    <AbsoluteFill style={{ background: FUNDO }}>
      {frame < inicioLista ? <Gancho texto={gancho} cor={cor} /> : null}
      {frame >= inicioLista && frame < inicioCta ? (
        <ListaCena titulo={titulo} itens={itens} cor={cor} />
      ) : null}
      {frame >= inicioCta ? (
        <Cta texto={cta} marca={marca} cor={cor} inicio={inicioCta} />
      ) : null}
    </AbsoluteFill>
  );
};

export const ListaComposition = () => {
  return (
    <Composition
      id="Lista"
      component={Lista}
      durationInFrames={duracao(4)}
      fps={FPS}
      width={1080}
      height={1920}
      calculateMetadata={calculateMetadata}
      defaultProps={{
        gancho: "Seu site está perdendo clientes.",
        titulo: "Recapitulando.",
        itens: [
          { titulo: "Abre rápido no celular", sub: "fotos leves · WebP" },
          { titulo: "Botão do WhatsApp", sub: "1 toque · sem formulário" },
          { titulo: "Aparece no Google", sub: "título · descrição · mapa" },
          { titulo: "Fotos reais da loja", sub: "nada de banco de imagem" },
        ],
        cta: "Quer um site assim?",
        marca: "BN Digital",
        cor: "#8b6cff",
      }}
    />
  );
};

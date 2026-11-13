import { useEffect, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import {
  Bike,
  CakeSlice,
  Car,
  Clock,
  Croissant,
  CupSoda,
  Dumbbell,
  HeartPulse,
  IceCreamCone,
  MapPin,
  MessageCircle,
  PawPrint,
  Pizza,
  Scissors,
  Smile,
  Sparkles,
  Star,
  Store,
  Utensils,
  Wrench,
  X,
  type LucideIcon,
} from "lucide-react";
import { cidadeDe, fmtInt, type Lead } from "./leads";

// Prévia de como ficaria o site da loja, para o Brenno mostrar no celular ou mandar print.
// Só usa o que é verdade (nome, ramo, cidade, nota do Google); o resto aparece como espaço
// para as fotos, os produtos e os preços da própria loja. Cores e fontes seguem
// .claude/skills/site-bn-digital/references/ramos.md.

interface Tema {
  fundo: string;
  texto: string;
  suave: string;
  cartao: string;
  destaque: string;
  noDestaque: string;
  fonte: string;
  maiusculo?: boolean;
  chamada: string;
  botao: string;
  secao: string;
  itens: [string, LucideIcon][];
}

const FONTE_TEXTO = `"Roboto", system-ui, sans-serif`;

const TEMAS: [RegExp, Tema][] = [
  [/barb/i, {
    fundo: "#111111", texto: "#efe9e1", suave: "#efe9e1a6", cartao: "#1c1a18", destaque: "#c9a24a", noDestaque: "#111111",
    fonte: `"Oswald", sans-serif`, maiusculo: true,
    chamada: "Corte marcado sem fila. Escolha o horário e confirme pelo WhatsApp.",
    botao: "Agendar no WhatsApp", secao: "Serviços",
    itens: [["Corte", Scissors], ["Barba", Sparkles], ["Corte e barba", Scissors]],
  }],
  [/sal[aã]o|beleza|est[eé]tic|unha|nail|manicure|studio|massot|sobrancel|cabel/i, {
    fundo: "#f3e3dc", texto: "#2b2b2b", suave: "#2b2b2ba6", cartao: "#fbf3ef", destaque: "#a8645a", noDestaque: "#ffffff",
    fonte: `"Cormorant Garamond", serif`,
    chamada: "Seu horário com calma e cuidado. Veja os serviços e marque pelo WhatsApp.",
    botao: "Marcar horário", secao: "Serviços",
    itens: [["Cabelo", Scissors], ["Unhas", Sparkles], ["Estética", HeartPulse]],
  }],
  [/academ|gym|fitness|treino|crossfit|luta|jiu/i, {
    fundo: "#0d0d0d", texto: "#fafafa", suave: "#fafafaa6", cartao: "#181818", destaque: "#3b78f0", noDestaque: "#ffffff",
    fonte: `"Archivo Black", sans-serif`, maiusculo: true,
    chamada: "Treine perto de casa. Veja os planos e agende sua aula experimental.",
    botao: "Quero uma aula experimental", secao: "Modalidades",
    itens: [["Musculação", Dumbbell], ["Planos", HeartPulse], ["Aula experimental", Sparkles]],
  }],
  [/a[cç]a[ií]|sorvet/i, {
    fundo: "#4a1a5c", texto: "#fff7ec", suave: "#fff7eca6", cartao: "#5b2670", destaque: "#ffd23f", noDestaque: "#2b0e36",
    fonte: `"Bricolage Grotesque", sans-serif`,
    chamada: "Monte o seu do jeito que gosta e peça pelo WhatsApp.",
    botao: "Pedir no WhatsApp", secao: "Mais pedidos",
    itens: [["Açaí no copo", IceCreamCone], ["Adicionais", Sparkles], ["Bebidas", CupSoda]],
  }],
  [/pizz/i, {
    fundo: "#1d1a17", texto: "#f6e7cf", suave: "#f6e7cfa6", cartao: "#2a2521", destaque: "#d24a3a", noDestaque: "#ffffff",
    fonte: `"Fraunces", serif`,
    chamada: "Escolha o sabor no cardápio e peça pelo WhatsApp.",
    botao: "Pedir no WhatsApp", secao: "Cardápio",
    itens: [["Pizzas salgadas", Pizza], ["Pizzas doces", CakeSlice], ["Bebidas", CupSoda]],
  }],
  [/hamb|burg|lanch|smash|dog/i, {
    fundo: "#121212", texto: "#e9dcc4", suave: "#e9dcc4a6", cartao: "#1d1d1d", destaque: "#f4b400", noDestaque: "#121212",
    fonte: `"Anton", sans-serif`, maiusculo: true,
    chamada: "Escolha no cardápio, peça pelo WhatsApp e receba em casa.",
    botao: "Pedir no WhatsApp", secao: "Cardápio",
    itens: [["Lanches", Utensils], ["Combos", Bike], ["Bebidas", CupSoda]],
  }],
  [/padar|confeit|latic|leiteria|caf[eé]|doce|bolo/i, {
    fundo: "#f7efe3", texto: "#2e1b10", suave: "#2e1b10a6", cartao: "#fffaf2", destaque: "#9a5b1f", noDestaque: "#ffffff",
    fonte: `"Fraunces", serif`,
    chamada: "Pão quentinho e encomendas pelo WhatsApp.",
    botao: "Encomendar no WhatsApp", secao: "Mais pedidos",
    itens: [["Pães", Croissant], ["Doces e bolos", CakeSlice], ["Encomendas", Store]],
  }],
  [/restaur|churras|grill|cozinha|comida|marmit/i, {
    fundo: "#1d1a17", texto: "#f6e7cf", suave: "#f6e7cfa6", cartao: "#2a2521", destaque: "#e0a24a", noDestaque: "#1d1a17",
    fonte: `"Fraunces", serif`,
    chamada: "Veja o cardápio do dia e peça pelo WhatsApp.",
    botao: "Pedir no WhatsApp", secao: "Cardápio",
    itens: [["Pratos do dia", Utensils], ["Porções", Utensils], ["Bebidas", CupSoda]],
  }],
  [/pet|veterin|ra[cç][oõ]es/i, {
    fundo: "#f4f7f2", texto: "#1f3b2c", suave: "#1f3b2ca6", cartao: "#ffffff", destaque: "#2f7d52", noDestaque: "#ffffff",
    fonte: `"Bricolage Grotesque", sans-serif`,
    chamada: "Cuidado para o seu bichinho. Marque pelo WhatsApp.",
    botao: "Agendar no WhatsApp", secao: "Serviços",
    itens: [["Banho e tosa", PawPrint], ["Consultas", HeartPulse], ["Rações", Store]],
  }],
  [/oficina|mec[aâ]nic|auto|diesel|motor|lanterna|radiador|pneu|refrigera/i, {
    fundo: "#16181b", texto: "#f1f1ee", suave: "#f1f1eea6", cartao: "#202328", destaque: "#f28c28", noDestaque: "#16181b",
    fonte: `"Archivo Black", sans-serif`, maiusculo: true,
    chamada: "Mande a placa e o problema do carro. A gente responde pelo WhatsApp.",
    botao: "Pedir orçamento", secao: "Serviços",
    itens: [["Revisão", Wrench], ["Diagnóstico", Car], ["Orçamento", MessageCircle]],
  }],
  [/dent|odonto|cl[ií]nica|sa[uú]de/i, {
    fundo: "#f2f7f8", texto: "#12343b", suave: "#12343ba6", cartao: "#ffffff", destaque: "#1f7f74", noDestaque: "#ffffff",
    fonte: `"Fraunces", serif`,
    chamada: "Marque sua consulta pelo WhatsApp, sem ficar esperando ligação.",
    botao: "Marcar consulta", secao: "Atendimentos",
    itens: [["Consulta", Smile], ["Tratamentos", HeartPulse], ["Retorno", Clock]],
  }],
];

const GERAL: Tema = {
  fundo: "#fbf7ef", texto: "#1f2a2e", suave: "#1f2a2ea6", cartao: "#ffffff", destaque: "#2457f5", noDestaque: "#ffffff",
  fonte: `"Bricolage Grotesque", sans-serif`,
  chamada: "Veja o que a gente faz e fale direto pelo WhatsApp.",
  botao: "Falar no WhatsApp", secao: "O que a gente faz",
  itens: [["Produtos", Store], ["Serviços", Sparkles], ["Atendimento", MessageCircle]],
};

export const temaDe = (lead: Lead) => TEMAS.find(([padrao]) => padrao.test(`${lead.tipo ?? ""} ${lead.nome}`))?.[1] ?? GERAL;

const nota = (n: number) => n.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

/** Tela cheia com a prévia do site; fecha no X ou no Esc. */
export function Demonstracao({ lead, onFechar }: { lead: Lead; onFechar: () => void }) {
  const t = temaDe(lead);
  const fechar = useRef<HTMLButtonElement>(null);
  const [aviso, setAviso] = useState("");
  useEffect(() => {
    fechar.current?.focus();
    const tecla = (e: KeyboardEvent) => e.key === "Escape" && onFechar();
    window.addEventListener("keydown", tecla);
    return () => window.removeEventListener("keydown", tecla);
  }, [onFechar]);
  useEffect(() => {
    if (!aviso) return;
    const timer = window.setTimeout(() => setAviso(""), 2400);
    return () => window.clearTimeout(timer);
  }, [aviso]);

  const cidade = cidadeDe(lead);
  const ramo = lead.tipo?.trim() || "Comércio";
  const titulo: CSSProperties = { fontFamily: t.fonte, textTransform: t.maiusculo ? "uppercase" : undefined };
  const demo = (oque: string) => () => setAviso(`No site de verdade, ${oque}`);
  const botao = "inline-flex min-h-[48px] cursor-pointer items-center justify-center gap-2 rounded-full px-5 text-[15px] font-semibold";
  const temNota = typeof lead.nota === "number" && lead.nota > 0;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Demonstração do site de ${lead.nome}`}
      className="fixed inset-0 z-[80] flex flex-col bg-[var(--blk-scrim)] backdrop-blur-sm"
    >
      <div className="flex shrink-0 items-center gap-3 border-b border-[color:var(--bjork-border)] bg-[var(--bjork-panel)] px-4 py-2.5 text-[color:var(--bjork-text)]">
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13.5px] font-semibold">Prévia do site: {lead.nome}</p>
          <p className="truncate text-[12px] text-[color:var(--bjork-text-muted)]">
            Mostre no celular ou tire um print e mande no WhatsApp
          </p>
        </div>
        <button
          ref={fechar}
          type="button"
          onClick={onFechar}
          aria-label="Fechar demonstração"
          className="grid size-10 shrink-0 cursor-pointer place-items-center rounded-full bg-[var(--bjork-surface-active)] focus-visible:ring-2 focus-visible:ring-[color:var(--bjork-accent)]"
        >
          <X aria-hidden="true" className="size-5" />
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <article
          className="relative mx-auto min-h-full w-full max-w-[460px] shadow-[0_0_60px_rgba(0,0,0,.45)]"
          style={{ background: t.fundo, color: t.texto, fontFamily: FONTE_TEXTO }}
        >
          <header className="flex items-center justify-between px-5 pb-2 pt-4 text-[13px]" style={{ color: t.suave }}>
            <span className="truncate font-semibold" style={{ ...titulo, color: t.texto }}>{lead.nome}</span>
            <span className="shrink-0">{cidade}</span>
          </header>

          <section className="px-5 pb-8 pt-10">
            <p className="text-[13px] font-medium" style={{ color: t.destaque }}>
              {ramo} em {cidade}
            </p>
            <h1 className="mt-2 text-[40px] leading-[1.02] [overflow-wrap:anywhere]" style={titulo}>
              {lead.nome}
            </h1>
            <p className="mt-4 max-w-[34ch] text-[16px] leading-relaxed" style={{ color: t.suave }}>
              {t.chamada}
            </p>
            <button
              type="button"
              onClick={demo(`este botão abre a conversa com a ${lead.nome} no WhatsApp.`)}
              className={`${botao} mt-6 w-full`}
              style={{ background: t.destaque, color: t.noDestaque }}
            >
              <MessageCircle aria-hidden="true" className="size-5" />
              {t.botao}
            </button>
            <div
              className="mt-5 flex items-center gap-3 rounded-[16px] px-4 py-3"
              style={{ background: t.cartao }}
            >
              <span className="flex gap-0.5" aria-hidden="true">
                {[0, 1, 2, 3, 4].map((i) => (
                  <Star key={i} className="size-4" fill={t.destaque} stroke="none" />
                ))}
              </span>
              <span className="text-[14px]">
                {temNota
                  ? `${nota(lead.nota!)} no Google${lead.avaliacoes ? ` · ${fmtInt(lead.avaliacoes)} avaliações` : ""}`
                  : "Avaliações do Google aparecem aqui"}
              </span>
            </div>
          </section>

          <section className="px-5 pb-8">
            <h2 className="text-[24px]" style={titulo}>{t.secao}</h2>
            <p className="mt-1 text-[13px]" style={{ color: t.suave }}>
              Aqui entram as fotos e os preços de vocês.
            </p>
            <ul className="mt-4 grid gap-3">
              {t.itens.map(([nome, Icone]) => (
                <li key={nome} className="flex items-center gap-4 rounded-[18px] p-3" style={{ background: t.cartao }}>
                  <span
                    aria-hidden="true"
                    className="grid size-16 shrink-0 place-items-center rounded-[14px]"
                    style={{ background: `color-mix(in srgb, ${t.destaque} 18%, ${t.cartao})`, color: t.destaque }}
                  >
                    <Icone className="size-7" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[16px] font-semibold">{nome}</span>
                    <span className="block text-[13px]" style={{ color: t.suave }}>Consulte pelo WhatsApp</span>
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section className="mx-5 mb-8 rounded-[20px] p-5" style={{ background: t.destaque, color: t.noDestaque }}>
            <h2 className="text-[22px] leading-tight" style={titulo}>Já veio aqui? Avalie no Google</h2>
            <p className="mt-2 text-[14px] leading-relaxed opacity-85">
              No balcão tem a plaquinha: encoste o celular e deixe sua nota em 10 segundos.
            </p>
          </section>

          <section className="px-5 pb-10">
            <h2 className="text-[24px]" style={titulo}>Onde fica</h2>
            <div className="mt-4 grid gap-3 rounded-[18px] p-4 text-[14px]" style={{ background: t.cartao }}>
              <p className="flex items-center gap-2.5">
                <MapPin aria-hidden="true" className="size-4 shrink-0" style={{ color: t.destaque }} />
                {cidade}
              </p>
              <p className="flex items-center gap-2.5" style={{ color: t.suave }}>
                <Clock aria-hidden="true" className="size-4 shrink-0" style={{ color: t.destaque }} />
                Os horários de vocês aparecem aqui
              </p>
              <button
                type="button"
                onClick={demo("este botão mostra a rota até a loja no Google Maps.")}
                className={`${botao} mt-1 border`}
                style={{ borderColor: t.destaque, color: t.texto }}
              >
                Abrir no Google Maps
              </button>
            </div>
          </section>

          <footer className="px-5 pb-24 text-center text-[12px]" style={{ color: t.suave }}>
            Site feito por BN Digital
          </footer>

          <button
            type="button"
            onClick={demo(`este botão flutuante abre o WhatsApp da ${lead.nome}.`)}
            aria-label="Botão do WhatsApp"
            className="sticky bottom-4 left-full mr-4 grid size-14 cursor-pointer place-items-center rounded-full shadow-[0_10px_24px_rgba(0,0,0,.35)]"
            style={{ background: "#25d366", color: "#ffffff" }}
          >
            <MessageCircle aria-hidden="true" className="size-7" />
          </button>
        </article>
      </div>

      {aviso && (
        <p
          role="status"
          className="absolute bottom-6 left-1/2 max-w-[88%] -translate-x-1/2 rounded-[12px] border border-[color:var(--bjork-border-strong)] bg-[var(--bjork-menu)] px-4 py-2.5 text-center text-[13.5px] font-medium text-[color:var(--bjork-text)] shadow-[var(--bjork-shadow-menu)]"
        >
          {aviso}
        </p>
      )}
    </div>,
    document.body,
  );
}

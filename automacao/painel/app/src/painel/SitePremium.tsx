import type { CSSProperties } from "react";
import { ArrowRight, Clock, Instagram, Leaf, MapPin, Menu, MessageCircle, ShieldCheck, Star, type LucideIcon } from "lucide-react";
import { enderecoCurto, fmtInt, type Lead, type RamoId, type Subnicho } from "./leads";
import type { Tema } from "./Demonstracao";

// Prévia no nível de site profissional (referências do Brenno: "Tasty Bites" para comida e a loja de
// cosméticos do vídeo de 20/11 para varejo). Três famílias com a mesma espinha:
// aviso no topo, cabeçalho, capa grande, vitrine de cartões com foto, faixa escura com chamada,
// sobre com foto em moldura, nota do Google e rodapé escuro. Nada de preço, depoimento ou número inventado.

export type Familia = "comida" | "loja" | "servico";

const COMIDA: RamoId[] = ["acai", "pizzaria", "hamburgueria", "padaria", "restaurante"];
const LOJA: RamoId[] = ["moda", "papelaria", "otica", "construcao", "mercado", "farmacia", "geral"];
const SUB_LOJA = ["racao", "aquario", "agro", "moveis", "floricultura"];

export function familiaDe(ramo: RamoId, sub: Subnicho | null): Familia {
  if (COMIDA.includes(ramo)) return "comida";
  if (sub && SUB_LOJA.includes(sub.id)) return "loja";
  if (sub?.id === "pousada") return "servico";
  return LOJA.includes(ramo) ? "loja" : "servico";
}

const ROTULOS: Record<Familia, { aviso: string; nav: string[]; olho: string; titulo: string; texto: string; botaoCartao: string; ver: string; selo: string }> = {
  comida: {
    aviso: "Pedidos pelo WhatsApp", nav: ["Início", "Cardápio", "Sobre", "Contato"],
    olho: "Mais pedidos", titulo: "Direto do nosso cardápio", texto: "Os queridinhos da casa, feitos na hora.",
    botaoCartao: "Pedir", ver: "Ver cardápio", selo: "Mais pedido",
  },
  loja: {
    aviso: "Atendimento e pedidos pelo WhatsApp", nav: ["Início", "Novidades", "Produtos", "Sobre"],
    olho: "Novidades", titulo: "Escolhidos pra você", texto: "Os produtos que mais saem, com foto e tudo.",
    botaoCartao: "Quero", ver: "Ver produtos", selo: "Novidade",
  },
  servico: {
    aviso: "Atendimento pelo WhatsApp", nav: ["Início", "Serviços", "Sobre", "Contato"],
    olho: "Serviços", titulo: "O que a gente faz", texto: "Escolha o serviço e fale direto com a gente.",
    botaoCartao: "Quero", ver: "Ver serviços", selo: "Mais procurado",
  },
};

export const ESCRITA: Record<Familia, string> = { comida: "Kaushan Script", loja: "Yellowtail", servico: "Yellowtail" };

export function PaginaPremium({
  lead, t, familia, capa, onCapaErro, ramoNome, cidade, demo,
}: {
  lead: Lead;
  t: Tema;
  familia: Familia;
  capa: string;
  onCapaErro: () => void;
  ramoNome: string;
  cidade: string;
  demo: (oque: string) => () => void;
}) {
  const r = ROTULOS[familia];
  const escrita: CSSProperties = { fontFamily: `"${ESCRITA[familia]}", cursive`, fontWeight: 400 };
  const display: CSSProperties = { fontFamily: t.fonte, textTransform: t.maiusculo ? "uppercase" : undefined };
  const escuroTopo = familia !== "loja" || !!t.capa || !!t.escuro;
  const base = t.capa ?? (t.escuro ? t.fundo : "#16120f");
  const acento = t.noCapa ?? t.destaque;
  const temNota = typeof lead.nota === "number" && lead.nota > 0;
  const nota = temNota ? lead.nota!.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 }) : "";
  const fundoVitrine = t.escuro ? t.fundo : `color-mix(in srgb, ${t.mancha} 30%, ${t.fundo})`;
  const tinta = t.tinta;
  const pill = "inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full px-5 text-[14px] font-semibold";
  const abreZap = demo(`este botão abre a conversa com a ${lead.nome} no WhatsApp.`);
  const confianca: [LucideIcon, string][] = [
    [familia === "comida" ? Leaf : Clock, familia === "comida" ? "Feito na hora" : "Resposta rápida"],
    [MessageCircle, "Pedido no WhatsApp"],
    [temNota ? Star : MapPin, temNota ? `${nota} no Google` : `Em ${cidade}`],
  ];
  const cartoes = t.servicos.slice(0, 4).map(([nome, linha], i) => ({ nome, linha, foto: `img/demo/${t.foto}-${[3, 4, 2, 1][i]}.webp` }));
  const endereco = lead.endereco ? enderecoCurto(lead) : "";
  const iniciais = lead.nome.replace(/[^\p{L}\p{N} ]/gu, "").split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]).join("").toUpperCase();

  const marca = (claro: boolean) => (
    <span className="flex min-w-0 items-center gap-2">
      <span
        className="grid size-9 shrink-0 place-items-center rounded-full text-[13px] font-bold"
        style={{ background: claro ? "#ffffff" : tinta, color: claro ? base : t.fundo, fontFamily: t.fonte }}
      >
        {iniciais || "•"}
      </span>
      <span className="min-w-0 truncate text-[15px] font-bold leading-tight" style={{ ...display, color: claro ? "#ffffff" : tinta }}>{lead.nome}</span>
    </span>
  );

  return (
    <>
      {/* Faixa de aviso */}
      <p className="px-4 py-2 text-center text-[10.5px] font-semibold uppercase tracking-[0.22em]" style={{ background: escuroTopo ? acento : tinta, color: escuroTopo ? base : t.fundo }}>
        {r.aviso} · {cidade}
      </p>

      {escuroTopo ? (
        /* Capa escura: foto grande com o texto por cima (padrão "comida premium") */
        <section className="relative overflow-hidden rounded-b-[32px]" style={{ background: base, color: "#ffffff" }}>
          <img src={capa} crossOrigin="anonymous" onError={onCapaErro} alt="" width={720} height={900} className="absolute inset-0 h-full w-full object-cover" style={{ objectPosition: "center 70%" }} />
          <div aria-hidden="true" className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${base}f0 0%, ${base}c7 34%, ${base}59 62%, ${base}e6 100%)` }} />
          <div className="relative flex min-h-[640px] flex-col px-5 pb-6 pt-4">
            <header className="flex items-center justify-between gap-3">
              {marca(true)}
              <span className="flex shrink-0 items-center gap-2">
                <button type="button" onClick={abreZap} className="rounded-full px-3.5 py-2 text-[12px] font-bold" style={{ background: acento, color: base }}>{t.botao.split(" ")[0]}</button>
                <Menu aria-hidden="true" className="size-5 opacity-80" />
              </span>
            </header>
            <p className="mt-10 text-[10.5px] font-semibold uppercase tracking-[0.28em] opacity-85">{ramoNome} em {cidade}</p>
            <h1 className="mt-3 text-[44px] font-bold leading-[0.98] tracking-[-0.01em] [overflow-wrap:anywhere]" style={display}>{t.titulo[0]}</h1>
            <p className="-mt-1 text-[50px] leading-[1.05] [overflow-wrap:anywhere]" style={{ ...escrita, color: acento }}>{t.titulo[1]}</p>
            <p className="mt-3 max-w-[30ch] text-[15px] leading-relaxed" style={{ color: "#ffffffd9" }}>{t.chamada}</p>
            <div className="mt-6 flex flex-wrap gap-2.5">
              <button type="button" onClick={abreZap} className={pill} style={{ background: acento, color: base }}>{t.botao} <ArrowRight aria-hidden="true" className="size-4" /></button>
              <button type="button" onClick={demo("este botão mostra a rota no Google Maps.")} className={pill} style={{ color: "#ffffff", boxShadow: "inset 0 0 0 1px #ffffff66" }}>
                <MapPin aria-hidden="true" className="size-4" /> Como chegar
              </button>
            </div>
            <p aria-hidden="true" className="mt-8 rotate-[-7deg] self-end text-[30px] leading-none" style={{ ...escrita, color: "#ffffff" }}>{t.roteiro} ↓</p>
            <ul className="mt-auto grid grid-cols-3 gap-2 border-t pt-4" style={{ borderColor: "#ffffff2e" }}>
              {confianca.map(([Icone, texto]) => (
                <li key={texto} className="flex flex-col items-start gap-1.5 text-[11.5px] leading-tight" style={{ color: "#ffffffd9" }}>
                  <Icone aria-hidden="true" className="size-5" strokeWidth={1.4} style={{ color: acento }} /> {texto}
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : (
        /* Capa clara de loja: cabeçalho centralizado, banner com foto e título editorial */
        <>
          <header className="px-5 pb-3 pt-5 text-center" style={{ color: tinta }}>
            <p className="text-[30px] leading-none [overflow-wrap:anywhere]" style={{ ...display, fontStyle: "normal" }}>{lead.nome}</p>
            <p className="mt-1.5 text-[10px] font-semibold uppercase tracking-[0.32em]" style={{ color: t.suave }}>{ramoNome} em {cidade}</p>
            <nav className="mt-4 flex justify-center gap-5 border-y py-2.5 text-[11px] font-semibold uppercase tracking-[0.16em]" style={{ borderColor: `color-mix(in srgb, ${tinta} 14%, transparent)` }}>
              {r.nav.map((n) => <span key={n}>{n}</span>)}
            </nav>
          </header>
          <section className="relative px-4 pb-8">
            <div className="relative overflow-hidden rounded-[26px]" style={{ background: t.mancha }}>
              <img src={capa} crossOrigin="anonymous" onError={onCapaErro} alt="" width={720} height={900} className="aspect-[4/4.4] w-full object-cover" />
              {temNota && (
                <span className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-bold shadow-[0_10px_24px_-10px_rgba(0,0,0,.5)]" style={{ background: "#ffffff", color: "#1c1c1c" }}>
                  <Star aria-hidden="true" className="size-3.5" fill="#f5b301" stroke="none" /> {nota} no Google
                </span>
              )}
            </div>
            <div className="relative -mt-14 mx-3 rounded-[22px] px-5 pb-6 pt-5 text-center shadow-[0_24px_50px_-24px_rgba(0,0,0,.45)]" style={{ background: t.cartao, color: tinta }}>
              <p className="text-[10.5px] font-semibold uppercase tracking-[0.28em]" style={{ color: t.destaque }}>{t.roteiro}</p>
              <h1 className="mt-2 text-[40px] leading-[1] [overflow-wrap:anywhere]" style={display}>{t.titulo[0]}</h1>
              <p className="-mt-0.5 text-[42px] leading-[1.1]" style={{ ...escrita, color: t.destaque }}>{t.titulo[1]}</p>
              <p className="mx-auto mt-2 max-w-[30ch] text-[14px] leading-relaxed" style={{ color: t.suave }}>{t.chamada}</p>
              <button type="button" onClick={abreZap} className={`${pill} mt-5 uppercase tracking-[0.12em]`} style={{ background: tinta, color: t.fundo, fontSize: 12.5 }}>
                {t.botao} <ArrowRight aria-hidden="true" className="size-4" />
              </button>
            </div>
          </section>
          <ul className="mx-4 grid grid-cols-3 gap-2 rounded-[18px] px-3 py-3.5" style={{ background: tinta, color: t.fundo }}>
            {confianca.map(([Icone, texto]) => (
              <li key={texto} className="flex flex-col items-center gap-1.5 text-center text-[11px] font-semibold leading-tight">
                <Icone aria-hidden="true" className="size-5" strokeWidth={1.4} /> {texto}
              </li>
            ))}
          </ul>
        </>
      )}

      {/* Vitrine: cartões com foto */}
      <section className="px-4 pb-12 pt-12" style={{ background: escuroTopo ? fundoVitrine : t.fundo }}>
        <div className="flex items-end justify-between gap-3 px-1">
          <div>
            <p className="flex items-center gap-2 text-[10.5px] font-bold uppercase tracking-[0.24em]" style={{ color: t.destaque }}>
              {r.olho} <span aria-hidden="true" className="h-px w-8" style={{ background: t.destaque }} />
            </p>
            <h2 className="mt-2 text-[30px] font-bold leading-[1.05]" style={display}>{r.titulo}</h2>
            <p className="mt-1.5 text-[13.5px]" style={{ color: t.suave }}>{r.texto}</p>
          </div>
        </div>
        <ul className="mt-6 grid grid-cols-2 gap-3">
          {cartoes.map((c, i) => (
            <li key={c.nome} className="flex flex-col overflow-hidden rounded-[18px] shadow-[0_16px_34px_-22px_rgba(0,0,0,.55)]" style={{ background: t.cartao }}>
              <span className="relative block">
                <img src={c.foto} alt="" width={480} height={480} className="aspect-[4/3.4] w-full object-cover" />
                {i === 0 && (
                  <span className="absolute left-2 top-2 rounded-full px-2.5 py-1 text-[10.5px] font-bold" style={{ background: t.destaque, color: t.noDestaque }}>{r.selo}</span>
                )}
              </span>
              <span className="flex flex-1 flex-col px-3 pb-3 pt-2.5">
                <span className="text-[14.5px] font-bold leading-tight">{c.nome}</span>
                <span className="mt-1 flex-1 text-[12px] leading-snug" style={{ color: t.suave }}>{c.linha}</span>
                <span className="mt-3 flex items-center justify-between gap-2">
                  <span className="text-[11.5px] font-semibold" style={{ color: t.suave }}>Consulte</span>
                  <button type="button" onClick={abreZap} className="rounded-full px-3 py-1.5 text-[12px] font-bold" style={{ background: t.destaque, color: t.noDestaque }}>{r.botaoCartao}</button>
                </span>
              </span>
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={demo("este botão abre a lista completa, com as fotos e os preços de vocês.")}
          className={`${pill} mx-auto mt-6 flex`}
          style={{ boxShadow: `inset 0 0 0 1.5px ${tinta}`, color: tinta }}
        >
          {r.ver} <ArrowRight aria-hidden="true" className="size-4" />
        </button>
      </section>

      {/* Faixa escura com chamada */}
      <section className="relative mx-3 mb-12 overflow-hidden rounded-[28px]" style={{ background: t.escuro ? t.cartao : tinta, color: "#ffffff" }}>
        <img src={`img/demo/${t.foto}-2.webp`} alt="" width={720} height={540} className="aspect-[16/10] w-full object-cover opacity-95" />
        <div aria-hidden="true" className="absolute inset-x-0 aspect-[16/10]" style={{ top: 0, background: `linear-gradient(180deg, transparent 45%, ${t.escuro ? t.cartao : tinta} 100%)` }} />
        <div className="relative -mt-6 px-6 pb-7">
          <p className="text-[10.5px] font-bold uppercase tracking-[0.26em]" style={{ color: acento }}>{lead.nome}</p>
          <p className="mt-1 text-[40px] leading-[1.05]" style={{ ...escrita, color: acento }}>{t.cta[0]}</p>
          <p className="mt-1 text-[14px] leading-relaxed" style={{ color: "#ffffffd0" }}>{t.cta[1]}</p>
          <button type="button" onClick={abreZap} className={`${pill} mt-5`} style={{ background: acento, color: t.escuro ? t.fundo : tinta }}>
            {t.botao} <ArrowRight aria-hidden="true" className="size-4" />
          </button>
        </div>
      </section>

      {/* Sobre: foto em moldura */}
      <section className="px-5 pb-12">
        <div className="relative mx-auto w-[86%] rotate-[-2.5deg] p-2.5 pb-9 shadow-[0_22px_44px_-22px_rgba(0,0,0,.55)]" style={{ background: "#ffffff" }}>
          <span aria-hidden="true" className="absolute -top-3 left-1/2 h-6 w-24 -translate-x-1/2 rotate-[3deg]" style={{ background: `color-mix(in srgb, ${t.mancha} 80%, #ffffff)`, opacity: 0.9 }} />
          <img src={capa} crossOrigin="anonymous" onError={onCapaErro} alt="" width={720} height={720} className="aspect-[4/3.2] w-full object-cover" />
          <p className="absolute bottom-2 left-0 right-0 text-center text-[22px] leading-none" style={{ ...escrita, color: "#2b2b2b" }}>{cidade}</p>
        </div>
        <p className="mt-9 text-center text-[10.5px] font-bold uppercase tracking-[0.26em]" style={{ color: t.destaque }}>Sobre a {lead.nome}</p>
        <h2 className="mt-2 text-center text-[30px] font-bold leading-[1.05]" style={display}>
          {t.sobre[0]} <span style={{ ...display, color: t.destaque, fontStyle: t.italico ? "italic" : undefined }}>{t.sobre[1]}</span>
        </h2>
        <p className="mx-auto mt-3 max-w-[34ch] text-center text-[14px] leading-relaxed" style={{ color: t.suave }}>
          Aqui entra a história de vocês, com as fotos da loja e de quem faz tudo acontecer.
        </p>
      </section>

      {/* Nota do Google (só a nota real; os comentários vêm do Google) */}
      <section className="mx-4 mb-12 rounded-[24px] px-5 py-6 text-center shadow-[0_16px_36px_-24px_rgba(0,0,0,.5)]" style={{ background: t.cartao }}>
        <p className="text-[10.5px] font-bold uppercase tracking-[0.26em]" style={{ color: t.destaque }}>Avaliações</p>
        <p className="mt-2 text-[56px] font-bold leading-none" style={{ fontFamily: t.fonte }}>{temNota ? nota : "★"}</p>
        <span className="mt-2 flex justify-center gap-1" aria-hidden="true">
          {[0, 1, 2, 3, 4].map((i) => <Star key={i} className="size-5" fill="#f5b301" stroke="none" />)}
        </span>
        <p className="mt-2 text-[13.5px] font-semibold">
          {temNota && lead.avaliacoes ? `${fmtInt(lead.avaliacoes)} avaliações no Google` : temNota ? "Nota no Google" : "Seja o primeiro a avaliar"}
        </p>
        <p className="mx-auto mt-1.5 max-w-[30ch] text-[12.5px] leading-snug" style={{ color: t.suave }}>Os comentários de quem já foi aparecem aqui, direto do Google.</p>
      </section>

      {/* Rodapé escuro */}
      <footer className="px-5 pb-10 pt-8" style={{ background: t.escuro ? "#0b0b0c" : tinta, color: "#ffffffd9" }}>
        {marca(true)}
        <p className="mt-3 max-w-[32ch] text-[12.5px] leading-relaxed" style={{ color: "#ffffff99" }}>{t.sobre[0]} {t.sobre[1]}</p>
        <div className="mt-6 grid grid-cols-2 gap-5 text-[12.5px]">
          <div>
            <p className="text-[10.5px] font-bold uppercase tracking-[0.2em]" style={{ color: acento }}>Navegação</p>
            <ul className="mt-2 grid gap-1.5">{r.nav.map((n) => <li key={n}>{n}</li>)}</ul>
          </div>
          <div>
            <p className="text-[10.5px] font-bold uppercase tracking-[0.2em]" style={{ color: acento }}>Atendimento</p>
            <ul className="mt-2 grid gap-1.5">
              <li className="flex items-center gap-1.5"><MessageCircle aria-hidden="true" className="size-3.5" /> WhatsApp</li>
              <li className="flex items-center gap-1.5"><Instagram aria-hidden="true" className="size-3.5" /> Instagram</li>
              <li className="flex items-start gap-1.5"><MapPin aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" /> {endereco || cidade}</li>
            </ul>
          </div>
        </div>
        <p className="mt-7 flex items-center gap-1.5 border-t pt-4 text-[11px]" style={{ borderColor: "#ffffff1f", color: "#ffffff80" }}>
          <ShieldCheck aria-hidden="true" className="size-3.5" /> {cidade} · Site feito por BN Digital
        </p>
      </footer>
    </>
  );
}

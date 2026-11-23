import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { toJpeg } from "html-to-image";
import { CalendarCheck, Clock, Laptop, Loader2, MessageCircle, Play, Send, Smartphone, Wallet, X } from "lucide-react";
import { useElementWidth } from "@/components/ui/app-dashboard-shell-utils/app-block-kit";
import { FONTES_NA_TELA, TEXTO, arquivo, compartilharFoto, cssDasFontes, temaDe } from "./Demonstracao";
import { Avatar, Marcado, SERIF_SISTEMA, conteudo } from "./sistemaConteudo";
import { lugarDe, textosSistema, type Lead, numeroConversa } from "./leads";
import { DemoClicavel } from "./DemoClicavel";

// Como ficaria o sistema da loja (horário marcado ou controle de alunos) num notebook e num celular.
// É uma imagem para mostrar e mandar no WhatsApp: nomes e valores são de exemplo e a tela avisa.



export function SistemaPrevia({ lead, mensagem, onFechar }: { lead: Lead; mensagem: string; onFechar: () => void }) {
  const t = temaDe(lead);
  const sis = textosSistema(lead);
  const fechar = useRef<HTMLButtonElement>(null);
  const cena = useRef<HTMLElement>(null);
  const [aviso, setAviso] = useState("");
  const [gerando, setGerando] = useState(false);
  const [foto, setFoto] = useState<{ url: string; salva: boolean } | null>(null);
  // Demonstração de clicar, com os serviços e o nome da loja, para mostrar pessoalmente.
  const [aoVivo, setAoVivo] = useState(false);

  useEffect(() => {
    fechar.current?.focus();
    const tecla = (e: KeyboardEvent) => e.key === "Escape" && onFechar();
    window.addEventListener("keydown", tecla);
    return () => window.removeEventListener("keydown", tecla);
  }, [onFechar]);
  useEffect(() => {
    if (!aviso) return;
    const timer = window.setTimeout(() => setAviso(""), 3200);
    return () => window.clearTimeout(timer);
  }, [aviso]);

  async function mandarFoto() {
    if (gerando) return;
    setGerando(true);
    try {
      const el = cena.current!;
      await document.fonts.ready;
      const doTitulo = /"([^"]+)"/.exec(t.fonte)?.[1];
      const dataUrl = await toJpeg(el, {
        pixelRatio: 2.5,
        quality: 0.92,
        backgroundColor: t.fundo,
        fontEmbedCSS: await cssDasFontes([TEXTO, "Fraunces", ...(doTitulo ? [doTitulo] : [])]),
      });
      const r = await compartilharFoto(dataUrl, arquivo(lead.nome, "sistema"), mensagem);
      if (r === "compartilhou") setAviso("Escolha o WhatsApp e a conversa da loja.");
      else if (r !== "cancelou") setFoto(r);
    } catch {
      setAviso("Não consegui gerar a foto. Tire um print da tela e mande.");
    } finally {
      setGerando(false);
    }
  }

  const titulo: CSSProperties = { fontFamily: t.fonte, textTransform: t.maiusculo ? "uppercase" : undefined };
  const linkConversa = `https://wa.me/${numeroConversa(lead).replace(/\D/g, "")}?text=${encodeURIComponent(mensagem)}`;
  const agenda = sis.id === "agenda";
  const beneficios: [Icone: typeof Smartphone, titulo: string, linha: string][] = agenda
    ? [
        [Smartphone, "No celular do cliente", "Ele escolhe o serviço e o horário sozinho."],
        [Laptop, "No notebook do balcão", "A agenda do dia e o que já entrou."],
        [CalendarCheck, "Resumo do mês", "Quantos atendimentos e o dia mais cheio."],
      ]
    : [
        [Smartphone, "No celular do aluno", "Ele confirma e remarca a aula sozinho."],
        [Laptop, "No notebook do studio", "As turmas do dia e quem está em dia."],
        [Wallet, "Cobrança no WhatsApp", "Um toque para lembrar quem atrasou."],
      ];

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Sistema de ${sis.nome} de ${lead.nome}`}
      className="fixed inset-0 z-[80] flex flex-col bg-[var(--blk-scrim)] backdrop-blur-sm"
    >
      <div className="flex shrink-0 items-center gap-2.5 border-b border-[color:var(--bjork-border)] bg-[var(--bjork-panel)] px-3 py-2.5 text-[color:var(--bjork-text)]">
        <button
          ref={fechar}
          type="button"
          onClick={onFechar}
          aria-label="Fechar sistema"
          className="grid size-10 shrink-0 cursor-pointer place-items-center rounded-full bg-[var(--bjork-surface-active)] focus-visible:ring-2 focus-visible:ring-[color:var(--bjork-accent)]"
        >
          <X aria-hidden="true" className="size-5" />
        </button>
        <p className="min-w-0 flex-1 truncate text-[13.5px] font-semibold">Sistema: {lead.nome}</p>
        <button
          type="button"
          onClick={mandarFoto}
          disabled={gerando}
          className="inline-flex h-10 shrink-0 cursor-pointer items-center gap-2 rounded-full bjork-fill px-4 text-[13.5px] font-semibold text-[color:var(--blk-accent-fill-ink)] disabled:opacity-70 focus-visible:ring-2 focus-visible:ring-white"
        >
          {gerando ? <Loader2 aria-hidden="true" className="size-4 animate-spin" /> : <Send aria-hidden="true" className="size-4" />}
          {gerando ? "Gerando foto…" : "Mandar foto"}
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <article
          ref={cena}
          className="relative mx-auto w-full max-w-[460px] overflow-hidden px-5 pb-6 pt-6"
          style={{ background: t.fundo, color: t.tinta, fontFamily: `"${TEXTO}", "Roboto", system-ui, sans-serif` }}
        >
          <style>{FONTES_NA_TELA}</style>
          <span
            className="inline-flex rounded-full px-3 py-1 text-[12px] font-semibold"
            style={{ background: t.mancha, color: t.escuro ? t.destaque : t.tinta }}
          >
            Sistema de {sis.nome}
          </span>
          <h1 className="mt-3 text-[34px] font-bold leading-[1.02] [overflow-wrap:anywhere]" style={titulo}>
            {lead.nome}
          </h1>
          <p className="mt-2 text-[14.5px] leading-snug" style={{ color: t.suave }}>
            Assim fica no notebook e no celular.
          </p>

          <div className="mt-5">
            <Notebook>
              <Escala largura={1200} altura={750}><PaginaDesktop lead={lead} /></Escala>
            </Notebook>
          </div>

          <div className="mt-6 flex items-start gap-4">
            <Celular>
              <Escala largura={390} altura={800}><PaginaCelular lead={lead} /></Escala>
            </Celular>
            <ul className="grid min-w-0 flex-1 gap-4 pt-2">
              {beneficios.map(([Icone, nome, linha]) => (
                <li key={nome} className="flex gap-2.5">
                  <span
                    className="grid size-9 shrink-0 place-items-center rounded-full"
                    style={{ background: t.mancha, color: t.escuro ? t.destaque : t.tinta }}
                  >
                    <Icone aria-hidden="true" className="size-[18px]" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[13.5px] font-bold leading-tight">{nome}</span>
                    <span className="mt-0.5 block text-[12.5px] leading-snug" style={{ color: t.suave }}>{linha}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <p className="mt-6 text-[11.5px]" style={{ color: t.suave }}>
            Nomes e valores de exemplo · {lugarDe(lead)} · Sistema feito por BN Digital
          </p>
        </article>

        <div className="mx-auto flex max-w-[460px] flex-col items-center gap-2 px-5 py-4 text-center">
          <p className="text-[13px] text-[color:var(--bjork-text-muted)]">Pessoalmente, dá pra mostrar funcionando no celular:</p>
          <button
            type="button"
            onClick={() => setAoVivo(true)}
            className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-full border border-[color:var(--bjork-border-strong)] bg-[var(--bjork-surface)] px-5 text-[14px] font-semibold text-[color:var(--bjork-text)] focus-visible:ring-2 focus-visible:ring-[color:var(--bjork-accent)]"
          >
            <Play aria-hidden="true" className="size-4" />
            Ver funcionando
          </button>
        </div>
      </div>

      {foto && (
        <div className="absolute inset-0 z-10 flex flex-col bg-[var(--bjork-bg)]">
          <div className="flex items-center gap-2.5 border-b border-[color:var(--bjork-border)] px-3 py-2.5 text-[color:var(--bjork-text)]">
            <button type="button" onClick={() => setFoto(null)} aria-label="Voltar para o sistema" className="grid size-10 place-items-center rounded-full bg-[var(--bjork-surface-active)]">
              <X aria-hidden="true" className="size-5" />
            </button>
            <p className="min-w-0 flex-1 text-[13px] leading-snug">
              {foto.salva
                ? "Foto salva. Toque em WhatsApp e, na conversa, no clipe para escolher a foto."
                : "Toque e segure a foto para salvar. Depois toque em WhatsApp e mande na conversa."}
            </p>
            <a href={linkConversa} target="_blank" rel="noopener noreferrer" className="inline-flex h-10 items-center gap-2 rounded-full bg-[#25d366] px-4 text-[13.5px] font-semibold text-white">
              <MessageCircle aria-hidden="true" className="size-4" /> WhatsApp
            </a>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto p-4">
            <img src={foto.url} alt={`Foto do sistema de ${lead.nome}`} className="mx-auto w-full max-w-[460px] rounded-[12px]" />
          </div>
        </div>
      )}

      {aoVivo && <DemoClicavel lead={lead} onFechar={() => setAoVivo(false)} />}

      {aviso && (
        <p
          role="status"
          className="absolute bottom-6 left-1/2 z-20 max-w-[88%] -translate-x-1/2 rounded-[12px] border border-[color:var(--bjork-border-strong)] bg-[var(--bjork-menu)] px-4 py-2.5 text-center text-[13.5px] font-medium text-[color:var(--bjork-text)] shadow-[var(--bjork-shadow-menu)]"
        >
          {aviso}
        </p>
      )}
    </div>,
    document.body,
  );
}

/* Molduras ----------------------------------------------------------------------------------- */

function Notebook({ children }: { children: ReactNode }) {
  return (
    <div aria-hidden="true">
      <div className="rounded-[14px] p-[7px]" style={{ background: "#0c0c0d", boxShadow: "0 0 0 1px #2c2c30, 0 26px 40px -20px rgba(0,0,0,.6)" }}>
        <div className="overflow-hidden rounded-[7px]">{children}</div>
      </div>
      <div className="mx-[-5%] h-[11px] rounded-b-[14px]" style={{ background: "linear-gradient(180deg, #d5d8dc, #9da2a8)" }} />
    </div>
  );
}

function Celular({ children }: { children: ReactNode }) {
  return (
    <div aria-hidden="true" className="w-[168px] shrink-0 rounded-[26px] p-[6px]" style={{ background: "#0c0c0d", boxShadow: "0 0 0 1px #2c2c30, 0 22px 36px -18px rgba(0,0,0,.6)" }}>
      <div className="relative overflow-hidden rounded-[20px]">
        <span className="absolute left-1/2 top-[5px] z-10 h-[9px] w-[44px] -translate-x-1/2 rounded-full" style={{ background: "#0c0c0d" }} />
        {children}
      </div>
    </div>
  );
}

/** Desenha a página no tamanho de verdade (computador ou celular) e encolhe para caber na moldura. */
function Escala({ largura, altura, children }: { largura: number; altura: number; children: ReactNode }) {
  const caixa = useRef<HTMLDivElement>(null);
  const w = useElementWidth(caixa) || largura * 0.33;
  const s = w / largura;
  return (
    <div ref={caixa} className="relative w-full overflow-hidden" style={{ height: altura * s }}>
      <div className="absolute left-0 top-0" style={{ width: largura, height: altura, transform: `scale(${s})`, transformOrigin: "top left" }}>
        {children}
      </div>
    </div>
  );
}

/** A página no computador (1200 x 750): menu, abertura com foto e o agendamento em 4 colunas. */
function PaginaDesktop({ lead }: { lead: Lead }) {
  const c = conteudo(lead);
  const { t } = c;
  const Marca = t.servicos[0][2];
  const linha = `color-mix(in srgb, ${t.tinta} 12%, transparent)`;
  const caixa: CSSProperties = { background: t.cartao, boxShadow: `inset 0 0 0 1px ${linha}` };
  const dias = Array.from({ length: 35 }, (_, i) => i - 6);
  return (
    <div className="flex h-full w-full flex-col" style={{ background: t.fundo, color: t.tinta, fontFamily: `"${TEXTO}", "Roboto", sans-serif` }}>
      <div className="flex h-[58px] shrink-0 items-center gap-6 px-12" style={{ borderBottom: `1px solid ${linha}` }}>
        <span className="grid size-[34px] place-items-center rounded-[9px]" style={{ boxShadow: `inset 0 0 0 1px ${t.destaque}`, color: t.destaque }}><Marca className="size-[18px]" /></span>
        <span className="text-[19px] font-semibold" style={{ fontFamily: SERIF_SISTEMA }}>{lead.nome}</span>
        <span className="ml-auto flex gap-6 text-[13px]" style={{ color: t.suave }}><span>Início</span><span>Serviços</span><span>Equipe</span><span>Contato</span></span>
        <span className="rounded-[9px] px-4 py-2 text-[13px] font-bold" style={{ boxShadow: `inset 0 0 0 1px ${t.destaque}`, color: t.destaque }}>{c.agendar.split(" ")[0]}</span>
      </div>
      <div className="relative h-[226px] shrink-0 overflow-hidden">
        <img src={c.foto} alt="" className="absolute inset-y-0 right-0 h-full w-[62%] object-cover" style={{ objectPosition: "center 30%" }} />
        <div className="absolute inset-0" style={{ background: `linear-gradient(90deg, ${t.fundo} 36%, ${t.fundo}cc 50%, ${t.fundo}00 80%), linear-gradient(0deg, ${t.fundo} 0%, ${t.fundo}00 35%)` }} />
        <div className="relative flex h-full max-w-[560px] flex-col justify-center px-12">
          <span className="self-start rounded-full px-3 py-1 text-[12px]" style={{ ...caixa, color: t.suave }}><b style={{ color: t.destaque }}>★</b> {c.selo}</span>
          <h1 className="mt-3 text-[44px] font-semibold leading-[1.02]" style={{ fontFamily: SERIF_SISTEMA }}>
            {c.titulo[0]} <em className="block font-semibold" style={{ color: t.destaque }}>{c.titulo[1]}</em>
          </h1>
          <p className="mt-2 max-w-[440px] text-[13.5px] leading-snug" style={{ color: t.suave }}>{c.chamada}</p>
        </div>
      </div>
      <div className="mx-12 mt-2 flex min-h-0 flex-1 flex-col rounded-[18px] p-5" style={{ ...caixa, background: `color-mix(in srgb, ${t.cartao} 70%, ${t.fundo})` }}>
        <div className="flex items-end justify-between">
          <h2 className="text-[26px] font-semibold leading-none" style={{ fontFamily: SERIF_SISTEMA }}>{c.agendar}</h2>
          <span className="flex items-center gap-2 text-[12px]" style={{ color: t.suave }}><Clock className="size-5" style={{ color: t.destaque }} />{c.horario}</span>
        </div>
        <div className="mt-4 grid grid-cols-4 gap-3">
          {c.passos.map(([nome, linhaPasso], i) => (
            <div key={nome} className="flex items-center gap-2.5">
              {i < 2 ? <Marcado t={t} tamanho={28} /> : (
                <span className="grid size-[28px] shrink-0 place-items-center rounded-full text-[13px] font-bold" style={i === 2 ? { background: t.destaque, color: t.noDestaque } : { boxShadow: `inset 0 0 0 1px ${linha}`, color: t.suave }}>{i + 1}</span>
              )}
              <span className="min-w-0"><span className="block text-[13px] font-semibold">{nome}</span><span className="block text-[11px]" style={{ color: t.suave }}>{linhaPasso}</span></span>
              {i < 3 && <span className="h-px flex-1" style={{ background: linha }} />}
            </div>
          ))}
        </div>
        <div className="mt-4 grid min-h-0 flex-1 grid-cols-4 gap-3">
          <div className="flex flex-col gap-2 rounded-[13px] p-3" style={caixa}>
            <span className="text-[13px] font-bold">{c.colunas[0]}</span>
            {c.itens.slice(0, 4).map((item, i) => (
              <div key={item.nome} className="flex items-center justify-between rounded-[9px] px-3 py-2" style={i === 0 ? { background: t.mancha, boxShadow: `inset 0 0 0 1px ${t.destaque}` } : { boxShadow: `inset 0 0 0 1px ${linha}` }}>
                <span><span className="block text-[13px] font-semibold">{item.nome}</span><span className="block text-[11px]" style={{ color: t.suave }}>{item.linha}</span></span>
                {i === 0 ? <Marcado t={t} /> : <span className="size-[18px] rounded-full" style={{ boxShadow: `inset 0 0 0 1.5px ${linha}` }} />}
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-2 rounded-[13px] p-3" style={caixa}>
            <span className="text-[13px] font-bold">{c.colunas[1]}</span>
            {c.pessoas.map((p, i) => (
              <div key={p[0]} className="flex items-center gap-2.5 rounded-[9px] px-2.5 py-2" style={i === 0 ? { background: t.mancha, boxShadow: `inset 0 0 0 1px ${t.destaque}` } : { boxShadow: `inset 0 0 0 1px ${linha}` }}>
                <Avatar pessoa={p} tamanho={36} t={t} />
                <span className="min-w-0 flex-1"><span className="block truncate text-[13px] font-semibold">{p[0]}</span><span className="block truncate text-[11px]" style={{ color: t.suave }}><b style={{ color: t.destaque }}>★ 4,{9 - (i % 2)}</b> · {p[1]}</span></span>
                {i === 0 && <Marcado t={t} />}
              </div>
            ))}
          </div>
          <div className="flex flex-col rounded-[13px] p-3" style={caixa}>
            <span className="text-[13px] font-bold">{c.colunas[2]}</span>
            <span className="mt-1.5 text-center text-[12px] font-semibold">Novembro 2026</span>
            <div className="mt-1 grid grid-cols-7 gap-y-0.5 text-center text-[10.5px] tabular-nums">
              {["D", "S", "T", "Q", "Q", "S", "S"].map((d, i) => <span key={i} style={{ color: t.suave }}>{d}</span>)}
              {dias.map((d) => (
                <span key={d} className="mx-auto grid size-[19px] place-items-center rounded-full" style={d === 19 ? { background: t.destaque, color: t.noDestaque, fontWeight: 700 } : d < 18 || d > 30 ? { opacity: d < 1 || d > 30 ? 0 : 0.35 } : undefined}>
                  {d >= 1 && d <= 30 ? d : ""}
                </span>
              ))}
            </div>
            <span className="mt-1.5 text-[11.5px] font-bold">Horários</span>
            <div className="mt-1 grid grid-cols-3 gap-1 text-[11px] font-semibold tabular-nums">
              {["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"].map((h) => (
                <span key={h} className="rounded-[6px] py-1 text-center" style={h === "16:00" ? { background: t.destaque, color: t.noDestaque } : h === "10:00" || h === "14:00" ? { color: t.suave, textDecoration: "line-through", opacity: 0.5 } : { boxShadow: `inset 0 0 0 1px ${linha}` }}>{h}</span>
              ))}
            </div>
          </div>
          <div className="flex flex-col rounded-[13px] p-3" style={caixa}>
            <span className="text-[13px] font-bold">Resumo</span>
            <div className="mt-2 grid gap-1.5">
              {c.resumo.map(([rotulo, valor]) => (
                <span key={rotulo}><span className="block text-[10px]" style={{ color: t.suave }}>{rotulo}</span><span className="block text-[12.5px] font-semibold">{valor}</span></span>
              ))}
            </div>
            <div className="mt-auto flex items-baseline justify-between pt-2" style={{ borderTop: `1px solid ${linha}` }}>
              <span className="text-[12px] font-bold">{c.total[1]}</span>
              <span className="text-[20px] font-semibold" style={{ fontFamily: SERIF_SISTEMA, color: t.destaque }}>{c.total[0]}</span>
            </div>
            <span className="mt-2 rounded-[9px] py-2 text-center text-[12.5px] font-bold" style={{ background: t.destaque, color: t.noDestaque }}>{c.botao}</span>
          </div>
        </div>
        <div className="mt-3 grid grid-cols-4 gap-3">
          {c.recursos.map(([titulo, linhaRecurso]) => (
            <span key={titulo} className="flex items-center gap-2"><CalendarCheck className="size-5 shrink-0" style={{ color: t.destaque }} /><span><span className="block text-[12px] font-bold">{titulo}</span><span className="block text-[10.5px]" style={{ color: t.suave }}>{linhaRecurso}</span></span></span>
          ))}
        </div>
      </div>
      <div className="h-4 shrink-0" />
    </div>
  );
}

/** A página no celular (390 x 800): abertura com foto, etapas e a primeira escolha. */
function PaginaCelular({ lead }: { lead: Lead }) {
  const c = conteudo(lead);
  const { t } = c;
  const Marca = t.servicos[0][2];
  const linha = `color-mix(in srgb, ${t.tinta} 12%, transparent)`;
  return (
    <div className="flex h-full w-full flex-col" style={{ background: t.fundo, color: t.tinta, fontFamily: `"${TEXTO}", "Roboto", sans-serif` }}>
      <div className="flex h-[64px] shrink-0 items-center gap-2.5 px-5 pt-3" style={{ borderBottom: `1px solid ${linha}` }}>
        <span className="grid size-[32px] place-items-center rounded-[9px]" style={{ boxShadow: `inset 0 0 0 1px ${t.destaque}`, color: t.destaque }}><Marca className="size-[17px]" /></span>
        <span className="min-w-0 flex-1 truncate text-[18px] font-semibold" style={{ fontFamily: SERIF_SISTEMA }}>{lead.nome}</span>
      </div>
      <div className="relative h-[330px] shrink-0 overflow-hidden">
        <img src={c.foto} alt="" className="absolute inset-0 h-full w-full object-cover" style={{ objectPosition: "center 30%" }} />
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${t.fundo}33 0%, ${t.fundo}aa 45%, ${t.fundo} 100%)` }} />
        <div className="absolute inset-x-5 bottom-5">
          <span className="rounded-full px-3 py-1 text-[12px]" style={{ background: t.cartao, color: t.suave }}><b style={{ color: t.destaque }}>★</b> {c.selo}</span>
          <h1 className="mt-3 text-[36px] font-semibold leading-[1.03]" style={{ fontFamily: SERIF_SISTEMA }}>
            {c.titulo[0]} <em className="block font-semibold" style={{ color: t.destaque }}>{c.titulo[1]}</em>
          </h1>
          <span className="mt-4 inline-block rounded-[12px] px-5 py-3 text-[15px] font-bold" style={{ background: t.destaque, color: t.noDestaque }}>{c.agendar}</span>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-2.5 px-5 pt-4">
        <div className="flex items-center gap-2">
          {c.passos.map(([nome], i) => (
            <span key={nome} className="flex flex-1 items-center gap-2">
              {i < 2 ? <Marcado t={t} tamanho={26} /> : <span className="grid size-[26px] place-items-center rounded-full text-[12px] font-bold" style={i === 2 ? { background: t.destaque, color: t.noDestaque } : { boxShadow: `inset 0 0 0 1px ${linha}`, color: t.suave }}>{i + 1}</span>}
              {i < 3 && <span className="h-px flex-1" style={{ background: linha }} />}
            </span>
          ))}
        </div>
        <span className="mt-1 text-[16px] font-bold">{c.colunas[0]}</span>
        {c.itens.slice(0, 3).map((item, i) => (
          <div key={item.nome} className="flex items-center justify-between rounded-[12px] px-4 py-3" style={i === 0 ? { background: t.mancha, boxShadow: `inset 0 0 0 1.5px ${t.destaque}` } : { background: t.cartao, boxShadow: `inset 0 0 0 1px ${linha}` }}>
            <span><span className="block text-[15px] font-semibold">{item.nome}</span><span className="block text-[12.5px]" style={{ color: t.suave }}>{item.linha}</span></span>
            {i === 0 ? <Marcado t={t} tamanho={22} /> : <span className="size-[20px] rounded-full" style={{ boxShadow: `inset 0 0 0 1.5px ${linha}` }} />}
          </div>
        ))}
      </div>
      <div className="mx-5 mb-5 flex items-center justify-between rounded-[14px] px-4 py-3" style={{ background: t.cartao, boxShadow: `inset 0 0 0 1px ${linha}` }}>
        <span><span className="block text-[15px] font-bold">{c.total[0]}</span><span className="block text-[12px]" style={{ color: t.suave }}>qui 19 às {c.resumo[3][1]}</span></span>
        <span className="rounded-[10px] px-4 py-2.5 text-[14px] font-bold" style={{ background: t.destaque, color: t.noDestaque }}>Confirmar</span>
      </div>
    </div>
  );
}

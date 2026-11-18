import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { toJpeg } from "html-to-image";
import { CalendarCheck, Loader2, MessageCircle, Send, Smartphone, Laptop, Wallet, X } from "lucide-react";
import { FONTES_NA_TELA, TEXTO, arquivo, compartilharFoto, cssDasFontes, temaDe } from "./Demonstracao";
import { cidadeDe, ramoDe, textosSistema, type Lead, type RamoId } from "./leads";

// Como ficaria o sistema da loja (horário marcado ou controle de alunos) num notebook e num celular.
// É uma imagem para mostrar e mandar no WhatsApp: nomes e valores são de exemplo e a tela avisa.

/** Demonstração que dá pra clicar (horário marcado de barbearia), para mostrar pessoalmente. */
const DEMO_AGENDA = "https://claude.ai/artifact/Wd4vVWKcnP8NRG6qcT8ZUY";

type Servico = [nome: string, preco: number];
const SERVICOS: Partial<Record<RamoId, Servico[]>> = {
  barbearia: [["Corte", 35], ["Corte + barba", 55], ["Barba", 25]],
  salao: [["Escova", 45], ["Manicure", 30], ["Corte", 60]],
  estetica: [["Limpeza de pele", 120], ["Drenagem", 90], ["Sobrancelha", 40]],
  massagem: [["Relaxante", 100], ["Terapêutica", 120], ["Drenagem", 90]],
  pet: [["Banho", 50], ["Banho e tosa", 80], ["Tosa higiênica", 40]],
  lavajato: [["Lavagem simples", 40], ["Lavagem completa", 70], ["Polimento", 180]],
};
const AULAS: Partial<Record<RamoId, string[]>> = {
  pilates: ["Reformer", "Solo", "Reformer"],
  yoga: ["Hatha", "Vinyasa", "Meditação"],
  danca: ["Balé infantil", "Ritmos", "Jazz"],
  natacao: ["Infantil", "Adultos", "Hidroginástica"],
  crossfit: ["CrossFit", "Funcional", "Iniciantes"],
  luta: ["Muay thai", "Jiu-jitsu", "Kids"],
  academia: ["Funcional", "Spinning", "Musculação"],
};
const CLIENTES = ["Lucas", "Mariana", "João Pedro", "Carla", "Rafael", "Bianca", "Diego", "Fernanda"];
const SEMANA = ["seg", "ter", "qua", "qui", "sex", "sáb"];
const reais = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

export function SistemaPrevia({ lead, mensagem, onFechar }: { lead: Lead; mensagem: string; onFechar: () => void }) {
  const t = temaDe(lead);
  const sis = textosSistema(lead);
  const ramo = ramoDe(lead);
  const fechar = useRef<HTMLButtonElement>(null);
  const cena = useRef<HTMLElement>(null);
  const [aviso, setAviso] = useState("");
  const [gerando, setGerando] = useState(false);
  const [foto, setFoto] = useState<{ url: string; salva: boolean } | null>(null);

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
        fontEmbedCSS: await cssDasFontes([TEXTO, ...(doTitulo ? [doTitulo] : [])]),
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
  const linkConversa = `https://wa.me/${lead.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(mensagem)}`;
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
              {agenda ? <PainelAgenda lead={lead} servicos={SERVICOS[ramo.id] ?? SERVICOS.barbearia!} /> : <PainelAlunos lead={lead} aulas={AULAS[ramo.id] ?? AULAS.academia!} />}
            </Notebook>
          </div>

          <div className="mt-6 flex items-start gap-4">
            <Celular>
              {agenda ? <AppCliente lead={lead} servicos={SERVICOS[ramo.id] ?? SERVICOS.barbearia!} /> : <AppAluno lead={lead} aulas={AULAS[ramo.id] ?? AULAS.academia!} />}
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
            Nomes e valores de exemplo · {cidadeDe(lead)} · Sistema feito por BN Digital
          </p>
        </article>

        {agenda && (
          <p className="mx-auto max-w-[460px] px-5 py-4 text-center text-[13px] text-[color:var(--bjork-text-muted)]">
            Pessoalmente, dá pra mostrar funcionando:{" "}
            <a href={DEMO_AGENDA} target="_blank" rel="noopener noreferrer" className="font-semibold text-[color:var(--blk-accent-ink)] underline underline-offset-2">
              abrir a demonstração de clicar
            </a>
          </p>
        )}
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
        <div className="overflow-hidden rounded-[7px]" style={{ aspectRatio: "16 / 10" }}>{children}</div>
      </div>
      <div className="mx-[-5%] h-[11px] rounded-b-[14px]" style={{ background: "linear-gradient(180deg, #d5d8dc, #9da2a8)" }} />
    </div>
  );
}

function Celular({ children }: { children: ReactNode }) {
  return (
    <div aria-hidden="true" className="w-[168px] shrink-0 rounded-[26px] p-[6px]" style={{ background: "#0c0c0d", boxShadow: "0 0 0 1px #2c2c30, 0 22px 36px -18px rgba(0,0,0,.6)" }}>
      <div className="relative overflow-hidden rounded-[20px]" style={{ aspectRatio: "9 / 18.5" }}>
        <span className="absolute left-1/2 top-[6px] z-10 h-[10px] w-[46px] -translate-x-1/2 rounded-full" style={{ background: "#0c0c0d" }} />
        {children}
      </div>
    </div>
  );
}

/* Telas -------------------------------------------------------------------------------------- */

function useTela(lead: Lead) {
  const t = temaDe(lead);
  return {
    t,
    titulo: { fontFamily: t.fonte, textTransform: t.maiusculo ? "uppercase" : undefined } as CSSProperties,
    caixa: { background: t.cartao, boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${t.tinta} 9%, transparent)` } as CSSProperties,
  };
}

/** Notebook do dono: agenda de hoje, números do dia e a semana. */
function PainelAgenda({ lead, servicos }: { lead: Lead; servicos: Servico[] }) {
  const { t, titulo, caixa } = useTela(lead);
  const hoje: [hora: string, quem: string, servico: number][] = [
    ["09:00", CLIENTES[0], 0], ["09:30", CLIENTES[2], 1], ["10:30", CLIENTES[4], 0], ["11:00", CLIENTES[6], 2], ["14:00", CLIENTES[1], 0],
  ];
  const previsto = [...hoje, ["15:00", "", 1], ["16:00", "", 0], ["17:00", "", 1]].reduce((s, [, , i]) => s + servicos[i as number][1], 0);
  const semana = [8, 10, 9, 12, 15, 18];
  const maior = Math.max(...semana);
  return (
    <div className="flex h-full flex-col gap-[7px] p-[9px] text-[8.5px] leading-tight" style={{ background: t.fundo, color: t.tinta }}>
      <div className="flex items-center gap-1.5">
        <span className="size-[14px] rounded-[4px]" style={{ background: t.destaque }} />
        <span className="min-w-0 flex-1 truncate text-[10.5px] font-bold" style={titulo}>{lead.nome}</span>
        <span style={{ color: t.suave }}>Hoje, quarta</span>
      </div>
      <div className="grid grid-cols-3 gap-[6px]">
        {([["Marcados hoje", "8"], ["Horários livres", "6"], ["Previsto hoje", reais(previsto)]] as const).map(([nome, valor], i) => (
          <div key={nome} className="rounded-[6px] px-[7px] py-[5px]" style={i === 2 ? { background: t.destaque, color: t.noDestaque } : caixa}>
            <span className="block text-[7.5px] opacity-75">{nome}</span>
            <span className="block text-[14px] font-bold tabular-nums" style={titulo}>{valor}</span>
          </div>
        ))}
      </div>
      <div className="grid min-h-0 flex-1 grid-cols-[1.35fr_1fr] gap-[6px]">
        <div className="flex min-h-0 flex-col gap-[3px] rounded-[6px] p-[6px]" style={caixa}>
          <span className="mb-[2px] text-[8px] font-bold">Agenda de hoje</span>
          {hoje.map(([hora, quem, s]) => (
            <div key={hora} className="flex items-center gap-[5px] rounded-[4px] py-[2px] pl-[4px]" style={{ borderLeft: `2px solid ${t.destaque}` }}>
              <span className="w-[24px] tabular-nums" style={{ color: t.suave }}>{hora}</span>
              <span className="min-w-0 flex-1 truncate font-semibold">{quem}</span>
              <span className="truncate" style={{ color: t.suave }}>{servicos[s][0]}</span>
            </div>
          ))}
        </div>
        <div className="flex flex-col rounded-[6px] p-[6px]" style={caixa}>
          <span className="text-[8px] font-bold">Atendimentos na semana</span>
          <div className="mt-[4px] grid flex-1 grid-cols-6 items-end gap-[3px]">
            {semana.map((n, i) => (
              <div key={SEMANA[i]} className="flex h-full flex-col items-center justify-end gap-[2px]">
                <span className="text-[6.5px] tabular-nums" style={{ color: t.suave }}>{n}</span>
                <span className="w-full rounded-[2px]" style={{ height: `${(n / maior) * 70}%`, background: n === maior ? t.destaque : `color-mix(in srgb, ${t.destaque} 38%, transparent)` }} />
                <span className="text-[6.5px]" style={{ color: t.suave }}>{SEMANA[i]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Celular do cliente: escolhe serviço, dia e horário. */
function AppCliente({ lead, servicos }: { lead: Lead; servicos: Servico[] }) {
  const { t, titulo, caixa } = useTela(lead);
  const horas = ["09:00", "10:00", "10:30", "13:00", "14:30", "15:00", "16:00", "17:00", "18:00"];
  const ocupadas = new Set(["10:00", "13:00", "16:00"]);
  return (
    <div className="flex h-full flex-col gap-[6px] px-[9px] pb-[9px] pt-[22px] text-[8px] leading-tight" style={{ background: t.fundo, color: t.tinta }}>
      <span className="truncate text-[9.5px] font-bold" style={titulo}>{lead.nome}</span>
      <span className="text-[12px] font-bold leading-[1.05]" style={titulo}>Marque seu horário</span>
      {servicos.map(([nome, preco], i) => (
        <div key={nome} className="flex items-center justify-between rounded-[6px] px-[6px] py-[5px]" style={i === 0 ? { background: t.mancha, boxShadow: `inset 0 0 0 1px ${t.destaque}` } : caixa}>
          <span className="truncate font-semibold">{nome}</span>
          <span className="font-bold tabular-nums">{reais(preco)}</span>
        </div>
      ))}
      <div className="grid grid-cols-4 gap-[4px]">
        {["qua 18", "qui 19", "sex 20", "sáb 21"].map((d, i) => (
          <span key={d} className="rounded-[5px] py-[3px] text-center text-[7px] font-semibold" style={i === 1 ? { background: t.destaque, color: t.noDestaque } : caixa}>{d}</span>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-[4px]">
        {horas.map((h) => (
          <span
            key={h}
            className="rounded-[5px] py-[3px] text-center text-[7.5px] font-semibold tabular-nums"
            style={h === "15:00" ? { background: t.destaque, color: t.noDestaque } : ocupadas.has(h) ? { color: t.suave, textDecoration: "line-through", opacity: 0.6 } : caixa}
          >
            {h}
          </span>
        ))}
      </div>
      <span className="mt-auto rounded-[7px] py-[6px] text-center text-[8.5px] font-bold" style={{ background: t.destaque, color: t.noDestaque }}>
        Marcar qui 19 às 15:00
      </span>
    </div>
  );
}

/** Notebook do studio: alunos, mensalidades e aulas do dia. */
function PainelAlunos({ lead, aulas }: { lead: Lead; aulas: string[] }) {
  const { t, titulo, caixa } = useTela(lead);
  const turmas: [hora: string, aula: string, vagas: string][] = [["07:00", aulas[0], "6/8"], ["09:00", aulas[1], "8/8"], ["18:00", aulas[2], "5/8"], ["19:00", aulas[0], "7/8"]];
  const atrasadas: [nome: string, venceu: string][] = [["Mariana", "venceu dia 10"], ["Rafael", "venceu dia 12"], ["Bianca", "venceu dia 15"]];
  return (
    <div className="flex h-full flex-col gap-[7px] p-[9px] text-[8.5px] leading-tight" style={{ background: t.fundo, color: t.tinta }}>
      <div className="flex items-center gap-1.5">
        <span className="size-[14px] rounded-[4px]" style={{ background: t.destaque }} />
        <span className="min-w-0 flex-1 truncate text-[10.5px] font-bold" style={titulo}>{lead.nome}</span>
        <span style={{ color: t.suave }}>Novembro</span>
      </div>
      <div className="grid grid-cols-3 gap-[6px]">
        {([["Alunos ativos", "86"], ["Mensalidade em dia", "92%"], ["Atrasadas", "7"]] as const).map(([nome, valor], i) => (
          <div key={nome} className="rounded-[6px] px-[7px] py-[5px]" style={i === 1 ? { background: t.destaque, color: t.noDestaque } : caixa}>
            <span className="block text-[7.5px] opacity-75">{nome}</span>
            <span className="block text-[14px] font-bold tabular-nums" style={titulo}>{valor}</span>
          </div>
        ))}
      </div>
      <div className="grid min-h-0 flex-1 grid-cols-2 gap-[6px]">
        <div className="flex flex-col gap-[3px] rounded-[6px] p-[6px]" style={caixa}>
          <span className="mb-[2px] text-[8px] font-bold">Aulas de hoje</span>
          {turmas.map(([hora, aula, vagas]) => (
            <div key={hora} className="flex items-center gap-[5px] rounded-[4px] py-[2px] pl-[4px]" style={{ borderLeft: `2px solid ${t.destaque}` }}>
              <span className="w-[24px] tabular-nums" style={{ color: t.suave }}>{hora}</span>
              <span className="min-w-0 flex-1 truncate font-semibold">{aula}</span>
              <span className="tabular-nums" style={{ color: t.suave }}>{vagas}</span>
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-[3px] rounded-[6px] p-[6px]" style={caixa}>
          <span className="mb-[2px] text-[8px] font-bold">Mensalidade atrasada</span>
          {atrasadas.map(([nome, venceu]) => (
            <div key={nome} className="flex items-center gap-[4px] py-[2px]">
              <span className="min-w-0 flex-1">
                <span className="block truncate font-semibold">{nome}</span>
                <span className="block text-[7px]" style={{ color: t.suave }}>{venceu}</span>
              </span>
              <span className="rounded-full px-[5px] py-[2px] text-[7px] font-bold" style={{ background: "#25d366", color: "#ffffff" }}>Cobrar</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Celular do aluno: próxima aula, mensalidade e remarcar. */
function AppAluno({ lead, aulas }: { lead: Lead; aulas: string[] }) {
  const { t, titulo, caixa } = useTela(lead);
  return (
    <div className="flex h-full flex-col gap-[6px] px-[9px] pb-[9px] pt-[22px] text-[8px] leading-tight" style={{ background: t.fundo, color: t.tinta }}>
      <span className="truncate text-[9.5px] font-bold" style={titulo}>{lead.nome}</span>
      <span className="text-[12px] font-bold leading-[1.05]" style={titulo}>Oi, Carla</span>
      <div className="rounded-[7px] p-[7px]" style={{ background: t.destaque, color: t.noDestaque }}>
        <span className="block text-[7px] opacity-80">Sua próxima aula</span>
        <span className="block text-[10px] font-bold">{aulas[0]} · qui 19, 18:00</span>
        <span className="mt-[5px] block rounded-[5px] py-[3px] text-center text-[7.5px] font-bold" style={{ background: t.noDestaque, color: t.destaque }}>Confirmar presença</span>
      </div>
      <div className="flex items-center justify-between rounded-[6px] px-[6px] py-[5px]" style={caixa}>
        <span>Mensalidade de novembro</span>
        <span className="font-bold" style={{ color: "#1f9d55" }}>Paga</span>
      </div>
      <span className="mt-[2px] text-[8.5px] font-bold">Remarcar aula</span>
      <div className="grid grid-cols-2 gap-[4px]">
        {["sex 20 · 07:00", "sex 20 · 18:00", "sáb 21 · 09:00", "seg 23 · 19:00"].map((h, i) => (
          <span key={h} className="rounded-[5px] py-[4px] text-center text-[7px] font-semibold tabular-nums" style={i === 2 ? { color: t.suave, textDecoration: "line-through", opacity: 0.6 } : caixa}>
            {h}
          </span>
        ))}
      </div>
      <span className="mt-auto rounded-[7px] py-[6px] text-center text-[8.5px] font-bold" style={caixa}>
        Minhas aulas do mês: 7
      </span>
    </div>
  );
}

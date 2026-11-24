import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { ArrowLeft, CalendarCheck, Check, Clock, MessageCircle, X } from "lucide-react";
import { FONTES_NA_TELA, TEXTO } from "./Demonstracao";
import { agoraSP, somarDias } from "./agenda";
import { lugarDe, type Lead } from "./leads";
import { Avatar, Marcado, SERIF_SISTEMA, conteudo, reais } from "./sistemaConteudo";

// Demonstração de clicar do sistema da loja, para mostrar pessoalmente no celular: o cliente marca
// (serviço ou aula, profissional, dia e hora), o dono vê na agenda do balcão e no resumo do mês.
// Tudo com o nome, as cores e os serviços do tipo da loja. Nomes, preços e horários são de exemplo.

type Aba = "site" | "agenda" | "resumo";

const SEMANA = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];
const SEMANA_LONGA = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"];
const MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
const HORAS = ["08:00", "09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"];
const CLIENTES = ["Mariana", "João Pedro", "Fernanda", "Lucas", "Patrícia", "Rafael", "Camila"];

/** Alguns horários ocupados em cada dia, sempre os mesmos (a demonstração não muda a cada toque). */
const ocupado = (dia: number, i: number) => (dia * 7 + i * 3) % 5 === 0 || (dia + i) % 7 === 3;

interface Marcacao {
  item: number;
  pessoa: number;
  dia: number;
  hora: string;
  nome: string;
}

export function DemoClicavel({ lead, onFechar }: { lead: Lead; onFechar: () => void }) {
  const c = useMemo(() => conteudo(lead), [lead]);
  const { t } = c;
  const alunos = c.sis.id === "alunos";
  const fechar = useRef<HTMLButtonElement>(null);
  const rolagem = useRef<HTMLDivElement>(null);
  const reserva = useRef<HTMLElement>(null);
  const [aba, setAba] = useState<Aba>("site");
  const [passo, setPasso] = useState(0);
  const [escolha, setEscolha] = useState<Marcacao>({ item: 0, pessoa: 0, dia: 0, hora: "", nome: "" });
  const [feita, setFeita] = useState<Marcacao | null>(null);

  useEffect(() => {
    fechar.current?.focus();
    // Esc fecha só a demonstração (a tela do sistema, embaixo, continua aberta).
    const tecla = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.stopImmediatePropagation();
      onFechar();
    };
    window.addEventListener("keydown", tecla, true);
    return () => window.removeEventListener("keydown", tecla, true);
  }, [onFechar]);

  // Próximos 6 dias de atendimento (sem domingo), a partir de amanhã.
  const dias = useMemo(() => {
    const lista: Date[] = [];
    for (let i = 1; lista.length < 6 && i < 14; i++) {
      const d = somarDias(agoraSP(), i);
      if (d.getDay() !== 0) lista.push(d);
    }
    return lista;
  }, []);
  const diaLongo = (d: Date) => `${SEMANA_LONGA[d.getDay()]}, ${d.getDate()} de ${MESES[d.getMonth()]}`;

  const linha = `color-mix(in srgb, ${t.tinta} 12%, transparent)`;
  const caixa: CSSProperties = { background: t.cartao, boxShadow: `inset 0 0 0 1px ${linha}` };
  const marcado: CSSProperties = { background: t.mancha, boxShadow: `inset 0 0 0 1.5px ${t.destaque}` };
  const botao: CSSProperties = { background: t.destaque, color: t.noDestaque };
  const titulo: CSSProperties = { fontFamily: SERIF_SISTEMA };
  const Marca = t.servicos[0][2];

  const item = c.itens[escolha.item];
  const pessoa = c.pessoas[escolha.pessoa];
  const preco = alunos ? c.total[0] : item.linha.split(" · ")[0];
  const irPara = (n: number) => {
    setPasso(n);
    window.requestAnimationFrame(() => reserva.current?.scrollIntoView({ block: "start", behavior: "smooth" }));
  };
  const confirmar = () => {
    setFeita({ ...escolha, nome: escolha.nome.trim() || "Você" });
    setPasso(4);
  };

  // Agenda do balcão: horários de exemplo do dia, mais o que acabou de ser marcado.
  const agendaDoDia = useMemo(() => {
    const dia = feita?.dia ?? 0;
    const doDia = HORAS.flatMap((hora, i) =>
      ocupado(dia, i)
        ? [{ hora, nome: CLIENTES[(i + dia) % CLIENTES.length], item: (i + dia) % c.itens.length, pessoa: i % c.pessoas.length, nova: false }]
        : [],
    );
    if (feita) doDia.push({ hora: feita.hora, nome: feita.nome, item: feita.item, pessoa: feita.pessoa, nova: true });
    return doDia.sort((a, b) => a.hora.localeCompare(b.hora));
  }, [feita, c.itens.length, c.pessoas.length]);

  const abas: [Aba, string][] = [
    ["site", "Site"],
    ["agenda", alunos ? "Turmas" : "Agenda"],
    ["resumo", "Resumo"],
  ];

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Demonstração de clicar: ${lead.nome}`}
      className="fixed inset-0 z-[90] flex flex-col bg-[var(--bjork-bg)]"
    >
      <div className="shrink-0 border-b border-[color:var(--bjork-border)] bg-[var(--bjork-panel)] px-3 pb-2.5 pt-2 text-[color:var(--bjork-text)]">
        <div className="flex items-center gap-2.5">
          <button
            ref={fechar}
            type="button"
            onClick={onFechar}
            aria-label="Fechar demonstração de clicar"
            className="grid size-10 shrink-0 cursor-pointer place-items-center rounded-full bg-[var(--bjork-surface-active)] focus-visible:ring-2 focus-visible:ring-[color:var(--bjork-accent)]"
          >
            <X aria-hidden="true" className="size-5" />
          </button>
          <p className="min-w-0 flex-1 text-[12px] leading-snug text-[color:var(--bjork-text-muted)]">
            Demonstração BN Digital · nomes, preços e horários de exemplo
          </p>
        </div>
        <div className="mt-2 grid grid-cols-3 gap-1 rounded-[12px] bg-[var(--bjork-surface-active)] p-1" role="tablist" aria-label="Partes do sistema">
          {abas.map(([id, nome]) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={aba === id}
              onClick={() => {
                setAba(id);
                rolagem.current?.scrollTo({ top: 0 });
              }}
              className="h-9 cursor-pointer rounded-[9px] text-[13.5px] font-semibold transition-colors"
              style={aba === id ? { background: t.destaque, color: t.noDestaque } : { color: "var(--bjork-text-muted)" }}
            >
              {nome}
            </button>
          ))}
        </div>
      </div>

      <div ref={rolagem} className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <div
          className="mx-auto min-h-full w-full max-w-[480px]"
          style={{ background: t.fundo, color: t.tinta, fontFamily: `"${TEXTO}", "Roboto", system-ui, sans-serif` }}
        >
          <style>{FONTES_NA_TELA}</style>
          <header className="flex items-center gap-2.5 px-5 py-3.5" style={{ borderBottom: `1px solid ${linha}` }}>
            <span className="grid size-9 shrink-0 place-items-center rounded-[10px]" style={{ boxShadow: `inset 0 0 0 1px ${t.destaque}`, color: t.destaque }}>
              <Marca aria-hidden="true" className="size-[18px]" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[18px] font-semibold leading-tight" style={titulo}>{lead.nome}</span>
              <span className="block text-[11px] uppercase tracking-[0.12em]" style={{ color: t.suave }}>{lugarDe(lead)}</span>
            </span>
            {aba === "site" && passo < 4 && (
              <button type="button" onClick={() => irPara(passo)} className="h-9 shrink-0 cursor-pointer rounded-[10px] px-3 text-[13px] font-bold" style={{ boxShadow: `inset 0 0 0 1px ${t.destaque}`, color: t.destaque }}>
                {alunos ? "Marcar aula" : "Agendar"}
              </button>
            )}
          </header>

          {aba === "site" && (
            <>
              <section className="relative overflow-hidden">
                <img src={c.foto} alt="" className="absolute inset-0 h-full w-full object-cover" style={{ objectPosition: "center 30%" }} />
                <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${t.fundo}55 0%, ${t.fundo}cc 55%, ${t.fundo} 100%)` }} />
                <div className="relative px-5 pb-6 pt-24">
                  <span className="inline-flex rounded-full px-3 py-1 text-[12px]" style={{ ...caixa, color: t.suave }}>
                    <b style={{ color: t.destaque }}>★</b>&nbsp;{c.selo}
                  </span>
                  <h1 className="mt-3 text-[34px] font-semibold leading-[1.04]" style={titulo}>
                    {c.titulo[0]} <em className="block" style={{ color: t.destaque }}>{c.titulo[1]}</em>
                  </h1>
                  <p className="mt-2 text-[14px] leading-snug" style={{ color: t.suave }}>{c.chamada}</p>
                  <button type="button" onClick={() => irPara(0)} className="mt-4 h-11 cursor-pointer rounded-[11px] px-5 text-[14.5px] font-bold" style={botao}>
                    {c.agendar}
                  </button>
                  <p className="mt-3 flex items-center gap-1.5 text-[12.5px]" style={{ color: t.suave }}>
                    <Clock aria-hidden="true" className="size-4" style={{ color: t.destaque }} /> {c.horario}
                  </p>
                </div>
              </section>

              <section ref={reserva} aria-label={c.agendar} className="scroll-mt-2 px-4 pb-8 pt-2">
                <div className="rounded-[18px] p-4" style={{ ...caixa, background: `color-mix(in srgb, ${t.cartao} 70%, ${t.fundo})` }}>
                  <h2 className="text-[24px] font-semibold leading-none" style={titulo}>{c.agendar}</h2>
                  {passo < 4 && (
                    <ol className="mt-4 flex items-center gap-1.5" aria-label="Etapas">
                      {c.passos.map(([nome], i) => (
                        <li key={nome} className="flex flex-1 items-center gap-1.5" aria-current={i === passo ? "step" : undefined}>
                          {i < passo ? (
                            <Marcado t={t} tamanho={26} />
                          ) : (
                            <span className="grid size-[26px] shrink-0 place-items-center rounded-full text-[12px] font-bold" style={i === passo ? botao : { boxShadow: `inset 0 0 0 1px ${linha}`, color: t.suave }}>
                              {i + 1}
                            </span>
                          )}
                          {i < 3 && <span className="h-px flex-1" style={{ background: linha }} />}
                        </li>
                      ))}
                    </ol>
                  )}

                  {passo === 0 && (
                    <Lista titulo={c.colunas[0]}>
                      {c.itens.map((it, i) => (
                        <Opcao key={it.nome} ativa={escolha.item === i} estilo={escolha.item === i ? marcado : caixa} t={t} onClick={() => { setEscolha({ ...escolha, item: i }); irPara(1); }}>
                          <span className="block text-[14.5px] font-semibold">{it.nome}</span>
                          <span className="block text-[12.5px]" style={{ color: t.suave }}>{it.linha}</span>
                        </Opcao>
                      ))}
                    </Lista>
                  )}
                  {passo === 1 && (
                    <Lista titulo={c.colunas[1]} voltar={() => irPara(0)} t={t}>
                      {c.pessoas.map((p, i) => (
                        <Opcao key={p[0]} ativa={escolha.pessoa === i} estilo={escolha.pessoa === i ? marcado : caixa} t={t} onClick={() => { setEscolha({ ...escolha, pessoa: i }); irPara(2); }}>
                          <span className="flex items-center gap-3">
                            <Avatar pessoa={p} tamanho={42} t={t} />
                            <span>
                              <span className="block text-[14.5px] font-semibold">{p[0]}</span>
                              <span className="block text-[12.5px]" style={{ color: t.suave }}><b style={{ color: t.destaque }}>★ 4,{9 - (i % 2)}</b> · {p[1]}</span>
                            </span>
                          </span>
                        </Opcao>
                      ))}
                    </Lista>
                  )}
                  {passo === 2 && (
                    <Lista titulo={c.colunas[2]} voltar={() => irPara(1)} t={t}>
                      <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1">
                        {dias.map((d, i) => (
                          <button key={i} type="button" aria-pressed={escolha.dia === i} onClick={() => setEscolha({ ...escolha, dia: i, hora: "" })} className="flex h-16 w-[62px] shrink-0 cursor-pointer flex-col items-center justify-center rounded-[12px]" style={escolha.dia === i ? botao : caixa}>
                            <span className="text-[11.5px] uppercase">{SEMANA[d.getDay()]}</span>
                            <span className="text-[20px] font-bold tabular-nums leading-tight">{d.getDate()}</span>
                          </button>
                        ))}
                      </div>
                      <p className="mt-2 text-[13px] font-semibold">Horários</p>
                      <div className="grid grid-cols-4 gap-1.5">
                        {HORAS.map((h, i) => {
                          const cheio = ocupado(escolha.dia, i);
                          return (
                            <button key={h} type="button" disabled={cheio} aria-pressed={escolha.hora === h} aria-label={cheio ? `${h}, ocupado` : h} onClick={() => setEscolha({ ...escolha, hora: h })} className="h-10 cursor-pointer rounded-[9px] text-[13.5px] font-semibold tabular-nums disabled:cursor-not-allowed" style={cheio ? { color: t.suave, textDecoration: "line-through", opacity: 0.45 } : escolha.hora === h ? botao : caixa}>
                              {h}
                            </button>
                          );
                        })}
                      </div>
                      <button type="button" disabled={!escolha.hora} onClick={() => irPara(3)} className="mt-3 h-12 w-full cursor-pointer rounded-[12px] text-[15px] font-bold disabled:opacity-40" style={botao}>
                        Continuar
                      </button>
                    </Lista>
                  )}
                  {passo === 3 && (
                    <Lista titulo="Revise e confirme" voltar={() => irPara(2)} t={t}>
                      <dl className="grid gap-2 rounded-[12px] p-3.5" style={caixa}>
                        {[
                          [c.passos[0][0], item.nome],
                          [c.passos[1][0], pessoa[0]],
                          ["Data", diaLongo(dias[escolha.dia])],
                          ["Horário", escolha.hora],
                        ].map(([rotulo, valor]) => (
                          <div key={rotulo} className="flex justify-between gap-3 text-[14px]">
                            <dt style={{ color: t.suave }}>{rotulo}</dt>
                            <dd className="text-right font-semibold">{valor}</dd>
                          </div>
                        ))}
                        <div className="mt-1 flex items-baseline justify-between pt-2" style={{ borderTop: `1px solid ${linha}` }}>
                          <dt className="text-[13px] font-bold">{c.total[1]}</dt>
                          <dd className="text-[22px] font-semibold" style={{ ...titulo, color: t.destaque }}>{preco}</dd>
                        </div>
                      </dl>
                      <label className="mt-2 block text-[13px] font-semibold">
                        Seu nome
                        <input value={escolha.nome} onChange={(e) => setEscolha({ ...escolha, nome: e.target.value })} placeholder="Como te chamamos?" className="mt-1 h-11 w-full rounded-[10px] px-3 text-[15px] outline-none" style={{ ...caixa, color: t.tinta }} />
                      </label>
                      <button type="button" onClick={confirmar} className="mt-3 h-12 w-full cursor-pointer rounded-[12px] text-[15px] font-bold" style={botao}>
                        {c.botao}
                      </button>
                    </Lista>
                  )}
                  {passo === 4 && feita && (
                    <div role="status" className="mt-4 flex flex-col items-center gap-2 text-center">
                      <span className="grid size-14 place-items-center rounded-full" style={botao}><Check aria-hidden="true" className="size-7" strokeWidth={3} /></span>
                      <p className="text-[22px] font-semibold" style={titulo}>{alunos ? "Aula marcada!" : "Horário marcado!"}</p>
                      <p className="text-[14px] leading-snug" style={{ color: t.suave }}>
                        {c.itens[feita.item].nome} com {c.pessoas[feita.pessoa][0]}, {diaLongo(dias[feita.dia])} às {feita.hora}.
                      </p>
                      <p className="flex items-center gap-1.5 text-[13px]" style={{ color: t.suave }}>
                        <MessageCircle aria-hidden="true" className="size-4" style={{ color: t.destaque }} /> A confirmação chega no WhatsApp.
                      </p>
                      <div className="mt-2 grid w-full gap-2">
                        <button type="button" onClick={() => { setAba("agenda"); rolagem.current?.scrollTo({ top: 0 }); }} className="h-12 cursor-pointer rounded-[12px] text-[15px] font-bold" style={botao}>
                          {alunos ? "Ver nas turmas do studio" : "Ver na agenda do balcão"}
                        </button>
                        <button type="button" onClick={() => { setEscolha({ item: 0, pessoa: 0, dia: 0, hora: "", nome: "" }); irPara(0); }} className="h-11 cursor-pointer rounded-[12px] text-[14px] font-semibold" style={caixa}>
                          Marcar outro
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </section>
            </>
          )}

          {aba === "agenda" && (
            <section aria-label={alunos ? "Turmas do dia" : "Agenda do dia"} className="px-4 pb-8 pt-5">
              <p className="text-[12px] uppercase tracking-[0.12em]" style={{ color: t.suave }}>{alunos ? "No notebook do studio" : "No notebook do balcão"}</p>
              <h2 className="mt-1 text-[26px] font-semibold leading-tight" style={titulo}>{diaLongo(dias[feita?.dia ?? 0]).replace(/^./, (x) => x.toUpperCase())}</h2>
              <p className="mt-1 text-[13.5px]" style={{ color: t.suave }}>{agendaDoDia.length} {alunos ? "aulas marcadas" : "atendimentos"} · {c.horario}</p>
              <ol className="mt-4 grid gap-2">
                {agendaDoDia.map((m) => (
                  <li key={`${m.hora}-${m.nome}`} className="flex items-center gap-3 rounded-[12px] p-3" style={m.nova ? marcado : caixa}>
                    <span className="w-[50px] shrink-0 text-[15px] font-bold tabular-nums" style={{ color: t.destaque }}>{m.hora}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[14.5px] font-semibold">{m.nome}</span>
                      <span className="block truncate text-[12.5px]" style={{ color: t.suave }}>{c.itens[m.item].nome} · {c.pessoas[m.pessoa][0]}</span>
                    </span>
                    {m.nova ? (
                      <span className="rounded-full px-2.5 py-1 text-[11.5px] font-bold" style={botao}>Novo</span>
                    ) : (
                      <span className="rounded-full px-2.5 py-1 text-[11.5px] font-semibold" style={{ ...caixa, color: t.suave }}>Confirmado</span>
                    )}
                  </li>
                ))}
              </ol>
              {!feita && (
                <button type="button" onClick={() => { setAba("site"); irPara(0); }} className="mt-4 h-11 w-full cursor-pointer rounded-[12px] text-[14px] font-semibold" style={caixa}>
                  Marque um horário no Site e veja ele chegar aqui
                </button>
              )}
            </section>
          )}

          {aba === "resumo" && <Resumo c={c} alunos={alunos} caixa={caixa} titulo={titulo} />}
        </div>
      </div>
    </div>,
    document.body,
  );
}

type Conteudo = ReturnType<typeof conteudo>;

function Lista({ titulo, voltar, t, children }: { titulo: string; voltar?: () => void; t?: Conteudo["t"]; children: ReactNode }) {
  return (
    <div className="mt-4 grid gap-2">
      <div className="flex items-center gap-2">
        {voltar && (
          <button type="button" onClick={voltar} aria-label="Voltar" className="grid size-8 cursor-pointer place-items-center rounded-full" style={{ color: t?.suave }}>
            <ArrowLeft aria-hidden="true" className="size-[18px]" />
          </button>
        )}
        <p className="text-[15px] font-bold">{titulo}</p>
      </div>
      {children}
    </div>
  );
}

function Opcao({ ativa, estilo, t, onClick, children }: { ativa: boolean; estilo: CSSProperties; t: Conteudo["t"]; onClick: () => void; children: ReactNode }) {
  return (
    <button type="button" aria-pressed={ativa} onClick={onClick} className="flex w-full cursor-pointer items-center justify-between gap-3 rounded-[12px] px-3.5 py-3 text-left" style={estilo}>
      <span className="min-w-0">{children}</span>
      {ativa ? <Marcado t={t} tamanho={22} /> : <span className="size-[20px] shrink-0 rounded-full" style={{ boxShadow: `inset 0 0 0 1.5px color-mix(in srgb, ${t.tinta} 25%, transparent)` }} />}
    </button>
  );
}

/** Números do mês, de exemplo, com o que o dono quer saber: quanto entrou e o dia mais cheio. */
function Resumo({ c, alunos, caixa, titulo }: { c: Conteudo; alunos: boolean; caixa: CSSProperties; titulo: CSSProperties }) {
  const { t } = c;
  const porDia = [62, 74, 68, 81, 96, 100]; // seg a sáb, em % do dia mais cheio
  // "R$ 1.200 · 6 horas" → 1200
  const precoDe = (linha: string) => Number(linha.split(" · ")[0].replace(/\D/g, "")) || 0;
  const precoMedio = alunos ? 0 : Math.round(c.itens.reduce((s, it) => s + precoDe(it.linha), 0) / c.itens.length);
  const cartoes: [string, string][] = alunos
    ? [["Alunos ativos", "64"], ["Mensalidades em dia", "58"], ["Atrasadas", "6"], ["Turma mais cheia", c.itens[0].nome]]
    : [["Atendimentos no mês", "186"], ["Entrou no mês", reais(186 * (precoMedio || 50))], ["Dia mais cheio", "Sábado"], ["Mais pedido", c.itens[0].nome]];
  return (
    <section aria-label="Resumo do mês" className="px-4 pb-8 pt-5">
      <p className="text-[12px] uppercase tracking-[0.12em]" style={{ color: t.suave }}>Resumo do mês · números de exemplo</p>
      <div className="mt-3 grid grid-cols-2 gap-2">
        {cartoes.map(([rotulo, valor]) => (
          <div key={rotulo} className="rounded-[14px] p-3.5" style={caixa}>
            <p className="text-[12px]" style={{ color: t.suave }}>{rotulo}</p>
            <p className="mt-1 text-[22px] font-semibold leading-tight [overflow-wrap:anywhere]" style={{ ...titulo, color: t.destaque }}>{valor}</p>
          </div>
        ))}
      </div>
      <div className="mt-3 rounded-[14px] p-4" style={caixa}>
        <p className="flex items-center gap-1.5 text-[13.5px] font-bold"><CalendarCheck aria-hidden="true" className="size-4" style={{ color: t.destaque }} /> Movimento por dia</p>
        <div className="mt-3 flex h-28 items-end gap-2">
          {porDia.map((p, i) => (
            <div key={i} className="flex flex-1 flex-col items-center gap-1">
              <div className="w-full rounded-t-[6px]" style={{ height: `${p}%`, background: i === 5 ? t.destaque : `color-mix(in srgb, ${t.destaque} 40%, transparent)` }} />
              <span className="text-[11px]" style={{ color: t.suave }}>{SEMANA[i + 1]}</span>
            </div>
          ))}
        </div>
      </div>
      {alunos && (
        <div className="mt-3 flex items-center justify-between gap-3 rounded-[14px] p-3.5" style={caixa}>
          <span className="text-[13.5px]">6 mensalidades atrasadas</span>
          <span className="flex items-center gap-1.5 rounded-[10px] px-3 py-2 text-[13px] font-bold" style={{ background: t.destaque, color: t.noDestaque }}>
            <MessageCircle aria-hidden="true" className="size-4" /> Cobrar no WhatsApp
          </span>
        </div>
      )}
    </section>
  );
}

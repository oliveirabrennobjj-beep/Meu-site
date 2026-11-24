import { useEffect, useMemo, useState } from "react";
import { CalendarPlus, Check, ChevronRight, Copy, MapPin, MessageCircle, UserX, X } from "lucide-react";
import {
  BlockButton,
  BlockDrawer,
  IconButton,
  buttonClass,
  cardSurface,
  fieldClass,
  focusRing,
} from "@/components/ui/app-dashboard-shell-utils/app-block-kit";
import { cn } from "@/lib/utils";
import {
  MODELOS_NOMES,
  PRIORIDADES,
  RESULTADOS,
  SERVICOS,
  TIPOS,
  aConfirmar,
  agoraSP,
  dataBr,
  diaFalado,
  diasSugeridos,
  falta,
  horariosLivres,
  inicioDe,
  preencherModelo,
  somarDias,
  chaveDia,
  vivo,
  type Compromisso,
  type ConfigAgenda,
  type ModeloId,
  type Resultado,
} from "./agenda";
import { EtiquetaStatus, Pilula, TIPO_ICONE, faixaHorario, rotulo } from "./agendaUi";
import type { Rascunho } from "./CompromissoForm";
import { AssistenteHorario } from "./AssistenteHorario";
import { linkMaps, linkWhatsApp, numeroConversa, type Lead } from "./leads";

/** Texto pronto + botões para abrir no WhatsApp (mesmo número da conversa), copiar e marcar "cliente avisado". */
export function Mensageiro({
  lead,
  modelos,
  textoDe,
  avisos,
  onAvisado,
  avisar,
}: {
  lead: Lead;
  modelos: ModeloId[];
  textoDe: (m: ModeloId) => string;
  avisos?: Partial<Record<ModeloId, string>>;
  onAvisado?: (m: ModeloId, sim: boolean) => void;
  avisar: (t: string) => void;
}) {
  const [modelo, setModelo] = useState(modelos[0]);
  const [texto, setTexto] = useState(() => textoDe(modelos[0]));
  const trocar = (m: ModeloId) => {
    setModelo(m);
    setTexto(textoDe(m));
  };
  const numero = numeroConversa(lead);
  const avisado = Boolean(avisos?.[modelo]);
  return (
    <div className="flex flex-col gap-2">
      {modelos.length > 1 && (
        <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-0.5">
          {modelos.map((m) => (
            <Pilula key={m} ativa={m === modelo} onClick={() => trocar(m)} className="h-8 px-2.5 text-[12.5px]">
              {avisos?.[m] && <Check aria-hidden="true" />}
              {MODELOS_NOMES[m]}
            </Pilula>
          ))}
        </div>
      )}
      <textarea
        aria-label={`Mensagem: ${MODELOS_NOMES[modelo]}`}
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        rows={Math.min(7, Math.max(3, Math.ceil(texto.length / 42)))}
        className={cn(fieldClass, "py-2.5 text-[13.5px] leading-snug")}
      />
      <div className="flex flex-wrap items-center gap-2">
        <a
          href={linkWhatsApp(lead, texto, numero)}
          target="_blank"
          rel="noreferrer"
          onClick={() => onAvisado?.(modelo, true)}
          className={buttonClass("primary", "md")}
        >
          <MessageCircle aria-hidden="true" />
          {numero ? "Abrir no WhatsApp" : "Escolher contato no WhatsApp"}
        </a>
        <BlockButton
          variant="secondary"
          onClick={() => {
            navigator.clipboard?.writeText(texto).then(
              () => avisar("Mensagem copiada"),
              () => avisar("Não deu para copiar: selecione o texto e copie"),
            );
          }}
        >
          <Copy aria-hidden="true" />
          Copiar
        </BlockButton>
        {onAvisado && (
          <label className="ml-auto inline-flex cursor-pointer items-center gap-2 text-[13px]">
            <input
              type="checkbox"
              checked={avisado}
              onChange={(e) => onAvisado(modelo, e.target.checked)}
              className="size-4 accent-[var(--bjork-accent)]"
            />
            Cliente avisado
          </label>
        )}
      </div>
    </div>
  );
}

export function CompromissoFicha({
  compromisso,
  lead,
  compromissos,
  cfg,
  onFechar,
  onSalvar,
  onFormulario,
  onAbrirLead,
  onDesmarcarLegado,
  onNaoQuer,
  leads,
  onSalvarLoja,
  avisar,
}: {
  compromisso: Compromisso | null;
  lead: Lead | null;
  compromissos: Compromisso[];
  cfg: ConfigAgenda;
  onFechar: () => void;
  onSalvar: (c: Compromisso) => void;
  onFormulario: (r: Rascunho) => void;
  onAbrirLead: ((lead: Lead) => void) | null;
  onDesmarcarLegado: (leadId: string) => void;
  onNaoQuer: (c: Compromisso, motivo: string) => void;
  /** Lojas e gravação da loja, para o assistente da ficha. */
  leads: Lead[];
  onSalvarLoja: (id: string, mudanca: Partial<Lead>) => void;
  avisar: (t: string) => void;
}) {
  const [mostrado, setMostrado] = useState({ compromisso, lead });
  useEffect(() => {
    if (compromisso) setMostrado({ compromisso, lead });
  }, [compromisso, lead]);
  const atual = compromisso ? { compromisso, lead } : mostrado;
  const c = atual.compromisso;
  return (
    <BlockDrawer
      open={compromisso !== null}
      onClose={onFechar}
      label={c ? `Horário com ${atual.lead?.nome ?? "cliente"}` : "Horário"}
      side="bottom"
    >
      {c && atual.lead && (
        <Ficha
          key={c.id}
          c={c}
          lead={atual.lead}
          compromissos={compromissos}
          cfg={cfg}
          onFechar={onFechar}
          onSalvar={onSalvar}
          onFormulario={onFormulario}
          onAbrirLead={onAbrirLead}
          onDesmarcarLegado={onDesmarcarLegado}
          onNaoQuer={onNaoQuer}
          leads={leads}
          onSalvarLoja={onSalvarLoja}
          avisar={avisar}
        />
      )}
    </BlockDrawer>
  );
}

type Painel = null | "realizado" | "remarcar" | "cancelar" | "naoquer";

function Ficha({
  c,
  lead,
  compromissos,
  cfg,
  onFechar,
  onSalvar,
  onFormulario,
  onAbrirLead,
  onDesmarcarLegado,
  onNaoQuer,
  leads,
  onSalvarLoja,
  avisar,
}: {
  c: Compromisso;
  lead: Lead;
  compromissos: Compromisso[];
  cfg: ConfigAgenda;
  onFechar: () => void;
  onSalvar: (c: Compromisso) => void;
  onFormulario: (r: Rascunho) => void;
  onAbrirLead: ((lead: Lead) => void) | null;
  onDesmarcarLegado: (leadId: string) => void;
  onNaoQuer: (c: Compromisso, motivo: string) => void;
  leads: Lead[];
  onSalvarLoja: (id: string, mudanca: Partial<Lead>) => void;
  avisar: (t: string) => void;
}) {
  const [painel, setPainel] = useState<Painel>(null);
  const [motivo, setMotivo] = useState("");
  const [nova, setNova] = useState({ data: c.data, hora: c.hora });
  const agora = agoraSP();
  const Icone = TIPO_ICONE[c.tipo];
  const inicio = inicioDe(c);
  const minutos = (inicio.getTime() - agora.getTime()) / 60_000;
  // Sem a confirmação do cliente, passar da hora não é atraso: o horário fica "a confirmar".
  const semConfirmar = aConfirmar(c);
  const aconteceu = vivo(c) && !semConfirmar && minutos < 0;
  const corFalta =
    minutos < 0 ? (semConfirmar ? "var(--blk-warning)" : "var(--blk-error)") : minutos <= 15 ? "var(--blk-warning)" : "var(--blk-accent-ink)";
  const livres = useMemo(
    () => horariosLivres(nova.data, c.duracao, compromissos, cfg, c.id).slice(0, 10),
    [nova.data, c.duracao, c.id, compromissos, cfg],
  );

  const salvar = (mudanca: Partial<Compromisso>, aviso: string) => {
    onSalvar({ ...c, ...mudanca });
    avisar(aviso);
  };

  // Combinado antigo (anotado na ficha da loja): só dá para virar horário marcado ou dar como feito.
  if (c.legado) {
    return (
      <>
        <Topo c={c} lead={lead} onFechar={onFechar} />
        <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto overscroll-contain px-5 pb-6">
          <p className="text-[13.5px] leading-snug">
            Combinado anotado na ficha da loja: <strong>{c.obs || "sem descrição"}</strong>,{" "}
            {diaFalado(c.data, agora)}
            {c.semHora ? "" : ` às ${c.hora}`}.
          </p>
          <BlockButton
            size="lg"
            onClick={() =>
              onFormulario({
                leadId: lead.id,
                data: c.data,
                ...(c.semHora ? {} : { hora: c.hora }),
                tipo: "retorno",
                obs: c.obs,
                deLegado: lead.id,
              })
            }
          >
            <CalendarPlus aria-hidden="true" />
            Virar horário marcado
          </BlockButton>
          <BlockButton
            variant="secondary"
            onClick={() => {
              onDesmarcarLegado(lead.id);
              onFechar();
            }}
          >
            <Check aria-hidden="true" />
            Já fiz, tirar da agenda
          </BlockButton>
          {onAbrirLead && (
            <BlockButton variant="ghost" onClick={() => onAbrirLead(lead)}>
              Ver ficha da loja
            </BlockButton>
          )}
        </div>
      </>
    );
  }

  const textoDe = (m: ModeloId) =>
    preencherModelo(cfg.modelos[m], lead, c, {
      diasSugeridos: diasSugeridos(compromissos, cfg, agora),
      novaData: nova.data,
      novaHora: nova.hora,
    });
  const modelos: ModeloId[] =
    c.status === "realizado" ? ["pos", "remarcacao"] : ["confirmacao", "lembrete", "remarcacao", "pos"];

  return (
    <>
      <Topo c={c} lead={lead} onFechar={onFechar} />
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto overscroll-contain px-5 pb-6">
        <dl className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-[13px]">
          <div>
            <dt className={rotulo}>Quando</dt>
            <dd className="font-medium">
              {diaFalado(c.data, agora).replace(/^./, (x) => x.toUpperCase())} · {faixaHorario(c)}
            </dd>
            {vivo(c) && (semConfirmar ? minutos > -24 * 60 : minutos > -c.duracao) && (
              <dd className="text-[12.5px] font-medium" style={{ color: corFalta }}>
                {minutos < 0
                  ? semConfirmar
                    ? "o cliente ainda não confirmou"
                    : `começou ${falta(inicio, agora)}`
                  : `${falta(inicio, agora)}${semConfirmar ? " · falta o cliente confirmar" : ""}`}
              </dd>
            )}
          </div>
          <div>
            <dt className={rotulo}>Tipo</dt>
            <dd className="inline-flex items-center gap-1.5 font-medium">
              <Icone aria-hidden="true" className="size-4" style={{ color: cfg.cores[c.tipo] }} />
              {TIPOS[c.tipo].nome}
            </dd>
          </div>
          <div>
            <dt className={rotulo}>Serviço</dt>
            <dd>{SERVICOS[c.servico]}</dd>
          </div>
          <div>
            <dt className={rotulo}>Prioridade</dt>
            <dd>{PRIORIDADES[c.prioridade]}</dd>
          </div>
          {(c.local || c.tipo === "visita") && (
            <div className="col-span-2">
              <dt className={rotulo}>{c.tipo === "online" ? "Link" : "Local"}</dt>
              <dd className="[overflow-wrap:anywhere]">{c.local || "Na loja"}</dd>
            </div>
          )}
          {c.obs && (
            <div className="col-span-2">
              <dt className={rotulo}>Observações</dt>
              <dd className="whitespace-pre-line">{c.obs}</dd>
            </div>
          )}
          {c.resultado && (
            <div className="col-span-2">
              <dt className={rotulo}>Resultado</dt>
              <dd className="font-medium">{RESULTADOS[c.resultado]}</dd>
            </div>
          )}
        </dl>

        {c.tipo === "visita" && (
          <a
            href={
              c.local
                ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(c.local)}`
                : linkMaps(lead)
            }
            target="_blank"
            rel="noreferrer"
            className={buttonClass("secondary", "md", "self-start")}
          >
            <MapPin aria-hidden="true" />
            Abrir no Maps
          </a>
        )}

        <section aria-label="Mensagem pronta" className={cn(cardSurface, "p-3")}>
          <h3 className="mb-2 text-[13.5px] font-semibold">Mensagem pronta</h3>
          <Mensageiro
            key={`${painel}-${nova.data}-${nova.hora}`}
            lead={lead}
            modelos={painel === "remarcar" ? ["remarcacao"] : modelos}
            textoDe={textoDe}
            avisos={c.avisos}
            onAvisado={(m, sim) => {
              const avisos = { ...c.avisos };
              if (sim) avisos[m] = new Date().toISOString();
              else delete avisos[m];
              onSalvar({ ...c, avisos });
            }}
            avisar={avisar}
          />
        </section>

        {/* Ações */}
        <div className="flex flex-wrap gap-2">
          {c.status === "agendado" || c.status === "remarcado" ? (
            <BlockButton variant="secondary" onClick={() => salvar({ status: "confirmado" }, "Horário confirmado")}>
              <Check aria-hidden="true" />
              Cliente confirmou
            </BlockButton>
          ) : null}
          {vivo(c) && (
            <BlockButton
              variant={aconteceu ? "primary" : "secondary"}
              onClick={() => setPainel(painel === "realizado" ? null : "realizado")}
            >
              Realizado
            </BlockButton>
          )}
          <BlockButton variant="secondary" onClick={() => setPainel(painel === "remarcar" ? null : "remarcar")}>
            Remarcar
          </BlockButton>
          {vivo(c) && (
            <BlockButton variant="ghost" onClick={() => setPainel(painel === "cancelar" ? null : "cancelar")}>
              Cancelar
            </BlockButton>
          )}
          <BlockButton
            variant="ghost"
            className="text-[color:var(--blk-error)]"
            onClick={() => setPainel(painel === "naoquer" ? null : "naoquer")}
          >
            <UserX aria-hidden="true" />
            Não quer mais
          </BlockButton>
        </div>

        {painel === "naoquer" && (
          <div className="flex flex-col gap-2 rounded-[12px] border border-[color:var(--blk-error)] p-3">
            <p className="text-[13px] leading-snug">
              Marcar que <strong>{lead.nome}</strong> não quer mais? Sai da agenda e vai pra "Não querem".
            </p>
            <input
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Motivo (opcional), ex.: achou caro"
              aria-label="Motivo de não querer"
              className={cn(fieldClass, "h-10 text-[13.5px]")}
            />
            <BlockButton variant="secondary" className="self-start" onClick={() => onNaoQuer(c, motivo)}>
              Sim, não quer mais
            </BlockButton>
          </div>
        )}

        {painel === "realizado" && (
          <div className="flex flex-col gap-2 rounded-[12px] border border-[color:var(--bjork-border-strong)] p-3">
            <p className="text-[13px] font-medium">Como foi?</p>
            <div className="flex flex-wrap gap-1.5">
              {(Object.keys(RESULTADOS) as Resultado[]).map((r) => (
                <Pilula
                  key={r}
                  ativa={false}
                  onClick={() => {
                    salvar({ status: "realizado", resultado: r }, `Realizado: ${RESULTADOS[r].toLowerCase()}`);
                    // Vai pensar: já sugere marcar o retorno daqui a 3 dias.
                    if (r === "pensar")
                      onFormulario({
                        leadId: c.leadId,
                        ...(c.cliente ? { cliente: c.cliente } : {}),
                        tipo: "retorno",
                        servico: c.servico,
                        data: chaveDia(somarDias(agora, 3)),
                        obs: "Retorno: ficou de pensar.",
                      });
                    else setPainel(null);
                  }}
                >
                  {RESULTADOS[r]}
                </Pilula>
              ))}
              <Pilula ativa={false} onClick={() => salvar({ status: "faltou" }, "Marcado: não compareceu")}>
                Não veio
              </Pilula>
            </div>
          </div>
        )}

        {painel === "remarcar" && (
          <div className="flex flex-col gap-2.5 rounded-[12px] border border-[color:var(--bjork-border-strong)] p-3">
            <div className="grid grid-cols-2 gap-2.5">
              <label className="flex flex-col gap-1.5">
                <span className={rotulo}>Nova data</span>
                <input
                  type="date"
                  value={nova.data}
                  onChange={(e) => setNova({ ...nova, data: e.target.value })}
                  className={cn(fieldClass, "h-11")}
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className={rotulo}>Nova hora</span>
                <input
                  type="time"
                  step={300}
                  value={nova.hora}
                  onChange={(e) => setNova({ ...nova, hora: e.target.value })}
                  className={cn(fieldClass, "h-11")}
                />
              </label>
            </div>
            {livres.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {livres.map((h) => (
                  <Pilula
                    key={h}
                    ativa={h === nova.hora}
                    onClick={() => setNova({ ...nova, hora: h })}
                    className="h-8 px-2.5 font-mono text-[12.5px]"
                  >
                    {h}
                  </Pilula>
                ))}
              </div>
            )}
            <BlockButton
              disabled={nova.data === c.data && nova.hora === c.hora}
              onClick={() => {
                salvar(
                  {
                    data: nova.data,
                    hora: nova.hora,
                    status: "remarcado",
                    avisos: {},
                    historico: [
                      ...c.historico,
                      { de: `${c.data} ${c.hora}`, para: `${nova.data} ${nova.hora}`, em: new Date().toISOString() },
                    ],
                  },
                  `Remarcado para ${dataBr(nova.data)} às ${nova.hora}`,
                );
                setPainel(null);
              }}
            >
              Salvar novo horário
            </BlockButton>
            <p className="text-[12px] text-[color:var(--bjork-text-muted)]">
              A mensagem de remarcação acima já usa a data nova.
            </p>
          </div>
        )}

        {painel === "cancelar" && (
          <div className="flex flex-wrap items-center gap-2 rounded-[12px] border border-[color:var(--blk-error)] p-3">
            <p className="flex-1 text-[13px]">Cancelar este horário? A loja volta para "precisam de retorno".</p>
            <BlockButton
              variant="secondary"
              onClick={() => {
                salvar({ status: "cancelado" }, "Horário cancelado");
                setPainel(null);
              }}
            >
              Sim, cancelar
            </BlockButton>
          </div>
        )}

        <AssistenteHorario
          c={c}
          lead={lead}
          leads={leads}
          agenda={compromissos}
          cfg={cfg}
          onSalvarLoja={onSalvarLoja}
          onCompromisso={onSalvar}
          onAbrirLead={onAbrirLead}
          avisar={avisar}
        />

        {c.historico.length > 0 && (
          <section aria-label="Histórico">
            <h3 className={cn(rotulo, "mb-1")}>Histórico</h3>
            <ul className="flex flex-col gap-1 text-[12.5px] text-[color:var(--bjork-text-medium)]">
              {c.historico.map((h, i) => (
                <li key={i}>
                  Remarcado de {dataBr(h.de.slice(0, 10))} {h.de.slice(11)} para {dataBr(h.para.slice(0, 10))}{" "}
                  {h.para.slice(11)}
                </li>
              ))}
            </ul>
          </section>
        )}

        <div className="flex flex-wrap gap-2 border-t border-[color:var(--bjork-border)] pt-3">
          <BlockButton variant="ghost" size="sm" onClick={() => onFormulario(c)}>
            Editar
          </BlockButton>
          <BlockButton
            variant="ghost"
            size="sm"
            onClick={() => {
              const { id: _id, historico: _h, avisos: _a, resultado: _r, status: _s, ...resto } = c;
              onFormulario({ ...resto, data: chaveDia(somarDias(inicio, 7)), exemplo: undefined });
            }}
          >
            Duplicar
          </BlockButton>
          {onAbrirLead && (
            <BlockButton variant="ghost" size="sm" onClick={() => onAbrirLead(lead)}>
              Ver ficha da loja
            </BlockButton>
          )}
          <BlockButton
            variant="ghost"
            size="sm"
            className="ml-auto text-[color:var(--blk-error)]"
            onClick={() => {
              salvar({ apagado: true }, "Horário apagado");
              onFechar();
            }}
          >
            Apagar
          </BlockButton>
        </div>
      </div>
    </>
  );
}

function Topo({ c, lead, onFechar }: { c: Compromisso; lead: Lead; onFechar: () => void }) {
  return (
    <>
      <div aria-hidden="true" className="mx-auto mt-2 h-1 w-9 shrink-0 rounded-full bg-[var(--bjork-border-strong)]" />
      <header className="flex shrink-0 items-start gap-3 px-5 pb-3 pt-3">
        <div className="min-w-0 flex-1">
          <h2 className="text-[17px] font-semibold leading-tight tracking-[-0.01em] [overflow-wrap:anywhere]">
            {lead.nome}
          </h2>
          <p className="mt-1 flex flex-wrap items-center gap-2 text-[13px] text-[color:var(--bjork-text-muted)]">
            <EtiquetaStatus c={c} />
            {c.exemplo && <span>Exemplo</span>}
            {lead.dono?.nome && <span>Dono: {lead.dono.nome}</span>}
          </p>
        </div>
        <IconButton label="Fechar" onClick={onFechar}>
          <X />
        </IconButton>
      </header>
    </>
  );
}

/** Seção "Agenda" na ficha da loja: próximo horário, os que já foram e pedir/agendar. */
export function AgendaDaLoja({
  lead,
  lista,
  cfg,
  compromissos,
  onAgendar,
  onAbrir,
  avisar,
}: {
  lead: Lead;
  lista: Compromisso[];
  cfg: ConfigAgenda;
  compromissos: Compromisso[];
  onAgendar: () => void;
  onAbrir: (c: Compromisso) => void;
  avisar: (t: string) => void;
}) {
  const [pedir, setPedir] = useState(false);
  const agora = agoraSP();
  const ordenada = [...lista].sort((a, b) => (a.data + a.hora).localeCompare(b.data + b.hora));
  const proximoDela = ordenada.find((c) => vivo(c) && inicioDe(c).getTime() > agora.getTime() - 3_600_000);
  const passados = ordenada.filter((c) => c !== proximoDela).slice(-3).reverse();
  return (
    <section aria-label="Agenda" className="flex flex-col gap-2 rounded-[12px] border border-[color:var(--bjork-border-strong)] bg-[var(--bjork-surface)] p-3">
      <h3 className="text-[13.5px] font-semibold">Agenda</h3>
      {proximoDela ? (
        <LinhaCompromisso c={proximoDela} nome={`${diaFalado(proximoDela.data, agora)} · ${faixaHorario(proximoDela)}`} cfg={cfg} onAbrir={onAbrir} />
      ) : (
        <p className="text-[13px] text-[color:var(--bjork-text-muted)]">Nenhum horário marcado com essa loja.</p>
      )}
      {passados.map((c) => (
        <LinhaCompromisso key={c.id} c={c} nome={`${dataBr(c.data)} · ${TIPOS[c.tipo].curto}`} cfg={cfg} onAbrir={onAbrir} />
      ))}
      <div className="flex flex-wrap gap-2">
        <BlockButton variant="secondary" onClick={onAgendar}>
          <CalendarPlus aria-hidden="true" />
          Agendar horário
        </BlockButton>
        {!proximoDela && (
          <BlockButton variant="ghost" onClick={() => setPedir(!pedir)} aria-expanded={pedir}>
            <MessageCircle aria-hidden="true" />
            Pedir horário
          </BlockButton>
        )}
      </div>
      {pedir && (
        <Mensageiro
          lead={lead}
          modelos={["pedirDias", "pedirAberto", "interesse"]}
          textoDe={(m) => preencherModelo(cfg.modelos[m], lead, null, { diasSugeridos: diasSugeridos(compromissos, cfg, agora) })}
          avisar={avisar}
        />
      )}
    </section>
  );
}

export function LinhaCompromisso({
  c,
  nome,
  detalhe,
  cfg,
  onAbrir,
  destaque,
}: {
  c: Compromisso;
  nome: string;
  detalhe?: string;
  cfg: ConfigAgenda;
  onAbrir: (c: Compromisso) => void;
  destaque?: string;
}) {
  const Icone = TIPO_ICONE[c.tipo];
  return (
    <button
      type="button"
      onClick={() => onAbrir(c)}
      className={cn(
        "flex w-full cursor-pointer items-center gap-3 rounded-[10px] border-l-[3px] bg-[var(--bjork-surface)] px-2.5 py-2 text-left transition-colors hover:bg-[var(--bjork-surface-hover)]",
        focusRing,
      )}
      style={{ borderLeftColor: cfg.cores[c.tipo] }}
    >
      <Icone aria-hidden="true" className="size-4 shrink-0" style={{ color: cfg.cores[c.tipo] }} />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[13.5px] font-medium">{nome}</span>
        {(detalhe || destaque) && (
          <span className="block truncate text-[12px] text-[color:var(--bjork-text-muted)]">
            {destaque && (
              <span className="font-semibold" style={{ color: destaque.startsWith("há") ? "var(--blk-error)" : undefined }}>
                {destaque}
                {detalhe ? " · " : ""}
              </span>
            )}
            {detalhe}
          </span>
        )}
      </span>
      <EtiquetaStatus c={c} />
      <ChevronRight aria-hidden="true" className="size-4 shrink-0 text-[color:var(--bjork-text-soft)]" />
    </button>
  );
}

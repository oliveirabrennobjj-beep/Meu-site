import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Search, X } from "lucide-react";
import {
  BlockButton,
  BlockDrawer,
  IconButton,
  fieldClass,
} from "@/components/ui/app-dashboard-shell-utils/app-block-kit";
import { cn } from "@/lib/utils";
import {
  PRIORIDADES,
  SERVICOS,
  STATUS_COMPROMISSO,
  STATUS_COMPROMISSO_ORDEM,
  TIPOS,
  TIPOS_ORDEM,
  agoraSP,
  chaveDia,
  conflitos,
  diaFalado,
  horariosLivres,
  inicioDe,
  leadDo,
  novoId,
  proximoLivre,
  type Compromisso,
  type ConfigAgenda,
  type Prioridade,
  type ServicoCompromisso,
} from "./agenda";
import { Pilula, TIPO_ICONE, rotulo } from "./agendaUi";
import { cidadeDe, enderecoCurto, type Lead } from "./leads";

/** O que abre o formulário: horário novo (com loja, dia ou hora já escolhidos) ou um horário para editar. */
export type Rascunho = Partial<Compromisso> & { deLegado?: string };

const DURACOES = [15, 30, 45, 60, 90];

export function CompromissoForm({
  rascunho,
  leads,
  compromissos,
  cfg,
  onFechar,
  onSalvar,
}: {
  rascunho: Rascunho | null;
  leads: Lead[];
  compromissos: Compromisso[];
  cfg: ConfigAgenda;
  onFechar: () => void;
  onSalvar: (c: Compromisso, deLegado?: string) => void;
}) {
  const [mostrado, setMostrado] = useState(rascunho);
  useEffect(() => {
    if (rascunho) setMostrado(rascunho);
  }, [rascunho]);
  const atual = rascunho ?? mostrado;
  return (
    <BlockDrawer
      open={rascunho !== null}
      onClose={onFechar}
      label={atual?.id ? "Editar horário" : "Novo horário"}
      side="bottom"
    >
      {atual && (
        <Formulario
          key={atual.id ?? `novo-${atual.leadId ?? ""}-${atual.data ?? ""}-${atual.hora ?? ""}`}
          rascunho={atual}
          leads={leads}
          compromissos={compromissos}
          cfg={cfg}
          onFechar={onFechar}
          onSalvar={onSalvar}
        />
      )}
    </BlockDrawer>
  );
}

function Formulario({
  rascunho,
  leads,
  compromissos,
  cfg,
  onFechar,
  onSalvar,
}: {
  rascunho: Rascunho;
  leads: Lead[];
  compromissos: Compromisso[];
  cfg: ConfigAgenda;
  onFechar: () => void;
  onSalvar: (c: Compromisso, deLegado?: string) => void;
}) {
  const editando = Boolean(rascunho.id);
  const porId = useMemo(() => new Map(leads.map((l) => [l.id, l])), [leads]);
  const agora = agoraSP();
  // Hora inicial: a pedida, ou o primeiro horário livre de hoje/amanhã.
  const inicial = useMemo(() => {
    const data = rascunho.data ?? chaveDia(agora);
    if (rascunho.hora) return { data, hora: rascunho.hora };
    return (
      proximoLivre({ id: "", data, hora: "00:00", duracao: rascunho.duracao ?? cfg.duracao }, compromissos, cfg) ?? {
        data,
        hora: `${String(cfg.inicio).padStart(2, "0")}:00`,
      }
    );
    // Só na abertura do formulário.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [leadId, setLeadId] = useState(rascunho.leadId ?? "");
  const [novoCliente, setNovoCliente] = useState(Boolean(rascunho.cliente) && !rascunho.leadId);
  const [cliente, setCliente] = useState(rascunho.cliente ?? { nome: "", whatsapp: "" });
  const [busca, setBusca] = useState("");
  const [tipo, setTipo] = useState(rascunho.tipo ?? "visita");
  const [servico, setServico] = useState<ServicoCompromisso>(rascunho.servico ?? "ambos");
  const [data, setData] = useState(inicial.data);
  const [hora, setHora] = useState(inicial.hora);
  const [duracao, setDuracao] = useState(rascunho.duracao ?? cfg.duracao);
  const lead = leadId ? porId.get(leadId) : undefined;
  const [local, setLocal] = useState(rascunho.local ?? (lead ? enderecoCurto(lead) : ""));
  const [obs, setObs] = useState(rascunho.obs ?? "");
  const [prioridade, setPrioridade] = useState<Prioridade>(rascunho.prioridade ?? "media");
  const [status, setStatus] = useState(rascunho.status ?? "agendado");
  const [confirmarPassado, setConfirmarPassado] = useState(false);
  const [erro, setErro] = useState("");

  const id = rascunho.id ?? "";
  const pedido = { id, data, hora, duracao };
  const valido = /^\d{4}-\d{2}-\d{2}$/.test(data) && /^\d{2}:\d{2}$/.test(hora) && duracao > 0;
  const choques = valido ? conflitos(pedido, compromissos, cfg.intervalo) : [];
  const sugestao = choques.length ? proximoLivre(pedido, compromissos, cfg) : null;
  const livres = valido ? horariosLivres(data, duracao, compromissos, cfg, id).slice(0, 12) : [];
  const passou = valido && inicioDe(pedido) < agora;
  const naoAtende = valido && !cfg.dias.includes(inicioDe(pedido).getDay());

  const achados = useMemo(() => {
    const q = busca.trim().toLowerCase();
    if (!q) return [];
    return leads
      .filter((l) => [l.nome, l.dono?.nome, l.tipo, cidadeDe(l)].some((campo) => campo?.toLowerCase().includes(q)))
      .slice(0, 6);
  }, [busca, leads]);

  const nomeDe = (c: Compromisso) => leadDo(c, porId)?.nome ?? "outro cliente";

  const salvar = () => {
    if (!novoCliente && !lead) return setErro("Escolha o cliente.");
    if (novoCliente && !cliente.nome.trim()) return setErro("Escreva o nome do cliente.");
    if (!valido) return setErro("Confira a data e a hora.");
    if (passou && !confirmarPassado) {
      setConfirmarPassado(true);
      return setErro("Esse horário já passou. Toque em salvar de novo para marcar assim mesmo.");
    }
    const base = editando ? (rascunho as Compromisso) : null;
    const c: Compromisso = {
      id: id || novoId(),
      leadId: novoCliente ? "" : leadId,
      ...(novoCliente
        ? {
            cliente: {
              nome: cliente.nome.trim(),
              whatsapp: cliente.whatsapp.replace(/\D/g, ""),
              ...(cliente.endereco ? { endereco: cliente.endereco } : {}),
            },
          }
        : { cliente: null }),
      tipo,
      servico,
      data,
      hora,
      duracao,
      local: local.trim(),
      obs: obs.trim(),
      prioridade,
      status,
      resultado: base?.resultado ?? null,
      // Mudou a data ou a hora de um horário que já existia: fica no histórico.
      historico:
        base && (base.data !== data || base.hora !== hora)
          ? [...base.historico, { de: `${base.data} ${base.hora}`, para: `${data} ${hora}`, em: new Date().toISOString() }]
          : (base?.historico ?? []),
      avisos: base && base.data === data && base.hora === hora ? base.avisos : {},
      criado: base?.criado || new Date().toISOString(),
      ...(base?.exemplo ? { exemplo: true } : {}),
    };
    onSalvar(c, rascunho.deLegado);
  };

  const zapValido = !cliente.whatsapp || /^(55)?\d{2}9\d{8}$/.test(cliente.whatsapp.replace(/\D/g, ""));

  return (
    <>
      <div aria-hidden="true" className="mx-auto mt-2 h-1 w-9 shrink-0 rounded-full bg-[var(--bjork-border-strong)]" />
      <header className="flex shrink-0 items-center gap-3 px-5 pb-2 pt-3">
        <h2 className="flex-1 text-[17px] font-semibold tracking-[-0.01em]">
          {editando ? "Editar horário" : rascunho.deLegado ? "Virar horário marcado" : "Novo horário"}
        </h2>
        <IconButton label="Fechar" onClick={onFechar}>
          <X />
        </IconButton>
      </header>

      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto overscroll-contain px-5 pb-6">
        {/* Cliente */}
        <fieldset className="flex flex-col gap-2">
          <legend className={cn(rotulo, "mb-1.5")}>Cliente</legend>
          {!novoCliente && lead ? (
            <div className="flex items-center justify-between gap-2 rounded-[11px] border border-[color:var(--bjork-border)] bg-[var(--bjork-surface)] px-3 py-2">
              <span className="min-w-0">
                <span className="block truncate text-[14px] font-medium">{lead.nome}</span>
                <span className="block truncate text-[12px] text-[color:var(--bjork-text-muted)]">
                  {lead.dono?.nome ? `${lead.dono.nome} · ` : ""}
                  {cidadeDe(lead)}
                </span>
              </span>
              <BlockButton variant="ghost" size="sm" onClick={() => setLeadId("")}>
                Trocar
              </BlockButton>
            </div>
          ) : !novoCliente ? (
            <>
              <label className="relative flex items-center">
                <span className="sr-only">Buscar cliente no painel</span>
                <Search aria-hidden="true" className="pointer-events-none absolute left-3 size-4 text-[color:var(--bjork-text-soft)]" />
                <input
                  type="search"
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  placeholder="Buscar loja pelo nome"
                  className={cn(fieldClass, "h-11 pl-9")}
                />
              </label>
              {achados.length > 0 && (
                <ul className="flex flex-col rounded-[11px] border border-[color:var(--bjork-border)] bg-[var(--bjork-surface)] p-1">
                  {achados.map((l) => (
                    <li key={l.id}>
                      <button
                        type="button"
                        onClick={() => {
                          setLeadId(l.id);
                          setBusca("");
                          if (!local) setLocal(enderecoCurto(l));
                          setErro("");
                        }}
                        className="flex w-full cursor-pointer flex-col rounded-[9px] px-2.5 py-2 text-left hover:bg-[var(--bjork-surface-hover)]"
                      >
                        <span className="truncate text-[13.5px] font-medium">{l.nome}</span>
                        <span className="truncate text-[12px] text-[color:var(--bjork-text-muted)]">
                          {l.tipo} · {cidadeDe(l)}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              <BlockButton variant="ghost" size="sm" className="self-start" onClick={() => setNovoCliente(true)}>
                Cliente que não está no painel
              </BlockButton>
            </>
          ) : (
            <div className="flex flex-col gap-2">
              <input
                value={cliente.nome}
                onChange={(e) => setCliente({ ...cliente, nome: e.target.value })}
                placeholder="Nome do cliente ou da loja"
                aria-label="Nome do cliente"
                className={cn(fieldClass, "h-11")}
              />
              <input
                value={cliente.whatsapp}
                onChange={(e) => setCliente({ ...cliente, whatsapp: e.target.value })}
                placeholder="WhatsApp com DDD (ex.: 22 99999-0000)"
                aria-label="WhatsApp do cliente"
                inputMode="tel"
                className={cn(fieldClass, "h-11")}
              />
              {!zapValido && (
                <p className="text-[12px] text-[color:var(--blk-error)]">
                  Confira o número: DDD + 9 + 8 dígitos (ex.: 22 99999-0000).
                </p>
              )}
              <BlockButton variant="ghost" size="sm" className="self-start" onClick={() => setNovoCliente(false)}>
                Buscar no painel
              </BlockButton>
            </div>
          )}
        </fieldset>

        {/* Tipo */}
        <fieldset>
          <legend className={cn(rotulo, "mb-1.5")}>Tipo</legend>
          <div className="flex flex-wrap gap-1.5">
            {TIPOS_ORDEM.map((t) => {
              const Icone = TIPO_ICONE[t];
              return (
                <Pilula key={t} ativa={tipo === t} cor={cfg.cores[t]} onClick={() => setTipo(t)}>
                  <Icone aria-hidden="true" />
                  {TIPOS[t].curto}
                </Pilula>
              );
            })}
          </div>
        </fieldset>

        {/* Serviço */}
        <fieldset>
          <legend className={cn(rotulo, "mb-1.5")}>Serviço</legend>
          <div className="flex flex-wrap gap-1.5">
            {(Object.keys(SERVICOS) as ServicoCompromisso[]).map((s) => (
              <Pilula key={s} ativa={servico === s} onClick={() => setServico(s)}>
                {SERVICOS[s]}
              </Pilula>
            ))}
          </div>
        </fieldset>

        {/* Quando */}
        <div className="grid grid-cols-2 gap-2.5">
          <label className="flex flex-col gap-1.5">
            <span className={rotulo}>Data</span>
            <input
              type="date"
              value={data}
              onChange={(e) => {
                setData(e.target.value);
                setConfirmarPassado(false);
              }}
              className={cn(fieldClass, "h-11")}
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className={rotulo}>Hora</span>
            <input
              type="time"
              step={300}
              value={hora}
              onChange={(e) => {
                setHora(e.target.value);
                setConfirmarPassado(false);
              }}
              className={cn(fieldClass, "h-11")}
            />
          </label>
        </div>
        {valido && (
          <p className="-mt-2 text-[12.5px] text-[color:var(--bjork-text-muted)]">
            {diaFalado(data, agora).replace(/^./, (x) => x.toUpperCase())} às {hora}
            {naoAtende ? " · fora dos dias de atendimento" : ""}
          </p>
        )}

        <fieldset>
          <legend className={cn(rotulo, "mb-1.5")}>Duração</legend>
          <div className="flex flex-wrap gap-1.5">
            {DURACOES.map((d) => (
              <Pilula key={d} ativa={duracao === d} onClick={() => setDuracao(d)}>
                {d < 60 ? `${d} min` : d === 60 ? "1 h" : "1 h 30"}
              </Pilula>
            ))}
          </div>
        </fieldset>

        {choques.length > 0 && (
          <div role="alert" className="flex flex-col gap-2 rounded-[12px] border border-[color:var(--blk-warning)] bg-[var(--blk-warning-soft)] p-3">
            <p className="flex items-start gap-2 text-[13px] leading-snug">
              <AlertTriangle aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-[color:var(--blk-warning)]" />
              <span>
                Bate com {choques.map((c) => `${nomeDe(c)} (${c.hora})`).join(", ")}
                {cfg.intervalo ? `, contando ${cfg.intervalo} min de deslocamento` : ""}.
              </span>
            </p>
            {sugestao && (
              <BlockButton
                variant="secondary"
                size="sm"
                className="self-start"
                onClick={() => {
                  setData(sugestao.data);
                  setHora(sugestao.hora);
                }}
              >
                Usar {diaFalado(sugestao.data, agora)} às {sugestao.hora}
              </BlockButton>
            )}
          </div>
        )}

        {livres.length > 0 && (
          <div>
            <p className={cn(rotulo, "mb-1.5")}>Livres nesse dia</p>
            <div className="flex flex-wrap gap-1.5">
              {livres.map((h) => (
                <Pilula key={h} ativa={h === hora} onClick={() => setHora(h)} className="h-8 px-2.5 font-mono text-[12.5px]">
                  {h}
                </Pilula>
              ))}
            </div>
          </div>
        )}

        <label className="flex flex-col gap-1.5">
          <span className={rotulo}>{tipo === "online" ? "Link da reunião" : "Local"}</span>
          <input
            value={local}
            onChange={(e) => setLocal(e.target.value)}
            placeholder={tipo === "online" ? "Link do Meet ou do WhatsApp" : "Endereço (vazio = na loja)"}
            className={cn(fieldClass, "h-11")}
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className={rotulo}>Observações</span>
          <textarea
            value={obs}
            onChange={(e) => setObs(e.target.value)}
            rows={2}
            placeholder="Ex.: levar a placa de exemplo"
            className={cn(fieldClass, "py-2.5 leading-snug")}
          />
        </label>

        <fieldset>
          <legend className={cn(rotulo, "mb-1.5")}>Prioridade</legend>
          <div className="flex flex-wrap gap-1.5">
            {(Object.keys(PRIORIDADES) as Prioridade[]).map((p) => (
              <Pilula key={p} ativa={prioridade === p} onClick={() => setPrioridade(p)}>
                {PRIORIDADES[p]}
              </Pilula>
            ))}
          </div>
        </fieldset>

        {editando && (
          <label className="flex flex-col gap-1.5">
            <span className={rotulo}>Situação</span>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as Compromisso["status"])}
              className={cn(fieldClass, "h-11")}
            >
              {STATUS_COMPROMISSO_ORDEM.map((s) => (
                <option key={s} value={s}>
                  {STATUS_COMPROMISSO[s].nome}
                </option>
              ))}
            </select>
          </label>
        )}

        {erro && (
          <p role="alert" className="text-[13px] text-[color:var(--blk-error)]">
            {erro}
          </p>
        )}
        <BlockButton size="lg" onClick={salvar}>
          {confirmarPassado ? "Salvar mesmo assim" : editando ? "Salvar mudanças" : "Marcar horário"}
        </BlockButton>
      </div>
    </>
  );
}

import { useEffect, useId, useState } from "react";
import { CalendarClock, Check, Sparkles, X } from "lucide-react";
import {
  BlockButton,
  IconButton,
  fieldClass,
} from "@/components/ui/app-dashboard-shell-utils/app-block-kit";
import { cn } from "@/lib/utils";
import { StatusChip } from "./TabelaLeads";
import { atrasado, entenderNota, quandoCurto, usarSample, type Nota, type Proposta } from "./assistente";
import { statusDe, type Lead } from "./leads";

const rotulo = "mb-1.5 block text-[12.5px] font-medium text-[color:var(--bjork-text-muted)]";

/**
 * Anotação com o assistente: o Brenno conta o que aconteceu do jeito dele, o Claude entende
 * (situação, compromisso, resumo) e ele confere antes de salvar. Sem o Claude, salva o texto como está.
 */
export function Anotar({
  lead,
  onSalvar,
  avisar,
}: {
  lead: Lead;
  onSalvar: (id: string, mudanca: Partial<Lead>) => void;
  avisar: (texto: string) => void;
}) {
  const [texto, setTexto] = useState("");
  const [pensando, setPensando] = useState(false);
  const [proposta, setProposta] = useState<Proposta | null>(null);
  const [temClaude, setTemClaude] = useState(false);
  const id = useId();

  useEffect(() => {
    let vivo = true;
    usarSample().then((s) => vivo && setTemClaude(s !== null));
    return () => {
      vivo = false;
    };
  }, []);

  const historico = (lead.historico ?? []) as Nota[];

  const salvar = (p: Proposta) => {
    const nota: Nota = { em: new Date().toISOString(), texto: texto.trim() };
    onSalvar(lead.id, {
      obs: p.anotacao,
      historico: [...historico, nota].slice(-20),
      ...(p.status && p.status !== statusDe(lead) ? { status: p.status } : {}),
      ...(p.compromisso ? { compromisso: p.compromisso } : {}),
    });
    avisar(p.compromisso ? `Anotado. Marcado: ${quandoCurto(p.compromisso.quando)}` : "Anotado");
    setTexto("");
    setProposta(null);
  };

  const anotar = async () => {
    const t = texto.trim();
    if (!t) return;
    if (!temClaude) {
      salvar({ status: null, compromisso: null, anotacao: t });
      return;
    }
    setPensando(true);
    try {
      setProposta(await entenderNota(lead, t));
    } catch (e) {
      const code = (e as { code?: string })?.code;
      if (code === "not_granted" || code === "sampling_disabled") setTemClaude(false);
      // Sem entender, a anotação não se perde: fica salva como ele escreveu.
      salvar({ status: null, compromisso: null, anotacao: t });
      if (code === "rate_limited") avisar("Anotado como escrito. O assistente pediu uma pausa: tente daqui a pouco.");
      else if (code !== "not_granted" && code !== "sampling_disabled")
        avisar("Anotado como escrito. O assistente não respondeu agora.");
    } finally {
      setPensando(false);
    }
  };

  const compromisso = lead.compromisso;

  return (
    <div className="flex flex-col gap-3">
      {compromisso && (
        <div className="flex items-center gap-3 rounded-[12px] border border-[color:var(--bjork-border-strong)] bg-[var(--bjork-surface)] px-3 py-2.5">
          <CalendarClock aria-hidden="true" className="size-5 shrink-0 text-[color:var(--blk-accent-ink)]" />
          <p className="min-w-0 flex-1 text-[13px] leading-snug">
            <span
              className="font-medium"
              style={{ color: atrasado(compromisso.quando) ? "var(--blk-error)" : undefined }}
            >
              {quandoCurto(compromisso.quando)}
            </span>
            {" · "}
            {compromisso.oque}
          </p>
          <BlockButton
            size="sm"
            variant="secondary"
            onClick={() => {
              onSalvar(lead.id, { compromisso: null });
              avisar("Compromisso feito");
            }}
          >
            <Check aria-hidden="true" />
            Feito
          </BlockButton>
        </div>
      )}

      <div>
        <label htmlFor={id} className={rotulo}>
          {temClaude ? "Conta o que aconteceu (o assistente organiza)" : "Anotação"}
        </label>
        <textarea
          id={id}
          rows={3}
          value={texto}
          onChange={(event) => setTexto(event.target.value)}
          placeholder="Ex.: o dono quer conversar amanhã meio-dia lá na loja"
          disabled={pensando}
          className={cn(fieldClass, "py-2.5 leading-relaxed")}
        />
      </div>

      {proposta ? (
        <div
          role="status"
          className="flex flex-col gap-2 rounded-[12px] border border-[color:var(--bjork-border-strong)] bg-[var(--bjork-accent-soft)] p-3 text-[13px]"
        >
          <div className="flex items-center justify-between gap-2">
            <p className="font-medium">O assistente entendeu:</p>
            <IconButton label="Cancelar" size="sm" onClick={() => setProposta(null)}>
              <X />
            </IconButton>
          </div>
          {proposta.status && proposta.status !== statusDe(lead) && (
            <p className="flex items-center gap-2">
              Situação: <StatusChip status={proposta.status} longo />
            </p>
          )}
          {proposta.compromisso && (
            <p>
              Marcado: <span className="font-medium">{quandoCurto(proposta.compromisso.quando)}</span> ·{" "}
              {proposta.compromisso.oque}
            </p>
          )}
          <p className="text-[color:var(--bjork-text-medium)]">Anotação: {proposta.anotacao}</p>
          <div className="flex gap-2">
            <BlockButton className="flex-1" onClick={() => salvar(proposta)}>
              <Check aria-hidden="true" />
              Salvar
            </BlockButton>
            <BlockButton variant="ghost" onClick={() => setProposta(null)}>
              Corrigir o texto
            </BlockButton>
          </div>
        </div>
      ) : (
        <BlockButton
          variant="secondary"
          onClick={anotar}
          disabled={pensando || !texto.trim()}
          className="self-start"
        >
          <Sparkles aria-hidden="true" />
          {pensando ? "Entendendo…" : "Anotar"}
        </BlockButton>
      )}

      {(lead.obs || historico.length > 0) && (
        <div>
          <h3 className={rotulo}>Anotações</h3>
          <ul className="flex flex-col gap-1.5 text-[13px] leading-snug text-[color:var(--bjork-text-medium)]">
            {lead.obs && <li className="text-[color:var(--bjork-text)]">{lead.obs}</li>}
            {historico
              .slice(-3)
              .reverse()
              .map((nota) => (
                <li key={nota.em} className="text-[12.5px]">
                  <span className="text-[color:var(--bjork-text-soft)]">
                    {new Date(nota.em).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}:{" "}
                  </span>
                  {nota.texto}
                </li>
              ))}
          </ul>
        </div>
      )}
    </div>
  );
}

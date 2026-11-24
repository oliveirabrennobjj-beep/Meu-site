import { useState } from "react";
import { BellRing, CalendarDays, MessageCircle, Plus } from "lucide-react";
import {
  BlockButton,
  buttonClass,
  cardSurface,
} from "@/components/ui/app-dashboard-shell-utils/app-block-kit";
import { cn } from "@/lib/utils";
import {
  MODELOS_NOMES,
  TIPOS,
  aConfirmar,
  agoraSP,
  chaveDia,
  deHoje,
  diaFalado,
  diasSugeridos,
  falta,
  inicioDe,
  leadDo,
  lembretesParaEnviar,
  precisamDeRetorno,
  preencherModelo,
  proximo,
  semanaEmNumeros,
  somarDias,
  porHorario,
  type Compromisso,
  type ConfigAgenda,
  type ModeloId,
} from "./agenda";
import { LinhaCompromisso, Mensageiro } from "./CompromissoFicha";
import type { Rascunho } from "./CompromissoForm";
import { faixaHorario } from "./agendaUi";
import { STATUS, linkWhatsApp, numeroConversa, statusDe, type Lead } from "./leads";

/** Topo da tela inicial: o dia de hoje na agenda, lembretes a mandar e quem precisa de retorno. */
export function HojeAgenda({
  leads,
  agenda,
  cfg,
  onNovo,
  onAbrir,
  onVerAgenda,
  onAbrirLead,
  onAvisado,
  avisar,
}: {
  leads: Lead[];
  agenda: Compromisso[];
  cfg: ConfigAgenda;
  onNovo: (r: Rascunho) => void;
  onAbrir: (c: Compromisso) => void;
  onVerAgenda: () => void;
  onAbrirLead: (lead: Lead) => void;
  onAvisado: (c: Compromisso, modelo: ModeloId) => void;
  avisar: (t: string) => void;
}) {
  const [pedindo, setPedindo] = useState<string | null>(null);
  const agora = agoraSP();
  const porId = new Map(leads.map((l) => [l.id, l]));
  const nomeDe = (c: Compromisso) => leadDo(c, porId)?.nome ?? "Cliente";

  const hoje = deHoje(agenda, agora);
  const amanhaK = chaveDia(somarDias(agora, 1));
  const amanha = agenda.filter((c) => !c.apagado && c.data === amanhaK && c.status !== "cancelado").sort(porHorario);
  const prox = proximo(agenda, agora);
  const lembretes = lembretesParaEnviar(agenda, cfg, agora);
  const retorno = precisamDeRetorno(leads, agenda, agora);
  // Atrasados: combinados de dias anteriores que ninguém resolveu.
  const atrasados = agenda
    .filter((c) => !c.apagado && c.data < chaveDia(agora) && (c.legado || c.status === "agendado" || c.status === "confirmado"))
    .sort(porHorario);
  const semana = semanaEmNumeros(agenda, agora);
  const vazio = !hoje.length && !amanha.length && !lembretes.length && !retorno.length && !atrasados.length;

  const minutosProx = prox ? (inicioDe(prox).getTime() - agora.getTime()) / 60_000 : 0;
  // Sem a confirmação do cliente, passar da hora não é atraso do Brenno: fica em aviso, nunca vermelho.
  const proxAConfirmar = prox ? aConfirmar(prox) : false;
  const naoConfirmou = proxAConfirmar && minutosProx < 0;
  // Laranja com menos de 15 min, vermelho quando atrasa; longe ainda, cor normal.
  const corProx = naoConfirmou
    ? "var(--blk-warning)"
    : minutosProx < 0
      ? "var(--blk-error)"
      : minutosProx <= 15
        ? "var(--blk-warning)"
        : minutosProx <= 60
          ? "var(--blk-accent-ink)"
          : "var(--bjork-text)";
  const rotuloProx = naoConfirmou
    ? "Não confirmou"
    : minutosProx < 0
      ? "Atrasado"
      : proxAConfirmar
        ? "Próximo · a confirmar"
        : "Próximo";

  return (
    <section aria-labelledby="agenda-hoje" className={cn(cardSurface, "flex flex-col gap-3 p-3 @3xl:p-4")}>
      <div className="flex flex-wrap items-center gap-2">
        <h2 id="agenda-hoje" className="flex-1 text-[14px] font-semibold">
          Agenda de hoje{" "}
          <span className="font-normal text-[color:var(--bjork-text-muted)]">
            · {agora.getDate()}/{String(agora.getMonth() + 1).padStart(2, "0")}
          </span>
        </h2>
        <BlockButton variant="ghost" size="sm" onClick={onVerAgenda}>
          <CalendarDays aria-hidden="true" />
          Ver agenda
        </BlockButton>
        <BlockButton size="sm" onClick={() => onNovo({})}>
          <Plus aria-hidden="true" />
          Novo horário
        </BlockButton>
      </div>

      {prox && (
        <button
          type="button"
          onClick={() => onAbrir(prox)}
          className="flex cursor-pointer items-center gap-3 rounded-[12px] border px-3 py-2.5 text-left"
          style={{ borderColor: corProx, background: `color-mix(in srgb, ${corProx} 8%, var(--bjork-surface))` }}
        >
          <span className="flex flex-col">
            <span className="text-[11px] font-semibold uppercase tracking-[0.04em]" style={{ color: corProx }}>
              {rotuloProx}
            </span>
            <span className="font-mono text-[20px] font-bold tabular-nums leading-tight" style={{ color: corProx }}>
              {naoConfirmou ? prox.hora : falta(inicioDe(prox), agora)}
            </span>
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[14px] font-semibold">{nomeDe(prox)}</span>
            <span className="block truncate text-[12.5px] text-[color:var(--bjork-text-muted)]">
              {diaFalado(prox.data, agora)} · {faixaHorario(prox)} · {TIPOS[prox.tipo].curto}
              {prox.local ? ` · ${prox.local}` : ""}
            </span>
          </span>
        </button>
      )}

      {vazio && !prox && (
        <p className="text-[13px] text-[color:var(--bjork-text-muted)]">
          Nada marcado. Toque em Novo horário para marcar visita, reunião ou ligação.
        </p>
      )}

      {hoje.length > 0 && (
        <div className="flex flex-col gap-1.5">
          {hoje.map((c) => (
            <LinhaCompromisso
              key={c.id}
              c={c}
              nome={`${c.semHora ? "" : `${c.hora} · `}${nomeDe(c)}`}
              detalhe={c.legado ? c.obs : [TIPOS[c.tipo].curto, c.local].filter(Boolean).join(" · ")}
              cfg={cfg}
              onAbrir={onAbrir}
            />
          ))}
        </div>
      )}

      {amanha.length > 0 && (
        <p className="text-[12.5px] text-[color:var(--bjork-text-medium)]">
          <strong className="font-semibold">Amanhã:</strong>{" "}
          {amanha.map((c) => `${c.semHora ? "" : `${c.hora} `}${nomeDe(c)}`).join(" · ")}
        </p>
      )}

      {lembretes.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <h3 className="flex items-center gap-1.5 text-[12.5px] font-semibold">
            <BellRing aria-hidden="true" className="size-4 text-[color:var(--blk-warning)]" />
            Lembretes para mandar
          </h3>
          {lembretes.map(({ c, modelo }) => {
            const lead = leadDo(c, porId);
            if (!lead) return null;
            const texto = preencherModelo(cfg.modelos[modelo], lead, c);
            return (
              <div key={c.id} className="flex flex-wrap items-center gap-2 rounded-[10px] bg-[var(--blk-warning-soft)] px-2.5 py-2">
                <span className="min-w-0 flex-1 text-[13px]">
                  <span className="font-medium">{nomeDe(c)}</span>{" "}
                  <span className="text-[color:var(--bjork-text-muted)]">
                    · {diaFalado(c.data, agora)} {c.hora} · {MODELOS_NOMES[modelo].toLowerCase()}
                  </span>
                </span>
                <a
                  href={linkWhatsApp(lead, texto, numeroConversa(lead))}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => onAvisado(c, modelo)}
                  className={buttonClass("secondary", "sm")}
                >
                  <MessageCircle aria-hidden="true" />
                  Mandar
                </a>
              </div>
            );
          })}
        </div>
      )}

      {atrasados.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <h3 className="text-[12.5px] font-semibold text-[color:var(--blk-error)]">Ficaram para trás</h3>
          {atrasados.slice(0, 4).map((c) => (
            <LinhaCompromisso
              key={c.id}
              c={c}
              nome={nomeDe(c)}
              detalhe={`${diaFalado(c.data, agora)}${c.semHora ? "" : ` ${c.hora}`} · ${
                c.legado ? c.obs : aConfirmar(c) ? "não confirmou · cobrar ou remarcar" : "marcar como realizado ou remarcar"
              }`}
              cfg={cfg}
              onAbrir={onAbrir}
            />
          ))}
        </div>
      )}

      {retorno.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <h3 className="text-[12.5px] font-semibold">
            Precisam de retorno <span className="font-normal text-[color:var(--bjork-text-muted)]">· sem horário marcado</span>
          </h3>
          <ul className="flex flex-col gap-1.5">
            {retorno.slice(0, 6).map((lead) => (
              <li key={lead.id} className="flex flex-col gap-2 rounded-[10px] border border-[color:var(--bjork-border)] px-2.5 py-2">
                <div className="flex flex-wrap items-center gap-2">
                  <button type="button" onClick={() => onAbrirLead(lead)} className="min-w-0 flex-1 cursor-pointer text-left">
                    <span className="block truncate text-[13.5px] font-medium">{lead.nome}</span>
                    <span className="block truncate text-[12px] text-[color:var(--bjork-text-muted)]">
                      {STATUS[statusDe(lead)].label}
                      {lead.dono?.nome ? ` · dono: ${lead.dono.nome}` : ""}
                    </span>
                  </button>
                  <BlockButton
                    variant="secondary"
                    size="sm"
                    onClick={() => setPedindo(pedindo === lead.id ? null : lead.id)}
                    aria-expanded={pedindo === lead.id}
                  >
                    <MessageCircle aria-hidden="true" />
                    Pedir horário
                  </BlockButton>
                  <BlockButton variant="ghost" size="sm" onClick={() => onNovo({ leadId: lead.id })}>
                    Marcar
                  </BlockButton>
                </div>
                {pedindo === lead.id && (
                  <Mensageiro
                    lead={lead}
                    modelos={["pedirDias", "pedirAberto", "interesse"]}
                    textoDe={(m) =>
                      preencherModelo(cfg.modelos[m], lead, null, { diasSugeridos: diasSugeridos(agenda, cfg, agora) })
                    }
                    avisar={avisar}
                  />
                )}
              </li>
            ))}
          </ul>
          {retorno.length > 6 && (
            <p className="text-[12px] text-[color:var(--bjork-text-muted)]">e mais {retorno.length - 6}.</p>
          )}
        </div>
      )}

      {semana.agendados + semana.confirmados + semana.realizados + semana.cancelados > 0 && (
        <dl className="grid grid-cols-4 gap-2 border-t border-[color:var(--bjork-border)] pt-3 text-center">
          {[
            ["A confirmar", semana.agendados],
            ["Confirmados", semana.confirmados],
            ["Realizados", semana.realizados],
            ["Cancelados", semana.cancelados],
          ].map(([nome, n]) => (
            <div key={nome}>
              <dd className="font-mono text-[18px] font-bold tabular-nums">{n}</dd>
              <dt className="text-[11px] text-[color:var(--bjork-text-muted)]">{nome}</dt>
            </div>
          ))}
          {semana.comparecimento != null && (
            <div className="col-span-4 text-[12px] text-[color:var(--bjork-text-muted)]">
              Comparecimento da semana: <strong className="text-[color:var(--bjork-text)]">{semana.comparecimento}%</strong>
            </div>
          )}
        </dl>
      )}
    </section>
  );
}

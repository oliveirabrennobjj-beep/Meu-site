import { useEffect, useState } from "react";
import { ArrowRight, Copy, ExternalLink, MessageCircle, Send, Star, X } from "lucide-react";
import {
  BlockButton,
  BlockDrawer,
  IconButton,
  InitialsAvatar,
  buttonClass,
  fieldClass,
} from "@/components/ui/app-dashboard-shell-utils/app-block-kit";
import { cn } from "@/lib/utils";
import { StatusChip } from "./TabelaLeads";
import {
  STATUS,
  fmtInt,
  fmtNota,
  linkSeguro,
  linkWhatsApp,
  statusDe,
  textoExemplo,
  textoMensagem,
  type Lead,
  type Status,
} from "./leads";

const DESFECHOS: [Status, string][] = [
  ["respondeu", "Respondeu"],
  ["fechou", "Fechou"],
  ["depois", "Mais pra frente"],
  ["nao", "Não quer"],
  ["enviado", "Sem resposta"],
  ["novo", "Não enviei"],
];

/** Ficha de um comércio: mensagem pronta, envio pelo WhatsApp e o que aconteceu depois. */
export function FichaLead({
  lead,
  tpl,
  proximo,
  onFechar,
  onSalvar,
  onAbrir,
  avisar,
}: {
  lead: Lead | null;
  tpl: string;
  /** Próximo comércio ainda sem mensagem, no mesmo grupo. */
  proximo: Lead | null;
  onFechar: () => void;
  onSalvar: (id: string, mudanca: Partial<Lead>) => void;
  onAbrir: (lead: Lead) => void;
  avisar: (texto: string) => void;
}) {
  // Guarda o último comércio para o conteúdo não sumir enquanto a ficha desce.
  const [mostrado, setMostrado] = useState(lead);
  useEffect(() => {
    if (lead) setMostrado(lead);
  }, [lead]);
  const atual = lead ?? mostrado;

  return (
    <BlockDrawer
      open={lead !== null}
      onClose={onFechar}
      label={atual ? `Ficha de ${atual.nome}` : "Ficha"}
      side="bottom"
    >
      {atual && (
        <Conteudo
          key={atual.id}
          lead={atual}
          tpl={tpl}
          proximo={proximo}
          onFechar={onFechar}
          onSalvar={onSalvar}
          onAbrir={onAbrir}
          avisar={avisar}
        />
      )}
    </BlockDrawer>
  );
}

function Conteudo({
  lead,
  tpl,
  proximo,
  onFechar,
  onSalvar,
  onAbrir,
  avisar,
}: {
  lead: Lead;
  tpl: string;
  proximo: Lead | null;
  onFechar: () => void;
  onSalvar: (id: string, mudanca: Partial<Lead>) => void;
  onAbrir: (lead: Lead) => void;
  avisar: (texto: string) => void;
}) {
  const status = statusDe(lead);
  const novo = status === "novo";
  const mensagem = textoMensagem(tpl, lead);
  const link = linkSeguro(lead.link);
  const [obs, setObs] = useState(lead.obs ?? "");

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(mensagem);
      avisar("Mensagem copiada");
    } catch {
      avisar("Não deu para copiar. Segure no texto e copie.");
    }
  };

  const mudarStatus = (para: Status) => {
    onSalvar(lead.id, para === "novo" ? { status: para, enviadoEm: "" } : { status: para });
    avisar(`${lead.nome}: ${STATUS[para].label.toLowerCase()}`);
  };

  return (
    <>
      <div aria-hidden="true" className="mx-auto mt-2 h-1 w-9 shrink-0 rounded-full bg-[var(--bjork-border-strong)]" />
      <header className="flex shrink-0 items-start gap-3 px-5 pb-3 pt-3">
        <InitialsAvatar name={lead.nome} size={42} />
        <div className="min-w-0 flex-1">
          <h2 className="text-[17px] font-semibold leading-tight tracking-[-0.01em] [overflow-wrap:anywhere]">
            {lead.nome}
          </h2>
          <p className="mt-0.5 text-[13px] text-[color:var(--bjork-text-muted)]">
            {[lead.tipo, lead.cidade].filter(Boolean).join(" · ")}
          </p>
        </div>
        <IconButton label="Fechar ficha" onClick={onFechar}>
          <X />
        </IconButton>
      </header>

      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto overscroll-contain px-5 pb-6">
        <dl className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px]">
          <div>
            <dt className="sr-only">Situação</dt>
            <dd>
              <StatusChip status={status} longo />
            </dd>
          </div>
          <div className="flex items-baseline gap-1.5">
            <dt className="text-[color:var(--bjork-text-muted)]">Nota</dt>
            <dd className="font-mono font-medium tabular-nums">
              {lead.nota != null && (
                <Star
                  aria-hidden="true"
                  className="mr-1 inline size-3.5 -translate-y-px fill-[var(--bjork-accent)] text-[color:var(--bjork-accent)]"
                />
              )}
              {fmtNota(lead.nota)}
            </dd>
          </div>
          <div className="flex items-baseline gap-1.5">
            <dt className="text-[color:var(--bjork-text-muted)]">Avaliações</dt>
            <dd className="font-mono font-medium tabular-nums">{fmtInt(lead.avaliacoes)}</dd>
          </div>
          {lead.telefone && (
            <div className="flex items-baseline gap-1.5">
              <dt className="text-[color:var(--bjork-text-muted)]">Telefone</dt>
              <dd className="select-all font-mono tabular-nums">{lead.telefone}</dd>
            </div>
          )}
        </dl>

        {novo ? (
          <>
            <div>
              <h3 className="mb-1.5 text-[12.5px] font-medium text-[color:var(--bjork-text-muted)]">
                Mensagem pronta
              </h3>
              <p className="max-h-[210px] select-text overflow-y-auto whitespace-pre-wrap rounded-[12px] border border-[color:var(--bjork-border)] bg-[var(--bjork-field-inset)] p-3 text-[13.5px] leading-relaxed text-[color:var(--bjork-text-medium)] [overflow-wrap:anywhere]">
                {mensagem}
              </p>
            </div>
            <a
              href={linkWhatsApp(lead, mensagem)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() =>
                onSalvar(lead.id, { status: "enviado", enviadoEm: new Date().toISOString() })
              }
              className={buttonClass("primary", "lg", "w-full")}
            >
              <Send aria-hidden="true" />
              Enviar no WhatsApp
            </a>
            <div className="flex flex-wrap gap-2">
              <BlockButton variant="secondary" className="flex-1" onClick={copiar}>
                <Copy aria-hidden="true" />
                Copiar mensagem
              </BlockButton>
              {link && <LinkPerfil href={link} />}
            </div>
          </>
        ) : (
          <>
            {status === "enviado" && proximo && (
              <BlockButton size="lg" className="w-full" onClick={() => onAbrir(proximo)}>
                <span className="truncate">Próximo: {proximo.nome}</span>
                <ArrowRight aria-hidden="true" />
              </BlockButton>
            )}
            {status === "respondeu" && (
              <a
                href={linkWhatsApp(lead, textoExemplo(lead))}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonClass("primary", "lg", "w-full")}
              >
                <Send aria-hidden="true" />
                Mandar exemplo de site
              </a>
            )}
            <div className="flex flex-wrap gap-2">
              <a
                href={linkWhatsApp(lead, "")}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonClass("secondary", "md", "flex-1")}
              >
                <MessageCircle aria-hidden="true" />
                Abrir conversa
              </a>
              {link && <LinkPerfil href={link} />}
            </div>

            <fieldset>
              <legend className="mb-2 text-[12.5px] font-medium text-[color:var(--bjork-text-muted)]">
                O que aconteceu?
              </legend>
              <div className="flex flex-wrap gap-2">
                {DESFECHOS.filter(([para]) => para !== status).map(([para, rotulo]) => (
                  <BlockButton
                    key={para}
                    variant={para === "novo" ? "ghost" : "secondary"}
                    onClick={() => mudarStatus(para)}
                  >
                    {rotulo}
                  </BlockButton>
                ))}
              </div>
            </fieldset>

            <div>
              <label
                htmlFor={`obs-${lead.id}`}
                className="mb-1.5 block text-[12.5px] font-medium text-[color:var(--bjork-text-muted)]"
              >
                Anotação
              </label>
              <input
                id={`obs-${lead.id}`}
                value={obs}
                onChange={(event) => setObs(event.target.value)}
                onBlur={() => {
                  if (obs.trim() !== (lead.obs ?? "")) onSalvar(lead.id, { obs: obs.trim() });
                }}
                placeholder="Ex.: volta a falar em janeiro"
                autoComplete="off"
                className={cn(fieldClass, "h-11")}
              />
            </div>
          </>
        )}
      </div>
    </>
  );
}

function LinkPerfil({ href }: { href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={buttonClass("secondary", "md", "flex-1")}
    >
      <ExternalLink aria-hidden="true" />
      {/instagram\.com/i.test(href) ? "Ver Instagram" : "Ver página"}
    </a>
  );
}

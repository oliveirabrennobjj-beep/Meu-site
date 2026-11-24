import { useEffect, useId, useRef, useState } from "react";
import { Copy, MessageCircle, Sparkles, Square } from "lucide-react";
import {
  BlockButton,
  IconButton,
  buttonClass,
  cardSurface,
  fieldClass,
} from "@/components/ui/app-dashboard-shell-utils/app-block-kit";
import { cn } from "@/lib/utils";
import { aplicarAcao, mensagemPronta, separarAcoes, textoVisivel, usarSample, type Acao } from "./assistente";
import { montarInstrucoes, pedidoDoHorario } from "./conhecimento";
import { CartaoAcao } from "./Assistente";
import type { Compromisso, ConfigAgenda } from "./agenda";
import { linkWhatsApp, numeroConversa, type Lead } from "./leads";

const ATALHOS = [
  { rotulo: "Não respondeu", texto: "O cliente não respondeu a mensagem que mandei.", direto: true },
  { rotulo: "Quer outro dia", texto: "Ele pediu pra mudar para ", direto: false },
  { rotulo: "Ficou de pensar", texto: "Conversamos e ele ficou de pensar.", direto: true },
];

/**
 * Assistente dentro da ficha do horário: o Brenno conta o que aconteceu com aquele cliente ("não respondeu",
 * "pediu pra quinta 15h") e o Claude diz o que fazer, deixa a mensagem pronta e propõe a mudança no painel.
 */
export function AssistenteHorario({
  c,
  lead,
  leads,
  agenda,
  cfg,
  onSalvarLoja,
  onCompromisso,
  onAbrirLead,
  avisar,
}: {
  c: Compromisso;
  lead: Lead;
  leads: Lead[];
  agenda: Compromisso[];
  cfg: ConfigAgenda;
  onSalvarLoja: (id: string, mudanca: Partial<Lead>) => void;
  onCompromisso: (c: Compromisso) => void;
  onAbrirLead: ((lead: Lead) => void) | null;
  avisar: (t: string) => void;
}) {
  const [disponivel, setDisponivel] = useState<boolean | null>(null);
  const [texto, setTexto] = useState("");
  const [parcial, setParcial] = useState<string | null>(null);
  const [resposta, setResposta] = useState<{ visivel: string; acoes: Acao[]; salvas: number[] } | null>(null);
  const [erro, setErro] = useState("");
  const controle = useRef<AbortController | null>(null);
  const campo = useRef<HTMLTextAreaElement>(null);
  const id = useId();

  useEffect(() => {
    let vivo = true;
    usarSample().then((s) => vivo && setDisponivel(s !== null));
    return () => {
      vivo = false;
      controle.current?.abort();
    };
  }, []);

  if (disponivel !== true) return null;
  const pensando = parcial !== null;

  const perguntar = async (pergunta = texto) => {
    const t = pergunta.trim();
    const sample = await usarSample();
    if (!t || pensando || !sample) return;
    setErro("");
    setResposta(null);
    setParcial("");
    const ctl = new AbortController();
    controle.current = ctl;
    try {
      const agora = new Date();
      const { text } = await sample(`${montarInstrucoes(leads, agora, agenda)}\n\n${pedidoDoHorario(c, lead, t, agora)}`, {
        signal: ctl.signal,
        cache: false,
        onText: ({ text: p }: { text: string }) => setParcial(textoVisivel(p)),
      });
      const { visivel, acoes } = separarAcoes(
        text,
        new Set(leads.map((l) => l.id)),
        new Set(agenda.filter((x) => !x.legado && !x.apagado).map((x) => x.id)),
      );
      setResposta({ visivel, acoes, salvas: [] });
      setTexto("");
    } catch (e) {
      const code = (e as { code?: string })?.code;
      if (code === "not_granted" || code === "sampling_disabled") setDisponivel(false);
      else if (code !== "cancelled")
        setErro(code === "rate_limited" ? "Muitas perguntas seguidas. Espera um pouquinho." : "O assistente não respondeu agora. Tenta de novo.");
    } finally {
      controle.current = null;
      setParcial(null);
    }
  };

  const salvar = (posicao: number) => {
    if (!resposta) return;
    const acao = resposta.acoes[posicao];
    const alvo = leads.find((l) => l.id === acao.loja);
    if (!alvo) return;
    aplicarAcao(acao, alvo, { agenda, cfg, onSalvar: onSalvarLoja, onCompromisso });
    setResposta({ ...resposta, salvas: [...resposta.salvas, posicao] });
    avisar(`${alvo.nome}: salvo no painel`);
  };

  const msg = resposta ? mensagemPronta(resposta.visivel) : null;

  return (
    <section aria-label="Assistente do horário" className={cn(cardSurface, "flex flex-col gap-2.5 p-3")}>
      <h3 className="flex items-center gap-1.5 text-[13.5px] font-semibold">
        <Sparkles aria-hidden="true" className="size-4 text-[color:var(--blk-accent-ink)]" />
        Assistente
      </h3>

      <div className="flex flex-wrap gap-1.5">
        {ATALHOS.map((a) => (
          <BlockButton
            key={a.rotulo}
            variant="secondary"
            size="sm"
            disabled={pensando}
            onClick={() => {
              if (a.direto) return void perguntar(a.texto);
              setTexto(a.texto);
              requestAnimationFrame(() => campo.current?.focus());
            }}
          >
            {a.rotulo}
          </BlockButton>
        ))}
      </div>

      <label htmlFor={id} className="sr-only">
        Conta o que aconteceu com esse cliente
      </label>
      <div className="flex items-end gap-2">
        <textarea
          ref={campo}
          id={id}
          rows={2}
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Conta o que aconteceu. Ex.: ele não respondeu a mensagem de confirmação"
          disabled={pensando}
          className={cn(fieldClass, "min-h-[44px] flex-1 py-2.5 text-[13.5px] leading-snug")}
        />
        {pensando ? (
          <IconButton label="Parar" onClick={() => controle.current?.abort()}>
            <Square />
          </IconButton>
        ) : (
          <BlockButton onClick={() => perguntar()} disabled={!texto.trim()}>
            Perguntar
          </BlockButton>
        )}
      </div>

      {pensando && (
        <p aria-live="polite" className="whitespace-pre-wrap text-[13px] leading-relaxed text-[color:var(--bjork-text-medium)]">
          {parcial || "Pensando…"}
        </p>
      )}

      {erro && (
        <p role="alert" className="text-[13px] font-medium text-[color:var(--blk-error)]">
          {erro}
        </p>
      )}

      {resposta && (
        <div className="flex flex-col gap-2">
          <p className="whitespace-pre-wrap text-[13.5px] leading-relaxed [overflow-wrap:anywhere]">{resposta.visivel}</p>
          {msg && (
            <div className="flex flex-wrap gap-2">
              <a
                href={linkWhatsApp(lead, msg, numeroConversa(lead))}
                target="_blank"
                rel="noreferrer"
                className={buttonClass("primary", "sm")}
              >
                <MessageCircle aria-hidden="true" />
                Mandar essa mensagem
              </a>
              <BlockButton
                variant="secondary"
                size="sm"
                onClick={() =>
                  navigator.clipboard?.writeText(msg).then(
                    () => avisar("Mensagem copiada"),
                    () => avisar("Não deu para copiar: selecione o texto e copie"),
                  )
                }
              >
                <Copy aria-hidden="true" />
                Copiar
              </BlockButton>
            </div>
          )}
          {resposta.acoes.map((acao, posicao) => (
            <CartaoAcao
              key={posicao}
              acao={acao}
              lead={leads.find((l) => l.id === acao.loja)}
              salva={resposta.salvas.includes(posicao)}
              agenda={agenda}
              onSalvar={() => salvar(posicao)}
              onAbrir={onAbrirLead}
            />
          ))}
        </div>
      )}
    </section>
  );
}

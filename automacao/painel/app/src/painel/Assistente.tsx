import { useEffect, useId, useRef, useState } from "react";
import { Check, Copy, ImagePlus, Send, Square, Trash2, X } from "lucide-react";
import {
  BlockButton,
  IconButton,
  cardSurface,
  fieldClass,
} from "@/components/ui/app-dashboard-shell-utils/app-block-kit";
import { cn } from "@/lib/utils";
import { StatusChip } from "./TabelaLeads";
import {
  quandoCurto,
  separarAcoes,
  textoVisivel,
  tiposDeFoto,
  usarSample,
  type Acao,
  type Mensagem,
  type Turno,
} from "./assistente";
import { montarInstrucoes } from "./conhecimento";
import { statusDe, type Lead } from "./leads";

const HISTORICO_NO_PEDIDO = 20;

const SUGESTOES = [
  "Quem eu chamo primeiro hoje?",
  "Como respondo quem pergunta o preço?",
  "Escreve uma mensagem pra pedir o contato do dono",
];

// O que o Claude lê de cada fala anterior (as fotos antigas não vão de novo, só o que ele disse delas).
function conteudo(m: Mensagem, atual: boolean) {
  if (m.papel === "assistente") return m.acoes?.length ? `${m.texto}\n(Propus atualizar o painel.)` : m.texto;
  const foto = m.foto ? (atual ? "\n[Foto em anexo]" : "\n[Mandei uma foto aqui]") : "";
  return `${m.texto}${foto}`;
}

function mensagemDeErro(code?: string) {
  if (code === "not_granted" || code === "sampling_disabled")
    return "O Claude não está liberado neste painel. Libere nas permissões do Artifact e tente de novo.";
  if (code === "rate_limited") return "Muitas perguntas seguidas. Espera um pouquinho e manda de novo.";
  if (code === "image_rejected") return "Essa foto não deu. Tenta um print em PNG ou JPG.";
  if (code === "prompt_too_large") return "Ficou grande demais. Limpa a conversa e manda de novo.";
  return "Não consegui responder agora. Manda de novo.";
}

/** Conversa com o assistente de vendas: perguntas, prints de conversa e mudanças no painel. */
export function Assistente({
  leads,
  conversa,
  onConversa,
  onSalvar,
  onAbrir,
  avisar,
}: {
  leads: Lead[];
  conversa: Mensagem[];
  onConversa: (mensagens: Mensagem[]) => void;
  onSalvar: (id: string, mudanca: Partial<Lead>) => void;
  onAbrir: (lead: Lead) => void;
  avisar: (texto: string) => void;
}) {
  const [texto, setTexto] = useState("");
  const [foto, setFoto] = useState<File | null>(null);
  const [previa, setPrevia] = useState<string | null>(null);
  const [resposta, setResposta] = useState<string | null>(null);
  const [erro, setErro] = useState("");
  const [disponivel, setDisponivel] = useState<boolean | null>(null);
  const [tipos, setTipos] = useState<string[]>([]);
  const controle = useRef<AbortController | null>(null);
  const fim = useRef<HTMLDivElement>(null);
  const arquivo = useRef<HTMLInputElement>(null);
  const campoId = useId();

  useEffect(() => {
    let vivo = true;
    usarSample().then((s) => vivo && setDisponivel(s !== null));
    tiposDeFoto().then((t) => vivo && setTipos(t));
    return () => {
      vivo = false;
      controle.current?.abort();
    };
  }, []);

  useEffect(() => {
    if (!foto) return setPrevia(null);
    const url = URL.createObjectURL(foto);
    setPrevia(url);
    return () => URL.revokeObjectURL(url);
  }, [foto]);

  useEffect(() => {
    fim.current?.scrollIntoView({ block: "end" });
  }, [conversa.length, resposta]);

  const respondendo = resposta !== null;

  const enviar = async (pergunta = texto) => {
    const t = pergunta.trim();
    if ((!t && !foto) || respondendo) return;
    const sample = await usarSample();
    if (!sample) {
      setErro(mensagemDeErro("not_granted"));
      return;
    }
    const nova: Mensagem = {
      papel: "brenno",
      texto: t || "O que você acha dessa conversa?",
      em: new Date().toISOString(),
      ...(foto ? { foto: true } : {}),
    };
    const historico = [...conversa, nova];
    onConversa(historico);
    const fotoEnviada = foto;
    setTexto("");
    setFoto(null);
    setErro("");
    setResposta("");

    const recentes = historico.slice(-HISTORICO_NO_PEDIDO);
    const turnos: Turno[] = [
      { role: "user", content: montarInstrucoes(leads) },
      ...recentes.map((m, i) => ({
        role: m.papel === "brenno" ? ("user" as const) : ("assistant" as const),
        content: conteudo(m, i === recentes.length - 1),
      })),
    ];
    const ctl = new AbortController();
    controle.current = ctl;
    try {
      const { text } = await sample(turnos, {
        signal: ctl.signal,
        cache: false,
        onText: ({ text: parcial }: { text: string }) => setResposta(textoVisivel(parcial)),
        ...(fotoEnviada ? { images: [fotoEnviada] } : {}),
      });
      const { visivel, acoes } = separarAcoes(text, new Set(leads.map((l) => l.id)));
      onConversa([
        ...historico,
        { papel: "assistente", texto: visivel, em: new Date().toISOString(), ...(acoes.length ? { acoes } : {}) },
      ]);
    } catch (e) {
      const falha = e as { code?: string; text?: string };
      const parcial = falha.text ? textoVisivel(falha.text) : "";
      if (parcial) {
        onConversa([
          ...historico,
          { papel: "assistente", texto: `${parcial}\n(resposta interrompida)`, em: new Date().toISOString() },
        ]);
      }
      if (falha.code !== "cancelled") setErro(mensagemDeErro(falha.code));
    } finally {
      controle.current = null;
      setResposta(null);
    }
  };

  const salvarAcao = (indice: number, posicao: number) => {
    const mensagem = conversa[indice];
    const acao = mensagem.acoes?.[posicao];
    const lead = acao && leads.find((l) => l.id === acao.loja);
    if (!acao || !lead) return;
    onSalvar(lead.id, {
      ...(acao.anotacao ? { obs: acao.anotacao } : {}),
      historico: [
        ...(lead.historico ?? []),
        ...(acao.anotacao ? [{ em: new Date().toISOString(), texto: acao.anotacao }] : []),
      ].slice(-20),
      ...(acao.status && acao.status !== statusDe(lead) ? { status: acao.status } : {}),
      ...(acao.compromisso ? { compromisso: acao.compromisso } : {}),
    });
    onConversa(
      conversa.map((m, i) => (i === indice ? { ...m, salvas: [...(m.salvas ?? []), posicao] } : m)),
    );
    avisar(`${lead.nome}: salvo no painel`);
  };

  const copiar = async (t: string) => {
    try {
      await navigator.clipboard.writeText(t);
      avisar("Copiado");
    } catch {
      avisar("Não deu para copiar. Segure no texto e copie.");
    }
  };

  if (disponivel === false) {
    return (
      <p className={cn(cardSurface, "px-4 py-6 text-[13px] text-[color:var(--bjork-text-medium)]")}>
        O assistente usa o Claude da sua conta. Abra o painel pelo app do Claude, logado, e libere o Claude
        quando ele pedir.
      </p>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-3">
      {conversa.length === 0 && !respondendo && (
        <div className={cn(cardSurface, "flex flex-col gap-3 p-4")}>
          <p className="text-[13.5px] leading-relaxed text-[color:var(--bjork-text-medium)]">
            Pergunte qualquer coisa sobre as lojas, peça uma mensagem pronta ou mande o print de uma conversa do
            WhatsApp. Ele sabe as regras de abordagem e organiza o painel pra você.
          </p>
          <div className="flex flex-wrap gap-2">
            {SUGESTOES.map((s) => (
              <BlockButton key={s} variant="secondary" size="sm" onClick={() => enviar(s)}>
                {s}
              </BlockButton>
            ))}
          </div>
        </div>
      )}

      <ol className="flex flex-col gap-3" aria-label="Conversa com o assistente">
        {conversa.map((m, i) => (
          <li key={`${m.em}-${i}`} className={cn("flex", m.papel === "brenno" ? "justify-end" : "justify-start")}>
            {m.papel === "brenno" ? (
              <div className="max-w-[85%] rounded-[16px] rounded-br-[6px] bg-[var(--bjork-accent-soft)] px-3.5 py-2.5 text-[13.5px] leading-relaxed">
                {m.foto && (
                  <span className="mb-1 flex items-center gap-1.5 text-[12px] font-medium text-[color:var(--blk-accent-ink)]">
                    <ImagePlus aria-hidden="true" className="size-3.5" />
                    Foto enviada
                  </span>
                )}
                <p className="whitespace-pre-wrap [overflow-wrap:anywhere]">{m.texto}</p>
              </div>
            ) : (
              <div className="flex max-w-[92%] flex-col gap-2">
                <div className={cn(cardSurface, "rounded-bl-[6px] px-3.5 py-2.5")}>
                  <p className="whitespace-pre-wrap text-[13.5px] leading-relaxed [overflow-wrap:anywhere]">
                    {m.texto}
                  </p>
                  <div className="mt-1.5 flex justify-end">
                    <IconButton label="Copiar resposta" size="sm" onClick={() => copiar(m.texto)}>
                      <Copy />
                    </IconButton>
                  </div>
                </div>
                {m.acoes?.map((acao, posicao) => (
                  <CartaoAcao
                    key={posicao}
                    acao={acao}
                    lead={leads.find((l) => l.id === acao.loja)}
                    salva={m.salvas?.includes(posicao) ?? false}
                    onSalvar={() => salvarAcao(i, posicao)}
                    onAbrir={onAbrir}
                  />
                ))}
              </div>
            )}
          </li>
        ))}
        {respondendo && (
          <li className="flex justify-start" aria-live="polite">
            <div className={cn(cardSurface, "max-w-[92%] rounded-bl-[6px] px-3.5 py-2.5")}>
              <p className="whitespace-pre-wrap text-[13.5px] leading-relaxed text-[color:var(--bjork-text-medium)]">
                {resposta || "Pensando…"}
              </p>
            </div>
          </li>
        )}
      </ol>

      {erro && (
        <p role="alert" className="text-[13px] font-medium" style={{ color: "var(--blk-error)" }}>
          {erro}
        </p>
      )}

      <div ref={fim} />

      <div className="sticky bottom-0 -mx-5 mt-auto flex flex-col gap-2 bg-[var(--bjork-bg)] px-5 pb-3 pt-2">
        {previa && (
          <div className="relative self-start">
            <img src={previa} alt="Foto que vai junto" className="h-20 rounded-[10px] border border-[color:var(--bjork-border)]" />
            <IconButton
              label="Tirar a foto"
              size="sm"
              onClick={() => setFoto(null)}
              className="absolute -right-2 -top-2 bg-[var(--bjork-surface-active)]"
            >
              <X />
            </IconButton>
          </div>
        )}
        <div className="flex items-end gap-2">
          {tipos.length > 0 && (
            <>
              <input
                ref={arquivo}
                type="file"
                accept={tipos.join(",")}
                className="hidden"
                aria-label="Escolher foto"
                onChange={(event) => {
                  setFoto(event.target.files?.[0] ?? null);
                  event.target.value = "";
                }}
              />
              <IconButton label="Mandar foto" onClick={() => arquivo.current?.click()} disabled={respondendo}>
                <ImagePlus />
              </IconButton>
            </>
          )}
          <label htmlFor={campoId} className="sr-only">
            Mensagem para o assistente
          </label>
          <textarea
            id={campoId}
            rows={2}
            value={texto}
            onChange={(event) => setTexto(event.target.value)}
            placeholder={tipos.length ? "Pergunte ou mande um print da conversa" : "Pergunte ao assistente"}
            className={cn(fieldClass, "min-h-[44px] flex-1 py-2.5 leading-snug")}
          />
          {respondendo ? (
            <IconButton label="Parar" onClick={() => controle.current?.abort()}>
              <Square />
            </IconButton>
          ) : (
            <IconButton label="Enviar" onClick={() => enviar()} disabled={!texto.trim() && !foto}>
              <Send />
            </IconButton>
          )}
        </div>
        {conversa.length > 0 && !respondendo && (
          <BlockButton variant="ghost" size="sm" className="self-start" onClick={() => onConversa([])}>
            <Trash2 aria-hidden="true" />
            Limpar conversa
          </BlockButton>
        )}
      </div>
    </div>
  );
}

function CartaoAcao({
  acao,
  lead,
  salva,
  onSalvar,
  onAbrir,
}: {
  acao: Acao;
  lead?: Lead;
  salva: boolean;
  onSalvar: () => void;
  onAbrir: (lead: Lead) => void;
}) {
  if (!lead) return null;
  return (
    <div className="flex flex-col gap-1.5 rounded-[12px] border border-[color:var(--bjork-border-strong)] bg-[var(--bjork-accent-soft)] p-3 text-[13px]">
      <p className="font-medium">Atualizar {lead.nome}</p>
      {acao.status && acao.status !== statusDe(lead) && (
        <p className="flex items-center gap-2">
          Situação: <StatusChip status={acao.status} longo />
        </p>
      )}
      {acao.compromisso && (
        <p>
          Marcado: <span className="font-medium">{quandoCurto(acao.compromisso.quando)}</span> · {acao.compromisso.oque}
        </p>
      )}
      {acao.anotacao && <p className="text-[color:var(--bjork-text-medium)]">Anotação: {acao.anotacao}</p>}
      <div className="mt-1 flex gap-2">
        {salva ? (
          <p className="flex items-center gap-1.5 font-medium" style={{ color: "var(--blk-success)" }}>
            <Check aria-hidden="true" className="size-4" />
            Salvo no painel
          </p>
        ) : (
          <BlockButton size="sm" onClick={onSalvar}>
            <Check aria-hidden="true" />
            Salvar no painel
          </BlockButton>
        )}
        <BlockButton size="sm" variant="ghost" onClick={() => onAbrir(lead)}>
          Ver ficha
        </BlockButton>
      </div>
    </div>
  );
}

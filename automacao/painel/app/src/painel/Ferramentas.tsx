import { useEffect, useId, useState } from "react";
import {
  BlockButton,
  cardSurface,
  fieldClass,
} from "@/components/ui/app-dashboard-shell-utils/app-block-kit";
import { cn } from "@/lib/utils";
import { TPL_PADRAO, textoMensagem, type Lead } from "./leads";

const rotulo = "mb-1.5 block text-[13px] font-medium";
const ajuda = "mt-1.5 text-[12.5px] text-[color:var(--bjork-text-muted)]";

/** Edita o texto da primeira mensagem, com prévia em um comércio de verdade. */
export function MensagemPadrao({
  tpl,
  exemplo,
  onSalvar,
}: {
  tpl: string;
  exemplo: Lead | null;
  onSalvar: (texto: string) => void;
}) {
  const [texto, setTexto] = useState(tpl);
  const id = useId();
  // Acompanha o texto salvo quando ele chega do banco depois de a tela abrir.
  useEffect(() => setTexto(tpl), [tpl]);

  return (
    <section className={cn(cardSurface, "flex flex-col gap-4 p-4")}>
      <div>
        <label htmlFor={id} className={rotulo}>
          Texto da primeira mensagem
        </label>
        <textarea
          id={id}
          rows={9}
          value={texto}
          onChange={(event) => setTexto(event.target.value)}
          className={cn(fieldClass, "py-2.5 leading-relaxed")}
        />
        <p className={ajuda}>
          Escreva {"{nome}"} e {"{avaliacoes}"} onde entram o nome e o número de avaliações de cada
          comércio. Vale para as próximas mensagens.
        </p>
      </div>
      {exemplo && (
        <div>
          <h2 className="mb-1.5 text-[12.5px] font-medium text-[color:var(--bjork-text-muted)]">
            Como fica para {exemplo.nome}
          </h2>
          <p className="whitespace-pre-wrap rounded-[12px] border border-[color:var(--bjork-border)] bg-[var(--bjork-field-inset)] p-3 text-[13.5px] leading-relaxed text-[color:var(--bjork-text-medium)] [overflow-wrap:anywhere]">
            {textoMensagem(texto.trim() || TPL_PADRAO, exemplo)}
          </p>
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        <BlockButton onClick={() => onSalvar(texto)} disabled={texto.trim() === tpl.trim()}>
          Salvar mensagem
        </BlockButton>
        <BlockButton
          variant="ghost"
          onClick={() => setTexto(TPL_PADRAO)}
          disabled={texto === TPL_PADRAO}
        >
          Voltar ao texto original
        </BlockButton>
      </div>
    </section>
  );
}

/** Recebe a lista JSON da pesquisa diária e cadastra as empresas novas. */
export function Importar({ onImportar }: { onImportar: (texto: string) => Promise<number> }) {
  const [texto, setTexto] = useState("");
  const [ocupado, setOcupado] = useState(false);
  const [resultado, setResultado] = useState<{ ok: boolean; texto: string } | null>(null);
  const id = useId();

  const importar = async () => {
    setOcupado(true);
    setResultado(null);
    try {
      const novos = await onImportar(texto);
      setResultado({
        ok: true,
        texto:
          novos === 0
            ? "Nenhuma empresa nova: todas já estavam no painel."
            : novos === 1
              ? "1 empresa nova importada."
              : `${novos} empresas novas importadas.`,
      });
      setTexto("");
    } catch (e) {
      setResultado({ ok: false, texto: e instanceof Error ? e.message : "Não deu para importar." });
    } finally {
      setOcupado(false);
    }
  };

  return (
    <section className={cn(cardSurface, "flex flex-col gap-4 p-4")}>
      <div>
        <label htmlFor={id} className={rotulo}>
          Lista da pesquisa diária
        </label>
        <textarea
          id={id}
          rows={9}
          value={texto}
          onChange={(event) => setTexto(event.target.value)}
          placeholder={'[{"nome":"…","tipo":"Pizzaria","cidade":"Casimiro de Abreu","whatsapp":"5522999999999"}]'}
          spellCheck={false}
          aria-describedby={`${id}-ajuda`}
          className={cn(fieldClass, "py-2.5 font-mono text-[12.5px] leading-relaxed")}
        />
        <p id={`${id}-ajuda`} className={ajuda}>
          Cole aqui a lista JSON que o resumo das 06:17 manda. Empresa repetida é ignorada.
        </p>
        {resultado && (
          <p
            role={resultado.ok ? "status" : "alert"}
            className="mt-2 text-[13px] font-medium"
            style={{ color: resultado.ok ? "var(--blk-success)" : "var(--blk-error)" }}
          >
            {resultado.texto}
          </p>
        )}
      </div>
      <div>
        <BlockButton onClick={importar} disabled={ocupado || !texto.trim()}>
          {ocupado ? "Importando…" : "Importar empresas"}
        </BlockButton>
      </div>
    </section>
  );
}

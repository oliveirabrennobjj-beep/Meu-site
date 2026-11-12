import { useEffect, useId, useState } from "react";
import {
  BlockButton,
  cardSurface,
  fieldClass,
} from "@/components/ui/app-dashboard-shell-utils/app-block-kit";
import { SegmentedControl } from "@/components/ui/dashboard-parts";
import { cn } from "@/lib/utils";
import {
  TEXTOS_INFO,
  TEXTOS_PADRAO,
  ehCasimiro,
  statusDe,
  textoMensagem,
  type ChaveTexto,
  type Lead,
  type Textos,
} from "./leads";

const rotulo = "mb-1.5 block text-[13px] font-medium";
const ajuda = "mt-1.5 text-[12.5px] text-[color:var(--bjork-text-muted)]";

const CHAVES = Object.keys(TEXTOS_INFO) as ChaveTexto[];
const ABAS = CHAVES.map((id) => ({ id, label: TEXTOS_INFO[id].curto, long: TEXTOS_INFO[id].longo }));

/** Edita os três textos de primeiro contato, com prévia em um comércio de verdade de cada caso. */
export function Mensagens({
  textos,
  leads,
  onSalvar,
}: {
  textos: Textos;
  leads: Lead[];
  onSalvar: (textos: Textos) => void;
}) {
  const [rascunho, setRascunho] = useState(textos);
  const [aba, setAba] = useState<ChaveTexto>("fora");
  const id = useId();
  // Acompanha os textos salvos quando eles chegam do banco depois de a tela abrir.
  useEffect(() => setRascunho(textos), [textos]);

  const doLugar = leads.filter((l) => ehCasimiro(l) === (aba !== "fora"));
  const exemplo = doLugar.find((l) => statusDe(l) === "novo") ?? doLugar[0] ?? null;
  const mudou = CHAVES.some((chave) => rascunho[chave].trim() !== textos[chave].trim());

  return (
    <section className={cn(cardSurface, "flex flex-col gap-4 p-4")}>
      <SegmentedControl value={aba} onChange={setAba} options={ABAS} label="Qual mensagem editar" />
      <div>
        <label htmlFor={id} className={rotulo}>
          {TEXTOS_INFO[aba].longo}
        </label>
        <textarea
          id={id}
          rows={9}
          value={rascunho[aba]}
          onChange={(event) => setRascunho({ ...rascunho, [aba]: event.target.value })}
          className={cn(fieldClass, "py-2.5 leading-relaxed")}
        />
        <p className={ajuda}>
          O painel troca sozinho: {"{nome}"}, {"{cidade}"}, {"{nicho}"} (a frase do ramo do
          comércio) e {"{elogio}"} (cita as avaliações de quem tem 30 ou mais). Não coloque preço:
          ele entra só na conversa.
        </p>
      </div>
      {exemplo && (
        <div>
          <h2 className="mb-1.5 text-[12.5px] font-medium text-[color:var(--bjork-text-muted)]">
            Como fica para {exemplo.nome}
          </h2>
          <p className="whitespace-pre-wrap rounded-[12px] border border-[color:var(--bjork-border)] bg-[var(--bjork-field-inset)] p-3 text-[13.5px] leading-relaxed text-[color:var(--bjork-text-medium)] [overflow-wrap:anywhere]">
            {textoMensagem(rascunho, exemplo, aba === "casimiroPlaca" ? "placa" : "site")}
          </p>
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        <BlockButton onClick={() => onSalvar(rascunho)} disabled={!mudou}>
          Salvar mensagens
        </BlockButton>
        <BlockButton
          variant="ghost"
          onClick={() => setRascunho({ ...rascunho, [aba]: TEXTOS_PADRAO[aba] })}
          disabled={rascunho[aba] === TEXTOS_PADRAO[aba]}
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

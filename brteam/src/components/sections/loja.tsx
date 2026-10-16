import { useId, useState } from "react";
import { Minus, Plus, Ruler } from "lucide-react";
import { WhatsAppIcon } from "@/components/brand-icons";
import { Opcoes, estiloCampo } from "@/components/sections/interacoes";
import { fotos, linkWhatsApp, loja, type Tamanho } from "@/data/site";
import { cn } from "@/lib/utils";

type Modelo = keyof typeof loja.produtos;

const corAmostra: Record<string, string> = { Branco: "#f4f4f2", Preto: "#111111", Azul: "#1d4fb8" };

function tamanhoPorAltura(tamanhos: Tamanho[], altura: number) {
  if (!altura) return null;
  return (
    tamanhos.find((t) => altura >= t.altura[0] && altura < t.altura[1]) ??
    (altura < tamanhos[0].altura[0] ? tamanhos[0] : altura >= tamanhos[tamanhos.length - 1].altura[1] ? tamanhos[tamanhos.length - 1] : null)
  );
}

export function Loja() {
  const uid = useId();
  const [modelo, setModelo] = useState<Modelo>("adulto");
  const [cor, setCor] = useState(loja.cores[0]);
  const [tamanho, setTamanho] = useState<string | null>(null);
  const [altura, setAltura] = useState("");
  const [qtd, setQtd] = useState(1);
  const [tentou, setTentou] = useState(false);

  const produto = loja.produtos[modelo];
  const sugerido = tamanhoPorAltura(produto.tamanhos, Number(altura));
  const escolhido = tamanho ?? sugerido?.tamanho ?? null;

  function trocarModelo(m: Modelo) {
    setModelo(m);
    setTamanho(null);
    setAltura("");
    setTentou(false);
  }

  const mensagem = [
    "Olá, BR Team! Quero comprar pela loja do site:",
    "",
    `Produto: ${produto.nome.toLowerCase()}`,
    `Quantidade: ${qtd}`,
    `Cor: ${cor.toLowerCase()}`,
    `Tamanho: ${escolhido ?? "não sei, preciso de ajuda"}`,
    ...(altura ? [`Altura: ${altura} cm`] : []),
  ].join("\n");

  function pedir() {
    setTentou(true);
    if (!escolhido) {
      document.getElementById(`${uid}-altura`)?.focus();
      return;
    }
    window.open(linkWhatsApp(mensagem), "_blank", "noopener");
  }

  const erroTamanho = tentou && !escolhido ? "Escolha um tamanho ou informe a altura para a gente indicar." : undefined;

  return (
    <section id="loja" className="bg-carbono py-24 md:py-32">
      <div className="pagina grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
        <div>
          <h2 className="titulo">Loja BR Team</h2>
          <p className="mt-6 max-w-[42ch] text-lg text-cinza">
            Compre seu kimono direto com o professor. Escolha o modelo, a cor e o tamanho, e o pedido vai pronto para o
            WhatsApp da academia.
          </p>
          <div className="mt-10 grid grid-cols-2 gap-3">
            <figure>
              <img src={fotos.cumprimento.src} alt={fotos.cumprimento.alt} width={fotos.cumprimento.w} height={fotos.cumprimento.h} loading="lazy" className="aspect-[3/4] w-full bg-white object-contain" />
              <figcaption className="mt-2 text-sm text-cinza">Kimono adulto</figcaption>
            </figure>
            <figure>
              <img src={fotos.kids[2].src} alt={fotos.kids[2].alt} width={fotos.kids[2].w} height={fotos.kids[2].h} loading="lazy" className="aspect-[3/4] w-full bg-white object-cover object-top" />
              <figcaption className="mt-2 text-sm text-cinza">Kimono infantil</figcaption>
            </figure>
          </div>
        </div>

        <div className="claro bg-white p-6 text-black sm:p-10">
          <div className="flex items-baseline justify-between gap-4">
            <h3 className="font-display text-3xl font-bold uppercase leading-none">{produto.nome}</h3>
            <p className="font-display text-2xl font-bold tabular-nums">{produto.preco ?? <span className="text-lg font-semibold italic text-chumbo">Consulte</span>}</p>
          </div>

          <div className="mt-8 space-y-7">
            <Opcoes
              legenda="Modelo"
              nome={`${uid}-modelo`}
              valor={modelo}
              onChange={trocarModelo}
              opcoes={[{ v: "adulto", rotulo: "Adulto" }, { v: "infantil", rotulo: "Infantil" }]}
            />
            <Opcoes
              legenda="Cor"
              nome={`${uid}-cor`}
              valor={cor}
              onChange={setCor}
              opcoes={loja.cores.map((c) => ({
                v: c,
                rotulo: (
                  <span className="flex items-center gap-2">
                    <span aria-hidden="true" className="size-4 rounded-full ring-1 ring-black/25" style={{ background: corAmostra[c] }} />
                    {c}
                  </span>
                ),
              }))}
            />

            <fieldset>
              <legend className="text-sm font-semibold">Tamanho</legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {produto.tamanhos.map((t) => {
                  const ativo = escolhido === t.tamanho;
                  return (
                    <button
                      key={t.tamanho}
                      type="button"
                      aria-pressed={ativo}
                      onClick={() => setTamanho(ativo && tamanho ? null : t.tamanho)}
                      className={cn(
                        "inline-flex min-h-11 min-w-14 items-center justify-center rounded-sm border px-3 font-medium tabular-nums transition-colors",
                        ativo ? "border-black bg-black text-white" : "border-black/25 hover:border-black",
                      )}
                    >
                      {t.tamanho}
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <div className="rounded-sm bg-algodao p-4">
              <label htmlFor={`${uid}-altura`} className="flex items-center gap-2 text-sm font-semibold">
                <Ruler className="size-4" aria-hidden="true" /> Não sabe o tamanho? Informe a altura
              </label>
              <div className="mt-1 flex items-center gap-3">
                <input
                  id={`${uid}-altura`}
                  type="number"
                  inputMode="numeric"
                  min={80}
                  max={220}
                  placeholder="Ex.: 172"
                  value={altura}
                  onChange={(e) => {
                    setAltura(e.target.value);
                    setTamanho(null);
                  }}
                  aria-describedby={`${uid}-sugestao`}
                  aria-invalid={!!erroTamanho}
                  className={cn(estiloCampo, "mt-1 max-w-[140px] tabular-nums")}
                />
                <span className="text-chumbo">cm</span>
              </div>
              <p id={`${uid}-sugestao`} aria-live="polite" className={cn("mt-2 text-sm", erroTamanho ? "font-medium text-ponteira-escura" : "text-chumbo")}>
                {erroTamanho ??
                  (sugerido
                    ? `Tamanho indicado: ${sugerido.tamanho} (de ${sugerido.altura[0]} a ${sugerido.altura[1]} cm, ${sugerido.peso}). O professor confirma no pedido.`
                    : "A gente indica o tamanho pela tabela de medidas.")}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-6">
              <div>
                <span id={`${uid}-qtd`} className="text-sm font-semibold">Quantidade</span>
                <div role="group" aria-labelledby={`${uid}-qtd`} className="mt-2 flex items-center">
                  <button type="button" onClick={() => setQtd((q) => Math.max(1, q - 1))} disabled={qtd <= 1} className="inline-flex size-11 items-center justify-center rounded-sm border border-black/25 hover:border-black disabled:opacity-40">
                    <Minus className="size-4" aria-hidden="true" />
                    <span className="sr-only">Diminuir</span>
                  </button>
                  <output aria-live="polite" className="w-12 text-center font-display text-2xl font-bold tabular-nums">{qtd}</output>
                  <button type="button" onClick={() => setQtd((q) => Math.min(10, q + 1))} disabled={qtd >= 10} className="inline-flex size-11 items-center justify-center rounded-sm border border-black/25 hover:border-black disabled:opacity-40">
                    <Plus className="size-4" aria-hidden="true" />
                    <span className="sr-only">Aumentar</span>
                  </button>
                </div>
              </div>
              <p className="text-right text-chumbo">
                {qtd} {qtd > 1 ? "kimonos" : "kimono"} · {cor.toLowerCase()} · {escolhido ?? "tamanho a escolher"}
              </p>
            </div>

            <button type="button" onClick={pedir} className="botao botao-primario w-full">
              <WhatsAppIcon className="size-5" /> Pedir pelo WhatsApp
            </button>

            <details className="group border-t border-black/10 pt-4">
              <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between font-semibold [&::-webkit-details-marker]:hidden">
                Tabela de medidas ({modelo === "adulto" ? "adulto" : "infantil"})
                <Plus aria-hidden="true" className="size-5 transition-transform group-open:rotate-45" />
              </summary>
              <table className="mt-3 w-full text-left text-[15px]">
                <thead>
                  <tr className="border-b border-black/15 text-sm text-chumbo">
                    <th scope="col" className="py-2 font-medium">Tamanho</th>
                    <th scope="col" className="py-2 font-medium">Altura</th>
                    <th scope="col" className="py-2 font-medium">Peso</th>
                  </tr>
                </thead>
                <tbody>
                  {produto.tamanhos.map((t) => (
                    <tr key={t.tamanho} className={cn("border-b border-black/10", escolhido === t.tamanho && "bg-algodao font-semibold")}>
                      <th scope="row" className="py-2 tabular-nums">{t.tamanho}</th>
                      <td className="py-2 tabular-nums">{t.altura[0]} a {t.altura[1]} cm</td>
                      <td className="py-2 tabular-nums">{t.peso}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="mt-3 text-sm text-chumbo">Medidas aproximadas. Na dúvida, o professor ajuda a escolher.</p>
            </details>
          </div>
        </div>
      </div>
    </section>
  );
}

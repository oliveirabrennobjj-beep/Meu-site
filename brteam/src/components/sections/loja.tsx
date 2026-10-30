import { useId, useRef, useState, type FormEvent } from "react";
import { CheckCircle2, Minus, Pencil, Plus } from "lucide-react";
import { WhatsAppIcon } from "@/components/brand-icons";
import { EscolhaHorario, Opcoes, estiloCampo } from "@/components/sections/interacoes";
import { academia, aulasParaIdade, fotos, linkWhatsApp, loja, rotuloAula, turmaPorIdade } from "@/data/site";
import { cn } from "@/lib/utils";

/*
  Kimono: o preço não fica no site. A pessoa diz para quem é o kimono e o pedido de preço chega pronto
  no WhatsApp do professor Bruno, com nome, idade e turma do aluno. Dali a conversa continua com ele,
  que passa o valor, vê o tamanho e faz a encomenda.
*/

const corAmostra: Record<string, string> = { Branco: "#f4f4f2", Preto: "#111111", Azul: "#1d4fb8" };

export function Loja() {
  const uid = useId();
  const [paraQuem, setParaQuem] = useState<"filho" | "mim">("filho");
  const [nome, setNome] = useState("");
  const [idade, setIdade] = useState("");
  const [horario, setHorario] = useState("");
  const [cor, setCor] = useState(loja.cores[0]);
  const [qtd, setQtd] = useState(1);
  const [tentou, setTentou] = useState(false);
  const [enviado, setEnviado] = useState<string | null>(null);
  const sucessoRef = useRef<HTMLDivElement>(null);

  const idadeNum = Number(idade);
  const idadeOk = !!idade && Number.isInteger(idadeNum) && idadeNum >= academia.idadeMinima && idadeNum <= 99;
  const turma = idadeOk ? turmaPorIdade(idadeNum).turma : null;
  const produto = turma === "Kids" ? loja.produtos.infantil : loja.produtos.adulto;
  const horarioOk = idadeOk && aulasParaIdade(idadeNum).some((a) => rotuloAula(a) === horario);

  const erros = {
    nome: nome.trim().length < 2 ? (paraQuem === "filho" ? "Escreva o nome da criança." : "Escreva seu nome.") : undefined,
    idade: !idadeOk ? `Informe a idade em anos (a partir de ${academia.idadeMinima}).` : undefined,
    horario: idadeOk && !horarioOk ? "Escolha o horário da turma." : undefined,
  };

  const tipo = produto.nome.toLowerCase();
  const mensagem = [
    paraQuem === "filho"
      ? `Olá, professor Bruno! Vim pelo site da BR Team e quero saber o preço do ${tipo} para meu filho(a) ${nome.trim()}, de ${idadeNum} anos.`
      : `Olá, professor Bruno! Vim pelo site da BR Team e quero saber o preço do ${tipo} para mim. Sou ${nome.trim()}, tenho ${idadeNum} anos.`,
    "",
    `Turma: ${horario}`,
    `Cor: ${cor.toLowerCase()}`,
    `Quantidade: ${qtd}`,
  ].join("\n");

  function pedir(e: FormEvent) {
    e.preventDefault();
    setTentou(true);
    const primeiro = (Object.keys(erros) as (keyof typeof erros)[]).find((k) => erros[k]);
    if (primeiro) {
      document.querySelector<HTMLElement>(`#loja [name="${uid}-${primeiro}"]`)?.focus();
      return;
    }
    const url = linkWhatsApp(mensagem);
    setEnviado(url);
    requestAnimationFrame(() => sucessoRef.current?.focus());
    window.open(url, "_blank", "noopener");
  }

  const erro = (k: keyof typeof erros) => (tentou ? erros[k] : undefined);

  return (
    <section id="loja" className="claro bg-white py-16 text-black md:py-32">
      <div className="pagina grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
        <div>
          <h2 className="titulo">Loja BR Team</h2>
          <p className="mt-6 max-w-[42ch] text-lg text-chumbo">
            O kimono é encomendado direto com o professor Bruno, e o preço ele passa pelo WhatsApp. Preencha os dados
            do aluno: a mensagem chega pronta no WhatsApp dele, dizendo o que você quer. Ele responde com o valor, vê o
            tamanho certo e faz a encomenda.
          </p>
          <div className="mt-10 grid grid-cols-2 gap-3">
            <figure>
              <img src={fotos.cumprimento.src} alt={fotos.cumprimento.alt} width={fotos.cumprimento.w} height={fotos.cumprimento.h} loading="lazy" className="aspect-[3/4] w-full bg-gelo object-contain" />
              <figcaption className="mt-2 text-sm text-chumbo">Kimono adulto</figcaption>
            </figure>
            <figure>
              <img src={fotos.kids[2].src} alt={fotos.kids[2].alt} width={fotos.kids[2].w} height={fotos.kids[2].h} loading="lazy" className="aspect-[3/4] w-full bg-gelo object-contain object-bottom" />
              <figcaption className="mt-2 text-sm text-chumbo">Kimono infantil</figcaption>
            </figure>
          </div>
        </div>

        <div className="claro bg-gelo p-6 text-black ring-1 ring-marinho/10 sm:p-10">
          {enviado ? (
            <div ref={sucessoRef} tabIndex={-1} role="status" className="surge-rapido outline-none">
              <CheckCircle2 className="estala size-10 text-[#1f8a4c]" aria-hidden="true" />
              <h3 className="mt-4 font-display text-3xl font-bold uppercase leading-none">Mensagem pronta no WhatsApp</h3>
              <p className="mt-3 text-chumbo">Confira e toque em enviar. O professor Bruno responde com o preço e o prazo.</p>
              <pre className="mt-6 whitespace-pre-wrap rounded-sm bg-algodao p-4 font-sans text-[15px] leading-relaxed">{mensagem}</pre>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <a href={enviado} target="_blank" rel="noopener noreferrer" className="botao botao-primario">
                  <WhatsAppIcon className="size-5" /> Abrir o WhatsApp de novo
                </a>
                <button type="button" onClick={() => setEnviado(null)} className="botao botao-contorno">
                  <Pencil className="size-4" aria-hidden="true" /> Editar pedido
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={pedir} noValidate className="space-y-7">
              <div>
                <h3 className="font-display text-3xl font-bold uppercase leading-none">{produto.nome}</h3>
                <p className="mt-2 text-chumbo">
                  {produto.preco ? <span className="font-display text-2xl font-bold tabular-nums text-black">{produto.preco}</span> : "Preço e prazo com o professor Bruno, pelo WhatsApp."}
                </p>
              </div>

              <Opcoes
                legenda="O kimono é para quem?"
                nome={`${uid}-para`}
                valor={paraQuem}
                onChange={setParaQuem}
                opcoes={[{ v: "filho", rotulo: "Para meu filho(a)" }, { v: "mim", rotulo: "Para mim" }]}
              />

              <div className="grid gap-6 sm:grid-cols-[1fr_140px]">
                <div>
                  <label htmlFor={`${uid}-nome`} className="text-sm font-semibold">{paraQuem === "filho" ? "Nome da criança" : "Seu nome"}</label>
                  <input
                    id={`${uid}-nome`} name={`${uid}-nome`} value={nome} onChange={(e) => setNome(e.target.value)}
                    aria-invalid={!!erro("nome")} aria-describedby={erro("nome") ? `${uid}-nome-erro` : undefined}
                    className={estiloCampo}
                  />
                  {erro("nome") && <p id={`${uid}-nome-erro`} className="mt-1.5 text-sm font-medium text-erro">{erro("nome")}</p>}
                </div>
                <div>
                  <label htmlFor={`${uid}-idade`} className="text-sm font-semibold">{paraQuem === "filho" ? "Idade da criança" : "Sua idade"}</label>
                  <input
                    id={`${uid}-idade`} name={`${uid}-idade`} type="number" inputMode="numeric" min={academia.idadeMinima} max={99} value={idade}
                    onChange={(e) => setIdade(e.target.value)}
                    aria-invalid={!!erro("idade")} aria-describedby={erro("idade") ? `${uid}-idade-erro` : undefined}
                    className={cn(estiloCampo, "tabular-nums")}
                  />
                  {erro("idade") && <p id={`${uid}-idade-erro`} className="mt-1.5 text-sm font-medium text-erro">{erro("idade")}</p>}
                </div>
              </div>

              <EscolhaHorario idade={idadeOk ? idadeNum : null} valor={horario} onChange={setHorario} erro={erro("horario")} nome={`${uid}-horario`} />

              <Opcoes
                legenda="Cor do kimono"
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

              <div>
                <span id={`${uid}-qtd`} className="text-sm font-semibold">Quantidade</span>
                <div role="group" aria-labelledby={`${uid}-qtd`} className="mt-2 flex items-center">
                  <button type="button" onClick={() => setQtd((q) => Math.max(1, q - 1))} disabled={qtd <= 1} className="inline-flex size-11 items-center justify-center rounded-sm border border-black/25 hover:border-black disabled:opacity-40">
                    <Minus className="size-4" aria-hidden="true" />
                    <span className="sr-only">Diminuir</span>
                  </button>
                  <output key={qtd} aria-live="polite" className="estala w-12 text-center font-display text-2xl font-bold tabular-nums">{qtd}</output>
                  <button type="button" onClick={() => setQtd((q) => Math.min(10, q + 1))} disabled={qtd >= 10} className="inline-flex size-11 items-center justify-center rounded-sm border border-black/25 hover:border-black disabled:opacity-40">
                    <Plus className="size-4" aria-hidden="true" />
                    <span className="sr-only">Aumentar</span>
                  </button>
                </div>
              </div>

              <button type="submit" className="botao botao-primario w-full">
                <WhatsAppIcon className="size-5" /> Pedir o preço no WhatsApp
              </button>
              <p className="text-center text-sm text-chumbo">O tamanho o professor vê com o aluno. Nada é enviado sem você confirmar.</p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

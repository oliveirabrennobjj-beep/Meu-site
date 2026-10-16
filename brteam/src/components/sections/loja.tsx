import { useId, useState, type FormEvent } from "react";
import { CheckCircle2, Minus, Pencil, Plus } from "lucide-react";
import { WhatsAppIcon } from "@/components/brand-icons";
import { EscolhaHorario, Opcoes, estiloCampo } from "@/components/sections/interacoes";
import { aulasDaTurma, fotos, linkWhatsApp, loja, rotuloAula, turmaPorIdade } from "@/data/site";
import { cn } from "@/lib/utils";

/*
  Encomenda de kimono: o pedido chega pronto no WhatsApp da academia, com nome,
  idade e horário do aluno. O professor cuida do tamanho e da encomenda.
*/

const corAmostra: Record<string, string> = { Branco: "#f4f4f2", Preto: "#111111", Azul: "#1d4fb8" };

export function Loja() {
  const uid = useId();
  const [nome, setNome] = useState("");
  const [idade, setIdade] = useState("");
  const [horario, setHorario] = useState("");
  const [cor, setCor] = useState(loja.cores[0]);
  const [qtd, setQtd] = useState(1);
  const [tentou, setTentou] = useState(false);
  const [enviado, setEnviado] = useState<string | null>(null);

  const idadeNum = Number(idade);
  const idadeOk = !!idade && Number.isInteger(idadeNum) && idadeNum >= 3 && idadeNum <= 99;
  const turma = idadeOk ? turmaPorIdade(idadeNum).turma : null;
  const produto = turma === "Kids" ? loja.produtos.infantil : loja.produtos.adulto;
  const horarioOk = !!turma && aulasDaTurma(turma).some((a) => rotuloAula(a) === horario);

  const erros = {
    nome: nome.trim().length < 2 ? "Escreva o nome do aluno." : undefined,
    idade: !idadeOk ? "Informe a idade em anos, de 3 a 99." : undefined,
    horario: idadeOk && !horarioOk ? "Escolha o horário em que o aluno treina." : undefined,
  };

  const mensagem = [
    "Olá, professor! Quero encomendar kimono pelo site da BR Team.",
    "",
    `Aluno: ${nome.trim()}`,
    `Idade: ${idadeNum} anos`,
    `Turma: ${horario}`,
    `Kimono: ${produto.nome.replace("Kimono ", "")}, ${cor.toLowerCase()}`,
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
    window.open(url, "_blank", "noopener");
  }

  const erro = (k: keyof typeof erros) => (tentou ? erros[k] : undefined);

  return (
    <section id="loja" className="bg-carbono py-24 md:py-32">
      <div className="pagina grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
        <div>
          <h2 className="titulo">Loja BR Team</h2>
          <p className="mt-6 max-w-[42ch] text-lg text-cinza">
            Encomende o kimono direto com o professor. Preencha os dados do aluno e o pedido chega pronto no WhatsApp
            da academia. O professor vê o tamanho certo e faz a encomenda.
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
          {enviado ? (
            <div role="status">
              <CheckCircle2 className="size-10 text-[#1f8a4c]" aria-hidden="true" />
              <h3 className="mt-4 font-display text-3xl font-bold uppercase leading-none">Pedido pronto no WhatsApp</h3>
              <p className="mt-3 text-chumbo">Confira e toque em enviar. O professor responde com o valor e o prazo.</p>
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
                  {produto.preco ? <span className="font-display text-2xl font-bold tabular-nums text-black">{produto.preco}</span> : "Valor e prazo combinados com o professor."}
                </p>
              </div>

              <div className="grid gap-6 sm:grid-cols-[1fr_140px]">
                <div>
                  <label htmlFor={`${uid}-nome`} className="text-sm font-semibold">Nome do aluno</label>
                  <input
                    id={`${uid}-nome`} name={`${uid}-nome`} value={nome} onChange={(e) => setNome(e.target.value)}
                    aria-invalid={!!erro("nome")} aria-describedby={erro("nome") ? `${uid}-nome-erro` : undefined}
                    className={estiloCampo}
                  />
                  {erro("nome") && <p id={`${uid}-nome-erro`} className="mt-1.5 text-sm font-medium text-ponteira-escura">{erro("nome")}</p>}
                </div>
                <div>
                  <label htmlFor={`${uid}-idade`} className="text-sm font-semibold">Idade</label>
                  <input
                    id={`${uid}-idade`} name={`${uid}-idade`} type="number" inputMode="numeric" min={3} max={99} value={idade}
                    onChange={(e) => setIdade(e.target.value)}
                    aria-invalid={!!erro("idade")} aria-describedby={erro("idade") ? `${uid}-idade-erro` : undefined}
                    className={cn(estiloCampo, "tabular-nums")}
                  />
                  {erro("idade") && <p id={`${uid}-idade-erro`} className="mt-1.5 text-sm font-medium text-ponteira-escura">{erro("idade")}</p>}
                </div>
              </div>

              <EscolhaHorario turma={turma} valor={horario} onChange={setHorario} erro={erro("horario")} nome={`${uid}-horario`} />

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
                  <output aria-live="polite" className="w-12 text-center font-display text-2xl font-bold tabular-nums">{qtd}</output>
                  <button type="button" onClick={() => setQtd((q) => Math.min(10, q + 1))} disabled={qtd >= 10} className="inline-flex size-11 items-center justify-center rounded-sm border border-black/25 hover:border-black disabled:opacity-40">
                    <Plus className="size-4" aria-hidden="true" />
                    <span className="sr-only">Aumentar</span>
                  </button>
                </div>
              </div>

              <button type="submit" className="botao botao-primario w-full">
                <WhatsAppIcon className="size-5" /> Encomendar pelo WhatsApp
              </button>
              <p className="text-center text-sm text-chumbo">O tamanho o professor vê com o aluno. Nada é enviado sem você confirmar.</p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

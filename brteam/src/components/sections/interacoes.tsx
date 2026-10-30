import { useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from "react";
import { CheckCircle2, Minus, Pencil, Plus } from "lucide-react";
import { WhatsAppIcon } from "@/components/brand-icons";
import {
  academia, aulasParaIdade, contato, endereco, experimental, idadeAdulto, linkWhatsApp, loja, mapaRota, mensalidade, resumoKids, rotuloAula, trocaDeFaixa, turmaPorIdade,
  type Aula,
} from "@/data/site";
import { cn } from "@/lib/utils";

type Campos = {
  nome: string;
  paraQuem: "mim" | "filho";
  nomeAluno: string;
  idade: string;
  experiencia: "nunca" | "ja";
  faixa: string;
  horario: string;
  // kimono no mesmo pedido: o responsável marca a aula e já pergunta o preço do kimono
  kimono: boolean;
  cor: string;
  qtd: number;
};
type Erros = Partial<Record<keyof Campos, string>>;

const faixasTodas = [...new Set([...trocaDeFaixa.infantil.faixas, ...trocaDeFaixa.adulto.faixas].map((f) => f.nome))];

function validar(c: Campos): Erros {
  const e: Erros = {};
  if (c.nome.trim().length < 2) e.nome = "Escreva seu nome para a gente saber com quem fala.";
  if (c.paraQuem === "filho" && c.nomeAluno.trim().length < 2) e.nomeAluno = "Escreva o nome da criança.";
  const idade = Number(c.idade);
  if (c.idade && Number.isInteger(idade) && idade > 99) e.idade = "Confira a idade: o número parece alto demais.";
  else if (!c.idade || !Number.isInteger(idade) || idade < academia.idadeMinima)
    e.idade = `Informe a idade em anos. Aceitamos alunos a partir de ${academia.idadeMinima} anos.`;
  else if (!aulasParaIdade(idade).some((a) => rotuloAula(a) === c.horario))
    e.horario = c.horario ? "Esse horário não é da turma dessa idade. Escolha um dos horários abaixo." : "Escolha o horário da aula.";
  return e;
}

function montarMensagem(c: Campos) {
  const idade = Number(c.idade);
  const linhas = [
    "Olá, BR Team! Quero agendar a aula experimental grátis.",
    "",
    `Nome: ${c.nome.trim()}`,
    c.paraQuem === "filho"
      ? `Aula para: meu filho(a) ${c.nomeAluno.trim()}, ${idade} anos`
      : `Aula para: mim, ${idade} anos`,
    `Horário: ${c.horario}`,
    ...(c.paraQuem === "filho" ? ["Vou acompanhar a criança na aula experimental."] : []),
    c.experiencia === "nunca" ? "Experiência: nunca treinou" : `Experiência: já treinou, faixa ${c.faixa.toLowerCase()}`,
    ...(c.kimono
      ? [
          "",
          `Também quero saber o preço do kimono ${tipoKimono(idade)}: ${c.cor.toLowerCase()}, ${c.qtd === 1 ? "1 unidade" : `${c.qtd} unidades`}.`,
          // quem nunca treinou ainda não sabe o tamanho: o professor vê na aula experimental
          ...(c.experiencia === "nunca"
            ? [c.paraQuem === "filho" ? "Como ele(a) nunca treinou, o professor pode ver o tamanho na aula experimental." : "Como nunca treinei, o professor pode ver o meu tamanho na aula experimental."]
            : []),
        ]
      : []),
  ];
  return linhas.join("\n");
}

const tipoKimono = (idade: number) => (turmaPorIdade(idade).turma === "Kids" ? "infantil" : "adulto");
export const corAmostra: Record<string, string> = { Branco: "#f4f4f2", Preto: "#111111", Azul: "#1d4fb8" };

/** Botões de menos e mais, de 1 a 10 (aria-disabled no limite, para o foco não cair fora do botão). */
function Quantidade({ valor, onChange, rotuloId }: { valor: number; onChange: (n: number) => void; rotuloId: string }) {
  const estilo =
    "inline-flex size-11 items-center justify-center rounded-sm border border-black/25 hover:border-black aria-disabled:cursor-not-allowed aria-disabled:opacity-40 aria-disabled:hover:border-black/25";
  return (
    <div role="group" aria-labelledby={rotuloId} className="mt-2 flex items-center">
      <button type="button" onClick={() => onChange(Math.max(1, valor - 1))} aria-disabled={valor <= 1} className={estilo}>
        <Minus className="size-4" aria-hidden="true" />
        <span className="sr-only">Diminuir</span>
      </button>
      <output aria-live="polite" className="w-12 text-center font-display text-2xl font-bold tabular-nums">{valor}</output>
      <button type="button" onClick={() => onChange(Math.min(10, valor + 1))} aria-disabled={valor >= 10} className={estilo}>
        <Plus className="size-4" aria-hidden="true" />
        <span className="sr-only">Aumentar</span>
      </button>
    </div>
  );
}

export const estiloCampo =
  "mt-2 block h-12 w-full rounded-sm border border-black/25 bg-white px-4 text-base text-black outline-none transition-colors placeholder:text-black/40 focus:border-azul focus:ring-2 focus:ring-azul/20 aria-[invalid=true]:border-erro";

/** Horários da turma indicada pela idade. */
export function EscolhaHorario({
  idade, valor, onChange, erro, nome = "horario",
}: { idade: number | null; valor: string; onChange: (v: string) => void; erro?: string; nome?: string }) {
  const opcoes = idade === null ? [] : aulasParaIdade(idade);
  // turma com um horário só (cada idade do Kids): já vem marcado, sem precisar tocar
  const unico = opcoes.length === 1 ? rotuloAula(opcoes[0]) : null;
  useEffect(() => {
    if (unico && valor !== unico) onChange(unico);
  }, [unico, valor, onChange]);
  if (idade === null) {
    return (
      <div>
        <p className="text-sm font-semibold">Horário da aula</p>
        <p className="mt-2 text-chumbo">
          {valor ? (
            <>
              Horário escolhido: <strong className="text-black">{valor}</strong>. Informe a idade para confirmar a turma.
            </>
          ) : (
            "Informe a idade para ver os horários da turma."
          )}
        </p>
      </div>
    );
  }
  const turma = turmaPorIdade(idade).turma;
  return (
    <div>
      <Opcoes
        legenda={`Horário da aula (turma ${turma})`}
        nome={nome}
        valor={valor}
        onChange={onChange}
        erroId={erro ? `${nome}-erro` : undefined}
        opcoes={opcoes.map((a) => ({ v: rotuloAula(a), rotulo: a.nome === "Adulto" ? a.horario : rotuloAula(a) }))}
      />
      {erro && <p id={`${nome}-erro`} className="mt-1.5 text-sm font-medium text-erro">{erro}</p>}
      {turma === "Kids" && idade >= 10 && (
        <p className="mt-2 text-sm text-chumbo">Se a criança for grande, o professor pode indicar a turma dos adultos.</p>
      )}
    </div>
  );
}

export function Opcoes<T extends string>({
  legenda, nome, valor, opcoes, onChange, erroId,
}: { legenda: string; nome: string; valor: T; opcoes: { v: T; rotulo: ReactNode }[]; onChange: (v: T) => void; erroId?: string }) {
  return (
    <fieldset aria-describedby={erroId} aria-invalid={erroId ? true : undefined}>
      <legend className="text-sm font-semibold">{legenda}</legend>
      <div className="mt-2 flex flex-wrap gap-2">
        {opcoes.map((o) => (
          <label
            key={o.v}
            className="inline-flex min-h-11 cursor-pointer items-center rounded-sm border border-black/25 px-4 text-[15px] transition-colors hover:border-black has-[:checked]:border-black has-[:checked]:bg-black has-[:checked]:text-white has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-azul"
          >
            <input type="radio" name={nome} value={o.v} checked={valor === o.v} onChange={() => onChange(o.v)} className="sr-only" />
            {o.rotulo}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function Campo({
  id, rotulo, erro, ajuda, children,
}: { id: string; rotulo: string; erro?: string; ajuda?: string; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-semibold">
        {rotulo}
      </label>
      {children}
      {erro ? (
        <p id={`${id}-erro`} className="mt-1.5 text-sm font-medium text-erro">
          {erro}
        </p>
      ) : ajuda ? (
        <p id={`${id}-ajuda`} className="mt-1.5 text-sm text-chumbo">
          {ajuda}
        </p>
      ) : null}
    </div>
  );
}

export function AgendarAula() {
  const uid = useId();
  const form = useRef<HTMLFormElement>(null);
  const sucessoRef = useRef<HTMLDivElement>(null);
  const [c, setC] = useState<Campos>({
    nome: "", paraQuem: "mim", nomeAluno: "", idade: "", experiencia: "nunca", faixa: "Branca", horario: "",
    kimono: false, cor: loja.cores[0], qtd: 1,
  });
  const [tocado, setTocado] = useState<Partial<Record<keyof Campos, boolean>>>({});
  const [enviado, setEnviado] = useState(false);
  const [link, setLink] = useState("");

  // "Agendar aula para meu filho" (seção Kids) já chega com a opção marcada
  useEffect(() => {
    const ouvir = (e: Event) => {
      const para = (e as CustomEvent<Campos["paraQuem"]>).detail;
      setC((o) => ({ ...o, paraQuem: para }));
      setEnviado(false);
    };
    // "Agendar aula neste horário" (seção Horários) chega com o horário marcado
    const ouvirAula = (e: Event) => {
      const aula = (e as CustomEvent<Aula>).detail;
      setC((o) => ({ ...o, horario: rotuloAula(aula), paraQuem: aula.turma === "Kids" ? "filho" : o.paraQuem }));
      setEnviado(false);
    };
    // "Pedir junto com a aula experimental" (seção Loja) chega com o kimono marcado
    const ouvirKimono = () => {
      setC((o) => ({ ...o, kimono: true }));
      setEnviado(false);
    };
    window.addEventListener("agendar:para", ouvir);
    window.addEventListener("agendar:aula", ouvirAula);
    window.addEventListener("agendar:kimono", ouvirKimono);
    return () => {
      window.removeEventListener("agendar:para", ouvir);
      window.removeEventListener("agendar:aula", ouvirAula);
      window.removeEventListener("agendar:kimono", ouvirKimono);
    };
  }, []);

  const erros = validar(c);
  const mostrarErro = (k: keyof Campos) => (tocado[k] ? erros[k] : undefined);
  const set = <K extends keyof Campos>(k: K, v: Campos[K]) => setC((o) => ({ ...o, [k]: v }));
  const idadeNum = Number(c.idade);
  const turma = c.idade && !erros.idade ? turmaPorIdade(idadeNum) : null;

  function enviar(e: FormEvent) {
    e.preventDefault();
    setTocado({ nome: true, nomeAluno: true, idade: true, horario: true });
    const chaves = Object.keys(erros) as (keyof Campos)[];
    if (chaves.length) {
      form.current?.querySelector<HTMLElement>(`[name="${chaves[0]}"]`)?.focus();
      return;
    }
    const url = linkWhatsApp(montarMensagem(c));
    setLink(url);
    setEnviado(true);
    window.open(url, "_blank", "noopener");
    requestAnimationFrame(() => sucessoRef.current?.focus());
  }

  const id = (k: string) => `${uid}-${k}`;
  const descr = (k: keyof Campos) => (mostrarErro(k) ? `${id(k)}-erro` : undefined);

  return (
    <section id="agendar" className="claro bg-white py-16 text-black md:py-32">
      <div className="pagina grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
        <div>
          <h2 className="titulo">Agende sua aula experimental grátis</h2>
          <p className="mt-6 max-w-[42ch] text-lg text-chumbo">
            <strong className="font-semibold text-black">A aula experimental é grátis: {experimental.resumo}.</strong> Na primeira ou na
            segunda aula, o pai e o professor já veem se a criança gostou; se ainda estiver na dúvida, ela volta nas outras.
          </p>
          <p className="mt-4 max-w-[42ch] text-lg text-chumbo">
            Responda algumas perguntas rápidas e escolha o horário. A gente monta a mensagem e abre o WhatsApp da academia para você enviar.
          </p>
          <ol className="mt-10 space-y-5">
            {[
              "Você responde o formulário.",
              "O WhatsApp abre com a mensagem pronta. É só enviar.",
              "O professor confirma o dia da sua primeira aula.",
            ].map((passo, i) => (
              <li key={passo} className="flex items-start gap-4">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full border-2 border-ouro-escuro font-display text-ouro-escuro text-lg font-bold">
                  {i + 1}
                </span>
                <span className="pt-1.5 text-black/80">{passo}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="claro bg-gelo p-6 text-black ring-1 ring-marinho/10 sm:p-10">
          {enviado ? (
            <div ref={sucessoRef} tabIndex={-1} className="surge-rapido outline-none" role="status">
              <CheckCircle2 className="estala size-10 text-[#1f8a4c]" aria-hidden="true" />
              <h3 className="mt-4 font-display text-3xl font-bold uppercase leading-none">Mensagem pronta no WhatsApp</h3>
              <p className="mt-3 text-chumbo">
                Confira e toque em enviar. O professor confirma o dia da sua primeira aula
                {c.kimono ? " e passa o preço do kimono." : "."}
              </p>
              <pre className="mt-6 whitespace-pre-wrap rounded-sm bg-algodao p-4 font-sans text-[15px] leading-relaxed">
                {montarMensagem(c)}
              </pre>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <a href={link} target="_blank" rel="noopener noreferrer" className="botao botao-primario">
                  <WhatsAppIcon className="size-5" /> Abrir o WhatsApp
                </a>
                <button
                  type="button"
                  onClick={() => {
                    setEnviado(false);
                    // o botão some: o foco vai para o primeiro campo, em vez de cair no começo da página
                    requestAnimationFrame(() => form.current?.querySelector<HTMLElement>('[name="nome"]')?.focus());
                  }}
                  className="botao botao-contorno"
                >
                  <Pencil className="size-4" aria-hidden="true" /> Editar respostas
                </button>
              </div>
            </div>
          ) : (
            <form ref={form} onSubmit={enviar} noValidate className="space-y-7">
              <Opcoes
                legenda="A aula é para quem?"
                nome="paraQuem"
                valor={c.paraQuem}
                onChange={(v) => set("paraQuem", v)}
                opcoes={[{ v: "mim", rotulo: "Para mim" }, { v: "filho", rotulo: "Para meu filho(a)" }]}
              />

              <div className="grid gap-6 sm:grid-cols-2">
                <Campo id={id("nome")} rotulo={c.paraQuem === "filho" ? "Seu nome (responsável)" : "Seu nome"} erro={mostrarErro("nome")}>
                  <input
                    id={id("nome")} name="nome" autoComplete="name" value={c.nome}
                    onChange={(e) => set("nome", e.target.value)}
                    onBlur={() => setTocado((t) => ({ ...t, nome: true }))}
                    aria-invalid={!!mostrarErro("nome")} aria-describedby={descr("nome")}
                    className={estiloCampo}
                  />
                </Campo>
                {c.paraQuem === "filho" && (
                  <Campo id={id("nomeAluno")} rotulo="Nome da criança" erro={mostrarErro("nomeAluno")}>
                    <input
                      id={id("nomeAluno")} name="nomeAluno" value={c.nomeAluno}
                      onChange={(e) => set("nomeAluno", e.target.value)}
                      onBlur={() => setTocado((t) => ({ ...t, nomeAluno: true }))}
                      aria-invalid={!!mostrarErro("nomeAluno")} aria-describedby={descr("nomeAluno")}
                      className={estiloCampo}
                    />
                  </Campo>
                )}
                <Campo
                  id={id("idade")}
                  rotulo={c.paraQuem === "filho" ? "Idade da criança" : "Sua idade"}
                  erro={mostrarErro("idade")}
                  ajuda="Usamos para indicar a turma."
                >
                  <input
                    id={id("idade")} name="idade" type="number" inputMode="numeric" min={academia.idadeMinima} max={99} value={c.idade}
                    onChange={(e) => set("idade", e.target.value)}
                    onBlur={() => setTocado((t) => ({ ...t, idade: true }))}
                    aria-invalid={!!mostrarErro("idade")}
                    aria-describedby={mostrarErro("idade") ? `${id("idade")}-erro` : `${id("idade")}-ajuda`}
                    className={cn(estiloCampo, "tabular-nums")}
                  />
                </Campo>
              </div>

              <p aria-live="polite" className={cn("border-l-2 pl-4 transition-colors", turma ? "border-ouro" : "border-black/15")}>
                {turma ? (
                  <>
                    <span key={turma.turma} className="surge-rapido block font-display text-2xl font-bold uppercase leading-tight">Turma indicada: {turma.turma}</span>
                    <span className="text-chumbo">{turma.detalhe}</span>
                  </>
                ) : (
                  <span className="text-chumbo">Informe a idade para ver a turma indicada.</span>
                )}
              </p>

              <Opcoes
                legenda="Já treinou Jiu-Jitsu?"
                nome="experiencia"
                valor={c.experiencia}
                onChange={(v) => set("experiencia", v)}
                opcoes={
                  c.paraQuem === "filho"
                    ? [{ v: "nunca", rotulo: "Nunca treinou" }, { v: "ja", rotulo: "Já treinou" }]
                    : [{ v: "nunca", rotulo: "Nunca treinei" }, { v: "ja", rotulo: "Já treinei" }]
                }
              />
              {c.experiencia === "ja" && (
                <Campo id={id("faixa")} rotulo="Faixa atual">
                  <select id={id("faixa")} name="faixa" value={c.faixa} onChange={(e) => set("faixa", e.target.value)} className={estiloCampo}>
                    {faixasTodas.map((f) => (
                      <option key={f}>{f}</option>
                    ))}
                  </select>
                </Campo>
              )}

              <EscolhaHorario
                idade={turma ? idadeNum : null}
                valor={c.horario}
                onChange={(v) => set("horario", v)}
                erro={mostrarErro("horario")}
              />

              <div className="rounded-sm border border-black/15 p-4">
                <label className="flex min-h-11 cursor-pointer items-center gap-3 font-semibold">
                  <input
                    type="checkbox" name="kimono" checked={c.kimono}
                    onChange={(e) => set("kimono", e.target.checked)}
                    className="size-5 shrink-0 accent-azul"
                  />
                  Também quero saber o preço do kimono
                </label>
                {c.kimono && (
                  <div className="surge-rapido mt-4 space-y-6">
                    <p className="text-[15px] text-chumbo">
                      Vai na mesma mensagem. O professor Bruno passa o preço{turma ? ` do kimono ${tipoKimono(idadeNum)}` : ""} e
                      vê o tamanho com o aluno.
                    </p>
                    {c.experiencia === "nunca" && (
                      <p className="surge-rapido rounded-sm border border-ouro/50 bg-white p-4 text-[15px]">
                        <strong>Nunca treinou? Não precisa saber o tamanho.</strong>{" "}
                        {c.paraQuem === "filho"
                          ? "Leve a criança na aula experimental: o professor vê lá o tamanho certo do kimono e passa o preço. Na primeira aula, roupa confortável já serve."
                          : "Na aula experimental o professor vê o seu tamanho certo e passa o preço. Na primeira aula, roupa confortável já serve."}
                      </p>
                    )}
                    <Opcoes
                      legenda="Cor do kimono"
                      nome="cor"
                      valor={c.cor}
                      onChange={(v) => set("cor", v)}
                      opcoes={loja.cores.map((cor) => ({
                        v: cor,
                        rotulo: (
                          <span className="flex items-center gap-2">
                            <span aria-hidden="true" className="size-4 rounded-full ring-1 ring-black/25" style={{ background: corAmostra[cor] }} />
                            {cor}
                          </span>
                        ),
                      }))}
                    />
                    <div>
                      <span id={id("qtd")} className="text-sm font-semibold">Quantidade</span>
                      <Quantidade valor={c.qtd} onChange={(n) => set("qtd", n)} rotuloId={id("qtd")} />
                    </div>
                  </div>
                )}
              </div>

              {c.paraQuem === "filho" && (
                <p className="surge-rapido rounded-sm bg-white p-4 text-[15px]">
                  <strong>Importante:</strong> na aula experimental, a criança precisa ir acompanhada do responsável.
                </p>
              )}

              <button type="submit" className="botao botao-primario w-full">
                <WhatsAppIcon className="size-5" /> Enviar pelo WhatsApp
              </button>
              <p className="text-center text-sm text-chumbo">
                Abre o WhatsApp no número {contato.whatsappExibicao}. Nada é enviado sem você confirmar.
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

const perguntas: { p: string; r: ReactNode }[] = [
  {
    p: "Nunca treinei. Posso começar?",
    r: "Pode. A maioria dos alunos começou do zero. A aula experimental existe para isso, e o professor ajusta o treino ao seu ritmo.",
  },
  {
    p: "A aula experimental é paga?",
    r: `Não, é grátis: ${experimental.resumo}. Na primeira ou na segunda aula já dá para ver se a criança (ou você) gostou; se ainda estiver na dúvida, volta nas outras. Depois, a mensalidade é ${mensalidade.valor} ${mensalidade.periodo}.`,
  },
  {
    p: "O que levar na aula experimental?",
    r: "Roupa confortável (camiseta e bermuda ou calça de malha, sem zíper nem botões), uma garrafa de água e chinelo. Sobre o kimono, o professor orienta depois da primeira aula.",
  },
  {
    p: "Jiu-Jitsu é seguro para criança?",
    r: "Sim. O Jiu-Jitsu trabalha técnica e estratégia, não força bruta, e o treino acontece em ambiente controlado, com o professor por perto. A criança aprende a se defender e, principalmente, a evitar o conflito.",
  },
  {
    p: "Com que idade a criança pode começar?",
    r: `A partir de ${academia.idadeMinima} anos: ${resumoKids}. A partir de ${idadeAdulto} anos, o aluno vai para as turmas de adultos.`,
  },
  {
    p: "Quais as formas de pagamento?",
    r: "Aceitamos Pix. Para outras formas de pagamento, fale com a gente no WhatsApp.",
  },
  {
    p: "Tem lugar para deixar a bicicleta?",
    r: "Tem. A academia tem um lugar para guardar a bicicleta durante o treino. Não temos estacionamento próprio para carros.",
  },
  {
    p: "Criança precisa ir com o responsável na aula experimental?",
    r: "Precisa. Na aula experimental, a criança vai acompanhada do pai, da mãe ou do responsável, que conhece o professor e o espaço."
  },
  {
    p: "Como funciona a troca de faixa?",
    r: (
      <>
        Nas crianças, costuma ser cerca de um ano em cada faixa, e o professor pode pular uma etapa quando a criança está
        pronta. Nos adultos, é preciso treinar pelo menos 70% a 80% das aulas do ano, respeitando os tempos mínimos de
        cada faixa. Conta o treino de verdade, não só os anos de matrícula, e o professor pode adiantar ou pedir mais tempo. A faixa nova é entregue na colação de grau. Veja tudo na seção{" "}
        <a href="#faixas" className="underline underline-offset-4 hover:text-azul">Troca de faixa</a>.
      </>
    ),
  },
  {
    p: "Quanto custa a mensalidade?",
    r: (
      <>
        {mensalidade.valor} {mensalidade.periodo}, o mesmo valor para crianças, adultos, mulheres e melhor idade. Veja o
        que está incluso na seção <a href="#planos" className="underline underline-offset-4 hover:text-azul">Mensalidade</a>.
      </>
    ),
  },
  {
    p: "Quanto custa a troca de faixa e o kimono?",
    r: (
      <>
        Esses preços o professor Bruno passa direto, pelo WhatsApp. Na seção{" "}
        <a href="#faixas" className="underline underline-offset-4 hover:text-azul">Troca de faixa</a>, toque em "Pedir o
        preço" na faixa. O kimono dá para perguntar junto com a{" "}
        <a href="#agendar" className="underline underline-offset-4 hover:text-azul">aula experimental</a>, no mesmo
        formulário. O WhatsApp abre com a mensagem pronta, é só enviar.
      </>
    ),
  },
  {
    p: "Onde fica a academia?",
    r: (
      <>
        {endereco.rua}, {endereco.bairro}, {endereco.cidade}.{" "}
        <a href={mapaRota} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:text-azul">
          Abrir rota no mapa
        </a>
        .
      </>
    ),
  },
];

export function Duvidas() {
  return (
    <section id="duvidas" className="claro bg-gelo py-16 text-black md:py-32">
      <div className="pagina grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
        <div>
          <h2 className="titulo">Dúvidas frequentes</h2>
          <p className="mt-6 max-w-[36ch] text-lg text-chumbo">Não achou sua pergunta? Fale com a gente.</p>
          <a
            href={linkWhatsApp("Olá, BR Team! Tenho uma dúvida.")}
            target="_blank"
            rel="noopener noreferrer"
            className="botao botao-contorno mt-8 text-black"
          >
            <WhatsAppIcon className="size-5" /> Perguntar no WhatsApp
          </a>
        </div>
        <div className="border-t border-black/15">
          {perguntas.map((q) => (
            <details key={q.p} className="group border-b border-black/15">
              <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-6 py-5 font-display text-2xl font-bold uppercase leading-tight [&::-webkit-details-marker]:hidden">
                {q.p}
                <Plus aria-hidden="true" className="size-6 shrink-0 text-ouro-escuro transition-transform duration-200 group-open:rotate-45" />
              </summary>
              <div className="max-w-[62ch] pb-6 text-lg text-chumbo">{q.r}</div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

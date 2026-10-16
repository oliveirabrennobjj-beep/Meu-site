import { useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from "react";
import { CheckCircle2, Pencil, Plus } from "lucide-react";
import { WhatsAppIcon } from "@/components/brand-icons";
import { contato, endereco, linkWhatsApp, mapaRota, mensalidade, trocaDeFaixa, turmaPorIdade } from "@/data/site";
import { cn } from "@/lib/utils";

type Campos = {
  nome: string;
  paraQuem: "mim" | "filho";
  nomeAluno: string;
  idade: string;
  experiencia: "nunca" | "ja";
  faixa: string;
  periodo: "Manhã" | "Tarde" | "Noite" | "Tanto faz";
};
type Erros = Partial<Record<keyof Campos, string>>;

const faixasTodas = [...trocaDeFaixa.infantil.faixas, ...trocaDeFaixa.adulto.faixas].map((f) => f.nome);

function validar(c: Campos): Erros {
  const e: Erros = {};
  if (c.nome.trim().length < 2) e.nome = "Escreva seu nome para a gente saber com quem fala.";
  if (c.paraQuem === "filho" && c.nomeAluno.trim().length < 2) e.nomeAluno = "Escreva o nome da criança.";
  const idade = Number(c.idade);
  if (!c.idade || !Number.isInteger(idade) || idade < 3 || idade > 99)
    e.idade = "Informe a idade em anos, de 3 a 99.";
  return e;
}

function montarMensagem(c: Campos) {
  const idade = Number(c.idade);
  const turma = turmaPorIdade(idade).turma;
  const linhas = [
    "Olá, BR Team! Quero agendar uma aula experimental.",
    "",
    `Nome: ${c.nome.trim()}`,
    c.paraQuem === "filho"
      ? `Aula para: meu filho(a) ${c.nomeAluno.trim()}, ${idade} anos (turma ${turma})`
      : `Aula para: mim, ${idade} anos (turma ${turma})`,
    c.experiencia === "nunca" ? "Experiência: nunca treinou" : `Experiência: já treinou, faixa ${c.faixa.toLowerCase()}`,
    `Melhor período: ${c.periodo}`,
  ];
  return linhas.join("\n");
}

export const estiloCampo =
  "mt-2 block h-12 w-full rounded-sm border border-black/25 bg-white px-4 text-base text-black outline-none transition-colors placeholder:text-black/40 focus:border-black focus:ring-2 focus:ring-black/15 aria-[invalid=true]:border-ponteira";

export function Opcoes<T extends string>({
  legenda, nome, valor, opcoes, onChange,
}: { legenda: string; nome: string; valor: T; opcoes: { v: T; rotulo: ReactNode }[]; onChange: (v: T) => void }) {
  return (
    <fieldset>
      <legend className="text-sm font-semibold">{legenda}</legend>
      <div className="mt-2 flex flex-wrap gap-2">
        {opcoes.map((o) => (
          <label
            key={o.v}
            className="inline-flex min-h-11 cursor-pointer items-center rounded-sm border border-black/25 px-4 text-[15px] transition-colors hover:border-black has-[:checked]:border-black has-[:checked]:bg-black has-[:checked]:text-white has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-black"
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
        <p id={`${id}-erro`} className="mt-1.5 text-sm font-medium text-ponteira-escura">
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
    nome: "", paraQuem: "mim", nomeAluno: "", idade: "", experiencia: "nunca", faixa: "Branca", periodo: "Noite",
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
    window.addEventListener("agendar:para", ouvir);
    return () => window.removeEventListener("agendar:para", ouvir);
  }, []);

  const erros = validar(c);
  const mostrarErro = (k: keyof Campos) => (tocado[k] ? erros[k] : undefined);
  const set = <K extends keyof Campos>(k: K, v: Campos[K]) => setC((o) => ({ ...o, [k]: v }));
  const idadeNum = Number(c.idade);
  const turma = c.idade && !erros.idade ? turmaPorIdade(idadeNum) : null;

  function enviar(e: FormEvent) {
    e.preventDefault();
    setTocado({ nome: true, nomeAluno: true, idade: true });
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
    <section id="agendar" className="bg-carbono py-24 md:py-32">
      <div className="pagina grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
        <div>
          <h2 className="titulo">Agende sua aula experimental</h2>
          <p className="mt-6 max-w-[42ch] text-lg text-cinza">
            Responda algumas perguntas rápidas. A gente monta a mensagem e abre o WhatsApp da academia para você enviar.
          </p>
          <ol className="mt-10 space-y-5">
            {[
              "Você responde o formulário.",
              "O WhatsApp abre com a mensagem pronta. É só enviar.",
              "O professor responde com o dia e o horário da sua aula.",
            ].map((passo, i) => (
              <li key={passo} className="flex items-start gap-4">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-grafite font-display text-lg font-bold">
                  {i + 1}
                </span>
                <span className="pt-1.5 text-white/85">{passo}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="claro bg-white p-6 text-black sm:p-10">
          {enviado ? (
            <div ref={sucessoRef} tabIndex={-1} className="outline-none" role="status">
              <CheckCircle2 className="size-10 text-[#1f8a4c]" aria-hidden="true" />
              <h3 className="mt-4 font-display text-3xl font-bold uppercase leading-none">Mensagem pronta no WhatsApp</h3>
              <p className="mt-3 text-chumbo">
                Confira e toque em enviar. O professor responde com o dia e o horário da aula.
              </p>
              <pre className="mt-6 whitespace-pre-wrap rounded-sm bg-algodao p-4 font-sans text-[15px] leading-relaxed">
                {montarMensagem(c)}
              </pre>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <a href={link} target="_blank" rel="noopener noreferrer" className="botao botao-primario">
                  <WhatsAppIcon className="size-5" /> Abrir o WhatsApp de novo
                </a>
                <button type="button" onClick={() => setEnviado(false)} className="botao botao-contorno">
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
                    id={id("idade")} name="idade" type="number" inputMode="numeric" min={3} max={99} value={c.idade}
                    onChange={(e) => set("idade", e.target.value)}
                    onBlur={() => setTocado((t) => ({ ...t, idade: true }))}
                    aria-invalid={!!mostrarErro("idade")}
                    aria-describedby={mostrarErro("idade") ? `${id("idade")}-erro` : `${id("idade")}-ajuda`}
                    className={cn(estiloCampo, "tabular-nums")}
                  />
                </Campo>
              </div>

              <p aria-live="polite" className={cn("border-l-2 pl-4 transition-colors", turma ? "border-ponteira" : "border-black/15")}>
                {turma ? (
                  <>
                    <span className="block font-display text-2xl font-bold uppercase leading-tight">Turma indicada: {turma.turma}</span>
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
                opcoes={[{ v: "nunca", rotulo: "Nunca treinei" }, { v: "ja", rotulo: "Já treinei" }]}
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

              <Opcoes
                legenda="Melhor período para treinar"
                nome="periodo"
                valor={c.periodo}
                onChange={(v) => set("periodo", v)}
                opcoes={(["Manhã", "Tarde", "Noite", "Tanto faz"] as const).map((v) => ({ v, rotulo: v }))}
              />

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
    p: "O que levar na aula experimental?",
    r: "Roupa confortável (camiseta e bermuda ou calça de malha, sem zíper nem botões), uma garrafa de água e chinelo. Sobre o kimono, o professor orienta depois da primeira aula.",
  },
  {
    p: "Jiu-Jitsu é seguro para criança?",
    r: "Sim. O Jiu-Jitsu trabalha técnica e estratégia, não força bruta, e o treino acontece em ambiente controlado, com o professor por perto. A criança aprende a se defender e, principalmente, a evitar o conflito.",
  },
  {
    p: "Como funciona a troca de faixa?",
    r: (
      <>
        O aluno recebe graus ao longo do tempo e, quando está pronto, a faixa nova é entregue na colação de grau, com a
        turma e a família. Os valores estão na seção <a href="#faixas" className="underline underline-offset-4 hover:text-white">Troca de faixa</a>.
      </>
    ),
  },
  {
    p: "Quanto custa a mensalidade?",
    r: (
      <>
        {mensalidade.valor} {mensalidade.periodo}, o mesmo valor para crianças, adultos, mulheres e melhor idade. Veja o
        que está incluso na seção <a href="#planos" className="underline underline-offset-4 hover:text-white">Mensalidade</a>.
      </>
    ),
  },
  {
    p: "Onde fica a academia?",
    r: (
      <>
        {endereco.rua}, {endereco.bairro}, {endereco.cidade}.{" "}
        <a href={mapaRota} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:text-white">
          Abrir rota no mapa
        </a>
        .
      </>
    ),
  },
];

export function Duvidas() {
  return (
    <section id="duvidas" className="bg-black py-24 md:py-32">
      <div className="pagina grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
        <div>
          <h2 className="titulo">Dúvidas frequentes</h2>
          <p className="mt-6 max-w-[36ch] text-lg text-cinza">Não achou sua pergunta? Fale com a gente.</p>
          <a
            href={linkWhatsApp("Olá, BR Team! Tenho uma dúvida.")}
            target="_blank"
            rel="noopener noreferrer"
            className="botao botao-contorno mt-8 text-white"
          >
            <WhatsAppIcon className="size-5" /> Perguntar no WhatsApp
          </a>
        </div>
        <div className="border-t border-grafite">
          {perguntas.map((q) => (
            <details key={q.p} className="group border-b border-grafite">
              <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-6 py-5 font-display text-2xl font-bold uppercase leading-tight [&::-webkit-details-marker]:hidden">
                {q.p}
                <Plus aria-hidden="true" className="size-6 shrink-0 text-ponteira transition-transform duration-200 group-open:rotate-45" />
              </summary>
              <div className="max-w-[62ch] pb-6 text-lg text-cinza">{q.r}</div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

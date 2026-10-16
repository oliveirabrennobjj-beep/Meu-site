import { useState, type ReactNode } from "react";
import { ArrowRight, Check } from "lucide-react";
import PricingSection from "@/components/ui/boxly-pricing-1";
import { Faixa } from "@/components/faixa";
import type { Faixa as FaixaDados } from "@/data/site";
import { WhatsAppIcon } from "@/components/brand-icons";
import { aulas, diasDeAula, fotos, graduacao, linkWhatsApp, mensalidade, planos, trocaDeFaixa } from "@/data/site";
import { cn } from "@/lib/utils";

const A_CONFIRMAR = "A confirmar";

function Pendente({ claro = false }: { claro?: boolean }) {
  return <span className={cn("italic", claro ? "text-chumbo" : "text-cinza")}>{A_CONFIRMAR}</span>;
}

const periodos = ["Manhã", "Tarde", "Noite"] as const;

export function Horarios() {
  return (
    <section id="horarios" className="bg-black py-24 md:py-32">
      <div className="pagina">
        <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-end">
          <h2 className="titulo">Horários das turmas</h2>
          <p className="max-w-[40ch] text-cinza md:text-right">
            Crianças às 18h e às 19h. Adultos às 6h, às 13h e às 20h.
            <br />
            Dias da semana: {diasDeAula ?? <Pendente />}
          </p>
        </div>

        <div className="mt-12 grid gap-px bg-grafite md:grid-cols-3">
          {periodos.map((periodo) => (
            <div key={periodo} className="bg-black p-6 md:p-8 md:first:pl-0">
              <h3 className="text-cinza">{periodo}</h3>
              <ul className="mt-4 space-y-6">
                {aulas
                  .filter((a) => a.periodo === periodo)
                  .map((a) => (
                    <li key={a.horario}>
                      <p className="font-display text-4xl font-bold tabular-nums leading-none">{a.horario}</p>
                      <p className="mt-2 flex items-center gap-2 text-lg">
                        <span
                          aria-hidden="true"
                          className={cn("size-2.5 rounded-full", a.turma === "Kids" ? "bg-[#f2c21b]" : "bg-ponteira")}
                        />
                        {a.nome}
                        <span className="text-cinza">· {a.turma === "Kids" ? "crianças" : "adolescentes e adultos"}</span>
                      </p>
                      <a
                        href="#agendar"
                        onClick={() => window.dispatchEvent(new CustomEvent("agendar:aula", { detail: a }))}
                        className="mt-2 inline-flex min-h-11 items-center gap-1 text-[15px] text-white/80 underline underline-offset-4 decoration-white/40 transition-colors hover:text-white hover:decoration-ponteira"
                      >
                        Agendar aula neste horário
                      </a>
                    </li>
                  ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* Mensalidade: o componente boxly-pricing-1 (components/ui) com os planos de src/data/site.ts */
export function Mensalidade() {
  return (
    <section aria-labelledby="planos-titulo">
      <PricingSection
        id="planos"
        className="min-h-0 pb-8"
        eyebrow="Mesmo valor para todos"
        title={<span id="planos-titulo">Mensalidade</span>}
        titleClassName="titulo"
        aside={
          <>
            <span className="text-white">{mensalidade.valor} {mensalidade.periodo}, para todo mundo.</span> Crianças,
            adultos, mulheres e melhor idade pagam o mesmo valor. Cada aluno treina na turma da sua idade.
          </>
        }
        includedLabel="O que está incluso"
        featuredIcon={Check}
        tiers={planos.map((p) => ({
          name: p.nome,
          description: p.para,
          featured: !!p.destaque,
          features: p.inclui,
          price: p.preco ?? A_CONFIRMAR,
          period: p.preco ? `/${p.periodo.replace("por ", "")}` : null,
          note: p.preco ? undefined : "Valor em atualização. Confirme pelo WhatsApp.",
          cta: "Quero me matricular",
          href: linkWhatsApp(`Olá, BR Team! Quero me matricular (${p.nome.toLowerCase()}), mensalidade de ${mensalidade.valor}.`),
        }))}
      />
    </section>
  );
}

const versoes = [
  { rotulo: "com branco", listra: "#ffffff" },
  { rotulo: "pura", listra: undefined },
  { rotulo: "com preto", listra: "#111111" },
];

function LinhaFaixa({ f, escuro = false }: { f: FaixaDados; escuro?: boolean }) {
  const legenda = escuro ? "text-cinza" : "text-chumbo";
  return (
    <li className={cn("grid gap-4 border-b py-6 md:grid-cols-[190px_1fr_150px] md:items-center md:gap-8", escuro ? "border-grafite" : "border-black/10")}>
      <div className="flex items-baseline justify-between gap-4 md:block">
        <div>
          <h4 className="font-display text-2xl font-bold uppercase leading-none">Faixa {f.nome.toLowerCase()}</h4>
          <p className={cn("mt-1 text-sm", legenda)}>{f.idade}</p>
        </div>
        <p className="font-display text-2xl font-bold tabular-nums md:hidden">
          {f.preco ?? <span className={cn("text-lg font-semibold italic", legenda)}>{A_CONFIRMAR}</span>}
        </p>
      </div>

      {f.variacoes ? (
        <ul className="grid grid-cols-3 gap-3" aria-label={`Versões da faixa ${f.nome.toLowerCase()}`}>
          {versoes.map((v) => (
            <li key={v.rotulo}>
              <Faixa cor={f.cor} ponteira={f.ponteira} listra={v.listra} clara={!escuro} altura={20} className="faixa-crescer" />
              <span className={cn("mt-1.5 block text-sm", legenda)}>
                {f.nome} {v.rotulo}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <Faixa cor={f.cor} ponteira={f.ponteira} clara={!escuro || f.nome === "Branca"} altura={20} className="faixa-crescer" />
      )}

      <p className="hidden text-right font-display text-3xl font-bold tabular-nums md:block">
        {f.preco ?? <span className={cn("text-xl font-semibold italic", legenda)}>{A_CONFIRMAR}</span>}
      </p>
    </li>
  );
}

function Ponto({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <div>
      <h4 className="font-display text-2xl font-bold uppercase leading-tight">{titulo}</h4>
      <div className="mt-2 text-chumbo">{children}</div>
    </div>
  );
}

/** Explicação da graduação, com abas Crianças / Adultos. */
function ComoGradua() {
  const [aba, setAba] = useState<"criancas" | "adultos">("criancas");
  const abas = [
    { id: "criancas", rotulo: "Crianças, de 4 a 15 anos" },
    { id: "adultos", rotulo: "Adultos, a partir de 16" },
  ] as const;
  return (
    <div className="mt-6 bg-white p-6 md:p-10" data-revelar>
      <h3 className="titulo-md">Como funciona a graduação</h3>
      <div
        role="tablist"
        aria-label="Graduação"
        className="mt-6 inline-flex flex-wrap gap-1 rounded-sm bg-algodao p-1"
        onKeyDown={(e) => {
          if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
            const nova = aba === "criancas" ? "adultos" : "criancas";
            setAba(nova);
            document.getElementById(`aba-${nova}`)?.focus();
          }
        }}
      >
        {abas.map((a) => (
          <button
            key={a.id}
            id={`aba-${a.id}`}
            type="button"
            role="tab"
            aria-selected={aba === a.id}
            aria-controls={`painel-${a.id}`}
            tabIndex={aba === a.id ? 0 : -1}
            onClick={() => setAba(a.id)}
            className={cn(
              "min-h-11 rounded-sm px-4 text-[15px] font-medium transition-colors active:scale-[0.97]",
              aba === a.id ? "bg-black text-white" : "text-chumbo hover:text-black",
            )}
          >
            {a.rotulo}
          </button>
        ))}
      </div>

      {aba === "criancas" ? (
        <div id="painel-criancas" role="tabpanel" aria-labelledby="aba-criancas" className="surge-rapido mt-8 grid gap-x-12 gap-y-9 md:grid-cols-2">
          <Ponto titulo="Cerca de 1 ano em cada faixa">
            Na BR Team, a criança costuma ficar mais ou menos um ano em cada faixa colorida, da branca até a verde. Não é
            regra fixa: cada criança tem o seu ritmo, e a federação (IBJJF) não exige tempo mínimo para as faixas
            infantis, só a idade mínima de cada cor.
          </Ponto>
          <Ponto titulo="Às vezes, pula uma etapa">
            <p>
              Se a criança evoluiu rápido ou já tem idade para uma cor mais alta, o professor pode pular uma versão da
              faixa. Por exemplo, sair da laranja direto para a verde e branca:
            </p>
            <div className="mt-4 grid grid-cols-[1fr_auto_1fr_auto_1fr] items-center gap-2 text-sm" aria-hidden="true">
              <div>
                <Faixa cor="#ec7a1c" ponteira="#111111" clara altura={16} />
                <span className="mt-1 block">Laranja</span>
              </div>
              <ArrowRight className="size-4" />
              <div className="opacity-35">
                <div className="relative">
                  <Faixa cor="#ec7a1c" ponteira="#111111" listra="#111111" clara altura={16} />
                  <span className="absolute inset-x-0 top-1/2 h-0.5 -rotate-6 bg-ponteira" />
                </div>
                <span className="mt-1 block line-through">Laranja e preta</span>
              </div>
              <ArrowRight className="size-4" />
              <div>
                <Faixa cor="#1f8a4c" ponteira="#111111" listra="#ffffff" clara altura={16} />
                <span className="mt-1 block font-semibold text-black">Verde e branca</span>
              </div>
            </div>
          </Ponto>
          <Ponto titulo="O que o professor observa">
            Técnica, comportamento dentro e fora do tatame, respeito aos colegas e frequência nos treinos. Também conta a
            idade mínima de cada cor: amarela a partir de 7 anos, laranja a partir de 10 e verde a partir de 13.
          </Ponto>
          <Ponto titulo="Aos 16 anos, faixas adultas">
            O sistema infantil vai até os 15 anos. A partir dos 16, o aluno passa para as faixas adultas (branca, azul,
            roxa, marrom e preta), e o professor indica a faixa certa pelo nível dele.
          </Ponto>
        </div>
      ) : (
        <div id="painel-adultos" role="tabpanel" aria-labelledby="aba-adultos" className="surge-rapido mt-8 grid gap-x-12 gap-y-9 md:grid-cols-2">
          <Ponto titulo="Frequência nos treinos">
            <p className="font-display text-5xl font-bold leading-none text-black">{graduacao.frequenciaMinima}</p>
            <p className="mt-2">
              das aulas do ano. Para trocar de faixa, principalmente para a azul, o aluno precisa treinar com constância:
              pelo menos {graduacao.frequenciaMinima} das aulas ao longo do ano.
            </p>
          </Ponto>
          <Ponto titulo="Tempo mínimo em cada faixa">
            <ul className="mt-1">
              {graduacao.tempoMinimoAdulto.map((t) => (
                <li key={t.faixa} className="grid grid-cols-[56px_1fr] items-center gap-3 border-b border-black/10 py-2.5">
                  <Faixa cor={t.cor} ponteira="#111111" clara altura={12} />
                  <span>
                    <span className="font-semibold text-black">{t.faixa}: {t.tempo}</span> <span className="text-sm">{t.obs}</span>
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-2 text-sm">Tempos mínimos da IBJJF para quem tem 16 anos ou mais.</p>
          </Ponto>
          <Ponto titulo="Os graus">
            Cada faixa tem até 4 graus, as listras brancas na ponteira. O professor dá cada grau conforme a evolução do
            aluno, e eles mostram o caminho até a próxima faixa.
          </Ponto>
          <Ponto titulo="Pode vir antes?">
            Pode. O tempo é o mínimo, não um prazo fixo, e quem define o momento é o professor. Se ele achar que o aluno
            merece pela técnica, pela dedicação e pelo comportamento, pode adiantar os graus e a troca de faixa. Para quem
            compete em campeonatos da IBJJF, valem os tempos mínimos da federação.
          </Ponto>
        </div>
      )}
      <p className="mt-10 border-t border-black/10 pt-5 text-sm text-chumbo">
        Referência: Sistema Geral de Graduação da IBJJF. Na BR Team, a palavra final sobre graus e faixas é sempre do
        professor.
      </p>
    </div>
  );
}

export function TrocaDeFaixa() {
  const { infantil, adulto } = trocaDeFaixa;
  return (
    <section id="faixas" className="claro bg-algodao py-24 text-black md:py-32">
      <div className="pagina">
        <div className="grid gap-8 lg:grid-cols-[1fr_1fr] lg:items-end">
          <h2 className="titulo">Troca de faixa</h2>
          <p className="max-w-[48ch] text-lg text-chumbo">
            Tabela de preços da troca de faixa, da branca até a preta. Cada faixa nova é entregue na colação de grau,
            com a turma e a família no tatame.
          </p>
        </div>

        <article className="mt-14 bg-white p-6 md:p-10" aria-labelledby="faixas-infantis-titulo">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h3 id="faixas-infantis-titulo" className="titulo-md">{infantil.titulo}</h3>
              <p className="mt-3 max-w-[60ch] text-chumbo">{infantil.descricao}</p>
            </div>
            <p className="hidden text-sm text-chumbo md:block">Valor da troca</p>
          </div>
          <ul className="mt-6 border-t border-black/10">
            {infantil.faixas.map((f) => (
              <LinhaFaixa key={f.nome} f={f} />
            ))}
          </ul>
        </article>

        <article id="faixas-adultas" className="mt-6 bg-black p-6 text-white md:p-10" aria-labelledby="faixas-adultas-titulo">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h3 id="faixas-adultas-titulo" className="titulo-md">{adulto.titulo}</h3>
              <p className="mt-3 max-w-[60ch] text-cinza">{adulto.descricao}</p>
            </div>
            <p className="hidden text-sm text-cinza md:block">Valor da troca</p>
          </div>
          <ul className="mt-6 border-t border-grafite">
            {adulto.faixas.map((f) => (
              <LinhaFaixa key={f.nome} f={f} escuro />
            ))}
          </ul>
          <a
            href={linkWhatsApp("Olá, BR Team! Quero saber sobre a troca de faixa.")}
            target="_blank"
            rel="noopener noreferrer"
            className="botao botao-primario mt-8 w-full sm:w-auto"
          >
            <WhatsAppIcon className="size-5" /> Tirar dúvidas sobre a troca
          </a>
        </article>

        <ComoGradua />

        <figure className="mt-6 grid grid-cols-2 gap-6">
          {[fotos.galeria[1], fotos.galeria[4]].map((f) => (
            <img key={f.src} src={f.src} alt={f.alt} width={f.w} height={f.h} loading="lazy" className="aspect-[4/3] w-full object-cover object-[50%_60%]" />
          ))}
          <figcaption className="col-span-2 text-sm text-chumbo">Colação de grau e troca de faixa das turmas infantis.</figcaption>
        </figure>
      </div>
    </section>
  );
}

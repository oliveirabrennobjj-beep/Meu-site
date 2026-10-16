import { Check } from "lucide-react";
import PricingSection from "@/components/ui/boxly-pricing-1";
import { Faixa } from "@/components/faixa";
import { WhatsAppIcon } from "@/components/brand-icons";
import { fotos, horarios, linkWhatsApp, mensalidade, planos, trocaDeFaixa } from "@/data/site";
import { cn } from "@/lib/utils";

const A_CONFIRMAR = "A confirmar";

function Pendente({ claro = false }: { claro?: boolean }) {
  return <span className={cn("italic", claro ? "text-chumbo" : "text-cinza")}>{A_CONFIRMAR}</span>;
}

export function Horarios() {
  const algumPendente = horarios.some((h) => !h.dias || !h.horario);
  return (
    <section id="horarios" className="bg-black py-24 md:py-32">
      <div className="pagina">
        <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-end">
          <h2 className="titulo">Horários das turmas</h2>
          {algumPendente && (
            <p className="max-w-[38ch] text-cinza md:text-right">
              Estamos atualizando a grade de horários. Enquanto isso, confirme pelo WhatsApp.
            </p>
          )}
        </div>

        <div className="mt-12 overflow-x-auto">
          <table className="w-full min-w-[520px] border-collapse text-left">
            <caption className="sr-only">Turmas, público, dias e horários</caption>
            <thead>
              <tr className="border-b border-white/40 text-sm text-cinza">
                <th scope="col" className="py-3 pr-4 font-medium">Turma</th>
                <th scope="col" className="py-3 pr-4 font-medium">Para quem</th>
                <th scope="col" className="py-3 pr-4 font-medium">Dias</th>
                <th scope="col" className="py-3 font-medium">Horário</th>
              </tr>
            </thead>
            <tbody>
              {horarios.map((h) => (
                <tr key={h.turma} className="border-b border-grafite">
                  <th scope="row" className="py-5 pr-4 font-display text-2xl font-bold uppercase">{h.turma}</th>
                  <td className="py-5 pr-4 text-white/85">{h.publico}</td>
                  <td className="py-5 pr-4">{h.dias ?? <Pendente />}</td>
                  <td className="py-5 tabular-nums">{h.horario ?? <Pendente />}</td>
                </tr>
              ))}
            </tbody>
          </table>
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

export function TrocaDeFaixa() {
  const { infantil, adulto } = trocaDeFaixa;
  return (
    <section id="faixas" className="claro bg-algodao py-24 text-black md:py-32">
      <div className="pagina">
        <div className="grid gap-8 lg:grid-cols-[1fr_1fr] lg:items-end">
          <h2 className="titulo">Troca de faixa</h2>
          <p className="max-w-[48ch] text-lg text-chumbo">
            Cada faixa nova é entregue na colação de grau, com a turma e a família no tatame. Estes são os valores da
            troca de faixa em cada graduação.
          </p>
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-[1fr_1.15fr]">
          {/* infantis: um valor para todas */}
          <article className="flex flex-col bg-white p-7 md:p-10">
            <h3 className="titulo-md">{infantil.titulo}</h3>
            <p className="mt-3 text-chumbo">{infantil.descricao}</p>
            <ul className="mt-8 space-y-4">
              {infantil.faixas.map((f) => (
                <li key={f.nome} className="grid grid-cols-[1fr_90px] items-center gap-4">
                  <Faixa cor={f.cor} ponteira={f.ponteira} clara altura={26} />
                  <span className="font-medium">{f.nome}</span>
                </li>
              ))}
            </ul>
            <div className="mt-auto pt-10">
              <div className="flex items-end justify-between gap-4 border-t border-black/10 pt-6">
                <span className="text-chumbo">Valor por troca de faixa</span>
                <span className="font-display text-4xl font-bold tabular-nums leading-none">
                  {infantil.preco ?? <span className="text-2xl">{A_CONFIRMAR}</span>}
                </span>
              </div>
            </div>
          </article>

          {/* adultas: um valor por faixa */}
          <article id="faixas-adultas" className="bg-black p-7 text-white md:p-10">
            <h3 className="titulo-md">{adulto.titulo}</h3>
            <p className="mt-3 text-cinza">{adulto.descricao}</p>
            <ul className="mt-8">
              {adulto.faixas.map((f) => (
                <li key={f.nome} className="border-b border-grafite py-5 first:pt-0">
                  <div className="flex items-baseline justify-between gap-4">
                    <span className="font-display text-2xl font-bold uppercase">Faixa {f.nome.toLowerCase()}</span>
                    <span className="font-display text-3xl font-bold tabular-nums">
                      {f.preco ?? <span className="text-xl font-semibold italic text-cinza">{A_CONFIRMAR}</span>}
                    </span>
                  </div>
                  <Faixa cor={f.cor} ponteira={f.ponteira} altura={18} className="mt-3" />
                </li>
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
        </div>

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

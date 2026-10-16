import { Check } from "lucide-react";
import { Faixa } from "@/components/faixa";
import { WhatsAppIcon } from "@/components/brand-icons";
import { fotos, horarios, linkWhatsApp, planos, trocaDeFaixa } from "@/data/site";
import { cn } from "@/lib/utils";

const A_CONFIRMAR = "A confirmar";

function Pendente({ claro = false }: { claro?: boolean }) {
  return <span className={cn("italic", claro ? "text-chumbo" : "text-cinza")}>{A_CONFIRMAR}</span>;
}

export function Horarios() {
  const algumPendente = horarios.some((h) => !h.dias || !h.horario) || planos.some((p) => !p.preco);
  return (
    <section id="horarios" className="bg-black py-24 md:py-32">
      <div className="pagina">
        <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-end">
          <h2 className="titulo">Horários das turmas</h2>
          {algumPendente && (
            <p className="max-w-[38ch] text-cinza md:text-right">
              Estamos atualizando a grade e os valores. Enquanto isso, confirme pelo WhatsApp.
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

      <div id="planos" className="pagina mt-24 md:mt-32">
        <h2 className="titulo">Mensalidade</h2>
        <p className="mt-5 max-w-[50ch] text-lg text-cinza">
          A primeira aula é para conhecer o tatame, o professor e a turma. Depois é só escolher o plano.
        </p>
        <div className="mt-12 grid gap-px bg-grafite md:grid-cols-3">
          {planos.map((p) => (
            <article key={p.nome} className={cn("flex flex-col p-8", p.destaque ? "bg-white text-black" : "bg-carbono")}>
              <h3 className="font-display text-4xl font-bold uppercase leading-none">{p.nome}</h3>
              <p className={cn("mt-2", p.destaque ? "text-chumbo" : "text-cinza")}>{p.para}</p>
              <p className="mt-8 font-display text-5xl font-bold tabular-nums leading-none">
                {p.preco ?? <span className="text-3xl">{A_CONFIRMAR}</span>}
              </p>
              <p className={cn("mt-1 text-sm", p.destaque ? "text-chumbo" : "text-cinza")}>{p.periodo}</p>
              <ul className="mt-8 flex-1 space-y-3">
                {p.inclui.map((i) => (
                  <li key={i} className="flex gap-3">
                    <Check className="mt-1 size-4 shrink-0 text-ponteira" aria-hidden="true" />
                    <span>{i}</span>
                  </li>
                ))}
              </ul>
              <a
                href={linkWhatsApp(`Olá, BR Team! Quero saber mais sobre o plano ${p.nome}.`)}
                target="_blank"
                rel="noopener noreferrer"
                className={cn("botao mt-8", p.destaque ? "botao-primario" : "botao-contorno")}
              >
                Quero o plano {p.nome}
              </a>
            </article>
          ))}
        </div>
      </div>
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

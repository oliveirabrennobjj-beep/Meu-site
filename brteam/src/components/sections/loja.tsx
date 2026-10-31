import { CalendarCheck } from "lucide-react";
import { WhatsAppIcon } from "@/components/brand-icons";
import { fotos, linkWhatsApp, loja, mensagemPreco } from "@/data/site";

/*
  Kimono: o preço não fica no site. Quem vai marcar a aula experimental pergunta o preço do kimono no mesmo
  formulário (seção Agendar), e vai tudo numa mensagem só para o professor Bruno. Quem já é aluno pede o preço
  direto, com a mensagem pronta no WhatsApp.
*/
export function Loja() {
  // se um dia o preço for preenchido em `loja` (src/data/site.ts), ele aparece aqui
  const precos = Object.values(loja.produtos).flatMap((p) => (p.preco ? [`${p.nome}: ${p.preco}`] : []));
  return (
    <section id="loja" className="claro bg-white py-16 text-black md:py-32">
      <div className="pagina grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:gap-20">
        <div>
          <h2 className="titulo">Loja BR Team</h2>
          <p className="mt-6 max-w-[42ch] text-lg text-chumbo">
            O kimono é encomendado direto com o professor Bruno. Ele passa o preço pelo WhatsApp, vê o tamanho certo com
            o aluno e faz a encomenda.
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

        <div className="bg-gelo p-6 ring-1 ring-marinho/10 sm:p-10">
          <h3 className="font-display text-3xl font-bold uppercase leading-none">Kimono infantil e adulto</h3>
          <p className="mt-3 text-chumbo">
            {loja.cores.join(" ou ").toLowerCase().replace(/^./, (l) => l.toUpperCase())}.{" "}
            {precos.length
              ? `${precos.join(" · ")}. Prazo com o professor Bruno, pelo WhatsApp.`
              : "Preço e prazo com o professor Bruno, pelo WhatsApp."}
          </p>

          <div className="mt-8 border-t border-marinho/15 pt-6">
            <p className="font-semibold">Vai marcar a aula experimental?</p>
            <p className="mt-1 text-chumbo">
              Pergunte o preço do kimono no mesmo formulário: vai tudo numa mensagem só, com o nome, a idade e a turma do aluno.
            </p>
            <a
              href="#agendar"
              onClick={() => window.dispatchEvent(new CustomEvent("agendar:kimono"))}
              className="botao botao-primario mt-4 w-full sm:w-auto"
            >
              <CalendarCheck className="size-5" aria-hidden="true" /> Pedir junto com a aula
            </a>
          </div>

          <div className="mt-8 border-t border-marinho/15 pt-6">
            <p className="font-semibold">Já é aluno?</p>
            <p className="mt-1 text-chumbo">Peça o preço direto ao professor Bruno.</p>
            <a
              href={linkWhatsApp(mensagemPreco.kimonoAluno)}
              target="_blank"
              rel="noopener noreferrer"
              className="botao botao-contorno mt-4 w-full sm:w-auto"
            >
              <WhatsAppIcon className="size-5" /> Pedir o preço do kimono
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

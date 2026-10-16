import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Expand, MapPin, Navigation, X } from "lucide-react";
import { InstagramIcon, WhatsAppIcon } from "@/components/brand-icons";
import { Faixa } from "@/components/faixa";
import { academia, contato, endereco, fotos, instagram, linkWhatsApp, mapaEmbed, mapaRota, parceiros } from "@/data/site";

function GaleriaAmpliada({ indice, onFechar, onTrocar }: { indice: number | null; onFechar: () => void; onTrocar: (i: number) => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const total = fotos.galeria.length;
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (indice !== null && !d.open) d.showModal();
    if (indice === null && d.open) d.close();
  }, [indice]);
  const f = indice !== null ? fotos.galeria[indice] : null;
  const ir = (passo: number) => indice !== null && onTrocar((indice + passo + total) % total);
  return (
    <dialog
      ref={ref}
      aria-label="Foto ampliada"
      onClose={onFechar}
      onClick={(e) => e.target === ref.current && onFechar()}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") ir(1);
        if (e.key === "ArrowLeft") ir(-1);
      }}
      className="galeria-ampliada m-auto max-h-[92vh] max-w-[min(92vw,720px)] bg-transparent p-0 text-white"
    >
      {f && (
        <figure className="flex flex-col items-center">
          <img key={f.src} src={f.src} alt={f.alt} className="surge-rapido max-h-[74vh] w-auto object-contain" />
          <figcaption className="mt-4 flex w-full items-center justify-between gap-4">
            <span>
              {f.legenda} <span className="text-cinza">· {indice! + 1} de {total}</span>
            </span>
            <span className="flex gap-2">
              <button type="button" onClick={() => ir(-1)} className="inline-flex size-11 items-center justify-center rounded-full border border-grafite transition hover:border-white active:scale-90">
                <ChevronLeft className="size-5" aria-hidden="true" /><span className="sr-only">Foto anterior</span>
              </button>
              <button type="button" onClick={() => ir(1)} className="inline-flex size-11 items-center justify-center rounded-full border border-grafite transition hover:border-white active:scale-90">
                <ChevronRight className="size-5" aria-hidden="true" /><span className="sr-only">Próxima foto</span>
              </button>
              <button type="button" onClick={onFechar} autoFocus className="inline-flex size-11 items-center justify-center rounded-full bg-white text-black transition active:scale-90">
                <X className="size-5" aria-hidden="true" /><span className="sr-only">Fechar</span>
              </button>
            </span>
          </figcaption>
        </figure>
      )}
    </dialog>
  );
}

export function Galeria() {
  const [aberta, setAberta] = useState<number | null>(null);
  return (
    <section id="galeria" className="bg-black py-24 md:py-32">
      <div className="pagina">
        <h2 className="titulo">No tatame e no pódio</h2>
        <p className="mt-5 max-w-[48ch] text-lg text-cinza">
          Colações de grau, campeonatos e o dia a dia das turmas. Tem mais no nosso Instagram.
        </p>
        <div className="mt-12 columns-2 gap-3 md:columns-3 lg:columns-4 [&>figure]:mb-3">
          {fotos.galeria.map((f, i) => (
            <figure key={f.src} className="break-inside-avoid">
              <button
                type="button"
                onClick={() => setAberta(i)}
                className="group relative block w-full overflow-hidden"
              >
                <img
                  src={f.src} alt={f.alt} width={f.w} height={f.h} loading="lazy"
                  className="w-full transition duration-700 ease-[var(--ease-saida)] group-hover:scale-[1.06] group-hover:brightness-75"
                />
                <span className="absolute right-3 top-3 inline-flex size-10 items-center justify-center rounded-full bg-black/70 opacity-0 transition duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
                  <Expand className="size-4" aria-hidden="true" />
                </span>
                <span className="sr-only">Ampliar foto: {f.legenda}</span>
              </button>
              <figcaption className="mt-2 text-sm text-cinza">{f.legenda}</figcaption>
            </figure>
          ))}
        </div>
        <a
          href={instagram(contato.instagramAcademia)}
          target="_blank"
          rel="noopener noreferrer"
          className="botao botao-contorno mt-10 text-white"
        >
          <InstagramIcon className="size-5" /> Ver mais no @{contato.instagramAcademia}
        </a>
      </div>
      <GaleriaAmpliada indice={aberta} onFechar={() => setAberta(null)} onTrocar={setAberta} />
    </section>
  );
}

export function Parceiros() {
  return (
    <section aria-labelledby="parceiros-titulo" className="border-y border-grafite bg-carbono py-14">
      <div className="pagina grid gap-8 md:grid-cols-[220px_1fr] md:items-center">
        <h2 id="parceiros-titulo" className="titulo-md text-cinza">Nossos parceiros</h2>
        <ul className="grid grid-cols-2 gap-x-8 gap-y-5 sm:grid-cols-3 lg:grid-cols-5">
          {parceiros.map((p) => (
            <li key={p.nome}>
              <p className="font-display text-xl font-bold uppercase leading-tight">{p.nome}</p>
              <p className="text-sm text-cinza">{p.ramo}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function Contato() {
  return (
    <section id="contato" className="bg-black py-24 md:py-32">
      <div className="pagina grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
        <div>
          <h2 className="titulo">Comece sua jornada</h2>
          <p className="mt-6 max-w-[40ch] text-lg text-cinza">
            Toda jornada começa com o primeiro passo. Mande uma mensagem e agende sua aula experimental.
          </p>

          <dl className="mt-10 space-y-6">
            <div>
              <dt className="text-sm text-cinza">WhatsApp</dt>
              <dd className="mt-1 font-display text-3xl font-bold tabular-nums">{contato.whatsappExibicao}</dd>
            </div>
            <div>
              <dt className="text-sm text-cinza">Endereço</dt>
              <dd className="mt-1 flex gap-2 text-lg">
                <MapPin className="mt-1 size-5 shrink-0 text-ponteira" aria-hidden="true" />
                <span>
                  {endereco.rua}, {endereco.bairro}
                  <br />
                  {endereco.cidade}, {endereco.cep}
                </span>
              </dd>
            </div>
            <div>
              <dt className="text-sm text-cinza">E-mail</dt>
              <dd className="mt-1 text-lg">
                <a href={`mailto:${contato.email}`} className="link-corre break-all">{contato.email}</a>
              </dd>
            </div>
            <div>
              <dt className="text-sm text-cinza">Pagamento e estacionamento</dt>
              <dd className="mt-1 text-lg">Aceitamos Pix. Tem estacionamento e vaga na rua.</dd>
            </div>
          </dl>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <a href={linkWhatsApp()} target="_blank" rel="noopener noreferrer" className="botao botao-primario">
              <WhatsAppIcon className="size-5" /> Agendar pelo WhatsApp
            </a>
            <a href={mapaRota} target="_blank" rel="noopener noreferrer" className="botao botao-contorno text-white">
              <Navigation className="size-5" aria-hidden="true" /> Como chegar
            </a>
          </div>
          <a
            href={instagram(contato.instagramAcademia)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex min-h-11 items-center gap-2 text-white/85 underline-offset-4 hover:text-white hover:underline"
          >
            <InstagramIcon className="size-5" /> @{contato.instagramAcademia}
          </a>
        </div>

        <div className="min-h-[360px] overflow-hidden border border-grafite bg-carbono">
          <iframe
            title={`Mapa: ${endereco.rua}, ${endereco.cidade}`}
            src={mapaEmbed}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="size-full min-h-[360px] border-0 grayscale invert-[0.9] hue-rotate-180"
          />
        </div>
      </div>
    </section>
  );
}

export function Rodape() {
  return (
    <footer className="bg-black pb-24 pt-4 sm:pb-12">
      <Faixa graus={1} altura={14} />
      <div className="pagina mt-12 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
        <div>
          <img src="./marca-br-team.png" alt="BR Team Brazilian Jiu-Jitsu" width={240} height={100} className="h-auto w-[200px]" />
          <p className="mt-4 text-cinza">
            {academia.lema} {academia.pilares.join(", ").replace(/, ([^,]*)$/, " e $1")}. Oss.
          </p>
        </div>
        <div className="flex flex-col gap-1 text-sm text-cinza md:items-end">
          <a href={contato.linktree} target="_blank" rel="noopener noreferrer" className="hover:text-white">linktr.ee/brteamjiu</a>
          <span>© {new Date().getFullYear()} {academia.nomeCompleto}</span>
        </div>
      </div>
    </footer>
  );
}

export function WhatsAppFlutuante() {
  // balão "Dúvidas?" aparece uma vez, depois de um tempo na página
  const [balao, setBalao] = useState(false);
  useEffect(() => {
    const abre = setTimeout(() => setBalao(true), 9000);
    const fecha = setTimeout(() => setBalao(false), 17000);
    return () => {
      clearTimeout(abre);
      clearTimeout(fecha);
    };
  }, []);
  return (
    <div className="fixed bottom-5 right-5 z-30 flex items-center gap-3 sm:hidden">
      {balao && (
        <span className="surge-rapido relative rounded-full bg-white px-4 py-2 text-[15px] font-medium text-black shadow-xl">
          Dúvidas? Fale com a gente
          <button type="button" onClick={() => setBalao(false)} className="-mr-2 ml-1 inline-flex size-7 items-center justify-center align-middle text-chumbo">
            <X className="size-4" aria-hidden="true" /><span className="sr-only">Fechar aviso</span>
          </button>
        </span>
      )}
      <a
        href={linkWhatsApp()}
        target="_blank"
        rel="noopener noreferrer"
        className="pulso relative inline-flex size-14 items-center justify-center rounded-full bg-whatsapp text-black shadow-[0_10px_30px_rgb(0_0_0/0.5)] transition-transform hover:scale-110 active:scale-95"
      >
        <WhatsAppIcon className="size-7" />
        <span className="sr-only">Falar com a BR Team no WhatsApp</span>
      </a>
    </div>
  );
}

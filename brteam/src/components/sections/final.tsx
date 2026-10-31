import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Expand, Info, MapPin, Navigation, Phone, X } from "lucide-react";
import { InstagramIcon, WhatsAppIcon } from "@/components/brand-icons";
import { cn } from "@/lib/utils";
import { Faixa } from "@/components/faixa";
import { academia, contato, diasDeAula, endereco, fotos, instagram, linkWhatsApp, mapaBusca, mapaEmbed, mapaRota, parceiros, resumoHorarios } from "@/data/site";

function GaleriaAmpliada({ indice, onFechar, onTrocar }: { indice: number | null; onFechar: () => void; onTrocar: (i: number) => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const fecharRef = useRef<HTMLButtonElement>(null);
  const total = fotos.galeria.length;
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (indice !== null && !d.open) {
      d.showModal();
      fecharRef.current?.focus(); // o showModal() poria o foco em "Foto anterior"
    }
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
              <button type="button" ref={fecharRef} onClick={onFechar} className="inline-flex size-11 items-center justify-center rounded-full bg-white text-black transition active:scale-90">
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
    <section id="galeria" className="claro bg-gelo py-16 text-black md:py-32">
      <div className="pagina">
        <h2 className="titulo">No tatame e no pódio</h2>
        <p className="mt-5 max-w-[48ch] text-lg text-chumbo">
          Colações de grau, campeonatos e o dia a dia das turmas. Tem mais no nosso Instagram.
        </p>
        <div className="mt-12 columns-2 gap-3 md:columns-3 lg:columns-4 [&>figure]:mb-3">
          {fotos.galeria.map((f, i) => (
            <figure key={f.src} className="break-inside-avoid max-md:nth-[n+9]:hidden">
              <button
                type="button"
                onClick={() => setAberta(i)}
                className="group relative block w-full overflow-hidden"
              >
                <img
                  src={f.src} alt={f.alt} width={f.w} height={f.h} loading="lazy"
                  className="w-full transition duration-700 ease-[var(--ease-saida)] group-hover:scale-[1.06] group-hover:brightness-75"
                />
                <span className="absolute right-3 top-3 inline-flex size-10 items-center justify-center rounded-full bg-black/75 text-white opacity-0 transition duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
                  <Expand className="size-4" aria-hidden="true" />
                </span>
                <span className="sr-only">Ampliar foto: {f.legenda}</span>
              </button>
              <figcaption className="mt-2 text-sm text-chumbo">{f.legenda}</figcaption>
            </figure>
          ))}
        </div>
        <a
          href={instagram(contato.instagramAcademia)}
          target="_blank"
          rel="noopener noreferrer"
          className="botao botao-contorno mt-10 text-black"
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
    <section aria-labelledby="parceiros-titulo" className="claro border-y border-black/10 bg-white py-14 text-black">
      <div className="pagina grid gap-8 md:grid-cols-[220px_1fr] md:items-center">
        <h2 id="parceiros-titulo" className="titulo-md text-ouro-escuro">Nossos parceiros</h2>
        <ul className="grid grid-cols-2 gap-x-8 gap-y-5 sm:grid-cols-3 lg:grid-cols-5">
          {parceiros.map((p) => (
            <li key={p.nome}>
              <p className="font-display text-xl font-bold uppercase leading-tight">{p.nome}</p>
              <p className="text-sm text-chumbo">{p.ramo}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/*
  Mapa do Google com o pino na academia (coordenadas em src/data/site.ts → coordenadas).
  A academia ainda não tem cadastro no Google: no local pode aparecer o nome de outra loja. O aviso embaixo do botão explica.
*/
function CartaoMapa() {
  return (
    <div className="flex flex-col overflow-hidden bg-white ring-1 ring-marinho/10 shadow-[0_24px_60px_-32px_rgb(13_35_72/0.45)]">
      <iframe
        title={`Mapa: ${endereco.rua}, ${endereco.cidade}`}
        src={mapaEmbed}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="aspect-[4/3] w-full border-0 bg-gelo lg:aspect-auto lg:min-h-[380px] lg:flex-1"
      />
      <div className="p-6 md:p-8">
        <p className="font-display text-2xl font-bold uppercase leading-tight">BR Team Jiu-Jitsu</p>
        <p className="mt-1 text-chumbo">
          {endereco.rua}, {endereco.bairro}, {endereco.cidade}
        </p>
        <a href={mapaBusca} target="_blank" rel="noopener noreferrer" className="botao botao-primario mt-6 w-full sm:w-auto">
          <MapPin className="size-5" aria-hidden="true" /> Abrir no Google Maps
        </a>
        <p className="mt-5 flex gap-3 border border-ouro/50 bg-gelo p-4 text-[15px] text-black/85">
          <Info className="mt-0.5 size-5 shrink-0 text-ouro-escuro" aria-hidden="true" />
          <span>
            <strong className="font-semibold text-black">Atenção:</strong> o professor ainda não cadastrou a BR Team no Google Maps.
            Por isso, ao abrir o mapa, pode aparecer o nome de outra loja no lugar. O endereço está certo: a academia
            fica na {endereco.rua}.
          </span>
        </p>
      </div>
    </div>
  );
}

export function Contato() {
  return (
    <section id="contato" className="claro bg-gelo py-16 text-black md:py-32">
      <div className="pagina grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
        <div>
          <h2 className="titulo">Comece sua jornada</h2>
          <p className="mt-6 max-w-[40ch] text-lg text-chumbo">
            Toda jornada começa com o primeiro passo. Mande uma mensagem e agende sua aula experimental de cortesia.
          </p>

          <dl className="mt-10 space-y-6">
            <div>
              <dt className="text-sm text-chumbo">WhatsApp</dt>
              <dd className="mt-1 font-display text-3xl font-bold tabular-nums">{contato.whatsappExibicao}</dd>
            </div>
            <div>
              <dt className="text-sm text-chumbo">Endereço</dt>
              <dd className="mt-1 flex gap-2 text-lg">
                <MapPin className="mt-1 size-5 shrink-0 text-azul" aria-hidden="true" />
                <span>
                  {endereco.rua}, {endereco.bairro}
                  <br />
                  {endereco.cidade}, {endereco.cep}
                </span>
              </dd>
            </div>
            <div>
              <dt className="text-sm text-chumbo">E-mail</dt>
              <dd className="mt-1 text-lg">
                <a href={`mailto:${contato.email}`} className="link-corre inline-flex min-h-11 items-center break-all">{contato.email}</a>
              </dd>
            </div>
            <div>
              <dt className="text-sm text-chumbo">Pagamento e bicicleta</dt>
              <dd className="mt-1 text-lg">Aceitamos Pix. Tem lugar para deixar a bicicleta.</dd>
            </div>
          </dl>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <a href={linkWhatsApp()} target="_blank" rel="noopener noreferrer" className="botao botao-primario">
              <WhatsAppIcon className="size-5" /> Agendar pelo WhatsApp
            </a>
            <a href={mapaRota} target="_blank" rel="noopener noreferrer" className="botao botao-contorno text-black">
              <Navigation className="size-5" aria-hidden="true" /> Como chegar
            </a>
          </div>
          <a
            href={instagram(contato.instagramAcademia)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex min-h-11 items-center gap-2 text-chumbo underline-offset-4 hover:text-black hover:underline"
          >
            <InstagramIcon className="size-5" /> @{contato.instagramAcademia}
          </a>
        </div>

        <CartaoMapa />
      </div>
    </section>
  );
}

export function Rodape() {
  const titulo = "font-display text-lg font-bold uppercase tracking-wide text-ouro";
  const link = "inline-flex min-h-11 items-center gap-2 hover:text-white";
  return (
    <footer className="border-t border-white/10 bg-black pb-24 pt-4 text-cinza sm:pb-12">
      <Faixa preta graus={1} altura={14} />
      <div className="pagina mt-12 grid gap-10 md:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1fr]">
        <div>
          <img src="./marca-br-team.png" alt="BR Team Brazilian Jiu-Jitsu" width={240} height={100} className="h-auto w-[200px]" />
          <p className="mt-4">
            {academia.lema} {academia.pilares.join(", ").replace(/, ([^,]*)$/, " e $1")}. Oss.
          </p>
        </div>
        <div>
          <h2 className={titulo}>Aulas</h2>
          <p className="mt-3 font-semibold text-white">{diasDeAula}</p>
          <p className="mt-1">{resumoHorarios}</p>
          <a href="#horarios" className="mt-1 inline-flex min-h-11 items-center underline underline-offset-4 hover:text-white">Ver os horários</a>
        </div>
        <div>
          <h2 className={titulo}>Endereço</h2>
          <address className="mt-3 not-italic">
            {endereco.rua}, {endereco.bairro}
            <br />
            {endereco.cidade}, <span className="whitespace-nowrap">{endereco.cep}</span>
          </address>
          <a href={mapaRota} target="_blank" rel="noopener noreferrer" className={link}>
            <Navigation className="size-4" aria-hidden="true" /> Como chegar
          </a>
        </div>
        <div>
          <h2 className={titulo}>Contato</h2>
          <ul className="mt-2">
            <li>
              <a href={linkWhatsApp()} target="_blank" rel="noopener noreferrer" className={link}>
                <WhatsAppIcon className="size-4" /> {contato.whatsappExibicao}
              </a>
            </li>
            <li>
              <a href={`tel:+${contato.whatsapp}`} className={link}>
                <Phone className="size-4" aria-hidden="true" /> Ligar
              </a>
            </li>
            <li>
              <a href={instagram(contato.instagramAcademia)} target="_blank" rel="noopener noreferrer" className={link}>
                <InstagramIcon className="size-4" /> @{contato.instagramAcademia}
              </a>
            </li>
            <li>
              <a href={contato.linktree} target="_blank" rel="noopener noreferrer" className={link}>linktr.ee/brteamjiu</a>
            </li>
          </ul>
        </div>
      </div>
      <p className="pagina mt-10 border-t border-white/10 pt-6 text-sm">© {new Date().getFullYear()} {academia.nomeCompleto}</p>
    </footer>
  );
}

export function WhatsAppFlutuante() {
  // balão "Dúvidas?" aparece uma vez, depois de um tempo na página
  const [balao, setBalao] = useState(false);
  const linkRef = useRef<HTMLAnchorElement>(null);
  // some enquanto o formulário de agendamento está na tela, para não cobrir os campos e o botão de enviar
  const [sobreFormulario, setSobreFormulario] = useState(false);
  useEffect(() => {
    const form = document.getElementById("agendar");
    if (!form) return;
    const obs = new IntersectionObserver(([e]) => setSobreFormulario(e.isIntersecting));
    obs.observe(form);
    return () => obs.disconnect();
  }, []);
  useEffect(() => {
    const abre = setTimeout(() => setBalao(true), 9000);
    const fecha = setTimeout(() => setBalao(false), 17000);
    return () => {
      clearTimeout(abre);
      clearTimeout(fecha);
    };
  }, []);
  return (
    <aside
      aria-label="Atalho do WhatsApp"
      className={cn(
        "fixed bottom-5 right-5 z-30 flex items-center gap-3 transition-[opacity,transform] duration-300 sm:hidden",
        sobreFormulario && "pointer-events-none invisible translate-y-4 opacity-0",
      )}
    >
      {balao && (
        <span className="surge-rapido relative rounded-full bg-white px-4 py-2 text-[15px] font-medium text-black shadow-xl">
          Dúvidas? Fale com a gente
          <button type="button" onClick={() => { setBalao(false); linkRef.current?.focus(); }} className="foco-duplo -my-2 -mr-3 ml-0 inline-flex size-11 items-center justify-center align-middle text-chumbo">
            <X className="size-4" aria-hidden="true" /><span className="sr-only">Fechar aviso</span>
          </button>
        </span>
      )}
      <a
        ref={linkRef}
        href={linkWhatsApp()}
        target="_blank"
        rel="noopener noreferrer"
        className="foco-duplo pulso relative inline-flex size-14 items-center justify-center rounded-full bg-whatsapp text-black shadow-[0_10px_30px_rgb(0_0_0/0.5)] transition-transform hover:scale-110 active:scale-95"
      >
        <WhatsAppIcon className="size-7" />
        <span className="sr-only">Falar com a BR Team no WhatsApp (abre o WhatsApp)</span>
      </a>
    </aside>
  );
}

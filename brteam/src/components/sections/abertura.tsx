import { Check } from "lucide-react";
import { Faixa } from "@/components/faixa";
import { InstagramIcon, WhatsAppIcon } from "@/components/brand-icons";
import { academia, contato, experimental, fotos, instagram, professor } from "@/data/site";

export function Hero() {
  return (
    <section id="inicio" className="grao relative isolate flex min-h-[100svh] flex-col justify-end overflow-hidden bg-black">
      <img
        src={fotos.hero.src}
        alt={fotos.hero.alt}
        width={fotos.hero.w}
        height={fotos.hero.h}
        fetchPriority="high"
        data-parallax="0.3"
        className="absolute inset-0 -z-10 size-full object-cover object-[50%_30%]"
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black via-black/55 to-marinho/20" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black/60 via-transparent to-transparent" />

      <div className="pagina pt-28">
        <h1 className="font-display font-extrabold uppercase leading-[0.8] tracking-[-0.02em]">
          <span className="block text-[clamp(5.5rem,22vw,16rem)]">
            <span className="hero-palavra">BR</span>{" "}
            <span className="hero-palavra" style={{ animationDelay: "140ms" }}>Team</span>
          </span>{" "}
          <span style={{ animationDelay: "380ms" }} className="hero-entrada mt-3 block text-[clamp(1.1rem,3.4vw,2rem)] font-semibold tracking-[0.02em] text-white/90 md:mt-4">
            Brazilian Jiu-Jitsu em Casimiro de Abreu
          </span>
        </h1>
      </div>

      {/* faixa preta de 1º grau, a do professor, atravessando a tela */}
      <Faixa amarrar bandeira graus={1} altura={26} className="mt-7 w-full md:mt-9" />

      <div style={{ animationDelay: "600ms" }} className="pagina hero-entrada grid gap-8 pb-24 pt-8 md:grid-cols-[1.2fr_1fr] md:items-end md:pb-16">
        <p className="max-w-[34ch] text-lg leading-relaxed text-white/85 md:text-xl">
          {academia.lema} Desde {academia.desde}, crianças, jovens e adultos treinam com a gente
          corpo, mente e alma.{" "}
          <strong className="font-semibold text-white">A aula experimental é grátis: {experimental.resumo}.</strong>
        </p>
        <div className="flex flex-col gap-3 sm:flex-row md:justify-end">
          <a href="#agendar" className="botao botao-primario">
            Agendar aula grátis
          </a>
          <a href="#horarios" className="botao botao-contorno text-white">
            Horários e valores
          </a>
        </div>
      </div>
    </section>
  );
}

const valores = [
  { nome: "Disciplina", texto: "Pontualidade, constância e atenção no treino. O hábito criado no tatame vai junto para a escola e para o trabalho." },
  { nome: "Proteção", texto: "Saber se defender com técnica, sem depender de força, e saber evitar o conflito." },
  { nome: "Cuidado", texto: "Treino seguro, com o professor por perto e o colega tratado como parceiro de treino." },
  { nome: "Respeito", texto: "Pelo professor, pelos colegas e pelas diferenças. Todo treino começa e termina com o cumprimento." },
];

export function Academia() {
  return (
    <section id="academia" className="claro bg-gelo py-16 text-black md:py-32">
      <div className="pagina grid gap-14 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
        <div>
          <h2 className="titulo">Muito mais que uma academia de Jiu-Jitsu</h2>
          <p className="mt-7 max-w-[46ch] text-lg text-chumbo">
            Uma equipe especializada em Jiu-Jitsu, com uma proposta de Jiu-Jitsu para todos. Desde {academia.desde} a
            gente transforma vidas em Casimiro de Abreu, com turmas para crianças a partir de {academia.idadeMinima} anos,
            adolescentes e adultos.
          </p>
          <p className="mt-10 flex flex-wrap items-center gap-x-5 gap-y-2 font-display text-[clamp(2rem,5vw,3.2rem)] font-bold uppercase leading-none">
            {academia.pilares.map((p, i) => (
              <span key={p} className="flex items-center gap-5">
                {i > 0 && <span aria-hidden="true" className="h-[0.8em] w-px bg-ouro" />}
                {p}
              </span>
            ))}
          </p>
          <p className="mt-3 text-chumbo">Os três pilares que a gente treina.</p>
        </div>

        <ul className="border-t border-marinho/15">
          {valores.map((v) => (
            <li key={v.nome} className="grid gap-2 border-b border-marinho/15 py-7 sm:grid-cols-[180px_1fr] sm:gap-8">
              <h3 className="titulo-md">{v.nome}</h3>
              <p className="text-chumbo">{v.texto}</p>
            </li>
          ))}
        </ul>
      </div>

      <figure className="pagina mt-20 md:mt-24">
        <div className="overflow-hidden">
          <img
            src={fotos.espaco.src}
            alt={fotos.espaco.alt}
            width={fotos.espaco.w}
            height={fotos.espaco.h}
            loading="lazy"
            className="aspect-[904/236] w-full min-h-[180px] object-cover"
          />
        </div>
        <figcaption className="mt-4 flex flex-wrap items-center justify-between gap-4">
          <span className="text-chumbo">O nosso tatame, na Rua Pastor Luiz Laurentino, em Casimiro de Abreu.</span>
          <span className="flex flex-wrap gap-2">
            {academia.comodidades.map((c) => (
              <span key={c} className="inline-flex items-center gap-1.5 rounded-full border border-marinho/15 px-3 py-1.5 text-sm">
                <Check className="size-3.5 text-ouro-escuro" aria-hidden="true" /> {c}
              </span>
            ))}
          </span>
        </figcaption>
      </figure>
    </section>
  );
}

export function Professor() {
  return (
    <section id="professor" className="claro bg-white py-16 text-black md:py-32">
      <div className="pagina grid items-center gap-12 md:grid-cols-[0.85fr_1fr] lg:gap-20">
        <div className="relative">
          <div className="overflow-hidden bg-gelo">
            <img
              src={fotos.professor.src}
              alt={fotos.professor.alt}
              width={fotos.professor.w}
              height={fotos.professor.h}
              loading="lazy"
              className="mx-auto h-auto w-full max-w-[460px]"
            />
          </div>
          <img
            src={fotos.professorFilha.src}
            alt={fotos.professorFilha.alt}
            width={fotos.professorFilha.w}
            height={fotos.professorFilha.h}
            loading="lazy"
            className="absolute -bottom-8 -right-3 w-[38%] border-4 border-white shadow-[0_18px_40px_-16px_rgb(13_35_72/0.5)] md:-right-8"
          />
        </div>

        <div>
          <p className="text-lg text-chumbo">Professor</p>
          <h2 className="titulo mt-1">Bruno Ramos</h2>
          <ul className="mt-8 space-y-4 text-lg">
            <li className="flex items-center gap-4">
              <Faixa bandeira graus={1} altura={14} clara className="w-20 shrink-0" />
              Faixa preta 1º grau de Jiu-Jitsu
            </li>
            <li className="flex items-center gap-4">
              <Check className="size-5 shrink-0 text-azul" aria-hidden="true" />
              Professor há {professor.anosComoProfessor} anos, com mais de {professor.anosNoJiuJitsu} anos dedicados ao Jiu-Jitsu
            </li>
            <li className="flex items-center gap-4">
              <Check className="size-5 shrink-0 text-azul" aria-hidden="true" />
              Formado em Educação Física
            </li>
            <li className="flex items-center gap-4">
              <Check className="size-5 shrink-0 text-azul" aria-hidden="true" />
              Pai da Marina, que também treina
            </li>
          </ul>
          <blockquote className="mt-10 border-l-2 border-ouro pl-6">
            <p className="font-display text-[clamp(1.5rem,3vw,2.1rem)] font-semibold leading-tight">
              “Nosso ambiente é muito mais que uma academia de Jiu-Jitsu: é um local de encorajamento e mudança de hábitos.”
            </p>
          </blockquote>
          <a
            href={instagram(contato.instagramProfessor)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex min-h-11 items-center gap-2 text-chumbo underline-offset-4 hover:text-black hover:underline"
          >
            <InstagramIcon className="size-5" /> @{contato.instagramProfessor}
          </a>
        </div>
      </div>
    </section>
  );
}

// Cada benefício leva a cor de uma faixa, no caminho que a criança percorre (amarela, laranja, verde, azul)
const beneficios: { faixa: string; titulo: string; texto: string }[] = [
  {
    faixa: "var(--color-faixa-amarela)",
    titulo: "Autoestima e confiança",
    texto: "Cada desafio vencido no treino e cada grau conquistado mostram para a criança do que ela é capaz. A timidez dá lugar à segurança.",
  },
  {
    faixa: "var(--color-faixa-laranja)",
    titulo: "Menos violência e bullying",
    texto: "A criança aprende a se defender e a controlar as emoções. Quem se sente seguro não precisa brigar, e sabe sair de um conflito.",
  },
  {
    faixa: "var(--color-faixa-verde)",
    titulo: "Amizade e trabalho em equipe",
    texto: "No tatame se compartilha, coopera e incentiva o colega. A turma vira um grupo de amigos que cresce junto.",
  },
  {
    faixa: "var(--color-faixa-azul)",
    titulo: "Corpo e mente em movimento",
    texto: "Coordenação, equilíbrio, força e resistência, junto com foco, disciplina e paciência para persistir nos objetivos.",
  },
];

export function Kids() {
  const [principal, segunda, terceira] = fotos.kids;
  return (
    <section id="kids" className="claro bg-gelo py-16 text-black md:py-32">
      <div className="pagina grid gap-14 lg:grid-cols-[1fr_0.9fr] lg:gap-20">
        <div>
          <h2 className="titulo">Jiu-Jitsu para crianças</h2>
          <p className="mt-6 max-w-[44ch] text-xl text-chumbo">
            Que tal cuidar da saúde do seu filho enquanto ele se diverte? O Jiu-Jitsu trabalha técnica e estratégia,
            não força bruta, e por isso é ideal para crianças e adolescentes. Aceitamos alunos a partir de {academia.idadeMinima} anos.
          </p>
          <div className="mt-12 grid gap-x-10 gap-y-9 sm:grid-cols-2">
            {beneficios.map((b) => (
              <div key={b.titulo}>
                <Faixa cor={b.faixa} ponteira="#111111" clara altura={14} className="mb-4 w-28" />
                <h3 className="font-display text-2xl font-bold uppercase leading-tight">{b.titulo}</h3>
                <p className="mt-2 text-chumbo">{b.texto}</p>
              </div>
            ))}
          </div>
          <a
            href="#agendar"
            onClick={() => window.dispatchEvent(new CustomEvent("agendar:para", { detail: "filho" }))}
            className="botao botao-primario mt-12"
          >
            Agendar aula para meu filho
          </a>
        </div>

        <div className="grid grid-cols-2 gap-3 self-start">
          <img
            src={principal.src} alt={principal.alt} width={principal.w} height={principal.h} loading="lazy"
            className="row-span-2 h-full w-full bg-white object-contain object-bottom"
          />
          <img src={segunda.src} alt={segunda.alt} width={segunda.w} height={segunda.h} loading="lazy" className="aspect-square w-full bg-white object-contain object-bottom p-2" />
          <img src={terceira.src} alt={terceira.alt} width={terceira.w} height={terceira.h} loading="lazy" className="aspect-square w-full bg-white object-contain object-bottom pt-3" />
        </div>
      </div>
    </section>
  );
}

// Os cinco pontos da série "Pronto para fazer de 2025 o seu ano de transformação?" do Instagram
const beneficiosAdultos: { faixa: string; ponteira?: string; titulo: string; texto: string }[] = [
  {
    faixa: "var(--color-faixa-azul)",
    titulo: "Disciplina e constância",
    texto: "No tatame você aprende que grandes resultados vêm do esforço contínuo. Essa mentalidade vai além do treino.",
  },
  {
    faixa: "var(--color-faixa-roxa)",
    titulo: "Resiliência",
    texto: "Cada posição difícil ensina a ter calma sob pressão e a não desistir. Uma lição para a vida.",
  },
  {
    faixa: "var(--color-faixa-marrom)",
    titulo: "Autoconfiança",
    texto: "Superando obstáculos no treino, você descobre a própria força e ganha confiança para enfrentar qualquer coisa.",
  },
  {
    faixa: "#141414",
    ponteira: "#d6202b",
    titulo: "Menos estresse, mente limpa",
    texto: "O Jiu-Jitsu funciona como terapia ativa: movimentos focados e aprendizado constante ajudam a esvaziar a cabeça.",
  },
];

export function Adultos() {
  const [principal, segunda, terceira] = fotos.adultos;
  return (
    <section id="adultos" className="claro bg-white py-16 text-black md:py-32">
      <div className="pagina grid gap-14 lg:grid-cols-[0.9fr_1fr] lg:gap-20">
        <div className="grid grid-cols-2 gap-3 self-start max-lg:order-last">
          <img
            src={principal.src} alt={principal.alt} width={principal.w} height={principal.h} loading="lazy"
            className="col-span-2 h-auto w-full"
          />
          <img src={segunda.src} alt={segunda.alt} width={segunda.w} height={segunda.h} loading="lazy" className="aspect-[4/3] w-full object-cover object-right" />
          <img src={terceira.src} alt={terceira.alt} width={terceira.w} height={terceira.h} loading="lazy" className="aspect-[4/3] w-full object-cover" />
        </div>

        <div>
          <h2 className="titulo">Jiu-Jitsu para adultos</h2>
          <p className="mt-6 max-w-[44ch] text-xl text-chumbo">
            Nunca treinou? Comece do zero, no seu ritmo. Já é graduado? Treine para evoluir e competir. Aqui você faz parte
            de uma família que apoia e celebra cada passo, do iniciante à faixa preta.
          </p>
          <div className="mt-12 grid gap-x-10 gap-y-9 sm:grid-cols-2">
            {beneficiosAdultos.map((b) => (
              <div key={b.titulo}>
                <Faixa cor={b.faixa} ponteira={b.ponteira ?? "#111111"} altura={14} clara className="mb-4 w-28" />
                <h3 className="font-display text-2xl font-bold uppercase leading-tight">{b.titulo}</h3>
                <p className="mt-2 text-chumbo">{b.texto}</p>
              </div>
            ))}
          </div>
          <a
            href="#agendar"
            onClick={() => window.dispatchEvent(new CustomEvent("agendar:para", { detail: "mim" }))}
            className="botao botao-primario mt-12"
          >
            Agendar minha aula experimental
          </a>
        </div>
      </div>
    </section>
  );
}

import { Check } from "lucide-react";
import { Faixa } from "@/components/faixa";
import { InstagramIcon, WhatsAppIcon } from "@/components/brand-icons";
import { academia, contato, fotos, instagram, linkWhatsApp } from "@/data/site";

export function Hero() {
  return (
    <section id="inicio" className="grao relative isolate flex min-h-[100svh] flex-col justify-end overflow-hidden bg-black">
      <img
        src={fotos.hero.src}
        alt={fotos.hero.alt}
        width={fotos.hero.w}
        height={fotos.hero.h}
        fetchPriority="high"
        className="absolute inset-0 -z-10 size-full object-cover object-[50%_30%]"
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black via-black/55 to-black/20" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black/60 via-transparent to-transparent" />

      <div className="pagina hero-entrada pt-28">
        <h1 className="font-display font-extrabold uppercase leading-[0.8] tracking-[-0.02em]">
          <span className="block text-[clamp(5.5rem,22vw,16rem)]">BR Team</span>
          <span className="mt-3 block text-[clamp(1.1rem,3.4vw,2rem)] font-semibold tracking-[0.02em] text-white/90 md:mt-4">
            Brazilian Jiu-Jitsu em Casimiro de Abreu
          </span>
        </h1>
      </div>

      {/* faixa preta de 1º grau, a do professor, atravessando a tela */}
      <Faixa amarrar graus={1} altura={26} className="mt-7 w-full md:mt-9" />

      <div className="pagina hero-entrada grid gap-8 pb-12 pt-8 md:grid-cols-[1.2fr_1fr] md:items-end md:pb-16">
        <p className="max-w-[34ch] text-lg leading-relaxed text-white/85 md:text-xl">
          {academia.lema} Desde {academia.desde}, crianças, jovens e adultos treinam com a gente
          corpo, mente e alma.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row md:justify-end">
          <a href="#agendar" className="botao botao-primario">
            Agendar aula experimental
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
    <section id="academia" className="bg-black py-24 md:py-32">
      <div className="pagina grid gap-14 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
        <div>
          <h2 className="titulo">Muito mais que uma academia de Jiu-Jitsu</h2>
          <p className="mt-7 max-w-[46ch] text-lg text-cinza">
            A BR Team é um lugar de encorajamento e mudança de hábitos. Desde {academia.desde} a gente transforma vidas
            pelo Jiu-Jitsu em Casimiro de Abreu, com turmas para crianças, adolescentes e adultos.
          </p>
          <p className="mt-10 flex flex-wrap items-center gap-x-5 gap-y-2 font-display text-[clamp(2rem,5vw,3.2rem)] font-bold uppercase leading-none">
            {academia.pilares.map((p, i) => (
              <span key={p} className="flex items-center gap-5">
                {i > 0 && <span aria-hidden="true" className="h-[0.8em] w-px bg-grafite" />}
                {p}
              </span>
            ))}
          </p>
          <p className="mt-3 text-cinza">Os três pilares que a gente treina.</p>
        </div>

        <ul className="border-t border-grafite">
          {valores.map((v) => (
            <li key={v.nome} className="grid gap-2 border-b border-grafite py-7 sm:grid-cols-[180px_1fr] sm:gap-8">
              <h3 className="titulo-md">{v.nome}</h3>
              <p className="text-cinza">{v.texto}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function Professor() {
  return (
    <section id="professor" className="bg-carbono py-24 md:py-32">
      <div className="pagina grid items-center gap-12 md:grid-cols-[0.85fr_1fr] lg:gap-20">
        <div className="relative">
          <div className="overflow-hidden bg-[#ecebe8]">
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
            className="absolute -bottom-8 -right-3 w-[38%] border-4 border-carbono shadow-2xl md:-right-8"
          />
        </div>

        <div>
          <p className="text-lg text-cinza">Professor</p>
          <h2 className="titulo mt-1">Bruno Ramos</h2>
          <ul className="mt-8 space-y-4 text-lg">
            <li className="flex items-center gap-4">
              <Faixa graus={1} altura={14} className="w-16 shrink-0" />
              Faixa preta 1º grau de Jiu-Jitsu
            </li>
            <li className="flex items-center gap-4">
              <Check className="size-5 shrink-0 text-ponteira" aria-hidden="true" />
              Profissional de Educação Física
            </li>
            <li className="flex items-center gap-4">
              <Check className="size-5 shrink-0 text-ponteira" aria-hidden="true" />
              Pai da Marina, que também treina
            </li>
          </ul>
          <blockquote className="mt-10 border-l-2 border-ponteira pl-6">
            <p className="font-display text-[clamp(1.5rem,3vw,2.1rem)] font-semibold leading-tight">
              “Nosso ambiente é muito mais que uma academia de Jiu-Jitsu: é um local de encorajamento e mudança de hábitos.”
            </p>
          </blockquote>
          <a
            href={instagram(contato.instagramProfessor)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex min-h-11 items-center gap-2 text-white/85 underline-offset-4 hover:text-white hover:underline"
          >
            <InstagramIcon className="size-5" /> @{contato.instagramProfessor}
          </a>
        </div>
      </div>
    </section>
  );
}

const beneficios = [
  {
    titulo: "Autoestima e confiança",
    texto: "Cada desafio vencido no treino e cada grau conquistado mostram para a criança do que ela é capaz. A timidez dá lugar à segurança.",
  },
  {
    titulo: "Menos violência e bullying",
    texto: "A criança aprende a se defender e a controlar as emoções. Quem se sente seguro não precisa brigar, e sabe sair de um conflito.",
  },
  {
    titulo: "Amizade e trabalho em equipe",
    texto: "No tatame se compartilha, coopera e incentiva o colega. A turma vira um grupo de amigos que cresce junto.",
  },
  {
    titulo: "Corpo e mente em movimento",
    texto: "Coordenação, equilíbrio, força e resistência, junto com foco, disciplina e paciência para persistir nos objetivos.",
  },
];

export function Kids() {
  const [principal, segunda, terceira] = fotos.kids;
  return (
    <section id="kids" className="claro bg-white py-24 text-black md:py-32">
      <div className="pagina grid gap-14 lg:grid-cols-[1fr_0.9fr] lg:gap-20">
        <div>
          <h2 className="titulo">Jiu-Jitsu para crianças</h2>
          <p className="mt-6 max-w-[44ch] text-xl text-chumbo">
            Que tal cuidar da saúde do seu filho enquanto ele se diverte? O Jiu-Jitsu trabalha técnica e estratégia,
            não força bruta, e por isso é ideal para crianças e adolescentes.
          </p>
          <div className="mt-12 grid gap-x-10 gap-y-9 sm:grid-cols-2">
            {beneficios.map((b) => (
              <div key={b.titulo}>
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
            className="row-span-2 h-full w-full bg-algodao object-cover object-top"
          />
          <img src={segunda.src} alt={segunda.alt} width={segunda.w} height={segunda.h} loading="lazy" className="aspect-square w-full bg-algodao object-cover" />
          <img src={terceira.src} alt={terceira.alt} width={terceira.w} height={terceira.h} loading="lazy" className="aspect-square w-full bg-algodao object-cover object-top" />
        </div>
      </div>
    </section>
  );
}

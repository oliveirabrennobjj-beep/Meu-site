import { useEffect, useRef, useState } from "react";
import {
  Award, Baby, ShoppingBag, CalendarCheck, CalendarClock, HelpCircle, Home, MapPin, Menu, MessageCircle, Shield, Sparkles, User, Users, Wallet, X, Images,
} from "lucide-react";
import { SidebarNav, type NavGroupData, type NavItemData } from "@/components/ui/dashboard-sidebar";
import { contato, instagram, linkWhatsApp, mapaRota } from "@/data/site";
import { InstagramIcon } from "@/components/brand-icons";
import { cn } from "@/lib/utils";

const links = [
  { id: "academia", label: "Academia" },
  { id: "professor", label: "Professor" },
  { id: "kids", label: "Kids" },
  { id: "adultos", label: "Adultos" },
  { id: "horarios", label: "Horários" },
  { id: "planos", label: "Planos" },
  { id: "faixas", label: "Troca de faixa" },
  { id: "loja", label: "Loja" },
  { id: "duvidas", label: "Dúvidas" },
  { id: "contato", label: "Contato" },
];

const grupos: NavGroupData[] = [
  {
    items: [
      { id: "inicio", title: "Início", icon: Home },
      { id: "academia", title: "A academia", icon: Shield },
      { id: "professor", title: "Professor Bruno Ramos", icon: User },
      { id: "kids", title: "Jiu-Jitsu para crianças", icon: Baby },
      { id: "adultos", title: "Jiu-Jitsu para adultos", icon: Users },
    ],
  },
  {
    heading: "Treinar",
    items: [
      { id: "agendar", title: "Agendar aula experimental", icon: CalendarCheck },
      { id: "horarios", title: "Horários", icon: CalendarClock },
      { id: "planos", title: "Mensalidade", icon: Wallet },
      {
        id: "faixas-grupo",
        title: "Troca de faixa",
        icon: Award,
        children: [
          { id: "faixas", title: "Faixas infantis", icon: Sparkles },
          { id: "faixas-adultas", title: "Faixas adultas", icon: Sparkles },
        ],
      },
      { id: "loja", title: "Loja de kimonos", icon: ShoppingBag },
      { id: "galeria", title: "Conquistas e fotos", icon: Images },
    ],
  },
  {
    heading: "Falar com a gente",
    items: [
      { id: "whatsapp", title: "WhatsApp", icon: MessageCircle, href: linkWhatsApp() },
      {
        id: "instagram",
        title: "Instagram",
        icon: InstagramIcon,
        children: [
          { id: "ig-academia", title: `@${contato.instagramAcademia}`, icon: InstagramIcon, href: instagram(contato.instagramAcademia) },
          { id: "ig-professor", title: `@${contato.instagramProfessor}`, icon: InstagramIcon, href: instagram(contato.instagramProfessor) },
        ],
      },
      { id: "duvidas", title: "Dúvidas frequentes", icon: HelpCircle },
      { id: "rota", title: "Como chegar", icon: MapPin, href: mapaRota },
    ],
  },
];
const rodape: NavItemData[] = [];

function Marca({ compacta = false }: { compacta?: boolean }) {
  return (
    <span className="inline-flex items-center gap-3">
      <img src="./logo-br-team.png" alt="" width={40} height={40} className="size-10 shrink-0 rounded-full" />
      {!compacta && (
        <span className="font-display text-[1.45rem] font-bold uppercase leading-none tracking-tight">BR Team</span>
      )}
    </span>
  );
}

export function Header() {
  const [rolou, setRolou] = useState(false);
  const [oculto, setOculto] = useState(false);
  const [aberto, setAberto] = useState(false);
  const [ativo, setAtivo] = useState("inicio");
  const botaoMenu = useRef<HTMLButtonElement>(null);
  const painel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // some ao descer a página e volta ao subir, para dar espaço ao conteúdo
    let ultimo = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setRolou(y > 24);
      if (Math.abs(y - ultimo) > 8) {
        setOculto(y > ultimo && y > 520);
        ultimo = y;
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // seção visível marca o item ativo do menu
  useEffect(() => {
    const ids = ["inicio", ...links.map((l) => l.id), "galeria", "agendar"];
    const obs = new IntersectionObserver(
      (entradas) => entradas.forEach((e) => e.isIntersecting && setAtivo(e.target.id)),
      { rootMargin: "-45% 0px -50% 0px" },
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, []);

  // menu aberto e a tela passa para o tamanho de computador (tablet girado): fecha, senão a página fica travada
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1280px)");
    const aoMudar = () => mq.matches && setAberto(false);
    mq.addEventListener("change", aoMudar);
    return () => mq.removeEventListener("change", aoMudar);
  }, []);

  useEffect(() => {
    if (!aberto) return;
    // trava a rolagem no html e no body (no iPhone, só o body não basta)
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    // depois do quadro: com "reduzir movimento" o painel ainda está invisível no mesmo instante
    requestAnimationFrame(() => painel.current?.querySelector<HTMLElement>("button, a")?.focus());
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") return fechar();
      if (e.key !== "Tab" || !painel.current?.offsetParent) return;
      // mantém o Tab dentro do menu (aria-modal)
      const focaveis = painel.current.querySelectorAll<HTMLElement>("button, a[href]");
      const primeiro = focaveis[0];
      const ultimo = focaveis[focaveis.length - 1];
      if (e.shiftKey && (document.activeElement === primeiro || !painel.current.contains(document.activeElement))) {
        e.preventDefault();
        ultimo?.focus();
      } else if (!e.shiftKey && document.activeElement === ultimo) {
        e.preventDefault();
        primeiro?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [aberto]);

  function fechar() {
    setAberto(false);
    botaoMenu.current?.focus();
  }

  function irPara(id: string) {
    const destino = id === "faixas-adultas" ? "faixas-adultas" : id;
    const el = document.getElementById(destino);
    if (el) {
      setAberto(false);
      setAtivo(id);
      el.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
      // leva o foco para a seção, para o próximo Tab continuar dali
      if (!el.hasAttribute("tabindex")) el.setAttribute("tabindex", "-1");
      el.focus({ preventScroll: true });
      history.replaceState(null, "", `#${destino}`);
    } else {
      // WhatsApp, Instagram e "Como chegar" abrem fora: o menu fecha para a pessoa voltar à página
      setAtivo(id);
      setAberto(false);
    }
  }

  return (
    <>
      <a href="#conteudo" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:bg-white focus:px-4 focus:py-2 focus:text-black">
        Pular para o conteúdo
      </a>
      <header
        onFocus={() => setOculto(false)}
        className={cn(
          "fixed inset-x-0 top-0 z-40 transition-[background-color,transform] duration-300 ease-[var(--ease-saida)]",
          oculto && !aberto && "-translate-y-full",
          rolou ? "border-b border-white/10 bg-black/90 backdrop-blur-md" : "bg-gradient-to-b from-black/70 to-transparent",
        )}
      >
        <div className="pagina flex h-[68px] items-center justify-between gap-4">
          <a href="#inicio" aria-label="BR Team, voltar ao início" className="shrink-0">
            <Marca />
          </a>
          <nav aria-label="Seções" className="hidden xl:block">
            <ul className="flex items-center gap-1">
              {links.map((l) => (
                <li key={l.id}>
                  <a
                    href={`#${l.id}`}
                    aria-current={ativo === l.id ? "location" : undefined}
                    className={cn(
                      "relative px-3 py-2 text-[15px] font-medium text-white/75 transition-colors hover:text-white",
                      ativo === l.id && "text-white after:absolute after:inset-x-3 after:-bottom-0.5 after:h-0.5 after:bg-ouro",
                    )}
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div className="flex items-center gap-2">
            <a href="#agendar" className="botao botao-primario hidden !min-h-11 !px-5 !text-base sm:inline-flex">
              Agendar aula
            </a>
            <button
              ref={botaoMenu}
              type="button"
              onClick={() => setAberto(true)}
              aria-expanded={aberto}
              aria-controls="menu-lateral"
              className="inline-flex size-11 items-center justify-center rounded-sm text-white hover:bg-white/10 xl:hidden"
            >
              <Menu className="size-6" aria-hidden="true" />
              <span className="sr-only">Abrir menu</span>
            </button>
          </div>
        </div>
      </header>

      {/* Menu lateral: o componente SidebarNav (components/ui/dashboard-sidebar) com o menu da academia */}
      <div className={cn("fixed inset-0 z-50 xl:hidden", aberto ? "visible" : "invisible")} aria-hidden={!aberto}>
        <div
          className={cn("absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300", aberto ? "opacity-100" : "opacity-0")}
          onClick={fechar}
        />
        <div
          id="menu-lateral"
          ref={painel}
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          className={cn(
            "absolute inset-y-0 left-0 flex w-[300px] max-w-[86vw] flex-col bg-card shadow-2xl transition-transform duration-300 ease-[var(--ease-saida)]",
            aberto ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <SidebarNav
            className="!h-auto !w-full min-h-0 flex-1 border-none bg-transparent"
            groups={grupos}
            bottomItems={rodape}
            activeId={ativo}
            onSelect={irPara}
            header={
              <div className="mb-2 flex items-center justify-between px-2 py-2">
                <div className="flex items-center gap-3">
                  <img src="./logo-br-team.png" alt="" width={36} height={36} className="size-9 rounded-full" />
                  <div className="flex flex-col">
                    <span className="font-display text-lg font-bold uppercase leading-none">BR Team</span>
                    <span className="mt-1 text-xs text-muted-foreground">Brazilian Jiu-Jitsu</span>
                  </div>
                </div>
                <button type="button" onClick={fechar} className="inline-flex size-11 items-center justify-center rounded-md text-muted-foreground hover:bg-white/5 hover:text-foreground">
                  <X className="size-5" aria-hidden="true" />
                  <span className="sr-only">Fechar menu</span>
                </button>
              </div>
            }
          />
          <div className="shrink-0 border-t border-border/50 p-3">
            <a
              href="#agendar"
              onClick={(e) => {
                e.preventDefault();
                irPara("agendar");
              }}
              className="botao botao-primario w-full"
            >
              <CalendarCheck className="size-5" aria-hidden="true" /> Agendar aula
            </a>
          </div>
        </div>
      </div>
    </>
  );
}

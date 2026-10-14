import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Logo } from "@/components/brand-icons";
import { Button } from "@/components/ui/button";
import { linkWhatsApp, mensagens } from "@/data/site";

const links = [
  { href: "#trabalhos", label: "Trabalhos" },
  { href: "#sites", label: "Sites" },
  { href: "#nfc", label: "Placas NFC" },
  { href: "#precos", label: "Preços" },
  { href: "#duvidas", label: "Dúvidas" },
];

export function Header() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="theme-light sticky top-[env(safe-area-inset-top,0px)] z-40 border-b border-line !bg-white/95 backdrop-blur-xl backdrop-saturate-150">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <a href="#inicio" aria-label="BN Digital, voltar ao início" className="rounded-full">
          <Logo />
        </a>

        <nav aria-label="Principal" className="hidden md:block">
          <ul className="flex items-center gap-7">
            {links.map((l) => (
              <li key={l.href}>
                <a href={l.href} className="text-[14px] text-soft transition-colors hover:text-fg">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <Button asChild size="sm" className="hidden sm:inline-flex">
            <a href={linkWhatsApp(mensagens.geral)} target="_blank" rel="noopener noreferrer">
              Pedir orçamento
            </a>
          </Button>
          <button
            type="button"
            className="grid size-11 cursor-pointer place-items-center rounded-full text-fg md:hidden"
            aria-label={open ? "Fechar menu" : "Abrir menu"}
            aria-expanded={open}
            aria-controls="menu-mobile"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </div>
      </div>

      {open && (
        <div id="menu-mobile" className="theme-light fixed inset-x-0 top-16 z-40 h-[calc(100dvh-4rem)] md:hidden">
          <nav aria-label="Menu" className="container-page pt-4">
            <ul>
              {links.map((l) => (
                <li key={l.href} className="border-b border-line">
                  <a href={l.href} onClick={() => setOpen(false)} className="display block py-4 text-[30px] text-fg">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
            <Button asChild size="lg" className="mt-8 w-full">
              <a href={linkWhatsApp(mensagens.geral)} target="_blank" rel="noopener noreferrer">
                Pedir orçamento no WhatsApp
              </a>
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
}
